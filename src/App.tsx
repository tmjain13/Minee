/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  useState,
  useEffect,
  lazy,
  Suspense,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  PenTool,
  Check,
  X,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  CloudDownload,
  Sparkles,
  Link,
  ChevronRight,
  ChevronLeft,
  ArrowLeftRight,
  ShieldCheck,
  Award,
  BookOpen,
  Plus,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Home,
  Calendar,
  MessageSquare,
  Heart,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import { useSyncKnowledgeBase } from "./hooks/useSyncKnowledgeBase";
import { useLanguageInit } from "./hooks/useLanguageInit";
import { ACHARYAS } from "./data/acharyas";
import LoadingScreen from "./components/LoadingScreen";
import Onboarding from "./components/Onboarding";
import AppTour from "./components/AppTour";
import TerapanthHeader from "./components/TerapanthHeader";
import TerapanthFooterNav from "./components/TerapanthFooterNav";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { GlobalAudioPlayer } from "./components/GlobalAudioPlayer";
import QuickActions from "./components/QuickActions";
import { AdminGuard } from "./components/AdminGuard";
import UnifiedPermissionsModal from "./components/UnifiedPermissionsModal";
import { LazyWrapper } from "./integrations/ComponentRegistry";
import { devLog } from "./lib/devLog";
import LoginModal from "./components/LoginModal";
import StaticUnifiedHomeDashboard from "./components/UnifiedHomeDashboard";
import StaticThemeCustomizer from "./components/ThemeCustomizer";
import * as Sentry from "@sentry/react";

