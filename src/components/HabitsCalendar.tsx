import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Award, Calendar, BookOpen, Clock, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HabitState {
  meditation: boolean;
  reading: boolean;
  journal: boolean;
}

interface HabitsData {
  [dateKey: string]: HabitState;
}

export default function HabitsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [habitsData, setHabitsData] = useState<HabitsData>({});

  // Initialize habits data with realistic history on first run
  useEffect(() => {
    const stored = localStorage.getItem('terapanth_daily_habits');
    if (stored) {
      try {
        setHabitsData(JSON.parse(stored));
        return;
      } catch (e) {
        console.error('Failed to parse daily habits:', e);
      }
    }

    // Prepopulate with mock history of consistency for the past 25 days if empty
    const initialData: HabitsData = {};
    const today = new Date();
    for (let i = 1; i <= 25; i++) {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - i);
      const dateStr = pastDate.toISOString().split('T')[0];
      
      // Random but cohesive consistency (mostly active to look nice)
      initialData[dateStr] = {
        meditation: Math.random() > 0.3,
        reading: Math.random() > 0.4,
        journal: Math.random() > 0.5,
      };
    }
    
    // Add today as unchecked
    const todayStr = today.toISOString().split('T')[0];
    initialData[todayStr] = {
      meditation: false,
      reading: false,
      journal: false
    };

    localStorage.setItem('terapanth_daily_habits', JSON.stringify(initialData));
    setHabitsData(initialData);
  }, []);

  const saveHabits = (updated: HabitsData) => {
    localStorage.setItem('terapanth_daily_habits', JSON.stringify(updated));
    setHabitsData(updated);
  };

  const handleToggleHabit = (habitKey: keyof HabitState) => {
    const existing = habitsData[selectedDate] || { meditation: false, reading: false, journal: false };
    const updated = {
      ...habitsData,
      [selectedDate]: {
        ...existing,
        [habitKey]: !existing[habitKey]
      }
    };
    saveHabits(updated);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const daysArray = useMemo(() => {
    const days = [];
    // Pad previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Present month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      // Format as local YYYY-MM-DD
      const yyyy = dayDate.getFullYear();
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      days.push({
        day: i,
        dateKey: `${yyyy}-${mm}-${dd}`
      });
    }
    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalMeditation = 0;
    let totalReading = 0;
    let totalJournal = 0;
    let currentStreak = 0;

    Object.keys(habitsData).forEach(key => {
      const h = habitsData[key];
      if (h.meditation) totalMeditation++;
      if (h.reading) totalReading++;
      if (h.journal) totalJournal++;
    });

    // Simple streak calculator (consecutive days of any spiritual activity)
    const sortedDates = Object.keys(habitsData)
      .filter(key => {
        const h = habitsData[key];
        return h.meditation || h.reading || h.journal;
      })
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length > 0) {
      let tempStreak = 0;
      let checkDate = new Date();
      // Check if they did anything today or yesterday
      const todayStr = checkDate.toISOString().split('T')[0];
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];

      const hasActivityRecently = sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr);
      
      if (hasActivityRecently) {
        let currentDayCheck = new Date();
        // Adjust starting check point
        if (!sortedDates.includes(currentDayCheck.toISOString().split('T')[0])) {
          currentDayCheck.setDate(currentDayCheck.getDate() - 1);
        }
        
        while (true) {
          const dateKey = currentDayCheck.toISOString().split('T')[0];
          if (sortedDates.includes(dateKey)) {
            tempStreak++;
            currentDayCheck.setDate(currentDayCheck.getDate() - 1);
          } else {
            break;
          }
        }
        currentStreak = tempStreak;
      }
    }

    return { totalMeditation, totalReading, totalJournal, currentStreak };
  }, [habitsData]);

  const selectedHabitState = habitsData[selectedDate] || { meditation: false, reading: false, journal: false };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-sm p-6 space-y-6 text-left">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.04] dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Spiritual Habits Consistency</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Visualize your daily Sadhana consistency</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold w-fit">
          <Award size={14} className="shrink-0 animate-bounce" />
          <span>{stats.currentStreak} Day Streak</span>
        </div>
      </div>

      {/* Mini Dashboard Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-500/[0.03] dark:bg-orange-500/[0.06] border border-orange-500/10 rounded-xl p-3 text-center">
          <span className="block text-[8px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Meditation</span>
          <span className="text-xl font-mono font-black text-orange-500">{stats.totalMeditation}</span>
          <span className="text-[8px] block text-zinc-400 mt-0.5 font-bold">Days total</span>
        </div>
        <div className="bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] border border-emerald-500/10 rounded-xl p-3 text-center">
          <span className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Swadhyay</span>
          <span className="text-xl font-mono font-black text-emerald-500">{stats.totalReading}</span>
          <span className="text-[8px] block text-zinc-400 mt-0.5 font-bold">Days total</span>
        </div>
        <div className="bg-blue-500/[0.03] dark:bg-blue-500/[0.06] border border-blue-500/10 rounded-xl p-3 text-center">
          <span className="block text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Journal</span>
          <span className="text-xl font-mono font-black text-blue-500">{stats.totalJournal}</span>
          <span className="text-[8px] block text-zinc-400 mt-0.5 font-bold">Days total</span>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest font-mono">
          {monthNames[month]} {year}
        </span>
        <div className="flex gap-1.5">
          <button 
            onClick={prevMonth}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-zinc-500 active:scale-90 transition-all border border-black/5 dark:border-white/5"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-zinc-500 active:scale-90 transition-all border border-black/5 dark:border-white/5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekdays names */}
      <div className="grid grid-cols-7 text-center text-[9px] font-black uppercase text-zinc-400 tracking-wider font-mono">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Days Matrix */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((dayObj, idx) => {
          if (!dayObj) return <div key={`empty-${idx}`} className="aspect-square" />;

          const { day, dateKey } = dayObj;
          const habits = habitsData[dateKey] || { meditation: false, reading: false, journal: false };
          const isSelected = selectedDate === dateKey;
          const isToday = new Date().toISOString().split('T')[0] === dateKey;

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={`aspect-square rounded-xl relative flex flex-col items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 scale-105 shadow-md shadow-black/10' 
                  : isToday
                    ? 'border-2 border-orange-500/80 font-black text-orange-600 dark:text-orange-400'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span className="text-[11px] font-bold font-mono">{day}</span>
              
              {/* Colored Dots Container */}
              <div className="absolute bottom-1 flex gap-0.5 justify-center">
                {habits.meditation && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-orange-400' : 'bg-orange-500'}`} />
                )}
                {habits.reading && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                )}
                {habits.journal && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-500'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Habit Selector for Selected Day */}
      <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/5">
          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Habits for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-[9px] font-bold text-zinc-400">Tap to Toggle</span>
        </div>

        <div className="space-y-2.5">
          {/* Meditation Habit */}
          <button
            onClick={() => handleToggleHabit('meditation')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
              selectedHabitState.meditation
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300 font-semibold'
                : 'bg-white dark:bg-zinc-800/40 border-black/5 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.02]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${selectedHabitState.meditation ? 'bg-orange-500/20 text-orange-500' : 'bg-black/5 dark:bg-white/5 text-zinc-400'}`}>
                <Clock size={14} />
              </div>
              <span className="text-xs">Meditation (Dhyana)</span>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${selectedHabitState.meditation ? 'bg-orange-500 border-transparent text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
              {selectedHabitState.meditation && <CheckCircle2 size={14} />}
            </div>
          </button>

          {/* Reading Habit */}
          <button
            onClick={() => handleToggleHabit('reading')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
              selectedHabitState.reading
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'bg-white dark:bg-zinc-800/40 border-black/5 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.02]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${selectedHabitState.reading ? 'bg-emerald-500/20 text-emerald-500' : 'bg-black/5 dark:bg-white/5 text-zinc-400'}`}>
                <BookOpen size={14} />
              </div>
              <span className="text-xs">Swadhyay (Reading scriptures)</span>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${selectedHabitState.reading ? 'bg-emerald-50 border-transparent text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
              {selectedHabitState.reading && <CheckCircle2 size={14} />}
            </div>
          </button>

          {/* Journal Habit */}
          <button
            onClick={() => handleToggleHabit('journal')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
              selectedHabitState.journal
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold'
                : 'bg-white dark:bg-zinc-800/40 border-black/5 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.02]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${selectedHabitState.journal ? 'bg-blue-500/20 text-blue-500' : 'bg-black/5 dark:bg-white/5 text-zinc-400'}`}>
                <PenTool size={14} />
              </div>
              <span className="text-xs">Reflections (Spiritual Diary)</span>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${selectedHabitState.journal ? 'bg-blue-500 border-transparent text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
              {selectedHabitState.journal && <CheckCircle2 size={14} />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
