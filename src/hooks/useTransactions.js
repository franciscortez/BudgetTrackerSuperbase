import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const TX_SELECT = `
  id, type, payment_method, amount, description, transaction_date, card_id, wallet_id, category_id,
  to_card_id, to_wallet_id,
  category:categories(name, icon, color),
  card:bank_cards!transactions_card_id_fkey(card_name, color),
  wallet:e_wallets!transactions_wallet_id_fkey(wallet_name, color),
  to_card:bank_cards!transactions_to_card_id_fkey(card_name, color),
  to_wallet:e_wallets!transactions_to_wallet_id_fkey(wallet_name, color)
`;

// Helper: atomically update a bank card or wallet balance by a delta
const applyBalanceDelta = async (cardId, walletId, delta) => {
  if (cardId) {
    const { error } = await supabase.rpc("update_card_balance", { p_id: cardId, p_delta: delta });
    if (error) throw error;
  } else if (walletId) {
    const { error } = await supabase.rpc("update_wallet_balance", { p_id: walletId, p_delta: delta });
    if (error) throw error;
  }
};

const getCashWalletId = async (userId) => {
  const { data, error } = await supabase
    .from("e_wallets")
    .select("id")
    .eq("user_id", userId)
    .eq("wallet_type", "cash")
    .single();

  if (error) return null;
  return data.id;
};

const getAccountBalance = async (cardId, walletId) => {
  if (cardId) {
    const { data } = await supabase.from("bank_cards").select("balance").eq("id", cardId).single();
    return data?.balance || 0;
  }
  if (walletId) {
    const { data } = await supabase.from("e_wallets").select("balance").eq("id", walletId).single();
    return data?.balance || 0;
  }
  return 0;
};

