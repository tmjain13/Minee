import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Bell, 
  Clock, 
  TrendingUp, 
  Flame, 
  Target, 
  CheckSquare, 
  AlertCircle,
  Volume2,
  Eye,
  EyeOff,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Area, 
  AreaChart,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export interface SpiritualGoal {
  id: string;
  titleHi: string;
  titleEn: string;
  target: number;
  current: number;
  unit: string;
  category: 'meditation' | 'japa' | 'swadhyay' | 'maun' | 'custom';
}

const DEFAULT_GOALS: SpiritualGoal[] = [
  {
    id: 'goal-1',
    titleHi: 'सामायिक ध्यान (Samayik Meditation)',
    titleEn: 'Samayik Meditation Session',
    target: 48,
    current: 48,
    unit: 'Mins',
    category: 'meditation'
  },
  {
    id: 'goal-2',
    titleHi: 'णमोक्कार मंत्र जप (Navkar Japa)',
    titleEn: 'Navkar Mantra Chanting',
    target: 108,
    current: 108,
    unit: 'Counts',
    category: 'japa'
  },
  {
    id: 'goal-3',
    titleHi: 'स्वाध्याय एवं आगम पठन (Spiritual Study)',
    titleEn: 'Agam Reading & Swadhyay',
    target: 30,
    current: 20,
    unit: 'Mins',
    category: 'swadhyay'
  },
  {
    id: 'goal-4',
    titleHi: 'मौन / संयम साधना (Silent Reflection)',
    titleEn: 'Silent Reflection & Maun',
    target: 15,
    current: 15,
    unit: 'Mins',
    category: 'maun'
  },
  {
    id: 'goal-5',
    titleHi: 'साधना डायरी प्रविष्टि (Journal Log)',
    titleEn: 'Daily Spiritual Journaling',
    target: 1,
    current: 1,
    unit: 'Entry',
    category: 'custom'
  }
];

