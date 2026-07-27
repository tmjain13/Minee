import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Clock, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, ShieldCheck, Calendar, Plus, Trash2, CheckCircle2, ChevronRight, ChevronDown, Info, Coffee, Sun, Moon, BookOpen, TrendingUp, Download, FileText, Wind, Flame, Timer, RefreshCw, Mic, FlameKindling, CheckSquare, X, Loader2, Send, GripVertical, ArrowUp, ArrowDown, Tag, Filter, Bookmark, Search, BellRing, ArrowUpDown, Award, Compass } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { 
  getLocalData, 
  saveLocalData, 
  createSadhanaRecord, 
  syncPendingRecords, 
  isOnline 
} from '../services/sadhanaOfflineSync';
import { Registry } from '../integrations/ComponentRegistry';
import { KNOWLEDGE_BASE } from '../data/knowledge';
import ArticleReader from './ArticleReader';
import { LeshyaDhyanVisualizer, ShvasPrekshaGuidedBreathing } from './PrekshaGuidedPractices';
import SadhanaGoalsAndPoints from './SadhanaGoalsAndPoints';

// Lazy-loaded components from the Component Registry
const DhyanTimer = Registry.DhyanTimer;
const TapaScheduler = Registry.TapaScheduler;
const SadhanaDiary = Registry.SadhanaDiary;
const SadhanaGratitude = Registry.SadhanaGratitude;
const NavkarMantra = Registry.NavkarMantra;
const DailySuvichar = Registry.DailySuvichar;
const PratikramanGuide = Registry.PratikramanGuide;
const RitualFlow = Registry.RitualFlow;
const TapaLeaderboard = Registry.TapaLeaderboard;
const SadhalaAuthAndPanchangHub = Registry.SadhalaAuthAndPanchangHub;
const TerapanthGoldAdditions = Registry.TerapanthGoldAdditions;
const SevaLedger = Registry.SevaLedger;
const PushNotificationSimulator = Registry.PushNotificationSimulator;
const SadhanaTracker = Registry.SadhanaTracker;
const BeadCounter = Registry.BeadCounter;
const HabitsCalendar = Registry.HabitsCalendar;
const SadhanaStreaks = Registry.SadhanaStreaks;
const RozKiSalah = Registry.RozKiSalah;
const AudioCenter = Registry.AudioCenter;


interface FastingLog {
  id: string;
  type: string;
  duration?: number;
  date: string;
  timestamp: any;
}

const FASTING_TYPES = [
  { id: 'upvas', name: 'Upvas', desc: 'Complete 24h fast', impact: 20 },
  { id: 'ekasana', name: 'Ekasana', desc: 'One meal a day', impact: 5 },
  { id: 'biyasana', name: 'Biyasana', desc: 'Two meals a day', impact: 3 },
  { id: 'chauvihar', name: 'Chauvihar', desc: 'No food/water after sunset', impact: 2 },
  { id: 'navkarsi', name: 'Navkarsi', desc: 'Fast until 48m after sunrise', impact: 1 },
];

