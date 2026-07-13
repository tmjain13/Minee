import { useState, useEffect, useRef } from 'react';
import { Plus, Play, Pause, Share2, Sparkles, Volume2, VolumeX, Check, RefreshCw, Trophy, BookOpen, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
const confetti = (...args: any[]) => {};
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { devLog } from '../lib/devLog';

interface MantraLine {
  prakrit: string;
  hindi: string;
  english: string;
}

const mantraLines: MantraLine[] = [
  {
    prakrit: "णमो अरिहंताणं",
    hindi: "नमो अरिहंताणं (अरिहंतों को नमस्कार)",
    english: "I bow to the Arihantas (Enlightened Souls)"
  },
  {
    prakrit: "णमो सिद्धाणं",
    hindi: "नमो सिद्धाणं (सिद्धों को नमस्कार)",
    english: "I bow to the Siddhas (Liberated Souls)"
  },
  {
    prakrit: "णमो आयरियाणं",
    hindi: "नमो आयरियाणं (आचार्यों को नमस्कार)",
    english: "I bow to the Acharyas (Spiritual Leaders)"
  },
  {
    prakrit: "णमो उवज्झायाणं",
    hindi: "नमो उवज्झायाणं (उपाध्यायों को नमस्कार)",
    english: "I bow to the Upadhyayas (Spiritual Teachers)"
  },
  {
    prakrit: "णमो लोए सव्व साहूणं",
    hindi: "नमो लोए सव्व साहूणं (लोक के सभी साधुओं को नमस्कार)",
    english: "I bow to all Sadhus and Sadhwis"
  },
  {
    prakrit: "एसो पंच नमोक्कारो",
    hindi: "एसो पंच नमोक्कारो (यह पांच गुना नमस्कार)",
    english: "This fivefold salutation"
  },
  {
    prakrit: "सव्वपावप्पणासणो",
    hindi: "सव्वपावप्पणासणो (सभी पापों का पूर्ण विनाशक है)",
    english: "Destroys all sins"
  },
  {
    prakrit: "मंगलाणं च सव्वेसिं",
    hindi: "मंगलाणं च सव्वेसिं (और समस्त मंगलों में)",
    english: "And is the most auspicious"
  },
  {
    prakrit: "पढमं हवइ मंगलं",
    hindi: "पढमं हवइ मंगलं (प्रथम सर्वश्रेष्ठ मंगल है)",
    english: "Of all auspicious things"
  }
];

export default function NavkarMantra({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [isAutoAdvance, setIsAutoAdvance] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Jaap Counter state
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(108);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // References for list scroll active centering
  const linesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-advance loop effect
  useEffect(() => {
    if (!isAutoAdvance) return;
    const interval = setInterval(() => {
      setActiveLineIndex((prev) => (prev + 1) % mantraLines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoAdvance]);

  // Center active line card inside virtual scrolling viewport
  useEffect(() => {
    if (linesContainerRef.current) {
      const activeElement = linesContainerRef.current.children[activeLineIndex] as HTMLElement;
      if (activeElement) {
        linesContainerRef.current.scrollTo({
          top: activeElement.offsetTop - linesContainerRef.current.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLineIndex]);

  // Pure Web Audio API custom bell synthesis
  const playBellSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, duration: number, gainVal: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
      };

      // Sound signature: Elegant multi-frequency crystal temple bell chime
      playTone(880, 1.2, 0.12);  // A5 note
      playTone(1320, 1.6, 0.05); // E6 overtone
      playTone(1760, 2.0, 0.02); // A6 bright ping
    } catch (e) {
      console.warn("Web Audio synthesis is blocked until first user gesture:", e);
    }
  };

  // Increment Jaap with complete and save states
  const handleIncrement = () => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    playBellSound();
    
    // Auto-advance lines on user chant to create a steady reading rhythm
    if (!isAutoAdvance) {
      setActiveLineIndex((prev) => (prev + 1) % mantraLines.length);
    }

    setCount((prevCount) => {
      const nextCount = prevCount + 1;
      
      // Target reached check
      if (nextCount >= target) {
        triggerMilestoneCelebration(nextCount);
      }
      
      return nextCount;
    });
  };

  const triggerMilestoneCelebration = (finalCount: number) => {
    setShowConfetti(true);
    triggerExplosion();
    saveToFirestore(finalCount);
  };

  const triggerExplosion = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#059669', '#10b981', '#34d399', '#fbbf24', '#f59e0b']
    });
  };

  // Persistent Firestore logging with detailed auth verification
  const saveToFirestore = async (finalCount: number) => {
    if (!user) {
      devLog("Logged as guest: Skipping cloud sync.");
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    const todayStr = new Date().toISOString().split('T')[0];
    const path = `users/${user.uid}/navkarLogs`;
    
    try {
      await addDoc(collection(db, path), {
        count: finalCount,
        date: todayStr,
        timestamp: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset counter completely
  const handleReset = () => {
    setCount(0);
    setShowConfetti(false);
  };

  // Web Share API with rich Prakrit and multilingual meanings formatter
  const handleShare = async () => {
    const textToShare = `🕉️ श्री नवकार महामंत्र (Sahasrara Stuti) 🕉️

णमो अरिहंताणं
(I bow to the Arihantas - Enlightened Souls)

णमो सिद्धाणं
(I bow to the Siddhas - Liberated Souls)

णमो आयरियाणं
(I bow to the Acharyas - Spiritual Leaders)

णमो उवज्झायाणं
(I bow to the Upadhyayas - Spiritual Teachers)

णमो लोए सव्व साहूणं
(I bow to all Sadhus and Sadhwis)

एसो पंच नमोक्कारो | सव्वपावप्पणासणो |
मंगलाणं च सव्वेसिं | पढमं हवइ मंगलं ||

"यह पांच गुना नमस्कार सभी पापों का विनाश करता है एवं समूचे जगत के लिए कल्याणकारी महामंगल है।"

📿 गुणों की वंदना करें, अहंकार से मुक्ति पाएं!
Shared via Terapanth AI Assistant.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'नवकार महामंत्र - The Supreme Jain Invocation',
          text: textToShare,
          url: window.location.origin
        });
      } catch (e) {
        devLog("Share canceled or skipped:", e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Manual share clipboard copying failed:", err);
      }
    }
  };

  // SVG circular Progress computation rings
  const radius = 64;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progressPercent = Math.min(100, (count / target) * 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-cream)] text-[var(--text-spiritual)] overflow-hidden relative" id="navkar-mantra-fullview">
      
      {/* Absolute floating background pattern */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Header section with closing hooks */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--card-bg)] z-10 relative">
        <div className="flex items-center gap-3">
          <BookOpen className="text-emerald-600 dark:text-emerald-400" size={24} />
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-spiritual)] serif-text tracking-tight">नवकार महामंत्र</h1>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5">The Supreme Jain Prayer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio volume switch */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all active:scale-90"
            title={soundEnabled ? "Mute Bell sound" : "Enable Bell sound"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Web Share action button */}
          <button
            onClick={handleShare}
            className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all active:scale-90 relative"
            title="Share or copy Mantra"
          >
            <Share2 size={18} />
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-11 right-0 bg-emerald-600 text-white text-[10px] py-1 px-2.5 rounded-xl whitespace-nowrap font-semibold shadow-md"
                >
                  Mantra Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main split multi-interactive view container */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10 p-4 sm:p-6 gap-4 sm:gap-6 min-h-0">
        
        {/* Left pane: Mantra lines display screen */}
        <section className="flex-1 flex flex-col min-h-0 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm">
          <div className="flex-shrink-0 flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Sacred Verses & Meaning</span>
            
            {/* Auto-advance loops trigger */}
            <button
              onClick={() => setIsAutoAdvance(!isAutoAdvance)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                isAutoAdvance 
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15 animate-pulse' 
                  : 'bg-black/5 dark:bg-white/5 text-gray-500'
              }`}
            >
              {isAutoAdvance ? <Pause size={12} /> : <Play size={12} />}
              Auto-Loop (3s)
            </button>
          </div>

          {/* Interactive lines list */}
          <div 
            ref={linesContainerRef}
            className="flex-1 overflow-y-auto pr-1 space-y-3 scroll-smooth max-h-full hide-scrollbar"
          >
            {mantraLines.map((line, index) => {
              const isActive = index === activeLineIndex;
              return (
                <motion.div
                  key={index}
                  onClick={() => {
                    setActiveLineIndex(index);
                    playBellSound();
                  }}
                  whileHover={{ scale: isActive ? 1 : 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-500 dark:border-emerald-400/60 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500'
                      : 'bg-black/[0.01] dark:bg-white/[0.01] border-[var(--border-color)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                  }`}
                  id={`mantra-line-${index}`}
                >
                  {/* Line index badge & Sanskrit */}
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-black/10 dark:bg-white/10 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <h2 className={`text-lg sm:text-xl font-semibold tracking-wide ${
                      isActive ? 'text-emerald-700 dark:text-emerald-300 scale-102 transition-transform' : 'text-[var(--text-spiritual)]'
                    }`}>
                      {line.prakrit}
                    </h2>
                  </div>

                  {/* Hindi & English guides */}
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 pl-8">
                    {line.hindi}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium italic mt-0.5 pl-8">
                    {line.english}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Right pane: Chanting and counting terminal */}
        <section className="flex-shrink-0 w-full lg:w-[350px] flex flex-col gap-4 sm:gap-6">
          
          {/* Target selection & Circular ring */}
          <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-5 shadow-sm flex flex-col items-center">
            
            {/* Target Selectors */}
            <div className="w-full flex justify-between items-center bg-black/5 dark:bg-white/5 p-1 rounded-2xl mb-6">
              {([1, 9, 27, 108] as const).map((tNum) => {
                const isSelected = target === tNum;
                return (
                  <button
                    key={tNum}
                    onClick={() => {
                      setTarget(tNum);
                      if (count >= tNum) handleReset();
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      isSelected 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10 scale-102 font-extrabold' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {tNum}x
                  </button>
                );
              })}
            </div>

            {/* Circular layout counter with 108 exquisite beads */}
            <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 mb-6">
              
              {/* SVG circular progress representation with 108 Japa beads */}
              <svg viewBox="0 0 140 140" className="absolute top-0 left-0 w-full h-full transform -rotate-90 select-none">
                {/* Definitive 3D Gradient and Glow effects for the beads */}
                <defs>
                  <radialGradient id="beadGlow" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="60%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </radialGradient>
                  
                  <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background track */}
                <circle
                  stroke="currentColor"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius + stroke}
                  cy={radius + stroke}
                  className="text-black/5 dark:text-white/5 width-full height-full"
                />
                
                {/* Highlight progress path */}
                <circle
                  stroke="currentColor"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius + stroke}
                  cy={radius + stroke}
                  className="text-emerald-600 transition-all duration-300"
                />

                {/* Outer 108 Japa beads ring */}
                {Array.from({ length: 108 }).map((_, i) => {
                  const angle = (i * 2 * Math.PI) / 108;
                  // Radius of the bead path: 58px. Center is at (70, 70).
                  const beadRadiusScale = 58;
                  const cx = radius + stroke + beadRadiusScale * Math.cos(angle);
                  const cy = radius + stroke + beadRadiusScale * Math.sin(angle);
                  
                  // Active state calculations: wrapped around 108
                  const currentBeadIndex = count === 0 ? -1 : (count - 1) % 108;
                  const isActive = i <= currentBeadIndex;
                  const isLastChanted = i === currentBeadIndex;
                  
                  return (
                    <motion.circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r={isActive ? (isLastChanted ? 3.0 : 2.2) : 1.2}
                      fill={isActive ? 'url(#beadGlow)' : 'currentColor'}
                      filter={isLastChanted ? 'url(#glowEffect)' : undefined}
                      className={isActive 
                        ? 'text-emerald-500' 
                        : 'text-gray-300 dark:text-gray-700/80'
                      }
                      animate={isLastChanted ? {
                        scale: [1, 2.0, 1],
                        strokeWidth: [0, 4, 0],
                        stroke: '#a7f3d0'
                      } : {}}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  );
                })}
              </svg>

              {/* Inner details */}
              <div className="text-center z-10">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</span>
                <span className="text-4xl font-extrabold text-[var(--text-spiritual)] tracking-tight">
                  {count}
                </span>
                <span className="block text-[11px] font-bold text-emerald-600 block mt-0.5">
                  / {target} Jaap
                </span>
              </div>
            </div>

            {/* Tap controls buttons */}
            <div className="w-full flex items-center gap-3">
              
              {/* Reset counters */}
              <button
                onClick={handleReset}
                className="p-4 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-gray-500 dark:text-gray-400 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                title="Reset current Jaap count"
              >
                <RefreshCw size={18} />
              </button>

              {/* Core main Increment Trigger */}
              <motion.button
                onClick={handleIncrement}
                whileTap={{ scale: 0.92 }}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2.5 font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 transition-colors relative"
              >
                <Plus size={18} />
                Chant (Tap)
              </motion.button>
            </div>
          </div>

          {/* Congratulations Card popup on completion */}
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="bg-emerald-600 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden"
              >
                {/* Visual sparkles absolute overlay */}
                <Sparkles className="absolute -right-2 -top-2 w-24 h-24 text-emerald-500/30 rotate-12" />
                
                <div className="flex gap-4 relative z-10">
                  <div className="bg-white/20 p-2.5 rounded-2xl h-fit">
                    <Trophy className="text-yellow-300" size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold serif-text text-lg">Mala Complete!</h3>
                    <p className="text-xs text-emerald-100 mt-1">
                      Congratulations! You have completed your chanting goal of <strong>{target} Jaap</strong> recitations.
                    </p>
                    
                    {/* Database sync tracking alerts */}
                    <div className="flex items-center gap-3 mt-3.5">
                      <button
                        onClick={triggerExplosion}
                        className="bg-white/20 hover:bg-white/35 active:scale-95 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        Celebrate
                      </button>

                      {user && (
                        <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
                          <Check size={12} />
                          {isSaving ? "Syncing..." : "Saved to cloud"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom quote / philosophy info card */}
          <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-5 shadow-sm relative overflow-hidden">
            {/* Soft decorative visual background heart */}
            <Heart className="absolute -right-3 -bottom-3 w-16 h-16 text-emerald-500/5 rotate-12" />
            
            <div className="flex gap-3.5 relative z-10">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 rounded-xl max-h-[36px] flex items-center justify-center">
                <Heart size={16} />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                &ldquo;नवकार मंत्र में किसी व्यक्ति विशेष की वंदना नहीं है &mdash; यह तो आध्यात्मिक गुणों, चरित्र एवं पवित्रता की वंदना है।&rdquo;
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
