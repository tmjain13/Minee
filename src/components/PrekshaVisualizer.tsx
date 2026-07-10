import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Volume2, VolumeX, Timer } from 'lucide-react';

type SessionPhase = 'Inhale' | 'Hold' | 'Exhale';
type AppState = 'idle' | 'breathing' | 'complete';

const PHASE_TIMINGS: Record<SessionPhase, number> = {
  Inhale: 4000,
  Hold: 7000,
  Exhale: 8000,
};

const PHASE_TEXTS: Record<SessionPhase, string> = {
  Inhale: "श्वास अंदर लें",
  Hold: "रोकें",
  Exhale: "बाहर छोड़ें",
};

export default function PrekshaVisualizer() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [sessionLength, setSessionLength] = useState<number>(300); // Default 5 mins
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [phase, setPhase] = useState<SessionPhase>('Inhale');
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resetSession = useCallback(() => {
    setAppState('idle');
    setTimeLeft(sessionLength);
    setPhase('Inhale');
  }, [sessionLength]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (appState === 'breathing') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setAppState('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState]);

  useEffect(() => {
    let phaseTimer: NodeJS.Timeout;
    if (appState === 'breathing') {
      const nextPhase = () => {
        setPhase((curr) => {
          if (curr === 'Inhale') return 'Hold';
          if (curr === 'Hold') return 'Exhale';
          return 'Inhale';
        });
      };
      phaseTimer = setTimeout(nextPhase, PHASE_TIMINGS[phase]);
    }
    return () => clearTimeout(phaseTimer);
  }, [appState, phase]);

  const toggleSession = () => {
    if (appState === 'breathing') {
      resetSession();
    } else {
      setAppState('breathing');
      setTimeLeft(sessionLength);
    }
  };

  const getScale = () => {
    if (phase === 'Inhale') return [1, 2];
    if (phase === 'Hold') return [2, 2];
    return [2, 1];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-stone-100 p-6">
      <div className="flex gap-4 mb-12">
        {[300, 600, 900].map((len) => (
          <button
            key={len}
            onClick={() => { setSessionLength(len); setTimeLeft(len); }}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              sessionLength === len ? 'bg-orange-900/50 border-orange-500 text-orange-200' : 'border-stone-800 text-stone-500'
            }`}
          >
            {len / 60} min
          </button>
        ))}
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        <motion.div
          animate={{ scale: getScale() }}
          transition={{ duration: PHASE_TIMINGS[phase] / 1000, ease: "easeInOut" }}
          className="absolute w-40 h-40 rounded-full bg-orange-500/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: getScale() }}
          transition={{ duration: PHASE_TIMINGS[phase] / 1000, ease: "easeInOut" }}
          className="w-40 h-40 rounded-full border-2 border-orange-500/50 flex flex-col items-center justify-center"
        >
          <span className="text-sm font-medium">{PHASE_TEXTS[phase]}</span>
          <span className="text-2xl font-mono mt-2">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </motion.div>
      </div>

      <div className="flex items-center gap-6 mt-16">
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-stone-900 border border-stone-800">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          onClick={toggleSession}
          className="p-6 rounded-full bg-orange-600 text-white shadow-lg shadow-orange-900/20"
        >
          {appState === 'breathing' ? <Square size={24} /> : <Play size={24} />}
        </button>
      </div>
      
      <audio ref={audioRef} src="/assets/meditation-drone.mp3" loop muted={isMuted} />
    </div>
  );
};
