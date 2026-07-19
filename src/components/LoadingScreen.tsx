import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import SakuraWatermark from './SakuraWatermark';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)] overflow-hidden">
      {/* Decorative Atmosphere Filter */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />

      {/* Dynamic Watermark of Flower patterns, Sakura (Cherry Blossoms), Mount Fuji, and Jain Terapanth Emblem 🌸 */}
      <SakuraWatermark />

      <div className="text-center relative z-10">
        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
          {/* Radiant Glowing Background Aura */}
          <div className="absolute inset-0 bg-saffron/10 dark:bg-saffron/15 rounded-full blur-xl animate-pulse" />
          
          {/* Stable inner glow base ring */}
          <div className="absolute inset-0 border border-saffron/5 rounded-full" />

          {/* Outer Ring 1: Medium speed counter-clockwise rotation */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-[2px] border border-dashed border-saffron/20 dark:border-saffron/40 rounded-full"
          />

          {/* Outer Ring 2: Core continuous clockwise rotation */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-[-4px] border-2 border-dashed border-saffron/30 rounded-full"
          />

          {/* Rotating orbit dot that tracks the outer wheel */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-[-8px] left-[calc(50%-4px)] w-2.5 h-2.5 bg-saffron rounded-full shadow-md shadow-saffron/50" />
          </motion.div>

          {/* Central Logo: Stays perfectly upright, clear, and readable with subtle breathing pulse */}
          <motion.div
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg border border-saffron/10 relative overflow-hidden z-10"
          >
            <img 
              src="https://i.postimg.cc/vmrrKKDp/4f9ba4b7a8d6fd8a83f711595c3f3242-(3).jpg" 
              alt="Terapanth Emblem"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="serif-text text-2xl font-bold text-[var(--text-spiritual)] mb-2">Terapanth Emblem</h2>
          <div className="flex items-center justify-center gap-2 text-saffron font-bold text-[10px] uppercase tracking-[0.2em]">
            <Sparkles size={14} className="animate-pulse" />
            <span>Spiritual Insight Awaits</span>
          </div>
        </motion.div>
        
        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                type: "keyframes",
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-saffron rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