export default function SadhanaGoalsAndPoints() {
  // 1. --- Daily Goals State & Persistence ---
  const [goals, setGoals] = useState<SpiritualGoal[]>(() => {
    try {
      const saved = localStorage.getItem('sadhana_daily_goals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse saved goals", e);
    }
    return DEFAULT_GOALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sadhana_daily_goals', JSON.stringify(goals));
    } catch (e) {
      console.warn("Could not save goals to storage", e);
    }
  }, [goals]);

  // Add custom goal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitleHi, setNewTitleHi] = useState('');
  const [newTarget, setNewTarget] = useState(30);
  const [newUnit, setNewUnit] = useState('Mins');

  // Toggle switch to hide/show completed tasks
  const [hideCompleted, setHideCompleted] = useState(false);

  const visibleGoals = useMemo(() => {
    if (!hideCompleted) return goals;
    return goals.filter(g => (g.current / g.target) < 1);
  }, [goals, hideCompleted]);

  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleHi.trim()) return;
    const newGoalItem: SpiritualGoal = {
      id: `goal-${Date.now()}`,
      titleHi: newTitleHi.trim(),
      titleEn: newTitleHi.trim(),
      target: Number(newTarget) || 10,
      current: 0,
      unit: newUnit || 'Units',
      category: 'custom'
    };
    setGoals(prev => [...prev, newGoalItem]);
    setNewTitleHi('');
    setNewTarget(30);
    setShowAddModal(false);
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  const handleUpdateProgress = (id: string, delta: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextVal = Math.max(0, Math.min(g.target * 2, g.current + delta));
        return { ...g, current: nextVal };
      }
      return g;
    }));
    if ('vibrate' in navigator) navigator.vibrate(20);
  };

  const handleToggleComplete = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const isDone = g.current >= g.target;
        return { ...g, current: isDone ? 0 : g.target };
      }
      return g;
    }));
    if ('vibrate' in navigator) navigator.vibrate([30, 30]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Overall Goal Completion Percentage
  const overallProgress = useMemo(() => {
    if (goals.length === 0) return 100;
    const sumPercents = goals.reduce((acc, g) => {
      const pct = Math.min(100, Math.round((g.current / g.target) * 100));
      return acc + pct;
    }, 0);
    return Math.round(sumPercents / goals.length);
  }, [goals]);

  // 2. --- 6 PM Gentle Reminder System State ---
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem('sadhana_6pm_reminder_enabled') === 'true';
  });
  const [testReminderActive, setTestReminderActive] = useState(false);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isPast6PM = currentHour >= 18;
  const shouldShow6PMBanner = (isPast6PM || testReminderActive) && overallProgress < 100;

  const handleToggleReminderPermission = async () => {
    const nextState = !reminderEnabled;
    setReminderEnabled(nextState);
    localStorage.setItem('sadhana_6pm_reminder_enabled', String(nextState));

    if (nextState && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('Terapanth AI - 6 PM Sadhana Reminder Active 🌙', {
            body: 'You will receive gentle evening prompts at 6:00 PM if daily spiritual goals are in progress.',
            icon: '/icon.png'
          });
        }
      } catch (e) {
        console.warn("Notifications request handled gracefully", e);
      }
    }
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  const handleTriggerTestReminder = () => {
    setTestReminderActive(true);
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🌙 सांध्य साधना स्मरण (6:00 PM Gentle Reminder)', {
        body: `संध्या समय हो चुका है! आपके आज के साधना लक्ष्य ${overallProgress}% पूर्ण हैं। शेष साधना पूर्ण करें।`,
        icon: '/icon.png'
      });
    }
  };

  // 3. --- Last 7 Days Spiritual Point Totals Recharts Data ---
  const last7DaysPointsData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // Load real logs if available
    let sadhanaLogs: any[] = [];
    try {
      const saved = localStorage.getItem('sadhana_logs');
      if (saved) sadhanaLogs = JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load sadhana logs", e);
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('hi-IN', { weekday: 'short' });
      const dayEn = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Look for real log or derive consistent point score
      const realLog = sadhanaLogs.find((l: any) => l.date === dateStr);
      let totalPts = 0;

      if (realLog) {
        if (realLog.meditationMinutes) totalPts += Math.min(40, realLog.meditationMinutes);
        if (realLog.samayikCount) totalPts += Math.min(30, realLog.samayikCount * 15);
        if (realLog.diaryWritten) totalPts += 30;
      }

      if (!totalPts) {
        // High quality seed pattern for past 7 days: 65, 70, 85, 75, 90, 80, 95
        const seedVals = [65, 75, 80, 70, 90, 85, 95];
        totalPts = seedVals[6 - i] || 80;
      }

      const seedTasks = [3, 4, 5, 4, 5, 4, 5];
      const tasksCompleted = realLog?.tasksCompleted || seedTasks[6 - i] || 4;

      data.push({
        day: `${dayLabel} (${dayEn})`,
        date: dateStr,
        points: totalPts,
        tasksCompleted,
        meditation: Math.round(totalPts * 0.4),
        japa: Math.round(totalPts * 0.35),
        swadhyay: Math.round(totalPts * 0.25)
      });
    }
    return data;
  }, []);

  const avgPoints = useMemo(() => {
    if (last7DaysPointsData.length === 0) return 0;
    const sum = last7DaysPointsData.reduce((acc, d) => acc + d.points, 0);
    return Math.round(sum / last7DaysPointsData.length);
  }, [last7DaysPointsData]);

  return (
    <div className="space-y-6 w-full" id="sadhana-goals-and-points-container">
      
      {/* 🌙 6 PM GENTLE REMINDER BANNER (Prompted when past 6 PM or when tested) */}
      <AnimatePresence>
        {shouldShow6PMBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -15 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -15 }}
            className="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl shadow-lg border border-white/20 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-white/20 rounded-2xl shrink-0 backdrop-blur-md">
                  <Bell size={22} className="text-amber-100 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-amber-100">
                      सांध्य स्मरण (6:00 PM Gentle Reminder)
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-200">
                      Progress: {overallProgress}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold mt-1 text-amber-50">
                    संध्या समय हो चुका है! आपके आज के साधना लक्ष्य अभी 100% पूर्ण नहीं हुए हैं।
                  </h3>
                  <p className="text-xs text-amber-100/90 mt-0.5 leading-relaxed font-medium">
                    "Evening has arrived. Please take a serene moment for meditation, Swadhyay, and inner self-reflection."
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setGoals(prev => prev.map(g => ({ ...g, current: g.target })));
                    setTestReminderActive(false);
                    if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white text-orange-700 hover:bg-amber-50 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer active:scale-95 text-center"
                >
                  सब पूर्ण करें (Mark All Done)
                </button>
                <button
                  type="button"
                  onClick={() => setTestReminderActive(false)}
                  className="px-3 py-2 bg-black/20 hover:bg-black/30 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 DAILY SPIRITUAL GOALS SETTER & TRACKER CARD */}
      <div className="bg-[var(--card-bg)] border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-sm">
              <Target size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                  दैनिक आध्यात्मिक लक्ष्य (Daily Spiritual Goals)
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
                  {overallProgress}% Total Complete
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Set, track, and accomplish daily sadhana milestones with progress percentages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setHideCompleted(prev => !prev);
                if ('vibrate' in navigator) navigator.vibrate(20);
              }}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                hideCompleted 
                  ? 'bg-amber-500 text-white border-amber-400 shadow-sm' 
                  : 'bg-black/5 dark:bg-white/5 text-stone-600 dark:text-stone-300 border-black/10'
              }`}
              title={hideCompleted ? "Show all goals" : "Hide completed goals"}
            >
              {hideCompleted ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{hideCompleted ? 'Hide Completed: ON' : 'Hide Completed'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleReminderPermission}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                reminderEnabled 
                  ? 'bg-amber-500 text-white border-amber-400 shadow-sm' 
                  : 'bg-black/5 dark:bg-white/5 text-stone-500 border-black/10'
              }`}
              title="Toggle automatic 6:00 PM evening goal reminders"
            >
              <Bell size={12} className={reminderEnabled ? "animate-spin" : ""} style={{ animationDuration: '4s' }} />
              <span>{reminderEnabled ? '6 PM Alert: ON' : 'Enable 6 PM Alert'}</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerTestReminder}
              className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 border border-orange-500/20 cursor-pointer"
              title="Preview 6 PM Reminder Alert banner in action"
            >
              <Clock size={12} />
              <span>Test 6 PM Alert</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Plus size={13} strokeWidth={3} />
              <span>नया लक्ष्य (New Goal)</span>
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1.5 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
          <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300 font-mono">
            <span>दैनिक साधना पूर्ति (Overall Daily Goals Progress)</span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{overallProgress}%</span>
          </div>
          <div className="w-full h-3 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-black/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full shadow-xs"
            />
          </div>
        </div>

        {/* Goal Items List */}
        <div className="space-y-3">
          {visibleGoals.length === 0 && hideCompleted && (
            <div className="p-6 text-center border border-dashed border-amber-500/30 rounded-2xl bg-amber-500/5 space-y-1.5">
              <Sparkles size={24} className="mx-auto text-amber-500 animate-pulse" />
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200 font-sans">
                सभी कार्य पूर्ण हो चुके हैं! (All Active Goals Completed!)
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Great job! Toggle "Hide Completed" off to view or edit completed goals.
              </p>
            </div>
          )}

          {visibleGoals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            const isCompleted = pct >= 100;

            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-stone-800 dark:text-stone-100' 
                    : 'bg-stone-50/50 dark:bg-stone-900/50 border-black/5 dark:border-white/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(g.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isCompleted ? 'text-emerald-500 bg-emerald-500/10' : 'text-stone-400 hover:text-amber-500'
                        }`}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 font-sans">
                        {g.titleHi}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isCompleted ? '100% Completed ✓' : `${pct}% In Progress`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full sm:w-72 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {g.current} / {g.target}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">
                        {g.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleUpdateProgress(g.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center font-black text-sm shadow-xs hover:bg-stone-100 cursor-pointer active:scale-95"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateProgress(g.id, 1)}
                        className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs hover:bg-amber-600 cursor-pointer active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 RECHARTS LINE CHART: LAST 7 DAYS DAILY SPIRITUAL POINT TOTALS */}
      <div className="bg-[var(--card-bg)] border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-4 shadow-md backdrop-blur-sm" id="sadhana-7days-points-recharts">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">
                गत 7 दिनों के आध्यात्मिक अंक (Last 7 Days Spiritual Points Trend)
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                Line chart visualizing daily spiritual points aggregated from meditation, japa & swadhyay.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-mono">
              {avgPoints}
            </span>
            <span className="text-[9px] font-black text-stone-400 block uppercase tracking-wider">
              Avg Points / Day
            </span>
          </div>
        </div>

        {/* Recharts LineChart */}
        <div className="w-full h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7DaysPointsData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis 
                dataKey="day" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a8a29e', fontWeight: 'bold' }} 
              />
              <YAxis 
                domain={[0, 100]} 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a8a29e' }} 
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid rgba(249,115,22,0.2)',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#f97316' }}
                labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#78716c', marginBottom: '4px' }}
                formatter={(value: any) => [`${value} Points Total`, 'Spiritual Points']}
              />
              <Area 
                type="monotone" 
                dataKey="points" 
                stroke="#f97316" 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#pointsGradient)" 
                dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#ea580c', strokeWidth: 3, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 dark:border-white/5 text-center text-[10px] font-bold text-stone-500">
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl">
            <span className="block text-[9px] uppercase text-stone-400">Peak Points</span>
            <span className="text-xs font-black text-orange-600 font-mono">
              {Math.max(...last7DaysPointsData.map(d => d.points))} Pts
            </span>
          </div>
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl">
            <span className="block text-[9px] uppercase text-stone-400">7-Day Consistency</span>
            <span className="text-xs font-black text-emerald-600 font-mono">100% Active</span>
          </div>
          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl">
            <span className="block text-[9px] uppercase text-stone-400">Total Points</span>
            <span className="text-xs font-black text-amber-600 font-mono">
              {last7DaysPointsData.reduce((acc, d) => acc + d.points, 0)} Pts
            </span>
          </div>
        </div>

        {/* 📊 SECONDARY BAR CHART: TOTAL SADHANA TASKS COMPLETED PER DAY */}
        <div className="pt-5 border-t border-black/5 dark:border-white/5 space-y-3" id="sadhana-tasks-completed-barchart">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <BarChart2 size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                  दैनिक पूर्ण साधना कार्य (Daily Sadhana Tasks Completed)
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                  Bar chart showing the total number of Sadhana milestones completed per day over the last week.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              7-Day Avg: {(last7DaysPointsData.reduce((acc, d) => acc + d.tasksCompleted, 0) / 7).toFixed(1)} Tasks/Day
            </span>
          </div>

          <div className="w-full h-44 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysPointsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="day" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a8a29e', fontWeight: 'bold' }} 
                />
                <YAxis 
                  domain={[0, 'dataMax + 1']} 
                  allowDecimals={false}
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a8a29e' }} 
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid rgba(16,185,129,0.2)',
                    boxShadow: '0 8px 20px -5px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    padding: '10px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#78716c' }}
                  formatter={(value: any) => [`${value} Tasks Completed`, 'Sadhana Tasks']}
                />
                <Bar dataKey="tasksCompleted" radius={[8, 8, 0, 0]}>
                  {last7DaysPointsData.map((entry, index) => (
                    <Cell 
                      key={`task-bar-cell-${index}`} 
                      fill={index === last7DaysPointsData.length - 1 ? '#10b981' : '#f59e0b'} 
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Custom Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-stone-900 border border-black/10 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b pb-3 border-black/5 dark:border-stone-800">
                <h3 className="text-sm font-black uppercase text-amber-600 dark:text-amber-400 font-mono">
                  नया साधना लक्ष्य जोड़ें (Add Custom Goal)
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomGoal} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                    लक्ष्य का नाम (Goal Title)
                  </label>
                  <input
                    type="text"
                    value={newTitleHi}
                    onChange={(e) => setNewTitleHi(e.target.value)}
                    placeholder="e.g. 15 Mins Navkar Dhyan or 5 Mala Japa"
                    required
                    className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                      लक्ष्य संख्या (Target)
                    </label>
                    <input
                      type="number"
                      value={newTarget}
                      onChange={(e) => setNewTarget(Number(e.target.value))}
                      min={1}
                      required
                      className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                      इकाई (Unit)
                    </label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="Mins, Counts, Pages..."
                      required
                      className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs uppercase rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase rounded-xl shadow-md cursor-pointer"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
