import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Volume2, Wind, Eye, Vibrate, ShieldCheck, Sun, Moon, Monitor, Play, Pause, Flower } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  palette: 'default' | 'sunset' | 'ocean' | 'forest';
  onPaletteChange: (palette: 'default' | 'sunset' | 'ocean' | 'forest') => void;
  mantraAudioCueEnabled: boolean;
  onMantraAudioCueChange: (enabled: boolean) => void;
  ambientSoundEnabled: boolean;
  onAmbientSoundChange: (enabled: boolean) => void;
  highContrast: boolean;
  onHighContrastChange: (enabled: boolean) => void;
  autoArchiveEnabled: boolean;
  onAutoArchiveChange: (enabled: boolean) => void;
  vibrationIntensity: 'none' | 'gentle' | 'pulsing' | 'steady';
  onVibrationIntensityChange: (intensity: 'none' | 'gentle' | 'pulsing' | 'steady') => void;
  spiritualSoundscape?: 'om' | 'temple_bells' | 'nature';
  onSpiritualSoundscapeChange?: (type: 'om' | 'temple_bells' | 'nature') => void;
  kfontSize?: number;
  onKfontSizeChange?: (size: number) => void;
  kfontType?: 'sans' | 'serif' | 'mono';
  onKfontTypeChange?: (font: 'sans' | 'serif' | 'mono') => void;
  fontStyleSet?: 'standard' | 'high-readability';
  onFontStyleSetChange?: (style: 'standard' | 'high-readability') => void;
  zenMode?: boolean;
  onZenModeChange?: (enabled: boolean) => void;
}

const PALETTES = [
  { id: 'default', name: 'Spiritual (Default)', color: '#1a1a1a', bg: '#FDFBF7' },
  { id: 'sunset', name: 'Sunset (Warmth)', color: '#4A1E11', bg: '#FFF5F1' },
  { id: 'ocean', name: 'Ocean (Calm)', color: '#002244', bg: '#F0F8FF' },
  { id: 'forest', name: 'Forest (Peace)', color: '#1A331A', bg: '#F1F8F1' },
] as const;

