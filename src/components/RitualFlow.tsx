import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Clock, BookOpen, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PratikramanGuide from './PratikramanGuide';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface RitualStep {
  name: string;
  hindiName: string;
  duration: number; // in seconds, 0 means manual transition
  text: string;
  translation?: string;
  purpose: string;
}

const SAMAYIK_STEPS: RitualStep[] = [
  {
    name: "Preparatory Cleanliness & Posture",
    hindiName: "आसन व मुखपत्ति धारण",
    duration: 60,
    text: "Spread the clean, pure white woolen Katasana (meditation mat) in a silent, isolated place. Sit in Sukhasana or Padmasana facing North or East. Put on the clean Muhapatti (mouth-sleeve) cleanly to practice silence and safeguard speech.",
    purpose: "Ensures external physical purity, limits environmental distractions, and establishes mindfulness."
  },
  {
    name: "Guru & Pancha-Paramesthi Vandana",
    hindiName: "गुरु व पंच परमेष्ठी वंदना",
    duration: 90,
    text: "Join your hands cleanly at the heart center (Anjali Mudra). Bow down towards the supreme saints, the Arihantas, Siddhas, and current spiritual master Acharya Shri Mahashraman Ji with utter purity. Recite the Navkar Mantra three times.",
    purpose: "Instills humility, halts worldly ego, and aligns consciousness with the pure self-realized souls."
  },
  {
    name: "Karemi Bhante Sacred Vow Recitation",
    hindiName: "करेमि भंते प्रतिज्ञा सूत्र",
    duration: 60,
    text: "करेमि भंते ! सामाइयं सावज्जं जोगं पच्चक्खामि, जाव नियमं पज्जुवासामि, दुविहं तिविहेणं-मणेणं वायाए काएणं, न करेमि न कारवेमि, तस्स भंते ! पडिक्कमामि, निंदामि, गरिहामि, अप्पाणं वोसिरामि ॥",
    translation: "O revered master! I pledge to perform Samayik. I renounce all sinful, violent thoughts and deeds for the duration of this practice. I will not engage in nor encourage worldly attachment/aversion via mind, speech, or body. I turn inward.",
    purpose: "The lifetime or temporary vow of equanimity (Samayik Vrat) establishing the stoppage of karmic influx (Samvara)."
  },
  {
    name: "Active Meditation & Scriptural Study",
    hindiName: "४८ मिनट ध्यान व स्वाध्याय",
    duration: 48 * 60, // 48 minutes
    text: "Sit in absolute, non-moving silence. Spend the next 48 minutes in deep contemplation (Dhyana), reciting rosary beads (Japa), practicing Preksha Meditation, or reading sacred Gyanshala/Agama scriptures (Swadhyay). Turn off all electronic devices.",
    purpose: "Active shedding of past accumulated karmas (Nirjara) and expanding right spiritual wisdom."
  },
  {
    name: "Conclusive Dedication (Paripalaya)",
    hindiName: "सामायिक पारना सूत्र",
    duration: 60,
    text: "सामाइय-विहि-जोत्तो, सामाइय-विहि-कओ, सामाइय-विहि-पालिओ। सामायिक में जाने-अनजाने जो भी अतिचार या दोष लगे हों, उन सभी की मैं हृदय से आलोचना करता हूँ। खामेमि सव्वजीवे, सव्वे जीवा खमंतु मे, मित्ती मे सव्वभूएसु, वेरं मज्झं न केणइ ॥",
    translation: "I have observed the Samayik with proper procedures and protocols. For any mental or verbal lapse, I seek absolute forgiveness. I extend pure forgiveness to all living beings in the cosmos, and seek forgiveness from them. I have friendship with all; enmity with none.",
    purpose: "Releases the temporary vow with immense gratitude, locking in the accumulated spiritual merit."
  }
];

