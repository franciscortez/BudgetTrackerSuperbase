import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const TX_SELECT = `
  *,
  category:categories(name, icon, color),
  card:bank_cards(card_name, color),
  wallet:e_wallets(wallet_name, color)
`

// Helper: atomically update a bank card or wallet balance by a delta
const applyBalanceDelta = async (cardId, walletId, delta) => {
  if (cardId) {
    await supabase.rpc('update_card_balance', { p_id: cardId, p_delta: delta })
  } else if (walletId) {
    await supabase.rpc('update_wallet_balance', { p_id: walletId, p_delta: delta })
  }
}

export const useTransactions = (limit = 10) => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async (background = false) => {
    try {
      if (!background) setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select(TX_SELECT)
        .eq('user_id', user?.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      if (!background) setLoading(false)
    }
  }, [user?.id, limit])

  useEffect(() => {
    if (user) {
      fetchTransactions()

      const subscription = supabase
        .channel('transactions_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
          () => fetchTransactions(true)
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [user, fetchTransactions])

  const addTransaction = async (transactionData) => {
    const tempId = 'temp-' + Date.now()
    const optimisticTx = {
      ...transactionData,
      id: tempId,
      user_id: user?.id,
      category: {},
      card: {},
      wallet: {}
    }
    setTransactions(prev => [optimisticTx, ...prev].slice(0, limit))

    try {
      // 1. Insert the transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert([{ ...transactionData, user_id: user?.id }])
        .select()
        .single()

      if (txError) throw txError

      // 2. Fetch the full joined record to avoid flicker (no blank category/card)
      const { data: joinedTx } = await supabase
        .from('transactions')
        .select(TX_SELECT)
        .eq('id', transaction.id)
        .single()

      setTransactions(prev =>
        prev.map(t => t.id === tempId ? (joinedTx || transaction) : t)
      )

      // 3. Atomically update the account balance
      const amount = Number(transaction.amount)
      const delta = transaction.type === 'income' ? amount : -amount
      await applyBalanceDelta(transaction.card_id, transaction.wallet_id, delta)

      return { data: transaction, error: null }
    } catch (err) {
      console.error('Error adding transaction:', err)
      fetchTransactions(true) // revert optimistic
      return { data: null, error: err.message }
    }
  }

  const deleteTransaction = async (transaction) => {
    try {
      // Optimistic removal
      setTransactions(prev => prev.filter(t => t.id !== transaction.id))

      // 1. Delete the transaction record
      const { error: delError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)

      if (delError) throw delError

      // 2. Atomically revert the account balance
      const amount = Number(transaction.amount)
      const revertDelta = transaction.type === 'income' ? -amount : amount
      await applyBalanceDelta(transaction.card_id, transaction.wallet_id, revertDelta)

      return { error: null }
    } catch (err) {
      console.error('Error deleting transaction:', err)
      fetchTransactions(true) // revert optimistic
      return { error: err.message }
    }
  }

  const updateTransaction = async (id, updates, oldTransaction) => {
    try {
      const newData = { ...oldTransaction, ...updates }

      // 1. Update the DB record
      const { data: updatedTx, error: updateError } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // 2. Optimistically update local state with joined data
      const { data: joinedTx } = await supabase
        .from('transactions')
        .select(TX_SELECT)
        .eq('id', id)
        .single()

      setTransactions(prev =>
        prev.map(t => t.id === id ? (joinedTx || updatedTx) : t)
      )

      // 3. Calculate and apply balance delta atomically
      const oldAmount = Number(oldTransaction.amount)
      const newAmount = Number(newData.amount)
      const oldDelta = oldTransaction.type === 'income' ? oldAmount : -oldAmount
      const newDelta = newData.type === 'income' ? newAmount : -newAmount

      const sameCard = oldTransaction.card_id === newData.card_id
      const sameWallet = oldTransaction.wallet_id === newData.wallet_id

      if (sameCard && sameWallet) {
        // Same account — apply net difference
        const netDelta = newDelta - oldDelta
        if (netDelta !== 0) {
          await applyBalanceDelta(newData.card_id, newData.wallet_id, netDelta)
        }
      } else {
        // Account changed — revert old and apply new separately
        await applyBalanceDelta(oldTransaction.card_id, oldTransaction.wallet_id, -oldDelta)
        await applyBalanceDelta(newData.card_id, newData.wallet_id, newDelta)
      }

      return { data: updatedTx, error: null }
    } catch (err) {
      console.error('Error updating transaction:', err)
      fetchTransactions(true)
      return { data: null, error: err.message }
    }
  }

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions
  }
}
