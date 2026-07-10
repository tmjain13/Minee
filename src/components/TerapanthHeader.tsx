import React, { useState, useEffect } from 'react';
import { Download, Moon, Sun, Volume2, Bell, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface TerapanthHeaderProps {
  theme: string;
  toggleTheme: () => void;
  userName?: string;
  streak?: number;
  onRefreshClick?: () => void;
  onPenClick?: () => void;
  onProfileClick?: () => void;
}

export default function TerapanthHeader({ 
  theme, 
  toggleTheme, 
  userName = "ज्योतिर्मय", 
  streak = 5,
  onRefreshClick,
  onPenClick,
  onProfileClick
}: TerapanthHeaderProps) {
  const { language, toggleLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [animateStreak, setAnimateStreak] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleCompleted = () => {
      setAnimateStreak(true);
      
      // Generate micro-particles for a beautiful localized confetti pop around the badge
      const colors = ['#f59e0b', '#f97316', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
      const particles = Array.from({ length: 24 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 80, // Horizontal dispersion
        y: -Math.random() * 60 - 20,    // Float upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 3     // Random size between 3px and 8px
      }));
      setConfettiParticles(particles);

      // Reset animation state after 3 seconds
      const timer = setTimeout(() => {
        setAnimateStreak(false);
        setConfettiParticles([]);
      }, 3000);
      
      // Haptic confirmation if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      return () => clearTimeout(timer);
    };

    window.addEventListener('sadhana-streak-completed', handleCompleted);
    return () => {
      window.removeEventListener('sadhana-streak-completed', handleCompleted);
    };
  }, []);

  return (
    <header 
      onClick={(e) => e.stopPropagation()}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#141210]/80 backdrop-blur-md shadow-sm' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}
    >
      
      {/* Top Branding Bar */}
      <div className="flex items-center justify-between px-4 h-[56px] max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-white rounded-full p-0.5">
               <img src="https://i.postimg.cc/vmrrKKDp/4f9ba4b7a8d6fd8a83f711595c3f3242-3.jpg" alt="Logo" className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className={`flex flex-col ${scrolled ? 'text-stone-900 dark:text-stone-100' : 'text-white'}`}>
            <h1 className="font-serif text-sm font-bold leading-tight">Terapanth AI</h1>
            <p className="text-[8px] font-bold tracking-wider uppercase opacity-90">Unified Knowledge</p>
          </div>
        </div>

        {/* Action Icons & Streak Badge */}
        <div className={`flex items-center gap-2.5 ${scrolled ? 'text-stone-600 dark:text-stone-300' : 'text-white/95'}`}>
          
          {/* HIGH-RETENTION DYNAMIC STREAK BADGE */}
          <div className="relative flex items-center justify-center">
            <motion.div 
              animate={animateStreak ? {
                scale: [1, 1.35, 0.95, 1.2, 0.98, 1.05, 1],
                rotate: [0, -12, 12, -6, 6, 0],
                boxShadow: scrolled
                  ? ["0px 0px 0px rgba(249,115,22,0)", "0px 0px 20px rgba(249,115,22,0.65)", "0px 0px 2px rgba(249,115,22,0.1)"]
                  : ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 25px rgba(255,255,255,0.85)", "0px 0px 4px rgba(255,255,255,0.15)"],
              } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black font-sans tracking-tight transition-all duration-300 border select-none cursor-pointer ${
                animateStreak
                  ? scrolled 
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-600 scale-110 shadow-md' 
                    : 'bg-white/30 border-white text-white scale-110 shadow-lg'
                  : scrolled 
                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 hover:bg-orange-500/15' 
                    : 'bg-white/15 border-white/20 text-white hover:bg-white/20'
              }`}
              title="Daily Sadhana Streak"
              onClick={onPenClick}
            >
              <motion.span 
                animate={animateStreak ? {
                  scale: [1, 1.6, 1.1, 1.4, 1],
                  y: [0, -5, 0]
                } : {}}
                transition={{ duration: 1 }}
                className="text-xs"
              >
                🔥
              </motion.span>
              <span>{streak} Days</span>

              {/* Multi-layered Glowing expansion ring */}
              {animateStreak && (
                <motion.span
                  initial={{ scale: 0.85, opacity: 0.9 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: 1, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full border pointer-events-none ${scrolled ? 'border-orange-500' : 'border-white'}`}
                />
              )}
            </motion.div>

            {/* Particle Confetti Sparkles Pop */}
            <AnimatePresence>
              {animateStreak && confettiParticles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ 
                    x: p.x, 
                    y: p.y, 
                    scale: [1, 1.3, 0], 
                    opacity: [1, 0.85, 0],
                    rotate: Math.random() * 360 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    backgroundColor: p.color,
                    width: p.size,
                    height: p.size,
                    left: '50%',
                    top: '50%',
                    marginLeft: -p.size/2,
                    marginTop: -p.size/2,
                    zIndex: 100
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* 1. Refresh Icon */}
          <button 
            onClick={onRefreshClick || (() => window.location.reload())}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
            title="Refresh App"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>

          {/* 2. Pen Tool (Nib) Icon */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              (onPenClick || (() => alert("Jai Jinendra! Opening Daily Spiritual Reflection Diary...")))();
            }}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
            title="Spiritual Journal / Sadhana"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          </button>

          {/* 3. Theme Toggle (Moon/Sun) */}
          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>

          {/* 4. Language Toggle (हि / EN) */}
          <button 
            onClick={toggleLanguage}
            className="w-6.5 h-6.5 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-xs font-bold cursor-pointer bg-transparent border-none outline-none"
            title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            {language === 'hi' ? 'EN' : 'हि'}
          </button>

          {/* 5. Profile/Seal */}
          <button 
            onClick={onProfileClick}
            className="w-6.5 h-6.5 rounded-full bg-red-900/85 border border-white/20 overflow-hidden active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Spiritual Profile & Settings"
          >
            <img 
              src="https://i.postimg.cc/vmrrKKDp/4f9ba4b7a8d6fd8a83f711595c3f3242-3.jpg" 
              alt="Seal" 
              className="w-full h-full object-cover rounded-full"
            />
          </button>
        </div>
      </div>

      {/* Sticky Scroll Greeting */}
      <div className={`overflow-hidden transition-all duration-300 max-w-md mx-auto ${scrolled ? 'h-8 opacity-100 border-b border-stone-200/50 dark:border-stone-800' : 'h-0 opacity-0'}`}>
        <div className="flex items-center justify-center h-full text-[10px] font-bold text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/50">
          सुप्रभात • जय जिनेन्द्र, {userName}! 
          <motion.span 
            animate={animateStreak ? {
              scale: [1, 1.25, 0.9, 1.15, 1],
              color: ['#f97316', '#ef4444', '#f59e0b', '#f97316'],
            } : {}}
            transition={{ duration: 1.2 }}
            className="text-orange-500 ml-1 font-extrabold flex items-center gap-0.5"
          >
            🔥 {streak} Days
          </motion.span>
        </div>
      </div>
    </header>
  );
}
