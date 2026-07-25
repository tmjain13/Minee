import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Save, Sparkles, Volume2, VolumeX, CheckCircle2, Award, ChevronRight, Flame } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const MANTRAS = [
  { id: 'navkar', name: 'णमोकार मंत्र (Navkar Mantra)', defaultGoal: 108 },
  { id: 'logassa', name: 'लोगस्स सूत्र (Logassa Sutra)', defaultGoal: 27 },
  { id: 'omarham', name: 'ॐ अर्हं (Om Arham)', defaultGoal: 108 },
  { id: 'bhaktamar', name: 'भक्तामर श्लोक (Bhaktamar Stotra)', defaultGoal: 48 },
  { id: 'custom', name: 'अन्य जाप (Custom Mantra)', defaultGoal: 108 }
];

const MALA_PRESETS = [
  { label: '1 माला (108)', count: 108 },
  { label: '3 माला (324)', count: 324 },
  { label: '5 माला (540)', count: 540 },
  { label: '9 माला (972)', count: 972 }
];

export default function BeadCounter() {
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem('sadhana_japa_current_count');
    return saved ? Number(saved) : 0;
  });

  const [selectedMantra, setSelectedMantra] = useState<string>(() => {
    return localStorage.getItem('sadhana_japa_selected_mantra') || 'navkar';
  });

  const [goal, setGoal] = useState<number>(() => {
    const saved = localStorage.getItem('sadhana_japa_goal');
    return saved ? Number(saved) : 108;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [todaySavedTotal, setTodaySavedTotal] = useState<number>(0);

  // Save current count & settings to localStorage
  useEffect(() => {
    localStorage.setItem('sadhana_japa_current_count', String(count));
  }, [count]);

  useEffect(() => {
    localStorage.setItem('sadhana_japa_selected_mantra', selectedMantra);
  }, [selectedMantra]);

  useEffect(() => {
    localStorage.setItem('sadhana_japa_goal', String(goal));
  }, [goal]);

  // Sync today's saved Japa from Firestore if available
  useEffect(() => {
    const user = auth.currentUser;
    const todayStr = new Date().toISOString().split('T')[0];

    if (user && db) {
      try {
        const q = query(
          collection(db, 'sadhana_japa'),
          where('userId', '==', user.uid),
          where('date', '==', todayStr)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          let total = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            total += data.count || 0;
          });
          setTodaySavedTotal(total);
        }, (err) => {
          console.warn("Firestore Japa sync fallback:", err);
          const localSaved = localStorage.getItem(`sadhana_japa_saved_${todayStr}`);
          setTodaySavedTotal(localSaved ? Number(localSaved) : 0);
        });

        return () => unsubscribe();
      } catch {
        const localSaved = localStorage.getItem(`sadhana_japa_saved_${todayStr}`);
        setTodaySavedTotal(localSaved ? Number(localSaved) : 0);
      }
    } else {
      const localSaved = localStorage.getItem(`sadhana_japa_saved_${todayStr}`);
      setTodaySavedTotal(localSaved ? Number(localSaved) : 0);
    }
  }, []);

  // Synthesize soft click audio chime on count
  const playClickAudio = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
      setTimeout(() => audioCtx.close(), 100);
    } catch {
      // Ignore audio synthesis errors
    }
  };

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    setIsAnimating(true);
    playClickAudio();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {
        // Fallback
      }
    }

    setTimeout(() => setIsAnimating(false), 180);
  };

  const handleReset = () => {
    if (count === 0) return;
    if (window.confirm("क्या आप जाप काउंटर रीसेट करना चाहते हैं? (Reset counter?)")) {
      setCount(0);
    }
  };

  const handleSaveDailyJapa = async () => {
    if (count === 0) return;
    setIsSaving(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const user = auth.currentUser;
    const mantraObj = MANTRAS.find(m => m.id === selectedMantra);

    const recordData = {
      userId: user ? user.uid : 'guest',
      mantraId: selectedMantra,
      mantraName: mantraObj?.name || selectedMantra,
      count: count,
      goal: goal,
      date: todayStr,
      timestamp: new Date().toISOString()
    };

    // Save locally
    const currentLocalTotal = Number(localStorage.getItem(`sadhana_japa_saved_${todayStr}`) || 0);
    const newLocalTotal = currentLocalTotal + count;
    localStorage.setItem(`sadhana_japa_saved_${todayStr}`, String(newLocalTotal));
    setTodaySavedTotal(newLocalTotal);

    // Save to Firestore if online
    if (user && db) {
      try {
        await addDoc(collection(db, 'sadhana_japa'), {
          ...recordData,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Save Japa Firestore error, persisted locally:", err);
      }
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setCount(0);

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const malasCompleted = Math.floor(count / 108);
  const beadsInCurrentMala = count % 108;
  const progressPercent = Math.min(100, Math.round((count / goal) * 100));
  const activeMantraObj = MANTRAS.find(m => m.id === selectedMantra) || MANTRAS[0];

  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-md transition-all space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg shadow-xs">
            📿
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 font-mono flex items-center gap-1">
              <Sparkles size={11} />
              डिजिटल जाप माला (Digital Japa Counter)
            </span>
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {activeMantraObj.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400'
                : 'bg-stone-100 border-stone-200 text-stone-400 dark:bg-stone-800 dark:border-stone-700'
            }`}
            title={soundEnabled ? "Mute Click Sound" : "Enable Click Sound"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Reset Counter */}
          <button
            onClick={handleReset}
            disabled={count === 0}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-all disabled:opacity-40 cursor-pointer"
            title="Reset Counter"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Mantra & Goal Selector Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Mantra Pick */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-mono">
            मंत्र का चयन (Select Mantra)
          </label>
          <select
            value={selectedMantra}
            onChange={(e) => {
              const mId = e.target.value;
              setSelectedMantra(mId);
              const mObj = MANTRAS.find(m => m.id === mId);
              if (mObj) setGoal(mObj.defaultGoal);
            }}
            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {MANTRAS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Goal Preset */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-mono">
            लक्ष्य संख्या (Goal Target)
          </label>
          <div className="flex gap-1.5">
            {MALA_PRESETS.map(preset => (
              <button
                key={preset.count}
                onClick={() => setGoal(preset.count)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer font-mono ${
                  goal === preset.count
                    ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-orange-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar & Mala Tracker */}
      <div className="bg-stone-50 dark:bg-stone-950/50 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <Award size={14} className="text-amber-500" />
            <span>लक्ष्य प्रगति: {count} / {goal} मनके</span>
          </div>
          <span className="font-mono text-orange-600 dark:text-orange-400">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.2 }}
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 rounded-full shadow-inner"
          />
        </div>

        {/* Stats Chips */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400 pt-1">
          <span>पूर्ण मालाएँ: <strong className="text-orange-600 dark:text-orange-400 font-mono">{malasCompleted}</strong> (108 x {malasCompleted})</span>
          <span>चालू माला मनके: <strong className="text-stone-800 dark:text-stone-200 font-mono">{beadsInCurrentMala} / 108</strong></span>
        </div>
      </div>

      {/* Main Touch Counter Button */}
      <div className="flex flex-col items-center justify-center py-2 space-y-4">
        <motion.button
          animate={{ scale: isAnimating ? 1.08 : 1 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleIncrement}
          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 text-white font-extrabold shadow-xl shadow-orange-500/25 flex flex-col items-center justify-center cursor-pointer border-4 border-white dark:border-stone-800 transition-all hover:brightness-105 active:shadow-inner select-none"
        >
          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums drop-shadow-md">
            {count}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-90 font-mono">
            स्पर्श करें (TAP BEAD)
          </span>

          {/* Pulse Ripple Effect */}
          {isAnimating && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
            />
          )}
        </motion.button>

        {/* Save Daily Japa Action */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400">
            <Flame size={14} className="text-orange-500" />
            <span>आज का कुल सहेजा गया जाप: <strong className="text-stone-900 dark:text-stone-100 font-mono">{todaySavedTotal + count}</strong></span>
          </div>

          <button
            onClick={handleSaveDailyJapa}
            disabled={count === 0 || isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40 cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <span>सहेजा जा रहा है...</span>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={15} />
                <span>सफलतापूर्वक सहेजा गया!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>जाप सहेजें (Save Daily Japa)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
