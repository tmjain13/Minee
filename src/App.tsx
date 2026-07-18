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
} from "react";
import {
  Sun,
  Moon,
  Monitor,
  PenTool,
  Check,
  X,
  Loader2,
  RefreshCw,
  CloudDownload,
  Sparkles,
  Link,
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen,
  Plus,
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

const tabOrder = ['home', 'chat', 'sadhana', 'panchang', 'profile'];

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

  // --- CORE UI & ROUTING STATES ---
  // Check if user has already onboarded via local storage state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');

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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const [timelineIndex, setTimelineIndex] = useState(0);

  // --- ACCESS PREFERENCES & CONTRAST ENGINGE ---
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("app_theme");
    return (saved as "light" | "dark" | "system") || "system";
  });
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

  // --- ZEN MODE FOR DEEP FOCUS ---
  const [zenMode, setZenMode] = useState<boolean>(() => {
    return localStorage.getItem('terapanth_zen_mode') === 'true';
  });

  const handleZenModeChange = (enabled: boolean) => {
    setZenMode(enabled);
    localStorage.setItem('terapanth_zen_mode', String(enabled));
    if (enabled) {
      // If entering Zen Mode and on a non-meditation tab, switch to sadhana for active focus
      if (activeTab !== 'sadhana' && activeTab !== 'vachan') {
        setActiveTab('sadhana');
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
    }
  };

  // --- BACKEND METADATA ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
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
    const minSwipeDistance = 45; // threshold distance in px for a horizontal swipe

    // Ensure horizontal displacement is significantly greater than vertical displacement (e.g., ratio of 1.5)
    // to distinguish horizontal swipe from vertical scrolling.
    if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      const isLeftSwipe = diffX > 0;   // Swiped Left -> Next Tab
      const isRightSwipe = diffX < 0; // Swiped Right -> Previous Tab

      const currentIndex = tabOrder.indexOf(activeTab);

      if (isLeftSwipe && currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    }

    // Reset touch state
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchEndX(null);
    setTouchEndY(null);
  };

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
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // --- MANAGE PALETTE CLASS ---
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem("app_palette", palette);
    root.classList.remove("theme-sunset", "theme-ocean", "theme-forest", "theme-saffron");
    if (palette !== "default") {
      root.classList.add(`theme-${palette}`);
    }
  }, [palette]);

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
  const handleSync = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsSynced(true);
      setLastSyncTime(new Date().toISOString());
    }, 1500);
  };

  const handleFullAccountBackup = async () => {
    alert("History backup requested successfully.");
  };

  // --- TODO ENGINE ---
  const handleAddTodo = () => {
    if (!todoInput.trim()) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    const newTodo: Todo = { id: Date.now().toString(), text: todoInput, completed: false };
    setTodos((prev) => [...prev, newTodo]);
    setTodoInput("");
  };

  const handleToggleTodo = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

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
        backgroundColor: '#e9dbdb',
        // Safe luxury subtle geometric pattern instead of broken postimg URLs
        backgroundImage: theme === 'dark' 
          ? `radial-gradient(#2e251e 0.5px, transparent 0.5px), radial-gradient(#2e251e 0.5px, #141210 0.5px)`
          : `radial-gradient(#e6dccb 0.5px, transparent 0.5px), radial-gradient(#e6dccb 0.5px, #e9dbdb 0.5px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}
      className={`${activeTab === "chat" ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh] h-[100dvh] overflow-y-auto"} w-full flex flex-col relative antialiased select-none p-0 m-0 border-none outline-none transition-colors duration-300 ${
        highContrast ? "contrast-125 saturate-150" : ""
      } ${theme}`}
    >
      {/* If dark mode is active, apply a subtle dark glass layer above the texture */}
      {theme === 'dark' && <div className="absolute inset-0 bg-stone-950/85 pointer-events-none z-0" />}

      {/* Decorative Atmosphere Filter */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />

      {/* Dynamic Watermark of Flower patterns, Mt. Fuji, and Cherry Blossoms 🌸 */}
      <div className="absolute inset-x-0 bottom-24 top-24 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <svg viewBox="0 0 400 400" className="w-[340px] h-[340px] text-orange-600 dark:text-amber-500 opacity-[0.06] dark:opacity-[0.03] fill-none stroke-current" strokeWidth="1.5">
          {/* Concentric outer geometric flower/mandala circles */}
          <circle cx="200" cy="200" r="185" strokeDasharray="3 6" />
          <circle cx="200" cy="200" r="165" />
          
          {/* Floral Petals radiating out (representing traditional flower pattern / flower mandala) */}
          <g transform="translate(200, 200)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
              <path 
                key={angle} 
                d="M 0 0 C -12 -35, 12 -35, 0 0" 
                transform={`rotate(${angle}) translate(0, -115)`} 
                className="opacity-60"
              />
            ))}
            {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
              <circle
                key={angle}
                cx="0"
                cy="-155"
                r="3.5"
                transform={`rotate(${angle})`}
                className="fill-current opacity-40"
              />
            ))}
          </g>

          {/* Majestic Mountain Fuji Peak Silhouette in lower center */}
          <g transform="translate(80, 140)">
            <path 
              d="M 10 180 Q 90 150, 110 50 Q 115 35, 120 35 L 130 35 Q 135 35, 140 50 Q 160 150, 240 180 Z" 
              strokeWidth="2" 
            />
            {/* Fuji Snow Cap */}
            <path 
              d="M 94 95 Q 110 108, 120 98 Q 128 112, 138 102 Q 148 110, 153 95 L 130 35 L 120 35 Z" 
              className="fill-current opacity-25" 
              strokeWidth="1.5"
            />
          </g>

          {/* Graceful Cherry Blossom 🌸 Blooms & Falling Petals */}
          {/* Sakura Bloom 1: Top Left */}
          <g transform="translate(100, 90) scale(0.85)">
            <path d="M 0 0 C -12 -24, 12 -24, 0 0 M 0 0 C 24 -12, 24 12, 0 0 M 0 0 C 12 24, -12 24, 0 0 M 0 0 C -24 12, -24 -12, 0 0" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" className="fill-current" />
          </g>
          {/* Sakura Bloom 2: Top Right */}
          <g transform="translate(300, 110) scale(0.95)">
            <path d="M 0 0 C -12 -24, 12 -24, 0 0 M 0 0 C 24 -12, 24 12, 0 0 M 0 0 C 12 24, -12 24, 0 0 M 0 0 C -24 12, -24 -12, 0 0" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" className="fill-current" />
          </g>
          {/* Falling Sakura Petals around Mount Fuji */}
          <path d="M 140,115 C 135,105 145,100 150,110 C 155,120 145,125 140,115 Z" className="fill-current opacity-40" />
          <path d="M 270,220 C 265,210 275,205 280,215 C 285,225 275,230 270,220 Z" className="fill-current opacity-45" />
          <path d="M 60,200 C 55,190 65,185 70,195 C 75,205 65,210 60,200 Z" className="fill-current opacity-30" />
          <path d="M 220,90 C 215,80 225,75 230,85 C 235,95 225,100 220,90 Z" className="fill-current opacity-35" />
        </svg>
      </div>

      {/* HEADER SECTION */}
      {activeTab !== "chat" && (
        <TerapanthHeader
          theme={theme}
          toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
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
        />
      )}

      {/* CORE ROUTING SECTION */}
      <main 
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
                variants={isTransitioningBetweenCoreTabs ? fadeSlideVariants : tabSlideVariants}
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
                  isDarkMode={theme === "dark"}
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
                <DigitalLibrary isAdmin={isAdmin} />
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
                variants={isTransitioningBetweenCoreTabs ? fadeSlideVariants : tabSlideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <UnifiedHomeDashboard 
                  setActiveTab={setActiveTab} 
                  isDarkMode={theme === "dark"} 
                  knowledgeItems={knowledgeItems} 
                  setIsLoginModalOpen={setIsLoginModalOpen} 
                />
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
          <TerapanthFooterNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            language={language}
          />
        </>
      )}

      {/* ZEN MODE FLOATING DISMISSAL PILL */}
      <AnimatePresence>
        {zenMode && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[280px] px-2">
            <motion.div 
              initial={{ y: 60, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: 40, x: "-50%", opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 180 }}
              className="fixed bottom-5 left-1/2 bg-zinc-900/95 dark:bg-black/95 backdrop-blur-md text-stone-150 px-4 py-2 rounded-full border border-orange-500/30 flex items-center justify-between gap-4 shadow-2xl shadow-orange-500/10 w-[260px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-orange-500 animate-pulse text-sm">🧘</span>
                <span className="text-[10px] font-black uppercase tracking-widest font-sans text-stone-100">
                  {language === 'hi' ? 'ध्यान मोड' : 'Zen Focus'}
                </span>
              </div>
              <button
                onClick={() => handleZenModeChange(false)}
                className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-[9px] font-extrabold uppercase tracking-wider text-white rounded-full transition-all duration-300 shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
              >
                {language === 'hi' ? 'बाहर निकलें' : 'Exit'}
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
            className="fixed bottom-[84px] left-4 right-4 md:left-auto md:right-4 md:w-96 z-40"
          >
            <div className={`p-4 rounded-xl shadow-xl flex items-center justify-between border ${
              networkToastType === "offline"
                ? "bg-stone-900 border-red-500/30 text-white"
                : "bg-emerald-950 border-emerald-500/30 text-white"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  networkToastType === "offline" ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                }`} />
                <p className="text-xs font-medium tracking-wide">
                  {networkToastMessage}
                </p>
              </div>
              <button 
                onClick={() => setShowNetworkToast(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X size={14} />
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
            <div className="p-4 rounded-xl shadow-xl flex flex-col gap-3 bg-stone-900 border border-orange-500/30 text-white">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <span className="text-orange-500 text-base">✨</span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      {language === 'hi' ? 'नया संस्करण उपलब्ध है' : 'New Version Available'}
                    </h4>
                    <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                      {language === 'hi' 
                        ? 'नवीनतम आध्यात्मिक सुविधाओं और सुधारों का लाभ उठाने के लिए अभी अपडेट करें।' 
                        : 'Update now to get the latest spiritual features and stability improvements.'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowUpdateBanner(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUpdateBanner(false)}
                  className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400 hover:text-white transition-colors"
                >
                  {language === 'hi' ? 'बाद में' : 'Later'}
                </button>
                <button
                  onClick={handleUpdateApp}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-lg transition-all duration-300 shadow-md shadow-orange-500/20"
                >
                  {language === 'hi' ? 'अभी अपडेट करें' : 'Update Now'}
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
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 hover:brightness-105 active:scale-95 ${
              showQuickActions ? 'rotate-90' : ''
            }`}
          >
            {showQuickActions ? <X size={24} /> : <Plus size={24} />}
          </button>
        </div>
      )}

      {/* --- ALL ACCESS MODAL LAYERS --- */}
      <Suspense fallback={null}>
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
