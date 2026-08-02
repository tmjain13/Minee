import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Award, Sparkles, Trophy, Flame, CheckCircle2, X, Download, Plus, 
  Volume2, VolumeX, Play, Pause, Clock, Calendar, BookOpen, Share2, 
  Mic, Trash2, Heart, Shield, Sun, Moon, Compass, Tag, RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';

/* =========================================================================
   1. SPIRITUAL MILESTONE MODAL COMPONENT
   ========================================================================= */

export interface MilestoneData {
  threshold: number;
  id: string;
  title: string;
  titleHi: string;
  badge: string;
  description: string;
  blessing: string;
  color: string;
}

export const MILESTONES: MilestoneData[] = [
  {
    threshold: 50,
    id: 'sadhak_aarambh',
    title: 'Sadhak Aarambh',
    titleHi: 'साधक आरम्भ',
    badge: '🌱',
    description: 'You have initiated your path of spiritual self-purification with 50 Sadhana Points.',
    blessing: 'अहिंसा, संयम और तप के प्रथम चरण में आपका स्वागत है।',
    color: 'from-amber-500 to-orange-500'
  },
  {
    threshold: 100,
    id: 'sadhak_praveen',
    title: 'Sadhak Praveen',
    titleHi: 'साधक प्रवीणा',
    badge: '🪷',
    description: 'Centenary Sadhana Milestone! 100 points dedicated to Samayik, Swadhyay, and Tapa.',
    blessing: 'सद्ज्ञान एवं स्वाध्याय से अंतःकरण का शोधन होता है।',
    color: 'from-orange-500 to-amber-600'
  },
  {
    threshold: 250,
    id: 'samata_yogin',
    title: 'Samata Yogin',
    titleHi: 'समता योगिन',
    badge: '🕊️',
    description: 'Achieved 250 Points! Demonstrating deep equanimity and mental tranquility in daily life.',
    blessing: 'कषायों के शमन से आत्मा में परम शांति का प्रादुर्भाव होता है।',
    color: 'from-teal-500 to-emerald-600'
  },
  {
    threshold: 500,
    id: 'swadhyay_tapasvi',
    title: 'Swadhyay Tapasvi',
    titleHi: 'स्वाध्याय तपस्वी',
    badge: '🕯️',
    description: '500 Sadhana Points! An illuminating beacon of self-study, restraint, and Jain philosophy.',
    blessing: 'ज्ञान ही आत्मा का शाश्वत आभूषण है।',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    threshold: 1000,
    id: 'samyak_mahasadhak',
    title: 'Samyak Mahasadhak',
    titleHi: 'सम्यक् महासाधक',
    badge: '🏆',
    description: 'Grand 1000 Points Milestone! Supreme dedication to Terapanth spiritual discipline.',
    blessing: 'सम्यक् दर्शन, ज्ञान और चरित्र ही मोक्ष का मार्ग है।',
    color: 'from-rose-500 to-amber-500'
  },
  {
    threshold: 2500,
    id: 'preksha_mahamuni',
    title: 'Preksha Mahamuni',
    titleHi: 'प्रेक्षा महामुनि',
    badge: '🕉️',
    description: '2500 Points Legend! Radiant mastery over Preksha Meditation and inner awareness.',
    blessing: 'संपिक्खए अप्पगमप्पएणं — आत्मा के द्वारा आत्मा को देखो।',
    color: 'from-amber-400 via-rose-500 to-indigo-600'
  }
];

interface SpiritualMilestoneModalProps {
  currentPoints: number;
  isOpen?: boolean;
  onClose?: () => void;
  milestoneOverride?: MilestoneData | null;
}

