import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)] overflow-hidden">
      {/* Decorative Atmosphere Filter */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />

      <div className="text-center relative z-10">
        <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
          {/* Subtle Radiant Glowing Background Aura */}
          <div className="absolute inset-4 bg-orange-500/5 rounded-full blur-2xl animate-pulse" />

          {/* Central Logo: Ring-free, centered, and enlarged with a subtle breathing pulse */}
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-56 h-56 flex items-center justify-center relative overflow-hidden z-10"
          >
            <img 
              src="https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png" 
              alt="Terapanth Emblem"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              loading="lazy"
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
