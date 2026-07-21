import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Eye, Sparkles, Flame, Play, Pause, RotateCcw, Volume2, VolumeX, Info, Heart, Star, CheckCircle, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LeshyaColor {
  id: string;
  nameEn: string;
  nameHi: string;
  colorClass: string;
  hex: string;
  qualityEn: string;
  qualityHi: string;
  benefitsEn: string;
  benefitsHi: string;
}

const LESHYA_COLORS: LeshyaColor[] = [
  {
    id: 'yellow',
    nameEn: 'Tejo Leshya (Bright Yellow)',
    nameHi: 'तेजो लेश्या (पीला)',
    colorClass: 'from-amber-400 to-yellow-600',
    hex: '#eab308',
    qualityEn: 'Peace, joy, and friendliness',
    qualityHi: 'शांति, आनंद और मैत्री भाव',
    benefitsEn: 'Balances emotions, purifies thoughts, builds resilience.',
    benefitsHi: 'भावों को संतुलित करती है, विचारों को शुद्ध करती है।'
  },
  {
    id: 'pink',
    nameEn: 'Padma Leshya (Lotus Pink)',
    nameHi: 'पद्म लेश्या (गुलाबी)',
    colorClass: 'from-pink-400 to-rose-600',
    hex: '#ec4899',
    qualityEn: 'Affection, non-attachment, patience',
    qualityHi: 'आत्मीयता, अनासक्ति, संयम',
    benefitsEn: 'Alleviates anxiety, harmonizes relations, boosts confidence.',
    benefitsHi: 'चिंता कम करती है, संबंधों में सामंजस्य बढ़ाती है।'
  },
  {
    id: 'white',
    nameEn: 'Shukla Leshya (Pure White)',
    nameHi: 'शुक्ल लेश्या (श्वेत)',
    colorClass: 'from-slate-50 to-stone-300 dark:from-zinc-100 dark:to-zinc-400',
    hex: '#ffffff',
    qualityEn: 'Absolute purity, clarity, detached awareness',
    qualityHi: 'परम शुद्धता, मानसिक स्पष्टता, अनासक्त भाव',
    benefitsEn: 'Deepest emotional purification, spiritual awakening, ultimate tranquility.',
    benefitsHi: 'अंतिम भावात्मक शुद्धि और आध्यात्मिक जागृति लाती है।'
  },
  {
    id: 'blue',
    nameEn: 'Neela Leshya (Sky Blue)',
    nameHi: 'नील लेश्या (नीला)',
    colorClass: 'from-sky-400 to-blue-600',
    hex: '#38bdf8',
    qualityEn: 'Calmness, steady focus, control',
    qualityHi: 'मौन स्थिरता, एकाग्रता, संयमित मन',
    benefitsEn: 'Soothes highly erratic minds, reduces hypertension.',
    benefitsHi: 'अति चंचल मन को शांत करती है, रक्तचाप संतुलित करती।'
  }
];

