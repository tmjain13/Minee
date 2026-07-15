import { useState, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pen, Plus, Trash2, Calendar, Sparkles, X, Bookmark, Download, TrendingDown, Info, Flame, Bell, BellRing, Clock, CheckCircle2, FileText } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  doc, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { 
  getLocalData, 
  saveLocalData, 
  createSadhanaRecord, 
  updateSadhanaRecord, 
  deleteSadhanaRecord, 
  syncPendingRecords, 
  isOnline 
} from '../services/sadhanaOfflineSync';
import ConfirmationModal from './ConfirmationModal';

interface DiaryEntry {
  id: string;
  text: string;
  timestamp: any;
  date: string;
}

const FASTING_IMPACTS: { [key: string]: number } = {
  'upvas': 20,
  'ekasana': 5,
  'biyasana': 3,
  'chauvihar': 2,
  'navkarsi': 1,
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

// Empty State Illustration for Sadhana Diary
const SadhanaIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
    {/* Soft Ambient Glow */}
    <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
    <svg width="120" height="120" viewBox="0 0 120 120" className="relative z-10">
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
        <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      
      {/* Decorative Outer Rings */}
      <circle cx="60" cy="60" r="54" fill="none" stroke="url(#accentGrad)" strokeWidth="1" strokeDasharray="4 6" className="opacity-40 animate-spin" style={{ animationDuration: '40s' }} />
      <circle cx="60" cy="60" r="48" fill="none" stroke="#F59E0B" strokeWidth="0.5" className="opacity-20" />

      {/* Book Cover Backing */}
      <rect x="25" y="35" width="70" height="52" rx="6" fill="url(#coverGrad)" opacity="0.9" />
      
      {/* Book Pages */}
      <path d="M 60 40 Q 42 38 30 43 L 30 81 Q 42 76 60 78 Z" fill="url(#bookGrad)" />
      <path d="M 60 40 Q 78 38 90 43 L 90 81 Q 78 76 60 78 Z" fill="url(#bookGrad)" />
      
      {/* Book Spine Shadow / Divider */}
      <line x1="60" y1="40" x2="60" y2="78" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Page Lines (Left Page) */}
      <line x1="38" y1="50" x2="52" y2="48" stroke="#D97706" strokeWidth="1" opacity="0.4" />
      <line x1="38" y1="57" x2="52" y2="55" stroke="#D97706" strokeWidth="1" opacity="0.4" />
      <line x1="38" y1="64" x2="52" y2="62" stroke="#D97706" strokeWidth="1" opacity="0.4" />
      <line x1="38" y1="71" x2="52" y2="69" stroke="#D97706" strokeWidth="1" opacity="0.4" />
      
      {/* Page Lines (Right Page) */}
      <line x1="68" y1="48" x2="82" y2="50" stroke="#D97706" strokeWidth="1" opacity="0.4" />
      <line x1="68" y1="55" x2="82" y2="57" stroke="#D97706" strokeWidth="1" opacity="0.4" />
      <line x1="68" y1="62" x2="82" y2="64" stroke="#D97706" strokeWidth="1" opacity="0.4" />
      <line x1="68" y1="69" x2="82" y2="71" stroke="#D97706" strokeWidth="1" opacity="0.4" />

      {/* Floating Sparkles & Stars */}
      <g className="animate-pulse">
        {/* Sparkle 1 */}
        <path d="M 60 22 Q 60 28 66 28 Q 60 28 60 34 Q 60 28 54 28 Q 60 28 60 22 Z" fill="#FBBF24" />
        {/* Sparkle 2 */}
        <path d="M 22 55 Q 22 59 26 59 Q 22 59 22 63 Q 22 59 18 59 Q 22 59 22 55 Z" fill="#FBBF24" opacity="0.8" />
        {/* Sparkle 3 */}
        <path d="M 94 65 Q 94 68 97 68 Q 94 68 94 71 Q 94 68 91 68 Q 94 68 94 65 Z" fill="#F59E0B" opacity="0.9" />
      </g>
      
      {/* A stylized quill or pen */}
      <path d="M 72 26 Q 74 38 65 52 L 67 53 Q 77 38 74 26 Z" fill="url(#coverGrad)" />
    </svg>
  </div>
);

