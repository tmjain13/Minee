import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  orderBy,
  query,
  limit,
  onSnapshot
} from 'firebase/firestore';
import {
  BookOpen,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Send,
  Loader2,
  Quote,
  ChevronLeft
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';

interface JournalEntry {
  id: string; // dateId
  text: string;
  mood: string;
  emotionalState?: string;
  aiReflection: string;
  createdAt: any;
}

const MOODS = [
  { emoji: "😊", label: "प्रसन्न" },
  { emoji: "😐", label: "सामान्य" },
  { emoji: "😔", label: "उदास" },
  { emoji: "😤", label: "क्रोधित" },
  { emoji: "🧘", label: "शांत" }
];

const moodToScore = (moodStr: string): number => {
  if (moodStr.includes("प्रसन्न")) return 5;
  if (moodStr.includes("शांत")) return 4;
  if (moodStr.includes("सामान्य")) return 3;
  if (moodStr.includes("उदास")) return 2;
  if (moodStr.includes("क्रोधित")) return 1;
  return 3;
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const emojiMap: Record<number, string> = {
    5: "😊",
    4: "🧘",
    3: "😐",
    2: "😔",
    1: "😤"
  };
  return (
    <text x={x - 6} y={y + 4} textAnchor="end" className="text-xs select-none">
      {emojiMap[payload.value] || ""}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-2.5 shadow-md text-left text-[11px] font-bold">
        <p className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[8.5px] mb-0.5">
          {data.dateStr}
        </p>
        <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
          <span className="text-xs">{data.emoji}</span>
          <span>{data.moodName}</span>
        </div>
      </div>
    );
  }
  return null;
};

const QUOTES = [
  { quote: "विचारों के परिवर्तन से ही जीवन का परिवर्तन संभव है।", author: "आचार्य महाप्रज्ञ" },
  { quote: "क्रोध को क्षमा से, अहंकार को विनम्रता से और लोभ को संतोष से जीतें।", author: "आचार्य महाश्रमण" },
  { quote: "स्वयं से स्वयं की खोज ही सच्ची साधना है।", author: "आचार्य महाप्रज्ञ" },
  { quote: "सहनशीलता का गुण मनुष्य को महान बना देता है।", author: "आचार्य महाश्रमण" },
  { quote: "स्वस्थ शरीर, प्रसन्न मन और शांत आत्मा ही जीवन की वास्तविक पूंजी है।", author: "आचार्य महाप्रज्ञ" },
  { quote: "क्षमा वीरस्य भूषणम् — क्षमा करना वीरों का आभूषण है।", author: "आचार्य महाश्रमण" }
];

interface SpiritualJournalProps {
  onBack?: () => void;
}