export function LeshyaDhyanVisualizer() {
  const { language } = useLanguage();
  const [selectedLeshya, setSelectedLeshya] = useState<LeshyaColor>(LESHYA_COLORS[0]);
  const [isPulsing, setIsPulsing] = useState(false);

  return (
    <div className="bg-stone-900/90 border border-white/[0.05] p-5 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-500">
              {language === 'hi' ? 'लेश्य ध्यान विज़ुअलाइज़र' : 'Leshya Dhyan Color Pulse'}
            </h4>
            <p className="text-[10px] text-zinc-400 font-semibold font-mono">
              {language === 'hi' ? 'मनोवैज्ञानिक तरंगों का संतुलन' : 'Psychic Color Aura Visualization'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsPulsing(!isPulsing)}
          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer ${
            isPulsing 
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/15' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {isPulsing ? (language === 'hi' ? 'विज़ुअलाइज़र बंद' : 'Stop Pulsing') : (language === 'hi' ? 'पल्स चालू करें' : 'Start Pulse')}
        </button>
      </div>

      {/* Pulsing Visual Board */}
      <div className="relative h-44 rounded-2xl overflow-hidden bg-black/40 flex flex-col items-center justify-center p-4 border border-white/[0.03]">
        {/* Pulsing Aura */}
        <AnimatePresence>
          {isPulsing && (
            <motion.div
              key={selectedLeshya.id}
              initial={{ scale: 0.9, opacity: 0.1 }}
              animate={{
                scale: [0.95, 1.25, 0.95],
                opacity: [0.3, 0.7, 0.3],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: `radial-gradient(circle, ${selectedLeshya.hex}40 0%, transparent 70%)`
              }}
              className="absolute inset-0 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Ambient background accent */}
        <div 
          className="absolute inset-0 opacity-10 transition-all duration-1000"
          style={{
            background: `linear-gradient(to bottom right, ${selectedLeshya.hex}30, transparent)`
          }}
        />

        <div className="relative text-center z-10 space-y-2 max-w-xs">
          <motion.div 
            animate={isPulsing ? { scale: [1, 1.08, 1], filter: ["blur(0px)", "blur(1px)", "blur(0px)"] } : {}}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border-2 border-white/20 shadow-lg"
            style={{
              background: `radial-gradient(circle, ${selectedLeshya.hex}ee 0%, ${selectedLeshya.hex}77 100%)`,
              boxShadow: isPulsing ? `0 0 25px ${selectedLeshya.hex}55` : 'none'
            }}
          >
            <Compass className="text-stone-900 stroke-[2.5]" size={22} />
          </motion.div>

          <div>
            <h5 className="text-xs font-black text-white">
              {language === 'hi' ? selectedLeshya.nameHi : selectedLeshya.nameEn}
            </h5>
            <p className="text-[10px] text-amber-200/90 font-bold tracking-tight">
              {language === 'hi' ? selectedLeshya.qualityHi : selectedLeshya.qualityEn}
            </p>
          </div>
        </div>
      </div>

      {/* Color Selector Grid */}
      <div className="grid grid-cols-4 gap-2">
        {LESHYA_COLORS.map((color) => (
          <button
            key={color.id}
            onClick={() => setSelectedLeshya(color)}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
              selectedLeshya.id === color.id 
                ? 'bg-zinc-800/90 border-amber-500/60 shadow-lg' 
                : 'bg-zinc-950/40 border-white/[0.02] hover:bg-zinc-800/40'
            }`}
          >
            <div 
              className="w-5 h-5 rounded-full mx-auto mb-1 border border-white/20 shadow-inner"
              style={{ backgroundColor: color.hex }}
            />
            <span className="block text-[8px] font-black uppercase text-zinc-300 tracking-wider truncate">
              {language === 'hi' ? color.nameHi.split(' ')[0] : color.nameEn.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Benefits Panel */}
      <div className="bg-zinc-950/40 p-3 rounded-2xl border border-white/[0.02] text-left">
        <span className="block text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-1 font-mono">
          {language === 'hi' ? 'विशेष लेश्या स्वास्थ्य लाभ' : 'Clinical & Emotional Benefits'}
        </span>
        <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed">
          {language === 'hi' ? selectedLeshya.benefitsHi : selectedLeshya.benefitsEn}
        </p>
      </div>
    </div>
  );
}

// SHVAS PREKSHA - GUIDED BREATHING COMPONENT
export function ShvasPrekshaGuidedBreathing() {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [secondsLeft, setSecondsLeft] = useState(4); // default phase seconds
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [durationGoal, setDurationGoal] = useState<number>(180); // Default 3 minutes in seconds
  const [elapsed, setElapsed] = useState(0);

  // Phase configurations: Inhale 4s, Hold 4s, Exhale 4s
  const phases = {
    inhale: { next: 'hold' as const, duration: 4, textEn: 'Breathe In... deep & slow', textHi: 'धीरे-धीरे श्वास लें...' },
    hold: { next: 'exhale' as const, duration: 4, textEn: 'Hold... perceive stillness', textHi: 'श्वास रोकें... स्थिरता महसूस करें' },
    exhale: { next: 'inhale' as const, duration: 4, textEn: 'Breathe Out... drop tension', textHi: 'धीरे-धीरे श्वास बाहर छोड़ें...' }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      if (phase === 'ready') {
        setPhase('inhale');
        setSecondsLeft(4);
      }

      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            let nextPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
            if (phase === 'inhale') nextPhase = 'hold';
            else if (phase === 'hold') nextPhase = 'exhale';
            else if (phase === 'exhale') {
              nextPhase = 'inhale';
              setCyclesCompleted(c => c + 1);
            }
            
            setPhase(nextPhase);
            // Gentle browser vibrate feedback if supported
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(30);
            }
            return phases[nextPhase].duration;
          }
          return prev - 1;
        });

        setElapsed(e => {
          if (e >= durationGoal) {
            setIsPlaying(false);
            setPhase('ready');
            return durationGoal;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, phase, durationGoal]);

  const handleReset = () => {
    setIsPlaying(false);
    setPhase('ready');
    setSecondsLeft(4);
    setElapsed(0);
    setCyclesCompleted(0);
  };

  const getCircleScale = () => {
    if (!isPlaying) return 1;
    if (phase === 'inhale') return 1 + (4 - secondsLeft) * 0.12; // Grow to 1.48
    if (phase === 'hold') return 1.48; // Stay expanded
    if (phase === 'exhale') return 1.48 - (4 - secondsLeft) * 0.12; // Shrink back to 1
    return 1;
  };

  return (
    <div className="bg-stone-900/90 border border-white/[0.05] p-5 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Wind size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500">
              {language === 'hi' ? 'श्वास प्रेक्षा (प्राण साधना)' : 'Shvas Preksha Guided Breathing'}
            </h4>
            <p className="text-[10px] text-zinc-400 font-semibold font-mono">
              {language === 'hi' ? '३-५ मिनट की लयबद्ध श्वास योग' : '3-5 min rhythmic respiration exercises'}
            </p>
          </div>
        </div>
      </div>

      {/* Circle Guide Stage */}
      <div className="relative h-48 rounded-2xl bg-black/40 flex flex-col items-center justify-center p-4 border border-white/[0.03] overflow-hidden">
        {/* Pulse Ripple */}
        <motion.div
          animate={isPlaying ? {
            scale: [1, 1.4, 1.8],
            opacity: [0.4, 0.15, 0]
          } : { scale: 1, opacity: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 rounded-full border-2 border-emerald-500/30 pointer-events-none"
        />

        {/* Breathing Circle */}
        <motion.div
          animate={{ scale: getCircleScale() }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            background: phase === 'inhale' 
              ? 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.05) 100%)'
              : phase === 'hold'
              ? 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)'
          }}
          className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ${
            phase === 'inhale' ? 'border-emerald-500/40' : phase === 'hold' ? 'border-amber-500/40' : 'border-blue-500/40'
          }`}
        >
          <span className="text-2xl font-black text-white font-mono">{secondsLeft}s</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
            {phase.toUpperCase()}
          </span>
        </motion.div>

        {/* Guide Texts */}
        <div className="absolute bottom-3 text-center">
          <p className="text-xs font-black text-stone-200">
            {isPlaying 
              ? (language === 'hi' ? phases[phase as keyof typeof phases]?.textHi : phases[phase as keyof typeof phases]?.textEn)
              : (language === 'hi' ? 'आरंभ करने के लिए प्ले बटन दबाएं' : 'Ready to awaken. Tap Play to begin.')
            }
          </p>
        </div>
      </div>

      {/* Goal Selector & Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-white/[0.02] flex items-center justify-between">
          <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
            {language === 'hi' ? 'सत्र अवधि' : 'Goal'}
          </span>
          <select
            value={durationGoal}
            onChange={(e) => setDurationGoal(Number(e.target.value))}
            disabled={isPlaying}
            className="bg-transparent text-xs font-bold text-emerald-400 border-none outline-none cursor-pointer"
          >
            <option value={180} className="bg-stone-900 text-stone-200">3 Min</option>
            <option value={300} className="bg-stone-900 text-stone-200">5 Min</option>
          </select>
        </div>

        <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-white/[0.02] flex items-center justify-between font-mono">
          <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
            {language === 'hi' ? 'पूर्ण चक्र' : 'Cycles'}
          </span>
          <span className="text-xs font-black text-stone-200">{cyclesCompleted}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isPlaying 
              ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 hover:opacity-95 shadow-lg shadow-emerald-500/15'
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? (language === 'hi' ? 'रोकें' : 'Pause') : (language === 'hi' ? 'आरंभ' : 'Start')}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/[0.03] text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          title="Reset session"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Benefits contour */}
      <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 text-left">
        <span className="block text-[8px] text-emerald-400 uppercase tracking-widest font-black mb-1 flex items-center gap-1 font-mono">
          <Heart size={8} />
          {language === 'hi' ? 'श्वास प्रेक्षा के वैज्ञानिक लाभ' : 'Clinical Benefits of Shvas Preksha'}
        </span>
        <p className="text-[9.5px] text-zinc-300 font-semibold leading-relaxed">
          {language === 'hi'
            ? 'गहरे और लयबद्ध श्वास से फेफड़ों की कार्यक्षमता बढ़ती है, कोर्टिसोल (तनाव हार्मोन) का स्तर कम होता है और तंत्रिका तंत्र को शांति मिलती है।'
            : 'Slowing breathing reduces stress hormone cortisol, synchronizes autonomic nervous activity, decreases pulse rate, and elevates mental balance.'}
        </p>
      </div>
    </div>
  );
}