// --- SAFE LAZY WRAPPER FOR CHUNK-LOAD SELF-HEALING ---
const retryLoad = async <T,>(
  fn: () => Promise<T>,
  retriesLeft = 3,
  delay = 1000,
  backoff = 2
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft <= 0) {
      throw error;
    }
    console.warn(`Chunk load failed, retrying in ${delay}ms... (${retriesLeft} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryLoad(fn, retriesLeft - 1, delay * backoff, backoff);
  }
};

const safeLazy = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return lazy(async () => {
    try {
      return await retryLoad(importFunc, 3, 1000, 2);
    } catch (error) {
      console.error("Dynamic chunk load failure caught after retries! Self-healing app via reload...", error);
      
      // Log the failure as an error level incident to Sentry before reloading
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
        level: "error",
        tags: {
          mechanism: "retry_load_failure",
          will_reload: "true",
        },
      });

      const lastReload = sessionStorage.getItem("last_chunk_reload_time");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("last_chunk_reload_time", now.toString());
        window.location.reload();
      }
      throw error;
    }
  });
};

// --- LAZY LOADED CORE FEATURE COMPONENTS ---
const TerapanthLightChatUI = safeLazy(() => import("./components/TerapanthLightChatUI").then(m => ({ default: m.TerapanthLightChatUI })));
const SadhanaTab = safeLazy(() => import("./components/SadhanaTab"));
const ProfileTab = safeLazy(() => import("./components/ProfileTab"));
const AdminPanel = safeLazy(() => import("./components/AdminPanel"));
const AdminDashboard = safeLazy(() => import("./components/AdminDashboard"));
const PanchangSection = safeLazy(() => import("./components/PanchangSection"));
const MediaCenter = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/MediaCenter"));
const AudioCenter = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/AudioCenter"));
const DigitalLibrary = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/DigitalLibrary"));
const MaryadaQuiz = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/MaryadaQuiz"));
const UnifiedHomeDashboard = (props: any) => <StaticUnifiedHomeDashboard {...props} />;
const UnifiedQuizEngine = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/UnifiedQuizEngine"));
const AgamShorts = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/AgamShorts"));
const PrekshaVisualizer = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/PrekshaVisualizer"));
const UnifiedRegistry = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/UnifiedRegistry"));
const SaintsList = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/SaintsList"));
const AiSmartFaqEngine = safeLazy(() => import("./components/AiSmartFaqEngine").then(m => ({ default: m.AiSmartFaqEngine })));
const ViharTracker = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/ViharTracker"));
const GalleryTab = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/GalleryTab"));

// --- ADDITIONAL SUPPORTED TABS ---
const DailyVachan = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/DailyVachan"));
const NavkarMantra = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/NavkarMantra"));
const DailySuvichar = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/DailySuvichar"));
const PratikramanGuide = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/PratikramanGuide"));
const SacredPlacesMap = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/SacredPlacesMap"));
const KarmaTheory = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/KarmaTheory"));
const TapaLeaderboard = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/TapaLeaderboard"));
const SutraLibrary = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/SutraLibrary"));
const AnuvratPledge = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/AnuvratPledge"));
const SpiritualJournal = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/SpiritualJournal"));
const ParyushanaTab = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/ParyushanaTab"));
const TerapanthMasterHub2026 = safeLazy(() =>
  import(/* webpackChunkName: "secondary-features" */ "./components/TerapanthMasterHub2026").then((m) => ({
    default: m.TerapanthMasterHub2026,
  }))
);

// --- MODALS & WRAPPERS ---
const ThemeCustomizer = (props: any) => <StaticThemeCustomizer {...props} />;
const ChaturmasRegistry = safeLazy(() => import(/* webpackChunkName: "secondary-features" */ "./components/ChaturmasRegistry"));
const NavigationController = safeLazy(() =>
  import(/* webpackChunkName: "secondary-features" */ "./components/NavigationController").then((m) => ({
    default: m.NavigationController,
  }))
);

// --- TYPES ---
export interface SyncLog {
  id: string;
  timestamp: string;
  status: "Success" | "Failed";
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const DEFAULT_TAB_ORDER = ['home', 'chat', 'sadhana', 'panchang', 'profile'];

const getTabLabel = (tabId: string, lang: string) => {
  const labels: Record<string, { en: string; hi: string }> = {
    home: { en: "Home", hi: "होम" },
    panchang: { en: "Calendar", hi: "पंचांग" },
    chat: { en: "Chat", hi: "चैट" },
    sadhana: { en: "Sadhana", hi: "साधना" },
    profile: { en: "Profile", hi: "प्रोफ़ाइल" },
  };
  return labels[tabId] ? (lang === "hi" ? labels[tabId].hi : labels[tabId].en) : tabId;
};

const getTabIcon = (tabId: string, size = 12, className = "") => {
  switch (tabId) {
    case 'home': return <Home size={size} className={className} />;
    case 'panchang': return <Calendar size={size} className={className} />;
    case 'chat': return <MessageSquare size={size} className={className} />;
    case 'sadhana': return <Heart size={size} className={className} />;
    case 'profile': return <User size={size} className={className} />;
    default: return <Sparkles size={size} className={className} />;
  }
};

// --- NATIVE MOTION REDUCTION HOOK ---
function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

// --- SHARED ACCESSIBLE LOADING SPINNER ---
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[300px] gap-3">
    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest animate-pulse">
      Jai Jinendra • Loading Experience...
    </span>
  </div>
);

// --- DYNAMIC BENEFITS FOR PREKSHA PRACTICES ---
function getSadhanaBenefits(duration: number, lang: string) {
  if (duration < 60) {
    return {
      title: lang === 'hi' ? 'प्राण-प्रेक्षा (लघु सत्र)' : 'Prana Preksha (Brief Session)',
      desc: lang === 'hi' 
        ? 'तीव्र मानसिक स्पष्टता प्रदान करता है, तत्काल उत्तेजना को शांत करता है और मन को स्थिर करता है।' 
        : 'Restores momentary emotional equilibrium, clears brain fog, and reduces immediate stress.'
    };
  } else if (duration < 300) {
    return {
      title: lang === 'hi' ? 'दीर्घ श्वास-प्रेक्षा (मध्यम सत्र)' : 'Dirgha Shvas-Preksha (Medium Session)',
      desc: lang === 'hi' 
        ? 'फेफड़ों की वायु क्षमता को बढ़ाता है, ऑक्सीजन प्रवाह में सुधार करता है और रक्तचाप को संतुलित करने में सहायक है।' 
        : 'Enhances pulmonary efficiency, optimizes oxygen circulation, and calms the autonomic nervous system.'
    };
  } else {
    return {
      title: lang === 'hi' ? 'कायोत्सर्ग ध्यान (गहन सत्र)' : 'Kayotsarga / Deep Preksha (Deep Session)',
      desc: lang === 'hi' 
        ? 'गहरे मानसिक व शारीरिक तनाव को दूर करता है, तंत्रिका तंत्र को गहन विश्राम देता है और आंतरिक ऊर्जा को सक्रिय करता है।' 
        : 'Triggers deep parasympathetic activation, releases long-held neuro-muscular tension, and enhances overall spiritual awareness.'
    };
  }
}

export default function App() {
  const knowledgeItems = useSyncKnowledgeBase();
  const { user, userData, loading, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  
  // --- SAFETY FORCE-PROCEED TIMEOUT (Requirement 2 & 4) ---
  const [forceProceed, setForceProceed] = useState(false);

  useEffect(() => {
    devLog("[App] Mounted. Initializing 3-second safety force-proceed timer.");
    const timer = setTimeout(() => {
      console.warn("[App] 3-second safety timeout triggered! Forcing proceed to render the main dashboard.");
      setForceProceed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize and persist dynamic document localization attributes
  useLanguageInit();

  // --- SWIPE GESTURE SETTINGS & PERSISTENCE ---
  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('terapanth_tab_order');
    return saved ? JSON.parse(saved) : DEFAULT_TAB_ORDER;
  });

  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showTabTooltip, setShowTabTooltip] = useState(false);
  const [isPaginationVisible, setIsPaginationVisible] = useState(true);
  const [isPaginationDismissed, setIsPaginationDismissed] = useState(false);
  const [hasInteractedWithPagination, setHasInteractedWithPagination] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('terapanth_has_interacted_pagination') === 'true';
    }
    return false;
  });
  const [showScrollMore, setShowScrollMore] = useState(true);
  const lastScrollTopRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);
  const scrollThrottleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollThrottleTimeoutRef.current) {
        clearTimeout(scrollThrottleTimeoutRef.current);
      }
    };
  }, []);

  const [swipeSensitivity, setSwipeSensitivity] = useState<number>(() => {
    const saved = localStorage.getItem('terapanth_swipe_sensitivity');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [showSwipeTutorial, setShowSwipeTutorial] = useState<boolean>(() => {
    return localStorage.getItem('terapanth_swipe_tutorial_shown') !== 'true';
  });

  const handleSwipeSensitivityChange = useCallback((val: number) => {
    setSwipeSensitivity(val);
    localStorage.setItem('terapanth_swipe_sensitivity', val.toString());
  }, []);

  const swipeConfig = useMemo(() => {
    switch (swipeSensitivity) {
      case 1: // Lowest sensitivity
        return { minDistance: 120, ratio: 3.0 };
      case 2:
        return { minDistance: 90, ratio: 2.5 };
      case 3: // Balanced default
        return { minDistance: 60, ratio: 2.0 };
      case 4:
        return { minDistance: 45, ratio: 1.5 };
      case 5: // Highest sensitivity
        return { minDistance: 30, ratio: 1.0 };
      default:
        return { minDistance: 60, ratio: 2.0 };
    }
  }, [swipeSensitivity]);

  // --- CORE UI & ROUTING STATES ---
  // Check if user has already onboarded via local storage state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Global Ctrl/Cmd + K listener for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <LazyWrapper componentKey="TerapanthOverview" />;
      case 'sadhana':
        return <LazyWrapper componentKey="SadhanaTracker" />;
      case 'panchang':
        return <LazyWrapper componentKey="SadhalaAuthAndPanchangHub" />;
      case 'gallery':
        return <LazyWrapper componentKey="GalleryTab" />;
      case 'pravachan':
        return <LazyWrapper componentKey="DailyReflectionEngineV2" />;
      default:
        return <LazyWrapper componentKey="TerapanthOverview" />;
    }
  };
  const [prevTab, setPrevTab] = useState<string>('home');
  const [direction, setDirection] = useState<number>(0);

  const shouldReduceMotion = useSystemReducedMotion();

  const tabSlideVariants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion || dir === 0 ? 0 : dir > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 380, damping: 38 },
        opacity: { duration: 0.15 }
      }
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion || dir === 0 ? 0 : dir > 0 ? -20 : 20,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 380, damping: 38 },
        opacity: { duration: 0.15 }
      }
    }),
  };

  const fadeSlideVariants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion || dir === 0 ? 0 : dir > 0 ? 45 : -45,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 28 },
        opacity: { duration: 0.35, ease: "easeOut" },
        scale: { duration: 0.35, ease: "easeOut" }
      }
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion || dir === 0 ? 0 : dir > 0 ? -45 : 45,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 28 },
        opacity: { duration: 0.25, ease: "easeIn" },
        scale: { duration: 0.25, ease: "easeIn" }
      }
    }),
  };

  const slideUpFadeVariants = {
    enter: (dir: number) => ({
      y: shouldReduceMotion ? 0 : 25,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: "spring" as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.28, ease: "easeOut" as const }
      }
    },
    exit: (dir: number) => ({
      y: shouldReduceMotion ? 0 : -20,
      opacity: 0,
      transition: {
        y: { type: "spring" as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.22, ease: "easeIn" as const }
      }
    })
  };

  const isHomeChatTransition = useMemo(() => {
    return (activeTab === 'home' && prevTab === 'chat') || (activeTab === 'chat' && prevTab === 'home');
  }, [activeTab, prevTab]);

  const isTransitioningBetweenCoreTabs = useMemo(() => {
    const coreTabs = ['home', 'chat', 'sadhana'];
    return coreTabs.includes(activeTab) && coreTabs.includes(prevTab);
  }, [activeTab, prevTab]);

  useEffect(() => {
    if (activeTab !== prevTab) {
      const prevIdx = tabOrder.indexOf(prevTab);
      const currIdx = tabOrder.indexOf(activeTab);
      if (prevIdx !== -1 && currIdx !== -1) {
        setDirection(currIdx > prevIdx ? 1 : -1);
      } else {
        setDirection(0);
      }
      setPrevTab(activeTab);
    }
  }, [activeTab, prevTab]);

  useEffect(() => {
    const isEvicted = localStorage.getItem('terapanth_hub_onboarded');
    if (!isEvicted) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (!showOnboarding) {
      const onboarded = localStorage.getItem('terapanth_hub_onboarded');
      const tourCompleted = localStorage.getItem('terapanth_hub_tour_completed');
      if (onboarded === 'true' && tourCompleted !== 'true') {
        setShowTour(true);
      }
    }
  }, [showOnboarding]);
  const [sadhanaSubTab, setSadhanaSubTab] = useState<string>("timer");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [activeArchiveNr, setActiveArchiveNr] = useState<number | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [showChaturmasRegistry, setShowChaturmasRegistry] = useState(false);
  const [showUnifiedRegistry, setShowUnifiedRegistry] = useState(false);

  // --- INTERACTIVE FEATURES STATES (TODOS / CODES) ---
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("sadhana_todos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing sadhana_todos from localStorage", e);
      }
    }
    return [
      { id: "1", text: "Navkar Mantra Chanting (जाप साधना)", completed: false },
      { id: "2", text: "Samayik Meditation - 48 mins (सामायिक साधना)", completed: false },
      { id: "3", text: "Swadhya - Spiritual Self-Study (स्वाध्याय)", completed: false },
      { id: "4", text: "Chauvihar - No food after sunset (चौविहार व्रत)", completed: false },
      { id: "5", text: "Pratikraman - Evening Ritual (प्रतिक्रमण)", completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sadhana_todos", JSON.stringify(todos));
  }, [todos]);

  const [todoInput, setTodoInput] = useState("");
  const [timelineIndex, setTimelineIndex] = useState(0);

  // --- ACCESS PREFERENCES & CONTRAST ENGINGE ---
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("app_theme");
    return (saved as "light" | "dark" | "system") || "light";
  });
  const isDarkActive = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [palette, setPalette] = useState<"default" | "sunset" | "ocean" | "forest" | "saffron" >(() => {
    const saved = localStorage.getItem("app_palette");
    return (saved as "default" | "sunset" | "ocean" | "forest" | "saffron") || "default";
  });
  const [highContrast, setHighContrast] = useState(false);
  const [kfontSize, setKfontSize] = useState(15);
  const [kfontType, setKfontType] = useState<"sans" | "serif" | "mono">("sans");
  const [fontStyleSet, setFontStyleSet] = useState<"standard" | "high-readability">("standard");

  // --- SADHANA CONTROLS ---
  const [mantraAudioCueEnabled, setMantraAudioCueEnabled] = useState(false);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState(false);
  const [spiritualSoundscape, setSpiritualSoundscape] = useState<"om" | "temple_bells" | "nature">("om");
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(false);
  const [vibrationIntensity, setVibrationIntensity] = useState<"none" | "gentle" | "pulsing" | "steady">("gentle");

  // --- GLOBAL HAPTICS PREFERENCES ---
  const [hapticButtonClicksEnabled, setHapticButtonClicksEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("haptic_button_clicks");
    return saved !== "false";
  });
  const [hapticTimerCompletionsEnabled, setHapticTimerCompletionsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("haptic_timer_completions");
    return saved !== "false";
  });

  // --- ZEN MODE FOR DEEP FOCUS ---
  const [zenMode, setZenMode] = useState<boolean>(() => {
    return localStorage.getItem('terapanth_zen_mode') === 'true';
  });

  const [zenStartTime, setZenStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('terapanth_zen_start_time');
    return saved ? parseInt(saved, 10) : null;
  });

  const [showZenReminder, setShowZenReminder] = useState<boolean>(false);
  const [zenElapsed, setZenElapsed] = useState<number>(0);

  const [zenScheduleEnabled, setZenScheduleEnabled] = useState<boolean>(() => {
    return localStorage.getItem('terapanth_zen_schedule_enabled') === 'true';
  });

  const [zenScheduleStart, setZenScheduleStart] = useState<string>(() => {
    return localStorage.getItem('terapanth_zen_schedule_start') || '21:00';
  });

  const [zenScheduleEnd, setZenScheduleEnd] = useState<string>(() => {
    return localStorage.getItem('terapanth_zen_schedule_end') || '06:00';
  });

  const [lastAutoTriggeredBlock, setLastAutoTriggeredBlock] = useState<string | null>(() => {
    return localStorage.getItem('terapanth_zen_last_auto_triggered_block');
  });

  const [zenMuteAll, setZenMuteAll] = useState<boolean>(() => {
    return localStorage.getItem('terapanth_zen_mute_all') === 'true';
  });

  const [zenStartCompletedTaskIds, setZenStartCompletedTaskIds] = useState<string[]>([]);
  const [showSadhanaSummary, setShowSadhanaSummary] = useState(false);
  const [summaryDuration, setSummaryDuration] = useState(0);
  const [summaryCompletedTasks, setSummaryCompletedTasks] = useState<Todo[]>([]);
  const [sadhanaObservation, setSadhanaObservation] = useState('');
  const [savedObservations, setSavedObservations] = useState<{date: string, observation: string, duration: number}[]>(() => {
    try {
      const saved = localStorage.getItem('preksha_meditation_observations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveSadhanaObservation = () => {
    if (!sadhanaObservation.trim()) {
      setShowSadhanaSummary(false);
      return;
    }
    const newRecord = {
      date: new Date().toLocaleDateString(),
      observation: sadhanaObservation.trim(),
      duration: summaryDuration
    };
    const updated = [newRecord, ...savedObservations];
    setSavedObservations(updated);
    localStorage.setItem('preksha_meditation_observations', JSON.stringify(updated));
    setSadhanaObservation('');
    setShowSadhanaSummary(false);
  };

  const handleZenMuteAllChange = (enabled: boolean) => {
    setZenMuteAll(enabled);
    localStorage.setItem('terapanth_zen_mute_all', String(enabled));
  };

  // --- CORE AUDIO MUTING MECHANISM ---
  useEffect(() => {
    if (zenMode && zenMuteAll) {
      // Monkeypatch HTMLAudioElement.prototype.play to prevent sound during meditation
      const originalPlay = HTMLAudioElement.prototype.play;
      HTMLAudioElement.prototype.play = function() {
        console.log("Audio play blocked during Preksha Meditation Focus (Muted Mode)");
        return Promise.resolve(); // Resolves immediately without playing sound
      };
      
      // Mark global muted state
      (window as any).__preksha_muted = true;

      return () => {
        HTMLAudioElement.prototype.play = originalPlay;
        (window as any).__preksha_muted = false;
      };
    }
  }, [zenMode, zenMuteAll]);

  const handleZenModeChange = (enabled: boolean) => {
    setZenMode(enabled);
    localStorage.setItem('terapanth_zen_mode', String(enabled));
    if (enabled) {
      const now = Date.now();
      setZenStartTime(now);
      localStorage.setItem('terapanth_zen_start_time', String(now));
      setShowZenReminder(false);
      setZenElapsed(0);

      // Snapshot initially completed tasks
      const initiallyCompleted = todos.filter(t => t.completed).map(t => t.id);
      setZenStartCompletedTaskIds(initiallyCompleted);

      // If entering Zen Mode and on a non-meditation tab, switch to sadhana for active focus
      if (activeTab !== 'sadhana' && activeTab !== 'vachan') {
        setActiveTab('sadhana');
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }

      // Proactively request browser Notification permissions
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    } else {
      // Exiting Preksha Meditation Mode -> Capture details for Sadhana Summary
      const finalDuration = zenElapsed;
      const newlyCompleted = todos.filter(t => t.completed && !zenStartCompletedTaskIds.includes(t.id));
      
      setSummaryDuration(finalDuration);
      setSummaryCompletedTasks(newlyCompleted);
      setShowSadhanaSummary(true);

      setZenStartTime(null);
      localStorage.removeItem('terapanth_zen_start_time');
      localStorage.removeItem('terapanth_zen_auto_entered_by_schedule');
      setShowZenReminder(false);
      setZenElapsed(0);
    }
  };

  // --- ZEN MODE TIMER & DND REMINDER ---
  const triggerZenNotification = () => {
    // 1. Browser push notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notificationTitle = language === 'hi' ? '🧘 ध्यान केंद्रित संदेश (DND)' : '🧘 Preksha Focus Reminder (DND)';
          const notificationOptions = {
            body: language === 'hi'
              ? 'आप पिछले ३० मिनट से अधिक समय से ध्यान मोड में हैं। अपनी साधना जारी रखें!'
              : 'You have been in Preksha Focus Mode for over 30 minutes. Take a deep breath and continue your practice!',
            silent: false,
          };
          new Notification(notificationTitle, notificationOptions);
        } catch (err) {
          console.warn("Could not fire standard browser Notification:", err);
        }
      }
    }

    // 2. Browser vibrate
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 100, 100]);
    }
  };

  useEffect(() => {
    if (!zenMode || !zenStartTime) {
      setZenElapsed(0);
      return;
    }

    // Initial run
    const elapsedMs = Date.now() - zenStartTime;
    setZenElapsed(Math.floor(elapsedMs / 1000));

    const interval = setInterval(() => {
      const currElapsedMs = Date.now() - zenStartTime;
      const elapsedSec = Math.floor(currElapsedMs / 1000);
      setZenElapsed(elapsedSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [zenMode, zenStartTime]);

  useEffect(() => {
    // 30 minutes is 1800 seconds
    const thresholdSec = 30 * 60;
    if (zenMode && zenElapsed >= thresholdSec && !showZenReminder) {
      setShowZenReminder(true);
      triggerZenNotification();
    }
  }, [zenMode, zenElapsed, showZenReminder]);

  // --- ZEN MODE AUTO-SCHEDULING LOGIC ---
  const getScheduledBlockId = (now: Date, startStr: string, endStr: string): { isInSchedule: boolean; blockId: string | null } => {
    if (!startStr || !endStr || startStr === endStr) return { isInSchedule: false, blockId: null };
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);
    
    const todayStart = new Date(now);
    todayStart.setHours(startH, startM, 0, 0);
    
    const todayEnd = new Date(now);
    todayEnd.setHours(endH, endM, 0, 0);
    
    if (startStr < endStr) {
      const isIn = now >= todayStart && now <= todayEnd;
      if (isIn) {
        const yyyymmdd = now.toISOString().split('T')[0];
        return { isInSchedule: true, blockId: `${yyyymmdd}_${startStr}` };
      }
    } else {
      if (now >= todayStart) {
        const yyyymmdd = now.toISOString().split('T')[0];
        return { isInSchedule: true, blockId: `${yyyymmdd}_${startStr}` };
      }
      if (now <= todayEnd) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yyyymmdd = yesterday.toISOString().split('T')[0];
        return { isInSchedule: true, blockId: `${yyyymmdd}_${startStr}` };
      }
    }
    return { isInSchedule: false, blockId: null };
  };

  useEffect(() => {
    if (!zenScheduleEnabled) return;

    const checkSchedule = () => {
      const now = new Date();
      const { isInSchedule, blockId } = getScheduledBlockId(now, zenScheduleStart, zenScheduleEnd);

      if (isInSchedule && blockId) {
        if (!zenMode && lastAutoTriggeredBlock !== blockId) {
          handleZenModeChange(true);
          setLastAutoTriggeredBlock(blockId);
          localStorage.setItem('terapanth_zen_last_auto_triggered_block', blockId);
          localStorage.setItem('terapanth_zen_auto_entered_by_schedule', 'true');
        }
      } else {
        const wasAutoEntered = localStorage.getItem('terapanth_zen_auto_entered_by_schedule') === 'true';
        if (zenMode && wasAutoEntered) {
          handleZenModeChange(false);
        }
        localStorage.removeItem('terapanth_zen_auto_entered_by_schedule');
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 15000); // Highly responsive 15-second check
    return () => clearInterval(interval);
  }, [zenScheduleEnabled, zenScheduleStart, zenScheduleEnd, zenMode, lastAutoTriggeredBlock]);

  const handleZenScheduleEnabledChange = (enabled: boolean) => {
    setZenScheduleEnabled(enabled);
    localStorage.setItem('terapanth_zen_schedule_enabled', String(enabled));
    if (!enabled) {
      localStorage.removeItem('terapanth_zen_auto_entered_by_schedule');
    }
  };

  const handleZenScheduleStartChange = (start: string) => {
    setZenScheduleStart(start);
    localStorage.setItem('terapanth_zen_schedule_start', start);
  };

  const handleZenScheduleEndChange = (end: string) => {
    setZenScheduleEnd(end);
    localStorage.setItem('terapanth_zen_schedule_end', end);
  };

  // --- BACKEND METADATA ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('last_sync_time') : null;
  });
  const [activeUserCount] = useState<number>(1);
  const [isFullyOnline, setIsFullyOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isFirestoreOffline, setIsFirestoreOffline] = useState<boolean>(!isFullyOnline);
  const [showNetworkToast, setShowNetworkToast] = useState(false);
  const [networkToastMessage, setNetworkToastMessage] = useState("");
  const [networkToastType, setNetworkToastType] = useState<"offline" | "online">("online");
  const [copiedLink, setCopiedLink] = useState(false);

  // --- SERVICE WORKER UPDATE STATES ---
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // --- PWA INSTALL BANNER STATES ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // --- POWER SAVER MODE EVENT LISTENER ---
  useEffect(() => {
    const applyPowerSaver = () => {
      const active = localStorage.getItem("terapanth_power_saver") === "true";
      if (active) {
        document.body.classList.add("power-saver-active");
      } else {
        document.body.classList.remove("power-saver-active");
      }
    };
    applyPowerSaver();
    window.addEventListener("power-saver-changed", applyPowerSaver);
    return () => window.removeEventListener("power-saver-changed", applyPowerSaver);
  }, []);

  // --- PWA INSTALL PROMPT EVENT LISTENER ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
      setShowInstallBanner(true);
      devLog("[PWA] beforeinstallprompt event fired, prompt stashed and banner enabled.");
    };

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      devLog("[PWA] App successfully installed! Banner hidden.");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    
    devLog("[PWA] Prompting user to install the application...");
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    devLog(`[PWA] User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, clear it
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // --- SERVICE WORKER UPDATE LISTENER ---
  useEffect(() => {
    const handleSwUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ServiceWorkerRegistration>;
      if (customEvent.detail) {
        setSwRegistration(customEvent.detail);
        setShowUpdateBanner(true);
      }
    };

    window.addEventListener('sw-update-available', handleSwUpdate);
    return () => {
      window.removeEventListener('sw-update-available', handleSwUpdate);
    };
  }, []);

  const handleUpdateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // --- SWIPE GESTURE NAVIGATION SYSTEM ---
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 1) {
      setTouchStartX(e.targetTouches[0].clientX);
      setTouchStartY(e.targetTouches[0].clientY);
      setTouchEndX(e.targetTouches[0].clientX);
      setTouchEndY(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 1) {
      setTouchEndX(e.targetTouches[0].clientX);
      setTouchEndY(e.targetTouches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchStartY === null || touchEndX === null || touchEndY === null) return;
    
    // Only allow swipe transitions for the main primary tabs
    if (!tabOrder.includes(activeTab)) return;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipeDistance = swipeConfig.minDistance; // dynamic threshold distance in px for a horizontal swipe
    const filterRatio = swipeConfig.ratio; // dynamic displacement ratio to distinguish horizontal swipe from vertical scrolling

    // Ensure horizontal displacement is significantly greater than vertical displacement
    if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffX) > Math.abs(diffY) * filterRatio) {
      const isLeftSwipe = diffX > 0;   // Swiped Left -> Next Tab
      const isRightSwipe = diffX < 0; // Swiped Right -> Previous Tab

      const currentIndex = tabOrder.indexOf(activeTab);

      if (isLeftSwipe && currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
        if (showSwipeTutorial) {
          localStorage.setItem('terapanth_swipe_tutorial_shown', 'true');
          setShowSwipeTutorial(false);
        }
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
        if (showSwipeTutorial) {
          localStorage.setItem('terapanth_swipe_tutorial_shown', 'true');
          setShowSwipeTutorial(false);
        }
      }
    }

    // Reset touch state
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchEndX(null);
    setTouchEndY(null);
  };

  const calculatePaginationVisibility = (scrollTop: number) => {
    const lastScrollTop = lastScrollTopRef.current;
    
    // Force show when at the absolute top of the scroll container
    if (scrollTop <= 10) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      setIsPaginationVisible(true);
      lastScrollTopRef.current = scrollTop;
      return;
    }
    
    // Briefly fade or hide when scrolling down, show when scrolling up
    if (scrollTop > lastScrollTop && scrollTop > 15) {
      if (isPaginationVisible) {
        setIsPaginationVisible(false);
      }
    } else {
      if (!isPaginationVisible) {
        setIsPaginationVisible(true);
      }
    }
    
    lastScrollTopRef.current = scrollTop;

    // Reset visibility (show again) when scrolling stops
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsPaginationVisible(true);
    }, 850);
  };

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    // Immediately and smoothly fade out "Scroll for more" indicator as scroll begins
    if (scrollTop > 15) {
      if (showScrollMore) {
        setShowScrollMore(false);
      }
    } else {
      if (!showScrollMore) {
        setShowScrollMore(true);
      }
    }

    // Debounce/Throttle calculating the pagination visibility state to 100ms
    const now = Date.now();
    const throttleLimit = 100;

    if (scrollThrottleTimeoutRef.current) {
      clearTimeout(scrollThrottleTimeoutRef.current);
    }

    if (now - lastScrollTimeRef.current >= throttleLimit) {
      calculatePaginationVisibility(scrollTop);
      lastScrollTimeRef.current = now;
    } else {
      scrollThrottleTimeoutRef.current = setTimeout(() => {
        calculatePaginationVisibility(scrollTop);
        lastScrollTimeRef.current = Date.now();
      }, throttleLimit - (now - lastScrollTimeRef.current));
    }
  };

  const markPaginationInteracted = useCallback(() => {
    if (!hasInteractedWithPagination) {
      setHasInteractedWithPagination(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('terapanth_has_interacted_pagination', 'true');
      }
    }
  }, [hasInteractedWithPagination]);

  const handlePrevTab = useCallback(() => {
    markPaginationInteracted();
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
  }, [activeTab, tabOrder, hasInteractedWithPagination]);

  const handleNextTab = useCallback(() => {
    markPaginationInteracted();
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
  }, [activeTab, tabOrder, hasInteractedWithPagination]);

  // --- NETWORK STATUS MONITOR ---
  useEffect(() => {
    const handleOnline = () => {
      setIsFullyOnline(true);
      setIsFirestoreOffline(false);
      setNetworkToastType("online");
      setNetworkToastMessage(
        language === 'hi'
          ? "जय जिनेन्द्र! आप पुनः ऑनलाइन हैं। डेटा स्वतः सिंक्रनाइज़ हो गया है।"
          : "Jai Jinendra! Back online. Data synchronized successfully."
      );
      setShowNetworkToast(true);
    };

    const handleOffline = () => {
      setIsFullyOnline(false);
      setIsFirestoreOffline(true);
      setNetworkToastType("offline");
      setNetworkToastMessage(
        language === 'hi'
          ? "कनेक्शन टूट गया है। आप सुरक्षित ऑफलाइन मोड में हैं।"
          : "Connection lost. Operating in secure offline mode."
      );
      setShowNetworkToast(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check current connection state
      if (!navigator.onLine) {
        handleOffline();
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [language]);

  // Auto-dismiss network toast after 5 seconds
  useEffect(() => {
    if (showNetworkToast) {
      const timer = setTimeout(() => {
        setShowNetworkToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNetworkToast]);

  // --- GLOBAL ACCESSIBILITY STYLING ---
  const appStyle = useMemo(() => {
    return {
      fontSize: `${kfontSize}px`,
      fontFamily: kfontType === "serif" ? "Georgia, serif" : kfontType === "mono" ? "monospace" : "sans-serif",
    };
  }, [kfontSize, kfontType]);

  // --- MANAGE SYSTEM THEMES ---
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem("app_theme", theme);
    if (isDarkActive) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, isDarkActive]);

  // --- MANAGE PALETTE CLASS ---
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem("app_palette", palette);
    root.classList.remove("theme-sunset", "theme-ocean", "theme-forest", "theme-saffron");
    if (palette !== "default") {
      root.classList.add(`theme-${palette}`);
    }
  }, [palette]);

  // --- MANAGE GLOBAL HAPTICS ---
  useEffect(() => {
    localStorage.setItem("haptic_button_clicks", hapticButtonClicksEnabled.toString());
    localStorage.setItem("haptic_timer_completions", hapticTimerCompletionsEnabled.toString());

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      // Store original vibrate if not stored yet
      if (!(window as any).__originalVibrate && navigator.vibrate) {
        (window as any).__originalVibrate = navigator.vibrate.bind(navigator);
      }
      
      navigator.vibrate = (pattern: any): boolean => {
        if (!(window as any).__originalVibrate) return false;
        
        const isArrayPattern = Array.isArray(pattern);
        
        // Treat array vibrations or single vibrations longer than 50ms as timer/milestone events
        let isTimerOrMilestone = isArrayPattern;
        if (!isArrayPattern && typeof pattern === 'number') {
          if (pattern > 50) {
            isTimerOrMilestone = true;
          }
        }

        if (isTimerOrMilestone) {
          if (hapticTimerCompletionsEnabled) {
            return (window as any).__originalVibrate(pattern);
          }
        } else {
          if (hapticButtonClicksEnabled) {
            return (window as any).__originalVibrate(pattern);
          }
        }
        return false;
      };
    }
  }, [hapticButtonClicksEnabled, hapticTimerCompletionsEnabled]);

  // --- FIREBASE ROLE SYNC ---
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const adminRef = doc(db, "admins", user.uid);
    const unsubscribe = onSnapshot(
      adminRef,
      (docSnap) => {
        setIsAdmin(docSnap.exists());
      },
      (error) => {
        console.warn("Admin check failed:", error.code, error.message);
        setIsAdmin(false);
      }
    );
    return unsubscribe;
  }, [user]);

  // --- DYNAMIC SADHANA STREAK STATE ---
  const [sadhanaStreak, setSadhanaStreak] = useState<number>(() => {
    return Number(localStorage.getItem('terapanth_sadhana_streak_count') || 5);
  });

  useEffect(() => {
    const handleSadhanaUpdate = () => {
      const currentStreak = Number(localStorage.getItem('terapanth_sadhana_streak_count') || 5);
      setSadhanaStreak(currentStreak);
    };

    window.addEventListener('sadhana-updated', handleSadhanaUpdate);
    window.addEventListener('sadhana-streak-completed', handleSadhanaUpdate);
    return () => {
      window.removeEventListener('sadhana-updated', handleSadhanaUpdate);
      window.removeEventListener('sadhana-streak-completed', handleSadhanaUpdate);
    };
  }, []);

  // --- COPY DEEP LINK ---
  const handleCopyDeepLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- ACTIONS ---
  const dismissSwipeTutorial = () => {
    localStorage.setItem('terapanth_swipe_tutorial_shown', 'true');
    setShowSwipeTutorial(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...tabOrder];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    
    setTabOrder(updated);
    localStorage.setItem('terapanth_tab_order', JSON.stringify(updated));
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveTab = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tabOrder.length) return;

    const updated = [...tabOrder];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    
    setTabOrder(updated);
    localStorage.setItem('terapanth_tab_order', JSON.stringify(updated));
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const resetTabOrder = () => {
    setTabOrder(DEFAULT_TAB_ORDER);
    localStorage.setItem('terapanth_tab_order', JSON.stringify(DEFAULT_TAB_ORDER));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsSynced(true);
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now);
    }, 1500);
  };

  const handleFullAccountBackup = async () => {
    try {
      // Collect all local Sadhana progress, todos, and journal data
      const todosData = localStorage.getItem("sadhana_todos") || "[]";
      const journalDraft = localStorage.getItem("spiritual_journal_draft") || "";
      const journalMood = localStorage.getItem("spiritual_journal_mood") || "";
      const journalEmotionalState = localStorage.getItem("spiritual_journal_emotional_state") || "";
      const quickNote = localStorage.getItem("sadhana_quick_note") || "";
      const dailyTasks = localStorage.getItem("terapanth_sadhana_daily_tasks") || "{}";
      const streakCount = localStorage.getItem("terapanth_sadhana_streak_count") || "0";
      const points = localStorage.getItem("terapanth_sadhana_points") || "0";
      const swadhyaHistory = localStorage.getItem("sadhana_swadhya_read_history") || "[]";
      const prekshaObservations = localStorage.getItem("preksha_meditation_observations") || "[]";

      let parsedTodos = [];
      try { parsedTodos = JSON.parse(todosData); } catch (e) { console.error(e); }

      let parsedDailyTasks = {};
      try { parsedDailyTasks = JSON.parse(dailyTasks); } catch (e) { console.error(e); }

      let parsedSwadhyaHistory = [];
      try { parsedSwadhyaHistory = JSON.parse(swadhyaHistory); } catch (e) { console.error(e); }

      let parsedPreksha = [];
      try { parsedPreksha = JSON.parse(prekshaObservations); } catch (e) { console.error(e); }

      const backupData = {
        app: "Terapanth AI Hub",
        backupVersion: "1.0.0",
        exportedAt: new Date().toISOString(),
        userEmail: user?.email || "Guest User",
        spiritualProgress: {
          sadhanaPoints: parseInt(points, 10) || 0,
          streakCount: parseInt(streakCount, 10) || 0,
          dailyTasksCompleted: parsedDailyTasks,
        },
        journalObservations: {
          currentDraft: journalDraft,
          mood: journalMood,
          emotionalState: journalEmotionalState,
          quickNote: quickNote,
          prekshaMeditationObservations: parsedPreksha,
        },
        todoList: parsedTodos,
        learningHistory: {
          swadhyaHistory: parsedSwadhyaHistory,
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terapanth_spiritual_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Backup export failed:", error);
      alert("Backup export failed. Please try again.");
    }
  };

  // --- TODO ENGINE ---
  const handleAddTodo = useCallback(() => {
    if (!todoInput.trim()) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    const newTodo: Todo = { id: Date.now().toString(), text: todoInput, completed: false };
    setTodos((prev) => [...prev, newTodo]);
    setTodoInput("");
  }, [todoInput]);

  const handleToggleTodo = useCallback((id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (loading && !forceProceed) {
    devLog("[App] Auth loading is true. Rendering full-screen LoadingScreen as initial experience gate.");
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div
      style={{
        ...appStyle,
        backgroundColor: 'var(--bg-cream)',
        // Safe luxury subtle geometric pattern instead of broken postimg URLs
        backgroundImage: isDarkActive 
          ? `radial-gradient(#2e251e 0.5px, transparent 0.5px), radial-gradient(#2e251e 0.5px, #141210 0.5px)`
          : `radial-gradient(#e6dccb 0.5px, transparent 0.5px), radial-gradient(#e6dccb 0.5px, var(--bg-cream) 0.5px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}
      className={`${activeTab === "chat" ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh] h-[100dvh] overflow-y-auto"} w-full flex flex-col relative antialiased select-none p-0 m-0 border-none outline-none transition-colors duration-300 ${
        highContrast ? "contrast-125 saturate-150" : ""
      } ${theme}`}
    >
      {/* If dark mode is active, apply a subtle dark glass layer above the texture */}
      {isDarkActive && <div className="absolute inset-0 bg-stone-950/85 pointer-events-none z-0" />}

      {/* HEADER SECTION */}
      {activeTab !== "chat" && (
        <TerapanthHeader
          theme={theme}
          toggleTheme={() => setTheme(isDarkActive ? "light" : "dark")}
          streak={sadhanaStreak}
          onRefreshClick={() => window.location.reload()}
          onThemePreferencesClick={() => setIsCustomizerOpen(true)}
          onPenClick={() => {
            setActiveTab('home');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('open-dashboard-customizer'));
            }, 100);
          }}
          onProfileClick={() => setActiveTab('profile')}
          onLoginClick={() => setIsLoginModalOpen(true)}
          zenMode={zenMode}
          zenElapsed={zenElapsed}
          activeTab={activeTab}
          onSearchClick={() => setIsSearchModalOpen(true)}
        />
      )}

      {/* CORE ROUTING SECTION */}
      <main 
        onScroll={handleMainScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
        className={`w-full flex-1 relative z-10 max-w-md mx-auto scroll-smooth p-0 m-0 border-none ${activeTab === "chat" ? "overflow-hidden flex flex-col p-0 pb-[76px]" : "overflow-y-auto px-0 m-0 border-none pb-24"}`}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">

            {/* AI SPIRITUAL CHAT TAB */}
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                variants={isHomeChatTransition ? slideUpFadeVariants : isTransitioningBetweenCoreTabs ? fadeSlideVariants : tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex flex-col overflow-hidden"
              >
                <TerapanthLightChatUI
                  onBack={() => setActiveTab("home")}
                  setActiveTab={setActiveTab}
                  setSadhanaSubTab={setSadhanaSubTab}
                  isDarkMode={isDarkActive}
                  setIsChatInputFocused={() => {}}
                  isFocusMode={false}
                  onToggleFocusMode={() => {}}
                />
              </motion.div>
            )}

            {/* SADHANA PRACTICES TAB */}
            {activeTab === "sadhana" && (
              <motion.div
                key="sadhana"
                variants={isTransitioningBetweenCoreTabs ? fadeSlideVariants : tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <SadhanaTab
                  mantraAudioCueEnabled={mantraAudioCueEnabled}
                  dailyStreak={4}
                  ambientSoundEnabled={ambientSoundEnabled}
                  vibrationIntensity={vibrationIntensity}
                  spiritualSoundscape={spiritualSoundscape}
                  setActiveTab={setActiveTab}
                  initialSubTab={sadhanaSubTab as any}
                  todos={todos}
                  setTodos={setTodos}
                  todoInput={todoInput}
                  setTodoInput={setTodoInput}
                  handleAddTodo={handleAddTodo}
                  handleToggleTodo={handleToggleTodo}
                  handleDeleteTodo={handleDeleteTodo}
                />
              </motion.div>
            )}

            {/* PANCHANG CALENDAR TAB */}
            {activeTab === "panchang" && (
              <motion.div
                key="panchang"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <PanchangSection />
              </motion.div>
            )}

            {/* PROFILE SETTINGS TAB */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <ProfileTab
                  onRequestAllPermissions={() => setIsPermissionsModalOpen(true)}
                  backgroundSyncEnabled={true}
                  onBackgroundSyncChange={() => {}}
                  syncInterval={45}
                  onSyncIntervalChange={() => {}}
                  syncHistory={[]}
                  onNavigateToNativeHub={() => setActiveTab("native_hub")}
                  onFullAccountExport={handleFullAccountBackup}
                  isExportingData={false}
                  onManualSync={handleSync}
                  lastSyncTime={lastSyncTime}
                  onNavigateToAdminDashboard={() => setActiveTab("admin_dashboard")}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                  onStartTour={() => setShowTour(true)}
                  swipeSensitivity={swipeSensitivity}
                  onSwipeSensitivityChange={handleSwipeSensitivityChange}
                />
              </motion.div>
            )}

            {/* ADMIN DASHBOARD TAB */}
            {activeTab === "admin_dashboard" && (
              <motion.div
                key="admin_dashboard"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <AdminGuard onBack={() => setActiveTab("profile")}>
                  <AdminDashboard onBackToProfile={() => setActiveTab("profile")} />
                </AdminGuard>
              </motion.div>
            )}

            {/* MONASTIC GALLERY TAB */}
            {activeTab === "gallery" && (
              <motion.div
                key="gallery"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <GalleryTab />
              </motion.div>
            )}

            {/* MEDIA CENTER TAB */}
            {activeTab === "media" && (
              <motion.div
                key="media"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <MediaCenter />
              </motion.div>
            )}

            {/* DIGITAL LIBRARY TAB */}
            {activeTab === "library" && (
              <motion.div
                key="library"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <DigitalLibrary 
                  isAdmin={isAdmin} 
                  user={user} 
                  setIsLoginModalOpen={setIsLoginModalOpen} 
                />
              </motion.div>
            )}

            {/* MARYADA QUIZ ENGINE TAB */}
            {activeTab === "quiz" && (
              <motion.div
                key="quiz"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <MaryadaQuiz />
              </motion.div>
            )}

            {/* --- EXTRA ADDITIONAL TABS (SUCH AS NAVKAR, SUVICHAR) --- */}
            {activeTab === "navkar" && (
              <motion.div
                key="navkar"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <NavkarMantra onClose={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "suvichar" && (
              <motion.div
                key="suvichar"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <DailySuvichar onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "pratikraman" && (
              <motion.div
                key="pratikraman"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <PratikramanGuide onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "places" && (
              <motion.div
                key="places"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <SacredPlacesMap onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "karma" && (
              <motion.div
                key="karma"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <KarmaTheory onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "leaderboard" && (
              <motion.div
                key="leaderboard"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <TapaLeaderboard onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "sutras" && (
              <motion.div
                key="sutras"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <SutraLibrary onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "anuvrat" && (
              <motion.div
                key="anuvrat"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <AnuvratPledge onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "journal" && (
              <motion.div
                key="journal"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <SpiritualJournal onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "paryushana" && (
              <motion.div
                key="paryushana"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <ParyushanaTab onBack={() => setActiveTab("home")} />
              </motion.div>
            )}

            {activeTab === "native_hub" && (
              <motion.div
                key="native_hub"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <TerapanthMasterHub2026 onBack={() => setActiveTab("profile")} />
              </motion.div>
            )}

            {/* ================= APP.TSX DEDUPLICATED ROUTER ================= */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                variants={isHomeChatTransition ? slideUpFadeVariants : isTransitioningBetweenCoreTabs ? fadeSlideVariants : tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <UnifiedHomeDashboard 
                  setActiveTab={setActiveTab} 
                  isDarkMode={isDarkActive} 
                  knowledgeItems={knowledgeItems} 
                  setIsLoginModalOpen={setIsLoginModalOpen} 
                />

                {/* Swipe Gesture Tutorial Overlay */}
                <AnimatePresence>
                  {showSwipeTutorial && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-orange-500/20 rounded-2xl p-5 shadow-2xl space-y-4 text-center"
                      >
                        <div className="flex justify-center">
                          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center animate-pulse">
                            <ArrowLeftRight size={28} className="animate-bounce" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 font-sans">
                            {language === 'hi' ? 'नेविगेशन गाइड (स्वाइप करें)' : 'Swipe to Navigate'}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {language === 'hi' 
                              ? 'अब आप स्क्रीन पर बाएं या दाएं स्वाइप करके आसानी से होम, चैट, साधना, पंचांग और प्रोफाइल के बीच स्विच कर सकते हैं।'
                              : 'You can now swipe left or right anywhere on the screen to switch between Home, Chat, Sadhana, Calendar, and Profile.'}
                          </p>
                        </div>

                        {/* Visual Animation of the swiping gesture */}
                        <div className="relative h-10 w-full bg-zinc-100 dark:bg-zinc-950/50 rounded-xl overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-x-4 h-[2px] bg-zinc-300 dark:bg-zinc-800" />
                          <motion.div 
                            animate={{ 
                              x: [-40, 40, -40],
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 2.5,
                              ease: "easeInOut"
                            }}
                            className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] shadow-md z-10"
                          >
                            👆
                          </motion.div>
                          <ChevronLeft className="absolute left-1.5 text-orange-500/40 animate-pulse" size={14} />
                          <ChevronRight className="absolute right-1.5 text-orange-500/40 animate-pulse" size={14} />
                        </div>

                        <button
                          onClick={dismissSwipeTutorial}
                          className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white rounded-xl transition-all duration-300 shadow-md shadow-orange-500/10 active:scale-95 cursor-pointer"
                        >
                          {language === 'hi' ? 'समझ गया (Got It!)' : 'Start Exploring'}
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Retained dynamic portals that are completely distinct */}
            {activeTab === 'audio' && (
              <motion.div
                key="audio_center"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <AudioCenter />
              </motion.div>
            )}

            {activeTab === 'shorts' && (
              <motion.div
                key="shorts"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <AgamShorts />
              </motion.div>
            )}

            {activeTab === 'dhyan' && (
              <motion.div
                key="dhyan"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <PrekshaVisualizer />
              </motion.div>
            )}

            {/* Consolidated Monastic Portal Route */}
            {activeTab === 'registry' && (
              <motion.div
                key="registry"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <UnifiedRegistry onClose={() => setActiveTab('home')} />
              </motion.div>
            )}

            {/* WIRING THE 3 MISSING NAVIGATION PATHWAYS */}
            {activeTab === 'acharya' && (
              <motion.div
                key="acharya"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <div className="p-4 max-w-md mx-auto min-h-screen pb-24 bg-transparent">
                  <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-4">Acharya Guru Parampara</h2>
                  <SaintsList />
                </div>
              </motion.div>
            )}

            {activeTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <div className="min-h-screen pb-24 bg-transparent">
                  <AiSmartFaqEngine />
                </div>
              </motion.div>
            )}

            {activeTab === 'vihar' && (
              <motion.div
                key="vihar"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <div className="min-h-screen pb-24 bg-transparent">
                  <ViharTracker />
                </div>
              </motion.div>
            )}

            {activeTab === 'vachan' && (
              <motion.div
                key="vachan"
                variants={tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <div className="min-h-screen pb-24 bg-transparent">
                  <DailyVachan />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* 3. REPAIRED BOTTOM NAV CONTROLLER FIXED BLOCKS */}
      <QuickActions 
        isOpen={showQuickActions} 
        onClose={() => setShowQuickActions(false)} 
        setActiveTab={setActiveTab} 
      />
      {!zenMode && (
        <>
          <GlobalAudioPlayer
            ambientSoundEnabled={ambientSoundEnabled}
            setAmbientSoundEnabled={setAmbientSoundEnabled}
            spiritualSoundscape={spiritualSoundscape}
            setSpiritualSoundscape={setSpiritualSoundscape}
            language={language}
          />


          {/* Reorder Modal Overlay */}
          <AnimatePresence>
            {isReorderOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-zinc-800 shadow-2xl p-6 space-y-5 text-left"
                >
                  <div>
                    <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                      <span className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg text-xs">↕️</span>
                      {language === 'hi' ? 'नेविगेशन टैब क्रम बदलें' : 'Customize Tab Order'}
                    </h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {language === 'hi' 
                        ? 'खींचकर (Drag) या ऊपर/नीचे तीरों का उपयोग करके टैब का क्रम अपनी सुविधानुसार बदलें।'
                        : 'Reorder the swipe sequence. Drag and drop the items or use the action arrows.'}
                    </p>
                  </div>

                  {/* Drag and Drop list */}
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {tabOrder.map((tabId, idx) => (
                      <div
                        key={tabId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border rounded-2xl transition-all cursor-grab active:cursor-grabbing ${
                          draggedIndex === idx 
                            ? "border-orange-500 bg-orange-500/5 opacity-50 shadow-md" 
                            : "border-black/[0.04] dark:border-zinc-800 hover:border-orange-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GripVertical size={14} className="text-zinc-400 dark:text-zinc-600" />
                          <div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {getTabLabel(tabId, language)}
                            </span>
                            <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                              ID: {tabId}
                            </span>
                          </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => moveTab(idx, 'up')}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={12} className="stroke-[2.5]" />
                          </button>
                          <button
                            disabled={idx === tabOrder.length - 1}
                            onClick={() => moveTab(idx, 'down')}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={12} className="stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={resetTabOrder}
                      className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {language === 'hi' ? 'मूल क्रम (Reset)' : 'Reset Default'}
                    </button>
                    <button
                      onClick={() => setIsReorderOpen(false)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 transition-all cursor-pointer"
                    >
                      {language === 'hi' ? 'सहेजें (Done)' : 'Done'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Subtle "Scroll for more" indicator */}
          <AnimatePresence>
            {showScrollMore && activeTab !== "chat" && (
              <motion.div
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 10, x: "-50%" }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-20 left-1/2 z-40 pointer-events-none flex flex-col items-center gap-1 bg-amber-500/90 text-white px-4 py-1.5 rounded-full shadow-lg border border-white/20 text-[9px] font-black tracking-widest uppercase"
              >
                <div className="flex items-center gap-1.5">
                  <span>{language === 'hi' ? 'अधिक जानकारी के लिए नीचे स्क्रॉल करें' : 'Scroll for more'}</span>
                  <ChevronDown size={10} className="animate-bounce stroke-[3]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <TerapanthFooterNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            language={language}
            isPaginationVisible={isPaginationVisible}
          />
        </>
      )}

      {/* ZEN MODE FLOATING DISMISSAL PILL */}
      <AnimatePresence>
        {zenMode && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] px-2">
            <motion.div 
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 180 }}
              className="bg-zinc-900/95 dark:bg-black/95 backdrop-blur-md text-stone-150 px-4 py-2.5 rounded-full border border-orange-500/30 flex items-center justify-between gap-3 shadow-2xl shadow-orange-500/10 w-full"
            >
              <div className="flex items-center gap-2">
                <span className="text-orange-500 animate-pulse text-sm">🧘</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest font-sans text-stone-100">
                    {language === 'hi' ? 'ध्यान मोड' : 'Preksha Focus'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">
                    {Math.floor(zenElapsed / 60)}:{String(zenElapsed % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Simulation Button for Testing */}
                <button
                  onClick={() => {
                    const thirtyMinMs = 30 * 60 * 1000;
                    const newStartTime = Date.now() - (thirtyMinMs + 2000);
                    setZenStartTime(newStartTime);
                    localStorage.setItem('terapanth_zen_start_time', String(newStartTime));
                    setZenElapsed(30 * 60 + 2);
                  }}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[8px] font-bold uppercase tracking-wider text-orange-400 rounded-lg transition-all border border-orange-500/10 cursor-pointer"
                  title="Simulate 30 Minutes"
                >
                  ⏱️ {language === 'hi' ? 'परीक्षण' : 'Test 30m'}
                </button>

                <button
                  onClick={() => handleZenModeChange(false)}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-[9px] font-extrabold uppercase tracking-wider text-white rounded-full transition-all duration-300 shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
                >
                  {language === 'hi' ? 'बाहर निकलें' : 'Exit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ZEN MODE 30-MIN REMINDER TOAST / OVERLAY */}
      <AnimatePresence>
        {zenMode && showZenReminder && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-zinc-950/98 text-stone-150 border border-orange-500/40 p-6 rounded-3xl shadow-2xl text-center space-y-4 backdrop-blur-md"
            >
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-orange-500/15 text-orange-500 rounded-full flex items-center justify-center border border-orange-500/30 animate-pulse">
                  <span className="text-xl">🧘</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-black uppercase tracking-widest text-orange-500">
                  {language === 'hi' ? 'साधना अनुस्मारक (DND)' : 'Preksha Focus Reminder (DND)'}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                  {language === 'hi'
                    ? 'आप पिछले ३० मिनट से अधिक समय से ध्यान मोड में हैं। अपनी पवित्र साधना जारी रखें!'
                    : 'You have been in Preksha Focus Mode for over 30 minutes. Take a deep, peaceful breath and continue your practice!'}
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowZenReminder(false)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
                >
                  {language === 'hi' ? 'साधना जारी रखें' : 'Continue Sadhana'}
                </button>
                <button
                  onClick={() => {
                    setShowZenReminder(false);
                    handleZenModeChange(false);
                  }}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  {language === 'hi' ? 'समाप्त करें' : 'Exit Mode'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREKSHA MEDITATION SADHANA SUMMARY SCREEN */}
      <AnimatePresence>
        {showSadhanaSummary && (
          <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-stone-900 border border-orange-500/30 p-6 rounded-3xl shadow-2xl text-center space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Spiritual Icon Badge */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-orange-600/20 to-amber-500/20 text-orange-500 rounded-full flex items-center justify-center border border-orange-500/30 shadow-lg shadow-orange-500/5">
                  <Award size={28} className="text-orange-500 animate-pulse" />
                </div>
              </div>

              {/* Title & Theme */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 font-mono">
                  {language === 'hi' ? 'साधना संपन्न' : 'Sadhana Completed'}
                </span>
                <h3 className="text-lg font-black text-white tracking-wide">
                  {language === 'hi' ? 'प्रेक्षा ध्यान सारांश' : 'Preksha Sadhana Summary'}
                </h3>
              </div>

              {/* Duration Card */}
              <div className="bg-stone-950/50 p-4 rounded-2xl border border-white/[0.03] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                  {language === 'hi' ? 'कुल ध्यान समय' : 'Total Duration'}
                </span>
                <div className="text-2xl font-black text-orange-400 font-mono">
                  {Math.floor(summaryDuration / 60)}m {summaryDuration % 60}s
                </div>
              </div>

              {/* Dynamic Preksha Benefits Section */}
              {(() => {
                const benefits = getSadhanaBenefits(summaryDuration, language);
                return (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-2xl text-left space-y-1">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                      ✨ {language === 'hi' ? 'अभ्यास के वैज्ञानिक लाभ' : 'Practice Health Benefits'}
                    </span>
                    <h4 className="text-xs font-black text-white">{benefits.title}</h4>
                    <p className="text-[10px] text-stone-300 font-medium leading-relaxed">{benefits.desc}</p>
                  </div>
                );
              })()}

              {/* Completed Tasks section */}
              <div className="space-y-2.5 text-left">
                <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-black text-center">
                  {language === 'hi' ? 'सत्र के दौरान पूरे किए गए कार्य' : 'Tasks Completed During Session'}
                </span>

                {summaryCompletedTasks.length > 0 ? (
                  <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                    {summaryCompletedTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-start gap-3 p-2.5 bg-orange-500/5 border border-orange-500/10 rounded-xl"
                      >
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                          <Check size={10} className="stroke-[3]" />
                        </div>
                        <span className="text-xs text-stone-200 font-semibold leading-normal">
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 text-center italic bg-white/[0.01] border border-white/[0.02] p-4 rounded-xl leading-relaxed">
                    {language === 'hi'
                      ? '"ध्यान आत्मा को शुद्ध करने और गहरी आत्म-जागरूकता प्राप्त करने की प्रक्रिया है।"- आचार्य श्री महाप्रज्ञ'
                      : '"Meditation is the purification of emotions and the path to ultimate self-realization." - Acharya Shri Mahapragya'}
                  </p>
                )}
              </div>

              {/* State of Mind Observation Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-black">
                  📝 {language === 'hi' ? 'ध्यान के अनुभव / अंतर्दृष्टि' : 'Log State of Mind / Insights'}
                </label>
                <textarea
                  value={sadhanaObservation}
                  onChange={(e) => setSadhanaObservation(e.target.value)}
                  placeholder={language === 'hi' ? 'अपनी मानसिक स्थिति या अनुभव दर्ज करें...' : 'How do you feel? Capture your post-meditation state...'}
                  rows={2}
                  className="w-full text-xs bg-stone-950/50 border border-white/5 rounded-xl p-2.5 text-white placeholder-stone-500 focus:outline-none focus:border-orange-500/50 resize-none font-medium leading-normal"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                  handleSaveSadhanaObservation();
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer active:scale-95 uppercase tracking-widest"
              >
                {language === 'hi' ? 'शुभकामनाएं' : 'Jai Jinendra • Close'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBTLE NETWORK STATUS TOAST */}
      <AnimatePresence>
        {showNetworkToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[84px] left-4 right-4 md:left-auto md:right-4 md:w-80 z-40"
          >
            <div className={`px-3 py-2 rounded-xl shadow-xl flex items-center justify-between border backdrop-blur-md ${
              networkToastType === "offline"
                ? "bg-stone-900/95 border-red-500/30 text-white"
                : "bg-emerald-950/95 border-emerald-500/30 text-white"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  networkToastType === "offline" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {networkToastType === "offline" ? <WifiOff size={14} className="animate-pulse" /> : <Wifi size={14} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[11px] font-semibold tracking-wide truncate">
                    {networkToastMessage}
                  </p>
                  {lastSyncTime && (
                    <p className="text-[9px] text-zinc-400 font-medium truncate">
                      {language === 'hi'
                        ? `अंतिम सिंक्रोनाइज़ेशन: ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : `Last synced: ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowNetworkToast(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white shrink-0"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SERVICE WORKER UPDATE BANNER */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[84px] left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="p-4 rounded-xl shadow-xl flex flex-col gap-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 border border-orange-400/40 text-white shadow-xl shadow-orange-600/15">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <span className="text-white text-base">✨</span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {language === 'hi' ? 'नया संस्करण उपलब्ध है' : 'New Version Available'}
                    </h4>
                    <p className="text-[11px] text-orange-50 mt-1 leading-relaxed">
                      {language === 'hi' 
                        ? 'नवीनतम आध्यात्मिक सुविधाओं और सुधारों का लाभ उठाने के लिए अभी अपडेट करें।' 
                        : 'Update now to get the latest spiritual features and stability improvements.'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowUpdateBanner(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors text-orange-100 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUpdateBanner(false)}
                  className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-orange-100 hover:text-white transition-colors"
                >
                  {language === 'hi' ? 'बाद में' : 'Later'}
                </button>
                <button
                  onClick={handleUpdateApp}
                  className="px-4 py-1.5 bg-white text-orange-600 hover:bg-orange-50 active:scale-95 font-extrabold uppercase tracking-widest text-[10px] rounded-lg transition-all duration-300 shadow-md"
                >
                  {language === 'hi' ? 'अभी अपडेट करें' : 'Update Now'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA INSTALL BANNER */}
      <AnimatePresence>
        {showInstallBanner && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed ${showUpdateBanner ? "bottom-[230px]" : "bottom-[84px]"} left-4 right-4 md:left-auto md:right-4 md:w-96 z-50`}
          >
            <div className="p-4 rounded-2xl shadow-xl flex flex-col gap-3 bg-[#7A1F2B] border border-[#A33A4A]/40 text-white shadow-xl shadow-[#7A1F2B]/20" style={{ background: 'linear-gradient(135deg, #7A1F2B 0%, #5A1620 100%)' }}>
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <span className="text-white text-base">✨</span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}
                    </h4>
                    <p className="text-[11px] text-red-100 mt-1 leading-relaxed">
                      {language === 'hi' 
                        ? 'आसान पहुंच और त्वरित आध्यात्मिक अनुभव के लिए तेरापंथ एआई हब को अपनी होमस्क्रीन पर जोड़ें।' 
                        : 'Add Terapanth AI Hub to your homescreen for instant, offline-friendly access.'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInstallBanner(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors text-red-200 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-red-200 hover:text-white transition-colors"
                >
                  {language === 'hi' ? 'बाद में' : 'Later'}
                </button>
                <button
                  onClick={handleInstallApp}
                  className="px-4 py-1.5 bg-white text-[#7A1F2B] hover:bg-stone-100 active:scale-95 font-extrabold uppercase tracking-widest text-[10px] rounded-lg transition-all duration-300 shadow-md flex items-center gap-1.5"
                >
                  <CloudDownload size={12} />
                  {language === 'hi' ? 'इंस्टॉल करें' : 'Install'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BUTTONS - RIGHT SIDE STACK (Only show if NOT on chat tab and NOT in Zen Mode) */}
      {activeTab !== 'chat' && !zenMode && (
        <div className="fixed bottom-[138px] right-4 z-[99] flex flex-col gap-3">
          {/* Quick Actions trigger */}
          <button 
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all bg-[#7A1F2B] hover:bg-[#5A1620] active:scale-95 ${
              showQuickActions ? 'rotate-90' : ''
            }`}
          >
            {showQuickActions ? <X size={24} /> : <Plus size={24} />}
          </button>
        </div>
      )}

      {/* --- ALL ACCESS MODAL LAYERS --- */}
      <Suspense fallback={null}>
        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          knowledgeItems={knowledgeItems}
          isDarkMode={isDarkActive}
          setActiveTab={setActiveTab}
        />

        {/* Login Screen Modal */}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

        {/* Theme customization Modal */}
        <ThemeCustomizer
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          theme={theme}
          onThemeChange={setTheme}
          palette={palette}
          onPaletteChange={setPalette}
          mantraAudioCueEnabled={mantraAudioCueEnabled}
          onMantraAudioCueChange={setMantraAudioCueEnabled}
          ambientSoundEnabled={ambientSoundEnabled}
          onAmbientSoundChange={setAmbientSoundEnabled}
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
          autoArchiveEnabled={autoArchiveEnabled}
          onAutoArchiveChange={setAutoArchiveEnabled}
          vibrationIntensity={vibrationIntensity}
          onVibrationIntensityChange={setVibrationIntensity}
          spiritualSoundscape={spiritualSoundscape}
          onSpiritualSoundscapeChange={setSpiritualSoundscape}
          kfontSize={kfontSize}
          onKfontSizeChange={setKfontSize}
          kfontType={kfontType}
          onKfontTypeChange={setKfontType}
          fontStyleSet={fontStyleSet}
          onFontStyleSetChange={setFontStyleSet}
          zenMode={zenMode}
          onZenModeChange={handleZenModeChange}
          zenScheduleEnabled={zenScheduleEnabled}
          onZenScheduleEnabledChange={handleZenScheduleEnabledChange}
          zenScheduleStart={zenScheduleStart}
          onZenScheduleStartChange={handleZenScheduleStartChange}
          zenScheduleEnd={zenScheduleEnd}
          onZenScheduleEndChange={handleZenScheduleEndChange}
          zenMuteAll={zenMuteAll}
          onZenMuteAllChange={handleZenMuteAllChange}
          hapticButtonClicksEnabled={hapticButtonClicksEnabled}
          onHapticButtonClicksChange={setHapticButtonClicksEnabled}
          hapticTimerCompletionsEnabled={hapticTimerCompletionsEnabled}
          onHapticTimerCompletionsChange={setHapticTimerCompletionsEnabled}
        />


        {/* Permissions Management Modal */}
        <UnifiedPermissionsModal isOpen={isPermissionsModalOpen} onClose={() => setIsPermissionsModalOpen(false)} />

        {/* Chaturmas and General registries */}
        {showChaturmasRegistry && <ChaturmasRegistry onClose={() => setShowChaturmasRegistry(false)} />}
        {showUnifiedRegistry && <UnifiedRegistry onClose={() => setShowUnifiedRegistry(false)} />}
      </Suspense>

      {/* App Tour Onboarding Component */}
      {showTour && (
        <AppTour
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          onTourComplete={() => setShowTour(false)}
        />
      )}
    </div>
  );
}