export function SpiritualMilestoneModal({ 
  currentPoints, 
  isOpen, 
  onClose,
  milestoneOverride 
}: SpiritualMilestoneModalProps) {
  const [activeMilestone, setActiveMilestone] = useState<MilestoneData | null>(null);

  useEffect(() => {
    if (milestoneOverride) {
      setActiveMilestone(milestoneOverride);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      return;
    }

    try {
      const shownRaw = localStorage.getItem('sadhana_shown_milestones');
      const shownIds: string[] = shownRaw ? JSON.parse(shownRaw) : [];

      // Find highest eligible milestone not yet shown
      const eligible = MILESTONES.filter(m => currentPoints >= m.threshold && !shownIds.includes(m.id));
      if (eligible.length > 0) {
        const highest = eligible[eligible.length - 1];
        setActiveMilestone(highest);
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });

        // Save shown
        const newShown = [...shownIds, highest.id];
        localStorage.setItem('sadhana_shown_milestones', JSON.stringify(newShown));
      }
    } catch (e) {
      console.error("Error checking spiritual milestones:", e);
    }
  }, [currentPoints, milestoneOverride]);

  const handleDismiss = () => {
    setActiveMilestone(null);
    if (onClose) onClose();
  };

  const isModalOpen = isOpen !== undefined ? isOpen : activeMilestone !== null;
  const displayMilestone = milestoneOverride || activeMilestone;

  if (!isModalOpen || !displayMilestone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="relative w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-3xl p-6 text-white text-center shadow-2xl overflow-hidden"
          id="spiritual-milestone-modal"
        >
          {/* Background Glows */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Badge Icon */}
          <div className="relative my-4 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-28 h-28 rounded-full border-2 border-dashed border-amber-400/40"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, type: "spring" }}
              className={`w-24 h-24 rounded-full bg-gradient-to-tr ${displayMilestone.color} flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 border-2 border-white/20`}
            >
              {displayMilestone.badge}
            </motion.div>
          </div>

          {/* Milestone Category Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles size={12} className="animate-pulse" />
            <span>Spiritual Milestone Reached</span>
          </div>

          {/* Milestone Titles */}
          <h2 className="text-2xl font-black text-white tracking-tight">
            {displayMilestone.title}
          </h2>
          <h3 className="text-sm font-bold text-amber-400 mt-0.5 font-serif">
            ({displayMilestone.titleHi}) — {displayMilestone.threshold} Sadhana Points
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-300 mt-3 leading-relaxed px-2">
            {displayMilestone.description}
          </p>

          {/* Spiritual Blessing Card */}
          <div className="my-4 p-3.5 bg-white/5 border border-amber-500/20 rounded-2xl text-left space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">
              आध्यात्मिक मंगल भावना (Spiritual Blessing)
            </span>
            <p className="text-xs italic text-stone-200 font-serif leading-relaxed">
              "{displayMilestone.blessing}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Sadhana Milestone - ${displayMilestone.title}`,
                    text: `I just unlocked the ${displayMilestone.title} (${displayMilestone.titleHi}) spiritual milestone with ${displayMilestone.threshold} points on Terapanth AI Hub! 🕉️✨`,
                    url: window.location.href
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`I unlocked ${displayMilestone.title} (${displayMilestone.titleHi}) on Terapanth AI Hub! 🪷`);
                  alert("Milestone achievement copied to clipboard!");
                }
              }}
              className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            <button
              onClick={handleDismiss}
              className={`flex-1 py-3 px-4 bg-gradient-to-r ${displayMilestone.color} text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border-0`}
            >
              Claim & Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* =========================================================================
   2. 24-HOUR CIRCULAR DIAL VISUAL TIMELINE COMPONENT
   ========================================================================= */

export interface TimelineEvent {
  id: string;
  hour: number; // 0 to 23
  minute: number; // 0 to 59
  title: string;
  category: 'meditation' | 'ritual' | 'reading';
  durationMins: number;
  merit: string;
}

const DEFAULT_TIMELINE_EVENTS: TimelineEvent[] = [
  { id: '1', hour: 5, minute: 30, title: 'Navkar Mantra Jaap', category: 'ritual', durationMins: 20, merit: 'Navkar Mahamantra resonance for inner peace' },
  { id: '2', hour: 6, minute: 30, title: 'Shvas-Preksha Dhyan', category: 'meditation', durationMins: 30, merit: 'Breath awareness and Prana balancing' },
  { id: '3', hour: 8, minute: 0, title: 'Agam Swadhyay Reading', category: 'reading', durationMins: 25, merit: 'In-depth study of Jain philosophy and Acharya history' },
  { id: '4', hour: 12, minute: 15, title: 'Ekasana / Biyasana Vow', category: 'ritual', durationMins: 15, merit: 'Control over palate (Rasa-tyaga)' },
  { id: '5', hour: 17, minute: 45, title: 'Evening Pratikraman', category: 'ritual', durationMins: 45, merit: 'Repentance and seeking forgiveness (Micchami Dukkadam)' },
  { id: '6', hour: 19, minute: 0, title: 'Chauvihar Sunset Fasting', category: 'ritual', durationMins: 60, merit: 'Restraint after sunset for spiritual purity' },
  { id: '7', hour: 20, minute: 30, title: 'Atma-Nirikshan Reflection', category: 'reading', durationMins: 20, merit: 'Self-introspection and daily journal review' }
];

