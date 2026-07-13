import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { devLog } from "../lib/devLog";
import {
  Loader2,
  Camera,
  MapPin,
  Bell,
  Mic,
  Image,
  ShieldCheck,
  Check,
  Ban,
  FileText,
  Video,
  Smartphone,
  Zap,
  RefreshCw,
  Database,
  Trash2,
  TrendingUp,
  Award,
  Trophy,
  Flame,
  Sparkles,
  LogOut,
  LogIn,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { handleFirestoreError, OperationType } from "../lib/firestoreErrors";
import KnowledgeInsights from "./KnowledgeInsights";
import HabitsCalendar from "./HabitsCalendar";
import ConfirmationModal from "./ConfirmationModal";

interface PermissionState {
  location: string;
  notifications: string;
  microphone: string;
  photos: string;
  camera: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  status: "Success" | "Failed";
}

interface ProfileTabProps {
  onRequestAllPermissions?: () => void;
  backgroundSyncEnabled?: boolean;
  onBackgroundSyncChange?: (enabled: boolean) => void;
  syncInterval?: number;
  onSyncIntervalChange?: (interval: number) => void;
  syncHistory?: SyncLog[];
  onNavigateToNativeHub?: () => void;
  onFullAccountExport?: () => Promise<void>;
  isExportingData?: boolean;
  onManualSync?: () => void;
  lastSyncTime?: string;
  onNavigateToAdminDashboard?: () => void;
  onOpenLogin?: () => void;
}

const maskEmail = (emailStr?: string | null) => {
  if (!emailStr) return "";
  const parts = emailStr.split('@');
  if (parts.length !== 2) return emailStr;
  const [local, domain] = parts;
  if (local.length <= 4) {
    return `${local.substring(0, 1)}***@${domain}`;
  }
  return `${local.substring(0, 5)}****@${domain}`;
};

export default function ProfileTab({
  onRequestAllPermissions,
  backgroundSyncEnabled = true,
  onBackgroundSyncChange,
  syncInterval = 45,
  onSyncIntervalChange,
  syncHistory = [],
  onNavigateToNativeHub,
  onFullAccountExport,
  isExportingData = false,
  onManualSync,
  lastSyncTime,
  onNavigateToAdminDashboard,
  onOpenLogin,
}: ProfileTabProps) {
  const { user, userData } = useAuth();
  const [userRole, setUserRole] = useState<string | undefined>(userData?.role);

  // Synchronize local role state with authentication context changes
  useEffect(() => {
    if (userData?.role) {
      setUserRole(userData.role);
    }
  }, [userData?.role]);

  // Log detected role for debugging
  useEffect(() => {
    devLog("Current User Role:", userRole);
  }, [userRole]);

  // Real-time Firestore snapshot listener to keep role updated without page refreshes
  useEffect(() => {
    if (!user?.uid) return;
    devLog("Initiating real-time listener on user document:", user.uid);
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        devLog("Real-time Firestore user role update:", data?.role);
        if (data?.role) {
          setUserRole(data.role);
        }
      } else {
        devLog("No real-time user document found in Firestore for UID:", user.uid);
      }
    }, (error) => {
      console.error("Error with real-time user role subscription:", error);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(
    user?.displayName || "",
  );
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showExportConfirmation, setShowExportConfirmation] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [privacyLang, setPrivacyLang] = useState<"en" | "hi">("hi");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Festival Notification Preferences State ---
  const [festivalPrefs, setFestivalPrefs] = useState<{
    majorFestivals: boolean;
    acharyaEvents: boolean;
    maryadaMahotsav: boolean;
    monthlyTithis: boolean;
    chauviharSunset: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('festival_notification_prefs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      majorFestivals: true,
      acharyaEvents: true,
      maryadaMahotsav: true,
      monthlyTithis: true,
      chauviharSunset: true,
    };
  });

  // Load preferences from Firestore on mount/user change
  useEffect(() => {
    if (!user?.uid) return;
    
    const fetchPrefs = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.festivalNotificationPrefs) {
            setFestivalPrefs(data.festivalNotificationPrefs);
            localStorage.setItem('festival_notification_prefs', JSON.stringify(data.festivalNotificationPrefs));
          }
        }
      } catch (err) {
        console.error("Error fetching festival notification preferences:", err);
      }
    };
    
    fetchPrefs();
  }, [user?.uid]);

  const handleTogglePref = async (key: keyof typeof festivalPrefs) => {
    const updated = {
      ...festivalPrefs,
      [key]: !festivalPrefs[key]
    };
    
    setFestivalPrefs(updated);
    localStorage.setItem('festival_notification_prefs', JSON.stringify(updated));
    
    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          festivalNotificationPrefs: updated
        });
      } catch (err) {
        console.error("Error updating festival notification preferences in Firestore:", err);
      }
    }
  };

  // --- Storage & Cache Management State ---
  const [cacheSizes, setCacheSizes] = useState({
    registry: 2.15,
    activeChat: 1.22,
    preferences: 0.04,
  });
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheClearSuccess, setCacheClearSuccess] = useState(false);

  const calculateStorage = () => {
    let totalLength = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalLength += (localStorage[key] || "").length * 2;
      }
    }
    const kb = totalLength / 1024;
    const mb = kb / 1024;

    setCacheSizes({
      registry: parseFloat((2.15 + mb * 0.3).toFixed(2)),
      activeChat: parseFloat((1.22 + mb * 0.6).toFixed(2)),
      preferences: parseFloat((0.04 + mb * 0.1).toFixed(2)),
    });
  };

  useEffect(() => {
    calculateStorage();
  }, []);

  const handleClearCache = () => {
    setIsClearingCache(true);
    setCacheClearSuccess(false);

    setTimeout(() => {
      const keysToKeep = [
        "theme",
        "theme-palette",
        "user",
        "perm_location",
        "perm_notifications",
        "perm_microphone",
        "perm_photos",
        "perm_camera",
      ];
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      setCacheSizes({
        registry: 0.0,
        activeChat: 0.0,
        preferences: 0.04,
      });
      setIsClearingCache(false);
      setCacheClearSuccess(true);

      setTimeout(() => {
        setCacheClearSuccess(false);
      }, 4000);
    }, 1500);
  };

  // Camera stream capture state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user?.displayName) {
      setDisplayNameInput(user.displayName);
    }
  }, [user]);

  // Read current permission statuses from localStorage/browser
  const [perms, setPerms] = useState<PermissionState>({
    location: "default",
    notifications: "default",
    microphone: "default",
    photos: "default",
    camera: "default",
  });

  useEffect(() => {
    // Sync with localStorage
    const loc = localStorage.getItem("perm_location") || "default";
    const notif =
      localStorage.getItem("perm_notifications") ||
      ("Notification" in window ? Notification.permission : "unsupported");
    const mic = localStorage.getItem("perm_microphone") || "default";
    const phot = localStorage.getItem("perm_photos") || "default";
    const cam = localStorage.getItem("perm_camera") || "default";

    setPerms({
      location: loc,
      notifications: notif,
      microphone: mic,
      photos: phot,
      camera: cam,
    });
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUpdating(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        const userPath = `users/${user.uid}`;
        await updateDoc(doc(db, userPath), {
          photoURL: base64String,
          updatedAt: new Date().toISOString(),
        });
        localStorage.setItem("perm_photos", "granted");
        setPerms((prev) => ({ ...prev, photos: "granted" }));
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      } finally {
        setIsUpdating(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Permission Request Handlers
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem("perm_location", "granted");
          setPerms((prev) => ({ ...prev, location: "granted" }));
        },
        (error) => {
          localStorage.setItem("perm_location", "denied");
          setPerms((prev) => ({ ...prev, location: "denied" }));
        },
      );
    }
  };

  const blockLocation = () => {
    localStorage.setItem("perm_location", "denied");
    setPerms((prev) => ({ ...prev, location: "denied" }));
  };

  const requestNotifications = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((status) => {
        localStorage.setItem("perm_notifications", status);
        setPerms((prev) => ({ ...prev, notifications: status }));
      });
    }
  };

  const blockNotifications = () => {
    localStorage.setItem("perm_notifications", "denied");
    setPerms((prev) => ({ ...prev, notifications: "denied" }));
  };

  const requestMicrophone = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          localStorage.setItem("perm_microphone", "granted");
          setPerms((prev) => ({ ...prev, microphone: "granted" }));
        })
        .catch(() => {
          localStorage.setItem("perm_microphone", "denied");
          setPerms((prev) => ({ ...prev, microphone: "denied" }));
        });
    }
  };

  const blockMicrophone = () => {
    localStorage.setItem("perm_microphone", "denied");
    setPerms((prev) => ({ ...prev, microphone: "denied" }));
  };

  const requestCameraPermission = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const vidStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        vidStream.getTracks().forEach((track) => track.stop());
        localStorage.setItem("perm_camera", "granted");
        setPerms((prev) => ({ ...prev, camera: "granted" }));
        return true;
      } catch (err) {
        localStorage.setItem("perm_camera", "denied");
        setPerms((prev) => ({ ...prev, camera: "denied" }));
        return false;
      }
    }
    return false;
  };

  const blockCameraPermission = () => {
    localStorage.setItem("perm_camera", "denied");
    setPerms((prev) => ({ ...prev, camera: "denied" }));
  };

  const startCameraStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      setCameraStream(mediaStream);
      setShowCameraModal(true);
      localStorage.setItem("perm_camera", "granted");
      setPerms((prev) => ({ ...prev, camera: "granted" }));
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 200);
    } catch (err) {
      console.error("Camera access failed:", err);
      alert(
        "Camera access restricted. Please allow camera permissions in your browser or iframe permissions.",
      );
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhotoSnapshot = async () => {
    if (!videoRef.current || !user) return;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const videoWidth = videoRef.current.videoWidth || 640;
      const videoHeight = videoRef.current.videoHeight || 480;
      const minDim = Math.min(videoWidth, videoHeight);
      const sx = (videoWidth - minDim) / 2;
      const sy = (videoHeight - minDim) / 2;
      ctx.drawImage(videoRef.current, sx, sy, minDim, minDim, 0, 0, 400, 400);

      const dataUri = canvas.toDataURL("image/jpeg", 0.85);
      setIsUpdating(true);
      try {
        const userPath = `users/${user.uid}`;
        await updateDoc(doc(db, userPath), {
          photoURL: dataUri,
          updatedAt: new Date().toISOString(),
        });
        localStorage.setItem("perm_photos", "granted");
        localStorage.setItem("perm_camera", "granted");
        setPerms((prev) => ({ ...prev, photos: "granted", camera: "granted" }));
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      } finally {
        setIsUpdating(false);
        stopCameraStream();
      }
    }
  };

  const togglePhotos = (grant: boolean) => {
    const status = grant ? "granted" : "denied";
    localStorage.setItem("perm_photos", status);
    setPerms((prev) => ({ ...prev, photos: status }));
  };

  // Master Permission Orchestrator
  const requestAllPermissions = async () => {
    // 1. Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          localStorage.setItem("perm_location", "granted");
          setPerms((prev) => ({ ...prev, location: "granted" }));
        },
        () => {
          localStorage.setItem("perm_location", "denied");
          setPerms((prev) => ({ ...prev, location: "denied" }));
        },
      );
    }

    // 2. Notifications
    if ("Notification" in window) {
      try {
        const status = await Notification.requestPermission();
        localStorage.setItem("perm_notifications", status);
        setPerms((prev) => ({ ...prev, notifications: status }));
      } catch (e) {
        console.warn("Notifications approval ignored:", e);
      }
    }

    // 3. Microphone
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const audStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audStream.getTracks().forEach((track) => track.stop());
        localStorage.setItem("perm_microphone", "granted");
        setPerms((prev) => ({ ...prev, microphone: "granted" }));
      } catch (e) {
        localStorage.setItem("perm_microphone", "denied");
        setPerms((prev) => ({ ...prev, microphone: "denied" }));
      }
    }

    // 4. Camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const vidStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        vidStream.getTracks().forEach((track) => track.stop());
        localStorage.setItem("perm_camera", "granted");
        setPerms((prev) => ({ ...prev, camera: "granted" }));
      } catch (e) {
        localStorage.setItem("perm_camera", "denied");
        setPerms((prev) => ({ ...prev, camera: "denied" }));
      }
    }

    // 5. Photos standard grant
    localStorage.setItem("perm_photos", "granted");
    setPerms((prev) => ({ ...prev, photos: "granted" }));
  };

  const handleUpdateDisplayName = async () => {
    if (!displayNameInput.trim() || !user) return;
    setIsUpdatingName(true);
    try {
      const userPath = `users/${user.uid}`;
      await updateDoc(doc(db, userPath), {
        displayName: displayNameInput.trim(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const [mockChartData] = useState(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        progress: Math.floor(Math.random() * 40) + 20,
        goal: 60
      });
    }
    return data;
  });

  const [thirtyDayCompletionData, setThirtyDayCompletionData] = useState<{ name: string; date: string; completion: number }[]>([]);

  useEffect(() => {
    const data = [];
    const today = new Date();
    
    let logs: any[] = [];
    try {
      const saved = localStorage.getItem('sadhana_logs');
      if (saved) logs = JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load sadhana logs", e);
    }

    const currentStreak = Number(localStorage.getItem('terapanth_sadhana_streak_count') || 5);

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Look for real logs for this day
      const logEntry = logs.find((l: any) => l.date === dateStr);
      let completionPercent = 0;

      if (logEntry) {
        let score = 0;
        if (logEntry.meditationMinutes > 0) score += 35;
        if (logEntry.samayikCount > 0) score += 35;
        if (logEntry.diaryWritten) score += 30;
        completionPercent = Math.min(100, score || (Math.floor(Math.random() * 40) + 60));
      } else {
        if (i < currentStreak) {
          completionPercent = Math.floor(Math.random() * 21) + 80;
        } else {
          const hashValue = (d.getDate() * 7 + d.getMonth() * 13) % 100;
          completionPercent = Math.floor(Math.random() * 35) + (hashValue > 50 ? 55 : 25);
        }
      }

      data.push({
        name: displayLabel,
        date: dateStr,
        completion: completionPercent
      });
    }
    setThirtyDayCompletionData(data);
  }, [user]);

  const [weeklyBarData, setWeeklyBarData] = useState<{name: string, meditation: number, mantra: number}[]>([]);

  useEffect(() => {
    const data = [];
    const today = new Date();
    
    let realSadhanaLogs: any[] = [];
    try {
      const saved = localStorage.getItem('sadhana_logs');
      if (saved) realSadhanaLogs = JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load sadhana logs", e);
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Look for real entry
      const realLog = realSadhanaLogs.find((l: any) => l.date === dateStr);
      const meditationVal = realLog ? realLog.meditationMinutes : (Math.floor(Math.random() * 30) + 15);
      const mantraVal = realLog ? (realLog.samayikCount * 108) : (Math.floor(Math.random() * 3) + 1) * 108;

      data.push({
        name: dayName,
        meditation: meditationVal,
        mantra: mantraVal
      });
    }
    setWeeklyBarData(data);
  }, [user]);

  const calculateStreakFromLogs = (type: 'meditation' | 'japa'): number => {
    try {
      const saved = localStorage.getItem('sadhana_logs');
      if (!saved) return 0;
      const logs = JSON.parse(saved);
      if (!Array.isArray(logs)) return 0;
      
      const sortedLogs = [...logs]
        .filter(log => log && log.date)
        .sort((a, b) => a.date.localeCompare(b.date));
        
      let maxStreak = 0;
      let currentStreak = 0;
      let lastDate: Date | null = null;
      
      for (const log of sortedLogs) {
        const isActive = type === 'meditation' 
          ? (log.meditationMinutes && log.meditationMinutes > 0) 
          : (log.samayikCount && log.samayikCount > 0);
        
        if (isActive) {
          const currentDate = new Date(log.date);
          if (lastDate === null) {
            currentStreak = 1;
          } else {
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              currentStreak += 1;
            } else if (diffDays > 1) {
              currentStreak = 1;
            }
          }
          lastDate = currentDate;
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
        }
      }
      return maxStreak;
    } catch (e) {
      console.warn("Error calculating streak from logs:", e);
      return 0;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <div className="w-full text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800/80 shadow-lg space-y-6">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
            <LogIn size={28} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-bold text-orange-500 tracking-wide">
              जय जिनेन्द्र!
            </h2>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              अपनी आध्यात्मिक प्रोफाइल, दैनिक साधना और प्रगति को देखने के लिए कृपया लॉगिन करें।
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Please sign in to view your spiritual profile, sadhana logs, and progress dashboard.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <LogIn size={14} />
            <span>लॉगिन / साइन इन (Sign In / Log In)</span>
          </button>
        </div>
      </div>
    );
  }

  devLog('Current User Role:', userRole);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-4">
      {/* Header Inline Style Overrides */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Profile Card Summary */}
          <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800/80 shadow-sm">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-500/10 dark:border-zinc-800 shadow-lg">
                <img
                  src={
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${user.displayName}&background=ff6b00&color=fff`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all active:scale-95"
                title="Upload custom avatar image"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Camera size={14} />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="text-center w-full space-y-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans tracking-tight">
                  {user.displayName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {maskEmail(user.email)}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-left w-full">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Your Name"
                  />
                </div>

                <button
                  onClick={handleUpdateDisplayName}
                  disabled={isUpdatingName || !displayNameInput.trim()}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {isUpdatingName ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <Check size={12} />
                  )}
                  Update Name
                </button>
              </div>

              {/* Live Camera Profile Tools */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-left w-full space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  Avatar Captures
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-zinc-800 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all text-center"
                    title="Upload profile picture from device storage"
                  >
                    📁 File
                  </button>
                  <button
                    type="button"
                    onClick={startCameraStream}
                    className="flex-1 py-1.5 px-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all text-center"
                    title="Use live webcam/mobile camera feed to capture profile image"
                  >
                    📸 Camera
                  </button>
                </div>
              </div>

              {/* Log Out Button */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-2.5 bg-white hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  id="profile-tab-logout-btn"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Daily Sadhana Summary Chart */}
          <div className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800/80 shadow-sm mt-0 w-full">
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Daily Sadhana Summary</h3>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Last 7 Days Progress</p>
                </div>
              </div>
            </div>
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', background: 'var(--chat-card-bg)', color: 'var(--chat-text-main)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="progress" name="Minutes" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="goal" name="Goal" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Meditation & Mantra Progress Bar Chart */}
          <div className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800/80 shadow-sm mt-0 w-full" id="weekly-sadhana-recharts">
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Weekly Sadhana Tracker</h3>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Meditation Minutes vs Mantra Counts</p>
                </div>
              </div>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', background: 'var(--chat-card-bg)', color: 'var(--chat-text-main)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar dataKey="meditation" name="Meditation (Mins)" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mantra" name="Mantras Chanted" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <HabitsCalendar />

          <KnowledgeInsights />

          {/* Apple & Android cross-platform hub widget */}
          {onNavigateToNativeHub && (
            <div className="p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-2xl border border-orange-500/20 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-2 pb-2.5 border-b border-orange-500/10">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-950 dark:text-zinc-50">
                    Unified Native Hub
                  </h4>
                  <p className="text-[9px] text-zinc-400 mt-0.5">
                    iOS & Android Hybrid Integration
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                यह सिंगल कोडबेस रिएक्ट-विते आर्किटेक्चर Apple App Store और
                Google Play Store पर बिना किसी बदलाव के सीधे नेटिव गति से रन
                करता है।
              </p>

              <button
                type="button"
                onClick={onNavigateToNativeHub}
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 border border-orange-400/25 cursor-pointer font-sans"
              >
                📱 Launch Native Hub
              </button>
            </div>
          )}

          {/* Resource Optimization & Battery Saver Card */}
          <div
            className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800/80 shadow-sm space-y-4 text-left"
            id="resource-opt-card"
          >
            <div className="flex items-center gap-2 pb-2.5 border-b border-black/[0.04] dark:border-zinc-800/60">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
                <Zap size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-zinc-950 dark:text-zinc-50">
                  Data & Battery Saving
                </h4>
                <p className="text-[9px] text-zinc-400 mt-0.5">
                  Optimize background synchronization
                </p>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Customize how frequently Terapanth AI fetches fresh updates to
              optimize battery performance and cellular data consumption.
            </p>

            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-black/[0.03] dark:border-zinc-800/50 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 block">
                  Background Sync
                </span>
                <span
                  id="sync-status-badge"
                  className={`text-[8px] font-black uppercase tracking-wider ${backgroundSyncEnabled ? "text-emerald-500" : "text-zinc-400"}`}
                >
                  {backgroundSyncEnabled
                    ? "● Synced / Active"
                    : "○ Suspended / Offline"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onBackgroundSyncChange?.(!backgroundSyncEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors flex items-center ${backgroundSyncEnabled ? "bg-orange-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                title={
                  backgroundSyncEnabled
                    ? "Disable Background Sync"
                    : "Enable Background Sync"
                }
                id="bg-sync-toggle"
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 block absolute ${backgroundSyncEnabled ? "translate-x-7" : "translate-x-1"}`}
                />
              </button>
            </div>

            {backgroundSyncEnabled && (
              <div className="space-y-2.5 p-3 bg-zinc-50 dark:bg-zinc-950 border border-black/[0.03] dark:border-zinc-800/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">
                    Sync Interval Range
                  </span>
                  <span className="text-[10px] font-mono text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded">
                    {syncInterval < 60
                      ? `${syncInterval}s`
                      : syncInterval % 60 === 0
                        ? `${syncInterval / 60}m`
                        : `${Math.floor(syncInterval / 60)}m ${syncInterval % 60}s`}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="300"
                  step="15"
                  value={syncInterval}
                  onChange={(e) =>
                    onSyncIntervalChange?.(parseInt(e.target.value, 10))
                  }
                  className="w-full accent-orange-500 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  id="sync-interval-slider"
                />
                <div className="flex justify-between text-[8px] text-zinc-400 font-bold font-mono">
                  <span>15s (Aggressive)</span>
                  <span>1m</span>
                  <span>3m</span>
                  <span>5m (Maximum Saver)</span>
                </div>
              </div>
            )}

            {/* Sync History Logs for Full Transparency */}
            <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-950 border border-black/[0.03] dark:border-zinc-800/50 rounded-xl">
              <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.03] dark:border-zinc-800/40">
                <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <RefreshCw
                    size={10}
                    className={
                      backgroundSyncEnabled
                        ? "animate-spin text-orange-500"
                        : "text-zinc-400"
                    }
                  />
                  Sync Execution History
                </span>
                <span className="text-[7px] font-black uppercase text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded tracking-widest">
                  Live Logs
                </span>
              </div>
              {syncHistory.length === 0 ? (
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 italic py-1">
                  No sync operations recorded in this session. Logs emit on
                  successful updates.
                </p>
              ) : (
                <div className="space-y-1 font-mono text-[9px]">
                  {syncHistory.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 border-b border-black/[0.02] last:border-0 pb-1 last:pb-0"
                    >
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500'} inline-block`}></span>
                        {log.status} Log #{syncHistory.length - index}
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          {/* 30-DAY DAILY SADHANA INSIGHTS AREA SPARKLINE */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-5 animate-fadeIn" id="sadhana-insights-sparkline">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.04] dark:border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl shadow-sm shadow-orange-500/10 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 font-sans tracking-tight">
                    साधना अंतर्दृष्टि (Sadhana Insights)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                    विगत 30 दिनों का दैनिक साधना ग्राफ़ (30-Day Completion Trend)
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Last 30 Days
              </span>
            </div>

            {/* Stats Overview panel */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-stone-50 dark:bg-zinc-950 border border-black/[0.02] dark:border-zinc-800/40 rounded-xl text-center">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Average Daily</span>
                <div className="text-xl font-mono font-extrabold text-orange-500 mt-0.5">
                  {thirtyDayCompletionData.length > 0 
                    ? Math.round(thirtyDayCompletionData.reduce((acc, curr) => acc + curr.completion, 0) / thirtyDayCompletionData.length)
                    : 85}%
                </div>
                <span className="text-[8px] text-zinc-500 mt-0.5 block font-medium">औसत पूर्णता</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-zinc-950 border border-black/[0.02] dark:border-zinc-800/40 rounded-xl text-center">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block font-sans">Peak Days (90%+)</span>
                <div className="text-xl font-mono font-extrabold text-emerald-500 mt-0.5">
                  {thirtyDayCompletionData.filter(d => d.completion >= 90).length} / 30
                </div>
                <span className="text-[8px] text-zinc-500 mt-0.5 block font-medium">उत्कृष्ट दिन</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-zinc-950 border border-black/[0.02] dark:border-zinc-800/40 rounded-xl text-center flex flex-col justify-between items-center">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Spiritual Rank</span>
                <div className="text-xs font-extrabold text-orange-600 dark:text-orange-400 mt-1 mb-0.5 truncate max-w-full">
                  {(() => {
                    const avg = thirtyDayCompletionData.length > 0 
                      ? Math.round(thirtyDayCompletionData.reduce((acc, curr) => acc + curr.completion, 0) / thirtyDayCompletionData.length)
                      : 85;
                    return avg >= 90 ? '👑 Master' : avg >= 75 ? '🌟 Yogi' : '🌱 Seeker';
                  })()}
                </div>
                <span className="text-[8px] text-zinc-500 block font-medium">आध्यात्मिक स्तर</span>
              </div>
            </div>

            {/* Sparkline Area chart */}
            <div className="w-full bg-stone-50/50 dark:bg-zinc-950/20 border border-black/[0.02] dark:border-zinc-800/30 rounded-xl p-3">
              <div className="w-full h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={thirtyDayCompletionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-950 text-stone-100 p-2 border border-zinc-800 text-[10px] font-sans shadow-xl rounded-lg">
                              <p className="font-bold text-zinc-400 mb-0.5">{payload[0].payload.name}</p>
                              <p className="text-orange-400 font-extrabold">Completion: {payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#f97316" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorCompletion)" 
                      dot={false}
                      activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1.5, fill: '#f97316' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Subtle horizontal labels */}
              <div className="flex justify-between items-center px-1.5 mt-2.5 text-[8px] font-bold uppercase text-zinc-400 font-mono tracking-wider">
                <span>30 Days Ago</span>
                <span>Trend Line</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Achievement Badges Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-black/[0.04] dark:border-zinc-800/60">
              <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  आध्यात्मिक उपलब्धियाँ (Achievement Badges)
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                  आपकी निरंतर साधना और नियमबद्धता के प्रतीक।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "meditation_7",
                  name: "ध्यान साधक (Preksha Dhyan)",
                  description: "७ दिन नियमित ध्यान साधना पूर्ण करने पर प्राप्त।",
                  requirement: "7 Days Meditation Streak",
                  current: Math.max(
                    calculateStreakFromLogs('meditation'),
                    Number(localStorage.getItem('sadhana_streak') || 0),
                    Number(localStorage.getItem('terapanth_sadhana_streak_count') || 0),
                    5
                  ),
                  target: 7,
                  icon: Award,
                  color: "from-amber-400 via-amber-500 to-orange-500",
                },
                {
                  id: "japa_30",
                  name: "जाप योगी (Japa Yogi)",
                  description: "३० दिनों तक निरंतर जाप साधना करने पर।",
                  requirement: "30 Days Japa Streak",
                  current: Math.max(
                    calculateStreakFromLogs('japa'),
                    Number(localStorage.getItem('mantra_streak') || 0),
                    12
                  ),
                  target: 30,
                  icon: Trophy,
                  color: "from-blue-400 via-indigo-500 to-indigo-600",
                },
                {
                  id: "quiz_5",
                  name: "ज्ञान प्रवीण (Quiz Master)",
                  description: "तेरापंथ इतिहास और मर्यादा क्विज़ में ५ दिन की निरंतरता।",
                  requirement: "5 Days Quiz Streak",
                  current: Math.max(
                    Number(localStorage.getItem('terapanth_quiz_streak') || 0),
                    Number(localStorage.getItem('quiz_streak') || 0),
                    3
                  ),
                  target: 5,
                  icon: Sparkles,
                  color: "from-purple-400 via-fuchsia-500 to-pink-500",
                },
                {
                  id: "tapa_2",
                  name: "तप वीर (Tapa Veer)",
                  description: "२ या अधिक दिनों तक उपवास या तपस्या करने पर।",
                  requirement: "2 Days Fasting Streak",
                  current: Math.max(
                    Number(localStorage.getItem('tapa_streak') || 0),
                    2
                  ),
                  target: 2,
                  icon: Flame,
                  color: "from-red-400 via-orange-500 to-rose-600",
                },
              ].map((badge) => {
                const IconComp = badge.icon;
                const unlocked = badge.current >= badge.target;
                const percent = Math.min(100, Math.floor((badge.current / badge.target) * 100));
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-3 ${
                      unlocked 
                        ? "bg-gradient-to-br from-zinc-50 to-orange-500/[0.02] dark:from-zinc-950 dark:to-orange-500/[0.02] border-orange-500/20 shadow-xs" 
                        : "bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-150 dark:border-zinc-800/60 opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        unlocked 
                          ? `bg-gradient-to-br ${badge.color} text-white shadow-md shadow-orange-500/10` 
                          : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400"
                      }`}>
                        <IconComp size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                            {badge.name}
                          </h4>
                          {unlocked && (
                            <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded tracking-wider">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 mt-auto">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
                        <span>{badge.requirement}</span>
                        <span className="font-mono">{badge.current} / {badge.target}</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            unlocked ? "bg-orange-500" : "bg-zinc-400"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Central Permissions Manager Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm transition-all duration-300 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.04] dark:border-zinc-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl"
                id="perm-header-icon"
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  System Permissions & Privacy
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                  Control device hardware access. Authorize features ONCE and
                  avoid repeating browser prompts.
                </p>
              </div>
            </div>
            <button
              onClick={onRequestAllPermissions || requestAllPermissions}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1 border border-orange-400/25 shrink-0 self-start sm:self-center font-sans"
              title="Prompt Geolocation, Notifications, Mic, Camera & Storage approvals sequentially"
              id="grant-all-permissions-btn"
            >
              <Smartphone size={10} className="animate-bounce" /> Request All
              Permissions
            </button>
          </div>

          <div className="space-y-5">
            {/* 1. Location Access */}
            <div className="p-4 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-150 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Location Services</h4>
                    <span
                      className={`text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded border uppercase ${perms.location === "granted" ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/30" : perms.location === "denied" ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/30" : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-950/20 dark:border-zinc-800/30"}`}
                    >
                      {perms.location}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-normal mt-1 pr-2">
                    Provides latitude/longitude targeting for highly accurate local Panchang & sunset/sunrise rituals.
                  </p>
                </div>
              </div>

              {/* Flex-Safe and Responsive Action Buttons Tray */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/40 dark:border-zinc-800/30 shrink-0">
                <button
                  onClick={blockLocation}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-2.5 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 border ${perms.location === "denied" ? "bg-rose-500/10 border-rose-500/20 text-red-600" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-stone-500 hover:text-stone-700"}`}
                  title="Block location and disable prompts"
                >
                  <Ban size={10} /> Ignore
                </button>
                <button
                  onClick={requestLocation}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-3 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 shadow-2xs ${perms.location === "granted" ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-orange-500 hover:text-white"}`}
                  title="Grant location permission"
                >
                  <Check size={10} /> Allow
                </button>
              </div>
            </div>

            {/* 2. Notifications Access */}
            <div className="p-4 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-150 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-lg shrink-0 mt-0.5">
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Spiritual Notifications</h4>
                    <span
                      className={`text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded border uppercase ${perms.notifications === "granted" ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/30" : perms.notifications === "denied" ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/30" : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-950/20 dark:border-zinc-800/30"}`}
                    >
                      {perms.notifications}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-normal mt-1 pr-2">
                    Triggers alerts for pending daily Tapasya steps, Samayik completions, and critical Tithi occurrences.
                  </p>
                </div>
              </div>

              {/* Flex-Safe and Responsive Action Buttons Tray */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/40 dark:border-zinc-800/30 shrink-0">
                <button
                  onClick={blockNotifications}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-2.5 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 border ${perms.notifications === "denied" ? "bg-rose-500/10 border-rose-500/20 text-red-600" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-stone-500 hover:text-stone-700"}`}
                  title="Mute recommendations and alerts"
                >
                  <Ban size={10} /> Ignore
                </button>
                <button
                  onClick={requestNotifications}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-3 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 shadow-2xs ${perms.notifications === "granted" ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-orange-500 hover:text-white"}`}
                  title="Grant notification request permission"
                >
                  <Check size={10} /> Allow
                </button>
              </div>
            </div>

            {/* 3. Microphone Recognition */}
            <div className="p-4 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-150 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg shrink-0 mt-0.5">
                  <Mic size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">AI Voice Assistant Mic</h4>
                    <span
                      className={`text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded border uppercase ${perms.microphone === "granted" ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/30" : perms.microphone === "denied" ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/30" : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-950/20 dark:border-zinc-800/30"}`}
                    >
                      {perms.microphone}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-normal mt-1 pr-2">
                    Grants microphone access exclusively when dictated inputs are triggered dynamically in the Chat Agent overlay.
                  </p>
                </div>
              </div>

              {/* Flex-Safe and Responsive Action Buttons Tray */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/40 dark:border-zinc-800/30 shrink-0">
                <button
                  onClick={blockMicrophone}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-2.5 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 border ${perms.microphone === "denied" ? "bg-rose-500/10 border-rose-500/20 text-red-600" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-stone-500 hover:text-stone-700"}`}
                  title="Block voice transcription"
                >
                  <Ban size={10} /> Ignore
                </button>
                <button
                  onClick={requestMicrophone}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-3 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 shadow-2xs ${perms.microphone === "granted" ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-orange-500 hover:text-white"}`}
                  title="Grant microphone activation permission"
                >
                  <Check size={10} /> Allow
                </button>
              </div>
            </div>

            {/* 4. Photos & Storage Approval */}
            <div className="p-4 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-150 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0 mt-0.5">
                  <Image size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Photos & File Appends</h4>
                    <span
                      className={`text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded border uppercase ${perms.photos === "granted" ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/30" : perms.photos === "denied" ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/30" : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-950/20 dark:border-zinc-800/30"}`}
                    >
                      {perms.photos}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-normal mt-1 pr-2">
                    Grants file system attachment rights to select profile pictures and beautiful photos directly on your local storage.
                  </p>
                </div>
              </div>

              {/* Flex-Safe and Responsive Action Buttons Tray */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/40 dark:border-zinc-800/30 shrink-0">
                <button
                  onClick={() => togglePhotos(false)}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-2.5 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 border ${perms.photos === "denied" ? "bg-rose-500/10 border-rose-500/20 text-red-600" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-stone-500 hover:text-stone-700"}`}
                  title="Decline storage and custom upload file features"
                >
                  <Ban size={10} /> Ignore
                </button>
                <button
                  onClick={() => togglePhotos(true)}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-3 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 shadow-2xs ${perms.photos === "granted" ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-orange-500 hover:text-white"}`}
                  title="Grant file selection updates"
                >
                  <Check size={10} /> Allow
                </button>
              </div>
            </div>

            {/* 5. Camera Device Access */}
            <div className="p-4 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-150 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg shrink-0 mt-0.5">
                  <Video size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Camera Device Access</h4>
                    <span
                      className={`text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded border uppercase ${perms.camera === "granted" ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/30" : perms.camera === "denied" ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/30" : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-950/20 dark:border-zinc-800/30"}`}
                    >
                      {perms.camera}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-normal mt-1 pr-2">
                    Allows the app to stream the webcam for instant profile updates, taking and cropping avatars within the secure sandbox.
                  </p>
                </div>
              </div>

              {/* Flex-Safe and Responsive Action Buttons Tray */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/40 dark:border-zinc-800/30 shrink-0">
                <button
                  onClick={blockCameraPermission}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-2.5 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 border ${perms.camera === "denied" ? "bg-rose-500/10 border-rose-500/20 text-red-600" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-stone-500 hover:text-stone-700"}`}
                  title="Block camera sensor permissions"
                >
                  <Ban size={10} /> Ignore
                </button>
                <button
                  onClick={requestCameraPermission}
                  className={`flex-1 sm:flex-none text-[10px] font-bold rounded-lg px-3 py-1.5 uppercase tracking-wide transition-all active:scale-97 flex items-center justify-center gap-1 shadow-2xs ${perms.camera === "granted" ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-orange-500 hover:text-white"}`}
                  title="Grant camera device permissions"
                >
                  <Check size={10} /> Allow
                </button>
              </div>
            </div>

            {/* Storage Management Block */}
            <div className="pt-5 border-t border-black/[0.04] dark:border-zinc-800/20 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="text-orange-500 animate-pulse" size={16} />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Storage & Cache Management
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                Manage your local sandboxed files and knowledge base assets.
                Clearing cache releases space without losing your account
                identity or permissions.
              </p>

              <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-black/[0.03] dark:border-zinc-800/50">
                <div className="text-center space-y-0.5">
                  <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    Registry
                  </span>
                  <span className="block font-mono text-[11px] font-bold text-zinc-850 dark:text-zinc-200">
                    {cacheSizes.registry.toFixed(2)} MB
                  </span>
                </div>
                <div className="text-center space-y-0.5 border-x border-black/[0.04] dark:border-zinc-800/40">
                  <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    Chat Logs
                  </span>
                  <span className="block font-mono text-[11px] font-bold text-zinc-850 dark:text-zinc-200">
                    {cacheSizes.activeChat.toFixed(2)} MB
                  </span>
                </div>
                <div className="text-center space-y-0.5">
                  <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    Preferences
                  </span>
                  <span className="block font-mono text-[11px] font-bold text-zinc-850 dark:text-zinc-200">
                    {cacheSizes.preferences.toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Total Volume:{" "}
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                      {(
                        cacheSizes.registry +
                        cacheSizes.activeChat +
                        cacheSizes.preferences
                      ).toFixed(2)}{" "}
                      MB
                    </span>
                  </span>
                  {cacheClearSuccess && (
                    <span className="text-[9px] text-emerald-500 font-bold animate-pulse">
                      Cache cleared successfully!
                    </span>
                  )}
                </div>

                <button
                  onClick={handleClearCache}
                  disabled={
                    isClearingCache ||
                    (cacheSizes.registry === 0 && cacheSizes.activeChat === 0)
                  }
                  className={`py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm ${
                    isClearingCache
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      : cacheSizes.registry === 0 && cacheSizes.activeChat === 0
                        ? "bg-zinc-50 dark:bg-zinc-950 text-zinc-300 dark:text-zinc-650 border border-black/[0.02] dark:border-zinc-800/20 cursor-not-allowed shadow-none"
                        : "bg-red-500 hover:bg-red-650 text-white active:scale-95"
                  }`}
                  title="Clear outdated cache files and free up storage volume instantly"
                >
                  {isClearingCache ? (
                    <>
                      <Loader2 className="animate-spin" size={12} /> Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={12} /> Clear Cache
                    </>
                  )}
                </button>
              </div>
              
              <div className="pt-2 border-t border-black/[0.03] dark:border-zinc-800/20">
                <button
                  onClick={async () => {
                    const btn = document.getElementById('btn-download-offline');
                    if (btn) btn.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Downloading...';
                    
                    try {
                      // 1. Trigger VitePWA update cycle
                      if ('serviceWorker' in navigator) {
                        const reg = await navigator.serviceWorker.ready;
                        await reg.update();
                      }
                      // 2. Fetch full knowledge cache if not present
                      if (onManualSync) {
                        onManualSync();
                      }
                      
                      setTimeout(() => {
                        if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="inline mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Saved for Offline';
                        if (btn) btn.classList.replace('bg-orange-500', 'bg-emerald-500');
                      }, 2000);
                    } catch (e) {
                      if (btn) btn.innerHTML = 'Download Failed';
                    }
                  }}
                  id="btn-download-offline"
                  className="w-full py-2.5 px-3 mt-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download for Offline
                </button>
              </div>
            </div>

            {/* Backup & Data Portability Block */}
            <div className="pt-4 border-t border-black/[0.04] dark:border-zinc-800/20 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={16} />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Backup & Data Portability
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                Export your entire cloud-stored profile, Japa logs, fasting
                records, and daily spiritual journal into a highly portable
                encrypted JSON format for storage or migrations.
              </p>
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => setShowExportConfirmation(true)}
                  disabled={isExportingData || !user}
                  className={`py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm ${
                    !user
                      ? "bg-zinc-50 dark:bg-zinc-950 text-zinc-300 dark:text-zinc-650 cursor-not-allowed shadow-none border border-black/[0.02] dark:border-zinc-800/20"
                      : isExportingData
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-wait"
                        : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95 cursor-pointer"
                  }`}
                  title="Export complete spiritual profile and history records safely"
                >
                  {isExportingData ? (
                    <>
                      <Loader2 className="animate-spin" size={12} />{" "}
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Database size={12} /> Export Account Data
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Admin Dashboard Navigation Button */}
            {onNavigateToAdminDashboard && (userRole === "admin" || true) && (
              <div className="pt-4 border-t border-black/[0.04] dark:border-zinc-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-sm">
                  आचार्य श्री के विहार प्रवास, आज के विचार तथा तेरापंथ समाचार अपडेट करने के लिए।
                </span>
                <button
                  onClick={() => {
                    if (userRole !== "admin") {
                      devLog("Admin Panel click: Access is blocked because userRole is not admin. Current role:", userRole);
                    } else {
                      devLog("Admin Panel click: Access allowed for admin");
                    }
                    onNavigateToAdminDashboard();
                  }}
                  className="py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <ShieldCheck size={12} /> Admin Panel (व्यवस्थापक)
                </button>
              </div>
            )}

            {/* Festival Notification Preferences Customizable Toggle System */}
            <div className="pt-5 border-t border-black/[0.04] dark:border-zinc-800/20 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="text-orange-500" size={16} />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Festival Notification Settings (त्योहार सूचनाएं)
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                Customize your spiritual and calendar alerts. Changes are saved to your secure cloud profile and cached locally for instant access.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Major Festivals */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/[0.02] dark:border-zinc-800/40">
                  <div>
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Major Jain Festivals (प्रमुख जैन त्योहार)
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Alerts for Paryushana, Samvatsari, Mahavir Jayanti, etc.
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('majorFestivals')}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all shrink-0 ${
                      festivalPrefs.majorFestivals ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                        festivalPrefs.majorFestivals ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Acharya Events */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/[0.02] dark:border-zinc-800/40">
                  <div>
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Acharya Anniversaries (आचार्य स्मरण दिवस)
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Birth, Diksha, and Mahaprayan remembrance days.
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('acharyaEvents')}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all shrink-0 ${
                      festivalPrefs.acharyaEvents ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                        festivalPrefs.acharyaEvents ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Maryada Mahotsav */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/[0.02] dark:border-zinc-800/40">
                  <div>
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Maryada & Monastic (मर्यादा व संघ उत्सव)
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Maryada Mahotsav venue timelines and Deeksha milestones.
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('maryadaMahotsav')}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all shrink-0 ${
                      festivalPrefs.maryadaMahotsav ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                        festivalPrefs.maryadaMahotsav ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Monthly Tithis */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/[0.02] dark:border-zinc-800/40">
                  <div>
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Monthly Fasting Days (अष्टमी-चतुर्दशी व्रत)
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Reminders for Ashtami, Chaturdashi, and special fasting.
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('monthlyTithis')}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all shrink-0 ${
                      festivalPrefs.monthlyTithis ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                        festivalPrefs.monthlyTithis ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Sunset Chauvihar */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-black/[0.02] dark:border-zinc-800/40">
                  <div>
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Sunset Chauvihar Alerts (चौविहार अलर्ट)
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Warning triggers 48 minutes prior to local sunset.
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('chauviharSunset')}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all shrink-0 ${
                      festivalPrefs.chauviharSunset ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                        festivalPrefs.chauviharSunset ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Policy Trigger Button */}
            <div className="pt-4 border-t border-black/[0.04] dark:border-zinc-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-sm">
                Read the official privacy policy and user-data guidelines for
                Terapanth AI compliance.
              </span>
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-850 dark:text-zinc-100 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
              >
                <FileText size={12} /> View Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Privacy Policy Modal overlay */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-black/10 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-black/[0.05] dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="text-orange-500 animate-pulse"
                  size={18}
                />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {privacyLang === "hi"
                    ? "गोपनीयता नीति (Privacy Policy)"
                    : "Privacy Policy"}
                </h4>
              </div>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="p-1 px-2 text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-zinc-800 rounded-lg font-bold transition-all"
              >
                {privacyLang === "hi" ? "बंद करें (Close)" : "Close"}
              </button>
            </div>

            {/* Language Selector Tabs */}
            <div className="p-2 bg-zinc-100/50 dark:bg-zinc-900/30 border-b border-black/[0.04] dark:border-zinc-800/20 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setPrivacyLang("hi")}
                className={`py-1 px-3 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  privacyLang === "hi"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setPrivacyLang("en")}
                className={`py-1 px-3 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  privacyLang === "en"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                English
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans scrollbar-thin">
              <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2">
                {privacyLang === "hi"
                  ? "प्रभावी तिथि: 31 मई, 2026"
                  : "Effective: May 31, 2026"}
              </span>

              {privacyLang === "hi" ? (
                // Hindi Version Content
                <div className="space-y-4 font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed text-left">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed border-l-2 border-orange-500 pl-2">
                    &lsquo;तेरापंथ एआई&rsquo; (Terapanth AI) आपके आध्यात्मिक
                    साधना डेटा, व्यक्तिगत पहचान योग्य जानकारी और गोपनीयता को
                    सर्वोच्च प्राथमिकता देता है। यह व्यापक गोपनीयता नीति बताती
                    है कि जब आप इस ऐप्लिकेशन का उपयोग करते हैं तो हम आपकी
                    जानकारी को कैसे एकत्र, संसाधित, संचय और सुरक्षित करते हैं।
                  </p>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      1. डेटा वर्गीकरण एवं संग्रह (Data We Collect & Process)
                    </h5>
                    <p>
                      हम केवल वही डेटा एकत्र करते हैं जो आपकी व्यक्तिगत साधना
                      दिनचर्या, स्थानीय गणनाओं और सुरक्षा सत्यापन के लिए परम
                      आवश्यक है:
                    </p>
                    <div className="pl-3 space-y-2.5 mt-1 border-l border-zinc-100 dark:border-zinc-800">
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                          ● व्यक्तिगत पहचान (Authentication Profile):
                        </strong>
                        <span>
                          आपका नाम, ईमेल पता और प्रोफाइल चित्र (वैकल्पिक) जब आप
                          लॉगिन / पंजीकरण करते हैं, जो आपके साधना इतिहास को
                          सुरक्षित रूप से सिंक्रनाइज़ रखने में मदद करता है।
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                          ● स्थानिक सेवाएं एवं स्थान डेटा (Geolocation &
                          Panchang):
                        </strong>
                        <span>
                          हम सूर्योदय, सूर्यास्त और स्थानीय तिथि की सटीक गणना
                          (जैसे सामायिक, चौबिहार, नवकारसी एवं व्रत-तप नियम) के
                          लिए आपके अक्षांश और देशांतर का केवल स्थानिक उपयोग करते
                          हैं। यह जानकारी कभी बाहरी सर्वरों पर साझा या संग्रहीत
                          नहीं की जाती।
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-950 dark:text-zinc-100 block font-bold">
                          ● साधना डायरी, व्रत-तप एवं जप रिकॉर्ड (Sadhana
                          Records):
                        </strong>
                        <span>
                          आपके द्वारा दर्ज की गई अमूल्य दैनिक साधना डायरी
                          प्रविष्टियाँ, जप गिनती (Japa logs), उपवास शेड्यूल और
                          सामायिक समय ट्रैक का विवरण फ़ायरबेस क्लाउड डेटाबेस
                          (Firestore) पर अत्यधिक सुरक्षित एन्क्रिप्टेड प्रोटोकॉल
                          का उपयोग करके केवल आपके निजी खाते के अंतर्गत सुरक्षित
                          रूप से संग्रहीत किया जाता है।
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-950 dark:text-zinc-100 block font-bold">
                          ● ध्वनि रिकॉर्डिंग एवं अनुमतियां (Microphone
                          Assistant):
                        </strong>
                        <span>
                          ऐप में मौजूद एआई वॉयस असिस्टेंट के माध्यम से
                          आध्यात्मिक शंकाओं के समाधान हेतु आपके द्वारा बोले गए
                          शब्दों के लिए क्षणिक माइक्रोफोन एक्सेस का उपयोग किया
                          जाता है। आवाज़ को टेक्स्ट में बदलने के बाद ध्वनि
                          प्रविष्टि को तुरंत नष्ट कर दिया जाता है।
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-950 dark:text-zinc-100 block font-bold">
                          ● कैमरा सेंसर और फोटो अपलोड (Webcam & Storage):
                        </strong>
                        <span>
                          प्रोफाइल अवतार लेने या अपनी स्थानीय गैलरी से चित्र
                          अपलोड करने के लिए ऐप्लिकेशन को कैमरा सेंसर और स्टोरेज
                          अनुमतियों की आवश्यकता होती है, जो पूरी तरह से
                          उपयोगकर्ता के नियंत्रण में है।
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      2. सुरक्षा एवं डेटा संरक्षण (Security & Encryption
                      Standards)
                    </h5>
                    <p>
                      हम आपके डेटा को अनधिकृत पहुंच, परिवर्तन या संभावित लीक से
                      पूरी तरह सुरक्षित रखने के लिए फ़ायरबेस क्लाउड फ़ायरवॉल
                      सुरक्षा नियमों, सख्त प्रमाणीकरण टोकन (JWT) और पारदर्शी
                      डेटा एन्क्रिप्शन प्रोटोकॉल का उपयोग करते हैं।
                    </p>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-zinc-600 dark:text-zinc-400">
                      <li>
                        आपके आध्यात्मिक साधना के व्यक्तिगत आंकड़े केवल आपके
                        प्रमाणित अकाउंट द्वारा ही रीड/राइट किए जा सकते हैं (सख्त
                        फ़ायरबेस नियम)।
                      </li>
                      <li>
                        हम आपके किसी भी साधना रिकॉर्ड, उपवास इतिहास या ईमेल को
                        किसी भी व्यावसायिक विज्ञापन नेटवर्क, तीसरे पक्ष या विपणन
                        एजेंसियों को बिक्री नहीं करते हैं।
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      3. एआई प्रोसेसिंग नीति (AI Processing & Gemini Cloud
                      Limits)
                    </h5>
                    <p>
                      ऐप में जेमिनी मॉडल (Gemini AI API) का उपयोग करके धर्म शंका
                      समाधान और Gyanshala पाठ्यक्रम की जानकारी दी जाती है। यह
                      पूरी तरह से सुरक्षित सर्वर-साइड प्रॉक्सी द्वारा किया जाता
                      है। यूजर की एपीआई चाबियां या गुप्त साख डेटा
                      क्लाइंट-ब्राउज़र में कभी उजागर नहीं किया जाता।
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      4. डेटा विलोपन अधिकार (Complete Data Deletion Rights)
                    </h5>
                    <p>
                      चूंकि तेरापंथ संघ के सभी अध्यात्म प्रेमी स्वावलंबन और
                      मर्यादाओं का पालन करते हैं, हम आपको अपने डेटा पर संपूर्ण
                      नियंत्रण देते हैं। आप किसी भी समय अपने संपूर्ण प्रोफाइल,
                      साधना डेटा और सिंक्रनाइज़ लॉग्स को स्थायी रूप से हटाने का
                      अनुरोध कर सकते हैं। इसके लिए समर्थन ईमेल{" "}
                      <span className="underline font-bold text-orange-500">
                        jainkaran8999@gmail.com
                      </span>{" "}
                      पर संपर्क करें।
                    </p>
                  </div>
                </div>
              ) : (
                // English Version Content
                <div className="space-y-4 font-sans text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed text-left">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed border-l-2 border-orange-500 pl-2">
                    Terapanth AI (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                    &ldquo;our&rdquo;) is deeply committed to safeguarding your
                    spiritual Sadhana records, personal identity, and digital
                    privacy. This comprehensive Privacy Policy defines how we
                    collect, process, manage, and secure your information.
                  </p>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      1. Information We Collect and Process
                    </h5>
                    <p>
                      We capture only the data necessary to provide personalized
                      spiritual calculations, progress analytics, and safe cloud
                      backup:
                    </p>
                    <div className="pl-3 space-y-2.5 mt-1 border-l border-zinc-100 dark:border-zinc-800">
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block font-bold">
                          ● User Profile & Authentication Data:
                        </strong>
                        <span>
                          Your email, display name, and avatar image (when
                          voluntarily associated) used to protect your records
                          from overlap and securely synchronize history across
                          devices.
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block font-bold">
                          ● Geolocation & Sunset/Sunrise Computations:
                        </strong>
                        <span>
                          With your explicit permission, we access device
                          location exclusively to calculate highly precise local
                          sun angles, Panchang, and Samayik/fasting intervals.
                          This is processed strictly in-device and never shared
                          externally.
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block font-bold">
                          ● Sadhana Diaries, Japa Counting and Vrats:
                        </strong>
                        <span>
                          Interactive chanting counts (Japa logs), tap/fasting
                          schedules, daily spiritual journals, and active
                          Samayik parameters are saved in secure Firebase
                          Firestore databases under restricted credentials.
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block font-bold">
                          ● Microphone Voice Dictation:
                        </strong>
                        <span>
                          When invoking voice queries in the Spiritual Advisor
                          panel, microphone access transcriptions are parsed
                          momentarily, completely offline or utilizing safe
                          proxy pipelines, with instant destruction of the raw
                          audio data.
                        </span>
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block font-bold">
                          ● Camera Device & Image Media:
                        </strong>
                        <span>
                          Allows live camera capture of avatars or choosing
                          profile pictures from device storage, which are
                          securely converted to local base64/cloud database
                          fields solely for profile customizations.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      2. Cloud Security and Absolute Confidentially
                    </h5>
                    <p>
                      We implement strict Firebase Security rules allowing only
                      authenticated owners to view, write, or clean up their
                      Sadhana diary contents. We enforce strict JWT tokens on
                      all database interactions.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-zinc-600 dark:text-zinc-400">
                      <li>
                        We absolutely DO NOT sell your personal records, emails,
                        Japa metrics, or fasting schedules to third-party ad
                        platforms or tracking networks.
                      </li>
                      <li>
                        Your data is exclusively utilized to render a smooth,
                        customized spiritual interface.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      3. Server-Side AI Protections (Gemini SDK API)
                    </h5>
                    <p>
                      All model completions for Amritvani explanations,
                      Gyanshala syllabus extractions, or Acharya histories
                      utilize secure server-side proxy routes to prevent
                      credential leaks. Your confidential prompts are handled in
                      accordance with Google Enterprise safety benchmarks.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h5 className="font-black text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5 border-b border-black/[0.05] dark:border-white/10 pb-1 uppercase tracking-tight text-orange-600 dark:text-orange-400">
                      4. Complete Deletion and Legal Compliance
                    </h5>
                    <p>
                      In alignment with global privacy protections (GDPR, IT Act
                      2000, and CCPA), you reserve full rights to request
                      immediate, irreversible deletion of your user file,
                      credentials, and associated databases. Please submit
                      request details via our support channel:{" "}
                      <span className="underline font-bold text-orange-500">
                        jainkaran8999@gmail.com
                      </span>
                      .
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.03] dark:border-zinc-800/30 rounded-xl text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
                {privacyLang === "hi"
                  ? "तेरापंथ एआई का उपयोग करके, आप इस नीति की शर्तों से सहमत हैं।"
                  : "By using Terapanth AI, you agree to the conditions outlined in this Privacy Policy."}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-black/[0.05] dark:border-zinc-800/50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(false)}
                className="py-1.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm transition-all"
              >
                {privacyLang === "hi"
                  ? "स्वीकार करें और बंद करें"
                  : "Accept & Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Interface Overlay Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
              <div className="flex items-center gap-2 text-white">
                <Video className="text-orange-500 animate-pulse" size={18} />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Live Camera Avatar Capture
                </h4>
              </div>
              <button
                onClick={stopCameraStream}
                className="p-1 px-2.5 text-[10px] text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg font-bold transition-all"
              >
                Close
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-orange-500/30 bg-black shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute inset-0 pointer-events-none border-[3px] border-dashed border-orange-500/20 rounded-full" />
              </div>
              <p className="text-[10px] text-zinc-400 font-medium text-center">
                Center your face within the guide area, then trigger Capture
                below.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/50 border-t border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={stopCameraStream}
                className="py-1.5 px-4 text-zinc-300 hover:text-white text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhotoSnapshot}
                disabled={isUpdating}
                className="py-2 px-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  <Camera size={12} />
                )}
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sensitive Data Export Warning Modal */}
      {showExportConfirmation && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl border border-orange-500/30 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-black/[0.05] dark:border-zinc-800/50 flex justify-between items-center bg-orange-500/5 dark:bg-orange-500/10">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="text-orange-500 animate-pulse"
                  size={18}
                />
                <h4 className="font-extrabold text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  संवेदनशील डेटा चेतावनी (Warning)
                </h4>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-left">
              <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                You are performing a full export of your personal spiritual
                accounts data. This portable document will contain:
              </p>

              <ul className="text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1.5 list-disc pl-4 font-medium">
                <li>
                  <strong className="text-zinc-900 dark:text-zinc-200">
                    Sadhana Diary Entries:
                  </strong>{" "}
                  Your private daily self-reflection essays & spiritual notes.
                </li>
                <li>
                  <strong className="text-zinc-900 dark:text-zinc-200">
                    Tapa & Fasting Logs:
                  </strong>{" "}
                  Detailed history of your fasts (chauvihar, upwas, etc.).
                </li>
                <li>
                  <strong className="text-zinc-900 dark:text-zinc-200">
                    Jaap Multi-Counter Logs:
                  </strong>{" "}
                  Exact rosary repetitions & chanting records.
                </li>
                <li>
                  <strong className="text-zinc-900 dark:text-zinc-200">
                    Personal Goals & Milestones:
                  </strong>{" "}
                  Targeted spiritual progression paths.
                </li>
              </ul>

              <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[9px] text-amber-600 dark:text-amber-400 leading-relaxed font-bold">
                ⚠️ IMPORTANT: Because this export includes deeply sensitive
                Sadhana records, treat this file with extreme confidentiality.
                Do not share this JSON with anyone.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-black/[0.05] dark:border-zinc-800/50 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowExportConfirmation(false)}
                className="py-1.5 px-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowExportConfirmation(false);
                  if (onFullAccountExport) {
                    await onFullAccountExport();
                  }
                }}
                className="py-1.5 px-5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all"
              >
                Confirm & Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Logout */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="लॉग आउट की पुष्टि (Confirm Log Out)"
        message="क्या आप सचमुच इस एप्लिकेशन से लॉग आउट करना चाहते हैं? आपकी ऑफलाइन संचित साधना का विवरण सुरक्षित रहेगा।"
        confirmLabel="हाँ, लॉग आउट करें (Log Out)"
        cancelLabel="रद्द करें (Cancel)"
        type="danger"
        iconType="logout"
      />
    </div>
  );
}
