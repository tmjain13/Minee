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
  isDeepFocus?: boolean;
  hideHeader?: boolean;
  zenElapsed?: number;
  activeTab?: string;
  onSearchClick?: () => void;
  onLogoClick?: () => void;
  hasSignificantEvent?: boolean;
  unreadCount?: number;

  onRefresh?: () => void;
  onOpenCustomizer?: () => void;
  onToggleTheme?: () => void;
  streakDays?: number;
  isDarkMode?: boolean;
  language?: "hi" | "en";
  onToggleLanguage?: () => void;
  hapticsEnabled?: boolean;
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
  isDeepFocus = false,
  hideHeader = false,
  zenElapsed = 0,
  activeTab,
  onSearchClick,
  onLogoClick,
  hasSignificantEvent = true,
  unreadCount = 3,

  onRefresh,
  onOpenCustomizer,
  onToggleTheme,
  streakDays,
  isDarkMode,
  language: customLanguage,
  onToggleLanguage,
  hapticsEnabled = true,
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

  // Global Haptic Feedback Triggering
  const triggerHaptic = useCallback((pattern: number | number[] = 15) => {
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;
    const isEnabledProp = hapticsEnabled !== false;
    const hapticClicksEnabled =
      isEnabledProp &&
      localStorage.getItem("haptic_button_clicks") !== "false" &&
      localStorage.getItem("terapanth_haptics") !== "false";
    if (hapticClicksEnabled) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Fallback for restricted contexts
      }
    }
  }, [hapticsEnabled]);

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
  const isHeaderHidden = zenMode || isDeepFocus || hideHeader;

  const checkOnlineStatus = () => {
    if (typeof window !== "undefined" && window.localStorage.getItem("terapanth_offline_simulation") === "true") {
      return false;
    }
    return navigator.onLine;
  };

  const [isOnline, setIsOnline] = useState(checkOnlineStatus);
  const [greeting, setGreeting] = useState("");

  const scrollToTop = () => {
    triggerHaptic(20);
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

  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleLogoTap = useCallback(() => {
    triggerHaptic(25);
    if (onLogoClick) {
      onLogoClick();
    } else {
      window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'home' }));
    }
  }, [onLogoClick, triggerHaptic]);

  const shadowOpacityPct = Math.min(15, Math.max(0, (scrollY / 100) * 15)).toFixed(2);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)] ${
          isHeaderHidden
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100 pointer-events-auto"
        } ${
          scrolled
            ? isDarkActive
              ? "bg-[#12090B]/90 backdrop-blur-xl border-b border-[#2E1B22] text-[#F7F3EC]"
              : "bg-[#FFFDF8]/90 backdrop-blur-xl border-b border-[#ECE8E3] text-[#1E1E1E]"
            : isDarkActive
            ? "bg-[#12090B] border-b border-[#2E1B22]/50 text-[#F7F3EC]"
            : "bg-[#FFFDF8] border-b border-[#ECE8E3]/50 text-[#1E1E1E]"
        }`}
        style={{
          boxShadow: `0 4px 20px color-mix(in srgb, var(--border-color) ${shadowOpacityPct}%, transparent)`,
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          transition:
            "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease, box-shadow 300ms ease, backdrop-filter 300ms ease, background-color 300ms ease, border-color 300ms ease",
        }}
      >
        <div className="max-w-lg mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
          {/* Logo & Branding Section */}
          <div className="flex items-center gap-3.5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -2 }}
              animate={
                hasSignificantEvent
                  ? {
                      opacity: 1,
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 0 0px rgba(212, 175, 100, 0)",
                        "0 0 0 6px rgba(212, 175, 100, 0.35)",
                        "0 0 0 0px rgba(212, 175, 100, 0)",
                      ],
                    }
                  : { opacity: 1, scale: 1 }
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={
                hasSignificantEvent
                  ? {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }
                  : { duration: 0.2, ease: "easeOut" }
              }
              onClick={handleLogoTap}
              className="relative w-10 h-10 shrink-0 flex items-center justify-center cursor-pointer group rounded-full transition-shadow duration-300"
              aria-label={activeLanguage === "hi" ? "मुख्य पृष्ठ पर लौटें" : "Return to Home"}
              aria-describedby="logo-tooltip"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLogoTap();
                }
              }}
            >
              {/* Skeleton Loader while loading */}
              {!isLogoLoaded && (
                <div className="absolute inset-0 bg-stone-200/80 dark:bg-stone-800/80 rounded-full animate-pulse border border-stone-300/40 dark:border-stone-700/40" />
              )}

              <img
                src="https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png"
                alt="Terapanth Official Logo"
                className={`w-full h-full object-contain drop-shadow-xs group-hover:scale-105 transition-all duration-200 ${
                  isLogoLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="eager"
                referrerPolicy="no-referrer"
                onLoad={() => setIsLogoLoaded(true)}
                onError={() => setIsLogoLoaded(true)}
              />

              {/* Online/Offline Status Indicator */}
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#12090B] ${
                  isOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />

              {/* Unread Spiritual Updates / Announcements Notification Badge */}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#12090B] shadow-xs z-20 pointer-events-none"
                  title={`${unreadCount} ${activeLanguage === "hi" ? "नवीनतम आध्यात्मिक अद्यतन" : "Unread Spiritual Updates"}`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}

              {/* Accessible Hover Tooltip */}
              <div
                role="tooltip"
                id="logo-tooltip"
                className="absolute left-0 top-full mt-2 px-2.5 py-1 bg-stone-900/95 dark:bg-stone-800/95 text-stone-100 dark:text-stone-100 text-[11px] font-medium rounded-md whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 border border-stone-700/50 scale-95 group-hover:scale-100 origin-top-left"
              >
                {activeLanguage === "hi" ? "मुख्य पृष्ठ पर लौटें (Return to Home)" : "Return to Home"}
              </div>
            </motion.div>

            <button
              onClick={handleLogoTap}
              className="flex flex-col text-left cursor-pointer group focus:outline-hidden"
              title={activeLanguage === "hi" ? "मुख्य पृष्ठ (Home)" : "Go to Home"}
            >
              <span className="font-serif font-bold text-lg leading-none text-[#6E1F2A] dark:text-[#D4AF64] group-hover:opacity-80 transition-opacity">
                Terapanth AI
              </span>
            </button>
          </div>

          {/* Primary Action Buttons: Search, Profile & Overflow Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Streak Badge */}
            {activeStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6E1F2A]/10 text-[#6E1F2A] dark:text-[#D4AF64] text-xs font-semibold mr-1">
                <Flame size={13} className="fill-[#6E1F2A] dark:fill-[#D4AF64]" />
                <span>{activeStreak}d</span>
              </div>
            )}

            {/* Global Search Button */}
            <button
              onClick={() => {
                triggerHaptic();
                onSearchClick?.();
              }}
              className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 transition-all active:scale-95 cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.8} />
            </button>

            {/* User Profile Button */}
            <div className="relative">
              <button
                onClick={() => {
                  triggerHaptic();
                  if (currentUser) {
                    setShowProfileMenu(!showProfileMenu);
                    setShowOverflowMenu(false);
                  } else if (onLoginClick) {
                    onLoginClick();
                  } else if (onProfileClick) {
                    onProfileClick();
                  }
                }}
                className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 transition-all active:scale-95 cursor-pointer relative"
                title="Profile"
                aria-label="Profile"
              >
                <User size={19} strokeWidth={1.8} />
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
                      triggerHaptic();
                      onProfileClick?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <User size={14} /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      triggerOpenCustomizer?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Settings size={14} /> Customizer
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic(30);
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
                  triggerHaptic();
                  setShowOverflowMenu(!showOverflowMenu);
                  setShowProfileMenu(false);
                }}
                className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 transition-all active:scale-95 cursor-pointer"
                title="More Actions"
                aria-label="More Actions"
              >
                <MoreVertical size={19} strokeWidth={1.8} />
              </button>

              {/* Overflow Menu */}
              {showOverflowMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1C1014] rounded-2xl shadow-xl border border-[#ECE8E3] dark:border-[#2E1B22] p-2 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      triggerHaptic();
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
                      triggerHaptic();
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
                      triggerHaptic();
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
                      triggerHaptic(20);
                      triggerRefresh?.();
                      setShowOverflowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl flex items-center gap-2 cursor-pointer border-t border-[#ECE8E3] dark:border-[#2E1B22] mt-1 pt-2"
                  >
                    <RefreshCcw size={14} /> Refresh Application
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic();
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

        {/* Dynamic Depth Accent Glow Line on Scroll */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF64]/80 dark:via-[#D4AF64]/90 to-transparent transition-opacity duration-300 pointer-events-none ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{
            boxShadow: scrolled ? "0 1px 10px rgba(212, 175, 100, 0.5)" : "none",
          }}
        />
      </header>

      {/* Scroll to Top Floating Action Button */}
      <AnimatePresence>
        {showScrollTop && !isHeaderHidden && (
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