const MantraRing = ({ count, color, name, streak }: { count: number; color: string; name: string; streak: number }) => {
  const progress = (count % 108) / 108;
  const isMultipleOf108 = count > 0 && count % 108 === 0;

  return (
    <div className="relative flex flex-col items-center">
      {streak > 0 && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-4 -right-4 z-10 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20"
        >
          <Sparkles size={8} />
          {streak} MALA STREAK
        </motion.div>
      )}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-black/5 dark:text-white/5"
          />
          <motion.circle
            initial={{ strokeDashoffset: 377 }}
            animate={{ 
              strokeDashoffset: 377 - (377 * progress),
              scale: isMultipleOf108 ? [1, 1.05, 1] : 1,
            }}
            transition={{ 
              strokeDashoffset: { duration: 0.5, ease: "easeOut" },
              scale: { type: "keyframes", duration: 0.5, repeat: isMultipleOf108 ? 3 : 0 }
            }}
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="377"
            className={`${color} stroke-linecap-round filter ${isMultipleOf108 ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : ''}`}
          />
        </svg>
        <AnimatePresence>
          {isMultipleOf108 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 2] }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 rounded-full border-4 ${color} opacity-20`}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
        
        {/* Haptic-like visual pulse on every increment */}
        <AnimatePresence mode="popLayout">
          {count > 0 && (
            <motion.div
              key={`pulse-${count}`}
              initial={{ opacity: 0.3, scale: 1 }}
              animate={{ opacity: 0, scale: 1.2 }}
              className={`absolute inset-0 rounded-full border-2 ${color} pointer-events-none`}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            animate={{ scale: isMultipleOf108 ? 1.25 : 1, opacity: 1 }}
            className={`text-2xl font-black font-mono transition-colors ${isMultipleOf108 ? 'text-amber-500' : 'text-gray-700 dark:text-gray-200'}`}
          >
            {count % 108}
          </motion.span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">/ 108</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h4 className={`text-[10px] font-black uppercase tracking-tight ${color}`}>{name}</h4>
        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Jaap: {count}</p>
      </div>
    </div>
  );
};

const TapaImpactChart = ({ logs }: { logs: FastingLog[] }) => {
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];
    
    // Sort logs by date ascending
    const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    
    // Last 30 days filtering
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = sortedLogs.filter(log => new Date(log.date) >= thirtyDaysAgo);

    let cumulativeImpact = 0;
    return recentLogs.map(log => {
      const typeInfo = FASTING_TYPES.find(t => t.id === log.type);
      const impact = (typeInfo?.impact || 0) * (log.duration || 1);
      cumulativeImpact += impact;
      return {
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impact: cumulativeImpact
      };
    });
  }, [logs]);

  if (chartData.length < 2) return null;

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '12px', 
              border: 'none', 
              fontSize: '10px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            labelStyle={{ fontWeight: 800, color: '#f97316' }}
          />
          <Area 
            type="monotone" 
            dataKey="impact" 
            stroke="#f97316" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorImpact)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const KarmicLoadChart = ({ logs, mantraCounts }: { logs: FastingLog[], mantraCounts: { [key: string]: number } }) => {
  const chartData = useMemo(() => {
    // Generate last 30 days
    const data = [];
    let cumulativeReduction = 0;
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(l => l.date === ds);
      const dayImpact = dayLogs.reduce((acc, l) => acc + (FASTING_TYPES.find(t => t.id === l.type)?.impact || 0) * (l.duration || 1), 0);
      
      // Mantra impact (simplified)
      const mantraImpact = (mantraCounts[ds] || 0) / 108;
      
      cumulativeReduction += (dayImpact + mantraImpact);
      
      // Karmic load starts at 1000 and reduces
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        load: Math.max(0, 1000 - cumulativeReduction)
      });
    }
    return data;
  }, [logs, mantraCounts]);

  return (
    <div className="h-56 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }}
            minTickGap={20}
          />
          <YAxis hide domain={['dataMin - 50', '1000']} />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              fontSize: '10px',
              fontWeight: 700
            }}
          />
          <Line 
            type="monotone" 
            dataKey="load" 
            stroke="#6366f1" 
            strokeWidth={4} 
            dot={false}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DAILY_REFLECTIONS = [
  "How did your choices today reflect the principle of Anekantavada (non-absolutism)?",
  "In what moment today did you feel the most equanimity (Samayik)?",
  "Whom did you practice forgiveness towards today?",
  "What 'Kashaya' (passion/impurity) was most dominant today, and how did you observe it?",
  "How did you practice Aparigraha (non-attachment) in your consumption today?",
  "What is one thing you are grateful to your Guru for today?",
  "How did your speech reflect truthfulness (Satya) and kindness (Ahimsa) today?"
];

const SadhanaTab = memo(({ 
  mantraAudioCueEnabled, 
  dailyStreak = 0, 
  ambientSoundEnabled, 
  vibrationIntensity, 
  spiritualSoundscape,
  readHistory = [],
  combinedKnowledge = [],
  handleKnowledgeView,
  setActiveTab,
  setShareToast,
  initialSubTab,
  todos = [],
  setTodos,
  todoInput = "",
  setTodoInput,
  handleAddTodo,
  handleToggleTodo,
  handleDeleteTodo,
  onQuickPrayer,
  archivedTodos = [],
  setArchivedTodos
}: { 
  mantraAudioCueEnabled?: boolean; 
  dailyStreak?: number; 
  ambientSoundEnabled?: boolean; 
  vibrationIntensity?: 'none' | 'gentle' | 'pulsing' | 'steady'; 
  spiritualSoundscape?: 'om' | 'temple_bells' | 'nature';
  readHistory?: any[];
  combinedKnowledge?: any[];
  handleKnowledgeView?: (item: any) => void;
  setActiveTab?: (tab: any) => void;
  setShareToast?: (toast: { show: boolean; message: string }) => void;
  initialSubTab?: 'timer' | 'fasting' | 'mantra' | 'breathwork' | 'diary' | 'swadhya' | 'gratitude' | 'suvichar' | 'pratikraman' | 'audio' | 'seva' | 'notifications' | 'salah' | 'streaks' | 'habits' | 'goals';
  todos?: any[];
  setTodos?: any;
  todoInput?: string;
  setTodoInput?: any;
  handleAddTodo?: () => void;
  handleToggleTodo?: (id: string) => void;
  handleDeleteTodo?: (id: string) => void;
  onQuickPrayer?: () => void;
  archivedTodos?: any[];
  setArchivedTodos?: any;
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  // --- Swadhya and Article Reader State ---
  const [activeReadingArticle, setActiveReadingArticle] = useState<any | null>(null);
  const [localReadHistory, setLocalReadHistory] = useState<any[]>([]);

  const effectiveKnowledge = useMemo(() => {
    return combinedKnowledge && combinedKnowledge.length > 0 ? combinedKnowledge : KNOWLEDGE_BASE;
  }, [combinedKnowledge]);

  useEffect(() => {
    if (!user) {
      // Local storage fallback for offline/guest mode
      try {
        const localStr = localStorage.getItem('sadhana_swadhya_read_history');
        if (localStr) {
          setLocalReadHistory(JSON.parse(localStr));
        } else if (readHistory && readHistory.length > 0) {
          setLocalReadHistory(readHistory);
        }
      } catch (err) {
        console.warn("Failed to load local swadhya read history:", err);
      }
      return;
    }
    const path = `users/${user.uid}/readHistory`;
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLocalReadHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("Failed to listen to Swadhya read history:", err);
      if (readHistory && readHistory.length > 0 && localReadHistory.length === 0) {
        setLocalReadHistory(readHistory);
      }
    });
    return () => unsubscribe();
  }, [user, readHistory]);

  const markArticleAsRead = async (item: any) => {
    const isAlreadyRead = localReadHistory.some(rh => rh.itemId === item.id);
    if (isAlreadyRead) return;

    const newRecord = {
      itemId: item.id,
      title: item.title,
      category: item.category,
      timestamp: new Date().toISOString()
    };

    if (!user) {
      const updated = [newRecord, ...localReadHistory];
      setLocalReadHistory(updated);
      localStorage.setItem('sadhana_swadhya_read_history', JSON.stringify(updated));
      return;
    }

    try {
      const path = `users/${user.uid}/readHistory`;
      await addDoc(collection(db, path), {
        ...newRecord,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to save read history to firestore:", err);
      const updated = [newRecord, ...localReadHistory];
      setLocalReadHistory(updated);
    }
  };

  const onArticleClick = (item: any) => {
    markArticleAsRead(item);
    if (handleKnowledgeView) {
      handleKnowledgeView(item);
    } else {
      setActiveReadingArticle(item);
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<'timer' | 'fasting' | 'mantra' | 'breathwork' | 'diary' | 'swadhya' | 'gratitude' | 'suvichar' | 'pratikraman' | 'audio' | 'seva' | 'notifications' | 'salah' | 'streaks' | 'habits' | 'goals'>('timer');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [showImmersiveNavkar, setShowImmersiveNavkar] = useState(false);

  // --- Quick Alarm State Handling ---
  const [sunriseAlarm, setSunriseAlarm] = useState(() => {
    return localStorage.getItem('sadhana_sunrise_alarm') === 'true';
  });
  const [sunsetAlarm, setSunsetAlarm] = useState(() => {
    return localStorage.getItem('sadhana_sunset_alarm') === 'true';
  });
  const [alarmVolume, setAlarmVolume] = useState(() => {
    return localStorage.getItem('sadhana_alarm_volume') || 'medium';
  });
  const [geoTracking, setGeoTracking] = useState(() => {
    return localStorage.getItem('sadhana_alarm_geo_tracking') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sadhana_sunrise_alarm', String(sunriseAlarm));
  }, [sunriseAlarm]);

  useEffect(() => {
    localStorage.setItem('sadhana_sunset_alarm', String(sunsetAlarm));
  }, [sunsetAlarm]);

  useEffect(() => {
    localStorage.setItem('sadhana_alarm_volume', alarmVolume);
  }, [alarmVolume]);

  useEffect(() => {
    localStorage.setItem('sadhana_alarm_geo_tracking', String(geoTracking));
  }, [geoTracking]);

  const [hideReadKnowledge, setHideReadKnowledge] = useState(false);
  
  // Ambient Sound Controller
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  if (showImmersiveNavkar) {
    return <NavkarMantra onClose={() => setShowImmersiveNavkar(false)} />;
  }

  // Samayik Timer State
  const [timeLeft, setTimeLeft] = useState(48 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localSoundscape, setLocalSoundscape] = useState<'om' | 'temple_bells' | 'nature'>(() => {
    return (localStorage.getItem('sadhana_local_soundscape') as any) || spiritualSoundscape || 'om';
  });
  const [isListening, setIsListening] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sadhana Session Journaling States
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(48);
  const [sessionMood, setSessionMood] = useState("🧘 शांत");
  const [sessionJournalText, setSessionJournalText] = useState(() => {
    try {
      return localStorage.getItem('sadhana_summary_observation_autosave') || "";
    } catch (e) {
      return "";
    }
  });
  const [sessionEmotionalState, setSessionEmotionalState] = useState("");
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  // Auto-save observation text area input to localStorage on change
  useEffect(() => {
    try {
      if (sessionJournalText) {
        localStorage.setItem('sadhana_summary_observation_autosave', sessionJournalText);
      } else {
        localStorage.removeItem('sadhana_summary_observation_autosave');
      }
    } catch (e) {
      console.warn("Observation autosave error:", e);
    }
  }, [sessionJournalText]);

  // Compute meditation duration trend across the last 7 sessions
  const last7MeditationSessionsData = useMemo(() => {
    let savedSessions: { date: string; duration: number }[] = [];
    try {
      const raw = localStorage.getItem('sadhana_meditation_recent_sessions');
      if (raw) savedSessions = JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to load recent meditation sessions", e);
    }

    if (!savedSessions || savedSessions.length === 0) {
      const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];
      const defaults = [15, 20, 30, 25, 48, 30, sessionDuration || 48];
      return days.map((day, idx) => ({
        session: day,
        duration: defaults[idx]
      }));
    }

    const last6 = savedSessions.slice(-6);
    const points = last6.map((s, idx) => ({
      session: s.date || `S-${idx + 1}`,
      duration: s.duration
    }));

    points.push({
      session: 'Current',
      duration: sessionDuration || 48
    });

    while (points.length < 7) {
      points.unshift({
        session: `S-${points.length + 1}`,
        duration: 15 + (points.length * 5)
      });
    }

    return points.slice(-7);
  }, [sessionDuration]);

  const startVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (setShareToast) {
        setShareToast({ show: true, message: "Speech recognition is not supported in this browser." });
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes("start") || transcript.includes("play")) {
        if (!isActive) handleToggleSamayik();
        if (setShareToast) setShareToast({ show: true, message: "Voice Command: Started Samayik" });
      } else if (transcript.includes("stop") || transcript.includes("pause")) {
        if (isActive) handleToggleSamayik();
        if (setShareToast) setShareToast({ show: true, message: "Voice Command: Paused Samayik" });
      } else if (transcript.includes("reset")) {
        setTimeLeft(48 * 60);
        if (setShareToast) setShareToast({ show: true, message: "Voice Command: Reset Samayik Timer" });
      } else {
        if (setShareToast) setShareToast({ show: true, message: `Command not recognized: "${transcript}"` });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Breathwork State
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'hold_out'>('idle');
  const [breathTechnique, setBreathTechnique] = useState<'prana' | 'dirgha' | 'samavritti'>('prana');
  const [breathTime, setBreathTime] = useState(120); // 2 minutes in seconds
  const [isBreathActive, setIsBreathActive] = useState(false);
  const [breathPhaseSecondsLeft, setBreathPhaseSecondsLeft] = useState<number>(0);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only attempt to start playback if sound is enabled and component is active
    const soundEnabled = ambientSoundEnabled || isAudioEnabled;
    if (soundEnabled && (isActive || isBreathActive)) {
      const soundUrls = {
        om: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        temple_bells: '/assets/peaceful-bell.mp3',
        nature: 'https://raw.githubusercontent.com/scottschiller/soundmanager2/master/demo/_mp3/rain.mp3'
      };
      
      const currentUrl = soundUrls[localSoundscape || 'om'] || soundUrls.om;

      if (!ambientAudioRef.current) {
        try {
          const audio = new Audio(currentUrl);
          audio.loop = true;
          audio.volume = 0.3;
          ambientAudioRef.current = audio;
        } catch (e) {
          console.error('Failed to create Audio object:', e);
        }
      } else if (ambientAudioRef.current.src !== currentUrl) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = currentUrl;
        ambientAudioRef.current.load();
      }
      
      // Always play from current state
      ambientAudioRef.current.play().catch(e => {
        console.warn('Autoplay may be restricted, please interact with the page to enable audio:', e);
      });
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    }
  }, [ambientSoundEnabled, isAudioEnabled, isActive, isBreathActive, localSoundscape]);

  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isBreathActive) {
      setBreathPhase('idle');
      setBreathPhaseSecondsLeft(0);
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    const getInitialSeconds = () => {
      if (breathTechnique === 'prana') return 4;
      if (breathTechnique === 'dirgha') return 6;
      return 5;
    };

    setBreathPhase('inhale');
    setBreathPhaseSecondsLeft(getInitialSeconds());

    breathTimerRef.current = setInterval(() => {
      setBreathTime(prev => {
        if (prev <= 1) {
          setIsBreathActive(false);
          return 0;
        }
        return prev - 1;
      });

      setBreathPhaseSecondsLeft(prevSec => {
        if (prevSec <= 1) {
          let nextPhase: 'idle' | 'inhale' | 'hold' | 'exhale' | 'hold_out' = 'inhale';
          let nextSec = 4;

          setBreathPhase(curr => {
            if (breathTechnique === 'prana') {
              if (curr === 'inhale') {
                nextPhase = 'hold';
                nextSec = 7;
              } else if (curr === 'hold') {
                nextPhase = 'exhale';
                nextSec = 8;
              } else {
                nextPhase = 'inhale';
                nextSec = 4;
              }
            } else if (breathTechnique === 'dirgha') {
              if (curr === 'inhale') {
                nextPhase = 'hold';
                nextSec = 6;
              } else if (curr === 'hold') {
                nextPhase = 'exhale';
                nextSec = 6;
              } else if (curr === 'exhale') {
                nextPhase = 'hold_out';
                nextSec = 6;
              } else {
                nextPhase = 'inhale';
                nextSec = 6;
              }
            } else { // samavritti
              if (curr === 'inhale') {
                nextPhase = 'hold';
                nextSec = 5;
              } else if (curr === 'hold') {
                nextPhase = 'exhale';
                nextSec = 5;
              } else if (curr === 'exhale') {
                nextPhase = 'hold_out';
                nextSec = 5;
              } else {
                nextPhase = 'inhale';
                nextSec = 5;
              }
            }
            return nextPhase;
          });

          return nextSec;
        }
        return prevSec - 1;
      });
    }, 1000);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isBreathActive, breathTechnique]);

  // Fasting State
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [selectedFast, setSelectedFast] = useState('chauvihar');
  const [fastingDuration, setFastingDuration] = useState(1);

  // Mantra Multi-Counter
  const [mantras, setMantras] = useState([
    { id: 'navkar', name: 'Navkar Mantra', count: 0, color: 'text-spiritual', streak: 0 },
    { id: 'bhikshu', name: 'Acharya Bhikshu Jaap', count: 0, color: 'text-orange-500', streak: 0 },
    { id: 'mahashraman', name: 'Mahashraman Jaap', count: 0, color: 'text-blue-500', streak: 0 }
  ]);
  const [autoContinueMala, setAutoContinueMala] = useState(false);

  // Chanting speed prediction states & speed calibration variables
  const [mantraLogs, setMantraLogs] = useState<any[]>([]);
  const [predictionTarget, setPredictionTarget] = useState<number>(1008);
  const [selectedSpeedMode, setSelectedSpeedMode] = useState<'historical' | 'live' | 'standard'>('standard');
  const [manualChantsPerMin, setManualChantsPerMin] = useState<number>(15);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [clickIntervals, setClickIntervals] = useState<number[]>([]);

  // Fetch recent mantra logs from Firestore under user profile
  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/mantraLogs`;
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMantraLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("Mantra logs read permission checkout:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // Compute live chanting speed based on user's real tapping intervals
  const liveChantingSpeed = useMemo(() => {
    if (clickIntervals.length === 0) return 15;
    const avgInterval = clickIntervals.reduce((a, b) => a + b, 0) / clickIntervals.length;
    return Math.max(5, Math.min(120, Math.round(60 / avgInterval)));
  }, [clickIntervals]);

  // Compute historical average chanting speed from past logged session records in Firestore
  const historicalChantingSpeed = useMemo(() => {
    if (!mantraLogs || mantraLogs.length < 2) return 15;
    const sortedLogs = [...mantraLogs]
      .filter(l => l.timestamp)
      .map(l => ({
        timestamp: l.timestamp?.seconds 
          ? l.timestamp.seconds * 1000 
          : (l.timestamp?.toDate ? l.timestamp.toDate().getTime() : new Date(l.timestamp).getTime()),
        count: l.count || 0
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    let totalDurationMs = 0;
    let totalChantsCalculated = 0;

    for (let i = 1; i < sortedLogs.length; i++) {
      const diff = sortedLogs[i].timestamp - sortedLogs[i - 1].timestamp;
      // Group contiguous session logs added within 10 minutes of each other
      if (diff > 500 && diff < 10 * 60 * 1000) {
        totalDurationMs += diff;
        totalChantsCalculated += sortedLogs[i].count;
      }
    }

    if (totalDurationMs > 0 && totalChantsCalculated > 0) {
      const chantsPerMin = (totalChantsCalculated / (totalDurationMs / (60 * 1000)));
      if (chantsPerMin >= 5 && chantsPerMin <= 200) {
        return Math.round(chantsPerMin);
      }
    }
    return 15; // default comfortable pace (1 chant every 4 seconds)
  }, [mantraLogs]);

  // Derive active chanting speed based on selected mode
  const activeChantingSpeed = useMemo(() => {
    if (selectedSpeedMode === 'live') {
      return clickIntervals.length > 0 ? liveChantingSpeed : 15;
    }
    if (selectedSpeedMode === 'historical') {
      return historicalChantingSpeed;
    }
    return manualChantsPerMin;
  }, [selectedSpeedMode, liveChantingSpeed, historicalChantingSpeed, manualChantsPerMin, clickIntervals]);

  // Calculate today's accumulative count
  const totalMantraCountToday = useMemo(() => {
    return mantras.reduce((sum, m) => sum + m.count, 0);
  }, [mantras]);

  const remainingCount = useMemo(() => {
    return Math.max(0, predictionTarget - totalMantraCountToday);
  }, [predictionTarget, totalMantraCountToday]);

  const estimatedMinutesRemaining = useMemo(() => {
    if (activeChantingSpeed <= 0) return 0;
    return remainingCount / activeChantingSpeed;
  }, [remainingCount, activeChantingSpeed]);

  const formattedEstimatedTime = useMemo(() => {
    const mins = estimatedMinutesRemaining;
    if (mins <= 0) return "Completed! 🎉";
    
    const totalSecs = Math.round(mins * 60);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    let str = "";
    if (h > 0) str += `${h}h `;
    if (m > 0 || h > 0) str += `${m}m `;
    str += `${s}s`;
    return str;
  }, [estimatedMinutesRemaining]);

  // Global Stats
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleSamayik = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      setIsActive(p => !p);
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsProcessing(false);
    }
  };

  const playMalaCue = () => {
    if (!mantraAudioCueEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
      
      setTimeout(() => audioCtx.close(), 1000);
    } catch (e) {
      console.error('Audio cue failed', e);
    }
  };

  const playSoftChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime); // 528Hz Solfeggio / Om frequency
      osc.frequency.exponentialRampToValueAtTime(1056, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 2.5);
      setTimeout(() => audioCtx.close(), 3000);
    } catch (e) {
      console.error('Chime audio error:', e);
    }
  };

  const handleQuickPrayer = () => {
    playSoftChime();
    if ('vibrate' in navigator) {
      navigator.vibrate([60, 40, 60]);
    }
    setActiveSubTab('timer');
    setTimeLeft(5 * 60);
    setSessionDuration(5);
    setIsActive(true);
    if (setShareToast) {
      setShareToast({
        show: true,
        message: 'Quick Prayer: 5-Minute Meditation Started 🕊️'
      });
    }
  };

  const reflection = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_REFLECTIONS[day % DAILY_REFLECTIONS.length];
  }, []);

  const mantraCountsByDay = useMemo(() => {
    // In a real app we'd fetch this from mantraLogs
    // For now, mapping current counts to today
    const ds = new Date().toISOString().split('T')[0];
    return { [ds]: mantras.reduce((acc, m) => acc + m.count, 0) };
  }, [mantras]);

  useEffect(() => {
    if (!user) return;
    // Fetch Global Leaderboard (mocking results if collection empty)
    const q = query(collection(db, 'leaderboard'), orderBy('streak', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setLeaderboard([
          { name: 'Kushal J.', streak: 124, city: 'Ladnun' },
          { name: 'Mehta S.', streak: 98, city: 'Delhi' },
          { name: 'Anita B.', streak: 72, city: 'Mumbai' }
        ]);
      } else {
        setLeaderboard(snapshot.docs.map(doc => doc.data()));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'leaderboard');
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setSessionDuration(48);
            setShowJournalModal(true);
            if (interval) clearInterval(interval);

            // Celebrate long meditation milestone (>= 30 mins)
            try {
              confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.6 },
                colors: ['#f97316', '#fbbf24', '#10b981', '#6366f1']
              });
            } catch (e) {
              console.warn("Confetti animation error:", e);
            }

            // Goal reached: Completion heavy haptics [150ms play, 100ms pause, etc]
            if ('vibrate' in navigator) {
              navigator.vibrate([150, 100, 150, 100, 300]);
            }
            return 0;
          }
          
          // Tactile Milestones
          if (prev === 24 * 60 + 1) { // Halfway milestone (24 minutes)
            if ('vibrate' in navigator) {
              navigator.vibrate([80, 80, 80]); // Double tactile feedback pulses
            }
          } else if (prev === 5 * 60 + 1) { // 5 minutes remaining
            if ('vibrate' in navigator) {
              navigator.vibrate([60, 60, 60, 60, 60]); // Alert triple vibration pulsars
            }
          }
          
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    if (!user) return;

    // Load fasting logs from IndexedDB first to render instantly offline
    getLocalData('fastingLogs').then(cachedLogs => {
      if (cachedLogs && cachedLogs.length > 0) {
        setFastingLogs(cachedLogs as FastingLog[]);
      }
    });

    const path = `users/${user.uid}/fastingLogs`;
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FastingLog));
      setFastingLogs(logs);
      
      // Update IndexedDB cache in the background
      logs.forEach(log => {
        saveLocalData('fastingLogs', log);
      });
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    });

    // Handle auto-reconnect sync for all queued records
    const handleOnline = () => {
      syncPendingRecords(user.uid);
    };
    window.addEventListener('online', handleOnline);
    if (isOnline()) {
      syncPendingRecords(user.uid);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogFast = async () => {
    if (!user) return;
    try {
      const newLog = {
        type: selectedFast,
        duration: fastingDuration,
        date: new Date().toISOString().split('T')[0]
      };
      await createSadhanaRecord(user.uid, 'fastingLogs', newLog);
      
      // Update local state immediately for instant feedback
      const localLog: FastingLog = {
        id: `local_${Date.now()}`,
        ...newLog,
        timestamp: Date.now()
      };
      setFastingLogs(prev => [localLog, ...prev]);
      setFastingDuration(1); // Reset
    } catch (err) {
      console.error('[SadhanaTab] Error logging fast:', err);
    }
  };

  const logMeditation = async (minutes: number) => {
    if (!user) return;
    try {
      await createSadhanaRecord(user.uid, 'meditationLogs', {
        minutes,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('[SadhanaTab] Error logging meditation:', err);
    }
  };

  const handleSaveSadhanaJournal = async () => {
    if (!user) return;
    setIsSavingJournal(true);
    try {
      // 1. Log meditation duration offline-first
      await createSadhanaRecord(user.uid, 'meditationLogs', {
        minutes: Number(sessionDuration) || 1,
        date: new Date().toISOString().split('T')[0]
      });

      // 2. Save spiritual journal entry offline-first in local diary store
      const dateId = new Date().toISOString().split('T')[0];
      const journalEntry = {
        id: dateId,
        text: `🧘 साधना सत्र अवधि: ${sessionDuration} मिनट\nमूड: ${sessionMood}\n${sessionJournalText || "मौन और आत्म-निरीक्षण।"}\n\n✨ "साधना संपन्न। निरंतर अभ्यास से आत्म-शुद्धि होती है और कषायों का शमन होता है।"`,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      
      await createSadhanaRecord(user.uid, 'diary', journalEntry);

      // Trigger tactile vibration
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 150]);
      }

      // Success feedback
      if (setShareToast) {
        setShareToast({ 
          show: true, 
          message: `साधना सत्र (${sessionDuration} मिनट) व डायरी प्रविष्टि सफलतापूर्वक सहेजी गई! 🕊️` 
        });
      }

      // Record session duration into recent sessions history
      try {
        const existing = JSON.parse(localStorage.getItem('sadhana_meditation_recent_sessions') || '[]');
        const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const updated = [...existing, { date: todayLabel, duration: Number(sessionDuration) || 1 }].slice(-14);
        localStorage.setItem('sadhana_meditation_recent_sessions', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update recent session history', e);
      }

      // Clear observation autosave
      localStorage.removeItem('sadhana_summary_observation_autosave');

      // Trigger celebratory confetti for long meditation milestone (>= 30 mins)
      if (Number(sessionDuration) >= 30) {
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#f97316', '#fbbf24', '#10b981', '#6366f1', '#ec4899']
          });
        } catch (e) {
          console.warn('Confetti error:', e);
        }
      }

      // Reset states
      setShowJournalModal(false);
      setSessionJournalText("");
      setSessionEmotionalState("");
      // Reset timer
      setTimeLeft(48 * 60);
      setIsActive(false);

    } catch (err) {
      console.error('[SadhanaTab] Error saving sadhana journal:', err);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleSaveQuickNote = async () => {
    if (!user) return;
    setIsSavingJournal(true);
    try {
      // 1. Log meditation duration offline-first
      await createSadhanaRecord(user.uid, 'meditationLogs', {
        minutes: Number(sessionDuration) || 1,
        date: new Date().toISOString().split('T')[0]
      });

      // 2. Prepend the date prefix automatically
      const dateId = new Date().toISOString().split('T')[0];
      const formattedDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const datePrefix = `[${formattedDate}] `;
      const thoughts = sessionJournalText ? sessionJournalText : "मौन और आत्म-निरीक्षण (Silent reflection).";
      const fullNoteText = `${datePrefix}🧘 साधना सत्र: ${sessionDuration} मिनट | मूड: ${sessionMood} | विचार: ${thoughts}`;

      // 3. Save to the main spiritual journal collection in firestore directly
      const recordRef = doc(db, `users/${user.uid}/spiritualJournal`, dateId);
      await setDoc(recordRef, {
        text: fullNoteText,
        mood: sessionMood,
        emotionalState: sessionEmotionalState || "एकाग्र",
        createdAt: new Date().toISOString()
      }, { merge: true });

      // 4. Save to the local offline-first diary as well
      const journalEntry = {
        id: dateId,
        text: fullNoteText,
        date: formattedDate
      };
      await createSadhanaRecord(user.uid, 'diary', journalEntry);

      // Trigger tactile vibration
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 150]);
      }

      // Success feedback
      if (setShareToast) {
        setShareToast({ 
          show: true, 
          message: `क्विक नोट सफलतापूर्वक साधना जर्नल में सहेजा गया! 🕊️` 
        });
      }

      // Clear observation autosave
      localStorage.removeItem('sadhana_summary_observation_autosave');

      // Reset states
      setShowJournalModal(false);
      setSessionJournalText("");
      setSessionEmotionalState("");
      // Reset timer
      setTimeLeft(48 * 60);
      setIsActive(false);

    } catch (err) {
      console.error('[SadhanaTab] Error saving quick note:', err);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleShareSadhana = async () => {
    const shareText = `🕊️ मैंने अभी ${sessionDuration} मिनट की समता साधना (Samayik Sadhana) पूर्ण की है! मेरी मनःस्थिति: ${sessionMood}.\n\nतेरापंथ AI हब के साथ अपनी आध्यात्मिक यात्रा शुरू करें।`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sadhana Completed 🧘‍♂️',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard and show toast
      try {
        await navigator.clipboard.writeText(shareText);
        if (setShareToast) {
          setShareToast({ show: true, message: "Sadhana status copied to clipboard! Share with friends. 🕊️" });
        }
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  const handleDownloadSessionPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Add titles
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(239, 68, 68); // Rose-500
      pdf.text("Minee - Jain Terapanth Hub", 105, 30, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55); // Gray-800
      pdf.text("Sadhana Session Summary Report", 105, 45, { align: 'center' });
      
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 55, 190, 55);
      
      pdf.setFontSize(12);
      pdf.setFont("Helvetica", "normal");
      pdf.setTextColor(75, 85, 99); // Gray-600
      
      pdf.text(`User: ${user?.displayName || 'Spiritual Seeker'}`, 20, 70);
      pdf.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 20, 80);
      pdf.text(`Session Duration: ${sessionDuration} Minutes`, 20, 90);
      pdf.text(`Post-Session Mood: ${sessionMood}`, 20, 100);
      if (sessionEmotionalState) {
        pdf.text(`Emotional State: ${sessionEmotionalState}`, 20, 110);
      }
      
      const thoughtsText = sessionJournalText ? sessionJournalText : "Moun & Atma-Nirikshan (Silent Contemplation)";
      pdf.text("Session Journal & Reflections:", 20, 125);
      
      pdf.setFont("Helvetica", "italic");
      const splitThoughts = pdf.splitTextToSize(thoughtsText, 170);
      pdf.text(splitThoughts, 20, 135);
      
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(220, 104, 3); // Orange
      pdf.text("Sadhana Benefits & Spiritual Merits:", 20, 175);
      
      pdf.setFont("Helvetica", "normal");
      pdf.setTextColor(75, 85, 99);
      pdf.text("1. Samvara and Nirjara - Calming past karmic vibrations and checking influx.", 25, 185);
      pdf.text("2. Samata - Calming anger, pride, deceit, and greed (Kashaya).", 25, 193);
      pdf.text("3. Swadhyay - Inner awareness and purification of the soul.", 25, 201);
      
      pdf.line(20, 220, 190, 220);
      
      pdf.setFontSize(10);
      pdf.setFont("Helvetica", "italic");
      pdf.text("🕊️ ' nirantara abhyaasa se aatmasuddhi hotee hai aur kashaayon ka shaman hota hai. '", 105, 235, { align: 'center' });
      
      pdf.save(`Sadhana_Session_${new Date().toISOString().split('T')[0]}.pdf`);
      
      if (setShareToast) {
        setShareToast({ show: true, message: "Sadhana Session Summary PDF downloaded successfully! 📄" });
      }
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  const incrementMantra = async (id: string, isFullMala: boolean = false) => {
    // Capture click timings for live chanting speed calculations
    const nowTiming = Date.now();
    if (lastClickTime) {
      const diffS = (nowTiming - lastClickTime) / 1000;
      if (diffS > 0.4 && diffS < 8) { // realistic comfortable single chant lengths
        setClickIntervals(prev => [diffS, ...prev].slice(0, 5));
      }
    }
    setLastClickTime(nowTiming);

    // Trigger vibration based on intensity
    if (vibrationIntensity !== 'none') {
      let pattern = [30];
      if (vibrationIntensity === 'pulsing') pattern = [30, 50, 30];
      if (vibrationIntensity === 'steady') pattern = [50];
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    }

    setMantras(prev => prev.map(m => {
      if (m.id === id) {
        const newCount = isFullMala ? (autoContinueMala ? m.count + 216 : m.count + 108) : m.count + 1;
        
        // Trigger audio cue if a mala is completed
        const oldMalaTotal = Math.floor(m.count / 108);
        const newMalaTotal = Math.floor(newCount / 108);
        const isMalaComplete = newMalaTotal > oldMalaTotal || isFullMala;

        if (isMalaComplete) {
          playMalaCue();
          
          // Tactical '108' Pulse for mala completion (Goal reached)
          if (vibrationIntensity !== 'none' && 'vibrate' in navigator) {
            let malaPattern = [100, 50, 100];
            if (vibrationIntensity === 'pulsing') malaPattern = [100, 50, 100, 50, 100];
            if (vibrationIntensity === 'steady') malaPattern = [200];
            navigator.vibrate(malaPattern);
          }
        } else {
          // Tactical feedback at milestones 11 and 27 beads within current mala
          const currentMalaBeads = newCount % 108;
          if (currentMalaBeads === 11) {
            if ('vibrate' in navigator) {
              navigator.vibrate([40, 40, 40]); // Mini double pulse at 11 beads
            }
          } else if (currentMalaBeads === 27) {
            if ('vibrate' in navigator) {
              navigator.vibrate([50, 50, 50, 50, 50]); // Quarter-mala pulse at 27 beads
            }
          }
        }

        const newStreak = isFullMala ? m.streak + 1 : m.streak;
        
        // Trigger confetti on 7-mala milestones
        if (isFullMala && newStreak > 0 && newStreak % 7 === 0) {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#f97316', '#fbbf24', '#ffffff']
          });
        }

        return { ...m, count: newCount, streak: newStreak };
      }
      return m;
    }));
    
    if (user) {
      try {
        await createSadhanaRecord(user.uid, 'mantraLogs', {
          mantraId: id,
          count: isFullMala ? 108 : 1,
          isFullMala,
          date: new Date().toISOString().split('T')[0]
        });
      } catch (err) {
        console.warn('[SadhanaTab] Silently cached mantra log offline');
      }
    }
  };

  const handleExportCSV = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      // In a real implementation with thousands of records, we'd query by date range
      // For this app, we'll fetch recent records
      const reportData: { [key: string]: any } = {};
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Setup labels for days
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        reportData[ds] = { date: ds, fasting: '-', meditation: 0, navkar: 0, bhikshu: 0, mahashraman: 0 };
      }

      // Fetch Fasting Logs
      fastingLogs.forEach(log => {
        if (reportData[log.date]) reportData[log.date].fasting = log.type;
      });

      // Fetch Meditation and Mantra logs would be done here via firestore queries
      // For the demo purposes, we will generate the CSV based on available data and some simulated logic
      // if those collections are empty (first time use)

      const csvRows = [
        ['Date', 'Fasting Type', 'Duration (Days)', 'Meditation (Min)', 'Navkar Jaap', 'Acharya Bhikshu Jaap', 'Mahashraman Jaap'].join(',')
      ];

      Object.values(reportData)
        .sort((a: any, b: any) => b.date.localeCompare(a.date))
        .forEach((day: any) => {
          // Find log for duration if exists
          const log = fastingLogs.find(l => l.date === day.date);
          csvRows.push([
            day.date,
            day.fasting,
            log?.duration || 1,
            day.meditation,
            day.navkar,
            day.bhikshu,
            day.mahashraman
          ].join(','));
        });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Sadhana_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!user) return;
    setIsExporting(true);
    
    try {
      // Dynamically import heavy PDF dependencies
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Create a temporary hidden container for the report
      const reportContainer = document.createElement('div');
      reportContainer.id = 'sadhana-report-temp';
      reportContainer.style.position = 'fixed';
      reportContainer.style.left = '-9999px';
      reportContainer.style.top = '0';
      reportContainer.style.width = '800px'; // A4-ish width
      reportContainer.style.backgroundColor = 'white';
      reportContainer.style.padding = '40px';
      reportContainer.style.color = '#1f2937'; // gray-800
      reportContainer.style.fontFamily = 'serif';
      
      const title = document.createElement('h1');
      title.innerText = 'Sadhana Progress Report';
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.textAlign = 'center';
      title.style.marginBottom = '20px';
      title.style.color = '#4f46e5'; // indigo-600
      reportContainer.appendChild(title);
      
      const subTitle = document.createElement('p');
      subTitle.innerText = `Report generated for ${user.displayName || 'Spiritual Seeker'} on ${new Date().toLocaleDateString()}`;
      subTitle.style.textAlign = 'center';
      subTitle.style.fontSize = '12px';
      subTitle.style.marginBottom = '40px';
      reportContainer.appendChild(subTitle);

      // Add summary stats
      const statsGrid = document.createElement('div');
      statsGrid.style.display = 'grid';
      statsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      statsGrid.style.gap = '20px';
      statsGrid.style.marginBottom = '40px';

      const addStat = (label: string, value: string) => {
        const div = document.createElement('div');
        div.style.padding = '20px';
        div.style.backgroundColor = '#f9fafb';
        div.style.borderRadius = '16px';
        div.style.textAlign = 'center';
        div.innerHTML = `<p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af;">${label}</p><p style="font-size: 20px; font-weight: bold;">${value}</p>`;
        statsGrid.appendChild(div);
      };

      const totalImpact = fastingLogs.reduce((acc, log) => acc + (FASTING_TYPES.find(t => t.id === log.type)?.impact || 0), 0);
      addStat('Karmic Impact', totalImpact.toString());
      addStat('Total Fasting', fastingLogs.length.toString());
      addStat('Mantra Streak', mantras[0].streak.toString());
      reportContainer.appendChild(statsGrid);

      // Add actual data table
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '12px';
      
      const head = table.createTHead();
      const hRow = head.insertRow();
      ['Date', 'Type', 'Duration', 'Impact'].forEach(t => {
        const cell = hRow.insertCell();
        cell.innerText = t;
        cell.style.fontWeight = 'bold';
        cell.style.padding = '12px';
        cell.style.borderBottom = '2px solid #e5e7eb';
        cell.style.textAlign = 'left';
      });

      const body = table.createTBody();
      fastingLogs.slice(0, 15).forEach(log => {
        const row = body.insertRow();
        [log.date, log.type, `${log.duration || 1}d`, (FASTING_TYPES.find(t => t.id === log.type)?.impact || 0).toString()].forEach(t => {
          const cell = row.insertCell();
          cell.innerText = t;
          cell.style.padding = '10px 12px';
          cell.style.borderBottom = '1px solid #f3f4f6';
        });
      });
      reportContainer.appendChild(table);

      // Add simple visual charts
      const chartTitle = document.createElement('h3');
      chartTitle.innerText = 'Weekly Progress Visual';
      chartTitle.style.fontSize = '16px';
      chartTitle.style.fontWeight = 'bold';
      chartTitle.style.marginTop = '40px';
      chartTitle.style.marginBottom = '20px';
      reportContainer.appendChild(chartTitle);

      const chartFlex = document.createElement('div');
      chartFlex.style.display = 'flex';
      chartFlex.style.alignItems = 'flex-end';
      chartFlex.style.gap = '10px';
      chartFlex.style.height = '150px';
      chartFlex.style.padding = '20px';
      chartFlex.style.backgroundColor = '#f3f4f6';
      chartFlex.style.borderRadius = '16px';

      // Last 7 days progress
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const dayLogs = fastingLogs.filter(l => l.date === ds);
        const dayImpact = dayLogs.reduce((acc, l) => acc + (FASTING_TYPES.find(t => t.id === l.type)?.impact || 0), 0);
        
        const barContainer = document.createElement('div');
        barContainer.style.flex = '1';
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        barContainer.style.gap = '5px';

        const bar = document.createElement('div');
        bar.style.width = '100%';
        const height = Math.min(100, (dayImpact / 50) * 100); // normalized
        bar.style.height = `${height}px`;
        bar.style.backgroundColor = '#f97316';
        bar.style.borderRadius = '4px';
        barContainer.appendChild(bar);

        const label = document.createElement('span');
        label.innerText = d.toLocaleDateString('en-US', { weekday: 'short' });
        label.style.fontSize = '8px';
        label.style.fontWeight = 'bold';
        label.style.color = '#9ca3af';
        barContainer.appendChild(label);

        chartFlex.appendChild(barContainer);
      }
      reportContainer.appendChild(chartFlex);

      const footer = document.createElement('p');
      footer.innerText = '"The journey toward self-realization begins with discipline."';
      footer.style.textAlign = 'center';
      footer.style.fontSize = '10px';
      footer.style.marginTop = '40px';
      footer.style.fontStyle = 'italic';
      footer.style.color = '#9ca3af';
      reportContainer.appendChild(footer);

      document.body.appendChild(reportContainer);

      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Sadhana_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      document.body.removeChild(reportContainer);
    } catch (err) {
      console.error('PDF Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-32 px-4"
    >
      {dailyStreak !== undefined && dailyStreak > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-orange-500/10 rounded-[2rem] border border-orange-500/20 shadow-sm overflow-hidden relative group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl text-orange-500">
              <Flame size={20} className={dailyStreak % 7 === 0 ? "animate-bounce" : ""} />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Sadhana Continuity</p>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {dailyStreak} Day Streak
                {dailyStreak % 7 === 0 && (
                  <span className="flex items-center gap-1 text-[8px] bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    <Sparkles size={8} /> MILESTONE
                  </span>
                )}
              </h3>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => {
              const isActive = (dailyStreak % 7 === 0) ? true : (i < (dailyStreak % 7));
              return (
                <div 
                  key={i} 
                  className={`w-1.5 h-6 rounded-full transition-all duration-500 ${
                    isActive ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} 
                />
              );
            })}
          </div>
          
          {dailyStreak % 7 === 0 && (
            <div className="absolute inset-0 bg-orange-500/5 backdrop-blur-[2px] animate-pulse pointer-events-none" />
          )}
        </div>
      )}

      {/* 🎯 DAILY SPIRITUAL GOALS & 7-DAY RECHARTS POINTS TREND & 6 PM REMINDER */}
      <SadhanaGoalsAndPoints />

      {/* Quick Alarm Toggle Dashboard */}
      <div id="quick-alarm-dashboard" className="bg-[var(--card-bg)] border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-4 shadow-md backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <Timer size={16} className="text-orange-500 shrink-0" />
              Quick Alarm Dashboard (त्वरित अलार्म)
            </h3>
            <p className="text-[10px] text-gray-500 leading-normal">
              Toggle automatic alerts synced to regional Sunrise (Pratah-Navkarsi) and Sunset (Chauvihar) boundaries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Auto Geo-Tracking</span>
            <button
              id="geo-toggle"
              onClick={() => setGeoTracking(prev => !prev)}
              className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 relative outline-none focus:outline-none ${
                geoTracking ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              title="Locate via GPS continuously"
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  geoTracking ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sunrise Alert Card */}
          <div 
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
              sunriseAlarm 
                ? 'bg-amber-500/5 border-amber-500/25 dark:border-amber-500/20' 
                : 'bg-black/[0.01] dark:bg-white/[0.01] border-black/5 dark:border-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                sunriseAlarm ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-gray-150 dark:bg-gray-800 text-gray-400'
              }`}>
                <Sun size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100">Pratah Navkarsi Alarm</h4>
                <p className="text-[9px] text-gray-400">Alerts 48 minutes post-sunrise.</p>
              </div>
            </div>
            <button
              onClick={() => setSunriseAlarm(prev => !prev)}
              className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 relative shrink-0 outline-none focus:outline-none ${
                sunriseAlarm ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
              title="Toggle morning fast end alert"
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                  sunriseAlarm ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sunset Alert Card */}
          <div 
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
              sunsetAlarm 
                ? 'bg-orange-500/5 border-orange-500/25 dark:border-orange-500/20' 
                : 'bg-black/[0.01] dark:bg-white/[0.01] border-black/5 dark:border-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                sunsetAlarm ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-gray-150 dark:bg-gray-800 text-gray-400'
              }`}>
                <Moon size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100">Chauvihar Sunset Alarm</h4>
                <p className="text-[9px] text-gray-400">Alerts 3 minutes prior to Sunset.</p>
              </div>
            </div>
            <button
              onClick={() => setSunsetAlarm(prev => !prev)}
              className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 relative shrink-0 outline-none focus:outline-none ${
                sunsetAlarm ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
              title="Toggle sunset fasting start alert"
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                  sunsetAlarm ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5 font-sans">
            <Volume2 size={12} className="text-orange-500" />
            <span>Volume level:</span>
            {['low', 'medium', 'high'].map(vol => (
              <button
                key={vol}
                onClick={() => setAlarmVolume(vol)}
                className={`px-2 py-0.5 font-bold uppercase rounded transition-all text-[8px] cursor-pointer ${
                  alarmVolume === vol 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'bg-black/5 dark:bg-white/5 text-gray-400 hover:text-gray-650 dark:hover:text-gray-300'
                }`}
              >
                {vol}
              </button>
            ))}
          </div>
          {geoTracking && (
            <span className="text-[9px] text-emerald-500 font-bold animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              GPS tracking active
            </span>
          )}
        </div>
      </div>

      {/* 🧘‍♂️ DAIY SADHANA COMPONENT (CUSTOM REGISTER RULES CHECKOFF) */}
      <SadhanaTracker />

      {/* Expanded Sadhana Portals Navigation Links */}
      <div className="bg-[var(--card-bg)] border border-black/5 dark:border-white/5 rounded-3xl p-5 space-y-3 shadow-md">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">Sadhana Portals</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => {
              if (setActiveTab) {
                setActiveTab('navkar');
              } else {
                setActiveSubTab('mantra');
              }
            }}
            className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 rounded-2xl transition-all duration-300 text-left cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span className="text-xs font-bold truncate">Navkar Mantra</span>
          </button>

          <button
            onClick={() => {
              if (setActiveTab) {
                setActiveTab('pratikraman');
              } else {
                setActiveSubTab('pratikraman');
              }
            }}
            className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 rounded-2xl transition-all duration-300 text-left cursor-pointer"
          >
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span className="text-xs font-bold truncate">Pratikraman</span>
          </button>

          <button
            onClick={() => setActiveTab?.('leaderboard')}
            className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 rounded-2xl transition-all duration-300 text-left cursor-pointer"
          >
            <TrendingUp size={16} className="text-indigo-500 shrink-0" />
            <span className="text-xs font-bold truncate">Tapa Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab?.('journal')}
            className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 rounded-2xl transition-all duration-300 text-left cursor-pointer"
          >
            <FileText size={16} className="text-rose-500 shrink-0" />
            <span className="text-xs font-bold truncate">Spiritual Journal</span>
          </button>

          <button
            onClick={() => setActiveTab?.('paryushana')}
            className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 rounded-2xl transition-all duration-300 text-left cursor-pointer col-span-2 sm:col-span-1"
          >
            <Calendar size={16} className="text-orange-500 shrink-0" />
            <span className="text-xs font-bold truncate">Paryushana</span>
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 p-0.5 bg-black/5 dark:bg-white/5 rounded-2xl sticky top-0 z-20 backdrop-blur-md overflow-x-auto no-scrollbar scroll-smooth">
        {(['timer', 'goals', 'salah', 'breathwork', 'mantra', 'fasting', 'diary', 'swadhya', 'gratitude', 'suvichar', 'pratikraman', 'audio', 'seva', 'notifications', 'streaks', 'habits'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-none px-3 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-white dark:bg-gray-800 text-spiritual shadow-sm shadow-black/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            {tab === 'timer' && 'Samayik'}
            {tab === 'goals' && (language === 'hi' ? 'दैनिक लक्ष्य' : 'Daily Goals')}
            {tab === 'salah' && 'रोज की सलाह'}
            {tab === 'breathwork' && 'Breathwork'}
            {tab === 'mantra' && 'Jaap'}
            {tab === 'fasting' && 'Tapa'}
            {tab === 'diary' && 'Diary'}
            {tab === 'swadhya' && 'Swadhya'}
            {tab === 'gratitude' && 'Gratitude'}
            {tab === 'suvichar' && 'Suvichar'}
            {tab === 'pratikraman' && 'Ritual Flow'}
            {tab === 'audio' && 'Amritvani Audio'}
            {tab === 'seva' && 'Seva Ledger'}
            {tab === 'notifications' && 'Bulletin Board'}
            {tab === 'streaks' && 'Sadhana Streaks'}
            {tab === 'habits' && 'Habits Calendar'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'breathwork' && (
          <motion.div
            key="breathwork"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8 py-8 px-4 max-w-xl mx-auto"
          >
            {/* Spiritual Header */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-orange-600 dark:text-orange-400 serif-text tracking-wide">
                {breathTechnique === 'prana' && 'प्राण-प्रेक्षा (Prana-Preksha)'}
                {breathTechnique === 'dirgha' && 'दीर्घ श्वास-प्रेक्षा (Dirgha Shvas-Preksha)'}
                {breathTechnique === 'samavritti' && 'समवृत्ति श्वास-प्रेक्षा (Samavritti Preksha)'}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-1.5 rounded-full inline-block">
                Preksha Breath-Pacing Sadhana
              </p>
            </div>

            {/* Breathing Technique Selection Tabs */}
            <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-full">
              {(['prana', 'dirgha', 'samavritti'] as const).map((tech) => (
                <button
                  key={tech}
                  disabled={isBreathActive}
                  onClick={() => {
                    setBreathTechnique(tech);
                    if (tech === 'prana') {
                      setBreathPhaseSecondsLeft(4);
                    } else if (tech === 'dirgha') {
                      setBreathPhaseSecondsLeft(6);
                    } else {
                      setBreathPhaseSecondsLeft(5);
                    }
                  }}
                  className={`flex-1 py-3 px-1 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isBreathActive ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    breathTechnique === tech
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {tech === 'prana' && 'Prana-Preksha'}
                  {tech === 'dirgha' && 'Dirgha Shvas'}
                  {tech === 'samavritti' && 'Samavritti'}
                </button>
              ))}
            </div>

            {/* Session Duration Selector */}
            {!isBreathActive && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Duration:</span>
                <div className="flex gap-1.5">
                  {[120, 300, 600].map((len) => (
                    <button
                      key={len}
                      onClick={() => { setBreathTime(len); }}
                      className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        breathTime === len 
                          ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400' 
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300'
                      }`}
                    >
                      {len / 60} min
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Animated Circles Visualizer Stage */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Spinning background boundary lines */}
              <div className={`absolute inset-0 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 transition-all duration-1000 ${isBreathActive ? 'animate-[spin_40s_linear_infinite] opacity-60' : 'opacity-30'}`} />
              <div className="absolute inset-5 rounded-full border border-black/5 dark:border-white/5 opacity-50" />
              
              {/* Glowing Ambient Halo Circle */}
              <motion.div
                animate={{
                  scale: breathPhase === 'inhale' ? 1.5 : (breathPhase === 'hold' ? 1.5 : (breathPhase === 'exhale' ? 0.9 : 1.0)),
                  opacity: breathPhase === 'idle' ? 0.1 : [0.2, 0.45, 0.2]
                }}
                transition={{
                  scale: {
                    duration: breathPhase === 'inhale' ? (breathTechnique === 'prana' ? 4 : (breathTechnique === 'dirgha' ? 6 : 5)) :
                              breathPhase === 'hold' ? (breathTechnique === 'prana' ? 7 : (breathTechnique === 'dirgha' ? 6 : 5)) :
                              breathPhase === 'exhale' ? (breathTechnique === 'prana' ? 8 : (breathTechnique === 'dirgha' ? 6 : 5)) : 1,
                    ease: "easeInOut"
                  },
                  opacity: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
                className={`absolute w-36 h-36 rounded-full blur-3xl transition-colors duration-1000 ${
                  breathPhase === 'inhale' ? 'bg-orange-500/40' :
                  breathPhase === 'hold' ? 'bg-amber-500/50' :
                  breathPhase === 'exhale' ? 'bg-emerald-500/40' :
                  breathPhase === 'hold_out' ? 'bg-indigo-500/30' : 'bg-zinc-400/20'
                }`}
              />

              {/* Dynamic Scaling Breath-Pacing Circle */}
              <motion.div
                animate={{
                  scale: breathPhase === 'inhale' ? 1.45 : (breathPhase === 'hold' ? 1.45 : (breathPhase === 'exhale' ? 0.92 : 1.0)),
                  borderColor: breathPhase === 'inhale' ? 'rgba(249, 115, 22, 0.5)' : 
                               breathPhase === 'hold' ? 'rgba(245, 158, 11, 0.6)' : 
                               breathPhase === 'exhale' ? 'rgba(16, 185, 129, 0.5)' : 
                               breathPhase === 'hold_out' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(228, 228, 231, 0.2)'
                }}
                transition={{
                  duration: breathPhase === 'inhale' ? (breathTechnique === 'prana' ? 4 : (breathTechnique === 'dirgha' ? 6 : 5)) :
                            breathPhase === 'hold' ? (breathTechnique === 'prana' ? 7 : (breathTechnique === 'dirgha' ? 6 : 5)) :
                            breathPhase === 'exhale' ? (breathTechnique === 'prana' ? 8 : (breathTechnique === 'dirgha' ? 6 : 5)) :
                            breathPhase === 'hold_out' ? (breathTechnique === 'prana' ? 0 : (breathTechnique === 'dirgha' ? 6 : 5)) : 1,
                  ease: "easeInOut"
                }}
                className={`w-40 h-40 rounded-full shadow-2xl flex flex-col items-center justify-center backdrop-blur-sm border-4 transition-all duration-1000 relative z-10 bg-gradient-to-b ${
                  breathPhase === 'inhale' ? 'from-orange-500/10 to-orange-600/5 text-orange-600 dark:text-orange-400' :
                  breathPhase === 'hold' ? 'from-amber-500/15 to-amber-600/5 text-amber-600 dark:text-amber-400' :
                  breathPhase === 'exhale' ? 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400' :
                  breathPhase === 'hold_out' ? 'from-indigo-500/10 to-indigo-600/5 text-indigo-600 dark:text-indigo-400' : 'from-zinc-100/5 to-zinc-200/5 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <div className="text-center select-none p-4 space-y-1">
                  {/* Phase Text Devanagari */}
                  <motion.p
                    key={`hi-${breathPhase}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold font-sans tracking-wide leading-tight"
                  >
                    {breathPhase === 'idle' && 'तैयार'}
                    {breathPhase === 'inhale' && 'श्वास लें (पूरक)'}
                    {breathPhase === 'hold' && 'रोकें (कुंभक)'}
                    {breathPhase === 'exhale' && 'छोड़ें (रेचक)'}
                    {breathPhase === 'hold_out' && 'बाहर रोकें'}
                  </motion.p>
                  
                  {/* Phase Text English */}
                  <motion.p
                    key={`en-${breathPhase}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-500 dark:text-zinc-400"
                  >
                    {breathPhase === 'idle' && 'Ready'}
                    {breathPhase === 'inhale' && 'Inhale'}
                    {breathPhase === 'hold' && 'Hold'}
                    {breathPhase === 'exhale' && 'Exhale'}
                    {breathPhase === 'hold_out' && 'Hold Out'}
                  </motion.p>

                  {/* Seconds Remaining for current Phase */}
                  {isBreathActive && breathPhaseSecondsLeft > 0 && (
                    <motion.div
                      key={`breath-sec-${breathPhaseSecondsLeft}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-3xl font-black font-mono mt-1 text-zinc-800 dark:text-zinc-100 tracking-tight"
                    >
                      {breathPhaseSecondsLeft}s
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Concentric visual waves expanding continuously during active sessions */}
              <AnimatePresence>
                {isBreathActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0, 0.25, 0], scale: [1, 1.7, 2.2] }}
                    transition={{ type: "keyframes", duration: 3.5, repeat: Infinity, ease: "easeOut" }}
                    className={`absolute inset-0 border-2 rounded-full pointer-events-none ${
                      breathPhase === 'inhale' ? 'border-orange-500/20' :
                      breathPhase === 'hold' ? 'border-amber-500/20' :
                      breathPhase === 'exhale' ? 'border-emerald-500/20' : 'border-indigo-500/20'
                    }`}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Play controls, Time counter, Mute ambient music toggle */}
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="text-2xl font-mono font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2 bg-black/5 dark:bg-white/5 py-2 px-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
                <span className="text-sm">⏱️ Session Remaining:</span>
                <span>{Math.floor(breathTime / 60)}:{(breathTime % 60).toString().padStart(2, '0')}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Reset button */}
                {!isBreathActive && (
                  <button
                    onClick={() => setBreathTime(120)}
                    className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-200 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-sm active:scale-90"
                    title="Reset session length"
                  >
                    <RefreshCw size={18} />
                  </button>
                )}

                {/* Primary Play / Pause Button */}
                <button
                  onClick={() => {
                    if (!isBreathActive && breathTime === 0) setBreathTime(120);
                    setIsBreathActive(!isBreathActive);
                  }}
                  className={`flex items-center gap-3 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl cursor-pointer ${
                    isBreathActive 
                      ? 'bg-zinc-800 dark:bg-zinc-700 text-white shadow-zinc-800/20 hover:bg-zinc-900' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/25 hover:shadow-orange-600/35'
                  }`}
                >
                  {isBreathActive ? <Pause size={18} /> : <Play size={18} />}
                  {isBreathActive ? 'End Sadhana' : 'Start Sadhana'}
                </button>
              </div>
            </div>

            {/* Dynamic Step visualizer map */}
            <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Breathing Cycle Progress
                </h4>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {breathTechnique === 'prana' ? '3-Phases (पूरक-कुंभक-रेचक)' : '4-Phases (चतुष्कोणीय)'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {/* 1. Inhale */}
                <div className={`p-2 rounded-xl border transition-all ${breathPhase === 'inhale' ? 'bg-orange-500/10 border-orange-500/40 shadow-sm' : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent'}`}>
                  <div className={`text-xs font-black ${breathPhase === 'inhale' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-500'}`}>
                    {breathTechnique === 'prana' ? '4s' : breathTechnique === 'dirgha' ? '6s' : '5s'}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">श्वास लें</div>
                  <div className="text-[7px] text-zinc-400 dark:text-zinc-500">Puraka</div>
                </div>

                {/* 2. Hold In */}
                <div className={`p-2 rounded-xl border transition-all ${breathPhase === 'hold' ? 'bg-amber-500/10 border-amber-500/40 shadow-sm' : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent'}`}>
                  <div className={`text-xs font-black ${breathPhase === 'hold' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500'}`}>
                    {breathTechnique === 'prana' ? '7s' : breathTechnique === 'dirgha' ? '6s' : '5s'}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">रोकें</div>
                  <div className="text-[7px] text-zinc-400 dark:text-zinc-500">Antar Kumbhaka</div>
                </div>

                {/* 3. Exhale */}
                <div className={`p-2 rounded-xl border transition-all ${breathPhase === 'exhale' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm' : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent'}`}>
                  <div className={`text-xs font-black ${breathPhase === 'exhale' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                    {breathTechnique === 'prana' ? '8s' : breathTechnique === 'dirgha' ? '6s' : '5s'}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">छोड़ें</div>
                  <div className="text-[7px] text-zinc-400 dark:text-zinc-500">Rechaka</div>
                </div>

                {/* 4. Hold Out */}
                {breathTechnique !== 'prana' ? (
                  <div className={`p-2 rounded-xl border transition-all ${breathPhase === 'hold_out' ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm' : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent'}`}>
                    <div className={`text-xs font-black ${breathPhase === 'hold_out' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}`}>
                      {breathTechnique === 'dirgha' ? '6s' : '5s'}
                    </div>
                    <div className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">बाहर रोकें</div>
                    <div className="text-[7px] text-zinc-400 dark:text-zinc-500">Bahya Kumbhaka</div>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] border border-dashed border-zinc-200 dark:border-zinc-800 opacity-40 flex items-center justify-center text-[8px] font-black uppercase text-zinc-400 leading-tight">
                    Hold Out<br/>Skipped
                  </div>
                )}
              </div>

              {/* Description Guide Quote */}
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed text-center italic border-t border-black/5 dark:border-white/5 pt-3.5">
                {breathTechnique === 'prana' && '"Inhale spiritual energy, hold to absorb the cosmic vitality, and exhale attachments. This technique purifies physical pathways and preps for dhyan."'}
                {breathTechnique === 'dirgha' && '"Dirgha Shvas (Deep Breathwork) represents balanced self-control. Equalized pacing of Puraka, Rechaka, and Kumbhaka tranquilizes the kashayas."'}
                {breathTechnique === 'samavritti' && '"Equal-ratio Samavritti breath pacing induces absolute equanimity (Samatva). Prepare for Samayik by centering your wandering mind."'}
              </p>
            </div>

            {/* Specialized Preksha Guided Practices */}
            <div className="w-full max-w-md space-y-6">
              <ShvasPrekshaGuidedBreathing />
              <LeshyaDhyanVisualizer />
            </div>
          </motion.div>
        )}

        {activeSubTab === 'timer' && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-4 border-stone-200/60 flex flex-col items-center justify-center mx-auto my-4 relative">
              <svg className="w-full h-full absolute inset-0 transform -rotate-90" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-black/5 dark:text-white/5"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 754 }}
                  animate={{ 
                    strokeDashoffset: 754 - (754 * (1 - timeLeft / (48 * 60)))
                  }}
                  transition={{ duration: 1, ease: "linear" }}
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="754"
                  className="text-spiritual stroke-linecap-round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-black text-spiritual font-mono tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">
                  Equanimity Timer
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center gap-4 py-2 mb-4">
              <button
                onClick={startVoiceCommand}
                className={`p-4 rounded-2xl active:scale-90 transition-all ${isListening ? 'bg-orange-500 text-white animate-pulse' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}
                title="Voice Commands (Start, Stop, Reset)"
              >
                <Mic size={24} />
              </button>
              <button 
                onClick={() => setTimeLeft(48 * 60)}
                className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl text-gray-500 active:scale-90 transition-all"
              >
                <RotateCcw size={24} />
              </button>
              <button 
                onClick={handleToggleSamayik}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'} ${isActive ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-spiritual text-white shadow-spiritual/20'}`}
              >
                {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
              </button>
              <button 
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-4 rounded-2xl active:scale-90 transition-all ${isAudioEnabled ? 'bg-spiritual/10 text-spiritual' : 'bg-black/5 text-gray-400'}`}
              >
                {isAudioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
            </div>

            {/* QUICK-ACCESS SOUNDSCAPE SELECTOR */}
            <div className="flex flex-col gap-2.5 p-4 rounded-3xl border w-full max-w-md mx-auto shadow-sm bg-amber-50/40 border-amber-100/80 text-stone-800 dark:bg-stone-900/40 dark:border-stone-800 dark:text-stone-200">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Volume2 size={12} className="text-spiritual" />
                  {language === 'hi' ? 'अभ्यास संगीत' : 'Practice Soundscape'}
                </span>
                {!isAudioEnabled && (
                  <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase animate-pulse">
                    {language === 'hi' ? 'म्यूट' : 'Muted'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setLocalSoundscape('om');
                    localStorage.setItem('sadhana_local_soundscape', 'om');
                    if (!isAudioEnabled) {
                      setIsAudioEnabled(true);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex flex-col items-center gap-0.5 relative border ${
                    localSoundscape === 'om'
                      ? 'bg-spiritual text-white border-spiritual shadow-md shadow-orange-500/15'
                      : 'bg-white text-stone-600 hover:text-stone-800 border-stone-200 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:text-stone-200 dark:border-stone-800'
                  }`}
                >
                  <span className="font-semibold tracking-wide">
                    {language === 'hi' ? 'ॐ ध्वनि' : 'Om Chanting'}
                  </span>
                  <span className={`text-[8px] font-medium opacity-80`}>
                    {language === 'hi' ? 'ध्यान संगीत' : 'Meditative Drone'}
                  </span>
                  {localSoundscape === 'om' && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setLocalSoundscape('nature');
                    localStorage.setItem('sadhana_local_soundscape', 'nature');
                    if (!isAudioEnabled) {
                      setIsAudioEnabled(true);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex flex-col items-center gap-0.5 relative border ${
                    localSoundscape === 'nature'
                      ? 'bg-spiritual text-white border-spiritual shadow-md shadow-orange-500/15'
                      : 'bg-white text-stone-600 hover:text-stone-800 border-stone-200 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:text-stone-200 dark:border-stone-800'
                  }`}
                >
                  <span className="font-semibold tracking-wide">
                    {language === 'hi' ? 'प्रकृति ध्वनि' : 'Nature Sounds'}
                  </span>
                  <span className={`text-[8px] font-medium opacity-80`}>
                    {language === 'hi' ? 'शांत वर्षा' : 'Gentle Rain'}
                  </span>
                  {localSoundscape === 'nature' && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Session Journal Trigger Card */}
            <div className="w-full max-w-md bg-orange-500/5 border border-orange-500/10 p-5 rounded-3xl flex flex-col items-center text-center gap-3 shadow-sm mx-auto mb-4">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <FileText size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Sadhana Experience Journal</span>
              </div>
              <p className="text-[10px] text-gray-500 max-w-xs leading-normal">
                Did you complete or pause your Samayik session? Save your custom duration and mood directly into your Spiritual Journal in Firestore.
              </p>
              <button
                onClick={() => {
                  const elapsedSeconds = (48 * 60) - timeLeft;
                  const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
                  setSessionDuration(elapsedMinutes);
                  setShowJournalModal(true);
                }}
                className="w-full py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={14} />
                <span>Log & Journal This Session (सत्र दर्ज करें)</span>
              </button>
            </div>
            
            <DhyanTimer />

            <div className="w-full bg-spiritual/5 border border-spiritual/10 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-spiritual/20 rounded-xl text-spiritual">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="text-sm font-bold text-spiritual">Samayik Guidelines</h4>
              </div>
              <ul className="space-y-3">
                {[
                  "Recite 'Karey Mi Bhante' to initiate vows.",
                  "Stay in one clean designated place for 48 minutes.",
                  "Focus on Svadhyaya, meditation or chanting.",
                  "Maintain absolute equanimity of body & mind."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                    <div className="w-1 h-1 rounded-full bg-spiritual mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'mantra' && (
          <motion.div
            key="mantra"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10 pb-10"
          >
            {/* Immersive Navkar Mantra Banner */}
            <div className="bg-gradient-to-r from-emerald-600/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-6 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight serif-text text-emerald-800 dark:text-emerald-300">नवकार महामंत्र ध्यान साधना</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Experience the supreme Jain invocation in a full-screen spiritual chanting UI with an auto-advancing audio loop and progress rings.</p>
                </div>
              </div>
              <button
                onClick={() => setShowImmersiveNavkar(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 shrink-0"
              >
                Launch Immersive UI
              </button>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Auto-Continue Mala</span>
                <button
                    onClick={() => setAutoContinueMala(!autoContinueMala)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${autoContinueMala ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoContinueMala ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>
            <div className="mb-10">
              <BeadCounter />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mantras.map((mantra) => (
                <div key={mantra.id} className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-black/5 dark:border-white/5 shadow-xl flex flex-col items-center">
                  <MantraRing count={mantra.count} color={mantra.color} name={mantra.name} streak={mantra.streak} />
                  <div className="grid grid-cols-1 w-full gap-3 mt-8">
                    <button 
                      onClick={() => incrementMantra(mantra.id, false)}
                      className={`py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-black/5 font-black uppercase tracking-widest text-[10px] ${mantra.id === 'navkar' ? 'bg-spiritual text-white' : 'bg-black/5 text-gray-500'}`}
                    >
                      <Plus size={18} />
                      Increment Count
                    </button>
                    <button 
                      onClick={() => incrementMantra(mantra.id, true)}
                      className="py-4 bg-orange-500/10 dark:bg-orange-500/5 text-orange-600 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px] border border-orange-500/20"
                    >
                      <Sparkles size={18} />
                      Complete Mala
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Chanting Speed & Completion Predictor Card */}
            <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden">
               {/* Accent Background decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-black/5 dark:border-white/5 pb-5">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                     <Timer size={20} className="animate-pulse" />
                   </div>
                   <div>
                     <h3 className="text-sm font-black text-spiritual dark:text-white uppercase tracking-tight">Jaap Speed & Time Predictor</h3>
                     <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Real-time target predictions using Firestore history</p>
                   </div>
                 </div>

                 {/* Speed mode switchers */}
                 <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl text-[9px] font-black uppercase tracking-wider self-start sm:self-auto">
                   <button
                     type="button"
                     onClick={() => setSelectedSpeedMode('standard')}
                     className={`px-3 py-1.5 rounded-lg transition-all ${selectedSpeedMode === 'standard' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300 dark:hover:text-white'}`}
                   >
                     Custom Speed
                   </button>
                   <button
                     type="button"
                     onClick={() => setSelectedSpeedMode('historical')}
                     className={`px-3 py-1.5 rounded-lg transition-all ${selectedSpeedMode === 'historical' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300 dark:hover:text-white'}`}
                     title="Derived from your logs saved in Firestore"
                   >
                     Firestore History
                   </button>
                   <button
                     type="button"
                     onClick={() => setSelectedSpeedMode('live')}
                     className={`px-3 py-1.5 rounded-lg transition-all ${selectedSpeedMode === 'live' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300 dark:hover:text-white'}`}
                     title="Measures clicks on Increment Count button live"
                   >
                     Live Rhythm {clickIntervals.length > 0 && `(●)`}
                   </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 {/* Left Controls Column */}
                 <div className="space-y-5">
                   <div className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <span>Target Mantra Count</span>
                       <span className="font-mono text-orange-500 font-bold">{predictionTarget.toLocaleString()} Chants</span>
                     </div>
                     <input
                       type="number"
                       value={predictionTarget}
                       onChange={(e) => setPredictionTarget(Math.max(1, parseInt(e.target.value) || 0))}
                       className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-100 focus:outline-none focus:border-orange-500/50"
                     />
                     <div className="flex flex-wrap gap-1.5 pt-1">
                       {[108, 540, 1008, 2500, 5000].map(val => (
                         <button
                           key={val}
                           type="button"
                           onClick={() => setPredictionTarget(val)}
                           className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-md border transition-all ${predictionTarget === val ? 'bg-orange-500/10 text-orange-550 border-orange-500/30' : 'bg-black/5 dark:bg-white/5 border-transparent text-gray-400 hover:bg-black/10'}`}
                         >
                           {val === 108 ? '1 Mala (108)' : val === 1008 ? '10 Malas (1008)' : `${val}`}
                         </button>
                       ))}
                     </div>
                   </div>

                   {selectedSpeedMode === 'standard' && (
                     <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                         <span>Chanting Pace</span>
                         <span className="font-mono text-orange-550 font-bold">{manualChantsPerMin} Chants / min</span>
                       </div>
                       <input
                         type="range"
                         min="5"
                         max="60"
                         value={manualChantsPerMin}
                         onChange={(e) => setManualChantsPerMin(parseInt(e.target.value))}
                         className="w-full accent-orange-500 cursor-pointer h-1.5 bg-black/10 dark:bg-white/10 rounded-lg"
                       />
                       <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                         <span>Deliberate (5/min)</span>
                         <span>Fast (60/min)</span>
                       </div>
                     </div>
                   )}

                   {selectedSpeedMode === 'historical' && (
                     <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                       <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-normal">
                         Estimating speed from your <strong>Firestore logs</strong>. By measuring the intervals of your past chanting sessions, we calculated your natural pace:
                       </p>
                       <div className="flex items-baseline gap-2 pt-1">
                         <span className="text-2xl font-black text-orange-550 font-mono">{historicalChantingSpeed}</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">Chants / minute</span>
                       </div>
                       <p className="text-[8.5px] text-gray-400 leading-normal italic">
                         * Requires at least two chanting log entries in close proximity. Falls back to a standard calm pace of 15/min (4s per chant).
                       </p>
                     </div>
                   )}

                   {selectedSpeedMode === 'live' && (
                     <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-orange-500/10 space-y-2">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                         <span className="text-[9px] text-orange-500 font-black uppercase tracking-widest">Live Rhythm Calibration</span>
                       </div>
                       <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-normal">
                         Tap <strong>"Increment Count"</strong> above to sync the predictor with your live chanting heartbeats.
                       </p>
                       <div className="flex items-baseline gap-2 pt-1">
                         <span className="text-2xl font-black text-orange-550 font-mono">
                           {clickIntervals.length > 0 ? liveChantingSpeed : '—'}
                         </span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">
                           {clickIntervals.length > 0 ? 'Chants / minute' : 'Awaiting tap rhythm...'}
                         </span>
                       </div>
                       <p className="text-[8.5px] text-gray-400 leading-normal">
                         {clickIntervals.length > 0 
                           ? `Steady pace verified over the last ${clickIntervals.length} chanting taps.` 
                           : "Comfortable standard set to 15 chants / minute by default."}
                       </p>
                     </div>
                   )}
                 </div>

                 {/* Right Time Prediction Column */}
                 <div className="flex flex-col justify-between bg-orange-500/5 rounded-3xl p-6 border border-orange-500/10 dark:border-orange-500/5">
                   <div className="space-y-4">
                     <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Estimated Completion Time</span>
                     <div className="space-y-1">
                       <h2 className="text-4xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-tight leading-none animate-pulse">
                         {formattedEstimatedTime}
                       </h2>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest pt-1">
                         at {activeChantingSpeed} chants / minute
                       </p>
                     </div>
                   </div>

                   <div className="space-y-3 mt-6">
                     <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                       <span>Progress ({totalMantraCountToday}/{predictionTarget})</span>
                       <span>{Math.min(100, Math.round((totalMantraCountToday / predictionTarget) * 100))}%</span>
                     </div>
                     <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                       <motion.div 
                         className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full"
                         style={{ width: `${Math.min(100, (totalMantraCountToday / predictionTarget) * 100)}%` }}
                       />
                     </div>
                     <p className="text-[9.5px] text-gray-500 leading-normal font-medium italic">
                       {remainingCount > 0 
                         ? `Only ${remainingCount.toLocaleString()} chanting recitations remaining to reach your customized target daily mantra threshold.` 
                         : "Excellent spiritual discipline! You have hit and surpassed your customized target threshold for today. Keep ascending!"}
                     </p>
                   </div>
                 </div>
               </div>
            </div>



            {/* Global Leaderboard Section */}
            <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-black/5 dark:border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-sm font-black text-spiritual uppercase tracking-tight">Community Mala Streaks</h3>
              </div>
              
              <div className="space-y-3">
                {leaderboard.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-orange-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-amber-400 text-whiteShadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{item.name}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{item.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full text-orange-600 border border-orange-500/20">
                      <Sparkles size={10} />
                      <span className="text-[10px] font-black">{item.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-6">
                Streaks represent consecutive days of completing at least one mala.
              </p>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'fasting' && (
          <motion.div
            key="fasting"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10 pb-10"
          >
            <SadhalaAuthAndPanchangHub />
            <TapaScheduler />
            
            {/* Impact Visualization */}
            <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-black/5 dark:border-white/5 shadow-xl overflow-hidden">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                     <TrendingUp size={20} />
                   </div>
                   <h3 className="text-sm font-black text-spiritual uppercase tracking-tight">Karmic Load Reduction</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Total Impact</p>
                    <p className="text-lg font-black text-orange-600">
                      {fastingLogs.reduce((acc, log) => acc + (FASTING_TYPES.find(t => t.id === log.type)?.impact || 0), 0)}
                    </p>
                 </div>
               </div>
               <TapaImpactChart logs={fastingLogs} />
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-black/5 dark:border-white/5 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-spiritual uppercase tracking-tight">Tapa Determination</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Log your spiritual detox journey</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {FASTING_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedFast(type.id)}
                    className={`p-4 rounded-2xl flex flex-col items-start gap-1 transition-all border ${selectedFast === type.id ? 'bg-spiritual border-spiritual text-white shadow-lg shadow-spiritual/20' : 'bg-black/5 border-transparent text-gray-500 hover:bg-black/10'}`}
                  >
                    <div className="flex justify-between w-full">
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.name}</span>
                      {selectedFast === type.id && <CheckCircle2 size={12} />}
                    </div>
                    <p className={`text-[8px] font-bold ${selectedFast === type.id ? 'text-white/70' : 'text-gray-400'}`}>{type.desc}</p>
                  </button>
                ))}
              </div>

              {/* Fasting Duration Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration (Days)</h4>
                  <span className="text-xs font-black text-spiritual">{fastingDuration} Day{fastingDuration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 8, 15, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setFastingDuration(d)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all border ${fastingDuration === d ? 'bg-spiritual text-white border-spiritual' : 'bg-black/5 border-transparent text-gray-400'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleLogFast}
                disabled={!user}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 mb-3"
              >
                Log Tap for Today
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleExportCSV}
                  disabled={!user || isExporting}
                  className="w-full py-4 bg-spiritual/10 text-spiritual rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-spiritual/20 flex items-center justify-center gap-3 hover:bg-spiritual/20 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-spiritual border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Export CSV
                </button>

                <button 
                  onClick={handleExportPDF}
                  disabled={!user || isExporting}
                  className="w-full py-4 bg-orange-500/10 text-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-orange-500/20 flex items-center justify-center gap-3 hover:bg-orange-500/20 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText size={16} />
                  )}
                  Export PDF
                </button>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Recent Tap Log</h3>
               <div className="space-y-2">
                 {fastingLogs.length === 0 ? (
                   <div className="p-8 border-2 border-dashed border-black/5 rounded-[2rem] text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No logs found yet</p>
                   </div>
                 ) : (
                   fastingLogs.map((log) => (
                     <div key={log.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/30 rounded-2xl border border-black/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-spiritual/10 flex items-center justify-center text-spiritual">
                            {log.type === 'chauvihar' ? <Moon size={18} /> : <Sun size={18} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold capitalize text-spiritual">{log.type}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{log.date}</p>
                          </div>
                        </div>
                        <CheckCircle2 size={18} className="text-green-500" />
                     </div>
                   ))
                 )}
               </div>
            </div>

            <TapaLeaderboard />
          </motion.div>
        )}

        {activeSubTab === 'diary' && (
          <motion.div
            key="diary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <SadhanaDiary />
          </motion.div>
        )}

        {activeSubTab === 'swadhya' && (
          <motion.div
            key="swadhya"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 pb-6 text-left"
          >
            <TerapanthGoldAdditions setShareToast={setShareToast} />
            {/* Header / Intro Card */}
            <div className="p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-[2rem] border border-orange-500/10 relative overflow-hidden text-left">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 rotate-12 opacity-5 pointer-events-none">
                <BookOpen size={160} />
              </div>
              <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full font-black uppercase tracking-widest leading-none inline-block">
                Swadhya & Gyaan Logs
              </span>
              <h3 className="serif-text text-2xl font-bold mt-3 text-spiritual">
                Daily Study Progress
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Swadhya (spiritual self-study) is one of the pillars of Jain Sadhana. Practice introspection by reading completely through the verified knowledge registry, religious code indices, and historical timelines, and log your completions below in Firestore.
              </p>
            </div>

            {/* Read Stats Container */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 flex flex-col justify-between text-left">
                <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Total Completed</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black">{localReadHistory?.length || 0}</span>
                  <span className="text-xs font-bold text-gray-400 font-mono">/ {effectiveKnowledge?.length || 0} items</span>
                </div>
              </div>

              <div className="p-5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 flex flex-col justify-between text-left">
                <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Completion Rank</span>
                <span className="text-xl font-black mt-2 text-orange-600 dark:text-orange-400 leading-tight">
                  {(() => {
                    const pct = effectiveKnowledge?.length ? ((localReadHistory?.length || 0) / effectiveKnowledge.length) * 100 : 0;
                    if (pct >= 80) return 'Acharya Scholar';
                    if (pct >= 50) return 'Upadhyaya';
                    if (pct >= 20) return 'Sadhak';
                    return 'Beginner Swadhyayee';
                  })()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Knowledge Progress Bar</span>
                <span className="text-xs font-bold text-spiritual">
                  {(() => {
                    const pct = effectiveKnowledge?.length ? Math.round(((localReadHistory?.length || 0) / effectiveKnowledge.length) * 100) : 0;
                    return `${pct}% Complete`;
                  })()}
                </span>
              </div>
              <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${effectiveKnowledge?.length ? ((localReadHistory?.length || 0) / effectiveKnowledge.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Knowledge List and Search */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 text-left">
                  Agam, Rules, & History Items
                </h4>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setHideReadKnowledge(!hideReadKnowledge)}>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${hideReadKnowledge ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${hideReadKnowledge ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hide Read</span>
                </div>
              </div>

              <div className="space-y-3">
                {effectiveKnowledge?.filter(item => !hideReadKnowledge || !localReadHistory?.some(rh => rh.itemId === item.id)).map((item) => {
                  const isRead = localReadHistory?.some(rh => rh.itemId === item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => onArticleClick(item)}
                      className="group p-5 bg-white dark:bg-gray-800 hover:bg-orange-500/5 dark:hover:bg-orange-500/5 rounded-3xl border border-black/5 shadow-sm transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-extrabold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            {item.category}
                          </span>
                          {isRead && (
                            <span className="flex items-center gap-1 text-[8px] font-extrabold text-green-600 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
                              Completed ✓
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[var(--text-spiritual)] transition-colors group-hover:text-orange-500 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isRead ? 'bg-green-500/15 text-green-650 shadow-sm' : 'bg-black/5 dark:bg-white/5 text-gray-300 group-hover:text-spiritual group-hover:translate-x-0.5'
                      }`}>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'gratitude' && (
          <motion.div
            key="gratitude"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <SadhanaGratitude />
          </motion.div>
        )}

        {activeSubTab === 'suvichar' && (
          <motion.div
            key="suvichar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <DailySuvichar />
          </motion.div>
        )}

        {activeSubTab === 'pratikraman' && (
          <motion.div
            key="pratikraman"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <RitualFlow />
          </motion.div>
        )}

        {activeSubTab === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 pb-4"
          >
            <AudioCenter />
          </motion.div>
        )}

        {activeSubTab === 'seva' && (
          <motion.div
            key="seva"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <SevaLedger />
          </motion.div>
        )}

        {activeSubTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <PushNotificationSimulator />
          </motion.div>
        )}

        {activeSubTab === 'salah' && (
          <motion.div
            key="salah"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <RozKiSalah />
          </motion.div>
        )}

        {activeSubTab === 'streaks' && (
          <motion.div
            key="streaks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <SadhanaStreaks />
          </motion.div>
        )}

        {activeSubTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <HabitsCalendar />
          </motion.div>
        )}

        {activeSubTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pb-4"
          >
            <SadhanaGoalsSection 
              todos={todos} 
              setTodos={setTodos} 
              todoInput={todoInput} 
              setTodoInput={setTodoInput} 
              handleAddTodo={handleAddTodo} 
              handleToggleTodo={handleToggleTodo} 
              handleDeleteTodo={handleDeleteTodo}
              language={language}
              archivedTodos={archivedTodos}
              setArchivedTodos={setArchivedTodos}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧘‍♂️ SADHANA JOURNAL MODAL (NEW FEATURE INTEGRATION) */}
      <AnimatePresence>
        {showJournalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden my-8 text-left"
            >
              {/* Decorative brand corner glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowJournalModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-650 transition-colors cursor-pointer border-0 bg-transparent focus:outline-none"
                title="Cancel"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 text-center">
                <div className="inline-flex p-3 bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-400 mb-1">
                  <BookOpen size={24} className="animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-spiritual dark:text-white serif-text tracking-tight">
                  साधना सत्र सहेजें (Save Sadhana Session)
                </h3>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto leading-normal">
                  इस पवित्र सत्र के अनुभव और मनःस्थिति को अपने आध्यात्मिक जरनल (Spiritual Journal) में सुरक्षित करें।
                </p>
              </div>

              <div className="space-y-5">
                {/* Duration Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Sadhana Duration (सत्र की अवधि - मिनट में)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-150 focus:outline-none focus:border-orange-500/50 pl-10"
                    />
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <Clock size={16} />
                    </div>
                    <div className="absolute right-4 top-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Minutes
                    </div>
                  </div>
                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[10, 20, 30, 48].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSessionDuration(preset)}
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                          sessionDuration === preset
                            ? "bg-orange-500/10 text-orange-600 border-orange-500/30"
                            : "bg-black/5 dark:bg-white/5 border-transparent text-gray-400 hover:bg-black/10"
                        }`}
                      >
                        {preset === 48 ? "Samayik (48m)" : `${preset} min`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    How do you feel? (सत्र के बाद की मनःस्थिति)
                  </label>
                  <div className="grid grid-cols-5 gap-2.5">
                    {[
                      { emoji: "🧘", label: "शांत" },
                      { emoji: "😊", label: "प्रसन्न" },
                      { emoji: "😐", label: "सामान्य" },
                      { emoji: "😔", label: "उदास" },
                      { emoji: "😤", label: "क्रोधित" },
                    ].map((m) => {
                      const value = `${m.emoji} ${m.label}`;
                      const isSelected = sessionMood === value;
                      return (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setSessionMood(value)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 scale-105"
                              : "bg-black/5 dark:bg-white/5 border-transparent text-gray-500 hover:bg-black/10"
                          }`}
                        >
                          <span className="text-xl mb-1">{m.emoji}</span>
                          <span className="text-[8px] font-black uppercase tracking-wider truncate max-w-full">
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Emotional State (optional description) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Emotional State Accent (भाव तरंग - उदा. "स्थिर", "कृतज्ञ")
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. ध्यान में गहरा खिंचाव, कृतज्ञता का भाव..."
                    value={sessionEmotionalState}
                    onChange={(e) => setSessionEmotionalState(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-xs text-gray-750 dark:text-gray-150 focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                {/* 📈 7-SESSION MEDITATION DURATION TREND LINE CHART */}
                <div className="p-4 bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl border border-orange-500/15 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        ध्यान अवधि रुझान (Meditation Duration Trend - Last 7 Sessions)
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                      Avg: {Math.round(last7MeditationSessionsData.reduce((a, b) => a + b.duration, 0) / 7)} mins
                    </span>
                  </div>

                  <div className="w-full h-28 pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={last7MeditationSessionsData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                        <XAxis 
                          dataKey="session" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: '#9ca3af', fontWeight: 'bold' }} 
                        />
                        <YAxis 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: '#9ca3af' }}
                          unit="m"
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid rgba(249,115,22,0.3)',
                            backgroundColor: 'var(--card-bg, #ffffff)',
                            color: 'var(--text-main, #1c1917)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '6px 10px'
                          }}
                          formatter={(val: any) => [`${val} Minutes`, 'Duration']}
                          labelStyle={{ color: '#f97316', fontSize: '9px', fontWeight: '900' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="duration" 
                          stroke="#f97316" 
                          strokeWidth={2.5} 
                          dot={{ r: 3, fill: '#f97316', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 5, fill: '#ea580c' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Premium Sadhana Benefits Section with soft entrance animation */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/5 to-rose-500/5 border border-orange-500/10 dark:border-rose-500/10 space-y-2 text-left"
                >
                  <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-orange-500 animate-pulse" />
                    साधना के आध्यात्मिक लाभ (Spiritual Benefits)
                  </span>
                  <ul className="text-[10.5px] text-gray-650 dark:text-gray-300 space-y-1 font-semibold list-disc pl-3.5 leading-relaxed">
                    <li>सामायिक साधना से संवर और निर्जरा (Karmic shedding) होती है।</li>
                    <li>कषाय की शांति और मानसिक समता की प्राप्ति होती है।</li>
                    <li>आत्म-साक्षात्कार और परम शांति का मार्ग प्रशस्त होता है।</li>
                  </ul>
                </motion.div>

                {/* Journal Experience Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                      Sadhana Experience Journal (साधना अनुभव लेखन)
                    </label>
                    {sessionJournalText.trim().length > 0 && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-500/20">
                        <CheckCircle2 size={10} /> Auto-saved draft
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="इस सत्र में आपके क्या अनुभव रहे? कोई विशेष विचार या कषाय शांति जिसे आपने महसूस किया..."
                    value={sessionJournalText}
                    onChange={(e) => setSessionJournalText(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-xs text-gray-750 dark:text-gray-200 focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Share & Report Quick Actions */}
              <div className="grid grid-cols-2 gap-2.5 px-1 pb-1">
                <button
                  type="button"
                  onClick={handleDownloadSessionPDF}
                  className="py-2.5 px-3 bg-stone-55 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all border border-stone-200/50 dark:border-stone-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={11} className="text-stone-500 shrink-0" />
                  <span>Report (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareSadhana}
                  className="py-2.5 px-3 bg-stone-55 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all border border-stone-200/50 dark:border-stone-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={11} className="text-stone-500 shrink-0" />
                  <span>Share Status</span>
                </button>
              </div>

              {/* Save as Quick Note Button */}
              <div className="px-1 pb-1.5">
                <button
                  type="button"
                  onClick={handleSaveQuickNote}
                  disabled={isSavingJournal}
                  className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/15 text-rose-650 dark:text-rose-400 font-black text-[10.5px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-rose-500/15"
                >
                  <BookOpen size={12} className="shrink-0" />
                  <span>Save as Quick Note (क्विक नोट सहेजें)</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="flex-1 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSadhanaJournal}
                  disabled={isSavingJournal}
                  className="flex-1 py-3.5 bg-orange-650 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  {isSavingJournal ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Save & Log (सहेजें)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ArticleReader 
        isOpen={activeReadingArticle !== null}
        onClose={() => setActiveReadingArticle(null)}
        article={activeReadingArticle}
      />
    </motion.div>
  );
});

SadhanaTab.displayName = 'SadhanaTab';

const SadhanaGoalsSection = ({
  todos = [],
  setTodos,
  todoInput = "",
  setTodoInput,
  handleAddTodo = () => {},
  handleToggleTodo = () => {},
  handleDeleteTodo = () => {},
  language = "en",
  onQuickPrayer,
  archivedTodos = [],
  setArchivedTodos
}: {
  todos?: any[];
  setTodos: any;
  todoInput?: string;
  setTodoInput: any;
  handleAddTodo?: () => void;
  handleToggleTodo?: (id: string) => void;
  handleDeleteTodo?: (id: string) => void;
  language?: string;
  onQuickPrayer?: () => void;
  archivedTodos?: any[];
  setArchivedTodos?: any;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeConfettiId, setActiveConfettiId] = useState<string | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string>('All');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'impact_desc' | 'impact_asc'>('impact_desc');
  const [newGoalTag, setNewGoalTag] = useState<string>('Daily');
  const [newGoalCategory, setNewGoalCategory] = useState<string>('Sadhana');
  const [newImpact, setNewImpact] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueTimeInput, setDueTimeInput] = useState<string>('');
  const [activeMeditationId, setActiveMeditationId] = useState<string | null>(null);
  const [activeDiscourseId, setActiveDiscourseId] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [showArchivedModal, setShowArchivedModal] = useState<boolean>(false);
  const [isDiscoursePlaying, setIsDiscoursePlaying] = useState<boolean>(false);

  const SPIRITUAL_CATEGORIES = [
    { id: 'All', label: { en: 'All Categories', hi: 'सभी श्रेणियां' }, emoji: '📑' },
    { id: 'Samayik', label: { en: 'Samayik', hi: 'सामायिक' }, emoji: '🧘' },
    { id: 'Swadhyaya', label: { en: 'Swadhyaya', hi: 'स्वाध्याय' }, emoji: '📖' },
    { id: 'Japa', label: { en: 'Japa / Chanting', hi: 'जाप / मंत्र' }, emoji: '📿' },
    { id: 'Tap', label: { en: 'Tap / Fasting', hi: 'तप / उपवास' }, emoji: '🔥' },
    { id: 'Sadhana', label: { en: 'General Sadhana', hi: 'सामान्य साधना' }, emoji: '✨' },
    { id: 'Other', label: { en: 'Other', hi: 'अन्य' }, emoji: '📌' },
  ];

  const TAG_OPTIONS = [
    { id: 'Daily', label: { en: 'Daily', hi: 'दैनिक' }, emoji: '☀️' },
    { id: 'Morning', label: { en: 'Morning', hi: 'प्रातःकालीन' }, emoji: '🌅' },
    { id: 'Evening', label: { en: 'Evening', hi: 'सायंकालीन' }, emoji: '🌙' },
    { id: 'Weekly', label: { en: 'Weekly', hi: 'साप्ताहिक' }, emoji: '📅' },
    { id: 'Special Ritual', label: { en: 'Special Ritual', hi: 'विशेष अनुष्ठान' }, emoji: '✨' },
  ];

  const PRESET_GOALS = [
    { hi: '15 मिनट ध्यान (Meditation)', en: '15 mins Meditation', tag: 'Daily', category: 'Sadhana', impact: 'Medium' as const },
    { hi: 'नवकार जाप (Mantra Chanting)', en: 'Mantra Chanting', tag: 'Morning', category: 'Japa', impact: 'High' as const },
    { hi: 'अहिंसा व्रत अभ्यास (Ahimsa)', en: 'Ahimsa Practice', tag: 'Weekly', category: 'Sadhana', impact: 'High' as const },
    { hi: 'मौन साधना (Silence Practice)', en: 'Silence Practice', tag: 'Special Ritual', category: 'Sadhana', impact: 'High' as const },
    { hi: 'तप / उपवास (Tapa Observance)', en: 'Tapa Observance', tag: 'Weekly', category: 'Tap', impact: 'High' as const },
    { hi: 'चौविहार व्रत (Sunset Fasting)', en: 'Chauvihar Vrat', tag: 'Evening', category: 'Tap', impact: 'Medium' as const },
    { hi: 'सायं प्रतिक्रमण (Evening Pratikraman)', en: 'Evening Pratikraman', tag: 'Evening', category: 'Samayik', impact: 'High' as const },
  ];

  // --- 6:00 PM SPECIAL RITUAL BROWSER NOTIFICATION ENGINE ---
  useEffect(() => {
    const check6PMNotification = () => {
      if (typeof window === 'undefined') return;
      const now = new Date();
      const hours = now.getHours();

      if (hours >= 18) {
        const todayStr = now.toISOString().split('T')[0];
        const notifKey = `terapanth_ritual_6pm_notified_${todayStr}`;
        if (localStorage.getItem(notifKey)) return;

        const pendingRituals = todos.filter(
          (t: any) => (t.tag === 'Special Ritual' || t.tag === 'विशेष अनुष्ठान') && !t.completed
        );

        if (pendingRituals.length > 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Terapanth Sadhana Alert 🌅', {
              body: language === 'hi'
                ? `सायं 6 बजे विशेष रिमाइंडर: आपके ${pendingRituals.length} अनुष्ठान संकल्प अभी शेष हैं!`
                : `6 PM Special Reminder: You have ${pendingRituals.length} incomplete Special Ritual task(s) for today!`,
              icon: '/media/logos/terapanth_logo.png'
            });
            localStorage.setItem(notifKey, 'true');
          }
        }
      }
    };

    check6PMNotification();
    const interval = setInterval(check6PMNotification, 60000);
    return () => clearInterval(interval);
  }, [todos, language]);

  // --- SWADHYAYA & SAMAYIK CUSTOM TIME BROWSER NOTIFICATION ENGINE ---
  const [swadhyayaReminderTime, setSwadhyayaReminderTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('terapanth_swadhyaya_reminder_time') || '20:00';
    }
    return '20:00';
  });
  const [swadhyayaReminderEnabled, setSwadhyayaReminderEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('terapanth_swadhyaya_reminder_enabled') !== 'false';
    }
    return true;
  });

  const handleUpdateSwadhyayaReminder = (timeStr: string, enabled: boolean) => {
    setSwadhyayaReminderTime(timeStr);
    setSwadhyayaReminderEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('terapanth_swadhyaya_reminder_time', timeStr);
      localStorage.setItem('terapanth_swadhyaya_reminder_enabled', enabled ? 'true' : 'false');
    }
  };

  const triggerTestNotification = () => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      alert(language === 'hi' ? 'इस ब्राउज़र में नोटिफिकेशन समर्थित नहीं है।' : 'Browser notifications are not supported in this browser.');
      return;
    }
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('🙏 स्वाध्याय एवं सामायिक अनुस्मारक | Swadhyaya Alert', {
            body: language === 'hi'
              ? 'अनुस्मारक सक्रिय है! अपनी दैनिक स्वाध्याय एवं सामायिक साधना का अभ्यास करें।'
              : 'Test Notification: It is time for your daily Swadhyaya & Samayik practice!',
            icon: '/media/logos/terapanth_logo.png'
          });
        }
      });
    } else {
      new Notification('🙏 स्वाध्याय एवं सामायिक अनुस्मारक | Swadhyaya Alert', {
        body: language === 'hi'
          ? 'अनुस्मारक सक्रिय है! अपनी दैनिक स्वाध्याय एवं सामायिक साधना का अभ्यास करें।'
          : 'Test Notification: It is time for your daily Swadhyaya & Samayik practice!',
        icon: '/media/logos/terapanth_logo.png'
      });
    }
  };

  useEffect(() => {
    if (!swadhyayaReminderEnabled || typeof window === 'undefined') return;

    const checkSwadhyayaReminder = () => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (currentHHMM === swadhyayaReminderTime) {
        const todayStr = now.toISOString().split('T')[0];
        const notifKey = `terapanth_swadhyaya_notified_${todayStr}_${swadhyayaReminderTime}`;
        if (localStorage.getItem(notifKey)) return;

        const pendingSwadhyayaOrSamayik = todos.filter((t: any) => {
          if (t.completed) return false;
          const text = (t.text || '').toLowerCase();
          const category = (t.category || '').toLowerCase();
          return text.includes('swadhyaya') || text.includes('स्वाध्याय') || text.includes('samayik') || text.includes('सामायिक') || category.includes('swadhyaya') || category.includes('samayik');
        });

        if (pendingSwadhyayaOrSamayik.length > 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🙏 स्वाध्याय एवं सामायिक साधना अनुस्मारक', {
              body: language === 'hi'
                ? `आपकी दैनिक स्वाध्याय एवं सामायिक साधना का समय (${swadhyayaReminderTime}) हो गया है! आपके ${pendingSwadhyayaOrSamayik.length} संकल्प शेष हैं।`
                : `Daily Swadhyaya & Samayik reminder (${swadhyayaReminderTime}): You have ${pendingSwadhyayaOrSamayik.length} task(s) remaining for practice!`,
              icon: '/media/logos/terapanth_logo.png'
            });
            localStorage.setItem(notifKey, 'true');
          }
        }
      }
    };

    checkSwadhyayaReminder();
    const interval = setInterval(checkSwadhyayaReminder, 30000);
    return () => clearInterval(interval);
  }, [swadhyayaReminderTime, swadhyayaReminderEnabled, todos, language]);

  // --- SADHANA EXPERIENCE POINTS (XP) SYSTEM ---
  const sadhanaXP = useMemo(() => {
    let xp = 0;
    let samayikCount = 0;
    let japaCount = 0;
    let swadhyayaCount = 0;
    let otherCount = 0;

    const allCompleted = [...todos, ...(archivedTodos || [])].filter((t: any) => t.completed);

    allCompleted.forEach((t: any) => {
      const text = (t.text || '').toLowerCase();
      const category = (t.category || '').toLowerCase();

      if (text.includes('samayik') || text.includes('सामायिक') || category.includes('samayik')) {
        xp += 50;
        samayikCount++;
      } else if (text.includes('japa') || text.includes('जाप') || text.includes('navkar') || text.includes('मंत्र') || category.includes('japa')) {
        xp += 40;
        japaCount++;
      } else if (text.includes('swadhyaya') || text.includes('स्वाध्याय') || text.includes('tap') || text.includes('तप') || category.includes('swadhyaya') || category.includes('tap')) {
        xp += 30;
        swadhyayaCount++;
      } else {
        xp += 20;
        otherCount++;
      }
    });

    let level = 1;
    let titleHi = 'साधक (Sadhak)';
    let titleEn = 'Sadhak (Practitioner)';
    let nextLevelXP = 100;

    if (xp >= 1000) {
      level = 5;
      titleHi = 'परम साधक (Param Sadhak)';
      titleEn = 'Param Sadhak (Master)';
      nextLevelXP = 2000;
    } else if (xp >= 600) {
      level = 4;
      titleHi = 'ज्ञानी (Gyani Sadhak)';
      titleEn = 'Gyani (Wise Sadhak)';
      nextLevelXP = 1000;
    } else if (xp >= 300) {
      level = 3;
      titleHi = 'ध्यानी (Dhyani Sadhak)';
      titleEn = 'Dhyani (Meditator)';
      nextLevelXP = 600;
    } else if (xp >= 100) {
      level = 2;
      titleHi = 'तपस्वी (Tapasvi Sadhak)';
      titleEn = 'Tapasvi (Dedicated)';
      nextLevelXP = 300;
    }

    return {
      totalXP: xp,
      samayikCount,
      japaCount,
      swadhyayaCount,
      otherCount,
      level,
      titleHi,
      titleEn,
      nextLevelXP
    };
  }, [todos, archivedTodos]);

  const getTagBadgeStyle = (tag: string = 'Daily') => {
    switch (tag) {
      case 'Morning':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'Evening':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'Weekly':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'Special Ritual':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'Daily':
      default:
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20';
    }
  };

  const getTagLabel = (tagId: string) => {
    const found = TAG_OPTIONS.find(t => t.id === tagId);
    if (!found) return tagId;
    return language === 'hi' ? found.label.hi : found.label.en;
  };

  const getImpactInfo = (impact: 'Low' | 'Medium' | 'High' = 'Medium') => {
    switch (impact) {
      case 'High':
        return {
          dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] ring-2 ring-red-500/20',
          badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
          label: language === 'hi' ? 'उच्च प्रभाव' : 'High Impact'
        };
      case 'Low':
        return {
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] ring-2 ring-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          label: language === 'hi' ? 'निम्न प्रभाव' : 'Low Impact'
        };
      case 'Medium':
      default:
        return {
          dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)] ring-2 ring-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          label: language === 'hi' ? 'मध्यम प्रभाव' : 'Medium Impact'
        };
    }
  };

  const toggleTaskImpact = (todoId: string, currentImpact: 'Low' | 'Medium' | 'High' = 'Medium') => {
    const next: 'Low' | 'Medium' | 'High' = 
      currentImpact === 'Low' ? 'Medium' : currentImpact === 'Medium' ? 'High' : 'Low';
    setTodos((prev: any[]) =>
      prev.map(t => (t.id === todoId ? { ...t, impact: next } : t))
    );
  };

  const getDueTimeStatus = (dueTime?: string, completed?: boolean) => {
    if (!dueTime || completed) return null;
    const parts = dueTime.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;

    const now = new Date();
    const due = new Date();
    due.setHours(h, m, 0, 0);

    const diffMs = due.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    const isApproaching = diffMins >= -60 && diffMins <= 120;
    return {
      dueTimeFormatted: dueTime,
      diffMins,
      isApproaching,
      isOverdue: diffMins < 0
    };
  };

  const onToggle = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      setActiveConfettiId(id);
      setTimeout(() => setActiveConfettiId(null), 1500);
    }
    handleToggleTodo(id);
  };

  const handleAddCustomTodo = () => {
    if (!todoInput.trim()) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    const newTodo = {
      id: Date.now().toString(),
      text: todoInput.trim(),
      completed: false,
      tag: newGoalTag || 'Daily',
      category: newGoalCategory || 'Sadhana',
      dueTime: dueTimeInput.trim() ? dueTimeInput.trim() : undefined,
      impact: newImpact,
      notes: '',
    };
    setTodos((prev: any[]) => [...prev, newTodo]);
    setTodoInput("");
    setDueTimeInput("");
  };

  const handleAddPreset = (preset: { hi: string; en: string; tag: string; category?: string; impact?: 'Low' | 'Medium' | 'High' }) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    const label = language === 'hi' ? preset.hi : preset.en;
    const newTodo = {
      id: Date.now().toString(),
      text: label,
      completed: false,
      tag: preset.tag,
      category: preset.category || 'Sadhana',
      impact: preset.impact || 'Medium',
      notes: '',
    };
    setTodos((prev: any[]) => [...prev, newTodo]);
  };

  const handleChangeItemTag = (todoId: string, newTag: string) => {
    setTodos((prev: any[]) =>
      prev.map(t => (t.id === todoId ? { ...t, tag: newTag } : t))
    );
    setEditingTagId(null);
  };

  const handleChangeItemCategory = (todoId: string, newCat: string) => {
    setTodos((prev: any[]) =>
      prev.map(t => (t.id === todoId ? { ...t, category: newCat } : t))
    );
    setEditingCategoryId(null);
  };

  const handleUpdateNotes = (todoId: string, notes: string) => {
    setTodos((prev: any[]) =>
      prev.map(t => (t.id === todoId ? { ...t, notes } : t))
    );
  };

  const toggleNotesExpanded = (todoId: string) => {
    setExpandedNotes(prev => ({ ...prev, [todoId]: !prev[todoId] }));
  };

  const restoreArchivedItem = (archivedId: string) => {
    const item = archivedTodos.find(a => a.id === archivedId);
    if (!item) return;
    if (setArchivedTodos) {
      setArchivedTodos((prev: any[]) => prev.filter(a => a.id !== archivedId));
    }
    setTodos((prev: any[]) => [...prev, { ...item, completed: false, completedAt: undefined }]);
  };

  // --- 7-DAY CONSISTENCY TRACKER STATS ---
  const sevenDayStats = useMemo(() => {
    const days: { dateStr: string; label: string; count: number; dayName: string }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      // Count tasks completed on this date from active + archived todos
      let countOnDate = 0;

      [...todos, ...archivedTodos].forEach((item: any) => {
        if (item.completed) {
          if (item.completedAt) {
            const itemDateStr = new Date(item.completedAt).toISOString().split('T')[0];
            if (itemDateStr === dateStr) {
              countOnDate += 1;
            }
          } else {
            // fallback if today
            if (dateStr === now.toISOString().split('T')[0]) {
              countOnDate += 1;
            }
          }
        }
      });

      days.push({
        dateStr,
        label: `${dayName} ${dayNum}`,
        dayName,
        count: countOnDate,
      });
    }

    const totalCompletedIn7Days = days.reduce((acc, curr) => acc + curr.count, 0);
    const activeDaysCount = days.filter(d => d.count > 0).length;
    const consistencyPercent = Math.round((activeDaysCount / 7) * 100);

    return {
      days,
      totalCompletedIn7Days,
      activeDaysCount,
      consistencyPercent
    };
  }, [todos, archivedTodos, language]);

  const filteredTodos = useMemo(() => {
    const result = todos.filter((t: any) => {
      const matchesTag = activeTagFilter === 'All' || (t.tag || 'Daily') === activeTagFilter;
      const matchesCategory = activeCategoryFilter === 'All' || (t.category || 'Sadhana') === activeCategoryFilter;
      const matchesKeyword = !searchKeyword.trim() || t.text.toLowerCase().includes(searchKeyword.toLowerCase().trim());
      return matchesTag && matchesCategory && matchesKeyword;
    });

    const getImpactVal = (impact?: string) => {
      if (impact === 'High') return 3;
      if (impact === 'Low') return 1;
      return 2; // Medium
    };

    return [...result].sort((a: any, b: any) => {
      if (sortBy === 'impact_desc') {
        const valA = getImpactVal(a.impact);
        const valB = getImpactVal(b.impact);
        if (valB !== valA) return valB - valA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      if (sortBy === 'impact_asc') {
        const valA = getImpactVal(a.impact);
        const valB = getImpactVal(b.impact);
        if (valA !== valB) return valA - valB;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      if (sortBy === 'date_asc') {
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      }
      // date_desc
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [todos, activeTagFilter, activeCategoryFilter, searchKeyword, sortBy]);

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Native drag & drop handlers mapped to master list
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggingIndex !== null && dragOverIndex !== null && draggingIndex !== dragOverIndex) {
      const draggedItem = filteredTodos[draggingIndex];
      const targetItem = filteredTodos[dragOverIndex];
      const idxA = todos.findIndex((t: any) => t.id === draggedItem.id);
      const idxB = todos.findIndex((t: any) => t.id === targetItem.id);
      if (idxA !== -1 && idxB !== -1) {
        const updated = [...todos];
        const [removed] = updated.splice(idxA, 1);
        updated.splice(idxB, 0, removed);
        setTodos(updated);
      }
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  // Keyboard / Arrow button reordering helpers
  const moveUp = (filteredIndex: number) => {
    if (filteredIndex <= 0) return;
    const currentItem = filteredTodos[filteredIndex];
    const prevItem = filteredTodos[filteredIndex - 1];
    const idxA = todos.findIndex((t: any) => t.id === currentItem.id);
    const idxB = todos.findIndex((t: any) => t.id === prevItem.id);
    if (idxA !== -1 && idxB !== -1) {
      const updated = [...todos];
      const temp = updated[idxA];
      updated[idxA] = updated[idxB];
      updated[idxB] = temp;
      setTodos(updated);
    }
  };

  const moveDown = (filteredIndex: number) => {
    if (filteredIndex >= filteredTodos.length - 1) return;
    const currentItem = filteredTodos[filteredIndex];
    const nextItem = filteredTodos[filteredIndex + 1];
    const idxA = todos.findIndex((t: any) => t.id === currentItem.id);
    const idxB = todos.findIndex((t: any) => t.id === nextItem.id);
    if (idxA !== -1 && idxB !== -1) {
      const updated = [...todos];
      const temp = updated[idxA];
      updated[idxA] = updated[idxB];
      updated[idxB] = temp;
      setTodos(updated);
    }
  };

  return (
    <div className="space-y-6 pb-6 text-left">
      {/* Search Bar at Top of Sadhana Goals */}
      <div className="relative flex items-center bg-white dark:bg-zinc-900 border-2 border-orange-500/30 rounded-2xl p-3 shadow-md hover:border-orange-500/60 transition-all">
        <Search size={18} className="text-orange-500 ml-2 mr-3 shrink-0" />
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder={
            language === 'hi'
              ? 'कीवर्ड द्वारा संकल्प खोजें (जैसे सामायिक, स्वाध्याय, जाप, मौन)...'
              : 'Search spiritual goals & practices (e.g. Samayik, Swadhyaya, Japa)...'
          }
          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
        />
        {searchKeyword ? (
          <button
            type="button"
            onClick={() => setSearchKeyword('')}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer mr-1"
            title="Clear search"
          >
            <X size={16} />
          </button>
        ) : (
          <span className="text-[10px] font-mono font-bold text-gray-400 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg shrink-0 mr-1">
            {filteredTodos.length} {language === 'hi' ? 'संकल्प' : 'tasks'}
          </span>
        )}
      </div>

      {/* Decorative Brand Header & Sadhana Experience (XP) Points Badge */}
      <div className="p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-[2rem] border border-orange-500/10 relative overflow-hidden text-left space-y-4">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 rotate-12 opacity-5 pointer-events-none">
          <CheckSquare size={160} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full font-black uppercase tracking-widest leading-none inline-block">
              {language === 'hi' ? 'दैनिक साधना लक्ष्य' : 'DAILY SADHANA GOALS'}
            </span>
            <h3 className="serif-text text-2xl font-bold mt-2 text-spiritual">
              {language === 'hi' ? 'आध्यात्मिक संकल्प सूची' : 'Spiritual Priority Checklist'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {language === 'hi' 
                ? 'अपने संकल्पों को श्रेणियों में वर्गीकृत करें, स्वाध्याय एवं सामायिक बिंदु अर्जित करें।' 
                : 'Categorize your goals, earn Sadhana XP for Samayik & Japa practices.'}
            </p>
          </div>

          {/* SADHANA EXPERIENCE POINTS BADGE */}
          <div className="p-3.5 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/10 rounded-2xl border border-amber-500/40 shadow-lg flex items-center gap-3 shrink-0">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md animate-pulse">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-base text-amber-800 dark:text-amber-200 font-mono">
                <span>✨ {sadhanaXP.totalXP} XP</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-500/30">
                  Lvl {sadhanaXP.level}
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                {language === 'hi' ? sadhanaXP.titleHi : sadhanaXP.titleEn}
              </p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar to Next Level */}
        <div className="space-y-1.5 pt-2 border-t border-orange-500/10">
          <div className="flex justify-between text-[10px] font-black text-gray-500 dark:text-gray-400">
            <span>{language === 'hi' ? 'साधना अनुभव प्रगति (Sadhana XP)' : 'Sadhana XP Level Progress'}</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              {sadhanaXP.totalXP} / {sadhanaXP.nextLevelXP} XP
            </span>
          </div>
          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.round((sadhanaXP.totalXP / sadhanaXP.nextLevelXP) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Swadhyaya & Samayik Daily Local Reminder Settings Card */}
      <div className="p-4 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-orange-500/10 rounded-2xl border border-purple-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500 text-white rounded-xl shadow-md shrink-0">
              <BellRing size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-spiritual">
                {language === 'hi' ? 'स्वाध्याय एवं सामायिक अनुस्मारक (Daily Local Reminder)' : 'Swadhyaya & Samayik Daily Reminder'}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'अपनी दैनिक स्वाध्याय एवं सामायिक साधना का समय निर्धारित करें। शेष रहने पर रिमाइंडर मिलेगा।'
                  : 'Set custom daily reminder time for Swadhyaya & Samayik tasks.'}
              </p>
            </div>
          </div>

          {/* Enable / Disable Toggle */}
          <button
            type="button"
            onClick={() => handleUpdateSwadhyayaReminder(swadhyayaReminderTime, !swadhyayaReminderEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              swadhyayaReminderEnabled
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-gray-400 border-black/10'
            }`}
          >
            {swadhyayaReminderEnabled
              ? (language === 'hi' ? 'सक्रिय (ON)' : 'Reminder ON')
              : (language === 'hi' ? 'निष्क्रिय (OFF)' : 'Reminder OFF')}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-500/15">
          {/* Time Selector */}
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-purple-500 shrink-0" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {language === 'hi' ? 'अनुस्मारक समय:' : 'Reminder Time:'}
            </span>
            <input
              type="time"
              value={swadhyayaReminderTime}
              onChange={(e) => handleUpdateSwadhyayaReminder(e.target.value, swadhyayaReminderEnabled)}
              className="bg-white dark:bg-zinc-900 border border-purple-500/30 rounded-xl px-2.5 py-1 text-xs font-mono font-black text-gray-800 dark:text-gray-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Test Notification Button */}
          <button
            type="button"
            onClick={triggerTestNotification}
            className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-purple-500/30 flex items-center gap-1.5"
          >
            <Sparkles size={12} className="text-amber-500" />
            <span>{language === 'hi' ? 'परीक्षण नोटिफिकेशन भेजें' : 'Send Test Alert'}</span>
          </button>
        </div>
      </div>

      {/* Visual Summary: Count of Completed Tasks by Tag */}
      <div className="p-4 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent rounded-3xl border border-orange-500/15 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/15 text-orange-600 dark:text-orange-400 rounded-xl">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-spiritual">
                {language === 'hi' ? 'श्रेणी अनुसार पूर्ण साधना (Summary)' : 'Completed Sadhana Summary by Tag'}
              </h4>
              <p className="text-[10px] text-gray-400">
                {language === 'hi' ? 'टैग अनुसार पूर्ण किए गए संकल्पों का विवरण' : 'Completed tasks breakdown per tag'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-black rounded-full border border-green-500/20 font-mono">
            {completedCount} / {totalCount} {language === 'hi' ? 'पूर्ण' : 'Done'}
          </span>
        </div>

        {/* Simple List View of Tag Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {TAG_OPTIONS.map((tag) => {
            const tagCompletedCount = todos.filter((t: any) => t.completed && (t.tag || 'Daily') === tag.id).length;
            const tagTotalCount = todos.filter((t: any) => (t.tag || 'Daily') === tag.id).length;
            return (
              <div
                key={tag.id}
                className="p-2.5 bg-white dark:bg-zinc-900/90 rounded-2xl border border-black/5 dark:border-zinc-800 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <span className="text-sm">{tag.emoji}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                    {language === 'hi' ? tag.label.hi : tag.label.en}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-mono text-xs font-black">
                  <span className={tagCompletedCount > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                    {tagCompletedCount}
                  </span>
                  <span className="text-gray-300 dark:text-zinc-600 text-[10px]">/ {tagTotalCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Archive & Restoration Drawer Trigger */}
      <div className="flex items-center justify-between p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock size={14} className="text-amber-500 shrink-0" />
          <span className="text-[11px] font-semibold">
            {language === 'hi' 
              ? 'पूर्ण संकल्प 24 घंटे बाद स्वचालित रूप से आर्काइव होते हैं' 
              : 'Completed goals auto-archive after 24h'}
          </span>
        </div>
        <button
          onClick={() => setShowArchivedModal(true)}
          className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border border-orange-500/20 shrink-0"
        >
          {language === 'hi' ? `आर्काइव्ड (${archivedTodos.length})` : `Archived (${archivedTodos.length})`}
        </button>
      </div>

      {/* Progress & Stats Card */}
      <div className="p-5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {language === 'hi' ? 'आज की साधना प्रगति' : 'SADHANA GOALS PROGRESS'}
            </span>
            <span className="text-xs font-black text-spiritual">
              {completedCount} / {totalCount} {language === 'hi' ? 'पूर्ण' : 'Completed'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-3xl font-black text-orange-650 dark:text-orange-400">
          {progressPercent}%
        </div>
      </div>

      {/* 6 PM Special Ritual Notification Status & Alert Banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl shrink-0">
            <BellRing size={16} className="animate-bounce" />
          </div>
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-150">
              {language === 'hi' ? 'सायं 6 बजे विशेष अनुष्ठान ऑटो-रिमाइंडर' : '6:00 PM Special Ritual Auto-Notification'}
            </p>
            <p className="text-[11px] text-gray-500">
              {language === 'hi'
                ? 'यदि विशेष अनुष्ठान पूर्ण नहीं हैं तो सायं 6 बजे ऑटो-अलर्ट आएगा'
                : 'Triggers a browser notification at 6 PM if Special Ritual tasks are incomplete'}
            </p>
          </div>
        </div>

        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
          <button
            onClick={() => {
              Notification.requestPermission().then((perm) => {
                if (perm === 'granted') {
                  alert(language === 'hi' ? 'नोटिफिकेशन सक्षम हो गया है!' : 'Browser notifications enabled successfully!');
                }
              });
            }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-[11px] shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            {language === 'hi' ? 'नोटिफिकेशन चालू करें' : 'Enable Notifications'}
          </button>
        )}
      </div>

      {/* 7-Day Long-Term Consistency Tracker */}
      <div className="p-5 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-500/15 rounded-3xl border border-orange-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-500 text-white rounded-2xl shadow-md">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>{language === 'hi' ? '7-दिवसीय साधना निरंतरता रिपोर्ट' : '7-Day Sadhana Consistency Tracker'}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  {sevenDayStats.consistencyPercent}% Consistency
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? `पिछले 7 दिनों में कुल ${sevenDayStats.totalCompletedIn7Days} संकल्प पूर्ण | ${sevenDayStats.activeDaysCount}/7 दिन सक्रिय`
                  : `${sevenDayStats.totalCompletedIn7Days} total goals completed in last 7 days | ${sevenDayStats.activeDaysCount}/7 active days`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-2xl border border-black/10 dark:border-zinc-800 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
            <Sparkles size={14} className="text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
            <span>
              {sevenDayStats.consistencyPercent >= 80
                ? (language === 'hi' ? 'उत्कृष्ट साधना' : 'Excellent Consistency')
                : sevenDayStats.consistencyPercent >= 50
                ? (language === 'hi' ? 'उत्तम प्रयास' : 'Steady Progress')
                : (language === 'hi' ? 'साधना आरंभ करें' : 'Keep Practicing')}
            </span>
          </div>
        </div>

        {/* 7-Day Day-by-Day Visual Breakdown */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {sevenDayStats.days.map((day, idx) => {
            const isToday = idx === 6;
            const maxCount = Math.max(...sevenDayStats.days.map(d => d.count), 1);
            const heightPercent = Math.min(100, Math.max(15, (day.count / maxCount) * 100));

            return (
              <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                <div className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400">
                  {day.count}
                </div>
                <div className="w-full h-16 bg-black/5 dark:bg-white/5 rounded-xl p-1 flex items-end justify-center relative overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={`w-full rounded-lg ${
                      day.count > 0
                        ? isToday
                          ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-sm'
                          : 'bg-orange-500/60 dark:bg-orange-400/60'
                        : 'bg-gray-200 dark:bg-zinc-800'
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-bold ${isToday ? 'text-orange-600 dark:text-orange-400 font-black underline' : 'text-gray-400'}`}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tag & Keyword Filtering Bar */}
      <div className="space-y-3 p-4 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5">
        {/* Search Field, Sort Dropdown & Category Filter Dropdown */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Keyword Search */}
          <div className="relative flex-1 flex items-center">
            <Search size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={language === 'hi' ? 'कीवर्ड द्वारा संकल्प खोजें (Search by keyword)...' : 'Filter tasks by keyword...'}
              className="w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-orange-500/50 shadow-xs"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs shrink-0 shadow-xs">
            <Tag size={14} className="text-orange-500 shrink-0" />
            <span className="text-[11px] font-bold text-gray-400 hidden sm:inline">
              {language === 'hi' ? 'श्रेणी:' : 'Category:'}
            </span>
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer pr-1"
            >
              {SPIRITUAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="dark:bg-zinc-900 text-gray-800 dark:text-gray-200">
                  {cat.emoji} {language === 'hi' ? cat.label.hi : cat.label.en}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs shrink-0 shadow-xs">
            <ArrowUpDown size={14} className="text-orange-500 shrink-0" />
            <span className="text-[11px] font-bold text-gray-400 hidden sm:inline">
              {language === 'hi' ? 'क्रम:' : 'Sort:'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="impact_desc" className="dark:bg-zinc-900 text-gray-800 dark:text-gray-200">
                {language === 'hi' ? 'महत्व: उच्च से निम्न' : 'Importance: High → Low'}
              </option>
              <option value="impact_asc" className="dark:bg-zinc-900 text-gray-800 dark:text-gray-200">
                {language === 'hi' ? 'महत्व: निम्न से उच्च' : 'Importance: Low → High'}
              </option>
              <option value="date_desc" className="dark:bg-zinc-900 text-gray-800 dark:text-gray-200">
                {language === 'hi' ? 'तिथि: नवीन पहले' : 'Date: Newest First'}
              </option>
              <option value="date_asc" className="dark:bg-zinc-900 text-gray-800 dark:text-gray-200">
                {language === 'hi' ? 'तिथि: पुराना पहले' : 'Date: Oldest First'}
              </option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 ml-1">
            <Filter size={12} className="text-orange-500" />
            {language === 'hi' ? 'समय अवधि फ़िल्टर' : 'Filter by Time Period'}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">
            {filteredTodos.length} {language === 'hi' ? 'लक्ष्य मिले' : 'tasks shown'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTagFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 border ${
              activeTagFilter === 'All'
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 border-black/10 dark:border-white/10 hover:bg-black/5'
            }`}
          >
            <span>{language === 'hi' ? 'सभी' : 'All'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              activeTagFilter === 'All' ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-gray-500'
            }`}>
              {todos.length}
            </span>
          </button>

          {TAG_OPTIONS.map((tag) => {
            const count = todos.filter((t: any) => (t.tag || 'Daily') === tag.id).length;
            const isActive = activeTagFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTagFilter(tag.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 border-black/10 dark:border-white/10 hover:bg-black/5'
                }`}
              >
                <span>{tag.emoji}</span>
                <span>{language === 'hi' ? tag.label.hi : tag.label.en}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Entry Input with Tag, Category, Impact Level & Optional Due Time */}
      <div className="space-y-2.5 p-4 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5">
        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 ml-1 block">
          {language === 'hi' ? 'नया संकल्प, श्रेणी, प्रभाव स्तर एवं समय जोड़ें' : 'Add Custom Goal with Tag, Category, Impact & Due Time'}
        </label>

        {/* Tag, Category & Impact Level Selector for New Goal */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-gray-400 mr-1 shrink-0">{language === 'hi' ? 'समय:' : 'Period:'}</span>
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setNewGoalTag(tag.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer border ${
                  newGoalTag === tag.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-black/10 dark:border-white/10'
                }`}
              >
                {tag.emoji} {language === 'hi' ? tag.label.hi : tag.label.en}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-black/5 dark:border-white/5">
            {/* Category Pills for New Goal */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none max-w-full">
              <span className="text-[10px] font-bold text-gray-400 mr-1 shrink-0">{language === 'hi' ? 'श्रेणी:' : 'Area:'}</span>
              {SPIRITUAL_CATEGORIES.filter(c => c.id !== 'All').map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewGoalCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer border ${
                    newGoalCategory === cat.id
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-black/10 dark:border-zinc-800'
                  }`}
                >
                  {cat.emoji} {language === 'hi' ? cat.label.hi : cat.label.en}
                </button>
              ))}
            </div>

            {/* Impact Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-black/10 dark:border-zinc-800 text-[10px]">
              <span className="text-gray-400 font-bold px-1">{language === 'hi' ? 'प्रभाव:' : 'Impact:'}</span>
              <button
                type="button"
                onClick={() => setNewImpact('Low')}
                className={`px-2 py-0.5 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                  newImpact === 'Low' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Low</span>
              </button>
              <button
                type="button"
                onClick={() => setNewImpact('Medium')}
                className={`px-2 py-0.5 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                  newImpact === 'Medium' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Medium</span>
              </button>
              <button
                type="button"
                onClick={() => setNewImpact('High')}
                className={`px-2 py-0.5 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                  newImpact === 'High' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>High</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTodo()}
            placeholder={language === 'hi' ? 'जैसे: 15 मिनट ध्यान, मौन, स्वाध्याय...' : 'e.g. 15 minutes of silence, read Agam...'}
            className="flex-1 bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-gray-800 dark:text-gray-150 focus:outline-none focus:border-orange-500/50"
          />

          <div className="flex gap-2">
            {/* Optional Due Time Input */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs">
              <Clock size={14} className="text-gray-400 shrink-0" />
              <input
                type="time"
                value={dueTimeInput}
                onChange={(e) => setDueTimeInput(e.target.value)}
                className="bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none font-mono"
                title={language === 'hi' ? 'समय चुनें' : 'Select due time'}
              />
            </div>

            <button
              onClick={handleAddCustomTodo}
              className="px-4 py-3 bg-orange-500 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-colors focus:outline-none cursor-pointer gap-1 text-xs font-bold shrink-0"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-black/5 dark:border-white/10 rounded-[2rem] text-center space-y-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {language === 'hi' ? 'इस श्रेणी में कोई लक्ष्य नहीं मिला' : 'No goals found in this tag'}
            </p>
            <p className="text-[10px] text-gray-400">
              {language === 'hi' ? 'ऊपर नया संकल्प जोड़ें या दूसरे टैग पर स्विच करें।' : 'Add a new goal above or switch to another filter tag.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTodos.map((todo, index) => {
              const isDragging = index === draggingIndex;
              const isDragOver = index === dragOverIndex;
              const itemTag = todo.tag || 'Daily';
              const isEditingThisTag = editingTagId === todo.id;
              const dueTimeStatus = getDueTimeStatus(todo.dueTime, todo.completed);

              return (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: todo.completed ? [1, 1.03, 1] : 1
                  }}
                  transition={{ 
                    duration: 0.25,
                    scale: { type: "spring", stiffness: 300, damping: 15 }
                  }}
                  className="relative overflow-visible"
                >
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 hover:bg-orange-500/5 dark:hover:bg-orange-500/5 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      isDragging ? 'opacity-40 border-orange-500 border-dashed scale-[0.98]' : ''
                    } ${
                      isDragOver ? 'border-orange-500 border-dashed translate-y-1' : ''
                    }`}
                  >
                    {activeConfettiId === todo.id && (
                      <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
                        {Array.from({ length: 15 }).map((_, i) => {
                          const angle = (i / 15) * 360 + Math.random() * 20;
                          const distance = 40 + Math.random() * 60;
                          const x = Math.cos((angle * Math.PI) / 180) * distance;
                          const y = Math.sin((angle * Math.PI) / 180) * distance;
                          const colors = ['#f97316', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
                          const randomColor = colors[i % colors.length];
                          return (
                            <motion.div
                              key={i}
                              className="absolute w-2.5 h-2.5 rounded-full left-1/2 top-1/2"
                              style={{ backgroundColor: randomColor }}
                              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                              animate={{
                                x: x,
                                y: y,
                                scale: [1, 1.3, 0],
                                opacity: [1, 1, 0],
                                rotate: Math.random() * 360
                              }}
                              transition={{
                                duration: 0.8,
                                ease: "easeOut"
                              }}
                            />
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {/* Drag Handle */}
                      <div className="text-gray-400 hover:text-gray-650 cursor-grab shrink-0 p-0.5">
                        <GripVertical size={16} />
                      </div>

                      {/* Completion Toggle */}
                      <button
                        onClick={() => onToggle(todo.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          todo.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 dark:border-zinc-700 hover:border-orange-500'
                        }`}
                      >
                        {todo.completed && <CheckCircle2 size={12} className="text-white fill-white" />}
                      </button>

                      {/* Impact Dot */}
                      {(() => {
                        const impactInfo = getImpactInfo(todo.impact || 'Medium');
                        return (
                          <button
                            type="button"
                            onClick={() => toggleTaskImpact(todo.id, todo.impact || 'Medium')}
                            className="shrink-0 p-1 cursor-pointer transition-transform hover:scale-125"
                            title={language === 'hi' ? `प्रभाव: ${impactInfo.label} (बदलने के लिए क्लिक करें)` : `Impact: ${impactInfo.label} (Click to toggle)`}
                          >
                            <span className={`block w-2.5 h-2.5 rounded-full ${impactInfo.dot}`} />
                          </button>
                        );
                      })()}

                      {/* Text & Tag */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span 
                          className={`text-sm font-semibold truncate select-none ${
                            todo.completed 
                              ? 'text-gray-400 line-through font-normal' 
                              : 'text-gray-800 dark:text-gray-150'
                          }`}
                        >
                          {todo.text}
                        </span>

                        {/* Tag Badge / Editor & Due Time Badge & Impact Badge */}
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          {isEditingThisTag ? (
                            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 scrollbar-none z-10 bg-white dark:bg-zinc-900 border border-orange-500/30 p-1 rounded-lg shadow-md">
                              {TAG_OPTIONS.map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => handleChangeItemTag(todo.id, t.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 cursor-pointer ${
                                    itemTag === t.id
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                  }`}
                                >
                                  {t.emoji} {language === 'hi' ? t.label.hi : t.label.en}
                                </button>
                              ))}
                              <button
                                onClick={() => setEditingTagId(null)}
                                className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white shrink-0 ml-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingTagId(todo.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${getTagBadgeStyle(itemTag)}`}
                              title={language === 'hi' ? 'टैग बदलें' : 'Change tag'}
                            >
                              <Tag size={10} />
                              <span>{getTagLabel(itemTag)}</span>
                              <ChevronDown size={10} className="opacity-50" />
                            </button>
                          )}

                          {/* Category Badge Selector */}
                          {editingCategoryId === todo.id ? (
                            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 scrollbar-none z-10 bg-white dark:bg-zinc-900 border border-orange-500/30 p-1 rounded-lg shadow-md">
                              {SPIRITUAL_CATEGORIES.filter(c => c.id !== 'All').map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleChangeItemCategory(todo.id, cat.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 cursor-pointer ${
                                    (todo.category || 'Sadhana') === cat.id
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                  }`}
                                >
                                  {cat.emoji} {language === 'hi' ? cat.label.hi : cat.label.en}
                                </button>
                              ))}
                              <button
                                onClick={() => setEditingCategoryId(null)}
                                className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white shrink-0 ml-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingCategoryId(todo.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300 transition-all cursor-pointer"
                              title={language === 'hi' ? 'श्रेणी बदलें' : 'Change spiritual category'}
                            >
                              <span>{SPIRITUAL_CATEGORIES.find(c => c.id === (todo.category || 'Sadhana'))?.emoji || '✨'}</span>
                              <span>{SPIRITUAL_CATEGORIES.find(c => c.id === (todo.category || 'Sadhana'))?.label[language === 'hi' ? 'hi' : 'en'] || (todo.category || 'Sadhana')}</span>
                              <ChevronDown size={10} className="opacity-50" />
                            </button>
                          )}

                          {/* Impact Level Badge */}
                          {(() => {
                            const impactInfo = getImpactInfo(todo.impact || 'Medium');
                            return (
                              <button
                                type="button"
                                onClick={() => toggleTaskImpact(todo.id, todo.impact || 'Medium')}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${impactInfo.badge}`}
                                title={language === 'hi' ? 'प्रभाव स्तर बदलें' : 'Toggle impact level'}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${impactInfo.dot}`} />
                                <span>{impactInfo.label}</span>
                              </button>
                            );
                          })()}

                          {/* Approaching Due Time Badge for Special Ritual / Due Tasks */}
                          {dueTimeStatus && (
                            itemTag === 'Special Ritual' && dueTimeStatus.isApproaching ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-black tracking-wide animate-pulse">
                                <Flame size={12} className="text-amber-500 shrink-0" />
                                <span>
                                  {dueTimeStatus.isOverdue
                                    ? (language === 'hi' ? '⚠️ अनुष्ठान समय समाप्त' : '⚠️ Ritual Overdue')
                                    : (language === 'hi' ? `⚡ विशेष अनुष्ठान निकट (${dueTimeStatus.diffMins}m)` : `⚡ Special Ritual Due Soon (${dueTimeStatus.diffMins}m)`)}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/5 dark:bg-white/5 text-gray-500 border border-black/5 dark:border-white/5 font-mono">
                                <Clock size={10} />
                                <span>{todo.dueTime}</span>
                              </span>
                            )
                          )}
                        </div>

                        {/* Per-Task Quick Reflection / Notes Section */}
                        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleNotesExpanded(todo.id)}
                              className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <FileText size={12} className={todo.notes ? "text-orange-500" : "text-gray-400"} />
                              <span>
                                {todo.notes
                                  ? (language === 'hi' ? 'आध्यात्मिक चिंतन / टिप्पणी' : 'Spiritual Reflection')
                                  : (language === 'hi' ? '+ टिप्पणी / अनुभव जोड़ें' : '+ Add Quick Reflection Note')}
                              </span>
                              {todo.notes && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                            </button>

                            {todo.notes && (
                              <span className="text-[9px] font-mono text-gray-400 italic">
                                {language === 'hi' ? 'सहेजा गया' : 'Saved to localStorage'}
                              </span>
                            )}
                          </div>

                          {(expandedNotes[todo.id] || todo.notes) && (
                            <textarea
                              rows={2}
                              value={todo.notes || ''}
                              onChange={(e) => handleUpdateNotes(todo.id, e.target.value)}
                              placeholder={
                                language === 'hi'
                                  ? 'इस साधना संकल्प से जुड़ा आध्यात्मिक अनुभव या मन की शांति का चिंतन लिखें...'
                                  : 'Record your spiritual reflections, insights, or inner peace for this task...'
                              }
                              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-zinc-800 rounded-xl p-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500/50 resize-none font-sans"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reordering and Delete Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Move Up */}
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer"
                        title={language === 'hi' ? 'ऊपर ले जाएं' : 'Move Up'}
                      >
                        <ArrowUp size={14} />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === filteredTodos.length - 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer"
                        title={language === 'hi' ? 'नीचे ले जाएं' : 'Move Down'}
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title={language === 'hi' ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guided Meditations & Spiritual Discourses (Pravachans) Portal */}
      <div className="p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-amber-500/10 rounded-[2rem] border border-orange-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl shadow-lg">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
                {language === 'hi' ? 'जैन तेरापंथ एआई अध्यात्म' : 'JAIN TERAPANTH AI SPIRITUALITY'}
              </span>
              <h3 className="serif-text text-xl font-bold text-spiritual">
                {language === 'hi' ? 'प्रेक्षा ध्यान एवं आचार्य प्रवचन केंद्र' : 'Guided Meditations & Authentic Pravachans'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'प्रामाणिक जैन तेरापंथ परंपराओं से निर्देशित प्रेक्षा ध्यान एवं पूज्य आचार्यों के अमृतवचन।'
                  : 'Sourced from authentic Jain Terapanth traditions, Acharya Amritvani & Preksha Dhyan practice.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-2xl border border-black/10 dark:border-zinc-800 text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0 shadow-xs">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>{language === 'hi' ? 'प्रामाणिक वाणि' : 'Authentic Canon'}</span>
          </div>
        </div>

        {/* Section 1: Guided Preksha Meditations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-spiritual flex items-center gap-2">
              <Wind size={16} className="text-orange-500" />
              <span>{language === 'hi' ? 'प्रेक्षा ध्यान योग (Guided Preksha Meditations)' : 'Guided Preksha Meditation Practices'}</span>
            </h4>
            <span className="text-[10px] text-gray-400 font-mono font-bold">
              {language === 'hi' ? '4 सत्र उपलब्ध' : '4 Sessions Available'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                id: 'kayotsarga',
                titleHi: 'कायोत्सर्ग (Kayotsarga)',
                titleEn: 'Kayotsarga - Complete Physical & Mental Relaxation',
                durationHi: '10 मिनट',
                durationEn: '10 Mins',
                descHi: 'शरीर के प्रति अनासक्ति और गहन तनावमुक्ति की प्रेक्षा साधना।',
                descEn: 'Deep relaxation practice releasing physical body tension and mental anxiety.',
                stepsHi: ['सुखासन में बैठें', 'सांसों को मंद करें', 'शरीर को ढीला छोड़ें'],
                stepsEn: ['Sit comfortably', 'Slow down breathing', 'Relax muscle groups']
              },
              {
                id: 'shvas_preksha',
                titleHi: 'श्वास प्रेक्षा (Shvas Preksha)',
                titleEn: 'Shvas Preksha - Mindful Breath Perception',
                durationHi: '15 मिनट',
                durationEn: '15 Mins',
                descHi: 'प्रत्येक आती-जाती सांस के प्रति सजगता और प्राणधारा की लयबद्धता।',
                descEn: 'Cultivate deep mindfulness by observing natural breath rhythm without interference.',
                stepsHi: ['नासाग्र पर ध्यान', 'प्राणधारा का अनुभव', 'मन शांत करें'],
                stepsEn: ['Focus on nostrils', 'Feel energy flow', 'Stabilize mind']
              },
              {
                id: 'leshya_dhyan',
                titleHi: 'लेश्या ध्यान (Leshya Dhyan)',
                titleEn: 'Leshya Dhyan - Bright Color & Aura Meditation',
                durationHi: '12 मिनट',
                durationEn: '12 Mins',
                descHi: 'तेजोलेश्या (उगता सूरज) और पद्मलेश्या से आभामंडल एवं विचारों की शुद्धि।',
                descEn: 'Visualize glowing golden-pink light at the center of enlightenment to purify emotions.',
                stepsHi: ['उगते सूर्य का ध्यान', 'आभामंडल विशुद्धि', 'आनंद का अनुभव'],
                stepsEn: ['Visualize rising sun', 'Purify aura', 'Experience bliss']
              },
              {
                id: 'mantra_preksha',
                titleHi: 'मंत्र एवं ध्वनि प्रेक्षा (Arham Chant)',
                titleEn: 'Mantra & Sound Vibration - Arham Chanting',
                durationHi: '8 मिनट',
                durationEn: '8 Mins',
                descHi: 'अर्हम् ध्वनि के कंपन से अंतःस्रावी ग्रंथियों (Chakras) का संतुलन।',
                descEn: 'Harmonize endocrine centers using resonant Arham sound vibrations.',
                stepsHi: ['रीढ़ की हड्डी सीधी', 'नाभि से ध्वनि उच्चारण', 'कंपन महसूस करें'],
                stepsEn: ['Keep spine erect', 'Chant from naval', 'Feel vibration']
              }
            ].map((med) => {
              const isActive = activeMeditationId === med.id;
              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isActive
                      ? 'bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-white dark:to-zinc-900 border-orange-500 shadow-md'
                      : 'bg-white dark:bg-zinc-900/90 border-black/5 dark:border-zinc-800 hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <span>{language === 'hi' ? med.titleHi : med.titleEn}</span>
                      </h5>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                        <Clock size={10} />
                        <span>{language === 'hi' ? med.durationHi : med.durationEn}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (isActive) {
                          setActiveMeditationId(null);
                        } else {
                          setActiveMeditationId(med.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs ${
                        isActive
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white'
                      }`}
                    >
                      {isActive ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isActive ? (language === 'hi' ? 'रोकें' : 'Pause') : (language === 'hi' ? 'आरंभ करें' : 'Start Session')}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    {language === 'hi' ? med.descHi : med.descEn}
                  </p>

                  {/* Guided Steps Pill */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-black/5 dark:border-white/5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                      {language === 'hi' ? 'मुख्य चरण:' : 'Steps:'}
                    </span>
                    {(language === 'hi' ? med.stepsHi : med.stepsEn).map((step, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[10px] text-gray-600 dark:text-gray-300 font-medium"
                      >
                        {idx + 1}. {step}
                      </span>
                    ))}
                  </div>

                  {/* Active Guided Meditation Playing Bar */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-orange-700 dark:text-orange-300 text-[11px]">
                        <span className="flex items-center gap-1.5 animate-pulse">
                          <Sparkles size={12} className="text-orange-500" />
                          <span>{language === 'hi' ? 'ध्यान सत्र प्रगति में है...' : 'Meditation Session Active...'}</span>
                        </span>
                        <span className="font-mono">12:30 / 15:00</span>
                      </div>
                      <div className="w-full h-1.5 bg-orange-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full w-2/3 animate-pulse" />
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Authentic Terapanth Acharya Pravachans */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-spiritual flex items-center gap-2">
              <BookOpen size={16} className="text-orange-500" />
              <span>{language === 'hi' ? 'आचार्य परंपरा अमृतवाणी व प्रवचन (Pravachans)' : 'Authentic Acharya Pravachans & Discourses'}</span>
            </h4>
            <span className="text-[10px] text-gray-400 font-mono font-bold">
              {language === 'hi' ? 'आचार्य परंपरा से प्रेरित' : 'Acharya Lineage Sourced'}
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'bhikshu_maryada',
                acharya: 'आचार्य भिक्षु (Acharya Bhikshu)',
                titleHi: 'सिद्धान्त वाणी - धर्म और संघ मर्यादा',
                titleEn: 'Siddhant Vani - Truth, Purity & Order of Sangh',
                duration: '18:45',
                keyIdeaHi: 'शुद्ध धर्म का आचरण और संघ की मर्यादा ही मोक्ष का मार्ग है।',
                keyIdeaEn: 'Purity of conduct and absolute adherence to spiritual discipline form the essence of Jain Dharma.',
                promptQuery: 'आचार्य भिक्षु के विचार और संघ मर्यादा के मुख्य नियम क्या हैं?'
              },
              {
                id: 'tulsi_anuvrat',
                acharya: 'आचार्य तुलसी (Acharya Tulsi)',
                titleHi: 'अणुव्रत दर्शन - जीवन परिवर्तन की कुंजी',
                titleEn: 'Anuvrat Philosophy - Key to Moral Regeneration',
                duration: '22:10',
                keyIdeaHi: 'सुधरे व्यक्ति, समाज सुधरेगा। अणुव्रत से दैनिक जीवन में नैतिकता का समावेश करें।',
                keyIdeaEn: 'Self-reform leads to societal reform. Incorporate small vows into everyday professional life.',
                promptQuery: 'आचार्य तुलसी के अणुव्रत आंदोलन के मूल सिद्धांत क्या हैं?'
              },
              {
                id: 'mahapragya_preksha',
                acharya: 'आचार्य महाप्रज्ञ (Acharya Mahapragya)',
                titleHi: 'जीवन विज्ञान और प्रेक्षा ध्यान की वैज्ञानिकता',
                titleEn: 'Science of Living & Spiritual Neuro-biology',
                duration: '25:30',
                keyIdeaHi: 'ध्यान से अंतःस्रावी ग्रंथियों (Glands) का परिवर्तन और कषायों का शमन।',
                keyIdeaEn: 'Meditation alters endocrine secretions and calms passion through neuro-biological harmony.',
                promptQuery: 'आचार्य महाप्रज्ञ जी द्वारा प्रतिपादित जीवन विज्ञान के मुख्य स्तंभ बताएं।'
              },
              {
                id: 'mahashraman_ahimsa',
                acharya: 'आचार्य महाश्रमण (Acharya Mahashraman)',
                titleHi: 'अहिंसा यात्रा - सद्भावना, नैतिकता एवं नशामुक्त जीवन',
                titleEn: 'Ahimsa Yatra - Goodwill, Morality & De-addiction',
                duration: '20:15',
                keyIdeaHi: 'अहिंसा केवल सिद्धांत नहीं, सर्व-मैत्री का व्यावहारिक आचरण है।',
                keyIdeaEn: 'Non-violence is practical universal fellowship and moral integrity across humanity.',
                promptQuery: 'पूज्य आचार्य महाश्रमण जी की अहिंसा यात्रा के क्या उद्देश्य हैं?'
              }
            ].map((disc) => {
              const isPlaying = activeDiscourseId === disc.id;
              return (
                <div
                  key={disc.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPlaying
                      ? 'bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-white dark:to-zinc-900 border-orange-500 shadow-md'
                      : 'bg-white dark:bg-zinc-900/90 border-black/5 dark:border-zinc-800 hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            setActiveDiscourseId(null);
                          } else {
                            setActiveDiscourseId(disc.id);
                          }
                        }}
                        className={`p-3 rounded-2xl transition-all cursor-pointer shrink-0 shadow-md ${
                          isPlaying
                            ? 'bg-orange-500 text-white animate-pulse'
                            : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white'
                        }`}
                        title={isPlaying ? 'Pause Pravachan' : 'Play Pravachan'}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
                          {disc.acharya}
                        </span>
                        <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate mt-0.5">
                          {language === 'hi' ? disc.titleHi : disc.titleEn}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {language === 'hi' ? disc.keyIdeaHi : disc.keyIdeaEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] font-mono font-bold text-gray-400 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl">
                        {disc.duration}
                      </span>

                      <button
                        type="button"
                        onClick={() => onQuickPrayer?.()}
                        className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-bold transition-all cursor-pointer border border-orange-500/20 flex items-center gap-1 shrink-0"
                        title="Ask Terapanth AI Agent about this discourse"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>{language === 'hi' ? 'एआई से पूछें' : 'Ask AI Agent'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Audio Player Bar when Active */}
                  {isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-orange-500/20 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-orange-700 dark:text-orange-300">
                        <span className="flex items-center gap-1.5">
                          <Volume2 size={14} className="animate-bounce" />
                          <span>{language === 'hi' ? 'प्रवचन प्रसारित हो रहा है...' : 'Pravachan Audio Playing...'}</span>
                        </span>
                        <span className="font-mono text-[11px]">06:12 / {disc.duration}</span>
                      </div>
                      <div className="w-full h-1.5 bg-orange-500/20 rounded-full overflow-hidden cursor-pointer">
                        <div className="h-full bg-orange-500 rounded-full w-1/3" />
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preset Recommendations */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
          {language === 'hi' ? 'अनुशंसित साधना संकल्प (Presets)' : 'Recommended Goal Presets'}
        </h4>
        <div className="flex flex-wrap gap-2">
          {PRESET_GOALS.map((preset, idx) => {
            const label = language === 'hi' ? preset.hi : preset.en;
            const alreadyExists = todos.some(t => t.text.toLowerCase().includes(label.toLowerCase()));
            if (alreadyExists) return null;
            return (
              <button
                key={idx}
                onClick={() => handleAddPreset(preset)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>+ {label}</span>
                <span className="text-[9px] font-mono opacity-60">({preset.tag})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Archived Todos Modal */}
      <AnimatePresence>
        {showArchivedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Clock size={18} />
                  <h3 className="font-bold text-sm">
                    {language === 'hi' ? 'आर्काइव्ड साधना संकल्प' : 'Archived Sadhana Goals'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowArchivedModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500">
                {language === 'hi'
                  ? '24 घंटे बाद स्वचालित रूप से आर्काइव किए गए पूर्ण संकल्प:'
                  : 'Tasks marked completed >24 hours ago are archived to keep your active checklist clean.'}
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {archivedTodos.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-6">
                    {language === 'hi' ? 'कोई आर्काइव्ड संकल्प नहीं है।' : 'No archived items yet.'}
                  </p>
                ) : (
                  archivedTodos.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-700 dark:text-gray-200 truncate">{item.text}</p>
                        <span className="text-[10px] text-gray-400 font-mono">Tag: {item.tag || 'Daily'}</span>
                      </div>
                      <button
                        onClick={() => restoreArchivedItem(item.id)}
                        className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer border border-green-500/20"
                      >
                        {language === 'hi' ? 'पुनः सक्रिय करें' : 'Restore'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating 'Quick Prayer' Button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          type="button"
          onClick={() => onQuickPrayer?.()}
          className="flex items-center gap-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 group"
          title="Start 5-Minute Quick Prayer & Meditation"
        >
          <div className="p-1 bg-white/20 rounded-full group-hover:rotate-12 transition-transform">
            <Sparkles size={14} className="text-amber-100 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black leading-tight text-amber-100">त्वरित प्रार्थना</span>
            <span className="block text-[11px] font-black leading-tight">Quick Prayer (5m)</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SadhanaTab;
