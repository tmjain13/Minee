import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Disc, Radio, Volume2, Maximize2, Minimize2, Music, Sliders } from 'lucide-react';

type AudioMode = 'mantra' | 'pravachan' | 'ambient';

interface Track {
  id: string;
  title: string;
  speakerOrType: string;
  duration: string;
  url: string;
}

export default function AudioCenter() {
  const [currentMode, setCurrentMode] = useState<AudioMode>('mantra');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track | null>({
    id: 'm1',
    title: 'Bhikhsu Jap Mantra',
    speakerOrType: 'Chant',
    duration: '10:00',
    url: ''
  });
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Ambient Sound Sliders State
  const [ambientVolumes, setAmbientVolumes] = useState({ rain: 40, bells: 20, om: 50 });

  const mantraTracks: Track[] = [
    { id: 'm1', title: 'Bhikhsu Jap Mantra', speakerOrType: 'Chant', duration: '10:00', url: '' },
    { id: 'm2', title: 'Navkar Mahamantra Deep Ambient', speakerOrType: 'Fusion Chanting', duration: '15:45', url: '' }
  ];

  const pravachanTracks: Track[] = [
    { id: 'p1', title: 'Maryada Mahotsav Aadesh', speakerOrType: 'Acharya Mahaprajna', duration: '45:20', url: '' },
    { id: 'p2', title: 'Preksha Dhyan Internal Journey', speakerOrType: 'Acharya Mahashraman', duration: '30:15', url: '' }
  ];

  const handleTrackSelect = (track: Track) => {
    setActiveTrack(track);
    setIsPlaying(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF8F2] p-4 pb-40 font-sans text-stone-800">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-stone-950 flex items-center gap-2">
          <Music className="w-6 h-6 text-orange-600" /> Adhyatma Amritavani
        </h2>
        <p className="text-xs text-stone-500 mt-1">Unified Spiritual Audio & Meditation Mix Center</p>
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
                    <p className="text-[10px] text-stone-400 truncate">{activeTrack.speakerOrType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-stone-800 hover:bg-stone-700 rounded-full text-orange-400">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsMaximized(true)} className="text-stone-400 hover:text-stone-200">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Maximized Full Screen Overlay Logic */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded">Now Playing</span>
                  <button onClick={() => setIsMaximized(false)} className="text-stone-400 hover:text-stone-200 p-1 bg-stone-800 rounded-full">
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
                  {/* Fake Progress Track Bar */}
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`bg-orange-500 h-full w-1/3 ${isPlaying ? 'transition-all duration-1000' : ''}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>03:12</span>
                    <span>{activeTrack.duration}</span>
                  </div>

                  <div className="flex justify-center items-center gap-6 pt-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)} 
                      className="p-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-full transition-all shadow-md shadow-orange-600/20"
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
