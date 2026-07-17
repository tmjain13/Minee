import React, { useState } from 'react';
import { 
  Clock, 
  Headphones, 
  Edit3, 
  BookOpen, 
  Bookmark, 
  Lightbulb, 
  Plus, 
  X, 
  Heart, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Timer, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { createSadhanaRecord } from '../services/sadhanaOfflineSync';

interface QuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export default function QuickActions({ isOpen, onClose, setActiveTab }: QuickActionsProps) {
  const { user } = useAuth();
  
  // Modal / Inner Dialog state for Quick Sadhana entry
  const [showLogModal, setShowLogModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form states for Quick Sadhana entry
  const [samayikDone, setSamayikDone] = useState(false);
  const [mantraDone, setMantraDone] = useState(false);
  const [mantraType, setMantraType] = useState('navkar'); // 'navkar' or 'bhikshu' or 'mahashraman'
  const [fastDone, setFastDone] = useState(false);
  const [fastType, setFastType] = useState('chauvihar'); // 'upvas' | 'ekasana' | 'chauvihar' | 'navkarsi'
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const actions = [
    { id: 'samayik', label: 'Samayik Sadhana', icon: <Clock size={16} />, tab: 'sadhana' },
    { id: 'audio', label: 'Mantra & Audio', icon: <Headphones size={16} />, tab: 'audio' },
    { id: 'suvichar', label: 'Daily Suvichar', icon: <Lightbulb size={16} />, tab: 'suvichar' },
    { id: 'journal', label: 'Spiritual Journal', icon: <Edit3 size={16} />, tab: 'journal' },
    { id: 'karma', label: 'Karma Theory', icon: <BookOpen size={16} />, tab: 'karma' },
    { id: 'anuvrat', label: 'Anuvrat Pledge', icon: <Bookmark size={16} />, tab: 'anuvrat' },
  ];

  const handleAction = (tabName: string) => {
    setActiveTab(tabName);
    onClose();
  };

  const handleQuickSadhanaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!samayikDone && !mantraDone && !fastDone) {
      alert("कृपया कम से कम एक साधना विकल्प चुनें / Please select at least one sadhana practice.");
      return;
    }

    setIsSubmitting(true);
    const userId = user?.uid || "guest_user";
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      // 1. Log Samayik if checked
      if (samayikDone) {
        await createSadhanaRecord(userId, 'meditationLogs', {
          minutes: 48,
          date: todayStr
        });
        
        await createSadhanaRecord(userId, 'diary', {
          id: `${todayStr}_quick_samayik_${Math.random().toString(36).substr(2, 5)}`,
          text: `🧘 त्वरित सामायिक साधना: ४८ मिनट पूर्ण।\nटिप्पणी: ${note || "मौन और शांत एकाग्रता।"}\n\n✨ "संयम और सामायिक से आत्मा का शुद्धिकरण होता है।"`,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        });
      }

      // 2. Log Mantra if checked
      if (mantraDone) {
        await createSadhanaRecord(userId, 'mantraLogs', {
          mantraId: mantraType,
          count: 108,
          isFullMala: true,
          date: todayStr
        });
      }

      // 3. Log Fasting if checked
      if (fastDone) {
        await createSadhanaRecord(userId, 'fastingLogs', {
          type: fastType,
          duration: 1,
          date: todayStr,
          timestamp: Date.now()
        });
      }

      // Haptic tactile vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }

      setSuccessMsg(user ? 'साधना सहेजी गई और क्लाउड से सिंक हो रही है! 🕊️' : 'स्थानीय रूप से सहेजा गया! लॉग इन करने पर सिंक होगा। 🕊️');
      
      // Clear form states
      setSamayikDone(false);
      setMantraDone(false);
      setFastDone(false);
      setNote('');
      
      setTimeout(() => {
        setSuccessMsg('');
        setShowLogModal(false);
        onClose();
      }, 2000);

    } catch (err) {
      console.error("[QuickSadhana] Error saving quick entry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Invisible backdrop to close menu when clicking outside */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-all" 
        onClick={onClose} 
      />
      
      <AnimatePresence>
        {!showLogModal ? (
          /* Centered Action Menu Items */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-[85px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-50 w-full max-w-[280px]"
          >
            {/* ⚡ THE HERO QUICK ADD BUTTON */}
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-orange-500/20 active:scale-95 transition-all w-full border border-orange-400/40 cursor-pointer"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-sm font-extrabold tracking-wider uppercase">साधना प्रविष्टि जोड़ें (Add Sadhana Entry)</span>
            </button>

            <div className="w-full h-[1px] bg-stone-700/30 dark:bg-stone-800/60 my-1" />

            {[...actions].reverse().map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.tab)}
                style={{ 
                  animationDelay: `${index * 30}ms`,
                  animationFillMode: 'both'
                }}
                className="flex items-center gap-3 bg-[#1e1e1e]/95 text-stone-200 px-5 py-3 rounded-xl shadow-md border border-stone-800 hover:bg-[#2a2a2a] hover:text-stone-100 active:scale-95 transition-all w-full cursor-pointer"
              >
                <span className="text-stone-500">{action.icon}</span>
                <span className="text-xs font-bold tracking-wider">{action.label}</span>
                <ChevronRight size={12} className="ml-auto text-stone-600" />
              </button>
            ))}
          </motion.div>
        ) : (
          /* 🧘 INTEGRATED QUICK LOGGING DIALOG */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="fixed bottom-[85px] left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[340px] bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800/80 shadow-2xl flex flex-col gap-4 text-stone-850 dark:text-stone-100"
          >
            <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Heart className="text-orange-500 fill-orange-500" size={18} />
                <h3 className="font-serif text-sm font-extrabold text-stone-900 dark:text-stone-50">
                  त्वरित साधना प्रविष्टि (Quick Log)
                </h3>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-3xl animate-bounce">🕊️</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-serif px-4">
                  {successMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickSadhanaSubmit} className="flex flex-col gap-3.5">
                
                {/* 1. SAMAYIK TOGGLE */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  samayikDone 
                    ? 'bg-orange-500/5 border-orange-500/30' 
                    : 'bg-stone-50 dark:bg-stone-950/40 border-stone-150 dark:border-stone-850'
                }`}>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={samayikDone}
                      onChange={(e) => setSamayikDone(e.target.checked)}
                      className="accent-orange-500 w-4 h-4 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🧘</span>
                        <span className="text-xs font-extrabold text-stone-900 dark:text-stone-50">सामायिक (Samayik)</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-bold mt-0.5">Logs 1 Session (48 Minutes)</p>
                    </div>
                  </label>
                </div>

                {/* 2. MANTRA TOGGLE & TYPE */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  mantraDone 
                    ? 'bg-orange-500/5 border-orange-500/30' 
                    : 'bg-stone-50 dark:bg-stone-950/40 border-stone-150 dark:border-stone-850'
                }`}>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={mantraDone}
                        onChange={(e) => setMantraDone(e.target.checked)}
                        className="accent-orange-500 w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">📿</span>
                          <span className="text-xs font-extrabold text-stone-900 dark:text-stone-50">मंत्र जाप (Mantra Jaap)</span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5">Logs 1 Mala (108 Recitations)</p>
                      </div>
                    </label>

                    {mantraDone && (
                      <div className="grid grid-cols-3 gap-1.5 mt-1 pt-2 border-t border-dashed border-stone-200 dark:border-stone-800">
                        {[
                          { id: 'navkar', label: 'नवकार' },
                          { id: 'bhikshu', label: 'भिक्षु' },
                          { id: 'mahashraman', label: 'महाश्रमण' }
                        ].map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setMantraType(m.id)}
                            className={`py-1 text-[10px] font-black uppercase rounded-lg border transition-all ${
                              mantraType === m.id 
                                ? 'bg-orange-500 text-white border-orange-500' 
                                : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-500'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. FAST TOGGLE & TYPE */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  fastDone 
                    ? 'bg-orange-500/5 border-orange-500/30' 
                    : 'bg-stone-50 dark:bg-stone-950/40 border-stone-150 dark:border-stone-850'
                }`}>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={fastDone}
                        onChange={(e) => setFastDone(e.target.checked)}
                        className="accent-orange-500 w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🍽️</span>
                          <span className="text-xs font-extrabold text-stone-900 dark:text-stone-50">तपस्या (Fasting / Tapa)</span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5">Logs 1 Day Fast / संकल्प</p>
                      </div>
                    </label>

                    {fastDone && (
                      <div className="grid grid-cols-2 gap-1.5 mt-1 pt-2 border-t border-dashed border-stone-200 dark:border-stone-800">
                        {[
                          { id: 'chauvihar', label: 'चौविहार' },
                          { id: 'upvas', label: 'उपवास' },
                          { id: 'ekasana', label: 'एकासन' },
                          { id: 'navkarsi', label: 'नवकारसी' }
                        ].map((f) => (
                          <button
                            type="button"
                            key={f.id}
                            onClick={() => setFastType(f.id)}
                            className={`py-1 text-[10px] font-black uppercase rounded-lg border transition-all ${
                              fastType === f.id 
                                ? 'bg-orange-500 text-white border-orange-500' 
                                : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-500'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* NOTE INPUT */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">
                    आध्यात्मिक विचार / Reflection Note (Optional)
                  </span>
                  <input 
                    type="text"
                    placeholder="e.g. आज मन बेहद शांत रहा..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-orange-300 placeholder-stone-400"
                  />
                </div>

                {/* SAVE BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>साधना सहेजें (Save Sadhana)</span>
                      <Sparkles size={13} className="animate-pulse" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
