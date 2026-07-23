import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RefreshCw, Heart, Sparkles, Smile, MessageSquare, History, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DHYAN_DURATION = 10 * 60; // 10 minutes

interface MoodLog {
  id: string;
  date: string;
  moodLabel: string;
  emoji: string;
  score: number;
  note: string;
}

const MEDITATION_MOODS = [
  { emoji: "🧘", label: "Deeply Peaceful", score: 5, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { emoji: "🧠", label: "Focused & Clear", score: 4, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { emoji: "😊", label: "Calm & Joyful", score: 3, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { emoji: "😐", label: "Restless / Neutral", score: 2, color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" },
  { emoji: "😔", label: "Wandering Mind", score: 1, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" }
];

export default function DhyanTimer() {
  const [timeLeft, setTimeLeft] = useState(DHYAN_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [selectedMood, setSelectedMood] = useState<typeof MEDITATION_MOODS[0] | null>(null);
  const [sessionNote, setSessionNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [isLoggedSuccessfully, setIsLoggedSuccessfully] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio & load mood history
  useEffect(() => {
    // Using a sample ambient sound
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
    audioRef.current.loop = true;

    // Load mood logs from localStorage
    const savedLogs = localStorage.getItem('meditation_mood_history');
    if (savedLogs) {
      try {
        setMoodHistory(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to parse meditation logs", e);
      }
    }

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Timer interval control
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      audioRef.current?.play().catch(console.error);
    } else {
      clearInterval(interval!);
      audioRef.current?.pause();

      // Trigger mood logger when countdown completes
      if (timeLeft === 0 && isActive) {
        setIsActive(false);
        setShowMoodLogger(true);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const progress = 1 - timeLeft / DHYAN_DURATION;

  // Complete session early or on time
  const handleCompleteSession = () => {
    setIsActive(false);
    setShowMoodLogger(true);
  };

  // Save the logged emotional state
  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    const newLog: MoodLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' }),
      moodLabel: selectedMood.label,
      emoji: selectedMood.emoji,
      score: selectedMood.score,
      note: sessionNote.trim() || 'No notes recorded'
    };

    const updatedHistory = [newLog, ...moodHistory].slice(0, 30); // keep up to 30 history entries
    setMoodHistory(updatedHistory);
    localStorage.setItem('meditation_mood_history', JSON.stringify(updatedHistory));

    // Reset logger states
    setIsLoggedSuccessfully(true);
    setTimeout(() => {
      setShowMoodLogger(false);
      setIsLoggedSuccessfully(false);
      setSelectedMood(null);
      setSessionNote('');
      setTimeLeft(DHYAN_DURATION); // reset timer
    }, 2000);

    // Notify other components of updates
    window.dispatchEvent(new Event('sadhana-updated'));
  };

  // Get the last 7 logs for charting
  const chartData = useMemo(() => {
    // We reverse to chronological order (oldest to newest) and take the last 7 days
    return [...moodHistory]
      .slice(0, 7)
      .reverse()
      .map(log => ({
        date: log.date,
        score: log.score,
        mood: log.moodLabel,
        emoji: log.emoji
      }));
  }, [moodHistory]);

  const CustomYTick = (props: any) => {
    const { x, y, payload } = props;
    const moodEmojis: Record<number, string> = {
      5: "🧘",
      4: "🧠",
      3: "😊",
      2: "😐",
      1: "😔"
    };
    return (
      <text x={x - 4} y={y + 4} textAnchor="end" className="text-xs select-none">
        {moodEmojis[payload.value] || ""}
      </text>
    );
  };

  return (
    <div className="flex flex-col w-full gap-5 p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 text-left" id="dhyan-timer-tracker">
      
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 text-orange-600 rounded-lg">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Dhyan & Mindfulness</h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Preksha Meditation Assistant</p>
          </div>
        </div>
        
        {moodHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 py-1 px-2.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-500 dark:text-zinc-400 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
          >
            <History size={10} />
            {showHistory ? "Hide Chart" : "Mood History"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* TIMER DIAL (Col Span) */}
        <div className={`flex flex-col items-center justify-center p-4 bg-zinc-50/50 dark:bg-zinc-850/20 rounded-2xl border border-black/[0.02] dark:border-white/[0.02] ${showMoodLogger ? "md:col-span-5" : "md:col-span-12"}`}>
          <div className="relative w-44 h-44">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
              <motion.circle
                cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="6" fill="transparent"
                strokeDasharray="502"
                strokeDashoffset={502 * (1 - progress)}
                className="text-orange-500"
                strokeLinecap="round"
                animate={{ strokeDashoffset: 502 * (1 - progress) }}
                transition={{ ease: "easeOut", duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-mono text-zinc-800 dark:text-zinc-100">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase mt-1">
                {isActive ? "Deep Breathing" : "Ready"}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex gap-3 mt-5">
            <button 
              onClick={() => setIsActive(!isActive)} 
              className="p-3 bg-orange-500 text-white hover:bg-orange-600 rounded-full shadow-md hover:shadow-orange-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
              title={isActive ? "Pause Session" : "Start Session"}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <button 
              onClick={() => { setIsActive(false); setTimeLeft(DHYAN_DURATION); }} 
              className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
              title="Reset Timer"
            >
              <RefreshCw size={18} />
            </button>

            {timeLeft < DHYAN_DURATION && !isActive && (
              <button 
                onClick={handleCompleteSession}
                className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
              >
                Log Session
              </button>
            )}
          </div>
        </div>

        {/* POST-MEDITATION MOOD LOGGER FORM (Animate Presence) */}
        <div className={`md:col-span-7 ${showMoodLogger ? "block" : "hidden md:hidden"}`}>
          <div className="p-5 bg-gradient-to-br from-orange-500/[0.02] to-amber-500/[0.04] dark:from-orange-500/5 dark:to-transparent rounded-2xl border border-orange-500/10 space-y-4">
            
            <div className="flex items-center gap-1.5 text-orange-600">
              <Smile size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider">How do you feel post-meditation?</h4>
            </div>

            {isLoggedSuccessfully ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 flex flex-col items-center justify-center text-center gap-2"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
                  <CheckCircle2 size={32} />
                </div>
                <h5 className="text-xs font-black uppercase tracking-wider text-emerald-600 mt-1">Sadhana Logged Successfully!</h5>
                <p className="text-[10px] text-zinc-400">Your state of mindfulness has been added to your journey history.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSaveMood} className="space-y-4">
                {/* Mood Select Buttons */}
                <div className="flex flex-wrap gap-2">
                  {MEDITATION_MOODS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-extrabold border transition-all active:scale-95 cursor-pointer ${
                        selectedMood?.label === m.label
                          ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10"
                          : `bg-white dark:bg-zinc-800 border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-300 hover:border-orange-500/20`
                      }`}
                    >
                      <span className="text-xs">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Optional Note */}
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <MessageSquare size={8} /> Add reflection note (Optional)
                  </label>
                  <input
                    type="text"
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    placeholder="E.g., peaceful focus, quieted a chaotic mind..."
                    className="w-full px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Save CTA */}
                <button
                  type="submit"
                  disabled={!selectedMood}
                  className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    selectedMood
                      ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer active:scale-95"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={12} /> Save Meditation Mood Log
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 7 DAYS MOOD HISTORY TREND CHART */}
      <AnimatePresence>
        {(showHistory && chartData.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/[0.04] dark:border-white/[0.04] pt-4"
          >
            <div className="bg-zinc-50/50 dark:bg-zinc-850/20 p-4 rounded-2xl border border-black/[0.01] dark:border-white/[0.01]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Last 7 Days Mood History
                </span>
                <span className="text-[8px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Scale: 5 (Peaceful) to 1 (Wandering)
                </span>
              </div>
              
              {chartData.length < 2 ? (
                <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-black/5 dark:border-white/10 rounded-xl gap-2">
                  <AlertCircle className="text-zinc-300 dark:text-zinc-600" size={24} />
                  <p className="text-[10px] text-zinc-400">Complete more sessions to display trend graph.</p>
                </div>
              ) : (
                <div className="h-44 w-full pr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="medMoodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false}
                        className="text-[9px] text-zinc-400 font-bold" 
                      />
                      <YAxis 
                        domain={[1, 5]} 
                        ticks={[1, 2, 3, 4, 5]}
                        tickLine={false} 
                        axisLine={false}
                        tick={<CustomYTick />}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-2.5 shadow-md text-[10px] font-bold">
                                <p className="text-zinc-400 dark:text-zinc-500 text-[8px] uppercase tracking-wider mb-1">{data.date}</p>
                                <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
                                  <span>{data.emoji}</span>
                                  <span>{data.mood}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#F97316" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#medMoodGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
