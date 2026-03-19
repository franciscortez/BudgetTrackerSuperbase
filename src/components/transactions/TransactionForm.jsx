import React, { useState, useEffect } from "react";
import Icon from "../Icon";
import { useBankCards } from "../../hooks/useBankCards";
import { useEWallets } from "../../hooks/useEWallets";
import { useCategories } from "../../hooks/useCategories";
import { motion as Motion, AnimatePresence } from "motion/react";

export default function TransactionForm({ isOpen, onClose, onSubmit }) {
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
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: "expense",
        amount: "",
        category_id: "",
        payment_method: "cash",
        card_id: "",
        wallet_id: "",
        description: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [isOpen]);

  // Handle type-based constraints
  useEffect(() => {
    if (formData.type === "withdrawal" && formData.payment_method === "cash") {
      setFormData(prev => ({ ...prev, payment_method: "card" }));
    }
  }, [formData.type]);

  const filteredCategories = categories.filter(
    (c) =>
      c.type === (formData.type === "withdrawal" ? "expense" : formData.type),
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
      };
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm"
          />
          <Motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-dark-card w-full max-w-md rounded-[2.5rem] border border-pink-100 dark:border-dark-border overflow-hidden relative z-10"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                  New Transaction
                </h2>
                <Motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-pink-50 dark:hover:bg-dark-bg rounded-full text-gray-400 dark:text-dark-muted transition-colors"
                >
                  <Icon name="x" color="currentColor" className="w-6 h-6" />
                </Motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Toggle */}
                <div className="flex p-1 bg-pink-50 dark:bg-dark-bg rounded-2xl relative">
                  {["income", "expense", "withdrawal"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`relative z-10 flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                        formData.type === t
                          ? "text-white"
                          : "text-gray-400 dark:text-white/50 hover:text-pink-400"
                      }`}
                    >
                      {t}
                      {formData.type === t && (
                        <Motion.div 
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gray-900 dark:bg-pink-500 rounded-xl -z-10"
                          transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div className="text-center">
                  <label className="block text-xs font-black text-gray-400 dark:text-white uppercase tracking-widest mb-3 ml-1 text-left">
                    How much?
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-pink-300 dark:text-pink-900/50">
                      ₱
                    </span>
                    <Motion.input
                      whileFocus={{ scale: 1.02 }}
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full pl-12 pr-6 py-4 bg-pink-50/50 dark:bg-dark-bg border-2 border-pink-100 dark:border-dark-border rounded-2xl focus:border-pink-500 outline-none transition-all text-2xl font-black text-gray-800 dark:text-white placeholder:text-pink-300 dark:placeholder:text-white"
                    />
                  </div>
                </div>

                {/* Account & Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 dark:text-white uppercase tracking-widest ml-1">
                      Payment Method
                    </label>
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
                      className="w-full px-4 py-3 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-sm"
                    >
                      {formData.type !== "withdrawal" && <option value="cash">Cash</option>}
                      <option value="card">Bank Card</option>
                      <option value="ewallet">E-Wallet</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest ml-1">
                      Select Account
                    </label>
                    {formData.payment_method === "card" ? (
                      <select
                        required
                        value={formData.card_id}
                        onChange={(e) =>
                          setFormData({ ...formData, card_id: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-sm"
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
                        className="w-full px-4 py-3 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-sm"
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
                      <div
                        className={`px-4 py-3 border rounded-xl text-sm font-bold ${
                          wallets.some((w) => w.wallet_type === "cash")
                            ? "bg-pink-50/50 dark:bg-dark-bg text-gray-700 dark:text-white border-pink-100 dark:border-dark-border"
                          : "bg-gray-100 dark:bg-dark-bg/50 text-gray-400 dark:text-white/50 border-gray-200 dark:border-dark-border"
                        }`}
                      >
                        {wallets.some((w) => w.wallet_type === "cash")
                          ? "Cash on Hand Account"
                          : "Not tracked in accounts"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest ml-1">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-sm"
                    >
                      <option value="">Choose Box...</option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest ml-1">
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
                      className="w-full px-4 py-3 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest ml-1">
                    Note (Optional)
                  </label>
                  <Motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    placeholder="What was this for?"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-pink-50/50 dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-bold text-gray-700 dark:text-white placeholder:text-pink-200 dark:placeholder:text-white/30"
                  />
                </div>

                <Motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-3xl font-black text-xl transition-all disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Save Transaction"}
                </Motion.button>
              </form>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
