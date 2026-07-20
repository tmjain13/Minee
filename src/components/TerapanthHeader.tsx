import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCcw,
  PenTool,
  Grid3X3,
  Moon,
  Sun,
  Settings,
  User,
  LogOut,
  ArrowUp,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";

export interface TerapanthHeaderProps {
  theme?: string;
  toggleTheme?: () => void;
  streak?: number;
  onRefreshClick?: () => void;
  onThemePreferencesClick?: () => void;
  onPenClick?: () => void;
  onProfileClick?: () => void;
  onLoginClick?: () => void;
  zenMode?: boolean;
  activeTab?: string;

  // Props requested by Kimi / user
  onRefresh?: () => void;
  onOpenCustomizer?: () => void;
  onToggleTheme?: () => void;
  streakDays?: number;
  isDarkMode?: boolean;
  language?: "hi" | "en";
  onToggleLanguage?: () => void;
}

export const TerapanthHeader: React.FC<TerapanthHeaderProps> = ({
  theme = "light",
  toggleTheme,
  streak = 0,
  onRefreshClick,
  onThemePreferencesClick,
  onPenClick,
  onProfileClick,
  onLoginClick,
  zenMode = false,
  activeTab,

  onRefresh,
  onOpenCustomizer,
  onToggleTheme,
  streakDays,
  isDarkMode,
  language: customLanguage,
  onToggleLanguage,
}) => {
  // Setup unified values with fallback
  const isDarkActive = isDarkMode !== undefined ? isDarkMode : theme === "dark";
  const activeStreak = streakDays !== undefined ? streakDays : streak;
  const triggerRefresh = onRefresh || onRefreshClick || (() => window.location.reload());
  const triggerOpenCustomizer = onOpenCustomizer || onThemePreferencesClick;
  const triggerToggleTheme = onToggleTheme || toggleTheme;

  // Language context fallback
  const contextLang = useLanguage();
  const activeLanguage = customLanguage || contextLang.language;
  const triggerToggleLanguage = onToggleLanguage || contextLang.toggleLanguage;

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      let currentScroll = 0;
      if (e.target instanceof HTMLElement) {
        currentScroll = e.target.scrollTop;
      } else if (e.target === document || e.target === window) {
        currentScroll = window.scrollY || document.documentElement.scrollTop;
      }
      setScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  const scrolled = scrollY > 20;
  const showScrollTop = scrollY > 300;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [greeting, setGreeting] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const scrollContainers = document.querySelectorAll(".overflow-y-auto, [class*='overflow-y-auto']");
    scrollContainers.forEach((el) => {
      el.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (activeLanguage === "hi") {
      if (hour < 12) setGreeting("सुप्रभात");
      else if (hour < 17) setGreeting("शुभ अपराह्न");
      else setGreeting("शुभ संध्या");
    } else {
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    }
  }, [activeLanguage]);

  const handleRefresh = useCallback(() => {
    triggerRefresh?.();
  }, [triggerRefresh]);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const isFront = activeTab === "home";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDarkActive
              ? "bg-gradient-to-r from-orange-950/95 via-[#542004]/95 to-amber-950/95 backdrop-blur-lg border-b border-orange-900/40 shadow-lg text-white"
              : "bg-gradient-to-r from-orange-600/90 via-orange-500/90 to-amber-500/90 backdrop-blur-lg border-b border-orange-600/30 shadow-md text-white"
            : "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 text-white"
        }`}
      >
        <div className={`max-w-lg mx-auto px-3 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "py-1" : "py-2"
        }`}>
          {/* Group 1: Logo and Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className="w-12 h-12 flex items-center justify-center"
              >
                <img
                  src="https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png"
                  alt="Terapanth Logo"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                  scrolled ? (isDarkActive ? "border-black" : "border-white") : "border-orange-500"
                } ${isOnline ? "bg-green-400" : "bg-red-400"}`}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white">
                Terapanth AI
              </h1>
              <p className="text-[9px] uppercase tracking-widest font-semibold text-white/80">
                Unified Knowledge
              </p>
            </div>
          </div>

          {/* Group 2: Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-white/20 text-white"
              title="Refresh App"
            >
              <RefreshCcw size={16} />
            </button>
            
            <button
              onClick={onPenClick}
              className="p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-white/20 text-white"
              title="Quick Notes/Customizer"
            >
              <PenTool size={16} />
            </button>

            <button
              onClick={triggerOpenCustomizer}
              className="p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-white/20 text-white"
              title="Dashboard Settings"
            >
              <Grid3X3 size={16} />
            </button>

            <button
              onClick={triggerToggleTheme}
              className="p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-white/20 text-white"
              title="Toggle Theme"
            >
              {isDarkActive ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={triggerToggleLanguage}
              className="px-1.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer hover:bg-white/20 text-white"
              title="Toggle Language"
            >
              {activeLanguage === "hi" ? "EN" : "हि"}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  if (currentUser) {
                    setShowProfileMenu(!showProfileMenu);
                  } else if (onLoginClick) {
                    onLoginClick();
                  } else if (onProfileClick) {
                    onProfileClick();
                  }
                }}
                className="p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer relative hover:bg-white/20 text-white"
                title={currentUser ? "User Profile" : "Login"}
              >
                <User size={16} />
                {currentUser && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
              </button>

              {showProfileMenu && currentUser && (
                <div
                  className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 ${
                    isDarkActive ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"
                  }`}
                >
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">जय जिनेन्द्र!</p>
                    <p className="text-sm font-medium truncate">{currentUser.displayName || currentUser.email || "Sravaka"}</p>
                  </div>
                  <button
                    onClick={() => {
                      triggerOpenCustomizer?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Settings size={14} /> Dashboard Settings
                  </button>
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <User size={14} /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      auth.signOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-header Greeting Banner */}
        {!zenMode && (
          <div
            className={`px-4 py-1 text-center text-[11px] font-medium transition-all duration-300 ${
              isDarkActive ? "bg-black/50 text-orange-300" : "bg-orange-50 text-orange-700"
            }`}
          >
            <span>{greeting} • जय जिनेन्द्र!</span>
            {activeStreak > 0 && (
              <span className="ml-2 text-amber-500 font-bold animate-pulse">🔥 {activeStreak} Days Streak</span>
            )}
          </div>
        )}
      </header>

      {/* Scroll to Top Floating Action Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className={`fixed bottom-22 right-4 z-50 p-3 rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-all duration-300 border ${
              isDarkActive
                ? "bg-stone-900 border-stone-800 text-orange-400 hover:text-orange-300 hover:bg-stone-850 shadow-orange-950/20"
                : "bg-white border-orange-100 text-orange-600 hover:text-orange-500 hover:bg-orange-50 shadow-orange-500/10"
            }`}
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} className="stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default TerapanthHeader;
