import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, X, Trophy, Flame, Heart, BookOpen } from 'lucide-react';

export default function StreakCelebration() {
  const [isOpen, setIsOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const handleStreakCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const streak = customEvent.detail?.streak || 1;
      setStreakCount(streak);
      setIsOpen(true);

      // Trigger standard confetti burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Sequential multi-angle celebration cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);

      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5, x: 0.5 }
        });
      }, 700);
    };

    window.addEventListener('sadhana-streak-completed', handleStreakCompleted);
    return () => {
      window.removeEventListener('sadhana-streak-completed', handleStreakCompleted);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        {/* Animated Background Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-500/10 rounded-full blur-[80px]" />
        </motion.div>

        {/* Celebratory Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 25 } 
          }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-amber-500/25 rounded-[24px] shadow-2xl p-8 text-center overflow-hidden"
        >
          {/* Subtle patterned gold border frame */}
          <div className="absolute inset-1.5 border border-amber-500/10 rounded-[18px] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer z-10"
          >
            <X size={18} />
          </button>

          {/* Golden Rotating Emblem */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-amber-500/40"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="absolute inset-1.5 rounded-full border border-dashed border-rose-500/25"
            />
            
            {/* Inner Trophy Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20"
            >
              <Trophy className="text-white w-8 h-8" />
            </motion.div>

            {/* Float Stars */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute -top-1 -left-1 text-amber-500"
            >
              <Sparkles size={16} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
              className="absolute -bottom-1 -right-1 text-rose-500"
            >
              <Sparkles size={14} />
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <span className="text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full">
              साधना निरंतरता (Sadhana Continuity)
            </span>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Sadhana Streak Completed!
            </h2>
            
            {/* Big Streak Display */}
            <div className="py-4 my-2 flex items-center justify-center gap-2">
              <div className="bg-stone-50 dark:bg-zinc-800/50 border border-amber-500/10 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px] shadow-inner">
                <motion.span 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono"
                >
                  {streakCount}
                </motion.span>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider mt-1">
                  Days Streak
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
              जय जिनेन्द्र! Your complete devotion and regular practice have earned you today's Sadhana completion. Keep up the high spirit and self-discipline!
            </p>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl shadow-md hover:shadow-lg hover:shadow-amber-500/15 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              अनुमोदना! Keep Growing
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
