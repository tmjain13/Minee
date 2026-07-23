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
  Search,
  MoreVertical,
  Globe,
  MapPin,
  Flame,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { useLanguage } from "../context/LanguageContext";
import { useLocation } from "../context/LocationContext";
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
  zenElapsed?: number;
  activeTab?: string;
  onSearchClick?: () => void;

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
  zenElapsed = 0,
  activeTab,
  onSearchClick,

  onRefresh,
  onOpenCustomizer,
  onToggleTheme,
  streakDays,
  isDarkMode,
  language: customLanguage,
  onToggleLanguage,
}) => {
  const isDarkActive = isDarkMode !== undefined ? isDarkMode : theme === "dark";
  const activeStreak = streakDays !== undefined ? streakDays : streak;
  const triggerRefresh = onRefresh || onRefreshClick || (() => window.location.reload());
  const triggerOpenCustomizer = onOpenCustomizer || onThemePreferencesClick;
  const triggerToggleTheme = onToggleTheme || toggleTheme;

  const contextLang = useLanguage();
  const activeLanguage = customLanguage || contextLang.language;
  const triggerToggleLanguage = onToggleLanguage || contextLang.toggleLanguage;

  const { activeCity, setShowLocationModal } = useLocation();

  const [scrollY, setScrollY] = useState(0);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const checkOnlineStatus = () => {
    if (typeof window !== "undefined" && window.localStorage.getItem("terapanth_offline_simulation") === "true") {
      return false;
    }
    return navigator.onLine;
  };

  const [isOnline, setIsOnline] = useState(checkOnlineStatus);
  const [greeting, setGreeting] = useState("");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const scrollContainers = document.querySelectorAll(".overflow-y-auto, [class*='overflow-y-auto']");
    scrollContainers.forEach((el) => {
      el.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(checkOnlineStatus());
    };
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
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

  const auth = getAuth();
  const currentUser = auth.currentUser;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDarkActive
              ? "bg-[#12090B]/90 backdrop-blur-xl border-b border-[#2E1B22] text-[#F7F3EC] shadow-sm"
              : "bg-[#FFFDF8]/90 backdrop-blur-xl border-b border-[#ECE8E3] text-[#1E1E1E] shadow-2xs"
            : isDarkActive
            ? "bg-[#12090B] border-b border-[#2E1B22]/50 text-[#F7F3EC]"
            : "bg-[#FFFDF8] border-b border-[#ECE8E3]/50 text-[#1E1E1E]"
        }`}
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo & Greeting Section */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-[#6E1F2A]/10 dark:bg-[#B68D40]/15 p-1">
              <img
                src="https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png"
                alt="Terapanth Logo"
                className="w-full h-full object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#12090B] ${
                  isOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base leading-none text-[#6E1F2A] dark:text-[#D4AF64]">
                  Terapanth AI
                </span>
                <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 font-sans uppercase tracking-widest">
                  Minee
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons: Search, Profile & Overflow Menu */}
          <div className="flex items-center gap-1">
            {/* Streak Badge */}
            {activeStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6E1F2A]/10 text-[#6E1F2A] dark:text-[#D4AF64] text-xs font-semibold mr-1">
                <Flame size={12} className="fill-[#6E1F2A] dark:fill-[#D4AF64]" />
                <span>{activeStreak}d</span>
              </div>
            )}

            {/* Global Search Button */}
            <button
              onClick={onSearchClick}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 transition-all active:scale-95 cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            {/* User Profile Button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (currentUser) {
                    setShowProfileMenu(!showProfileMenu);
                    setShowOverflowMenu(false);
                  } else if (onLoginClick) {
                    onLoginClick();
                  } else if (onProfileClick) {
                    onProfileClick();
                  }
                }}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 transition-all active:scale-95 cursor-pointer relative"
                title="Profile"
                aria-label="Profile"
              >
                <User size={18} strokeWidth={1.8} />
                {currentUser && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#6E1F2A] dark:bg-[#D4AF64] rounded-full" />
                )}
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1C1014] rounded-2xl shadow-xl border border-[#ECE8E3] dark:border-[#2E1B22] p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 border-b border-[#ECE8E3] dark:border-[#2E1B22] mb-1">
                    <p className="text-[10px] font-bold text-[#6E1F2A] dark:text-[#D4AF64] uppercase tracking-wider">
                      जय जिनेन्द्र!
                    </p>
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {currentUser.displayName || currentUser.email || "Sravaka"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <User size={14} /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      triggerOpenCustomizer?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Settings size={14} /> Customizer
                  </button>
                  <button
                    onClick={() => {
                      auth.signOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Overflow Secondary Actions Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowOverflowMenu(!showOverflowMenu);
                  setShowProfileMenu(false);
                }}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 transition-all active:scale-95 cursor-pointer"
                title="More Actions"
                aria-label="More Actions"
              >
                <MoreVertical size={18} strokeWidth={1.8} />
              </button>

              {/* Overflow Menu */}
              {showOverflowMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1C1014] rounded-2xl shadow-xl border border-[#ECE8E3] dark:border-[#2E1B22] p-2 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      triggerToggleLanguage?.();
                      setShowOverflowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={14} /> Language
                    </span>
                    <span className="font-bold text-[#6E1F2A] dark:text-[#D4AF64]">
                      {activeLanguage === "hi" ? "हिन्दी" : "English"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      triggerToggleTheme?.();
                      setShowOverflowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {isDarkActive ? <Sun size={14} /> : <Moon size={14} />} Theme
                    </span>
                    <span className="text-stone-400 capitalize">{isDarkActive ? "Dark" : "Light"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowLocationModal(true);
                      setShowOverflowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={14} /> Location
                    </span>
                    <span className="text-stone-500 font-medium">{activeCity?.name || "Delhi"}</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerRefresh?.();
                      setShowOverflowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center gap-2 cursor-pointer border-t border-[#ECE8E3] dark:border-[#2E1B22] mt-1 pt-2"
                  >
                    <RefreshCcw size={14} /> Refresh Application
                  </button>

                  <button
                    onClick={() => {
                      onPenClick?.();
                      setShowOverflowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <PenTool size={14} /> Notes & Reflections
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Scroll to Top Floating Action Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-22 right-4 z-50 p-3 rounded-full bg-white dark:bg-[#1C1014] border border-[#ECE8E3] dark:border-[#2E1B22] text-[#6E1F2A] dark:text-[#D4AF64] shadow-md cursor-pointer flex items-center justify-center transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default TerapanthHeader;