export default function ThemeCustomizer({ 
  isOpen, 
  onClose, 
  theme = 'system',
  onThemeChange,
  palette, 
  onPaletteChange,
  mantraAudioCueEnabled,
  onMantraAudioCueChange,
  ambientSoundEnabled,
  onAmbientSoundChange,
  highContrast,
  onHighContrastChange,
  autoArchiveEnabled,
  onAutoArchiveChange,
  vibrationIntensity,
  onVibrationIntensityChange,
  spiritualSoundscape = 'om',
  onSpiritualSoundscapeChange,
  kfontSize = 15,
  onKfontSizeChange,
  kfontType = 'sans',
  onKfontTypeChange,
  fontStyleSet = 'standard',
  onFontStyleSetChange,
  zenMode = false,
  onZenModeChange
}: ThemeCustomizerProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const savePreferences = async (newPrefs: any) => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        preferences: newPrefs,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Preferences saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save preferences.');
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    // Call the original handlers
    switch (key) {
      case 'theme': onThemeChange?.(value); break;
      case 'palette': onPaletteChange(value); break;
      case 'mantraAudioCue': onMantraAudioCueChange(value); break;
      case 'ambientSound': onAmbientSoundChange(value); break;
      case 'highContrast': onHighContrastChange(value); break;
      case 'autoArchive': onAutoArchiveChange(value); break;
      case 'vibrationIntensity': onVibrationIntensityChange(value); break;
      case 'spiritualSoundscape': onSpiritualSoundscapeChange?.(value); break;
      case 'kfontSize': onKfontSizeChange?.(value); break;
      case 'kfontType': onKfontTypeChange?.(value); break;
      case 'fontStyleSet': onFontStyleSetChange?.(value); break;
      case 'zenMode': onZenModeChange?.(value); break;
    }

    // Save to Firestore
    savePreferences({ [key]: value });
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-5xl mx-auto bg-[var(--card-bg)] border-t border-[var(--border-color)] rounded-t-[2.5rem] z-[201] shadow-2xl p-6 pb-safe overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="serif-text text-2xl font-bold text-[var(--text-spiritual)]">Theme & Preferences</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Select your spiritual atmosphere</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">Appearance Mode</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', name: 'Light', icon: <Sun size={18} /> },
                    { id: 'dark', name: 'Dark', icon: <Moon size={18} /> },
                    { id: 'system', name: 'System Default', icon: <Monitor size={18} /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handlePreferenceChange('theme', m.id)}
                      className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                        theme === m.id
                          ? 'border-spiritual bg-spiritual/5 text-spiritual'
                          : 'border-[var(--border-color)] hover:border-spiritual/30 bg-transparent text-gray-500'
                      }`}
                    >
                      {m.icon}
                      <span className="block font-bold text-xs">{m.name}</span>
                      {theme === m.id && (
                        <motion.div
                          layoutId="active-theme-check"
                          className="absolute -top-2 -right-2 w-6 h-6 bg-spiritual text-[var(--bg-cream)] rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check size={14} strokeWidth={3} />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">Atmosphere Palette</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onPaletteChange(p.id)}
                      className={`relative p-5 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${
                        palette === p.id
                          ? 'border-spiritual bg-spiritual/5'
                          : 'border-[var(--border-color)] hover:border-spiritual/30 bg-transparent'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-2xl shadow-inner flex items-center justify-center border border-black/5"
                        style={{ backgroundColor: p.bg }}
                      >
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-sm text-[var(--text-spiritual)]">{p.name}</span>
                        <span className="block text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Atmosphere</span>
                      </div>
                      {palette === p.id && (
                        <motion.div
                          layoutId="active-check"
                          className="w-6 h-6 bg-spiritual text-[var(--bg-cream)] rounded-full flex items-center justify-center"
                        >
                          <Check size={14} strokeWidth={3} />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">Accessibility & Readability</h4>
                <div className="bg-black/5 dark:bg-white/5 rounded-3xl p-5 border border-black/5 dark:border-white/5 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                        <Eye size={20} />
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-[var(--text-spiritual)]">High Contrast Mode</span>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">WCAG AA Compliant Display</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onHighContrastChange(!highContrast)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${highContrast ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <motion.div
                        animate={{ x: highContrast ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  {/* Zen Focus Mode Toggle */}
                  <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                        <Flower size={20} className={zenMode ? "animate-pulse" : ""} />
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-[var(--text-spiritual)]">
                          {language === 'hi' ? 'ध्यान केंद्रित मोड (Zen Mode)' : 'Zen Focus Mode'}
                        </span>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                          {language === 'hi' ? 'गहरे ध्यान के लिए सेकेंडरी टैब छुपाएं' : 'Hide secondary tabs for deep focus'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onZenModeChange?.(!zenMode)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${zenMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <motion.div
                        animate={{ x: zenMode ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="block font-bold text-sm text-[var(--text-spiritual)]">Font size</span>
                      <span className="text-xs font-black font-mono text-spiritual dark:text-orange-400 bg-spiritual/10 dark:bg-spiritual/20 px-2 py-0.5 rounded-lg">{kfontSize}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400">A</span>
                      <input
                        type="range"
                        min="13"
                        max="26"
                        value={kfontSize}
                        onChange={(e) => onKfontSizeChange?.(Number(e.target.value))}
                        className="flex-1 accent-spiritual cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10 appearance-auto"
                      />
                      <span className="text-base font-black text-gray-450">A</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="block font-bold text-sm text-[var(--text-spiritual)]">Font Family</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kfontType}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5">
                      {([
                        { id: 'sans', name: 'Sans (Modern)', class: 'font-sans' },
                        { id: 'serif', name: 'Serif (Traditional)', class: 'font-serif' },
                        { id: 'mono', name: 'Mono (Analytical)', class: 'font-mono' }
                      ] as const).map((font) => (
                        <button
                          key={font.id}
                          onClick={() => onKfontTypeChange?.(font.id)}
                          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                            kfontType === font.id
                              ? 'bg-spiritual text-white shadow-sm'
                              : 'text-gray-450 hover:text-gray-700 dark:hover:text-gray-250'
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-tight ${font.class}`}>{font.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="block font-bold text-sm text-[var(--text-spiritual)]">Accessibility Font Set</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {fontStyleSet === 'high-readability' ? 'System' : 'Inter/Cormorant'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5">
                      <button
                        onClick={() => onFontStyleSetChange?.('standard')}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                          fontStyleSet === 'standard'
                            ? 'bg-spiritual text-white shadow-sm'
                            : 'text-gray-450 hover:text-gray-700 dark:hover:text-gray-250'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-tight">Inter/Cormorant</span>
                      </button>
                      <button
                        onClick={() => onFontStyleSetChange?.('high-readability')}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                          fontStyleSet === 'high-readability'
                            ? 'bg-spiritual text-white shadow-sm'
                            : 'text-gray-450 hover:text-gray-700 dark:hover:text-gray-250'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-tight">High-Readability</span>
                      </button>
                    </div>
                  </div>
                    {/* Live Interactive Preview Area */}
                    <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 text-left">
                      <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 px-1">Live Interactive Preview</span>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {previewTexts.map((item, index) => (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => setActivePreviewIndex(index)}
                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${
                              activePreviewIndex === index
                                ? 'bg-spiritual text-white'
                                : 'bg-black/5 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>

                      <div 
                        className="p-5 rounded-2xl border border-black/5 transition-all text-center relative overflow-hidden"
                        style={{ 
                          backgroundColor: activePalette.bg, 
                          color: activePalette.color,
                          minHeight: '110px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <p 
                          className={`font-${kfontType} leading-relaxed font-semibold transition-all`}
                          style={{ fontSize: `${kfontSize}px` }}
                        >
                          {previewTexts[activePreviewIndex].text}
                        </p>
                        
                        {/* Tiny badge indicating typeface and details */}
                        <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/5 text-[7px] font-bold uppercase tracking-wider opacity-60">
                          {activePalette.name} • {kfontType} • {kfontSize}px
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">Sadhana Preferences</h4>
                <div className="bg-black/5 dark:bg-white/5 rounded-3xl p-5 border border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-spiritual/10 rounded-2xl text-spiritual">
                        <Volume2 size={20} />
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-[var(--text-spiritual)]">Mantra Audio Cue</span>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Play sound every 108 recitations</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onMantraAudioCueChange(!mantraAudioCueEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${mantraAudioCueEnabled ? 'bg-spiritual' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <motion.div
                        animate={{ x: mantraAudioCueEnabled ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                          <Wind size={20} />
                        </div>
                        <div>
                          <span className="block font-bold text-sm text-[var(--text-spiritual)]">Spiritual Soundscapes</span>
                          <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Vedic chants & focus sounds when Samayik is active</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onAmbientSoundChange(!ambientSoundEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${ambientSoundEnabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        id="spiritual-soundscape-toggle"
                        title="Toggle ambient sounds"
                      >
                        <motion.div
                          animate={{ x: ambientSoundEnabled ? 26 : 4 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>

                    {ambientSoundEnabled && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5"
                        id="spiritual-soundscape-selector"
                      >
                        {([
                          { id: 'om', name: 'Om Chanting', desc: 'Resonant drone' },
                          { id: 'temple_bells', name: 'Temple Bells', desc: 'Peaceful chimes' },
                          { id: 'nature', name: 'Nature Sounds', desc: 'Calming forest' }
                        ] as const).map((sound) => (
                          <button
                            key={sound.id}
                            className={`p-3 rounded-xl flex flex-col items-center text-center justify-center transition-all ${
                              spiritualSoundscape === sound.id
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                            id={`soundscape-select-${sound.id}`}
                            title={`Select ${sound.name}`}
                          >
                            <div className="flex justify-between w-full mb-1">
                              <span className="text-[8px] font-bold uppercase opacity-75">{sound.desc}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePreview(sound.id);
                                }}
                                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                                title="Preview sound"
                              >
                                {previewing === sound.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              </button>
                            </div>
                            <span onClick={() => onSpiritualSoundscapeChange?.(sound.id)} className="font-bold text-xs w-full block">{sound.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-[var(--text-spiritual)]">Auto-Archive Logs</span>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Purge fasting data older than 90d</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onAutoArchiveChange(!autoArchiveEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${autoArchiveEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <motion.div
                        animate={{ x: autoArchiveEnabled ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                          <Vibrate size={20} />
                        </div>
                        <div>
                          <span className="block font-bold text-sm text-[var(--text-spiritual)]">Haptic Feedback</span>
                          <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Vibration on Mantra counts</span>
                        </div>
                      </div>
                      <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                        {(['none', 'gentle', 'pulsing', 'steady'] as const).map((intensity) => (
                          <button
                            key={intensity}
                            onClick={() => onVibrationIntensityChange(intensity)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              vibrationIntensity === intensity
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                          >
                            {intensity}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-gray-400 italic mt-8 px-8">
              "The color of your mind determines the color of your world. Choose a palette that reflects your current spiritual journey."
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
