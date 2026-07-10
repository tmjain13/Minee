import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

export default function BeadCounter() {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    setIsAnimating(true);
    
    // Haptic simulation: vibrate if available, visual feedback via animation
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Digital Bead Counter</h3>
      <motion.div 
        animate={{ scale: isAnimating ? 1.1 : 1 }}
        className="text-5xl font-black font-mono text-gray-800 dark:text-gray-100 mb-6 tabular-nums"
      >
        {count}
      </motion.div>
      <div className="flex gap-4">
        <button
          onClick={handleIncrement}
          className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center"
        >
          Count
        </button>
        <button
          onClick={handleReset}
          className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500 flex items-center justify-center transition-all active:scale-95"
          title="Reset"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}
