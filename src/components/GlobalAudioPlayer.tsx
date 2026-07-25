import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown, Music, Disc, Timer, Gauge, Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalAudioPlayerProps {
  ambientSoundEnabled: boolean;
  setAmbientSoundEnabled: (enabled: boolean) => void;
  spiritualSoundscape: 'om' | 'temple_bells' | 'nature';
  setSpiritualSoundscape: (soundscape: 'om' | 'temple_bells' | 'nature') => void;
  language: string;
}

const SOUND_TRACKS = [
  {
    id: 'om' as const,
    labelEn: 'Holy Om Drone',
    labelHi: 'पवित्र ॐ जप',
    emoji: '🕉️',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'temple_bells' as const,
    labelEn: 'Peaceful Temple Bells',
    labelHi: 'शांतिमय घंटियाँ',
    emoji: '🔔',
    url: 'https://raw.githubusercontent.com/Anant-mishra1729/sound-files/main/temple-bell.mp3'
  },
  {
    id: 'nature' as const,
    labelEn: 'Ambient Rain & Nature',
    labelHi: 'प्रकृति और वर्षा',
    emoji: '🌧️',
    url: 'https://raw.githubusercontent.com/scottschiller/soundmanager2/master/demo/_mp3/rain.mp3'
  }
];

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];
const SLEEP_TIMER_OPTIONS = [15, 30, 60]; // in minutes

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({
  ambientSoundEnabled,
  setAmbientSoundEnabled,
  spiritualSoundscape,
  setSpiritualSoundscape,
  language
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('global_soundscape_volume');
    return saved !== null ? Number(saved) : 0.3;
  });
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);

  // Playback position state
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // Playback speed state
  const [playbackRate, setPlaybackRate] = useState<number>(() => {
    const saved = localStorage.getItem('global_soundscape_speed');
    return saved !== null ? Number(saved) : 1.0;
  });

  // Sleep timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null);
  const [remainingTimerSeconds, setRemainingTimerSeconds] = useState<number | null>(null);

  // Handle Playback Speed Change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
    localStorage.setItem('global_soundscape_speed', String(playbackRate));
  }, [playbackRate]);

  // Handle Sleep Timer Countdown
  useEffect(() => {
    if (!sleepTimerEnd || !ambientSoundEnabled) {
      if (!sleepTimerEnd) {
        setRemainingTimerSeconds(null);
      }
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((sleepTimerEnd - Date.now()) / 1000));
      setRemainingTimerSeconds(remaining);

      if (remaining <= 0) {
        setAmbientSoundEnabled(false);
        setSleepTimerEnd(null);
        setSleepTimerMinutes(null);
        setRemainingTimerSeconds(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd, ambientSoundEnabled, setAmbientSoundEnabled]);

  // Initialize and update Audio element with position persistence
  useEffect(() => {
    const activeTrack = SOUND_TRACKS.find(t => t.id === spiritualSoundscape) || SOUND_TRACKS[0];
    const savedTime = localStorage.getItem(`global_soundscape_time_${spiritualSoundscape}`);
    const initialPos = savedTime !== null ? Number(savedTime) : 0;

    if (!audioRef.current) {
      const audio = new Audio(activeTrack.url);
      audio.loop = true;
      audio.playbackRate = playbackRate;
      audioRef.current = audio;

      const onLoadedMetadata = () => {
        if (initialPos > 0 && initialPos < (audio.duration || Infinity)) {
          audio.currentTime = initialPos;
          setCurrentTimeSeconds(initialPos);
        }
      };
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
    } else if (audioRef.current.src !== activeTrack.url) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      audioRef.current.src = activeTrack.url;
      audioRef.current.load();
      audioRef.current.playbackRate = playbackRate;

      if (initialPos > 0) {
        try {
          audioRef.current.currentTime = initialPos;
          setCurrentTimeSeconds(initialPos);
        } catch {
          // Ignore invalid seek before load
        }
      }

      if (wasPlaying || ambientSoundEnabled) {
        audioRef.current.play().catch(err => console.warn('Audio swap play failed:', err));
      }
    }

    // Apply properties
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.playbackRate = playbackRate;

    // Save position on timeupdate
    const handleTimeUpdate = () => {
      if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
        const time = audioRef.current.currentTime;
        setCurrentTimeSeconds(time);
        if (!isNaN(audioRef.current.duration)) {
          setDurationSeconds(audioRef.current.duration);
        }
        localStorage.setItem(`global_soundscape_time_${spiritualSoundscape}`, String(time));
      }
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

    // Handle global state sync
    if (ambientSoundEnabled) {
      audioRef.current.play()
        .then(() => setIsPlayingLocal(true))
        .catch(err => {
          console.warn('Autoplay prevented. Interaction required.', err);
          setIsPlayingLocal(false);
          setAmbientSoundEnabled(false);
        });
    } else {
      audioRef.current.pause();
      setIsPlayingLocal(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [spiritualSoundscape, ambientSoundEnabled]);

  // Handle Volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('global_soundscape_volume', String(volume));
  }, [volume, isMuted]);

  // Clean up on complete unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    setAmbientSoundEnabled(!ambientSoundEnabled);
  };

  const handleTrackChange = (id: 'om' | 'temple_bells' | 'nature') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setSpiritualSoundscape(id);
    if (!ambientSoundEnabled) {
      setAmbientSoundEnabled(true);
    }
  };

  const handleSelectSleepTimer = (minutes: number | null) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    if (minutes === null) {
      setSleepTimerMinutes(null);
      setSleepTimerEnd(null);
      setRemainingTimerSeconds(null);
    } else {
      const endTimestamp = Date.now() + minutes * 60 * 1000;
      setSleepTimerMinutes(minutes);
      setSleepTimerEnd(endTimestamp);
      setRemainingTimerSeconds(minutes * 60);
      if (!ambientSoundEnabled) {
        setAmbientSoundEnabled(true);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTrack = SOUND_TRACKS.find(t => t.id === spiritualSoundscape) || SOUND_TRACKS[0];

  return (
    <div 
      className="fixed left-0 right-0 z-40 max-w-md mx-auto px-3"
      style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px))' }}
    >
      <motion.div
        layout
        className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-orange-100 dark:border-slate-800/40 shadow-xl overflow-hidden transition-all duration-300"
      >
        {/* Sleek Header / Compact View */}
        <div className="h-11 px-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => setIsExpanded(!isExpanded)}>
            <div className={`relative flex items-center justify-center w-7 h-7 rounded-full ${isPlayingLocal ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-500' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
              <Disc size={15} className={isPlayingLocal ? 'animate-spin [animation-duration:8s]' : ''} />
              {isPlayingLocal && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </div>
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                  <Music size={9} />
                  {language === 'hi' ? 'मंत्र ध्वनि' : 'Spiritual Ambience'}
                </span>
                {playbackRate !== 1.0 && (
                  <span className="px-1 py-0.2 text-[8px] font-bold bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-md font-mono">
                    {playbackRate}x
                  </span>
                )}
                {remainingTimerSeconds !== null && (
                  <span className="px-1 py-0.2 text-[8px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-md flex items-center gap-0.5 font-mono">
                    <Timer size={8} />
                    {formatSeconds(remainingTimerSeconds)}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-stone-800 dark:text-slate-100 truncate max-w-[140px]">
                {language === 'hi' ? currentTrack.labelHi : currentTrack.labelEn}
              </span>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex items-center gap-1.5">
            {/* Live Mini Wave visualizer */}
            {isPlayingLocal && (
              <div className="flex items-end gap-0.5 h-3 px-1">
                <span className="w-[1.5px] h-2 bg-orange-500 animate-[bounce_0.8s_infinite] rounded-full"></span>
                <span className="w-[1.5px] h-3 bg-orange-500 animate-[bounce_1s_infinite_0.2s] rounded-full"></span>
                <span className="w-[1.5px] h-1.5 bg-orange-500 animate-[bounce_0.6s_infinite_0.4s] rounded-full"></span>
                <span className="w-[1.5px] h-2.5 bg-orange-500 animate-[bounce_0.9s_infinite_0.1s] rounded-full"></span>
              </div>
            )}

            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all cursor-pointer"
              title={isPlayingLocal ? 'Pause' : 'Play'}
              aria-label={isPlayingLocal ? 'Pause soundscape' : 'Play soundscape'}
            >
              {isPlayingLocal ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Expand / Minimize Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle soundscape settings"
            >
              {isExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>

        {/* Expanded Track Settings & Advanced Controls Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-orange-50/50 dark:border-slate-800/20 bg-stone-50/50 dark:bg-slate-900/10 px-4 py-3.5 space-y-3.5"
            >
              {/* Frequency Visualizer Bar */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 border border-stone-200/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-stone-500 dark:text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Sparkles size={11} className="text-orange-500" />
                    {language === 'hi' ? 'आवृत्ति स्पंदन (Frequency Wave)' : 'Audio Frequency Visualizer'}
                  </span>
                  {currentTimeSeconds > 0 && (
                    <span className="text-[10px] font-mono text-stone-500 dark:text-slate-400 flex items-center gap-1">
                      <RotateCcw size={9} />
                      {formatSeconds(currentTimeSeconds)} {durationSeconds > 0 ? `/ ${formatSeconds(durationSeconds)}` : ''}
                    </span>
                  )}
                </div>

                {/* Animated Visualizer Frequency Bars */}
                <div className="h-8 flex items-end justify-between gap-1 px-1 py-0.5 bg-stone-100/60 dark:bg-slate-950/40 rounded-lg overflow-hidden">
                  {[40, 75, 25, 90, 50, 85, 30, 95, 60, 40, 80, 20, 65, 90, 45, 70].map((baseHeight, idx) => {
                    const animationDuration = 0.5 + (idx % 5) * 0.15;
                    const animationDelay = (idx % 7) * 0.08;
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-orange-500 via-amber-400 to-amber-300 dark:from-orange-600 dark:via-amber-500 dark:to-yellow-300 rounded-t-sm transition-all"
                        style={{
                          height: isPlayingLocal ? `${baseHeight}%` : '15%',
                          opacity: isPlayingLocal ? 0.9 : 0.3,
                          animation: isPlayingLocal ? `pulse ${animationDuration}s ease-in-out infinite alternate ${animationDelay}s` : 'none'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Soundscape Track Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-stone-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                  {language === 'hi' ? 'ध्वनि चुनिए' : 'Select Soundscape'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SOUND_TRACKS.map((track) => {
                    const isSelected = spiritualSoundscape === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleTrackChange(track.id)}
                        className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/20'
                            : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800/40 text-stone-700 dark:text-slate-200 hover:border-orange-200'
                        }`}
                      >
                        <span className="text-lg mb-1">{track.emoji}</span>
                        <span className="text-[10px] font-bold leading-tight line-clamp-1">
                          {language === 'hi' ? track.labelHi : track.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls Grid: Speed Control & Sleep Timer */}
              <div className="grid grid-cols-2 gap-2">
                {/* Playback Speed Control */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-stone-200/50 dark:border-slate-800/50 space-y-1">
                  <span className="text-[9px] font-extrabold text-stone-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Gauge size={10} className="text-orange-500" />
                    {language === 'hi' ? 'गति (Speed)' : 'Playback Speed'}
                  </span>
                  <div className="flex gap-1">
                    {SPEED_OPTIONS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackRate(speed)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer font-mono ${
                          playbackRate === speed
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:bg-orange-50'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep Timer Control */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-stone-200/50 dark:border-slate-800/50 space-y-1">
                  <span className="text-[9px] font-extrabold text-stone-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Timer size={10} className="text-amber-500" />
                    {language === 'hi' ? 'स्लीप टाइमर' : 'Sleep Timer'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSelectSleepTimer(null)}
                      className={`px-1.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer font-mono ${
                        sleepTimerMinutes === null
                          ? 'bg-stone-700 border-stone-700 text-white'
                          : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300'
                      }`}
                    >
                      {language === 'hi' ? 'बंद' : 'Off'}
                    </button>
                    {SLEEP_TIMER_OPTIONS.map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleSelectSleepTimer(mins)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer font-mono ${
                          sleepTimerMinutes === mins
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Volume Controller */}
              <div className="flex items-center gap-3 pt-0.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} className="text-orange-500" /> : <Volume2 size={16} />}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-full h-1 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    aria-label="Volume slider"
                  />
                  <span className="text-[10px] font-bold font-mono text-stone-500 dark:text-slate-400 w-8 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