export default function RitualFlow() {
  const { user } = useAuth();
  const [selectedRitual, setSelectedRitual] = useState<'selection' | 'samayik' | 'pratikraman'>('selection');
  const [samayikIndex, setSamayikIndex] = useState<number>(0);
  const [timerLeft, setTimerLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedRituals, setCompletedRituals] = useState<number>(0);

  // Sync Timer for active step
  useEffect(() => {
    if (selectedRitual === 'samayik') {
      setTimerLeft(SAMAYIK_STEPS[samayikIndex].duration);
      setIsTimerRunning(false);
    }
  }, [samayikIndex, selectedRitual]);

  // Timer loop
  useEffect(() => {
    if (!isTimerRunning || selectedRitual !== 'samayik') return;

    const interval = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          // Play a small beep or sound to alert transition
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.frequency.setValueAtTime(880, context.currentTime); // A5 note
            gain.gain.setValueAtTime(0.1, context.currentTime);
            osc.start();
            osc.stop(context.currentTime + 0.3);
          } catch (e) {
            console.warn("Audio Context beep blocked:", e);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, selectedRitual]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rs = secs % 60;
    return `${mins}:${rs.toString().padStart(2, '0')}`;
  };

  const handleNextSamayik = async () => {
    if (samayikIndex < SAMAYIK_STEPS.length - 1) {
      setSamayikIndex(prev => prev + 1);
    } else {
      // Completed full Samayik! Save to Firestore logs
      setCompletedRituals(prev => prev + 1);
      if (user) {
        try {
          await addDoc(collection(db, `users/${user.uid}/ritualLogs`), {
            ritualName: 'Samayik Ritual',
            completedAt: serverTimestamp(),
            durationMinutes: 48,
          });
        } catch (e) {
          console.error("Failed to log Samayik ritual:", e);
        }
      }
      alert("Jai Jinendra! You have completed your Samayik Ritual successfully with pure devotion.");
      setSelectedRitual('selection');
      setSamayikIndex(0);
    }
  };

  const handlePrevSamayik = () => {
    if (samayikIndex > 0) {
      setSamayikIndex(prev => prev - 1);
    }
  };

  const currentStep = SAMAYIK_STEPS[samayikIndex];
  const progressPercent = Math.round(((samayikIndex) / (SAMAYIK_STEPS.length - 1)) * 100);

  if (selectedRitual === 'pratikraman') {
    return <PratikramanGuide onBack={() => setSelectedRitual('selection')} />;
  }

  return (
    <div className="space-y-6">
      {/* Selection screen */}
      {selectedRitual === 'selection' && (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-zinc-800 p-6 space-y-6 text-left">
          <div className="flex items-center gap-2 pb-4 border-b border-black/[0.04] dark:border-zinc-800/60">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Interactive Ritual Flow</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Select a common Jain ritual to perform step-by-step</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Samayik Ritual Option */}
            <button
              onClick={() => {
                setSelectedRitual('samayik');
                setSamayikIndex(0);
              }}
              className="p-5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.02] border border-black/5 dark:border-zinc-800 rounded-3xl text-left hover:border-orange-500/20 active:scale-[0.98] transition-all flex flex-col justify-between h-44 group"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">Vow of Equanimity</span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-orange-500 transition-colors">
                  Samayik Ritual (सामायिक)
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                  48 minutes of quiet introspection, scriptural reading, and detachment from worldly tasks.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mt-4">
                Begin Sadhana <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Pratikraman Ritual Option */}
            <button
              onClick={() => setSelectedRitual('pratikraman')}
              className="p-5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.02] border border-black/5 dark:border-zinc-800 rounded-3xl text-left hover:border-orange-500/20 active:scale-[0.98] transition-all flex flex-col justify-between h-44 group"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Retrospective Purification</span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-500 transition-colors">
                  Pratikraman Guide (प्रतिक्रमण)
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                  Perform Evening, Nightly, Fortnightly, or Yearly Pratikraman to clean karma bonds.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-4">
                Begin Guide <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Samayik Step-by-Step Flow */}
      {selectedRitual === 'samayik' && (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-zinc-800 p-6 space-y-6 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.04] dark:border-zinc-800/60">
            <button
              onClick={() => setSelectedRitual('selection')}
              className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={12} /> Exit Ritual
            </button>

            <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest bg-orange-500/10 px-3 py-1.5 rounded-full">
              Samayik Sadhana
            </span>
          </div>

          {/* Progress Bar & Steps indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 px-1">
              <span>Step {samayikIndex + 1} of {SAMAYIK_STEPS.length}</span>
              <span>{progressPercent}% Completed</span>
            </div>
            
            {/* Linear Progress Bar */}
            <div className="w-full bg-black/5 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progressPercent}%` }}
                className="bg-orange-500 h-full rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Detail Card */}
          <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-zinc-800 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 font-mono font-black text-sm">
                0{samayikIndex + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-zinc-950 dark:text-zinc-50">{currentStep.name}</h4>
                <p className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-mono">{currentStep.hindiName}</p>
              </div>
            </div>

            {/* Sacred Text block */}
            <div className="bg-white dark:bg-zinc-800/40 border border-black/5 dark:border-zinc-800 p-5 rounded-2xl space-y-3.5 shadow-sm">
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold italic">
                {currentStep.text}
              </p>
              {currentStep.translation && (
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal border-t border-dashed border-black/5 dark:border-white/5 pt-3">
                  <strong>Meaning:</strong> {currentStep.translation}
                </p>
              )}
            </div>

            {/* Purpose & Rationale */}
            <div className="flex items-start gap-2 text-[10px] text-zinc-400 bg-black/[0.01] p-3 rounded-xl">
              <ShieldCheck size={14} className="text-orange-500 shrink-0 mt-0.5" />
              <span>
                <strong>Spiritual Purpose:</strong> {currentStep.purpose}
              </span>
            </div>

            {/* Step Timer if duration is set */}
            {currentStep.duration > 0 && (
              <div className="flex flex-col items-center justify-center pt-4 border-t border-black/[0.03] dark:border-white/[0.03] gap-3">
                <div className="text-3xl font-mono font-black text-orange-500 tabular-nums">
                  {formatTime(timerLeft)}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      isTimerRunning
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause size={10} /> Pause Timer
                      </>
                    ) : (
                      <>
                        <Play size={10} className="ml-0.5" /> Start Timer
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setTimerLeft(currentStep.duration);
                      setIsTimerRunning(false);
                    }}
                    className="p-1.5 bg-black/5 dark:bg-white/5 text-zinc-400 rounded-lg"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between gap-4 pt-2">
            <button
              onClick={handlePrevSamayik}
              disabled={samayikIndex === 0}
              className="py-2.5 px-5 border border-black/10 dark:border-zinc-800 hover:bg-black/[0.02] text-zinc-700 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={12} /> Prev Step
            </button>

            <button
              onClick={handleNextSamayik}
              className="py-2.5 px-6 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-orange-400/25"
            >
              {samayikIndex === SAMAYIK_STEPS.length - 1 ? (
                <>
                  <CheckCircle2 size={12} /> Complete Ritual
                </>
              ) : (
                <>
                  Next Step <ChevronRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
