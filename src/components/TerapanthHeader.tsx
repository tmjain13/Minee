import React, { useState, useEffect } from 'react';
import { Download, Moon, Sun, Volume2, Bell, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  streak = 12,
  onRefreshClick,
  onPenClick,
  onProfileClick
}: TerapanthHeaderProps) {
  const { language, toggleLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

        {/* Action Icons */}
        <div className={`flex items-center gap-3 ${scrolled ? 'text-stone-600 dark:text-stone-300' : 'text-white/95'}`}>
          {/* 1. Refresh Icon */}
          <button 
            onClick={onRefreshClick || (() => window.location.reload())}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
            title="Refresh App"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          </button>

          {/* 3. Theme Toggle (Moon/Sun) */}
          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>

          {/* 4. Language Toggle (हि / EN) */}
          <button 
            onClick={toggleLanguage}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-sm font-bold cursor-pointer bg-transparent border-none outline-none"
            title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            {language === 'hi' ? 'EN' : 'हि'}
          </button>

          {/* 5. Profile/Seal */}
          <button 
            onClick={onProfileClick}
            className="w-7 h-7 rounded-full bg-red-900/85 border border-white/20 overflow-hidden active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
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
          सुप्रभात • जय जिनेन्द्र, {userName}! <span className="text-orange-500 ml-1">🔥 {streak} Days</span>
        </div>
      </div>
    </header>
  );
}