export const useTransactions = ({ page = 1, pageSize = 10, search = '', type = 'all' } = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ["transactions", user?.id, page, pageSize, search, type],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // First query: Get exact count without joins to avoid PostgREST parsing errors
      let countQuery = supabase
        .from("transactions")
        .select('*', { count: 'exact', head: true })
        .eq("user_id", user?.id);

      if (type !== 'all') countQuery = countQuery.eq('type', type);
      if (search) countQuery = countQuery.ilike('description', `%${search}%`);

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Second query: Fetch paginated data with explicit joins
      let dataQuery = supabase
        .from("transactions")
        .select(TX_SELECT)
        .eq("user_id", user?.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (type !== 'all') dataQuery = dataQuery.eq('type', type);
      if (search) dataQuery = dataQuery.ilike('description', `%${search}%`);

      const { data, error: dataError } = await dataQuery;
      if (dataError) throw dataError;

      return {
        data: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    enabled: !!user,
  });

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["recent_transactions", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["monthly_stats", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["bank_cards", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["e_wallets", user?.id] });
  }, [queryClient, user?.id]);

  const addMutation = useMutation({
    mutationFn: async (transactionData) => {
      const amount = Number(transactionData.amount);
      const isDeduction = transactionData.type === "expense" || transactionData.type === "withdrawal" || transactionData.type === "transfer";

      // Validate balance for deductions
      if (isDeduction) {
        const currentBalance = await getAccountBalance(transactionData.card_id, transactionData.wallet_id);
        if (amount > currentBalance) {
          throw new Error("Insufficient balance");
        }
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transactionData, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      const updateAmount = Number(data.amount);

      if (data.type === "transfer") {
        // Transfer logic: Deduct from source, add to destination
        await applyBalanceDelta(data.card_id, data.wallet_id, -updateAmount);
        await applyBalanceDelta(data.to_card_id, data.to_wallet_id, updateAmount);
      } else {
        const delta = data.type === "income" ? updateAmount : -updateAmount;
        await applyBalanceDelta(data.card_id, data.wallet_id, delta);

        // Special handling for withdrawal: Add to cash
        if (data.type === "withdrawal") {
          const cashWalletId = await getCashWalletId(user.id);
          if (cashWalletId) {
            await applyBalanceDelta(null, cashWalletId, amount);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (transaction) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction.id);

      if (error) throw error;

      // Revert account balance
      const amount = Number(transaction.amount);

      if (transaction.type === "transfer") {
        // Revert transfer: Add back to source, deduct from destination
        await applyBalanceDelta(transaction.card_id, transaction.wallet_id, amount);
        await applyBalanceDelta(transaction.to_card_id, transaction.to_wallet_id, -amount);
      } else {
        const revertDelta = transaction.type === "income" ? -amount : amount;
        await applyBalanceDelta(transaction.card_id, transaction.wallet_id, revertDelta);

        // Revert cash side for withdrawal
        if (transaction.type === "withdrawal") {
          const cashWalletId = await getCashWalletId(user.id);
          if (cashWalletId) {
            await applyBalanceDelta(null, cashWalletId, -amount);
          }
        }
      }
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates, oldTransaction }) => {
      // For simplicity, we'll revert the old transaction balance and apply the new one
      // This is safer than calculating net deltas across multiple tables/types

      // 1. Revert Old Transaction
      const oldAmount = Number(oldTransaction.amount);
      if (oldTransaction.type === "transfer") {
        await applyBalanceDelta(oldTransaction.card_id, oldTransaction.wallet_id, oldAmount);
        await applyBalanceDelta(oldTransaction.to_card_id, oldTransaction.to_wallet_id, -oldAmount);
      } else {
        const revertDelta = oldTransaction.type === "income" ? -oldAmount : oldAmount;
        await applyBalanceDelta(oldTransaction.card_id, oldTransaction.wallet_id, revertDelta);
        if (oldTransaction.type === "withdrawal") {
          const cashId = await getCashWalletId(user.id);
          if (cashId) await applyBalanceDelta(null, cashId, -oldAmount);
        }
      }

      // 2. Perform Update
      const { data: updatedTx, error: updateError } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        // Re-apply old balances if update fails (Best effort recovery)
        if (oldTransaction.type === "transfer") {
          await applyBalanceDelta(oldTransaction.card_id, oldTransaction.wallet_id, -oldAmount);
          await applyBalanceDelta(oldTransaction.to_card_id, oldTransaction.to_wallet_id, oldAmount);
        } else {
          const delta = oldTransaction.type === "income" ? oldAmount : -oldAmount;
          await applyBalanceDelta(oldTransaction.card_id, oldTransaction.wallet_id, delta);
          if (oldTransaction.type === "withdrawal") {
            const cashId = await getCashWalletId(user.id);
            if (cashId) await applyBalanceDelta(null, cashId, oldAmount);
          }
        }
        throw updateError;
      }

      // 3. Apply New Balances
      const newAmount = Number(updatedTx.amount);
      if (updatedTx.type === "transfer") {
        await applyBalanceDelta(updatedTx.card_id, updatedTx.wallet_id, -newAmount);
        await applyBalanceDelta(updatedTx.to_card_id, updatedTx.to_wallet_id, newAmount);
      } else {
        const newDelta = updatedTx.type === "income" ? newAmount : -newAmount;
        await applyBalanceDelta(updatedTx.card_id, updatedTx.wallet_id, newDelta);
        if (updatedTx.type === "withdrawal") {
          const cashId = await getCashWalletId(user.id);
          if (cashId) await applyBalanceDelta(null, cashId, newAmount);
        }
      }

      return updatedTx;
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  useEffect(() => {
    if (user) {
      const subscription = supabase
        .channel("transactions_changes")
        .on("postgres_changes",
          { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
          () => invalidateAll()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, queryClient, invalidateAll]);

  const queryResult = transactionsQuery.data || { data: [], totalCount: 0, totalPages: 0 };

  return {
    transactions: queryResult.data,
    totalCount: queryResult.totalCount,
    totalPages: queryResult.totalPages,
    loading: transactionsQuery.isLoading || addMutation.isPending || deleteMutation.isPending || updateMutation.isPending,
    error: transactionsQuery.error || addMutation.error || deleteMutation.error || updateMutation.error,
    addTransaction: addMutation.mutateAsync,
    updateTransaction: (id, updates, oldTransaction) => updateMutation.mutateAsync({ id, updates, oldTransaction }),
    deleteTransaction: deleteMutation.mutateAsync,
    refreshTransactions: () => queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] }),
  };
};
