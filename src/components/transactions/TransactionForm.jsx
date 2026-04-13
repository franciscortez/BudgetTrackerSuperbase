import React, { useState, useEffect, useMemo, memo } from "react";
import Icon from "../Icon";
import { useBankCards } from "../../hooks/useBankCards";
import { useEWallets } from "../../hooks/useEWallets";
import { useCategories } from "../../hooks/useCategories";
import { useTheme } from "../../contexts/ThemeContext";
import { getConfirm } from "../../utils/confirm";
import { AnimatePresence } from "motion/react";

function TransactionForm({ isOpen, onClose, onSubmit, transaction = null }) {
  const { theme } = useTheme();
  const { cards } = useBankCards();
  const { wallets } = useEWallets();
  const { categories } = useCategories();

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category_id: "",
    payment_method: "cash",
    card_id: "",
    wallet_id: "",
    to_payment_method: "card",
    to_card_id: "",
    to_wallet_id: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setFormData({
          type: transaction.type || "expense",
          amount: transaction.amount || "",
          category_id: transaction.category_id || "",
          payment_method: transaction.payment_method || "cash",
          card_id: transaction.card_id || "",
          wallet_id: transaction.wallet_id || "",
          to_payment_method: transaction.to_card_id ? "card" : transaction.to_wallet_id ? "ewallet" : "card",
          to_card_id: transaction.to_card_id || "",
          to_wallet_id: transaction.to_wallet_id || "",
          description: transaction.description || "",
          transaction_date: transaction.transaction_date || new Date().toISOString().split("T")[0],
        });
      } else {
        setFormData({
          type: "expense",
          amount: "",
          category_id: "",
          payment_method: "cash",
          card_id: "",
          wallet_id: "",
          to_payment_method: "card",
          to_card_id: "",
          to_wallet_id: "",
          description: "",
          transaction_date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [isOpen, transaction]);

  useEffect(() => {
    if (formData.type === "withdrawal" && formData.payment_method === "cash") {
      setFormData(prev => ({ ...prev, payment_method: "card", card_id: "", wallet_id: "" }));
    }
  }, [formData.type]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === (formData.type === "income" ? "income" : "expense")),
    [categories, formData.type]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cashWallet = wallets.find((w) => w.wallet_type === "cash");
      const data = {
        ...formData,
        amount: Number(formData.amount),
        card_id: formData.payment_method === "card" ? formData.card_id : null,
        wallet_id:
          formData.payment_method === "ewallet"
            ? formData.wallet_id
            : formData.payment_method === "cash" && cashWallet
              ? cashWallet.id
              : null,
        to_card_id: formData.type === "transfer" && formData.to_payment_method === "card" ? formData.to_card_id : null,
        to_wallet_id: formData.type === "transfer"
          ? (formData.to_payment_method === "ewallet"
            ? formData.to_wallet_id
            : formData.to_payment_method === "cash" && cashWallet
              ? cashWallet.id
              : null)
          : null,
      };

      delete data.to_payment_method;

      await onSubmit(data);
      onClose();
    } catch (error) {
      getConfirm(theme).fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/40 animate-fade-in"
          />
          <div className="bg-white dark:bg-dark-card w-full md:max-w-lg rounded-[2rem] md:rounded-[2.5rem] border border-pink-100 dark:border-dark-border overflow-hidden relative z-10 flex flex-col max-h-[95vh] md:max-h-[90vh] animate-scale-in">
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                  {transaction ? "Edit Transaction" : "New Transaction"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-pink-50 dark:hover:bg-dark-bg rounded-full text-gray-400 dark:text-dark-muted transition-all hover:rotate-90 active:scale-90"
                >
                  <Icon name="x" color="currentColor" className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {["income", "expense"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t })}
                        className={`relative flex-1 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                          formData.type === t
                            ? "bg-gray-900 dark:bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                            : "bg-pink-50 dark:bg-dark-bg text-gray-400 dark:text-white/50 hover:text-pink-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {["withdrawal", "transfer"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t })}
                        className={`relative flex-1 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                          formData.type === t
                            ? "bg-gray-900 dark:bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                            : "bg-pink-50 dark:bg-dark-bg text-gray-400 dark:text-white/50 hover:text-pink-400"
                        }`}
                      >
                        {t === "transfer" ? "Transfer/Deposit" : t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="relative">
                    <span className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-black text-pink-300">
                      ₱
                    </span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-3 md:py-4 bg-pink-50/50 dark:bg-dark-bg border-2 border-pink-100 dark:border-dark-border focus:border-pink-500 rounded-xl md:rounded-2xl focus:border-opacity-100 outline-none transition-all text-xl md:text-2xl font-black placeholder:opacity-50 text-gray-800 dark:text-white placeholder:text-pink-300"
                    />
                  </div>
                </div>

                <div className="bg-pink-50/30 dark:bg-dark-bg/30 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-pink-50 dark:border-dark-border space-y-4">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-white uppercase tracking-widest ml-1">
                    {formData.type === 'transfer' ? 'From Account' : 'Payment Method'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <select
                      value={formData.payment_method}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payment_method: e.target.value,
                          card_id: "",
                          wallet_id: "",
                        })
                      }
                      className="w-full px-4 py-2.5 md:py-3 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs"
                    >
                      {formData.type !== "withdrawal" && <option value="cash">Cash</option>}
                      <option value="card">Bank Card</option>
                      <option value="ewallet">E-Wallet</option>
                    </select>

                    {formData.payment_method === "card" ? (
                      <select
                        required
                        value={formData.card_id}
                        onChange={(e) =>
                          setFormData({ ...formData, card_id: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 md:py-3 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs ${formData.type === 'income' ? 'focus:ring-emerald-500/20 focus:border-emerald-500' :
                          formData.type === 'expense' ? 'focus:ring-rose-500/20 focus:border-rose-500' :
                            formData.type === 'withdrawal' ? 'focus:ring-orange-500/20 focus:border-orange-500' :
                              'focus:ring-pink-500/20 focus:border-pink-500'
                          }`}
                      >
                        <option value="">Select Card</option>
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.card_name}
                          </option>
                        ))}
                      </select>
                    ) : formData.payment_method === "ewallet" ? (
                      <select
                        required
                        value={formData.wallet_id}
                        onChange={(e) =>
                          setFormData({ ...formData, wallet_id: e.target.value })
                        }
                        className="w-full px-4 py-2.5 md:py-3 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs"
                      >
                        <option value="">Select Wallet</option>
                        {wallets
                          .filter((w) => w.wallet_type !== "cash")
                          .map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.wallet_name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl text-[9px] md:text-[10px] font-bold text-gray-400 flex items-center">
                        Cash on Hand
                      </div>
                    )}
                  </div>
                </div>

                {formData.type === 'transfer' && (
                  <div className="bg-pink-50/30 dark:bg-dark-bg/30 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-pink-50 dark:border-dark-border space-y-4 animate-slide-down">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-white uppercase tracking-widest ml-1 text-left">
                      To Account
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <select
                        value={formData.to_payment_method}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            to_payment_method: e.target.value,
                            to_card_id: "",
                            to_wallet_id: "",
                          })
                        }
                        className="w-full px-4 py-2.5 md:py-3 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs"
                      >
                        <option value="card">Bank Card</option>
                        <option value="ewallet">E-Wallet</option>
                      </select>

                      {formData.to_payment_method === "card" ? (
                        <select
                          required
                          value={formData.to_card_id}
                          onChange={(e) =>
                            setFormData({ ...formData, to_card_id: e.target.value })
                          }
                          className="w-full px-4 py-2.5 md:py-3 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs"
                        >
                          <option value="">Select Card</option>
                          {cards
                            .filter(c => c.id !== formData.card_id)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.card_name}
                              </option>
                            ))}
                        </select>
                      ) : formData.to_payment_method === "ewallet" ? (
                        <select
                          required
                          value={formData.to_wallet_id}
                          onChange={(e) =>
                            setFormData({ ...formData, to_wallet_id: e.target.value })
                          }
                          className="w-full px-4 py-2.5 md:py-3 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs"
                        >
                          <option value="">Select Wallet</option>
                          {wallets
                            .filter(w => w.id !== formData.wallet_id && w.wallet_type !== 'cash')
                            .map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.wallet_name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <div className="px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl text-[9px] md:text-[10px] font-bold text-gray-400 flex items-center">
                          Cash on Hand
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-[9px] md:text-[10px] font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest ml-1 overflow-hidden truncate">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: e.target.value })
                      }
                      className="w-full px-4 py-2.5 md:py-3 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs"
                    >
                      <option value="">Choose Box...</option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-[9px] md:text-[10px] font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest ml-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.transaction_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transaction_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 md:py-3 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-[11px] md:text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Short note..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-5 py-3.5 md:py-4 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white placeholder:text-pink-200 dark:placeholder:text-white/30 text-sm md:text-base"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 md:py-5 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl transition-all disabled:opacity-50 bg-gradient-to-r from-pink-500 to-pink-600 shadow-xl shadow-pink-500/20 hover:shadow-2xl hover:shadow-pink-500/30 active:scale-98"
                >
                  {loading ? (transaction ? "Updating..." : "Recording...") : (transaction ? "Update Transaction" : "Save Transaction")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default memo(TransactionForm);
