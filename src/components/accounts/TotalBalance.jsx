import React from 'react'
import Icon from '../Icon'
import { motion as Motion } from 'motion/react'

export default function TotalBalance({ total, onAddClick, loading }) {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-[3rem] p-8 md:p-12 mb-10 overflow-hidden relative group"
    >
      {/* Decorative butterfly spots */}
      <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
      <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-pink-400/20 rounded-full blur-[60px] group-hover:scale-110 transition-transform duration-1000"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <Motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center md:text-left"
        >
          <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
            <span className="w-2 h-2 bg-pink-200 rounded-full animate-pulse"></span>
            <p className="text-pink-100 font-black uppercase tracking-[0.2em] text-xs">Total Net Worth</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {loading ? 'Loading...' : `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </h2>
        </Motion.div>
        
        <Motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddClick}
          className="bg-white text-pink-600 px-8 py-5 rounded-[2rem] font-black text-lg hover:bg-pink-50 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 group whitespace-nowrap"
        >
          <div className="bg-pink-100 rounded-xl p-1.5 group-hover:bg-pink-200 transition-colors">
            <Icon name="plus" color="currentColor" className="w-5 h-5" />
          </div>
          Add New Account
        </Motion.button>
      </div>
    </Motion.div>
  )
}
