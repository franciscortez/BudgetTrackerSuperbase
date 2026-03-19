import React from 'react'
import Icon from '../Icon'
import { motion as Motion } from 'motion/react'
import { useTheme } from '../../contexts/ThemeContext'

export default function CardItem({ card, onEdit, onDelete }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const bgColor = card.color || '#F472B6' // Default pink-400

  return (
    <Motion.div 
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-dark-card p-6 rounded-[2.5rem] border border-pink-50 dark:border-dark-border relative overflow-hidden group transition-all duration-300 flex flex-col"
    >
      <Motion.div 
        whileHover={{ scale: 1.02 }}
        className="relative h-48 rounded-[2rem] p-6 overflow-hidden mb-4 cursor-pointer"
        style={{ 
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
          color: card.text_color || '#FFFFFF'
        }}
      >
        {/* Card Pattern/Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 translate-y-[-10px] blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-x-[-10px] translate-y-10 blur-xl"></div>
        
        <div className="absolute top-4 right-6 opacity-20">
          <Icon name="bank" color="currentColor" className="w-12 h-12" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{card.bank_name || 'Bank'}</p>
              <h3 className="text-xl font-bold tracking-tight">
                {card.card_name}
              </h3>
            </div>
            <Motion.div 
              whileHover={{ rotate: 15 }}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 p-2"
            >
              <Icon name="card" color="currentColor" className="w-6 h-6" />
            </Motion.div>
          </div>
          
          <div className="mt-auto">
            <p className="text-xs font-mono tracking-widest mb-1 opacity-60">•••• •••• •••• {card.last_four || '0000'}</p>
            <div className="flex justify-between items-end">
              <p className="text-2xl font-black tracking-tight">
                ₱{Number(card.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <span className="opacity-40 text-[8px] font-black uppercase tracking-tighter">Debit Card</span>
            </div>
          </div>
        </div>
      </Motion.div>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(card)}
            className="p-3 text-gray-400 dark:text-dark-muted hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-all"
            title="Edit Card"
          >
            <Icon name="edit" color="currentColor" className="w-5 h-5" />
          </Motion.button>
          <Motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(card.id)}
            className="p-3 text-gray-400 dark:text-dark-muted hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
            title="Delete Card"
          >
            <Icon name="delete" color="currentColor" className="w-5 h-5" />
          </Motion.button>
        </div>
        
        <Motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: card.is_active !== false ? '#10B981' : '#EF4444' }}
        ></Motion.div>
      </div>
    </Motion.div>
  )
}
