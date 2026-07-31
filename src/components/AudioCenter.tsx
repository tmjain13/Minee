import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Disc, Radio, Volume2, Maximize2, Minimize2, Music, Sliders, RefreshCw, Check, Zap } from 'lucide-react';

type AudioMode = 'mantra' | 'pravachan' | 'ambient';

interface Track {
  id: string;
  title: string;
  speakerOrType: string;
  duration: string;
  url: string;
}

const STORAGE_KEY = 'terapanth_audio_playback_sync_state';

function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 300;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 300;
}

function formatSecondsToMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function AudioCenter() {
  // Load initial synced state from LocalStorage if present
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If state was saved less than 24h ago, hydrate it
        if (Date.now() - (parsed.lastSyncedAt || 0) < 24 * 60 * 60 * 1000) {
          // If it was playing when tab was hidden/switched, calculate elapsed time
          let elapsedSec = parsed.progress || 0;
          if (parsed.isPlaying && parsed.lastSyncedAt) {
            const extraSec = Math.floor((Date.now() - parsed.lastSyncedAt) / 1000);
            elapsedSec += extraSec;
          }
          return {
            mode: parsed.currentMode || 'mantra',
            playing: parsed.isPlaying || false,
            track: parsed.activeTrack || {
              id: 'm1',
              title: 'Bhikhsu Jap Mantra',
              speakerOrType: 'Chant',
              duration: '10:00',
              url: ''
            },
            volumes: parsed.ambientVolumes || { rain: 40, bells: 20, om: 50 },
            progress: elapsedSec
          };
        }
      }
    } catch (e) {
      console.warn("Could not load audio sync state from storage:", e);
    }
    return {
      mode: 'mantra' as AudioMode,
      playing: false,
      track: {
        id: 'm1',
        title: 'Bhikhsu Jap Mantra',
        speakerOrType: 'Chant',
        duration: '10:00',
        url: ''
      } as Track,
      volumes: { rain: 40, bells: 20, om: 50 },
      progress: 0
    };
  };

  const initialState = getInitialState();

  const [currentMode, setCurrentMode] = useState<AudioMode>(initialState.mode);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialState.playing);
  const [activeTrack, setActiveTrack] = useState<Track | null>(initialState.track);
  const [isMaximized, setIsMaximized] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(initialState.progress);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');

  // Ambient Sound Sliders State
  const [ambientVolumes, setAmbientVolumes] = useState(initialState.volumes);

  const mantraTracks: Track[] = [
    { id: 'm1', title: 'Bhikhsu Jap Mantra', speakerOrType: 'Chant', duration: '10:00', url: '' },
    { id: 'm2', title: 'Navkar Mahamantra Deep Ambient', speakerOrType: 'Fusion Chanting', duration: '15:45', url: '' }
  ];

  const pravachanTracks: Track[] = [
    { id: 'p1', title: 'Maryada Mahotsav Aadesh', speakerOrType: 'Acharya Mahaprajna', duration: '45:20', url: '' },
    { id: 'p2', title: 'Preksha Dhyan Internal Journey', speakerOrType: 'Acharya Mahashraman', duration: '30:15', url: '' }
  ];

  // Ref to track play time intervals
  const progressTimerRef = useRef<any>(null);

  // Background Sync Function: Syncs complete state to LocalStorage
  const savePlaybackState = (playing: boolean, track: Track | null, mode: AudioMode, vols: typeof ambientVolumes, prog: number) => {
    setSyncStatus('syncing');
    try {
      const stateObj = {
        currentMode: mode,
        isPlaying: playing,
        activeTrack: track,
        ambientVolumes: vols,
        progress: prog,
        lastSyncedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
      setLastSyncTime(new Date());
    } catch (e) {
      console.error("Failed to save audio playback state to sync store:", e);
    } finally {
      setTimeout(() => setSyncStatus('synced'), 400);
    }
  };

  // Keep state synced in background whenever parameters change
  useEffect(() => {
    savePlaybackState(isPlaying, activeTrack, currentMode, ambientVolumes, playbackProgress);
  }, [isPlaying, activeTrack, currentMode, ambientVolumes]);

  // Audio Playback Timer & Background Sync Interval
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          const totalSec = activeTrack ? parseDurationToSeconds(activeTrack.duration) : 300;
          const nextVal = prev + 1;
          if (nextVal >= totalSec) {
            setIsPlaying(false);
            return 0;
          }
          // Periodically sync progress every 5 seconds
          if (nextVal % 5 === 0) {
            savePlaybackState(true, activeTrack, currentMode, ambientVolumes, nextVal);
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, activeTrack, currentMode, ambientVolumes]);

  // Tab Visibility Change & Cross-Tab Storage Event Handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is losing focus or user is switching tabs - persist exact timestamp and state
        savePlaybackState(isPlaying, activeTrack, currentMode, ambientVolumes, playbackProgress);
      } else {
        // User returned to tab - hydrate state smoothly
        const synced = getInitialState();
        setPlaybackProgress(synced.progress);
        if (synced.playing !== isPlaying) setIsPlaying(synced.playing);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setCurrentMode(parsed.currentMode || 'mantra');
          setIsPlaying(parsed.isPlaying || false);
          setActiveTrack(parsed.activeTrack || null);
          if (parsed.ambientVolumes) setAmbientVolumes(parsed.ambientVolumes);
          if (typeof parsed.progress === 'number') setPlaybackProgress(parsed.progress);
          setLastSyncTime(new Date());
        } catch (err) {
          console.warn("Storage sync update error:", err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [isPlaying, activeTrack, currentMode, ambientVolumes, playbackProgress]);

  const handleTrackSelect = (track: Track) => {
    setActiveTrack(track);
    setPlaybackProgress(0);
    setIsPlaying(true);
  };

  const totalTrackSeconds = activeTrack ? parseDurationToSeconds(activeTrack.duration) : 300;
  const progressPercent = Math.min(100, (playbackProgress / totalTrackSeconds) * 100);

  return (
    <div className="w-full min-h-screen bg-[#FCF8F2] p-4 pb-40 font-sans text-stone-800">
      {/* Header with Background Sync Badge */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-950 flex items-center gap-2">
            <Music className="w-6 h-6 text-orange-600" /> Adhyatma Amritavani
          </h2>
          <p className="text-xs text-stone-500 mt-1">Unified Spiritual Audio & Meditation Mix Center</p>
        </div>

        {/* Background Sync Live Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-800 dark:text-orange-300 text-[11px] font-bold shadow-xs shrink-0 self-start sm:self-auto">
          <Zap size={13} className={isPlaying ? "text-orange-500 animate-pulse" : "text-stone-400"} />
          <span>बैकग्राउंड सिंक सक्रिय (Background Sync Active)</span>
          {syncStatus === 'syncing' ? (
            <RefreshCw size={11} className="animate-spin text-orange-500 ml-1" />
          ) : (
            <Check size={11} className="text-emerald-600 ml-1" />
          )}
        </div>
      </div>

      {/* Mode Navigation Bar */}
      <div className="flex bg-stone-200/60 p-1 rounded-xl mb-6 gap-1">
        {(['mantra', 'pravachan', 'ambient'] as AudioMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
              currentMode === mode
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {mode === 'mantra' && 'Jap & Mantras'}
            {mode === 'pravachan' && 'Pravachans'}
            {mode === 'ambient' && 'Soundscapes'}
          </button>
        ))}
      </div>

      {/* Primary Panels */}
      <div className="space-y-4">
        {currentMode === 'mantra' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">Sacred Recitations</h3>
            {mantraTracks.map((track) => (
              <div 
                key={track.id} 
                onClick={() => handleTrackSelect(track)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${activeTrack?.id === track.id ? 'bg-orange-50/80 border-orange-200' : 'bg-white border-stone-200'}`}
              >
                <div>
                  <h4 className="font-medium text-sm text-stone-900">{track.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{track.speakerOrType}</p>
                </div>
                <span className="text-xs text-stone-400 font-mono">{track.duration}</span>
              </div>
            ))}
          </div>
        )}

        {currentMode === 'pravachan' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">Acharya Discourses</h3>
            {pravachanTracks.map((track) => (
              <div 
                key={track.id} 
                onClick={() => handleTrackSelect(track)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${activeTrack?.id === track.id ? 'bg-orange-50/80 border-orange-200' : 'bg-white border-stone-200'}`}
              >
                <div>
                  <h4 className="font-medium text-sm text-stone-900">{track.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{track.speakerOrType}</p>
                </div>
                <span className="text-xs text-stone-400 font-mono">{track.duration}</span>
              </div>
            ))}
          </div>
        )}

        {currentMode === 'ambient' && (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2"><Sliders className="w-4 h-4 text-orange-500" /> Preksha Meditative Environment Mixer</h3>
              <p className="text-xs text-stone-500 mt-0.5">Blend continuous background frequencies to lock focus during meditation.</p>
            </div>
            
            <div className="space-y-4">
              {Object.keys(ambientVolumes).map((sound) => (
                <div key={sound} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs capitalize font-medium text-stone-700">
                    <span>{sound === 'om' ? 'Spiritual Drone' : sound}</span>
                    <span className="font-mono text-stone-400">{ambientVolumes[sound as keyof typeof ambientVolumes]}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-stone-400" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={ambientVolumes[sound as keyof typeof ambientVolumes]} 
                      onChange={(e) => setAmbientVolumes({ ...ambientVolumes, [sound]: Number(e.target.value) })}
                      className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Docked Bottom Player Core */}
      <AnimatePresence>
        {activeTrack && (
          <motion.div 
            layout
            className={`fixed left-4 right-4 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-xl overflow-hidden z-50 transition-all ${
              isMaximized ? 'bottom-24 top-4 flex flex-col justify-between p-6' : 'bottom-24 h-16 flex items-center justify-between px-4'
            }`}
          >
            {/* Minimalist Grid Execution Strategy */}
            {!isMaximized ? (
              <>
                <div className="flex items-center gap-3 max-w-[65%]" onClick={() => setIsMaximized(true)}>
                  <Disc className={`w-8 h-8 text-orange-400 shrink-0 ${isPlaying ? 'animate-spin [animation-duration:6s]' : ''}`} />
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate">{activeTrack.title}</p>
                    <p className="text-[10px] text-stone-400 truncate flex items-center gap-1.5">
                      <span>{activeTrack.speakerOrType}</span>
                      <span className="text-stone-600">•</span>
                      <span className="text-orange-400/90 font-mono">{formatSecondsToMMSS(playbackProgress)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-stone-800 hover:bg-stone-700 rounded-full text-orange-400 cursor-pointer">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsMaximized(true)} className="text-stone-400 hover:text-stone-200 cursor-pointer">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Maximized Full Screen Overlay Logic */}
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-widest uppercase font-bold text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded">Now Playing</span>
                    <span className="text-[9px] text-stone-400 font-mono">Sync: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <button onClick={() => setIsMaximized(false)} className="text-stone-400 hover:text-stone-200 p-1 bg-stone-800 rounded-full cursor-pointer">
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center my-auto gap-4">
                  <div className="relative p-8 bg-stone-800/50 rounded-full border border-stone-700/50 shadow-inner">
                    <Radio className={`w-24 h-24 text-orange-500 ${isPlaying ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold tracking-wide">{activeTrack.title}</h3>
                    <p className="text-sm text-stone-400 mt-1">{activeTrack.speakerOrType}</p>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  {/* Live Progress Track Bar */}
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden relative">
                    <div 
                      className="bg-orange-500 h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>{formatSecondsToMMSS(playbackProgress)}</span>
                    <span>{activeTrack.duration}</span>
                  </div>

                  <div className="flex justify-center items-center gap-6 pt-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)} 
                      className="p-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-full transition-all shadow-md shadow-orange-600/20 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