export default function SpiritualJournal({ onBack }: SpiritualJournalProps) {
  const { user } = useAuth();
  const [text, setText] = useState(() => localStorage.getItem('spiritual_journal_draft') || "");
  const [selectedMood, setSelectedMood] = useState("🧘 शांत");
  const [emotionalState, setEmotionalState] = useState("");
  const [aiReflection, setAiReflection] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);

  // Current hour state to check if 7 PM (19:00) has passed
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // Static list of hand-picked, authentic Jain-inspired daily reflection prompts
  const DAILY_REFLECTION_PROMPTS = [
    { text: "Share one act of kindness you observed or performed today.", hin: "आज आपके द्वारा देखा गया या किया गया दयाभावना का कोई एक कार्य साझा करें।" },
    { text: "Reflect on how you practiced tolerance (Sahan-sheelta) in a difficult situation today.", hin: "आज किसी कठिन परिस्थिति में आपने सहनशीलता का परिचय कैसे दिया, चिंतन करें।" },
    { text: "What is one thing you are grateful to Acharya Mahashraman Ji for today?", hin: "पूज्य आचार्य श्री महाश्रमण जी के प्रति आज आपके मन में कौन सा कृतज्ञता भाव उमड़ा?" },
    { text: "Identify one moment today when you successfully controlled your impulses or anger.", hin: "आज का वह एक पल पहचानें जब आपने अपने आवेश या क्रोध पर सफलतापूर्वक विजय पाई।" },
    { text: "What spiritual self-study (Swadhyay) or chanting (Japa) did you perform to clear your thoughts?", hin: "आज अपने विचारों को निर्मल करने के लिए आपने कौन सा स्वाध्याय या मंत्र जाप किया?" }
  ];

  const [reflectionIndex, setReflectionIndex] = useState(0);
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [quickNote, setQuickNote] = useState(() => localStorage.getItem('sadhana_quick_note') || "");

  useEffect(() => {
    localStorage.setItem('sadhana_quick_note', quickNote);
  }, [quickNote]);

  // ----------------------------------------------------
  // ADVANCED ANALYTICS: MOOD DISTRIBUTION & TREND
  // ----------------------------------------------------
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Get current month's entries for the percentage distribution
  const currentMonthEntries = pastEntries.filter(entry => {
    if (!entry.createdAt) return false;
    const d = new Date(entry.createdAt);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Calculate current month distribution
  const currentMonthMoodDistribution = MOODS.map(m => {
    const count = currentMonthEntries.filter(entry => entry.mood.includes(m.label)).length;
    return {
      ...m,
      count,
      percentage: currentMonthEntries.length > 0 ? Math.round((count / currentMonthEntries.length) * 100) : 0
    };
  });

  // Dominant mood of the current month
  const dominantMoodObj = [...currentMonthMoodDistribution].sort((a, b) => b.count - a.count)[0];
  const hasMonthlyData = currentMonthEntries.length > 0;

  // Gather 30-day chronological entries for Mood Trend
  const last30DaysEntries = [...pastEntries]
    .filter(entry => {
      if (!entry.createdAt) return false;
      const entryDate = new Date(entry.createdAt);
      const diffTime = Math.abs(now.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // oldest to newest
    .map(entry => {
      const d = new Date(entry.createdAt);
      return {
        dateStr: d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }),
        score: moodToScore(entry.mood),
        moodName: entry.mood.split(" ")[1] || entry.mood,
        emoji: entry.mood.split(" ")[0] || "🧘"
      };
    });

  const hasTrendData = last30DaysEntries.length >= 2;

  const trendDataToRender = hasTrendData 
    ? last30DaysEntries 
    : [
        { dateStr: "दिवस १", score: 4, moodName: "शांत", emoji: "🧘" },
        { dateStr: "दिवस ५", score: 3, moodName: "सामान्य", emoji: "😐" },
        { dateStr: "दिवस १०", score: 5, moodName: "प्रसन्न", emoji: "😊" },
        { dateStr: "दिवस १५", score: 4, moodName: "शांत", emoji: "🧘" },
        { dateStr: "दिवस २०", score: 4, moodName: "शांत", emoji: "🧘" }
      ];

  // Live real-time feedback with backend proxy to request unique AI prompt from Gemini on-demand
  const handleGenerateAiPrompt = async () => {
    setLoadingPrompt(true);
    setCustomAiPrompt("");
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const systemPrompt = "You are a Jain Terapanth spiritual guide. Generate one short, deep daily reflection question (1-2 sentences) in simple Hindi and English. It should encourage mindfulness, gratitude, kindness, or self-control (like 'Share one act of kindness you observed today'). Keep the format exactly as: 'Hindi text | English text'. Do not provide any other text.";

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: "Please trigger a new spiritual daily reflection prompt.",
          offlineContext: systemPrompt.slice(0, 2000)
        })
      });

      if (!response.ok) {
        throw new Error('विफल हो गया');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                if (!parsed.chunk.includes("<style>")) {
                  fullText += parsed.chunk;
                  setCustomAiPrompt(fullText);
                }
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      }
    } catch (err) {
      console.error("AI Prompt generation error:", err);
      // Reliable fallback
      setCustomAiPrompt("आज आपने कौन सा दयाभावना या करुणा का कार्य देखा या किया? | Share one act of kindness you observed or performed today.");
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Generate today's Hindi date
  const todayHindiDate = new Date().toLocaleDateString('hi-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Cycle through inspirational quotes on render & track active hour changes
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * QUOTES.length);
    setSelectedQuote(QUOTES[randomIdx]);

    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Fetch past entries from Firestore (up to 100 for trend analysis)
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/spiritualJournal`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(100));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: JournalEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          text: data.text || "",
          mood: data.mood || "🧘 शांत",
          emotionalState: data.emotionalState || "",
          aiReflection: data.aiReflection || "",
          createdAt: data.createdAt
        });
      });
      setPastEntries(entries);
    }, (error) => {
      console.error("Error loading journal entries:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Pre-fill today's existing entry from Firestore if it exists and text is empty
  useEffect(() => {
    const todayId = new Date().toISOString().split('T')[0];
    const todayEntry = pastEntries.find(e => e.id === todayId);
    if (todayEntry && !localStorage.getItem('spiritual_journal_draft')) {
      setText(todayEntry.text);
      if (todayEntry.aiReflection) {
        setAiReflection(todayEntry.aiReflection);
      }
      if (todayEntry.mood) {
        setSelectedMood(todayEntry.mood);
      }
      if (todayEntry.emotionalState) {
        setEmotionalState(todayEntry.emotionalState);
      }
    }
  }, [pastEntries]);

  // Immediate LocalStorage Auto-Save & Debounced Firebase Sync
  useEffect(() => {
    localStorage.setItem('spiritual_journal_draft', text);

    if (!text.trim()) {
      setSyncStatus('idle');
      return;
    }

    const todayId = new Date().toISOString().split('T')[0];
    const todayEntry = pastEntries.find(e => e.id === todayId);
    if (todayEntry && todayEntry.text === text) {
      setSyncStatus('synced');
      return;
    }

    if (!navigator.onLine) {
      setSyncStatus('offline');
      localStorage.setItem('spiritual_journal_needs_sync', 'true');
      return;
    }

    setSyncStatus('pending');

    const debounceTimer = setTimeout(async () => {
      if (!user) return;
      setSyncStatus('saving');
      try {
        const dateId = new Date().toISOString().split('T')[0];
        const recordRef = doc(db, `users/${user.uid}/spiritualJournal`, dateId);
        
        await setDoc(recordRef, {
          text,
          mood: selectedMood,
          emotionalState: emotionalState,
          createdAt: new Date().toISOString()
        }, { merge: true });

        setSyncStatus('synced');
        localStorage.removeItem('spiritual_journal_needs_sync');
      } catch (error) {
        console.error("Auto-sync error:", error);
        setSyncStatus('offline');
        localStorage.setItem('spiritual_journal_needs_sync', 'true');
      }
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [text, selectedMood, emotionalState, user, pastEntries]);

  // Listen for reconnection (online event) to sync pending drafts
  useEffect(() => {
    const syncDraft = async () => {
      const needsSync = localStorage.getItem('spiritual_journal_needs_sync') === 'true';
      const draft = localStorage.getItem('spiritual_journal_draft');
      
      if (needsSync && draft && draft.trim() && user && navigator.onLine) {
        setSyncStatus('saving');
        try {
          const dateId = new Date().toISOString().split('T')[0];
          const recordRef = doc(db, `users/${user.uid}/spiritualJournal`, dateId);
          
          await setDoc(recordRef, {
            text: draft,
            mood: selectedMood,
            emotionalState: emotionalState,
            createdAt: new Date().toISOString()
          }, { merge: true });

          setSyncStatus('synced');
          localStorage.removeItem('spiritual_journal_needs_sync');
        } catch (error) {
          console.error("Online re-sync error:", error);
          setSyncStatus('offline');
        }
      }
    };

    // Run on mount
    syncDraft();

    window.addEventListener('online', syncDraft);
    return () => window.removeEventListener('online', syncDraft);
  }, [user, selectedMood, emotionalState]);

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'pending' | 'idle'>('idle');

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const handleGetReflection = async () => {
    if (!text.trim()) {
      alert("कृपया चिंतन प्राप्त करने के लिए पहले कुछ विचार लिखें।");
      return;
    }

    setLoadingAI(true);
    setAiReflection("");

    try {
      const token = await auth.currentUser?.getIdToken(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const systemPrompt = "You are a Jain Terapanth spiritual guide. When a user shares their journal entry, respond with a brief spiritual reflection (3-4 sentences) based on Terapanth teachings — cite relevant teachings from Acharya Mahapragya or Acharya Mahashraman. Respond in Hindi only. Be warm, encouraging, and practical.";

      const payloadMessage = `User mood is "${selectedMood}"${emotionalState ? ` (emotional state during study/meditation: ${emotionalState})` : ''}. Reflection journal text is:\n"${text}"`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: payloadMessage.slice(0, 2000),
          offlineContext: systemPrompt.slice(0, 2000)
        })
      });

      if (!response.ok) {
        throw new Error('विफल हो गया');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                // Filter out the style tag if injected in the response chunks
                if (!parsed.chunk.includes("<style>")) {
                  fullText += parsed.chunk;
                  setAiReflection(fullText);
                }
              }
            } catch (e) {
              // Parse error
            }
          }
        }
      }

      // Automatically save to firestore after reflection finishes
      if (user) {
        const dateId = new Date().toISOString().split('T')[0];
        const recordRef = doc(db, `users/${user.uid}/spiritualJournal`, dateId);
        await setDoc(recordRef, {
          text,
          mood: selectedMood,
          emotionalState: emotionalState,
          aiReflection: fullText || "चिंतन उपलब्ध नहीं है",
          createdAt: new Date().toISOString()
        });
        localStorage.removeItem('spiritual_journal_draft');
        localStorage.removeItem('spiritual_journal_needs_sync');
        setSyncStatus('synced');
      }

    } catch (err) {
      console.error("AI Reflection error:", err);
      setAiReflection("क्षमा करें, चिंतन उत्पन्न करने में समस्या आई। कृपया पुनः प्रयास करें।");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--border-color)] space-y-6 shadow-sm text-left relative" id="spiritual-journal-container">
      
      {/* UI Fix Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #spiritual-journal-container, #spiritual-journal-container * {
            visibility: visible;
          }
          #spiritual-journal-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-start gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 transition-all cursor-pointer text-gray-700 dark:text-gray-300"
              title="पीछे जाएं"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl flex items-center gap-2">
              आत्म-चिंतन पत्रिका
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              AI-Powered Spiritual Reflection
            </p>
          </div>
        </div>

        {/* Quick Note Area */}
        <div className="w-full sm:w-64">
           <textarea
             value={quickNote}
             onChange={(e) => setQuickNote(e.target.value)}
             placeholder="Quick Note..."
             className="w-full text-xs p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 resize-none focus:border-rose-500/30 outline-none transition-all"
             rows={2}
           />
        </div>

        {/* Export and action buttons */}
        <button
          onClick={handleExportPDF}
          className="px-4.5 py-2.5 bg-black/5 dark:bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-wider text-gray-500 hover:bg-black/10 transition-all flex items-center gap-2 cursor-pointer border border-black/5 dark:border-white/5 align-self-end sm:align-self-auto"
        >
          <FileText size={14} className="text-amber-500" />
          <span>पत्रिका निर्यात करें (PDF)</span>
        </button>
      </div>

      {/* Current Date Ribbon */}
      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-500/5 px-4.5 py-3 rounded-2xl border border-rose-500/10 text-xs font-black">
        <Calendar size={14} />
        <span>आज की तिथि: {todayHindiDate}</span>
      </div>

      {/* 📊 SPIRITUAL JOURNAL SUMMARY & TREND VIEW */}
      <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
          <BookOpen className="text-rose-500" size={16} />
          <h4 className="serif-text font-black text-gray-900 dark:text-white text-sm">
            मासिक भाव-दशा विश्लेषण व प्रवाह (Spiritual Health Dashboard)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Monthly Mood Distribution */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                इस माह की भाव-दशा (Monthly Mood Distribution)
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                {hasMonthlyData 
                  ? `इस माह में कुल ${currentMonthEntries.length} चिंतन प्रविष्टियाँ दर्ज़ हैं।` 
                  : "इस महीने की साधना प्रविष्टियों का विश्लेषण यहाँ प्रदर्शित होगा।"}
              </p>
            </div>

            {hasMonthlyData ? (
              <div className="space-y-3">
                {currentMonthMoodDistribution.map(m => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </span>
                      <span>{m.percentage}% ({m.count})</span>
                    </div>
                    <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden border border-black/[0.03] dark:border-white/[0.03]">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${m.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}

                {/* Dominant Mood Highlights */}
                {dominantMoodObj && dominantMoodObj.count > 0 && (
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-3 flex items-center gap-3 mt-4">
                    <span className="text-2xl">{dominantMoodObj.emoji}</span>
                    <div className="text-left">
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">प्रमुख भाव (Dominant Mood)</span>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">
                        इस महीने आपका प्रमुख भाव <span className="text-rose-500">"{dominantMoodObj.label}"</span> रहा है।
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback list showing empty state with beautiful indicators */
              <div className="space-y-3 opacity-60">
                {MOODS.map((m, index) => {
                  const demoPercentages = [40, 30, 15, 5, 10];
                  return (
                    <div key={m.label} className="space-y-1 text-left">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <span>{m.emoji}</span>
                          <span>{m.label}</span>
                        </span>
                        <span>{demoPercentages[index]}% (उदा.)</span>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden border border-black/[0.02]">
                        <div 
                          className="bg-gray-300 dark:bg-zinc-700 h-full rounded-full" 
                          style={{ width: `${demoPercentages[index]}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-rose-500/80 font-bold text-center pt-2 leading-relaxed">
                  💡 मासिक विश्लेषण शुरू करने के लिए आज की पहली प्रविष्टि सहेजें!
                </p>
              </div>
            )}
          </div>

          {/* 2. Mood Trend Line Chart */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                ३० दिवसीय साधना प्रवाह (30-Day Mood Trend)
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                {hasTrendData 
                  ? "विगत ३० दिनों में आपकी आत्मिक ऊर्जा एवं शांति का ग्राफ" 
                  : "जैसे-जैसे आप प्रविष्टियाँ लिखेंगे, आपकी आत्मिक यात्रा का ग्राफ यहाँ दिखेगा।"}
              </p>
            </div>

            <div className="h-56 w-full bg-black/[0.02] dark:bg-black/20 rounded-2xl p-4 border border-black/5 dark:border-white/5 relative flex flex-col justify-between">
              {!hasTrendData && (
                <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-10 backdrop-blur-[1px]">
                  <span className="text-xl">📈</span>
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200 mt-1">साधना प्रवाह ग्राफ (Preview)</span>
                  <p className="text-[10px] text-gray-500 max-w-[200px] mt-1 leading-normal font-semibold">
                    कम से कम दो दिनों की प्रविष्टि होने पर आपकी वास्तविक साधना यात्रा रेखांकित होगी।
                  </p>
                </div>
              )}

              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendDataToRender} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(239, 68, 68, 0.05)" />
                    <XAxis 
                      dataKey="dateStr" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }}
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      ticks={[1, 2, 3, 4, 5]} 
                      tick={<CustomYAxisTick />} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      activeDot={{ r: 6, stroke: '#f43f5e', strokeWidth: 2 }}
                      dot={{ r: 3, strokeWidth: 1, fill: '#ef4444' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-triggered daily reflection prompt if the user hasn't recorded an entry by 7 PM */}
      {(() => {
        const todayId = new Date().toISOString().split('T')[0];
        const hasTodayEntry = pastEntries.some(entry => entry.id === todayId);
        const isPast7Pm = currentHour >= 19;

        if (isPast7Pm && !hasTodayEntry) {
          return (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="from-amber-500/10 to-rose-500/10 bg-gradient-to-br border border-amber-500/20 rounded-3xl p-5 sm:p-6 space-y-3.5 relative overflow-hidden shadow-sm text-left"
            >
              {/* Absolute accent light decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Sparkles size={18} className="animate-pulse shrink-0" />
                <h4 className="serif-text font-black text-xs sm:text-sm uppercase tracking-wide">
                  गुरूकृपा AI संध्याकाल आत्म-चिंतन प्रेरणा (7 PM Reflection Prompt)
                </h4>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                  आज का दिव्य चिंतन विषय (Suggested Prompt):
                </p>
                
                <div 
                  onClick={() => {
                    // Pre-fill prompt cleanly into writing field
                    const cleanPrompt = customAiPrompt 
                      ? (customAiPrompt.includes('|') ? customAiPrompt.split('|')[0].trim() : customAiPrompt.trim())
                      : DAILY_REFLECTION_PROMPTS[reflectionIndex].hin;
                    const cleanPromptEng = customAiPrompt 
                      ? (customAiPrompt.includes('|') ? customAiPrompt.split('|')[1].trim() : "")
                      : DAILY_REFLECTION_PROMPTS[reflectionIndex].text;
                    
                    setText(`[विषय: ${cleanPrompt} ${cleanPromptEng ? `/ ${cleanPromptEng}` : ''}]\n\nआज का मेरा अनुभव: `);
                  }}
                  className="bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 transition-all border border-amber-500/10 px-4 py-3 rounded-2xl cursor-pointer text-xs font-semibold leading-relaxed text-gray-800 dark:text-gray-200 shadow-inner flex flex-col justify-between"
                  title="इस विषय को लेखन क्षेत्र में प्रविष्टि रूप में भरने के लिए क्लिक करें"
                >
                  {loadingPrompt ? (
                    <span className="text-gray-400 flex items-center gap-2 py-1.5 shrink-0">
                      <Loader2 className="animate-spin text-amber-500" size={14} />
                      AI नया दिव्य विषय तैयार कर रहा है...
                    </span>
                  ) : (
                    <>
                      <span className="text-amber-700 dark:text-amber-300 font-bold">
                        {customAiPrompt ? (customAiPrompt.includes('|') ? customAiPrompt.split('|')[0].trim() : customAiPrompt.trim()) : DAILY_REFLECTION_PROMPTS[reflectionIndex].hin}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-[10.5px] mt-1 block italic leading-snug">
                        {customAiPrompt ? (customAiPrompt.includes('|') ? customAiPrompt.split('|')[1].trim() : '') : DAILY_REFLECTION_PROMPTS[reflectionIndex].text}
                      </span>
                    </>
                  )}
                  <span className="text-[9.5px] font-black tracking-widest uppercase text-amber-500 mt-2 block select-none text-right">
                    👉 चिंतन लिखने के लिए यहाँ क्लिक करें (Tap to Autocomplete)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateAiPrompt}
                  disabled={loadingPrompt}
                  className="px-3.5 py-2 bg-amber-600/15 text-amber-700 dark:text-amber-300 hover:bg-amber-600/25 disabled:opacity-50 transition-all text-[10px] font-bold tracking-wider uppercase rounded-xl border border-amber-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={11} />
                  <span>AI लाइव नया विषय लाएं</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setCustomAiPrompt("");
                    setReflectionIndex((prev) => (prev + 1) % DAILY_REFLECTION_PROMPTS.length);
                  }}
                  className="px-3.5 py-2 bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10 transition-all text-[10px] font-bold tracking-wider uppercase rounded-xl border border-black/5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔄 अन्य सुझाए विषय देखें</span>
                </button>
              </div>
            </motion.div>
          );
        }
        return null;
      })()}

      {/* Entry creation form */}
      <div className="space-y-4">
        {/* Mood select container */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">आज का भाव (Mood Selector)</label>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map(m => {
              const matches = selectedMood === `${m.emoji} ${m.label}`;
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(`${m.emoji} ${m.label}`)}
                  className={`p-2.5 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    matches 
                      ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/10' 
                      : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-500 border-black/5 dark:border-white/5 hover:bg-black/5'
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[9px] font-black tracking-tighter truncate w-full">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotional State Tag / Input Field */}
        <div className="space-y-2.5 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-3xl p-4.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">
              साधना/स्वाध्याय के समय मानसिक स्थिति (Emotional State / Focus)
            </label>
            {emotionalState && (
              <button 
                type="button" 
                onClick={() => setEmotionalState("")}
                className="text-[9px] font-bold text-rose-500 hover:underline uppercase tracking-wider cursor-pointer"
              >
                साफ़ करें (Clear)
              </button>
            )}
          </div>
          
          <input
            type="text"
            value={emotionalState}
            onChange={(e) => setEmotionalState(e.target.value)}
            placeholder="उदा. एकाग्र, शांत, व्याकुल, भक्तिमय..."
            className="w-full bg-white dark:bg-black/30 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-150 outline-none focus:border-rose-500/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: "एकाग्र / Focused", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" },
              { label: "भक्तिमय / Devotional", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20" },
              { label: "शांत / Serene", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20" },
              { label: "विचारमग्न / Contemplative", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20" },
              { label: "कृतज्ञ / Grateful", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20" },
              { label: "चंचल / Restless", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20" }
            ].map(pill => (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  const tagText = pill.label.split(" / ")[0];
                  if (emotionalState.includes(tagText)) return;
                  const currentTags = emotionalState ? emotionalState.split(", ").filter(Boolean) : [];
                  currentTags.push(tagText);
                  setEmotionalState(currentTags.join(", "));
                }}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${pill.color}`}
              >
                + {pill.label.split(" / ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">मन के विचार एवं स्वाध्याय अवलोकन</label>
            {syncStatus !== 'idle' && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all ${
                syncStatus === 'synced' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : syncStatus === 'saving' 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse' 
                  : syncStatus === 'offline' 
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                  : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
              }`}>
                {syncStatus === 'synced' && '✓ सहेजा गया (Saved)'}
                {syncStatus === 'saving' && '⚡ सहेज रहा है... (Saving)'}
                {syncStatus === 'offline' && '📴 ऑफ़लाइन - स्थानीय रूप से सुरक्षित (Saved locally)'}
                {syncStatus === 'pending' && '⏳ सिंक लंबित... (Pending)'}
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="आज का चिंतन... (अपने विचार, अनुभव, की गई सामायिक या तप साधना के क्षण लिखें...)"
              className="w-full h-36 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 focus:border-rose-500/30 rounded-3xl p-4 text-xs font-semibold leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none transition-all text-gray-800 dark:text-gray-150"
            />
            <div className="absolute bottom-4.5 right-4.5 text-[9px] text-gray-400 dark:text-gray-500 font-mono font-bold tracking-widest bg-black/[0.03] dark:bg-white/[0.03] px-2 py-1 rounded-md">
              WORDS: {wordCount}
            </div>
          </div>
        </div>

        {/* Reflection submit action */}
        <button
          onClick={handleGetReflection}
          disabled={loadingAI || !text.trim()}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-90 disabled:opacity-40 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loadingAI ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>आत्मिक मंथन चालू है...</span>
            </>
          ) : (
            <>
              <Sparkles className="animate-pulse" size={16} />
              <span>AI से प्रतिबिंब पाएं</span>
            </>
          )}
        </button>
      </div>

      {/* Modern Card Output Panel with Live Stream Content */}
      <AnimatePresence>
        {(aiReflection || loadingAI) && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-rose-500/[0.02] dark:bg-white/[0.01] border border-rose-500/15 rounded-3xl p-5 sm:p-6 space-y-4 text-left"
          >
            <div className="flex items-center gap-2 text-rose-500 border-b border-rose-500/10 pb-3">
              <Sparkles size={16} className="animate-spin" />
              <h4 className="serif-text font-black text-gray-900 dark:text-white text-sm">
                🌟 आत्मिक प्रतिबिंब
              </h4>
            </div>

            {loadingAI && !aiReflection ? (
              <div className="flex items-center gap-3 text-gray-400 text-xs py-2">
                <Loader2 className="animate-spin text-rose-500" size={16} />
                <span>गुरूदेवों महाप्रज्ञ-महाश्रमण के विचारों की सरगम टटोल रहे हैं...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 font-semibold italic">
                  "{aiReflection}"
                </p>

                {/* Sub title citation element */}
                <div className="border-t border-dashed border-rose-500/10 pt-3 flex gap-3 items-start">
                  <Quote size={20} className="text-rose-500/30 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block uppercase tracking-widest">प्रेरणा मंत्र:</span>
                    <p className="text-[11.5px] leading-relaxed text-rose-600 dark:text-rose-400 font-bold serif-text">
                      "{selectedQuote.quote}"
                    </p>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mt-0.5">
                      — {selectedQuote.author}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-existing Records Accordion (Last 7 entries) */}
      <div className="space-y-3.5 pt-4 border-t border-black/5 dark:border-white/5">
        <h4 className="serif-text font-black text-gray-900 dark:text-white text-sm">
          विगत चिंतन इतिहास (Past entries)
        </h4>

        {pastEntries.length === 0 ? (
          <p className="text-xs text-gray-400 leading-relaxed italic">
            अभी तक कोई चिंतन सहेजा नहीं गया है। आज का चिंतन लिखकर AI प्रतिबिंब पाएं। वो इतिहास यहाँ सुरक्षित रहेगा।
          </p>
        ) : (
          <div className="space-y-2.5">
            {pastEntries.slice(0, 7).map((entry) => {
              const isExpanded = expandedId === entry.id;
              // Format date cleanly in readable hindi format
              const formattedDateString = new Date(entry.createdAt || entry.id).toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div 
                  key={entry.id} 
                  className={`bg-black/[0.01] dark:bg-white/[0.01] border hover:bg-black/[0.02]/[0.02] transition-all rounded-2xl overflow-hidden ${
                    isExpanded ? 'border-rose-500/20' : 'border-black/5 dark:border-white/5'
                  }`}
                >
                  {/* Top Bar clickable */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg bg-black/5 dark:bg-white/5 p-1.5 rounded-lg shrink-0">
                        {entry.mood.split(" ")[0]}
                      </span>
                      <div>
                        <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs flex flex-wrap items-center gap-1.5">
                          <span>{formattedDateString} ({entry.mood.split(" ")[1]})</span>
                          {entry.emotionalState && (
                            <span className="px-2 py-0.5 text-[9.5px] bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/10 font-black shrink-0">
                              {entry.emotionalState}
                            </span>
                          )}
                        </h5>
                        <p className="text-[10.5px] text-gray-400 dark:text-gray-500 font-semibold truncate max-w-xs sm:max-w-md mt-0.5">
                          {entry.text}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </button>

                  {/* Expanded Body Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 pt-1 border-t border-dashed border-black/5 dark:border-white/5 space-y-3"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest block">आपका लेखन</span>
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-black/5">
                            {entry.text}
                          </p>
                        </div>

                        {entry.emotionalState && (
                          <div className="space-y-1">
                            <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest block">ध्यान/स्वाध्याय के समय मानसिक स्थिति</span>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.emotionalState.split(", ").map((tag, idx) => (
                                <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-300 rounded-lg border border-rose-500/10">
                                  🏷️ {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.aiReflection && (
                          <div className="space-y-1.5 border-t border-dashed border-rose-500/10 pt-3">
                            <span className="text-[8.5px] font-black text-rose-500 uppercase tracking-widest block flex items-center gap-1">
                              <Sparkles size={10} />
                              <span>प्राप्त AI प्रतिबिंब</span>
                            </span>
                            <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold leading-relaxed bg-rose-500/[0.02] p-3 rounded-xl border border-rose-500/10 italic">
                              "{entry.aiReflection}"
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