const SadhanaDiary = memo(() => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [fastingLogs, setFastingLogs] = useState<any[]>([]);
  const [mantraLogs, setMantraLogs] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearJournalConfirm, setShowClearJournalConfirm] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Specialized Paryushana Fasting Calculator States
  const [fastVowType, setFastVowType] = useState('upvas');
  const [fastStart, setFastStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(18, 0, 0, 0); // standard sunset start time
    return d.toISOString().slice(0, 16);
  });
  const [fastEnd, setFastEnd] = useState(() => {
    const d = new Date();
    d.setHours(6, 0, 0, 0); // standard sunrise end time
    return d.toISOString().slice(0, 16);
  });
  const [calculatorSuccess, setCalculatorSuccess] = useState('');
  const [calcSubmitting, setCalcSubmitting] = useState(false);

  // Automatic preset generator when the user updates the fasting type
  useEffect(() => {
    const now = new Date();
    if (fastVowType === 'upvas') {
      const start = new Date(now);
      start.setDate(now.getDate() - 1);
      start.setHours(18, 0, 0, 0);
      const end = new Date(now);
      end.setHours(6, 0, 0, 0);
      setFastStart(start.toISOString().slice(0, 16));
      setFastEnd(end.toISOString().slice(0, 16));
    } else if (fastVowType === 'ekasana') {
      const start = new Date(now);
      start.setHours(10, 0, 0, 0);
      const end = new Date(now);
      end.setHours(11, 0, 0, 0);
      setFastStart(start.toISOString().slice(0, 16));
      setFastEnd(end.toISOString().slice(0, 16));
    } else if (fastVowType === 'biyasana') {
      const start = new Date(now);
      start.setHours(9, 0, 0, 0);
      const end = new Date(now);
      end.setHours(17, 0, 0, 0);
      setFastStart(start.toISOString().slice(0, 16));
      setFastEnd(end.toISOString().slice(0, 16));
    } else if (fastVowType === 'bela') {
      const start = new Date(now);
      start.setDate(now.getDate() - 2);
      start.setHours(18, 0, 0, 0);
      const end = new Date(now);
      end.setHours(6, 0, 0, 0);
      setFastStart(start.toISOString().slice(0, 16));
      setFastEnd(end.toISOString().slice(0, 16));
    } else if (fastVowType === 'teia') {
      const start = new Date(now);
      start.setDate(now.getDate() - 3);
      start.setHours(18, 0, 0, 0);
      const end = new Date(now);
      end.setHours(6, 0, 0, 0);
      setFastStart(start.toISOString().slice(0, 16));
      setFastEnd(end.toISOString().slice(0, 16));
    } else if (fastVowType === 'athai') {
      const start = new Date(now);
      start.setDate(now.getDate() - 8);
      start.setHours(18, 0, 0, 0);
      const end = new Date(now);
      end.setHours(6, 0, 0, 0);
      setFastStart(start.toISOString().slice(0, 16));
      setFastEnd(end.toISOString().slice(0, 16));
    }
  }, [fastVowType]);

  // Dynamically compute precise fasting duration
  const calculatedDuration = useMemo(() => {
    if (!fastStart || !fastEnd) return { hours: 0, days: 0 };
    const startMs = new Date(fastStart).getTime();
    const endMs = new Date(fastEnd).getTime();
    const diffMs = endMs - startMs;
    if (diffMs <= 0) return { hours: 0, days: 0 };
    
    const hours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));
    const days = Number((diffMs / (1000 * 60 * 60 * 24)).toFixed(2));
    return { hours, days };
  }, [fastStart, fastEnd]);

  // Synchronize calculated fast duration to Firestore logs and Sadhana diary
  const handleSaveParyushanFast = async () => {
    if (!user) return;
    if (calculatedDuration.hours <= 0) {
      alert("त्रुटि: पारणा समय शुरूआती आराधना समय के बाद होना चाहिए!");
      return;
    }
    setCalcSubmitting(true);
    
    const vowNames: Record<string, string> = {
      upvas: 'Upvas (उपवास - 36 Hours)',
      ekasana: 'Ekasana (एकासन - One meal)',
      biyasana: 'Biyasana (बियासन - Two meals)',
      bela: 'Bela (बेला - 2-Day Fast)',
      teia: 'Teia (तेइया - 3-Day Fast)',
      athai: 'Athai (अठाई - 8-Day Fast)',
      custom: 'Custom Fast (कस्टम तप)'
    };
    
    const vowName = vowNames[fastVowType] || 'Paryushana Fast';
    const dateStr = new Date(fastEnd).toISOString().split('T')[0];

    try {
      // 1. Log to FastingLogs offline-first
      await createSadhanaRecord(user.uid, 'fastingLogs', {
        type: `paryushan_${fastVowType}`,
        duration: calculatedDuration.days >= 1 ? Math.round(calculatedDuration.days) : 1,
        date: dateStr
      });

      // 2. Log to Diary offline-first
      const diaryText = `🌸 पर्युषण तप आराधना (Paryushana Fasting): ${vowName}\n⏱️ कुल अवधि: ${calculatedDuration.hours} घंटे (${calculatedDuration.days} दिन)\n📅 प्रारंभ: ${new Date(fastStart).toLocaleString('hi-IN')}\n🏁 समापन (पारणा): ${new Date(fastEnd).toLocaleString('hi-IN')}\n🙏 मिच्छामि दुक्कड़ं! इस महा तप से हमारे समस्त दुष्कर्मों और कषायों की निर्जरा हो।`;
      
      await createSadhanaRecord(user.uid, 'diary', {
        text: diaryText,
        date: new Date(fastEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      });

      // 3. Trigger tactile high-milestone haptic vibration pattern
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 150, 50, 200]);
      }

      // 4. Play subtle acoustic sound feedback
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playPitch = (freq: number, startTime: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.08, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const nowS = audioCtx.currentTime;
        playPitch(523.25, nowS, 0.4);       // C5
        playPitch(659.25, nowS + 0.15, 0.4);  // E5
        playPitch(783.99, nowS + 0.3, 0.6);   // G5
        setTimeout(() => audioCtx.close(), 1250);
      } catch (e) {
        console.warn("Acoustic feedback skipped", e);
      }

      setCalculatorSuccess('तप आराधना का डेटा सहेज लिया गया है व साधना डायरी अपडेट कर दी गई है! 🕊️');
      setTimeout(() => setCalculatorSuccess(''), 5000);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/fastingLogs_or_diary`);
    } finally {
      setCalcSubmitting(false);
    }
  };

  // Daily Sadhana Streak math engine (Chronological continuity across checking logs)
  const currentStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const dates = entries
      .map(e => {
        if (!e.timestamp) return null;
        const dateObj = e.timestamp.toDate ? e.timestamp.toDate() : new Date(e.timestamp);
        return dateObj.toISOString().split('T')[0];
      })
      .filter((d): d is string => !!d);

    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let expectedDate = new Date(uniqueDates[0]);
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedStr = expectedDate.toISOString().split('T')[0];
      if (uniqueDates[i] === expectedStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [entries]);

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('sadhana_alarm_enabled') === 'true';
  });

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This device doesn't support web notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification("Sadhana Reminder Activated!", {
          body: "Great! We will remind you daily of your spiritual diary entries and prayers.",
          icon: '/assets/logos/logo-terapanth.jpg',
          badge: '/assets/logos/logo-terapanth.jpg',
        });
      } catch (e) {
        new Notification("Sadhana Reminder Activated!", {
          body: "Great! We will remind you daily of your spiritual diary entries and prayers.",
          icon: '/assets/logos/logo-terapanth.jpg',
        });
      }
    }
  };

  const toggleAlarm = () => {
    const nextVal = !alarmEnabled;
    setAlarmEnabled(nextVal);
    localStorage.setItem('sadhana_alarm_enabled', String(nextVal));

    if (nextVal) {
      if (notificationStatus !== 'granted') {
        requestNotificationPermission();
      } else {
        try {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification("Daily Alarm Set (8:00 PM)", {
              body: "Sadhana reminder alarm successfully locked in. Keep your streak active!",
              icon: '/assets/logos/logo-terapanth.jpg',
            });
          });
        } catch (e) {
          new Notification("Daily Alarm Set (8:00 PM)", {
            body: "Sadhana reminder alarm successfully locked in. Keep your streak active!",
            icon: '/assets/logos/logo-terapanth.jpg',
          });
        }
      }
    }
  };

  // Daily Mantra Tracker logic
  const todayMantraTotal = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return mantraLogs
      .filter(log => log.date === todayStr)
      .reduce((sum, log) => sum + (log.count || 0), 0);
  }, [mantraLogs]);

  const incrementDailyMantra = async (countToAdd: number) => {
    if (!user) return;
    try {
      await createSadhanaRecord(user.uid, 'mantraLogs', {
        mantraId: 'daily_diary_tracker',
        count: countToAdd,
        isFullMala: countToAdd === 108,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('[SadhanaDiary] Error incrementing mantra offline:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Load diary, fasting logs and mantra logs from IndexedDB first for instant offline rendering
    getLocalData('diary').then(cachedEntries => {
      if (cachedEntries && cachedEntries.length > 0) {
        setEntries(cachedEntries as DiaryEntry[]);
      }
    });

    getLocalData('fastingLogs').then(cachedFasts => {
      if (cachedFasts && cachedFasts.length > 0) {
        setFastingLogs(cachedFasts);
      }
    });

    getLocalData('mantraLogs').then(cachedMantras => {
      if (cachedMantras && cachedMantras.length > 0) {
        setMantraLogs(cachedMantras);
      }
    });

    const diaryPath = `users/${user.uid}/diary`;
    const diaryQ = query(collection(db, diaryPath), orderBy('timestamp', 'desc'), limit(20));
    
    const unsubscribeDiary = onSnapshot(diaryQ, (snapshot) => {
      const diaryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiaryEntry));
      setEntries(diaryData);
      
      // Update local IndexedDB cache in background
      diaryData.forEach(entry => {
        saveLocalData('diary', entry);
      });
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, diaryPath);
    });

    const fastingPath = `users/${user.uid}/fastingLogs`;
    const fastingQ = query(collection(db, fastingPath), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeFasting = onSnapshot(fastingQ, (snapshot) => {
      const fastingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFastingLogs(fastingData);
      
      // Update local IndexedDB cache in background
      fastingData.forEach(log => {
        saveLocalData('fastingLogs', log);
      });
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, fastingPath);
    });

    const mantraPath = `users/${user.uid}/mantraLogs`;
    const mantraQ = query(collection(db, mantraPath), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeMantra = onSnapshot(mantraQ, (snapshot) => {
      const mantraData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMantraLogs(mantraData);
      
      // Update local IndexedDB cache in background
      mantraData.forEach(log => {
        saveLocalData('mantraLogs', log);
      });
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, mantraPath);
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
      unsubscribeDiary();
      unsubscribeFasting();
      unsubscribeMantra();
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);

  const reflection = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_REFLECTIONS[day % DAILY_REFLECTIONS.length];
  }, []);

  const chartData = useMemo(() => {
    const data = [];
    let cumulativeReduction = 0;
    
    // Sort logs by date
    const sortedFasting = [...fastingLogs].sort((a, b) => a.date.localeCompare(b.date));
    const sortedMantra = [...mantraLogs].sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      
      const dayFasting = sortedFasting.filter(l => l.date === ds);
      const fastingImpact = dayFasting.reduce((acc, l) => acc + (FASTING_IMPACTS[l.type] || 0) * (l.duration || 1), 0);
      
      const dayMantra = sortedMantra.filter(l => l.date === ds);
      const mantraImpact = dayMantra.reduce((acc, l) => acc + (l.count || 0) / 108, 0);
      
      cumulativeReduction += (fastingImpact + mantraImpact);
      
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        load: Math.max(0, 1000 - cumulativeReduction)
      });
    }
    return data;
  }, [fastingLogs, mantraLogs]);

  const handleAddEntry = async () => {
    if (!user || !inputText.trim()) return;
    try {
      const entryId = `local_${Date.now()}`;
      const newEntry = {
        id: entryId,
        text: inputText,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      
      await createSadhanaRecord(user.uid, 'diary', newEntry);

      // Optimistically update local UI state immediately for responsive interaction
      setEntries(prev => [{ id: entryId, ...newEntry, timestamp: Date.now() } as any, ...prev]);
      setInputText('');
      setIsAdding(false);
    } catch (err) {
      console.error('[SadhanaDiary] Error adding diary entry:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    try {
      await deleteSadhanaRecord(user.uid, 'diary', id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('[SadhanaDiary] Error deleting entry:', err);
    }
  };

  const handleClearAllEntries = async () => {
    if (!user || entries.length === 0) return;
    try {
      for (const entry of entries) {
        await deleteSadhanaRecord(user.uid, 'diary', entry.id);
      }
      setEntries([]);
    } catch (err) {
      console.error('[SadhanaDiary] Error clearing entries:', err);
    }
  };

  const handleUpdateEntry = async () => {
    if (!user || !editingId || !editText.trim()) return;
    try {
      await updateSadhanaRecord(user.uid, 'diary', editingId, {
        text: editText
      });
      setEntries(prev => prev.map(e => e.id === editingId ? { ...e, text: editText } : e));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('[SadhanaDiary] Error updating entry:', err);
    }
  };

  const startEditing = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
    setIsAdding(false);
  };

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const exportToCSV = () => {
    if (entries.length === 0) return;
    const headers = ['Date', 'Entry Content'];
    const csvContent = [
      headers.join(','),
      ...entries.map(e => `"${e.date}","${e.text.replace(/"/g, '""')}"`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Sadhana_Diary_Export_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!user) return;
    setIsExportingPDF(true);
    
    try {
      const reportContainer = document.createElement('div');
      reportContainer.id = 'sadhana-monthly-report-temp';
      reportContainer.style.position = 'fixed';
      reportContainer.style.left = '-9999px';
      reportContainer.style.top = '0';
      reportContainer.style.width = '800px';
      reportContainer.style.backgroundColor = '#ffffff';
      reportContainer.style.padding = '40px';
      reportContainer.style.color = '#1f2937';
      reportContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      reportContainer.style.boxSizing = 'border-box';
      reportContainer.style.lineHeight = '1.5';

      // Top colored bar
      const topBar = document.createElement('div');
      topBar.style.height = '8px';
      topBar.style.backgroundColor = '#f97316';
      topBar.style.borderRadius = '4px 4px 0 0';
      topBar.style.marginBottom = '25px';
      reportContainer.appendChild(topBar);

      // Header Table for layout alignment
      const headerTable = document.createElement('table');
      headerTable.style.width = '100%';
      headerTable.style.borderCollapse = 'collapse';
      headerTable.style.marginBottom = '20px';
      
      const headerRow = headerTable.insertRow();
      
      // Left side: Title
      const leftCell = headerRow.insertCell();
      leftCell.style.width = '70%';
      leftCell.innerHTML = `
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #c2410c; letter-spacing: -0.02em; font-family: 'Georgia', serif;">तेरापंथ जैन साधना</h1>
        <h2 style="margin: 3px 0 0 0; font-size: 14px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">Sadhana Monthly Progress Report</h2>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #6b7280; font-weight: 500;">
          Digital Spiritual Diary • Self-Audit Summary • Monastic Alignment
        </p>
      `;

      // Right side: Profile & Generated info
      const rightCell = headerRow.insertCell();
      rightCell.style.width = '30%';
      rightCell.style.textAlign = 'right';
      rightCell.style.verticalAlign = 'top';
      rightCell.innerHTML = `
        <div style="font-size: 11px; color: #374151; font-weight: 600;">${user.displayName || 'Spiritual Seeker'}</div>
        <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">ID: ${user.uid.substring(0, 8)}...</div>
        <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">Month: ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
        <div style="font-size: 9px; color: #9ca3af; margin-top: 1px;">Generated: ${new Date().toLocaleDateString('en-IN')}</div>
      `;
      reportContainer.appendChild(headerTable);

      // Divider line
      const hr = document.createElement('div');
      hr.style.height = '1px';
      hr.style.backgroundColor = '#e5e7eb';
      hr.style.marginBottom = '25px';
      reportContainer.appendChild(hr);

      // Spiritual quote box
      const quoteBox = document.createElement('div');
      quoteBox.style.padding = '18px 24px';
      quoteBox.style.backgroundColor = '#fffbeb';
      quoteBox.style.border = '1px solid #fde68a';
      quoteBox.style.borderRadius = '16px';
      quoteBox.style.marginBottom = '30px';
      quoteBox.style.textAlign = 'center';
      quoteBox.innerHTML = `
        <p style="margin: 0; font-size: 13px; font-style: italic; color: #b45309; line-height: 1.6; font-weight: 600;">
          "आत्मा का परिष्कार ही साधना है। संयम, तप और स्वाध्याय से ही मोक्ष मार्ग सुलभ होता है।"
        </p>
        <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #d97706;">
          — आचार्य महाश्रमण (Acharya Mahashraman)
        </p>
      `;
      reportContainer.appendChild(quoteBox);

      // Calculate stats
      const totalReflections = entries.length;
      
      const totalFastingRecords = fastingLogs.length;
      const totalFastingImpact = fastingLogs.reduce((acc, l) => {
        const typeBase = l.type.replace('paryushan_', '');
        const impact = FASTING_IMPACTS[typeBase] || 0;
        return acc + impact * (l.duration || 1);
      }, 0);

      const totalMalas = Math.round(mantraLogs.reduce((acc, l) => acc + (l.count || 0) / 108, 0));

      // Stats Grid Table (to maintain strict layouts in PDF conversions)
      const statsTable = document.createElement('table');
      statsTable.style.width = '100%';
      statsTable.style.borderCollapse = 'collapse';
      statsTable.style.marginBottom = '35px';
      
      const statsRow = statsTable.insertRow();
      
      const statItems = [
        { label: 'Reflections Logged', val: totalReflections.toString(), sub: 'Diary check-ins' },
        { label: 'Tapa (Fasting) Records', val: totalFastingRecords.toString(), sub: `${totalFastingImpact} Karmic Points` },
        { label: 'Mantra Japa Malas', val: totalMalas.toString(), sub: 'Chanted Rounds' },
        { label: 'Sadhana Streak', val: `${currentStreak} Days`, sub: 'Introspection continuity' }
      ];

      statItems.forEach((item, index) => {
        const cell = statsRow.insertCell();
        cell.style.width = '25%';
        cell.style.padding = '0 8px';
        if (index === 0) cell.style.paddingLeft = '0';
        if (index === 3) cell.style.paddingRight = '0';
        
        cell.innerHTML = `
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 16px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; font-weight: 700;">${item.label}</p>
            <p style="margin: 6px 0 2px 0; font-size: 22px; font-weight: 800; color: #111827;">${item.val}</p>
            <p style="margin: 0; font-size: 10px; color: #9ca3af; font-weight: 500;">${item.sub}</p>
          </div>
        `;
      });
      reportContainer.appendChild(statsTable);

      // Section Header Helper
      const addSectionHeader = (title: string, sub: string) => {
        const wrap = document.createElement('div');
        wrap.style.borderBottom = '2px solid #f3f4f6';
        wrap.style.paddingBottom = '8px';
        wrap.style.marginBottom = '18px';
        wrap.style.marginTop = '25px';
        wrap.innerHTML = `
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">${title}</h3>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #6b7280; font-weight: 500;">${sub}</p>
        `;
        reportContainer.appendChild(wrap);
      };

      const VOW_NAMES_MAP: Record<string, string> = {
        'upvas': 'Upvas (उपवास - 36 Hours)',
        'ekasana': 'Ekasana (एकासन - One meal)',
        'biyasana': 'Biyasana (बियासन - Two meals)',
        'chauvihar': 'Chauvihar (चौविहार)',
        'navkarsi': 'Navkarsi (नवकारसी)',
        'bela': 'Bela (बेला - 2-Day Fast)',
        'teia': 'Teia (तेइया - 3-Day Fast)',
        'athai': 'Athai (अठाई - 8-Day Fast)',
        'paryushan_upvas': 'Paryushana Upvas (पर्युषण उपवास)',
        'paryushan_ekasana': 'Paryushana Ekasana (पर्युषण एकासन)',
        'paryushan_biyasana': 'Paryushana Biyasana (पर्युषण बियासन)',
        'paryushan_bela': 'Paryushana Bela (पर्युषण बेला)',
        'paryushan_teia': 'Paryushana Teia (पर्युषण तेइया)',
        'paryushan_athai': 'Paryushana Athai (पर्युषण अठाई)',
      };

      // 1. Sadhana Diary Section
      addSectionHeader('Spiritual Reflections Log', 'Personal notes, equanimity checks, and daily introspection');
      if (entries.length === 0) {
        const empty = document.createElement('div');
        empty.style.padding = '15px';
        empty.style.textAlign = 'center';
        empty.style.backgroundColor = '#f9fafb';
        empty.style.borderRadius = '12px';
        empty.style.fontSize = '11px';
        empty.style.color = '#9ca3af';
        empty.innerText = 'No diary entries recorded for this month.';
        reportContainer.appendChild(empty);
      } else {
        const entriesContainer = document.createElement('div');
        entriesContainer.style.display = 'flex';
        entriesContainer.style.flexDirection = 'column';
        entriesContainer.style.gap = '12px';
        
        entries.slice(0, 8).forEach(entry => {
          const card = document.createElement('div');
          card.style.padding = '15px';
          card.style.backgroundColor = '#f9fafb';
          card.style.borderRadius = '14px';
          card.style.borderLeft = '4px solid #f97316';
          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #c2410c;">${entry.date}</span>
              <span style="font-size: 9px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Introspective Log</span>
            </div>
            <p style="margin: 0; font-size: 11px; color: #374151; white-space: pre-wrap; line-height: 1.6;">${entry.text}</p>
          `;
          entriesContainer.appendChild(card);
        });
        reportContainer.appendChild(entriesContainer);
      }

      // Page Break recommendation (to keep the tables aligned nicely)
      const pageBreakMarker = document.createElement('div');
      pageBreakMarker.style.marginBottom = '30px';
      reportContainer.appendChild(pageBreakMarker);

      // 2. Fasting & Dietary Restraints Section
      addSectionHeader('Tapa & Fasting Logs', 'Recent fasting accomplishments with respective karmic loading values');
      if (fastingLogs.length === 0) {
        const empty = document.createElement('div');
        empty.style.padding = '15px';
        empty.style.textAlign = 'center';
        empty.style.backgroundColor = '#f9fafb';
        empty.style.borderRadius = '12px';
        empty.style.fontSize = '11px';
        empty.style.color = '#9ca3af';
        empty.innerText = 'No fasting vows/taps recorded for this month.';
        reportContainer.appendChild(empty);
      } else {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '11px';
        
        const thead = table.createTHead();
        const tr = thead.insertRow();
        ['Date Completed', 'Vow / Fasting Type', 'Duration', 'Karmic Reduction Weight'].forEach(text => {
          const th = tr.insertCell();
          th.innerText = text;
          th.style.fontWeight = '700';
          th.style.padding = '10px';
          th.style.borderBottom = '2px solid #e5e7eb';
          th.style.textAlign = 'left';
          th.style.color = '#374151';
        });

        const tbody = table.createTBody();
        fastingLogs.slice(0, 10).forEach(log => {
          const row = tbody.insertRow();
          const baseType = log.type.replace('paryushan_', '');
          const label = VOW_NAMES_MAP[log.type] || VOW_NAMES_MAP[baseType] || log.type;
          const durationStr = `${log.duration || 1} Day(s)`;
          const impactValue = (FASTING_IMPACTS[baseType] || 0) * (log.duration || 1);

          const cells = [log.date, label, durationStr, `+${impactValue} Points`];
          cells.forEach((text, i) => {
            const td = row.insertCell();
            td.innerText = text;
            td.style.padding = '10px';
            td.style.borderBottom = '1px solid #f3f4f6';
            if (i === 3) {
              td.style.fontWeight = '700';
              td.style.color = '#10b981';
            }
          });
        });
        reportContainer.appendChild(table);
      }

      // 3. Japa logs section
      if (mantraLogs.length > 0) {
        addSectionHeader('Mantra Japa Logs', 'Recent mantra chanting logs with completed mala count rounds');
        const mTable = document.createElement('table');
        mTable.style.width = '100%';
        mTable.style.borderCollapse = 'collapse';
        mTable.style.fontSize = '11px';
        
        const mThead = mTable.createTHead();
        const mTr = mThead.insertRow();
        ['Date Chanted', 'Mantra Name', 'Total Chant Count', 'Completed Malas (108 Chants)'].forEach(text => {
          const th = mTr.insertCell();
          th.innerText = text;
          th.style.fontWeight = '700';
          th.style.padding = '10px';
          th.style.borderBottom = '2px solid #e5e7eb';
          th.style.textAlign = 'left';
          th.style.color = '#374151';
        });

        const mTbody = mTable.createTBody();
        mantraLogs.slice(0, 10).forEach(log => {
          const row = mTbody.insertRow();
          const malasCount = (log.count || 0) / 108;
          let malasStr = Number.isInteger(malasCount) ? malasCount.toString() : malasCount.toFixed(1);
          
          const cells = [
            log.date || new Date().toLocaleDateString('en-IN'),
            log.mantra || 'Navkar Mantra',
            (log.count || 0).toString(),
            `${malasStr} Mala(s)`
          ];
          cells.forEach((text, i) => {
            const td = row.insertCell();
            td.innerText = text;
            td.style.padding = '10px';
            td.style.borderBottom = '1px solid #f3f4f6';
            if (i === 3) {
              td.style.fontWeight = '700';
              td.style.color = '#ec4899';
            }
          });
        });
        reportContainer.appendChild(mTable);
      }

      // Footer
      const footer = document.createElement('div');
      footer.style.textAlign = 'center';
      footer.style.fontSize = '9px';
      footer.style.color = '#9ca3af';
      footer.style.marginTop = '45px';
      footer.style.fontStyle = 'italic';
      footer.innerHTML = `
        <p style="margin: 0;">"The journey toward self-realization begins with discipline. Continuous self-audit leads to spiritual elevation."</p>
        <p style="margin: 4px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #b45309;">
          Terapanth AI • Pure • Spiritual • Consistent
        </p>
      `;
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
      pdf.save(`Sadhana_Diary_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      document.body.removeChild(reportContainer);
    } catch (err) {
      console.error('PDF Export failed', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sadhana Streak & Daily Reminder Consent UI */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent rounded-3xl p-5 border border-amber-500/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Streak Flame circle */}
          <div className="relative flex items-center justify-center w-14 h-14 bg-amber-500/10 rounded-2xl shrink-0">
            <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
            {currentStreak > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-white shadow-sm">
                {currentStreak}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-[#B45309] dark:text-amber-400 text-sm flex items-center gap-1.5">
              Sadhana Streak: <span className="font-mono text-base">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</span>
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              {currentStreak > 0 
                ? "Excellent! Keep checking in daily to maintain your spiritual flame." 
                : "No entries logged today. Write a reflection below to start your streak!"}
            </p>
          </div>
        </div>

        {/* Daily Alarm toggle button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={toggleAlarm}
            className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${
              alarmEnabled 
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' 
                : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-300'
            }`}
          >
            {alarmEnabled ? <BellRing size={12} className="animate-bounce" /> : <Bell size={12} />}
            {alarmEnabled ? 'Daily Alarm Locked' : 'Set Daily Alarm (8PM)'}
          </button>
          
          {notificationStatus !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              title="Request device permission for notifications"
            >
              Enable Alerts
            </button>
          )}
        </div>
      </div>

      {/* Daily Mantra Tracker */}
      <div id="daily-mantra-tracker-container" className="bg-white dark:bg-gray-800/50 rounded-3xl p-5 sm:p-6 border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden">
        {/* Compact grid structure prioritizing circular progress ring on left */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center font-sans">
          
          {/* Circular Progress Ring Area (Prioritized) */}
          <div className="sm:col-span-5 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-black/5 dark:border-white/5 pb-4 sm:pb-0 sm:pr-4 shrink-0">
            <motion.div 
              key={todayMantraTotal} 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 15 }}
              className="relative w-24 h-24 flex items-center justify-center shrink-0"
            >
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="rgba(0, 0, 0, 0.05)"
                  className="dark:stroke-white/5"
                  strokeWidth="6"
                  fill="transparent"
                ></circle>
                {/* Progress Ring with subtle 'pop' animation */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#f97316"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 38}
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 38) * (1 - Math.min(1, todayMantraTotal / 108)) }}
                  transition={{ type: 'spring', damping: 20 }}
                  strokeLinecap="round"
                  fill="transparent"
                ></motion.circle>
              </svg>
              {/* Central Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-800 dark:text-white leading-none font-mono">
                  {todayMantraTotal}
                </span>
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-400 mt-1 leading-none font-sans">
                  / 108
                </span>
              </div>
            </motion.div>

            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-xl font-black text-orange-500 leading-none">
                {Math.min(100, Math.round((todayMantraTotal / 108) * 100))}%
              </span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                Progress
              </span>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest max-w-[120px] leading-tight mt-1">
                {Math.floor(todayMantraTotal / 108)} Malas completed today.
              </p>
            </div>
          </div>

          {/* Description & Quick actions */}
          <div className="sm:col-span-7 space-y-2 text-left relative z-10 pr-6 sm:pr-8">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 font-black text-[8px] uppercase tracking-widest rounded-full border border-orange-500/20">
                Daily Target
              </span>
              {todayMantraTotal >= 108 && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 font-black text-[8px] uppercase tracking-widest rounded-full border border-green-500/20 flex items-center gap-0.5 animate-bounce">
                  <Sparkles size={8} /> Achieved
                </span>
              )}
            </div>
            
            <h3 id="daily-mantra-tracker-heading" className="serif-text text-lg font-bold text-[var(--text-spiritual)] leading-tight">Mala Jaap Tracker</h3>
            <p className="text-[11px] text-gray-500 leading-normal font-sans">
              Perform daily mantra chanting to reduce Karmic Load. Use the quick actions or the floating dial on the right.
            </p>

            <AnimatePresence mode="wait">
              {showResetConfirm ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 rounded-xl p-2 flex items-center justify-between gap-2 mt-2"
                >
                  <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider shrink-0">Clear Today?</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={async () => {
                        if (!user) return;
                        const todayStr = new Date().toISOString().split('T')[0];
                        const path = `users/${user.uid}/mantraLogs`;
                        try {
                          await addDoc(collection(db, path), {
                            mantraId: 'daily_diary_tracker',
                            count: -todayMantraTotal,
                            isFullMala: false,
                            date: todayStr,
                            timestamp: serverTimestamp()
                          });
                        } catch (err) {
                          handleFirestoreError(err, OperationType.CREATE, path);
                        }
                        setShowResetConfirm(false);
                      }}
                      className="px-2 py-1 bg-red-600 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[8px] font-black uppercase tracking-widest hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  <button
                    onClick={() => incrementDailyMantra(1)}
                    className="px-3 py-1.5 bg-spiritual/10 hover:bg-spiritual/20 text-spiritual rounded-lg font-black text-[9px] uppercase tracking-widest border border-spiritual/20 transition-all active:scale-95"
                    title="Add 1 bead count"
                  >
                    +1 Japa
                  </button>
                  <button
                    onClick={() => incrementDailyMantra(108)}
                    className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 rounded-lg font-black text-[9px] uppercase tracking-widest border border-orange-500/20 transition-all active:scale-95"
                    title="Add full mala count"
                  >
                    +108 Mala
                  </button>
                  {todayMantraTotal > 0 && (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-3 py-1.5 hover:bg-red-500/5 text-gray-400 hover:text-red-500 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all active:scale-95"
                      title="Reset today's counts"
                    >
                      Reset
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Floating Speed Dial Button in the corner for quick logging */}
        <div className="absolute bottom-3 right-3 z-30 flex flex-col-reverse items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSpeedDialOpen(!speedDialOpen);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-90 ${speedDialOpen ? 'bg-orange-600 rotate-45' : 'bg-orange-500 hover:bg-orange-600 hover:scale-105'}`}
            title="Sadhana Quick Dial"
            type="button"
          >
            <Plus size={16} />
          </button>

          <AnimatePresence>
            {speedDialOpen && (
              <div className="flex flex-col gap-1.5 mb-1">
                {[
                  { label: "108", value: 108, bg: 'bg-amber-500', title: 'Log 1 Full Mala' },
                  { label: "11", value: 11, bg: 'bg-orange-500', title: 'Log 11 Chants' },
                  { label: "1", value: 1, bg: 'bg-spiritual', title: 'Log 1 Chant' },
                ].map((opt, idx) => (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, y: 12, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      incrementDailyMantra(opt.value);
                      setSpeedDialOpen(false);
                    }}
                    className={`w-7 h-7 rounded-full ${opt.bg} text-white font-black text-[8px] flex items-center justify-center shadow-sm active:scale-90 hover:scale-110 transition-all`}
                    title={opt.title}
                    type="button"
                  >
                    +{opt.label}
                  </motion.button>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Karmic Load Metric */}
      <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 border border-black/5 dark:border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <TrendingDown size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-spiritual uppercase tracking-tight">Karmic Load Index</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">30 Day Projection</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-[8px] font-black text-indigo-500 uppercase">Est. Load</span>
              <Info size={8} className="text-gray-400" />
            </div>
            <p className="text-xl font-black text-indigo-600">
              {chartData[chartData.length - 1]?.load?.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="h-48 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: 700, fill: '#9ca3af' }}
                minTickGap={30}
              />
              <YAxis hide domain={['dataMin - 100', '1000']} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '9px',
                  fontWeight: 800
                }}
              />
              <Line 
                type="monotone" 
                dataKey="load" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={false}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest text-center mt-4 italic">
          Load decreases with Tapa (Fasting) & Jaap (Chanting)
        </p>
      </div>

      {/* PARYUSHANA FASTING DURATION CHRONO-CALCULATOR & LOGGER */}
      <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-6 sm:p-8 border border-amber-500/20 shadow-xl relative overflow-hidden text-left space-y-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="serif-text text-base font-black text-amber-600 dark:text-amber-400 leading-tight">पर्युषण तप साधना काल गणक</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">Paryushana Fasting Chrono-Calculator</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed font-semibold">
          पर्युषण महापर्व के पावन दिनों में किया गया तप विशेष फलदायी होता है। यहाँ अपने उपवास या तप की शुरुआत व पारणा (समापन) का समय चयन करें, प्रणाली आपकी कुल साधना अवधि की गणना स्वतः कर देगी।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">तप संकल्प (Vow Type)</label>
            <select
              value={fastVowType}
              onChange={(e) => setFastVowType(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 focus:border-amber-500/30 rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all text-gray-800 dark:text-gray-200"
            >
              <option value="upvas">Upvas (उपवास - 36h)</option>
              <option value="ekasana">Ekasana (एकासन - 24h)</option>
              <option value="biyasana">Biyasana (बियासन - 24h)</option>
              <option value="bela">Bela (बेला - 60h)</option>
              <option value="teia">Teia (तेइया - 84h)</option>
              <option value="athai">Athai (अठाई - 192h)</option>
              <option value="custom">Custom (कस्टम व्रत)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">आराधना प्रारंभ (Start Time)</label>
            <input
              type="datetime-local"
              value={fastStart}
              onChange={(e) => setFastStart(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 focus:border-amber-500/30 rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all text-gray-800 dark:text-gray-200 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">पारणा / समापन (End Time)</label>
            <input
              type="datetime-local"
              value={fastEnd}
              onChange={(e) => setFastEnd(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 focus:border-amber-500/30 rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all text-gray-800 dark:text-gray-200 font-mono"
            />
          </div>
        </div>

        {/* Dynamic calculations display widget */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">स्वचालित अवधी गणना (Precise Duration)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="serif-text text-xl font-black text-amber-600 dark:text-amber-400">
                {calculatedDuration.hours > 0 ? `${calculatedDuration.hours} Hours` : '-- Hours'}
              </span>
              {calculatedDuration.days > 0 && (
                <span className="text-xs text-gray-400 font-bold">
                  ({calculatedDuration.days} Days)
                </span>
              )}
            </div>
            <p className="text-[9.5px] text-gray-400 font-medium">
              *गणना शुरूआती समय से पारणा (समापन) के वास्तविक कुल घंटे दर्शाती है।
            </p>
          </div>

          <button
            onClick={handleSaveParyushanFast}
            disabled={calcSubmitting || calculatedDuration.hours <= 0}
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-45 cursor-pointer shrink-0"
          >
            {calcSubmitting ? "सहेज रहा है..." : "सुरक्षित डायरी में दर्ज करें →"}
          </button>
        </div>

        {calculatorSuccess && (
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{calculatorSuccess}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-spiritual/10 rounded-xl text-spiritual">
            <Pen size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-spiritual uppercase tracking-tight">Sadhana Diary</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Reflect on your spiritual journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToPDF}
            disabled={isExportingPDF || (entries.length === 0 && fastingLogs.length === 0 && mantraLogs.length === 0)}
            className="flex items-center gap-1.5 p-2 px-3 bg-spiritual/10 hover:bg-spiritual/20 text-spiritual rounded-xl transition-all active:scale-95 disabled:opacity-40"
            title="Generate Monthly PDF Report"
          >
            {isExportingPDF ? (
              <span className="w-4 h-4 rounded-full border-2 border-spiritual border-t-transparent animate-spin inline-block" />
            ) : (
              <FileText size={18} />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
              {isExportingPDF ? 'Generating...' : 'Monthly PDF'}
            </span>
          </button>
          <button 
            onClick={exportToCSV}
            disabled={entries.length === 0}
            className="p-2 bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-spiritual rounded-xl transition-all active:scale-95 disabled:opacity-50"
            title="Export to CSV"
          >
            <Download size={18} />
          </button>
          {entries.length > 0 && (
            <button 
              onClick={() => setShowClearJournalConfirm(true)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all active:scale-95"
              title="Clear entire Sadhana diary"
              id="clear-all-diary-entries-btn"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-2 rounded-xl transition-all active:scale-95 ${isAdding ? 'bg-black text-white' : 'bg-spiritual/10 text-spiritual'}`}
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-spiritual/20 shadow-lg space-y-4">
              {/* Daily Reflection Prompt */}
              <div className="p-4 bg-spiritual/5 rounded-2xl border border-spiritual/10">
                <div className="flex items-center gap-2 mb-2">
                   <Sparkles size={12} className="text-spiritual" />
                   <span className="text-[10px] font-black text-spiritual uppercase tracking-widest">Daily Suggestion</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-bold italic leading-relaxed">
                  {reflection}
                </p>
              </div>

              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Share your spiritual reflection for today..."
                className="w-full bg-transparent border-none focus:outline-none text-sm min-h-[100px] resize-none"
                autoFocus
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleAddEntry}
                  disabled={!inputText.trim()}
                  className="px-6 py-2 bg-spiritual text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} /> Save Entry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="p-10 border-2 border-dashed border-orange-500/15 dark:border-zinc-800 rounded-[2.5rem] bg-gradient-to-b from-amber-500/[0.02] to-transparent text-center max-w-lg mx-auto">
            <SadhanaIllustration />
            <h4 className="serif-text text-sm font-bold text-amber-700 dark:text-amber-400 mb-1.5">अपनी पहली साधना प्रविष्टि दर्ज करें</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              यहाँ आपकी दैनिक स्वाध्याय, समता भाव और तप की अनुभूतियाँ सुरक्षित रहेंगी। अपनी पहली आध्यात्मिक प्रविष्टि लिखने के लिए ऊपर दिए गए "+" बटन पर क्लिक करें।
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={entry.id}
              className="bg-white dark:bg-gray-800/30 p-5 rounded-[2rem] border border-black/5 shadow-sm group hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{entry.date}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => startEditing(entry)}
                    className="p-1.5 text-gray-400 hover:text-spiritual transition-all"
                  >
                    <Pen size={14} />
                  </button>
                  <button 
                    onClick={() => setDeletingEntryId(entry.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-all"
                    id={`delete-entry-btn-${entry.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {editingId === entry.id ? (
                <div className="space-y-3">
                  <textarea 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border-2 border-spiritual/20 rounded-2xl p-4 text-sm min-h-[100px] resize-none focus:outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateEntry}
                      className="px-4 py-2 bg-spiritual text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif italic">
                  "{entry.text}"
                </p>
              )}
              <div className="absolute top-0 right-0 w-24 h-24 bg-spiritual/5 rounded-bl-full translate-x-12 -translate-y-12 pointer-events-none" />
            </motion.div>
          ))
        )}
      </div>

      {/* Clear All Journal Entries Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearJournalConfirm}
        onClose={() => setShowClearJournalConfirm(false)}
        onConfirm={handleClearAllEntries}
        title="डायरी खाली करने की पुष्टि (Clear Entire Journal)"
        message="क्या आप सचमुच अपने साधना डायरी के सभी विचारों को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।"
        confirmLabel="हाँ, सभी हटाएं (Clear All)"
        cancelLabel="रद्द करें (Cancel)"
        type="danger"
        iconType="trash"
      />

      {/* Delete Single Entry Confirmation Modal */}
      <ConfirmationModal
        isOpen={deletingEntryId !== null}
        onClose={() => setDeletingEntryId(null)}
        onConfirm={() => {
          if (deletingEntryId) {
            handleDeleteEntry(deletingEntryId);
          }
        }}
        title="प्रविष्टि हटाने की पुष्टि (Confirm Delete Entry)"
        message="क्या आप इस साधना प्रविष्टि को हटाना चाहते हैं?"
        confirmLabel="हाँ, हटाएं (Delete)"
        cancelLabel="रद्द करें (Cancel)"
        type="danger"
        iconType="trash"
      />
    </div>
  );
});

SadhanaDiary.displayName = 'SadhanaDiary';

export default SadhanaDiary;
