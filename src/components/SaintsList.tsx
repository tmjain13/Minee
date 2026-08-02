import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Users, MapPin, Phone, Share2, Copy, Check, Heart, ShieldCheck, 
  Star, LayoutGrid, List, ChevronDown, ChevronUp, BookOpen, Sparkles, 
  Calendar, Award, Quote, GraduationCap, X, Volume2, VolumeX, Play, Pause, 
  Square, Clock, Globe, Send, Scale, Plus, Layers, ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ACHARYAS, YUVACHARYA, Acharya } from '../data/acharyas';
import { viharPravasTodayData } from '../data/viharPravasToday';
import LotusLogo from './LotusLogo';

const allAcharyasList: Acharya[] = [...ACHARYAS, YUVACHARYA];

const formatContacts = (contactPerson?: string, contact?: string | null, contacts?: Record<string, string>) => {
  if (contacts && Object.keys(contacts).length > 0) {
    return Object.entries(contacts).map(([person, phone]) => ({
      designation: person.replace(/_/g, ' ') || 'प्रभारी',
      phone: phone
    }));
  }
  if (!contact) return [];
  return [{ designation: contactPerson || 'प्रभारी', phone: contact }];
};

const mappedDelhiSaintsList = viharPravasTodayData.regions.Delhi_NCR.map((saint, index) => {
  const nameMap: Record<string, { title: string, nameHi: string }> = {
    "munishrivimalkumarji": { title: "शासनश्री", nameHi: "मुनिश्री विमल कुमारजी" },
    "munishriuditkumarji": { title: "बहुश्रुत", nameHi: "मुनिश्री उदित कुमार जी" },
    "munishrijaykumarji": { title: "", nameHi: "मुनिश्री जय कुमार जी" },
    "drmunishriabhijitkumarji": { title: "डा.", nameHi: "मुनिश्री अभिजित कुमार जी" },
    "sadhvishrisanghmitraji": { title: "शासनश्री", nameHi: "साध्वीश्री संघमित्राजी" },
    "sadhvishrisuvrataji": { title: "शासनश्री", nameHi: "साध्वीश्री सुव्रता जी" },
    "sadhvishrisumanshriji": { title: "शासनश्री", nameHi: "साध्वीश्री सुमनश्री जी" },
    "sadhvishriraviprabhaji": { title: "शासनश्री", nameHi: "साध्वीश्री रविप्रभाजी" },
    "sadhvishridrkundanrekhaji": { title: "डा.", nameHi: "साध्वीश्री डा. कुन्दनरेखाजी" },
    "sadhvishrilabdhiprabhaji": { title: "", nameHi: "साध्वीश्री लब्धिप्रभाजी" }
  };
  const normalizedKey = saint.name.replace(/\s+/g, '').toLowerCase();
  const mapped = nameMap[normalizedKey] || { title: "", nameHi: saint.name };
  const isHealth = saint.location.includes("हॉस्पिटल") || saint.location.includes("स्वास्थ्य लाभ");

  return {
    id: index + 1,
    title: mapped.title,
    name: mapped.nameHi,
    thana: `ठाना-${saint.thana || 3}`,
    status: isHealth ? "स्वास्थ्य लाभ हेतु" : "",
    stay_place: saint.location,
    contacts: formatContacts(saint.contact_person, saint.contact, saint.contacts)
  };
});

const delhiMetaInfo = {
  date: viharPravasTodayData.date,
  title: "दिल्ली एन.सी.आर. में विराजित चारित्रात्माएं",
  acharya_location: `परम पूज्य युगप्रधान ${viharPravasTodayData.acharya_vihar.name} अपनी धवलसेना के साथ ${viharPravasTodayData.acharya_vihar.location} में सानन्द सुखसातापूर्वक विराजमान हैं।`,
  shivir_office_contact: { 
    name: viharPravasTodayData.acharya_vihar.contact.split(':')[0]?.trim() || "हेमन्त बैद", 
    phone: viharPravasTodayData.acharya_vihar.contact.split(':')[1]?.trim() || "7044448888" 
  },
  organization: "जैन श्वेताम्बर तेरापंथी सभा, दिल्ली"
};