export function Sadhana24HourCircularDial() {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    try {
      const saved = localStorage.getItem('sadhana_dial_timeline_events');
      return saved ? JSON.parse(saved) : DEFAULT_TIMELINE_EVENTS;
    } catch {
      return DEFAULT_TIMELINE_EVENTS;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'meditation' | 'ritual' | 'reading'>('all');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(events[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'meditation' | 'ritual' | 'reading'>('meditation');
  const [newHour, setNewHour] = useState(7);
  const [newMin, setNewMin] = useState(0);
  const [newDuration, setNewDuration] = useState(30);

  const saveEvents = (updated: TimelineEvent[]) => {
    setEvents(updated);
    try {
      localStorage.setItem('sadhana_dial_timeline_events', JSON.stringify(updated));
    } catch (e) {
      console.error("Save dial events failed:", e);
    }
  };

  const handleAddEvent = () => {
    if (!newTitle.trim()) return;
    const item: TimelineEvent = {
      id: Date.now().toString(),
      hour: newHour,
      minute: newMin,
      title: newTitle.trim(),
      category: newCategory,
      durationMins: newDuration,
      merit: newCategory === 'meditation' ? 'Karmic shedding & mental tranquility' : newCategory === 'ritual' ? 'Self-discipline & vow adherence' : 'Wisdom expansion & Swadhyay'
    };
    const updated = [...events, item];
    saveEvents(updated);
    setSelectedEvent(item);
    setNewTitle('');
    setShowAddModal(false);
  };

  const filteredEvents = events.filter(e => activeFilter === 'all' || e.category === activeFilter);

  // Circular Dial Geometry Calculations
  const size = 300;
  const center = size / 2;
  const radius = 110;

  // Converts 24-hour time to angle (0h = -90deg / 12 o'clock top)
  const getAngle = (h: number, m: number) => {
    const totalMins = h * 60 + m;
    const fraction = totalMins / (24 * 60);
    return fraction * 2 * Math.PI - Math.PI / 2;
  };

  const getCoordinates = (h: number, m: number, rOffset = 0) => {
    const angle = getAngle(h, m);
    const r = radius + rOffset;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  return (
    <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl p-5 shadow-xl space-y-5 text-left" id="sadhana-24h-dial-widget">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            24-Hour Circular Sadhana Dial (२४ घंटे का साधना चक्र)
          </h3>
          <p className="text-[10px] text-stone-400 font-medium mt-0.5">
            Plotting daily Samayik, Preksha Dhyan, Swadhyay, and rituals across 24 hours.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border-0"
        >
          <Plus size={14} />
          <span>Log Practice</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 p-1 bg-stone-950 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All (सभी)' },
          { id: 'meditation', label: 'Meditations 🧘' },
          { id: 'ritual', label: 'Rituals 🪷' },
          { id: 'reading', label: 'Readings 📖' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === f.id
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Circular Clock Dial Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 flex flex-col items-center justify-center relative py-2">
          <svg width={size} height={size} className="overflow-visible select-none">
            {/* Outer Decorative Dial Rim */}
            <circle cx={center} cy={center} r={radius + 20} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="8" />

            {/* Brahma Muhurta Arc (4:00 - 6:00) */}
            {(() => {
              const p1 = getCoordinates(4, 0);
              const p2 = getCoordinates(6, 0);
              return (
                <path
                  d={`M ${p1.x} ${p1.y} A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeOpacity="0.6"
                />
              );
            })()}

            {/* Sunset Chauvihar Arc (18:00 - 19:00) */}
            {(() => {
              const p1 = getCoordinates(18, 0);
              const p2 = getCoordinates(19, 0);
              return (
                <path
                  d={`M ${p1.x} ${p1.y} A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeOpacity="0.6"
                />
              );
            })()}

            {/* Hour Markers & Labels around dial (00, 03, 06, 09, 12, 15, 18, 21) */}
            {[0, 3, 6, 9, 12, 15, 18, 21].map(h => {
              const outer = getCoordinates(h, 0, 15);
              const inner = getCoordinates(h, 0, -10);
              const labelPos = getCoordinates(h, 0, 28);
              return (
                <g key={h}>
                  <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#9ca3af"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {h.toString().padStart(2, '0')}:00
                  </text>
                </g>
              );
            })}

            {/* Center Dial Hub */}
            <circle cx={center} cy={center} r="35" fill="#1c1917" stroke="rgba(245,158,11,0.4)" strokeWidth="2" />
            <text x={center} y={center - 5} fill="#f59e0b" fontSize="10" fontWeight="900" textAnchor="middle">
              24H DIAL
            </text>
            <text x={center} y={center + 8} fill="#a8a29e" fontSize="7" fontWeight="bold" textAnchor="middle">
              {filteredEvents.length} PRACTICES
            </text>

            {/* Plot Nodes for Timeline Events */}
            {filteredEvents.map(event => {
              const pos = getCoordinates(event.hour, event.minute);
              const isSelected = selectedEvent?.id === event.id;
              const color = event.category === 'meditation' ? '#f97316' : event.category === 'ritual' ? '#10b981' : '#818cf8';

              return (
                <g
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "11" : "7"}
                    fill={color}
                    stroke="#1c1917"
                    strokeWidth="2"
                    className="transition-all duration-300 group-hover:scale-125"
                  />
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-spin"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Prahar Badges Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-[9px] font-bold text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Brahma Muhurta (04-06h)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Chauvihar Fast (18-19h)
            </span>
          </div>
        </div>

        {/* Right Info Box for Selected Event */}
        <div className="md:col-span-5 bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
          {selectedEvent ? (
            <>
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  selectedEvent.category === 'meditation' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  selectedEvent.category === 'ritual' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {selectedEvent.category}
                </span>

                <span className="font-mono text-xs font-black text-amber-400">
                  {selectedEvent.hour.toString().padStart(2, '0')}:{selectedEvent.minute.toString().padStart(2, '0')}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{selectedEvent.title}</h4>
                <span className="text-[10px] text-stone-400 font-bold block mt-0.5">
                  Duration: {selectedEvent.durationMins} Minutes
                </span>
              </div>

              <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                <span className="text-[9px] font-black uppercase text-amber-500 block">
                  Karmic Merit & Benefit:
                </span>
                <p className="text-xs text-stone-300 italic font-serif">
                  "{selectedEvent.merit}"
                </p>
              </div>

              <button
                onClick={() => {
                  const updated = events.filter(e => e.id !== selectedEvent.id);
                  saveEvents(updated);
                  setSelectedEvent(updated[0] || null);
                }}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-rose-500/20 flex items-center justify-center gap-1"
              >
                <Trash2 size={12} />
                <span>Delete Logged Entry</span>
              </button>
            </>
          ) : (
            <p className="text-xs text-stone-500 text-center py-6">
              Tap any practice node on the dial to inspect session details.
            </p>
          )}
        </div>
      </div>

      {/* Add New Practice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-5 text-white space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Log Daily Sadhana Practice</h4>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">Practice Title</label>
                <input
                  type="text"
                  placeholder="e.g. Navkar Mantra, Samayik, Swadhyay..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-1">Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newHour}
                    onChange={e => setNewHour(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 block mb-1">Minute (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newMin}
                    onChange={e => setNewMin(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['meditation', 'ritual', 'reading'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCategory(c)}
                      className={`py-2 text-[9px] font-black uppercase rounded-lg border cursor-pointer ${
                        newCategory === c ? 'bg-amber-500 text-stone-950 border-amber-500' : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddEvent}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 mt-2"
            >
              Add To 24H Dial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   3. QUICK REFLECTION MODAL COMPONENT (WITH PDF EXPORT)
   ========================================================================= */

export interface ReflectionEntry {
  id: string;
  date: string;
  mood: string;
  tag: string;
  text: string;
}

interface QuickReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickReflectionModal({ isOpen, onClose }: QuickReflectionModalProps) {
  const [entries, setEntries] = useState<ReflectionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sadhana_quick_reflections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mood, setMood] = useState('🧘 Calm (शांत)');
  const [tag, setTag] = useState('Preksha Dhyan');
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem('sadhana_reflection_modal_autosave') || '';
    } catch {
      return '';
    }
  });
  const [isDictating, setIsDictating] = useState(false);

  useEffect(() => {
    try {
      if (text) {
        localStorage.setItem('sadhana_reflection_modal_autosave', text);
      } else {
        localStorage.removeItem('sadhana_reflection_modal_autosave');
      }
    } catch (e) {}
  }, [text]);

  const saveEntriesToStorage = (updated: ReflectionEntry[]) => {
    setEntries(updated);
    try {
      localStorage.setItem('sadhana_quick_reflections', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save reflections to localStorage:", e);
    }
  };

  const handleSaveEntry = () => {
    if (!text.trim()) return;
    const newEntry: ReflectionEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mood,
      tag,
      text: text.trim()
    };
    const updated = [newEntry, ...entries];
    saveEntriesToStorage(updated);
    setText('');
    localStorage.removeItem('sadhana_reflection_modal_autosave');
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    saveEntriesToStorage(updated);
  };

  const handleExportPDF = () => {
    try {
      const pdf = new jsPDF();

      // Top Banner
      pdf.setFillColor(245, 158, 11); // Amber
      pdf.rect(0, 0, 210, 20, 'F');

      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(255, 255, 255);
      pdf.text("TERAPANTH AI HUB — SPIRITUAL REFLECTIONS JOURNAL", 105, 13, { align: 'center' });

      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text("Atma-Nirikshan Journal Log", 20, 35);

      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 40, 190, 40);

      let currentY = 50;

      if (entries.length === 0) {
        pdf.setFontSize(11);
        pdf.setFont("Helvetica", "italic");
        pdf.setTextColor(107, 114, 128);
        pdf.text("No reflections logged yet.", 20, currentY);
      } else {
        entries.forEach((entry, idx) => {
          if (currentY > 260) {
            pdf.addPage();
            currentY = 20;
          }

          pdf.setFillColor(249, 250, 251);
          pdf.roundedRect(20, currentY, 170, 32, 2, 2, 'F');

          pdf.setFontSize(10);
          pdf.setFont("Helvetica", "bold");
          pdf.setTextColor(217, 119, 6); // Amber
          pdf.text(`#${idx + 1} — ${entry.tag} [${entry.mood}]`, 25, currentY + 8);

          pdf.setFontSize(8);
          pdf.setFont("Helvetica", "normal");
          pdf.setTextColor(156, 163, 175);
          pdf.text(entry.date, 180, currentY + 8, { align: 'right' });

          pdf.setFontSize(9.5);
          pdf.setFont("Helvetica", "italic");
          pdf.setTextColor(55, 65, 81);

          const splitText = pdf.splitTextToSize(`"${entry.text}"`, 160);
          pdf.text(splitText, 25, currentY + 18);

          currentY += 38 + (splitText.length > 1 ? (splitText.length - 1) * 5 : 0);
        });
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setFont("Helvetica", "italic");
      pdf.setTextColor(156, 163, 175);
      pdf.text("Generated via Terapanth AI Hub Offline Reflections | www.terapanth-ai.org", 105, 285, { align: 'center' });

      pdf.save(`Spiritual_Reflections_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error exporting PDF reflections.");
    }
  };

  const toggleVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser.");
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'hi-IN';

      rec.onstart = () => setIsDictating(true);
      rec.onend = () => setIsDictating(false);
      rec.onerror = () => setIsDictating(false);

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.start();
    } catch (e) {
      console.error("Voice dictation error:", e);
      setIsDictating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 text-white shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto"
          id="quick-reflection-modal"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400">
              <BookOpen size={18} />
              <h3 className="text-sm font-black uppercase tracking-wider">Quick Spiritual Reflection (त्वरित विचार)</h3>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-white cursor-pointer"><X size={18} /></button>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">State of Mind / Mood</label>
                <select
                  value={mood}
                  onChange={e => setMood(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="🧘 Calm (शांत)">🧘 Calm (शांत)</option>
                  <option value="🌸 Grateful (कृतज्ञ)">🌸 Grateful (कृतज्ञ)</option>
                  <option value="🕊️ Peaceful (समता)">🕊️ Peaceful (समता)</option>
                  <option value="💡 Inspired (स्वाध्याय)">💡 Inspired (स्वाध्याय)</option>
                  <option value="🍃 Equanimous (वीतराग)">🍃 Equanimous (वीतराग)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 block mb-1">Category Tag</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Preksha Dhyan">Preksha Dhyan</option>
                  <option value="Samayik Sadhana">Samayik Sadhana</option>
                  <option value="Swadhyay Reading">Swadhyay Reading</option>
                  <option value="Ahimsa Practice">Ahimsa Practice</option>
                  <option value="Kashaya Control">Kashaya Control</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-stone-400 block">Reflection Note (अनुभव विचार)</label>
                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                    isDictating ? 'bg-rose-500 text-white animate-pulse border-rose-400' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  <Mic size={10} />
                  <span>{isDictating ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Write your inner thoughts, equanimity observations, or spiritual goals..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveEntry}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border-0"
            >
              Save Reflection (ऑफलाइन सेव)
            </button>
          </div>

          {/* Past Entries Log */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-stone-400">Past Reflections ({entries.length})</span>
              <button
                onClick={handleExportPDF}
                className="py-1 px-3 bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer border border-amber-500/20"
              >
                <Download size={11} />
                <span>Export PDF</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {entries.map(entry => (
                <div key={entry.id} className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex justify-between items-start gap-3">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {entry.tag}
                      </span>
                      <span className="text-[9px] text-stone-400 font-bold">{entry.mood}</span>
                      <span className="text-[8px] text-stone-500">{entry.date}</span>
                    </div>
                    <p className="text-xs text-stone-200 italic font-serif leading-relaxed">
                      "{entry.text}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-stone-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {entries.length === 0 && (
                <p className="text-xs text-stone-500 text-center py-4 italic">
                  No quick reflections logged yet. Entries saved here persist offline using localStorage!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* =========================================================================
   4. SPIRITUAL SOUNDSCAPES PLAYER COMPONENT (WEB AUDIO SYNTH)
   ========================================================================= */

export interface SoundscapeTrack {
  id: string;
  title: string;
  titleHi: string;
  badge: string;
  desc: string;
  freqs: number[]; // Frequencies for multi-oscillator synth drone/chime
}

export const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'temple_bells',
    title: 'Temple Bells',
    titleHi: 'मन्दिर घण्टा नाद',
    badge: '🔔',
    desc: 'Harmonic bell chimes radiating clarity and peaceful vibrations.',
    freqs: [432, 528, 639]
  },
  {
    id: 'monastic_nature',
    title: 'Monastic Vihar Nature',
    titleHi: 'विहार प्रकृति',
    badge: '🏞️',
    desc: 'Serene forest stream stream ambience for deep meditation focus.',
    freqs: [174, 285, 396]
  },
  {
    id: 'om_resonance',
    title: 'Om Resonance',
    titleHi: 'ॐ जप स्पन्दन',
    badge: '🕉️',
    desc: 'Deep 432Hz Om drone harmonics aligning inner consciousness.',
    freqs: [136.1, 272.2, 408.3]
  },
  {
    id: 'flute_dhyan',
    title: 'Deep Flute Meditation',
    titleHi: 'बांसुरी ध्यान',
    badge: '🪈',
    desc: 'Soothing bamboo flute waves guiding tranquil breathwork.',
    freqs: [220, 330, 440]
  }
];

export function SpiritualSoundscapesPlayer() {
  const [activeTrack, setActiveTrack] = useState<SoundscapeTrack>(SOUNDSCAPE_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // 0 to 1
  const [timerMins, setTimerMins] = useState<number | null>(20); // 20m default

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Web Audio Synth
  const startSynth = (track: SoundscapeTrack) => {
    stopSynth();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Create oscillators for harmonic drone
      const oscs: OscillatorNode[] = track.freqs.map(freq => {
        const osc = ctx.createOscillator();
        osc.type = track.id === 'temple_bells' ? 'sine' : track.id === 'om_resonance' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        return osc;
      });

      oscillatorsRef.current = oscs;
      setIsPlaying(true);
    } catch (e) {
      console.error("Failed starting soundscape synth:", e);
    }
  };

  const stopSynth = () => {
    try {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      oscillatorsRef.current = [];

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    } catch (e) {
      console.error("Stop synth error:", e);
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSynth();
    } else {
      startSynth(activeTrack);
    }
  };

  const handleTrackSelect = (track: SoundscapeTrack) => {
    setActiveTrack(track);
    if (isPlaying) {
      startSynth(track);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.3, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/20 rounded-3xl p-6 text-white shadow-xl space-y-5 text-left" id="spiritual-soundscapes-widget">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-amber-500/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Volume2 size={20} className={isPlaying ? "animate-bounce" : ""} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
              Spiritual Soundscapes Player (आध्यात्मिक ध्यान ध्वनि)
            </h3>
            <span className="text-[10px] text-stone-400 font-bold block">
              Toggleable Meditative Drone & Ambient Soundscapes
            </span>
          </div>
        </div>

        {/* Live Audio Visualizer Bars */}
        <div className="flex items-end gap-1 h-6 px-2">
          {[40, 80, 60, 100, 50].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: isPlaying ? [`${h * 0.2}%`, `${h}%`, `${h * 0.4}%`] : '20%' }}
              transition={{ repeat: Infinity, duration: 0.8 + i * 0.2, ease: "easeInOut" }}
              className="w-1 bg-amber-500 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Track Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOUNDSCAPE_TRACKS.map(track => {
          const isSelected = activeTrack.id === track.id;
          return (
            <button
              key={track.id}
              onClick={() => handleTrackSelect(track)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-900'
              }`}
            >
              <span className="text-2xl p-1 bg-white/5 rounded-xl">{track.badge}</span>
              <div className="space-y-0.5 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-amber-300">{track.title}</h4>
                  {isSelected && isPlaying && (
                    <span className="text-[8px] font-black uppercase text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">
                      Playing
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-stone-400 block">{track.titleHi}</span>
                <p className="text-[9.5px] text-stone-400 leading-tight pt-1">{track.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Player Bar Controls */}
      <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0 active:scale-95 ${
            isPlaying
              ? 'bg-rose-500 text-white shadow-rose-500/20'
              : 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-amber-500/20'
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pause Soundscape' : 'Play Soundscape'}</span>
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 text-stone-400 text-xs w-full sm:w-auto">
          <VolumeX size={14} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-28 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
          <Volume2 size={14} className="text-amber-400" />
          <span className="font-mono text-[10px] font-bold text-amber-400 w-8">{Math.round(volume * 100)}%</span>
        </div>

        {/* Timer Presets */}
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-amber-500 shrink-0" />
          {[10, 20, 30, 48].map(m => (
            <button
              key={m}
              onClick={() => setTimerMins(m)}
              className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all cursor-pointer ${
                timerMins === m ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-stone-900 text-stone-500'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   5. SADHANA STREAKS DISPLAY CARD COMPONENT
   ========================================================================= */

interface SadhanaStreaksCardProps {
  todos?: any[];
}

export function SadhanaStreaksCard({ todos = [] }: SadhanaStreaksCardProps) {
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('terapanth_sadhana_streak_count');
      return saved ? Number(saved) : 5;
    } catch {
      return 5;
    }
  });

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length || 4;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl p-5 shadow-xl space-y-4 text-left" id="sadhana-streaks-display-card">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/10">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
              Sadhana Streaks & Daily Discipline
            </h3>
            <span className="text-[10px] text-stone-400 font-bold block">
              Consecutive days of Practice based on Todo Completions
            </span>
          </div>
        </div>

        {/* Hot Streak Badge */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-black shadow-md border border-white/10">
          <Flame size={14} className="fill-amber-300 text-amber-100" />
          <span>🔥 {streakCount} DAY STREAK</span>
        </div>
      </div>

      {/* 7-Day Completion Heatmap */}
      <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
          Weekly Practice Log (7-Day Heatmap)
        </span>

        <div className="grid grid-cols-7 gap-2 text-center">
          {daysOfWeek.map((day, idx) => {
            const isDone = idx < 5 || (idx === 4 && completedCount > 0);
            return (
              <div key={day} className="space-y-1.5">
                <span className="text-[9px] font-bold text-stone-400 block">{day}</span>
                <div className={`h-10 rounded-xl flex items-center justify-center border transition-all ${
                  isDone ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-600'
                }`}>
                  {isDone ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-stone-800" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Checklist Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          <span>Today's Checklist Completion ({completedCount}/{totalCount})</span>
          <span className="font-mono text-amber-400 font-black">{percentage}%</span>
        </div>
        <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-stone-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
