import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
const confetti = (...args: any[]) => {};
import { Clock, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, ShieldCheck, Calendar, Plus, Trash2, CheckCircle2, ChevronRight, Info, Coffee, Sun, Moon, BookOpen, TrendingUp, Download, FileText, Wind, Flame, Timer, RefreshCw, Mic, FlameKindling, CheckSquare, X, Loader2, Send } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { Registry } from '../integrations/ComponentRegistry';

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
  initialSubTab
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
  initialSubTab?: 'timer' | 'fasting' | 'mantra' | 'breathwork' | 'diary' | 'swadhya' | 'gratitude' | 'suvichar' | 'pratikraman' | 'audio' | 'seva' | 'notifications' | 'salah' | 'streaks' | 'habits';
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'timer' | 'fasting' | 'mantra' | 'breathwork' | 'diary' | 'swadhya' | 'gratitude' | 'suvichar' | 'pratikraman' | 'audio' | 'seva' | 'notifications' | 'salah' | 'streaks' | 'habits'>('timer');

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
  const [isListening, setIsListening] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sadhana Session Journaling States
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(48);
  const [sessionMood, setSessionMood] = useState("🧘 शांत");
  const [sessionJournalText, setSessionJournalText] = useState("");
  const [sessionEmotionalState, setSessionEmotionalState] = useState("");
  const [isSavingJournal, setIsSavingJournal] = useState(false);

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
    if (ambientSoundEnabled && (isActive || isBreathActive)) {
      const soundUrls = {
        om: 'https://raw.githubusercontent.com/scottschiller/soundmanager2/master/demo/_mp3/rain.mp3',
        temple_bells: '/assets/peaceful-bell.mp3',
        nature: 'https://raw.githubusercontent.com/scottschiller/soundmanager2/master/demo/_mp3/click-low.mp3'
      };
      
      const currentUrl = soundUrls[spiritualSoundscape || 'om'] || soundUrls.om;

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
  }, [ambientSoundEnabled, isActive, isBreathActive, spiritualSoundscape]);

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
    const path = `users/${user.uid}/fastingLogs`;
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFastingLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FastingLog)));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogFast = async () => {
    if (!user) return;
    const path = `users/${user.uid}/fastingLogs`;
    try {
      await addDoc(collection(db, path), {
        type: selectedFast,
        duration: fastingDuration,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp()
      });
      setFastingDuration(1); // Reset
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const logMeditation = async (minutes: number) => {
    if (!user) return;
    const path = `users/${user.uid}/meditationLogs`;
    try {
      await addDoc(collection(db, path), {
        minutes,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleSaveSadhanaJournal = async () => {
    if (!user) return;
    setIsSavingJournal(true);
    const journalPath = `users/${user.uid}/spiritualJournal`;
    const medPath = `users/${user.uid}/meditationLogs`;
    try {
      // 1. Log meditation duration
      await addDoc(collection(db, medPath), {
        minutes: Number(sessionDuration) || 1,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp()
      });

      // 2. Save spiritual journal entry
      const dateId = new Date().toISOString().split('T')[0];
      const recordRef = doc(db, journalPath, dateId);
      
      await setDoc(recordRef, {
        text: sessionJournalText,
        mood: sessionMood,
        emotionalState: sessionEmotionalState || `साधना सत्र अवधि: ${sessionDuration} मिनट`,
        aiReflection: "साधना सत्र संपन्न। निरंतर अभ्यास से आत्म-शुद्धि होती है और कषायों का शमन होता है।",
        createdAt: new Date().toISOString()
      }, { merge: true });

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

      // Reset states
      setShowJournalModal(false);
      setSessionJournalText("");
      setSessionEmotionalState("");
      // Reset timer
      setTimeLeft(48 * 60);
      setIsActive(false);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, journalPath);
    } finally {
      setIsSavingJournal(false);
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
      const path = `users/${user.uid}/mantraLogs`;
      try {
        await addDoc(collection(db, path), {
          mantraId: id,
          count: isFullMala ? 108 : 1,
          isFullMala,
          date: new Date().toISOString().split('T')[0],
          timestamp: serverTimestamp()
        });
      } catch (err) {
        // Silently fail jaap logging to not interrupt flow
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
      className="space-y-6 pb-20 px-4"
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
        {(['timer', 'salah', 'breathwork', 'mantra', 'fasting', 'diary', 'swadhya', 'gratitude', 'suvichar', 'pratikraman', 'audio', 'seva', 'notifications', 'streaks', 'habits'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-none px-3 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-white dark:bg-gray-800 text-spiritual shadow-sm shadow-black/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            {tab === 'timer' && 'Samayik'}
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
                  <span className="text-3xl font-black">{readHistory?.length || 0}</span>
                  <span className="text-xs font-bold text-gray-400 font-mono">/ {combinedKnowledge?.length || 0} items</span>
                </div>
              </div>

              <div className="p-5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 flex flex-col justify-between text-left">
                <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">Completion Rank</span>
                <span className="text-xl font-black mt-2 text-orange-600 dark:text-orange-400 leading-tight">
                  {(() => {
                    const pct = combinedKnowledge?.length ? ((readHistory?.length || 0) / combinedKnowledge.length) * 100 : 0;
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
                    const pct = combinedKnowledge?.length ? Math.round(((readHistory?.length || 0) / combinedKnowledge.length) * 100) : 0;
                    return `${pct}% Complete`;
                  })()}
                </span>
              </div>
              <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${combinedKnowledge?.length ? ((readHistory?.length || 0) / combinedKnowledge.length) * 100 : 0}%` }}
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
                {combinedKnowledge?.filter(item => !hideReadKnowledge || !readHistory?.some(rh => rh.itemId === item.id)).map((item) => {
                  const isRead = readHistory?.some(rh => rh.itemId === item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleKnowledgeView?.(item)}
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

                {/* Journal Experience Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Sadhana Experience Journal (साधना अनुभव लेखन)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="इस सत्र में आपके क्या अनुभव रहे? कोई विशेष विचार या कषाय शांति जिसे आपने महसूस किया..."
                    value={sessionJournalText}
                    onChange={(e) => setSessionJournalText(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-xs text-gray-750 dark:text-gray-200 focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed"
                  />
                </div>
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
    </motion.div>
  );
});

SadhanaTab.displayName = 'SadhanaTab';

export default SadhanaTab;
