import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown, Music, Disc } from 'lucide-react';
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
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Consistency with SadhanaTab
  },
  {
    id: 'temple_bells' as const,
    labelEn: 'Peaceful Temple Bells',
    labelHi: 'शांतिमय घंटियाँ',
    emoji: '🔔',
    url: 'https://raw.githubusercontent.com/Anant-mishra1729/sound-files/main/temple-bell.mp3' // Reliable loop
  },
  {
    id: 'nature' as const,
    labelEn: 'Ambient Rain & Nature',
    labelHi: 'प्रकृति और वर्षा',
    emoji: '🌧️',
    url: 'https://raw.githubusercontent.com/scottschiller/soundmanager2/master/demo/_mp3/rain.mp3' // Consistency with SadhanaTab
  }
];

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

  // Initialize and update Audio element
  useEffect(() => {
    const activeTrack = SOUND_TRACKS.find(t => t.id === spiritualSoundscape) || SOUND_TRACKS[0];

    if (!audioRef.current) {
      audioRef.current = new Audio(activeTrack.url);
      audioRef.current.loop = true;
    } else if (audioRef.current.src !== activeTrack.url) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      audioRef.current.src = activeTrack.url;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.warn('Audio swap play failed:', err));
      }
    }

    // Apply volume and mute
    audioRef.current.volume = isMuted ? 0 : volume;

    // Handle global state sync
    if (ambientSoundEnabled) {
      audioRef.current.play()
        .then(() => setIsPlayingLocal(true))
        .catch(err => {
          console.warn('Autoplay prevented. Interaction required.', err);
          setIsPlayingLocal(false);
          // If browser blocked it, fallback to false so button matches reality
          setAmbientSoundEnabled(false);
        });
    } else {
      audioRef.current.pause();
      setIsPlayingLocal(false);
    }

    return () => {
      // Don't destroy audio on typical state updates, only on component unmount
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
    // If not playing, auto start playing when track is clicked
    if (!ambientSoundEnabled) {
      setAmbientSoundEnabled(true);
    }
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
        {/* Sleek Header / Compact View - Reduced to h-10 and px-3 */}
        <div className="h-10 px-3 flex items-center justify-between">
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
              <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                <Music size={9} />
                {language === 'hi' ? 'मंत्र ध्वनि तरंगें' : 'Spiritual Ambience'}
              </span>
              <span className="text-[11px] font-semibold text-stone-800 dark:text-slate-100 truncate max-w-[150px]">
                {language === 'hi' ? currentTrack.labelHi : currentTrack.labelEn}
              </span>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex items-center gap-1.5">
            {/* Live Audio Wave visualizer */}
            {isPlayingLocal && (
              <div className="flex items-end gap-0.5 h-3 px-1.5">
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

        {/* Expanded Track Settings Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-orange-50/50 dark:border-slate-800/20 bg-stone-50/50 dark:bg-slate-900/10 px-4 py-4 space-y-4"
            >
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

              {/* Volume Controller */}
              <div className="flex items-center gap-3">
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
