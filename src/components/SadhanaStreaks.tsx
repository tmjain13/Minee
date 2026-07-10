import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, ShieldAlert, Sparkles, BookOpen, Clock, Sunset, Award, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SadhanaTask {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  points: number;
  color: string; // Tailwind class
  strokeColor: string; // Hex color for SVG
  icon: React.ReactNode;
}

export default function SadhanaStreaks() {
  const [tasks, setTasks] = useState<{ [key: string]: boolean }>({
    navkar: false,
    samayik: false,
    swadhyay: false,
    chauvihar: false,
  });

  const [streak, setStreak] = useState<number>(5); // default mock, synced with local storage
  const [points, setPoints] = useState<number>(120);

  // Sync state with LocalStorage on mount and custom events
  useEffect(() => {
    const loadState = () => {
      try {
        const savedTasks = localStorage.getItem('terapanth_sadhana_daily_tasks');
        const savedStreak = localStorage.getItem('terapanth_sadhana_streak_count');
        const savedPoints = localStorage.getItem('terapanth_sadhana_points');
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedStreak) setStreak(Number(savedStreak));
        if (savedPoints) setPoints(Number(savedPoints));
      } catch (e) {
        console.error("Local storage read error in SadhanaStreaks:", e);
      }
    };

    loadState();
    window.addEventListener('sadhana-updated', loadState);
    return () => {
      window.removeEventListener('sadhana-updated', loadState);
    };
  }, []);

  // Save changes to localStorage helper
  const saveStateToStorage = (updatedTasks: { [key: string]: boolean }, updatedPoints: number, updatedStreak: number) => {
    try {
      localStorage.setItem('terapanth_sadhana_daily_tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('terapanth_sadhana_points', String(updatedPoints));
      localStorage.setItem('terapanth_sadhana_streak_count', String(updatedStreak));
    } catch (e) {
      console.error("Local storage save failed:", e);
    }
  };

  const taskDefinitions: SadhanaTask[] = useMemo(() => [
    {
      id: 'navkar',
      name: 'Navkar Mantra',
      hindiName: 'नवकार महामंत्र',
      description: 'सुबह उठते ही ३ या ९ बार नवकार जप',
      points: 20,
      color: 'text-amber-500',
      strokeColor: '#f59e0b',
      icon: <Sparkles size={14} />
    },
    {
      id: 'samayik',
      name: 'Samayik Sadhana',
      hindiName: 'सामायिक साधना',
      description: '४८ मिनट आत्म-निरीक्षण व समता योग',
      points: 50,
      color: 'text-teal-400',
      strokeColor: '#2dd4bf',
      icon: <Clock size={14} />
    },
    {
      id: 'swadhyay',
      name: 'Swadhyay (Study)',
      hindiName: 'स्वाध्याय अनुशीलन',
      description: 'आगम या जैन तत्त्वज्ञान ग्रंथों का पठन',
      points: 30,
      color: 'text-indigo-400',
      strokeColor: '#818cf8',
      icon: <BookOpen size={14} />
    },
    {
      id: 'chauvihar',
      name: 'Chauvihar Rule',
      hindiName: 'चौविहार नियम',
      description: 'सूर्यास्त के ४८ मिनट पहले भोजन-पानी त्याग',
      points: 40,
      color: 'text-orange-500',
      strokeColor: '#f97316',
      icon: <Sunset size={14} />
    }
  ], []);

  // Calculate stats
  const totalCompleted = useMemo(() => {
    return Object.values(tasks).filter(Boolean).length;
  }, [tasks]);

  const progressPercentage = useMemo(() => {
    return Math.round((totalCompleted / taskDefinitions.length) * 100);
  }, [totalCompleted, taskDefinitions.length]);

  // Handle checking off a task
  const toggleTask = (id: string) => {
    const isNowCompleted = !tasks[id];
    const updatedTasks = { ...tasks, [id]: isNowCompleted };
    
    // Add vibration haptic feedback on task toggle
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(isNowCompleted ? [40, 20, 40] : 25);
    }
    
    // Calculate points offset
    const taskDef = taskDefinitions.find(t => t.id === id);
    const pointDelta = taskDef ? taskDef.points : 0;
    const updatedPoints = isNowCompleted ? points + pointDelta : Math.max(0, points - pointDelta);

    // If checking all tasks, trigger streak increment!
    let updatedStreak = streak;
    const isAllCompletedNow = Object.values(updatedTasks).every(Boolean);
    if (isAllCompletedNow) {
      updatedStreak += 1;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
      // Dispatch custom event indicating all daily sadhana completed with the updated streak count
      window.dispatchEvent(new CustomEvent('sadhana-streak-completed', { detail: { streak: updatedStreak } }));
    } else if (totalCompleted === taskDefinitions.length && !isNowCompleted) {
      // fell below complete list
      updatedStreak = Math.max(0, streak - 1);
    }

    setTasks(updatedTasks);
    setPoints(updatedPoints);
    setStreak(updatedStreak);
    saveStateToStorage(updatedTasks, updatedPoints, updatedStreak);
    // Notify all components that a sadhana task change occurred
    window.dispatchEvent(new Event('sadhana-updated'));
  };

  // Reset daily state
  const handleDailyReset = () => {
    const emptyTasks = { navkar: false, samayik: false, swadhyay: false, chauvihar: false };
    setTasks(emptyTasks);
    saveStateToStorage(emptyTasks, points, streak);
  };

  // Ring coordinates calculations
  const strokeWidth = 8;
  const radii = [48, 38, 28, 18]; // Nested Apple-style rings

  return (
    <div className="w-full bg-[#1c1917] text-white rounded-2xl p-4 flex flex-col gap-4 shadow-sm border border-white/10 relative overflow-hidden text-left" id="sadhana-streaks-widget">
      {/* Mini background glows */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Title block with Flame Streak Badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center">
            <Award size={18} />
          </div>
          <div>
            <h3 className="m-0 text-sm font-black text-rose-400 tracking-tight">दैनिक साधना प्रगति चक्र</h3>
            <span className="text-[10px] text-gray-400 block font-bold mt-0.5">साधना व व्रत नियम अनुशीलन</span>
          </div>
        </div>

        {/* Hot Streak Counter Badge */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-rose-600 px-3.5 py-1.5 rounded-full shadow-lg shadow-rose-500/10 border border-white/10"
        >
          <Flame size={14} className="fill-orange-400 text-orange-200" />
          <span className="text-xs font-black tracking-tight font-sans">🔥 {streak} DAY STREAK</span>
        </motion.div>
      </div>

      {/* Main layout grid: Rings Visual on Left, Details checklist on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-4">
        {/* Apple-style Nested Rings Visualizer */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {taskDefinitions.map((task, index) => {
                const r = radii[index];
                const circ = 2 * Math.PI * r;
                const isCompleted = tasks[task.id];
                const strokeDashoffset = circ - (isCompleted ? circ : 0);

                return (
                  <g key={task.id}>
                    {/* Ring background track */}
                    <circle
                      cx="80"
                      cy="80"
                      r={r}
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {/* Ring active path */}
                    <motion.circle
                      cx="80"
                      cy="80"
                      r={r}
                      stroke={task.strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={circ}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Inner text metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono tracking-tight">{progressPercentage}%</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold">साधना पूर्ण</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-3.5">
            {taskDefinitions.map((task) => (
              <div key={task.id} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: task.strokeColor }} />
                <span className="text-[9px] text-gray-400 font-bold">{task.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Custom Checklist */}
        <div className="md:col-span-7 flex flex-col gap-2.5">
          {taskDefinitions.map((task) => {
            const isCompleted = tasks[task.id];
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                  isCompleted 
                    ? 'bg-white/[0.04] border-white/10 text-white' 
                    : 'bg-black/20 border-white/5 text-gray-300 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'
                  }`}>
                    {task.icon}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black block">{task.hindiName}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block font-medium leading-normal">{task.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-gray-400">+{task.points} pts</span>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-400 text-zinc-950 scale-110' 
                      : 'border-white/20 hover:border-white/40'
                  }`}>
                    {isCompleted && <Check size={11} strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer controls & score tracking */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-2 bg-white/[0.01] px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🌟</span>
          <span className="text-xs font-extrabold text-gray-300">अर्जित साधना अंक:</span>
          <span className="text-xs font-black font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">{points} PTS</span>
        </div>
        
        <button 
          onClick={handleDailyReset}
          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition cursor-pointer border-none flex items-center gap-1 text-[10px] font-bold"
          title="आज की सूची साफ़ करें"
        >
          <RefreshCw size={10} />
          <span>सूची साफ़ करें</span>
        </button>
      </div>
    </div>
  );
}