const ImageWithFallback: React.FC<{ src?: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br from-rose-500/20 via-amber-500/15 to-rose-700/20 text-rose-700 dark:text-amber-300 flex items-center justify-center font-bold font-serif select-none ${className}`}>
        🪷
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
      loading="lazy"
    />
  );
};

const VIRTUE_TAGS = [
  { id: 'all', label: 'सभी टैग्स (All)', icon: '🏷️' },
  { id: 'anuvrat', label: 'अणुव्रत आंदोलन (Anuvrat)', keywords: ['अणुव्रत', 'anuvrat'] },
  { id: 'preksha', label: 'प्रेक्षाध्यान व योग (Preksha)', keywords: ['प्रेक्षा', 'preksha', 'ध्यान', 'योग'] },
  { id: 'vihar', label: 'अहिंसा यात्रा व पदयात्रा (Vihar)', keywords: ['यात्रा', 'विहार', 'padyatra', 'vihar', 'पदयात्रा'] },
  { id: 'maryada', label: 'मर्यादा व नियम (Maryada)', keywords: ['मर्यादा', 'संविधान', 'maryada', 'code', 'नियम'] },
  { id: 'gyanshala', label: 'ज्ञानशाला व शिक्षा (Gyanshala)', keywords: ['ज्ञानशाला', 'gyanshala', 'शिक्षा', 'विद्या', 'संबोध'] },
  { id: 'agamas', label: 'आगम साहित्य व रचना (Literature)', keywords: ['आगम', 'साहित्य', 'ग्रंथ', 'agams', 'poet', 'कविता', 'लेखक'] },
  { id: 'terapanth_founder', label: 'संस्थापना व विचार (Founder)', keywords: ['संस्थापक', 'स्थापना', 'एक आचार्य', 'भिक्षु', 'terapanth', 'स्वामीजी'] },
];

export const LINEAGE_FILTERS = [
  { id: 'founder', label: '🚩 संस्थापक स्वामीजी', description: 'आचार्य भिक्षु (प्रथम)' },
  { id: 'early_masters', label: '📜 प्रथम ५ आचार्य (1-5)', description: 'आचार्य १ से ५' },
  { id: 'middle_masters', label: '🏛️ मध्य काल (6-8)', description: 'आचार्य ६ से ८' },
  { id: 'modern_masters', label: '🌟 आधुनिक आचार्य (9-11)', description: 'आचार्य नवम, दशम व एकादशम' },
  { id: 'gachhadhipati', label: '👑 गणाधिपति व युगप्रधान', description: 'विशेष पदवी अलंकृत आचार्य' },
  { id: 'yuvacharya', label: '🌱 युवाचार्य (Successor)', description: 'भावी उत्तराधिकारी' },
];

const CollapsibleBio: React.FC<{ text?: string; maxLength?: number }> = ({ text, maxLength = 160 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  if (text.length <= maxLength) {
    return <p className="font-medium text-stone-700 dark:text-stone-300 leading-relaxed">{text}</p>;
  }

  const visibleText = isExpanded ? text : text.slice(0, maxLength).trim() + '...';

  return (
    <div className="space-y-1">
      <p className="font-medium text-stone-700 dark:text-stone-300 leading-relaxed">
        {visibleText}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 transition-colors cursor-pointer"
      >
        <span>{isExpanded ? 'कम दिखाएं (Read Less)' : 'अधिक पढ़ें (Read More)'}</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
    </div>
  );
};

const AcharyaCompareModal: React.FC<{
  id1: number;
  id2: number;
  onClose: () => void;
}> = ({ id1, id2, onClose }) => {
  const acharyaA = allAcharyasList.find(a => a.id === id1) || allAcharyasList[0];
  const acharyaB = allAcharyasList.find(a => a.id === id2) || allAcharyasList[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-[var(--text-spiritual)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-zinc-800 mb-4 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-2xl">
              <Scale size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif">
                <span>आचार्य तुलनात्मक अध्ययन (Educational Comparison)</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
                दो आचार्यों के जीवनकाल, दीक्षा, क्रांति एवं मुख्य सिद्धांतों का ऐतिहासिक तुलनात्मक विश्लेषण
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-stone-100 dark:bg-zinc-800 hover:bg-rose-100 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
          {[acharyaA, acharyaB].map((ach) => (
            <div key={ach.id} className="bg-stone-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 space-y-4">
              {/* Profile Card Header */}
              <div className="text-center space-y-2">
                <div className="relative inline-block mx-auto">
                  <ImageWithFallback
                    src={ach.img}
                    alt={ach.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-rose-500 shadow-md mx-auto"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-rose-800 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full border border-rose-400 shadow-xs">
                    {ach.isYuvacharya ? 'युवाचार्य' : `#${ach.id}`}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 font-serif">
                    {ach.name}
                  </h4>
                  {ach.title && (
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 text-[10px] font-extrabold mt-0.5">
                      {ach.title}
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3 divide-y divide-stone-200/70 dark:divide-zinc-700/70">
                {/* Tenure & Period */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 block mb-0.5">
                    ⏱️ कार्यकाल एवं समय:
                  </span>
                  <p className="font-extrabold text-stone-800 dark:text-stone-200 m-0">
                    {ach.tenureStart} – {ach.tenureEnd || 'वर्तमान'} ई.
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 m-0 font-medium">
                    {ach.period}
                  </p>
                </div>

                {/* Birth & Early Life */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 block mb-0.5">
                    📜 पूर्वाश्रमी नाम व जन्म:
                  </span>
                  {ach.secularName && (
                    <p className="m-0 text-stone-800 dark:text-stone-200 font-bold">
                      पूर्वाश्रमी: {ach.secularName}
                    </p>
                  )}
                  {ach.birthDetails?.date && (
                    <p className="m-0 text-stone-600 dark:text-stone-300 text-[11px]">
                      जन्म: {ach.birthDetails.date} ({ach.birthDetails.place})
                    </p>
                  )}
                  {ach.birthDetails?.parents && (
                    <p className="m-0 text-stone-500 dark:text-stone-400 text-[11px]">
                      माता-पिता: {ach.birthDetails.parents}
                    </p>
                  )}
                </div>

                {/* Diksha & Lineage */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 block mb-0.5">
                    🪷 दीक्षा विवरण:
                  </span>
                  {ach.dikshaDetails?.date ? (
                    <p className="m-0 text-stone-700 dark:text-stone-300 font-medium">
                      {ach.dikshaDetails.date} ({ach.dikshaDetails.place})
                      {ach.dikshaDetails.dikshaGuru && <span className="block text-[11px] text-stone-500 font-semibold">गुरु: {ach.dikshaDetails.dikshaGuru}</span>}
                    </p>
                  ) : (
                    <p className="m-0 text-stone-500 font-medium">दीक्षा विवरण लिपिबद्ध है</p>
                  )}
                </div>

                {/* Disciples */}
                {(ach.initiatesMale || ach.initiatesFemale) && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 block mb-0.5">
                      👥 दीक्षित शिष्यवृंद:
                    </span>
                    <p className="m-0 text-stone-800 dark:text-stone-200 font-black">
                      साधु: {ach.initiatesMale || 0} | साध्वी: {ach.initiatesFemale || 0}
                    </p>
                  </div>
                )}

                {/* Key Contributions */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
                    💡 मुख्य योगदान व ऐतिहासिक क्रांति:
                  </span>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300 font-medium list-disc pl-4">
                    {ach.keyContributions.map((kc, kIdx) => (
                      <li key={kIdx} className="text-[11px] leading-relaxed">
                        {kc}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quote */}
                {ach.quote && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                      💬 प्रमुख सन्देश:
                    </span>
                    <p className="italic text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed m-0 font-serif">
                      "{ach.quote}"
                    </p>
                  </div>
                )}
              </div>

              {/* AI prompt launcher button */}
              <button
                onClick={() => {
                  const query = `परम पूज्य ${acharyaA.name} एवं परम पूज्य ${acharyaB.name} के विचारों, सिद्धांतों, दीक्षा-परंपरा, एवं तेरापंथ धर्मसंघ पर प्रभाव का विस्तृत तुलनात्मक विश्लेषण प्रस्तुत करें।`;
                  localStorage.setItem('terapanth_prefill_query', query);
                  window.dispatchEvent(new CustomEvent('terapanth_ask_ai', { detail: { query } }));
                  window.dispatchEvent(new CustomEvent('terapanth_navigate_tab', { detail: 'chat' }));
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-800 to-amber-800 hover:from-rose-900 hover:to-amber-900 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles size={14} className="text-amber-300 animate-spin" />
                <span>🤖 दोनों गुरुओं का AI तुलनात्मक विश्लेषण</span>
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default function SaintsList() {
  const [activeTab, setActiveTab] = useState<'acharyas' | 'delhi_saints'>('acharyas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedLineages, setSelectedLineages] = useState<string[]>([]);

  // Compare Mode State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [expandedAcharyaId, setExpandedAcharyaId] = useState<number | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  
  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('terapanth_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('terapanth_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('terapanth_recent_searches');
  };

  const toggleLineageFilter = (id: string) => {
    setSelectedLineages(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleCompareAcharya = (id: number) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  // Audio Speech Synthesis state
  const [speakingAcharyaId, setSpeakingAcharyaId] = useState<number | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [socialShareSuccess, setSocialShareSuccess] = useState<string | null>(null);

  const [savedSaints, setSavedSaints] = useState<any[]>(() => {
    const saved = localStorage.getItem('saved_saints');
    return saved ? JSON.parse(saved) : [];
  });

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSaveSaint = (saint: any) => {
    const compositeId = saint.isAcharya ? `acharya-${saint.id}` : `saintslist-${saint.id}`;
    const isSaved = savedSaints.some((s: any) => s.id === compositeId);
    let updated;
    if (isSaved) {
      updated = savedSaints.filter((s: any) => s.id !== compositeId);
    } else {
      updated = [...savedSaints, {
        id: compositeId,
        name: saint.name,
        rank: saint.title || saint.thana || 'Acharya',
        loc: saint.period || saint.stay_place || '',
        contact: saint.contacts?.[0]?.phone || '',
        type: saint.isAcharya ? 'acharya' : 'saintsList'
      }];
    }
    setSavedSaints(updated);
    localStorage.setItem('saved_saints', JSON.stringify(updated));
  };

  const handleCopy = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedContact(id);
    setTimeout(() => setCopiedContact(null), 2000);
  };

  // --- Speech Synthesis Handler (Web Speech API) ---
  const handleSpeechToggle = (acharya: Acharya) => {
    if (!('speechSynthesis' in window)) {
      alert('आपके ब्राउज़र में Web Speech API (ऑडियो वाचन) की सुविधा उपलब्ध नहीं है।');
      return;
    }

    const synth = window.speechSynthesis;

    if (speakingAcharyaId === acharya.id) {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        setIsSpeechPaused(true);
      } else if (synth.paused) {
        synth.resume();
        setIsSpeechPaused(false);
      } else {
        synth.cancel();
        setSpeakingAcharyaId(null);
        setIsSpeechPaused(false);
      }
      return;
    }

    // Cancel any previous utterance
    synth.cancel();

    // Prepare full biography & teachings narrative in Hindi
    const tenureText = `${acharya.tenureStart} से ${acharya.tenureEnd || 'वर्तमान'} ईस्वी`;
    const teachingsText = (acharya.keyContributions || []).join('। ');
    const bioDetails = [
      acharya.secularName ? `पूर्वाश्रमी नाम: ${acharya.secularName}।` : '',
      acharya.birthDetails?.date ? `जन्म: ${acharya.birthDetails.date}।` : '',
      acharya.dikshaDetails?.date ? `दीक्षा: ${acharya.dikshaDetails.date}।` : ''
    ].filter(Boolean).join(' ');

    const textToRead = `तेरापंथ धर्मसंघ आचार्यावली। ${acharya.name}। पद: ${acharya.title}। काल: ${tenureText}। ${bioDetails} ${acharya.description || ''}। ${acharya.quote ? `प्रमुख विचार: ${acharya.quote}।` : ''} मुख्य शिक्षाएँ एवं योगदान: ${teachingsText}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.92; // Serene speech rate

    // Voice selection
    const voices = synth.getVoices();
    const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.includes('Hindi'));
    if (hiVoice) {
      utterance.voice = hiVoice;
    }

    utterance.onend = () => {
      setSpeakingAcharyaId(null);
      setIsSpeechPaused(false);
    };

    utterance.onerror = () => {
      setSpeakingAcharyaId(null);
      setIsSpeechPaused(false);
    };

    synth.speak(utterance);
    setSpeakingAcharyaId(acharya.id);
    setIsSpeechPaused(false);
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingAcharyaId(null);
    setIsSpeechPaused(false);
  };

  // --- Social Media Sharing Handlers ---
  const handleWhatsAppShare = (acharya: Acharya) => {
    const periodStr = `${acharya.tenureStart} – ${acharya.tenureEnd || 'वर्तमान'}`;
    const teachingsList = (acharya.keyContributions || []).slice(0, 3).map(t => `• ${t}`).join('\n');
    const message = `*🪷 तेरापंथ आचार्यावली - ${acharya.name} 🪷*\n\n👑 *पद:* ${acharya.title}\n📅 *शासनकाल:* ${periodStr} ई.\n${acharya.secularName ? `👤 *पूर्वाश्रमी नाम:* ${acharya.secularName}\n` : ''}${acharya.quote ? `\n💬 *विचार:* "${acharya.quote}"\n` : ''}\n💡 *मुख्य शिक्षाएँ व योगदान:*\n${teachingsList}\n\n_प्रदाता: तेरापंथ एआई हब (Terapanth AI Hub)_`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = (acharya: Acharya) => {
    const periodStr = `${acharya.tenureStart}–${acharya.tenureEnd || 'वर्तमान'}`;
    const tweet = `🪷 ${acharya.name} (${acharya.title}, ${periodStr} ई.)\n\n${(acharya.description || '').slice(0, 160)}...\n\n#Terapanth #Jainism #Acharya #TerapanthAIHub`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeSocialShare = async (acharya: Acharya) => {
    const periodStr = `${acharya.tenureStart} – ${acharya.tenureEnd || 'वर्तमान'}`;
    const shareText = `🪷 ${acharya.name} - तेरापंथ धर्मसंघ ${acharya.title}\n📅 शासनकाल: ${periodStr} ई.\n${acharya.quote ? `"${acharya.quote}"\n` : ''}${acharya.description || ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `तेरापंथ आचार्यावली - ${acharya.name}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setSocialShareSuccess(`acharya-${acharya.id}`);
      setTimeout(() => setSocialShareSuccess(null), 2500);
    }
  };

  const handleShareDelhiSaint = (saint: any) => {
    const contactStrings = saint.contacts.map((c: any) => `📞 ${c.designation}: +91 ${c.phone}`).join('\n');
    const message = `*☸️ ${delhiMetaInfo.title} (2026) ☸️*\n\n👤 *संत/साध्वी संघ:* ${saint.title ? `[${saint.title}] ` : ''}${saint.name} (${saint.thana})\n${saint.status ? `🏥 *स्थिति:* ${saint.status}\n` : ''}📍 *प्रवास स्थल:* ${saint.stay_place}\n\n*सम्पर्क सूत्र:*\n${contactStrings}\n\n_प्रदाता: तेरापंथ राष्ट्रीय हेल्पलाइन एआई निर्देशिका_`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAskAIGuru = (acharya: Acharya) => {
    const query = `बताएं: ${acharya.name} (${acharya.title}) की मुख्य शिक्षाएं, जीवन परिचय और तेरापंथ धर्मसंघ में उनका क्या विशेष ऐतिहासिक योगदान रहा है?`;
    try {
      localStorage.setItem('terapanth_pending_chat_query', query);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('terapanth_ask_ai', { detail: { query } }));
    window.dispatchEvent(new CustomEvent('terapanth_navigate_tab', { detail: { tab: 'chat' } }));
  };

  // Filter Acharyas by Era, Lineage, Tag & Search
  const filteredAcharyas = useMemo(() => {
    return allAcharyasList.filter((a) => {
      let eraMatch = true;
      if (selectedEra === '18th') {
        eraMatch = a.tenureStart <= 1800;
      } else if (selectedEra === '19th') {
        eraMatch = (a.tenureStart >= 1801 && a.tenureStart <= 1900) || ((a.tenureEnd ?? 9999) >= 1801 && a.tenureStart <= 1900);
      } else if (selectedEra === '20th') {
        eraMatch = (a.tenureStart >= 1901 && a.tenureStart <= 2000) || ((a.tenureEnd ?? 9999) >= 1901 && a.tenureStart <= 2000);
      } else if (selectedEra === '21st') {
        eraMatch = a.tenureStart >= 2001 || a.isCurrent;
      } else if (selectedEra === 'yuvacharya') {
        eraMatch = !!a.isYuvacharya;
      }

      let lineageMatch = true;
      if (selectedLineages.length > 0) {
        lineageMatch = selectedLineages.some(lid => {
          if (lid === 'founder') return a.id === 1;
          if (lid === 'early_masters') return a.id >= 1 && a.id <= 5;
          if (lid === 'middle_masters') return a.id >= 6 && a.id <= 8;
          if (lid === 'modern_masters') return a.id >= 9 && a.id <= 11;
          if (lid === 'gachhadhipati') return a.id >= 9 && a.id <= 11;
          if (lid === 'yuvacharya') return !!a.isYuvacharya;
          return false;
        });
      }

      let tagMatch = true;
      if (selectedTag !== 'all') {
        const tagObj = VIRTUE_TAGS.find(t => t.id === selectedTag);
        if (tagObj && tagObj.keywords) {
          const combined = `${a.name} ${a.title || ''} ${a.description || ''} ${(a.keyContributions || []).join(' ')} ${(a.tags || []).join(' ')}`.toLowerCase();
          tagMatch = tagObj.keywords.some(kw => combined.includes(kw.toLowerCase()));
        }
      }

      const query = searchTerm.trim().toLowerCase();
      if (!query) return eraMatch && lineageMatch && tagMatch;

      const nameMatch = a.name.toLowerCase().includes(query);
      const titleMatch = (a.title || '').toLowerCase().includes(query);
      const secularMatch = (a.secularName || '').toLowerCase().includes(query);
      const aliasesMatch = (a.aliases || []).some(al => al.toLowerCase().includes(query));
      const periodMatch = `${a.tenureStart} ${a.tenureEnd || 'वर्तमान'} ${a.period || ''}`.includes(query);
      const teachingMatch = (a.keyContributions || []).some(kc => kc.toLowerCase().includes(query));
      const bioMatch = (a.description || '').toLowerCase().includes(query) || (a.birthDetails?.place || '').toLowerCase().includes(query);

      return eraMatch && lineageMatch && tagMatch && (nameMatch || titleMatch || secularMatch || aliasesMatch || periodMatch || teachingMatch || bioMatch);
    });
  }, [selectedEra, selectedLineages, selectedTag, searchTerm]);

  // Filter Delhi Saints by Search
  const filteredDelhiSaints = useMemo(() => {
    return mappedDelhiSaintsList.filter(saint => {
      const combined = `${saint.name} ${saint.stay_place} ${saint.title} ${saint.thana} ${saint.status}`.toLowerCase();
      return combined.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  const toggleExpandAcharya = (id: number) => {
    setExpandedAcharyaId(prev => prev === id ? null : id);
  };

  const getOrdinalTitle = (a: Acharya) => {
    if (a.isYuvacharya) return 'भावी उत्तराधिकारी';
    if (a.id === 1) return 'प्रथम आचार्य';
    if (a.id === 2) return 'द्वितीय आचार्य';
    if (a.id === 3) return 'तृतीय आचार्य';
    if (a.id === 4) return 'चतुर्थ आचार्य';
    if (a.id === 5) return 'पंचम आचार्य';
    if (a.id === 6) return 'षष्ठम आचार्य';
    if (a.id === 7) return 'सप्तम आचार्य';
    if (a.id === 8) return 'अष्टम आचार्य';
    if (a.id === 9) return 'नवम आचार्य';
    if (a.id === 10) return 'दशम आचार्य';
    if (a.id === 11) return 'एकादशम आचार्य (वर्तमान)';
    return `आचार्य (${a.id})`;
  };

  // Render Visual Timeline Graphic Indicator
  const renderTimelineIndicator = (acharya: Acharya) => {
    const startYear = acharya.tenureStart;
    const endYear = acharya.tenureEnd || 2026;
    const isContemporary = startYear >= 2001 || endYear >= 2001 || acharya.isCurrent;
    
    // Scale range: 1760 to 2026 (266 years total)
    const TOTAL_SPAN = 266;
    const startPct = Math.max(0, Math.min(100, ((startYear - 1760) / TOTAL_SPAN) * 100));
    const endPct = Math.max(0, Math.min(100, ((endYear - 1760) / TOTAL_SPAN) * 100));
    const widthPct = Math.max(2.5, endPct - startPct);

    let centuryLabel = "18th Century";
    let centuryGradient = "from-amber-500 to-orange-600";
    let badgeStyle = "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30";

    if (isContemporary) {
      centuryLabel = "21st Century (2001–Present) • समकालीन युग (Contemporary Era)";
      centuryGradient = "from-emerald-500 via-teal-400 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.5)]";
      badgeStyle = "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-emerald-500/50 ring-2 ring-emerald-500/30 animate-pulse font-black";
    } else if (startYear <= 1800) {
      centuryLabel = "18th Century (1760–1800) • संस्थापना काल";
      centuryGradient = "from-amber-500 to-orange-500";
      badgeStyle = "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30";
    } else if (startYear <= 1900) {
      centuryLabel = "19th Century (1801–1900) • धर्मसंघ विस्तार";
      centuryGradient = "from-teal-500 to-emerald-600";
      badgeStyle = "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30";
    } else if (startYear <= 2000) {
      centuryLabel = "20th Century (1901–2000) • अणुव्रत व प्रेक्षा युग";
      centuryGradient = "from-blue-500 to-indigo-600";
      badgeStyle = "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30";
    }

    return (
      <div className={`my-2.5 p-2.5 rounded-xl border space-y-1.5 transition-all ${
        isContemporary 
          ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 shadow-xs' 
          : 'bg-stone-50 dark:bg-zinc-800/60 border-stone-200/80 dark:border-zinc-800'
      }`}>
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${badgeStyle}`}>
            {isContemporary ? '✨' : '⏱️'} {centuryLabel}
          </span>
          <span className={`font-mono text-[10px] font-extrabold ${isContemporary ? 'text-emerald-800 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-300'}`}>
            {startYear} – {endYear === 2026 && acharya.isCurrent ? 'वर्तमान' : endYear} ई.
          </span>
        </div>

        {/* Horizontal Visual Timeline Bar */}
        <div className="relative w-full h-2.5 bg-stone-200 dark:bg-zinc-700/80 rounded-full overflow-hidden shadow-inner">
          {/* Historical Century Grid Markers */}
          <div className="absolute left-[15%] top-0 bottom-0 w-0.5 bg-stone-300 dark:bg-zinc-600 z-10" title="1800 AD" />
          <div className="absolute left-[52.6%] top-0 bottom-0 w-0.5 bg-stone-300 dark:bg-zinc-600 z-10" title="1900 AD" />
          <div className="absolute left-[90.2%] top-0 bottom-0 w-0.5 bg-stone-300 dark:bg-zinc-600 z-10" title="2000 AD" />

          {/* Tenure Segment Highlight */}
          <div 
            className={`absolute h-full rounded-full bg-gradient-to-r ${centuryGradient} shadow-xs transition-all duration-500`}
            style={{ left: `${startPct}%`, width: `${widthPct}%` }}
          />

          {/* Contemporary Glow Pin if 21st Century */}
          {isContemporary && (
            <div 
              className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_8px_#f59e0b] z-20 animate-ping"
              style={{ left: `${endPct - 1}%` }}
            />
          )}
        </div>

        {/* Era Axis Labels */}
        <div className="flex justify-between text-[9px] text-stone-400 font-mono px-0.5 font-semibold">
          <span>1760 (संस्थापना)</span>
          <span>1800</span>
          <span>1900</span>
          <span>2000</span>
          <span className={isContemporary ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : ""}>
            {isContemporary ? '📍 वर्तमान (2026+)' : '2026+'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-[var(--text-spiritual)] transition-all duration-300 p-4 sm:p-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] max-w-6xl mx-auto box-border shadow-sm" id="saints-list-container">
      
      {/* Top Header Banner */}
      <div className="mb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-black uppercase tracking-wider">
          <LotusLogo size={18} animateBreathing={true} showGlow={true} />
          <span>तेरापंथ धर्मसंघ निर्देशिका</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2 font-serif tracking-tight">
          {activeTab === 'acharyas' ? '🪷 तेरापंथ आचार्यावली (११ आचार्य)' : '📍 दिल्ली एन.सी.आर. विराजित चारित्रात्माएं'}
        </h2>
        
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium max-w-2xl mx-auto">
          {activeTab === 'acharyas' 
            ? 'आचार्य भिक्षु से वर्तमान आचार्य महाश्रमण तक धर्मसंघ के आचार्यों का प्रामाणिक इतिहास, जीवन परिचय, टाइमलाइन एवं ऑडियो वाचन' 
            : 'दिल्ली एवं समीपवर्ती क्षेत्रों में सानन्द विराजित साधु-साध्वीवृंद की पावन उपस्थिति एवं सम्पर्क सूत्र'}
        </p>
      </div>

      {/* Main Category Tabs: Acharyas Lineage vs Delhi NCR Saints */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-[var(--border-color)] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('acharyas')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'acharyas'
                ? 'bg-rose-800 text-white shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <LotusLogo size={16} active={activeTab === 'acharyas'} animateBreathing={false} showGlow={false} />
            <span>आचार्यावली (११ आचार्य)</span>
          </button>

          <button
            onClick={() => setActiveTab('delhi_saints')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'delhi_saints'
                ? 'bg-rose-800 text-white shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Users size={16} />
            <span>दिल्ली विराजित संत</span>
          </button>
        </div>

        {/* Grid vs List View Switcher */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            title="ग्रिड व्यू (Grid View)"
          >
            <LayoutGrid size={15} />
            <span className="hidden sm:inline">ग्रिड</span>
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            title="सूची व्यू (List View)"
          >
            <List size={15} />
            <span className="hidden sm:inline">सूची</span>
          </button>
        </div>
      </div>

      {/* Acharya Era, Lineage & Virtue Tag Filters Bar (When Acharyas tab is active) */}
      {activeTab === 'acharyas' && (
        <div className="space-y-3 mb-5 bg-black/5 dark:bg-white/5 p-3 sm:p-4 rounded-2xl border border-[var(--border-color)]">
          {/* Compare Mode & Quick Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1">
                <Layers size={14} className="text-rose-600 dark:text-rose-400" />
                गुरू परंपरा फ़िल्टर व तुलना
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsCompareMode(!isCompareMode);
                  if (isCompareMode) setSelectedForCompare([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  isCompareMode
                    ? 'bg-amber-500 text-stone-950 border-amber-600 ring-2 ring-amber-400/40 shadow-xs'
                    : 'bg-stone-200/60 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-300/60 dark:border-zinc-700 hover:bg-stone-300/60'
                }`}
              >
                <ArrowLeftRight size={14} />
                <span>{isCompareMode ? 'तुलना मोड सक्रिय' : 'तुलना (Compare Mode)'}</span>
                {selectedForCompare.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-stone-900 text-amber-300 text-[10px] font-black rounded-full">
                    {selectedForCompare.length}/2
                  </span>
                )}
              </button>

              {isCompareMode && selectedForCompare.length >= 2 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all animate-bounce"
                >
                  <Scale size={14} />
                  <span>तुलना देखें (Compare 2)</span>
                </button>
              )}
            </div>
          </div>

          {/* Multi-Select Lineage Filter Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Users size={12} className="text-amber-500" />
                परंपरा श्रेणी (Lineage Filters - Multi Select):
              </span>
              {selectedLineages.length > 0 && (
                <button
                  onClick={() => setSelectedLineages([])}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-[10px]"
                >
                  रीसेट करें ({selectedLineages.length})
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {LINEAGE_FILTERS.map(lin => {
                const isSelected = selectedLineages.includes(lin.id);
                return (
                  <button
                    key={lin.id}
                    onClick={() => toggleLineageFilter(lin.id)}
                    className={`px-3 py-1 rounded-full font-extrabold whitespace-nowrap transition-all text-xs border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-700 text-white border-rose-800 shadow-xs ring-1 ring-rose-500/50'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-300/70 dark:border-zinc-700 hover:bg-stone-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{lin.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Era Filter Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-extrabold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Calendar size={13} />
              काल (Era):
            </span>
            {[
              { id: 'all', label: 'समस्त काल (1760-2026+)' },
              { id: '18th', label: '18वीं शताब्दी (1760–1800)' },
              { id: '19th', label: '19वीं शताब्दी (1801–1900)' },
              { id: '20th', label: '20वीं शताब्दी (1901–2000)' },
              { id: '21st', label: '21वीं शताब्दी (2001–वर्तमान)' },
              { id: 'yuvacharya', label: 'युवाचार्य' },
            ].map(era => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all text-xs border ${
                  selectedEra === era.id
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-stone-600 dark:text-stone-300 border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {era.label}
              </button>
            ))}
          </div>

          {/* Virtue / Tag Filter Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-extrabold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-500" />
              विषय/योगदान (Virtues):
            </span>
            {VIRTUE_TAGS.map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-2.5 py-1 rounded-full font-extrabold whitespace-nowrap transition-all text-[11px] border flex items-center gap-1 ${
                  selectedTag === tag.id
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-stone-600 dark:text-stone-300 border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input Bar & Recent Searches */}
      <div className="relative mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder={
              activeTab === 'acharyas' 
                ? "आचार्य का नाम, कालवर्ष (उदा. 1760, 1949), पूर्वाश्रमी नाम, या मुख्य शिक्षा खोजें..." 
                : "चारित्रात्मा का नाम, ठाना या प्रवास स्थान खोजें..."
            } 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveSearchQuery(searchTerm);
              }
            }}
            onBlur={() => saveSearchQuery(searchTerm)}
            className="w-full pl-10 pr-10 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-2xl text-[var(--text-spiritual)] text-xs sm:text-sm outline-none box-border placeholder-stone-400 dark:placeholder-stone-500 font-semibold focus:border-rose-500 transition-colors"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Recent Searches Pills */}
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2 px-1 text-xs">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1 shrink-0">
              <Clock size={12} className="text-stone-400" />
              हालिया खोजें:
            </span>
            {recentSearches.map((query, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchTerm(query);
                  saveSearchQuery(query);
                }}
                className="px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-[11px] font-bold hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{query}</span>
              </button>
            ))}
            <button
              onClick={clearRecentSearches}
              className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline ml-1 cursor-pointer"
            >
              साफ़ करें
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ACHARYAS LINEAGE GRID / LIST */}
      {activeTab === 'acharyas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 px-1">
            <span>कुल परिणाम: {filteredAcharyas.length} आचार्य</span>
            <div className="flex items-center gap-2">
              {selectedTag !== 'all' && (
                <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-extrabold">
                  टैग: {VIRTUE_TAGS.find(t => t.id === selectedTag)?.label.split(' ')[0]}
                </span>
              )}
              {selectedEra !== 'all' && (
                <span className="text-rose-600 dark:text-rose-400 text-[11px]">
                  काल: {selectedEra}
                </span>
              )}
            </div>
          </div>

          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "flex flex-col gap-4"
          }>
            <AnimatePresence mode="popLayout">
              {filteredAcharyas.map((acharya) => {
                const isExpanded = expandedAcharyaId === acharya.id;
                const isSaved = savedSaints.some((s: any) => s.id === `acharya-${acharya.id}`);
                const isSpeaking = speakingAcharyaId === acharya.id;

                return (
                  <motion.div
                    key={acharya.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: isExpanded ? 1.025 : 1 
                    }}
                    whileHover={{ scale: isExpanded ? 1.03 : 1.008 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                      isExpanded 
                        ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xl' 
                        : 'border-stone-200 dark:border-zinc-800 hover:border-rose-500/40'
                    } ${viewMode === 'grid' && isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
                  >
                    {/* Top Header Row of Acharya Card */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <ImageWithFallback 
                            src={acharya.img} 
                            alt={acharya.name} 
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-500/30 shadow-xs" 
                          />
                          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs border border-amber-300">
                            #{acharya.id}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {getOrdinalTitle(acharya)}
                            </span>
                            {acharya.isCurrent && (
                              <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md animate-pulse">
                                वर्तमान अनुशास्ता
                              </span>
                            )}
                          </div>

                          <h3 className="serif-text text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 mt-1 leading-snug">
                            {acharya.name}
                          </h3>

                          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                            <Calendar size={12} />
                            <span>{acharya.tenureStart} – {acharya.tenureEnd || 'वर्तमान'} ई.</span>
                            {acharya.secularName && (
                              <span className="text-stone-400 font-normal ml-1">
                                ({acharya.secularName})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleSaveSaint({ ...acharya, isAcharya: true })}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-stone-400 hover:text-amber-500 shrink-0"
                        title={isSaved ? "Favorites से हटाएं" : "Favorites में जोड़ें"}
                      >
                        <Star
                          size={18}
                          className={isSaved ? "fill-amber-400 text-amber-500" : "text-stone-400 dark:text-stone-500"}
                        />
                      </button>
                    </div>

                    {/* FEATURE 1: VISUAL TIMELINE INDICATOR BAR */}
                    {renderTimelineIndicator(acharya)}

                    {/* Brief Summary Highlights */}
                    <div className="py-2 text-xs text-stone-600 dark:text-stone-300 space-y-2 leading-relaxed">
                      {acharya.description && (
                        <CollapsibleBio text={acharya.description} maxLength={160} />
                      )}

                      {/* Top 2 Key Contributions */}
                      {acharya.keyContributions && acharya.keyContributions.length > 0 && (
                        <div className="bg-stone-50 dark:bg-zinc-800/60 rounded-xl p-2.5 border border-stone-200/60 dark:border-zinc-800/80">
                          <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1 mb-1">
                            <Sparkles size={11} />
                            प्रमुख योगदान एवं विशेषताएं:
                          </span>
                          <ul className="space-y-1 text-stone-700 dark:text-stone-300 font-medium">
                            {acharya.keyContributions.slice(0, 2).map((kc, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                <span className="text-rose-500 font-bold mt-0.5">•</span>
                                <span>{kc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Expand Trigger Button & Social Share */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                      <button
                        onClick={() => toggleExpandAcharya(acharya.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isExpanded 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/80'
                        }`}
                      >
                        <BookOpen size={13} />
                        <span>{isExpanded ? 'संक्षिप्त विवरण छिपाएं' : 'विस्तृत जीवनी व शिक्षाएँ देखें'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button
                        onClick={() => handleWhatsAppShare(acharya)}
                        className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 transition-all text-xs font-bold flex items-center gap-1"
                        title="WhatsApp पर साझा करें"
                      >
                        <Share2 size={13} />
                        <span className="hidden sm:inline">साझा करें</span>
                      </button>
                    </div>

                    {/* EXPAND-ON-CLICK DETAILED BIOGRAPHY, TEACHINGS & AUDIO PANEL */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden mt-4 pt-4 border-t-2 border-dashed border-rose-200 dark:border-rose-900/40 space-y-4"
                        >
                          {/* EXPANDED TOOLBAR: LISTEN (TTS), ASK AI & SOCIAL MEDIA SHARE */}
                          <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-emerald-500/10 p-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-3">
                            {/* LISTEN & ASK AI BUTTONS */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleSpeechToggle(acharya)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs ${
                                  isSpeaking 
                                    ? (isSpeechPaused 
                                        ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300' 
                                        : 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400')
                                    : 'bg-rose-800 text-white hover:bg-rose-900'
                                }`}
                                title="जीवनी का हिंदी ऑडियो वाचन सुनें (Web Speech API)"
                              >
                                {isSpeaking ? (
                                  isSpeechPaused ? <Play size={14} /> : <Pause size={14} />
                                ) : (
                                  <Volume2 size={14} />
                                )}
                                <span>
                                  {isSpeaking 
                                    ? (isSpeechPaused ? 'पुनः चलाएं (Resume)' : 'विराम (Pause)') 
                                    : '🔊 सुनें (Audio Biography)'}
                                </span>
                              </button>

                              {isSpeaking && (
                                <button
                                  onClick={handleStopSpeech}
                                  className="p-2 rounded-xl bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
                                  title="ऑडियो बंद करें"
                                >
                                  <Square size={13} className="fill-current" />
                                </button>
                              )}

                              {/* ASK AI ABOUT THIS GURU BUTTON */}
                              <button
                                onClick={() => handleAskAIGuru(acharya)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xs transition-all active:scale-95"
                                title="AI गुरुदेव से प्रश्न पूछें (Open Chat)"
                              >
                                <Sparkles size={14} className="text-amber-300" />
                                <span>गुरुदेव से पूछें (Ask AI)</span>
                              </button>

                              {/* Compare Selection Toggle */}
                              <button
                                onClick={() => toggleCompareAcharya(acharya.id)}
                                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                  selectedForCompare.includes(acharya.id)
                                    ? 'bg-amber-500 text-stone-950 border-amber-600 ring-2 ring-amber-400'
                                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-zinc-700'
                                }`}
                              >
                                <ArrowLeftRight size={13} />
                                <span>{selectedForCompare.includes(acharya.id) ? '✓ तुलना में चयनित' : 'तुलना में जोड़ें'}</span>
                              </button>
                            </div>

                            {/* SOCIAL MEDIA SHARE SUITE BUTTONS */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black uppercase text-stone-500 dark:text-stone-400 hidden sm:inline mr-1">
                                सोशल साझा:
                              </span>

                              {/* WhatsApp Share */}
                              <button
                                onClick={() => handleWhatsAppShare(acharya)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                                title="WhatsApp पर साझा करें"
                              >
                                <Send size={12} />
                                <span>WhatsApp</span>
                              </button>

                              {/* Twitter / X Share */}
                              <button
                                onClick={() => handleTwitterShare(acharya)}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-900 dark:bg-zinc-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1 transition-all border border-stone-700"
                                title="Twitter / X पर साझा करें"
                              >
                                <Globe size={12} />
                                <span>X</span>
                              </button>

                              {/* Web Share / Copy Link */}
                              <button
                                onClick={() => handleNativeSocialShare(acharya)}
                                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1 transition-all border border-stone-200 dark:border-zinc-700"
                                title="सोशल शेयरिंग या लिंक कॉपी करें"
                              >
                                <Share2 size={12} />
                                <span>
                                  {socialShareSuccess === `acharya-${acharya.id}` ? 'कॉपी हुआ!' : 'शेयर'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Quote Banner if available */}
                          {acharya.quote && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 italic font-serif relative">
                              <Quote size={16} className="text-amber-500/40 absolute top-2 right-2" />
                              <p className="m-0 pr-6 leading-relaxed font-semibold">
                                "{acharya.quote}"
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Brief Biography Section */}
                            <div className="bg-stone-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 space-y-2">
                              <h4 className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 border-stone-200 dark:border-zinc-700">
                                <GraduationCap size={14} />
                                📜 जीवन परिचय एवं मुख्य मील के पत्थर (Biography)
                              </h4>

                              <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                                {acharya.secularName && (
                                  <p className="m-0">
                                    <strong className="text-stone-900 dark:text-stone-100">पूर्वाश्रमी नाम:</strong> {acharya.secularName}
                                  </p>
                                )}
                                {acharya.birthDetails?.date && (
                                  <p className="m-0">
                                    <strong className="text-stone-900 dark:text-stone-100">जन्म तिथि व स्थान:</strong> {acharya.birthDetails.date} {acharya.birthDetails.place ? `(${acharya.birthDetails.place})` : ''}
                                  </p>
                                )}
                                {acharya.birthDetails?.parents && (
                                  <p className="m-0">
                                    <strong className="text-stone-900 dark:text-stone-100">माता-पिता:</strong> {acharya.birthDetails.parents}
                                  </p>
                                )}
                                {acharya.dikshaDetails?.date && (
                                  <p className="m-0">
                                    <strong className="text-stone-900 dark:text-stone-100">दीक्षा विवरण:</strong> {acharya.dikshaDetails.date} {acharya.dikshaDetails.place ? `(${acharya.dikshaDetails.place})` : ''} {acharya.dikshaDetails.dikshaGuru ? `• गुरु: ${acharya.dikshaDetails.dikshaGuru}` : ''}
                                  </p>
                                )}
                                {acharya.samadhiDetails?.date && (
                                  <p className="m-0">
                                    <strong className="text-stone-900 dark:text-stone-100">देवलोकगमन:</strong> {acharya.samadhiDetails.date} {acharya.samadhiDetails.place ? `(${acharya.samadhiDetails.place})` : ''}
                                  </p>
                                )}
                                {(acharya.initiatesMale || acharya.initiatesFemale) && (
                                  <p className="m-0 text-rose-800 dark:text-rose-300 font-semibold pt-1">
                                    <strong>दीक्षित शिष्यवृंद:</strong> साधु: {acharya.initiatesMale || 0} | साध्वी: {acharya.initiatesFemale || 0}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Full Teachings & Contributions List */}
                            <div className="bg-stone-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 space-y-2">
                              <h4 className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 border-stone-200 dark:border-zinc-700">
                                <Award size={14} />
                                💡 मुख्य शिक्षाएँ, सिद्धांत एवं ऐतिहासिक क्रांति
                              </h4>

                              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 font-medium">
                                {acharya.keyContributions.map((contribution, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-2">
                                    <span className="text-amber-500 font-black mt-0.5">🪷</span>
                                    <span className="leading-relaxed">{contribution}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Recent Chaturmas Locations if available */}
                          {acharya.chaturmas && acharya.chaturmas.length > 0 && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200">
                              <span className="font-extrabold flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1.5">
                                <MapPin size={12} />
                                ऐतिहासिक चातुर्मास प्रवास (Chaturmas Record):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {acharya.chaturmas.map((ch, chIdx) => (
                                  <span key={chIdx} className="bg-white/80 dark:bg-zinc-900/80 border border-amber-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                    {ch.year}: {ch.loc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredAcharyas.length === 0 && (
            <div className="text-center text-stone-400 text-xs py-8 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800">
              इस खोज के लिए कोई आचार्य विवरण उपलब्ध नहीं है। कृपया दूसरा नाम या काल चुनें।
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DELHI NCR VIHAR SAINTS LIST */}
      {activeTab === 'delhi_saints' && (
        <div className="space-y-4">
          {/* Acharya Location Status Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-3.5 text-left shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-semibold pl-2">
              ✨ {delhiMetaInfo.acharya_location}
            </p>
          </div>

          {/* Shivir / Organization Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-stone-500 dark:text-stone-400 font-bold border-b border-[var(--border-color)] pb-3">
            <span>🏛️ {delhiMetaInfo.organization}</span>
            <span className="flex items-center gap-1">
              📞 शिविर कार्यालय ({delhiMetaInfo.shivir_office_contact.name}):{' '}
              <a 
                href={`tel:${delhiMetaInfo.shivir_office_contact.phone}`}
                className="text-blue-600 dark:text-cyan-400 hover:underline"
              >
                +91 {delhiMetaInfo.shivir_office_contact.phone}
              </a>
            </span>
          </div>

          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
              : "flex flex-col gap-4"
          }>
            <AnimatePresence mode="popLayout">
              {filteredDelhiSaints.map((saint) => {
                const isSaved = savedSaints.some((s: any) => s.id === `saintslist-${saint.id}`);

                return (
                  <motion.div 
                    key={saint.id} 
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:border-rose-500/30 hover:shadow-md"
                    id={`saint-card-${saint.id}`}
                  >
                    {/* Header inside Card */}
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Users size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base text-stone-900 dark:text-stone-100 font-black flex items-center flex-wrap gap-1.5 leading-tight">
                            {saint.title && (
                              <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                                {saint.title}
                              </span>
                            )}
                            <span>{saint.name}</span>
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300">
                          {saint.thana}
                        </span>
                        <button
                          onClick={() => toggleSaveSaint(saint)}
                          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-stone-400 hover:text-amber-500"
                          title={isSaved ? "Favorites से हटाएं" : "Favorites में जोड़ें"}
                        >
                          <Star
                            size={16}
                            className={isSaved ? "fill-amber-400 text-amber-500" : "text-stone-400 dark:text-stone-500"}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Status Alert if any */}
                    {saint.status && (
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300 font-extrabold inline-flex items-center gap-1.5 mb-3">
                        <Heart size={13} className="fill-rose-500" />
                        <span>{saint.status}</span>
                      </div>
                    )}

                    {/* Stay Place Location */}
                    <div className="flex items-start gap-2.5 bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-800 mb-4">
                      <MapPin size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-semibold m-0 leading-relaxed">
                        {saint.stay_place}
                      </p>
                    </div>

                    {/* Contacts / Call Suite */}
                    <div className="space-y-2 font-sans">
                      {saint.contacts.map((contact, index) => {
                        const copyKey = `${saint.id}-${index}`;
                        return (
                          <div 
                            key={index}
                            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between p-2.5 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/80 dark:border-zinc-800"
                          >
                            <div className="flex items-center justify-between sm:justify-start gap-3 px-1 py-0.5">
                              <span className="text-xs text-stone-600 dark:text-stone-400 font-bold">
                                👤 कासीद: {contact.designation}
                              </span>
                              <span className="text-xs font-mono font-black text-blue-700 dark:text-cyan-300">
                                +91 {contact.phone}
                              </span>
                            </div>
                            
                            <div className="flex gap-1.5 justify-end">
                              <a 
                                href={`tel:${contact.phone}`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition active:scale-98"
                              >
                                <Phone size={12} />
                                <span>कॉल</span>
                              </a>

                              <button
                                onClick={() => handleCopy(contact.phone, copyKey)}
                                className="flex items-center justify-center gap-1 bg-black/5 dark:bg-white/5 border border-stone-200 dark:border-zinc-700 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-200 text-xs font-bold cursor-pointer transition active:scale-98"
                              >
                                {copiedContact === copyKey ? (
                                  <>
                                    <Check size={12} className="text-emerald-500" />
                                    <span className="text-[10px]">कॉपी</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span className="text-[10px]">कॉपी</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Individual Saint Action Menu */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800 mt-2">
                        <button
                          onClick={() => handleShareDelhiSaint(saint)}
                          className="flex items-center justify-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition active:scale-95"
                          title="WhatsApp पर भेजें"
                        >
                          <Share2 size={13} />
                          <span>व्हाट्सएप साझा करें</span>
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredDelhiSaints.length === 0 && (
              <div className="text-center text-stone-400 text-xs py-8 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800">
                इस खोज के लिए कोई चारित्रात्मा विवरण नहीं मिला।
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust Footer */}
      <div className="mt-6 text-[10px] text-stone-500 flex items-center justify-center gap-1 font-mono border-t border-[var(--border-color)] pt-4">
        <ShieldCheck size={12} />
        <span>Verified Terapanth Acharyas & Monastic Registry • 1760–2026+</span>
      </div>

      {/* Compare Modal */}
      {showCompareModal && selectedForCompare.length === 2 && (
        <AcharyaCompareModal
          id1={selectedForCompare[0]}
          id2={selectedForCompare[1]}
          onClose={() => setShowCompareModal(false)}
        />
      )}

    </div>
  );
}
