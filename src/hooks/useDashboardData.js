import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useDashboardData = (txLimit = 5) => {
  const { user } = useAuth()
  const [data, setData] = useState({
    cards: [],
    wallets: [],
    transactions: [],
    loading: true,
    error: null
  })

  const fetchAll = useCallback(async (background = false) => {
    if (!user) return
    
    try {
      if (!background) setData(prev => ({ ...prev, loading: true }))
      
      const [cardsRes, walletsRes, txRes] = await Promise.all([
        supabase
          .from('bank_cards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('e_wallets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('transactions')
          .select(`
            *,
            category:categories(name, icon, color),
            card:bank_cards(card_name, color),
            wallet:e_wallets(wallet_name, color)
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(txLimit)
      ])

      if (cardsRes.error) throw cardsRes.error
      if (walletsRes.error) throw walletsRes.error
      if (txRes.error) throw txRes.error

      setData({
        cards: cardsRes.data || [],
        wallets: walletsRes.data || [],
        transactions: txRes.data || [],
        loading: false,
        error: null
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setData(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }, [user, txLimit])

  useEffect(() => {
    if (user) {
      fetchAll()

      // Set up individual subscriptions for updates
      const channels = [
        supabase.channel('dashboard_cards').on('postgres_changes', { event: '*', schema: 'public', table: 'bank_cards', filter: `user_id=eq.${user.id}` }, () => fetchAll(true)),
        supabase.channel('dashboard_wallets').on('postgres_changes', { event: '*', schema: 'public', table: 'e_wallets', filter: `user_id=eq.${user.id}` }, () => fetchAll(true)),
        supabase.channel('dashboard_tx').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => fetchAll(true))
      ]

      channels.forEach(channel => channel.subscribe())

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel))
      }
    }
  }, [user, fetchAll])

  return {
    ...data,
    refresh: fetchAll
  }
}
