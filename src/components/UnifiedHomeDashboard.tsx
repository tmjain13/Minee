import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, ArrowRight, MapPin, Flame, Clock, Calendar, Sun, Moon, Sunrise, BarChart3, RefreshCw, Plus, Mic, Send, Copy, Star, Phone, Trash2, Sparkles, Sliders } from 'lucide-react';
import DashboardCustomizerModal, { DashboardPreferences, DEFAULT_PREFERENCES } from './DashboardCustomizerModal';
import { useAuth } from '../context/AuthContext';
import CommunityPolls from './CommunityPolls';
import { ACHARYAS } from '../data/acharyas';
import MoonPhaseWidget from './MoonPhaseWidget';

interface Quote {
  text: string;
  author: string;
  source: string;
}

const SUVICHAR_BANK: Quote[] = [
  { text: "अहिंसा केवल शरीर की नहीं, वाणी और मन की भी होनी चाहिए।", author: "आचार्य श्री महाप्रज्ञ जी", source: "जीवन विज्ञान" },
  { text: "जो व्यक्ति क्रोध को क्षमा से जीत लेता है, वह सबसे बड़ा विजेता है।", author: "आचार्य श्री महाश्रमण जी", source: "प्रवचन पीयूष" },
  { text: "संयम ही जीवन है, असंयम ही मृत्यु का कारण बनता है।", author: "आचार्य तुलसी", source: "अणुव्रत दर्शन" }
];

export default function UnifiedHomeDashboard({ 
  setActiveTab, 
  isDarkMode = false, 
  knowledgeItems = [],
  setIsLoginModalOpen = () => {}
}: { 
  setActiveTab: (tab: string) => void; 
  isDarkMode?: boolean; 
  knowledgeItems?: any[];
  setIsLoginModalOpen?: (open: boolean) => void;
}) {
  const { user } = useAuth();
  
  // --- Core Reactive States ---
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [calendarMode, setCalendarMode] = useState<'GREGORIAN' | 'VIKRAMI'>('GREGORIAN');
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeProvince, setActiveProvince] = useState('DELHI');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    try {
      const stored = localStorage.getItem('terapanth_dashboard_preferences');
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Filter knowledge items dynamically when search is active
  const filteredKnowledge = searchQuery.trim() !== ''
    ? knowledgeItems.filter((item: any) => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5) // Limit to top 5 results for sleek mobile UI
    : [];

  const filteredAcharyas = searchQuery.trim() !== ''
    ? ACHARYAS.filter((acharya: any) =>
        acharya.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acharya.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acharya.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acharya.fullBio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acharya.teachings?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        acharya.contributions?.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        acharya.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];
  
  // Saved Saints state
  const [savedSaints, setSavedSaints] = useState<any[]>([]);

  useEffect(() => {
    const loadSaved = () => {
      const saved = localStorage.getItem('saved_saints');
      if (saved) {
        setSavedSaints(JSON.parse(saved));
      } else {
        setSavedSaints([]);
      }
    };
    loadSaved();
    const interval = setInterval(loadSaved, 2500);
    return () => clearInterval(interval);
  }, []);

  const removeSavedSaint = (id: string) => {
    const updated = savedSaints.filter((s: any) => s.id !== id);
    setSavedSaints(updated);
    localStorage.setItem('saved_saints', JSON.stringify(updated));
  };

  const toggleSaveItinerary = (monk: any) => {
    const compositeId = `itinerary-${monk.name}`;
    const isSaved = savedSaints.some((s: any) => s.id === compositeId);
    let updated;
    if (isSaved) {
      updated = savedSaints.filter((s: any) => s.id !== compositeId);
    } else {
      updated = [...savedSaints, {
        id: compositeId,
        name: monk.name,
        rank: monk.tag,
        loc: monk.loc,
        contact: monk.contact,
        type: 'itinerary'
      }];
    }
    setSavedSaints(updated);
    localStorage.setItem('saved_saints', JSON.stringify(updated));
  };
  
  // Sadhana Checklist Checkbox Core States
  const [sadhanaState, setSadhanaState] = useState({ navkar: false, samayik: false, swadhyay: false, chauvihar: false });
  const completedCount = Object.values(sadhanaState).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / 4) * 100);

  // --- Real-time Local Digital Clock Engine ---
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

  // --- Paryushana Countdown State ---
  const [paryushanaCountdown, setParyushanaCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isPast: false
  });

  useEffect(() => {
    const calculateParyushanaTime = () => {
      const now = new Date();
      // Paryushan Parva 2026 starts on Sept 7, 2026 and ends with Samvatsari on Sept 15, 2026.
      const paryushanStart = new Date('2026-09-07T00:00:00');
      const paryushanEnd = new Date('2026-09-15T23:59:59');

      if (now >= paryushanStart && now <= paryushanEnd) {
        setParyushanaCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
          isPast: false
        });
      } else if (now > paryushanEnd) {
        // Tentative date for Paryushana 2027: VS 2084 calendar, let's say Aug 27, 2027
        const nextStart = new Date('2027-08-27T00:00:00');
        const diff = nextStart.getTime() - now.getTime();
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / (1000 * 60)) % 60);
          const s = Math.floor((diff / 1000) % 60);
          setParyushanaCountdown({
            days: d,
            hours: h,
            minutes: m,
            seconds: s,
            isLive: false,
            isPast: false
          });
        } else {
          setParyushanaCountdown({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isLive: false,
            isPast: true
          });
        }
      } else {
        const diff = paryushanStart.getTime() - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setParyushanaCountdown({
          days: d,
          hours: h,
          minutes: m,
          seconds: s,
          isLive: false,
          isPast: false
        });
      }
    };

    calculateParyushanaTime();
    const timer = setInterval(calculateParyushanaTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Official Verified Monastic Directory Data (06 July 2026 Release) ---
  const PROVINCE_DATA = {
    DELHI: [
      { name: "बहुश्रुत मुनिश्री उदित कुमार जी", tag: "ठाणा-3", loc: "तेरापंथ भवन, ए-875, शास्त्री नगर, दिल्ली।", contact: "9983478999" },
      { name: "शासनश्री साध्वीश्री संघमित्राजी", tag: "ठाणा-5", loc: "एक्शन बालाजी हॉस्पिटल, पश्चिम विहार, दिल्ली।", contact: "9950120242" },
      { name: "शासनश्री साध्वीश्री सुव्रताजी", tag: "ठाणा-4", loc: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली।", contact: "8375941210" },
      { name: "शासनश्री साध्वीश्री सुमनश्री जी", tag: "ठाणा-4", loc: "तेरापंथ भवन, सेक्टर-05, रोहिणी, दिल्ली।", contact: "9915501240" },
      { name: "शासनश्री साध्वीश्री रविप्रभाजी", tag: "ठाणा-5", loc: "ओसवाल भवन, बी-69, विवेक विहार-2, दिल्ली।", contact: "8104273773" }
    ],
    RAJASTHAN: [
      { name: "मुनिश्री मुनिव्रत जी", tag: "ठाणा-3", loc: "महाप्रज्ञ भवन, सिरियारी, राजस्थान।", contact: "ℹ️ ऑन-साइट" },
      { name: "मुनिश्री तत्व रुचि जी 'तरुण'", tag: "ठाणा-2", loc: "भिक्षु साधना केंद्र, श्याम नगर, जयपुर।", contact: "9660692852" },
      { name: "मुनिश्री सुधाकर जी", tag: "ठाणा-2", loc: "नरेंद्र जी धीरज जी अरविंद बैद निवास, 179, मल्होत्रा नगर, विद्याधर नगर स्टेडियम के पास, जयपुर।", contact: "8870651529" },
      { name: "मुनिश्री अमृत कुमार जी", tag: "ठाणा-4", loc: "बोथरा भवन, गंगाशहर, राजस्थान।", contact: "ℹ️ ऑन-साइट" },
      { name: "शासनश्री साध्वीश्री जसवती जी", tag: "ठाणा-3", loc: "तेरापंथ भवन, आसींद, राजस्थान।", contact: "9251316471" },
      { name: "शासनश्री साध्वीश्री धनश्री जी", tag: "ठाणा-4", loc: "तेरापंथ भवन, गुलाब बाड़ी, कोटा।", contact: "9649509233" },
      { name: "शासनश्री मंजु प्रभा जी", tag: "ठाणा-3", loc: "दुग्गड़ भवन, बीकानेर, राजस्थान।", contact: "ℹ️ ऑन-साइट" }
    ],
    GUJARAT: [
      { name: "डॉ मुनिश्री मदन कुमारजी स्वामी", tag: "ठाणा-3", loc: "क्रिश हाइट्स, संजीव कुमार ऑडिटोरियम के पास, RTO रोड, पाल अडाजण, सूरत।", contact: "6377377427", spec: "Jignesh Chinubhai Shah Residence" },
      { name: "मुनिश्री मुनिसुव्रत कुमार जी स्वामी", tag: "ठाणा-3", loc: "अर्हम कुंज, तेरापंथ भवन के पास, शाहीबाग, अहमदाबाद।", contact: "7021591184" },
      { name: "मुनिश्री संजयकुमार जी", tag: "ठाणा-4", loc: "राहुल हाउस, प्रशांत सोसायटी, नवरंग पुरा, अहमदाबाद।", contact: "7597245913" },
      { name: "शासनश्री साध्वीश्री रामकुमारीजी", tag: "ठाणा-4", loc: "तेरापंथ भवन, कांकरिया, मणिनगर, अहमदाबाद।", contact: "9408472957" },
      { name: "साध्वीश्री मधुबाला जी (शासनश्री)", tag: "ठाणा-5", loc: "तेरापंथ भवन, सिटीलाइट, सूरत, गुजरात।", contact: "8128559659" },
      { name: "डॉ साध्वीश्री परमयशा जी", tag: "ठाणा-5", loc: "आशीर्वाद पैलेस, भट्टार रोड, सूरत, गुजरात।", contact: "ℹ️ ऑन-साइट" }
    ],
    MAHARASHTRA: [
      { name: "मुनिश्री कुलदीप कुमारजी स्वामी", tag: "ठाणा-2", loc: "तेरापंथ भवन, हेमलीला अपार्टमेंट, मुलुंड (पूर्व), मुंबई।", contact: "9919601313" },
      { name: "शासनश्री साध्वीश्री विद्यावती जी 'द्वितीय'", tag: "ठाणा-5", loc: "तेरापंथ भवन, ठाकुर काॅम्प्लेक्स, कांदिवली (पूर्व), मुंबई।", contact: "8850280148" },
      { name: "शासनश्री साध्वीश्री कंचन प्रभाजी", tag: "ठाणा-5", loc: "तेरापंथ भवन, सन टॉवर, भोईवाड़ा परेल, मुंबई।", contact: "7061598749" },
      { name: "साध्वीश्री राकेश कुमारीजी", tag: "ठाणा-4", loc: "गोयल निवास, 201 आयरन बिल्डिंग, हनुमान रोड, विलेपार्ले (पूर्व), मुंबई।", contact: "7972375908" },
      { name: "साध्वीश्री निर्वाणश्री जी", tag: "ठाणा-6", loc: "तेरापंथ सभा भवन, मनु मार्केट, घाटकोपर (पश्चिम), मुंबई।", contact: "7891817906" }
    ],
    HARYANA: [
      { name: "साध्वीश्री राजकुमारी जी", tag: "ठाणा-3", loc: "तुलसी सेवा केंद्र, मॉडल टाउन, हिसार, हरियाणा।", contact: "ℹ️ ऑन-साइट" },
      { name: "शासनश्री साध्वीश्री यशोधरा जी", tag: "ठाणा-6", loc: "तेरापंथ भवन, मॉडल टाउन, हिसार, हरियाणा।", contact: "ℹ️ ऑन-साइट" },
      { name: "शासनश्री साध्वीश्री प्रशमरतीजी", tag: "ठाणा-4", loc: "तुलसी सेवा केंद्र, MODEL TOWN, हिसार।", contact: "ℹ️ ऑन-साइट" },
      { name: "शासनश्री साध्वीश्री भाग्यवतीजी", tag: "ठाणा-4", loc: "तेरापंथ भवन, हांसी, हरियाणा।", contact: "ℹ️ ऑन-साइट" },
      { name: "साध्वीश्री संयमप्रभा जी", tag: "ठाणा-4", loc: "तेरापंथ भवन, सिरसा, हरियाणा।", contact: "ℹ️ ऑन-साइट" }
    ],
    KARNATAKA: [
      { name: "मुनिश्री अनंत कुमार जी", tag: "ठाणा-2", loc: "वासु पूज्य नूतन भवन, केशवापुर, हुबली, कर्नाटक।", contact: "8755109325" },
      { name: "मुनिश्री विनीत कुमार जी", tag: "ठाणा-2", loc: "प्रवीण कुमार जी दीक्षित जी सोलंकी निवास, त्यागराजनगर, बैंगलोर-70।", contact: "ℹ️ रायसोनी निवास से विहार" },
      { name: "मुनिश्री आकाश कुमार जी", tag: "ठाणा-2", loc: "नंबर 264, 8वां क्रॉस, शास्त्रीनगर, त्यागराजनगर, बेंगलुरु - 70।", contact: "8553336928" },
      { name: "साध्वीश्री पावनप्रभा जी", tag: "ठाणा-4", loc: "श्री निर्मलजी राजेशजी मूथा निवास, हीराचंद लेआउट, कॉक्स टाउन, बेंगलुरु।", contact: "9844662296" }
    ],
    TAMILNADU: [
      { name: "डॉ मुनिश्री पुलकित कुमार जी", tag: "ठाणा-2", loc: "श्री जैन श्वेताम्बर तेरापंथ ट्रस्ट भवन, माधावरम, चेन्नई।", contact: "9104006286" },
      { name: "साध्वीश्री उदितयशा जी", tag: "ठाणा-4", loc: "श्री रतनलाल जी डोसी निवास, किलपॉक, चेन्नई, तमिलनाडु।", contact: "9898502684" },
      { name: "साध्वीश्री सोमयशा जी", tag: "ठाणा-3", loc: "PRM कल्याण मण्डपम, इदायपट्टी, सेलम मैन रोड़, वैगुण्डम, संकगिरि।", contact: "9602007283" }
    ],
    TELANGANA: [
      { name: "मुनिश्री दीप कुमार जी", tag: "ठाणा-2", loc: "पंकज जी हेमा जी मालू निवास, फ्लैट 725, ब्लॉक 3 मानसरोवर हाइट्स, हैदराबाद।", contact: "8505098254" }
    ],
    EAST_INDIA: [
      { name: "मुनिश्री हिमांशु कुमार जी", tag: "ठाणा-2", loc: "टिटिलागड, उड़ीसा प्रांत।", contact: "9928663589" },
      { name: "मुनिश्री मोहजीत कुमार जी", tag: "ठाणा-3", loc: "ग्रैंड बाजार ग्रैंड आवास, श्री मोहनलाल जी सिंघी निवास, भुवनेश्वर, उड़ीसा।", contact: "9664413522" },
      { name: "डॉ मुनिश्री ज्ञानेन्द्र कुमार जी", tag: "ठाणा-2", loc: "मारवाड़ी भवन, बेलडांगा, पश्चिम बंगाल प्रांत।", contact: "9445696470" },
      { name: "मुनिश्री रमेश कुमार जी", tag: "ठाणा-1", loc: "मारवाड़ी भवन, बेलडांगा, पश्चिम बंगाल।", contact: "9445696470" },
      { name: "मुनिश्री आनंदकुमार जी 'कालू'", tag: "ठाणा-2", loc: "नवीन जी नौलखा निवास, गुवाहाटी क्लब, असम प्रांत।", contact: "9601420513" },
      { name: "मुनिश्री प्रशांतकुमार जी", tag: "ठाणा-2", loc: "तेरापंथ भवन, गुलाबबाग, बिहार प्रांत।", contact: "6000696420" }
    ]
  };

  return (
    <div 
      className={`w-full flex flex-col gap-4 py-4 px-3 animate-in fade-in duration-200 transition-colors bg-transparent ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}
      onTouchStart={(e) => {
        // Only stop propagation if it's clearly a horizontal gesture, 
        // allow vertical scrolling to pass through.
        if (Math.abs(e.touches[0].clientX) > 100) {
          e.stopPropagation();
        }
      }}
    >
      
      {/* 1. PATH OF NON-VIOLENCE MOUNTAIN BANNER */}
      <div className={`relative w-full h-36 rounded-2xl overflow-hidden shadow-xs border shrink-0 transition-all ${isDarkMode ? 'border-stone-800' : 'border-stone-200'}`}>
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" 
          alt="Path of Non-Violence" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent flex flex-col justify-end p-4">
          <h3 className="font-serif italic text-lg text-white tracking-wide">Path of Non-Violence</h3>
          <p className="text-[9px] uppercase tracking-widest text-stone-300 font-semibold mt-0.5">Ahimsa Paramo Dharma</p>
        </div>
      </div>

      {/* 2. PERSONALIZED GREETING LAYER */}
      <div className={`w-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 shrink-0 flex justify-between items-center ${
        isDarkMode 
          ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
          : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
      }`}>
        <div>
          <h2 className={`font-serif text-xl font-bold ${isDarkMode ? 'text-stone-50' : 'text-stone-950'}`}>जय जिनेन्द्र, ज्योतिर्मय! 🙏</h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>आज का दिन मंगलमय हो</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCustomizerOpen(true)}
            className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-stone-850 border-stone-700 text-stone-300 hover:text-stone-100 hover:bg-stone-800' 
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title="Customize Dashboard"
          >
            <Sliders size={15} />
          </button>
          
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-xl text-center shadow-xs flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-200 fill-current" />
            <div>
              <span className="text-base font-mono font-bold block leading-none">12</span>
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-90">Days Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC CARD GRID (1 col mobile, 2 cols tablet, 3 cols desktop) with consistent card heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full items-stretch">

        {/* PARYUSHANA MAHAPARVA COUNTDOWN TIMER CARD */}
        <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-4 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-stone-900/90 to-stone-950/90 border-stone-800 text-stone-100 shadow-none' 
            : 'bg-gradient-to-b from-orange-50/20 to-amber-50/30 border-stone-200/65 text-stone-800 shadow-xs'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-xl shrink-0 ${isDarkMode ? 'bg-orange-950/40 text-orange-400' : 'bg-orange-100/60 text-orange-600'}`}>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    paryushanaCountdown.isLive 
                      ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' 
                      : isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {paryushanaCountdown.isLive ? '● LIVE NOW' : 'पर्युषण पर्व'}
                  </span>
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    Mahaparva
                  </span>
                </div>
                <h3 className={`font-serif text-base font-bold mt-1 tracking-wide ${isDarkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                  पर्युषण महापर्व काउंटडाउन
                </h3>
              </div>
            </div>
          </div>

          {/* Countdown Display Grid */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            {paryushanaCountdown.isLive ? (
              <div className={`text-center py-3 px-4 rounded-xl border ${
                isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-200/40'
              }`}>
                <p className="text-xl font-serif font-black text-emerald-600 dark:text-emerald-400 animate-pulse leading-none">
                  महापर्वराज पर्युषण चालू है! 🙏
                </p>
                <p className={`text-[10px] mt-2 font-bold leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  आत्म-मंथन, तपस्या, स्वाध्याय एवं क्षमापना का पावन अवसर।
                </p>
              </div>
            ) : paryushanaCountdown.isPast ? (
              <div className="text-center py-3">
                <p className="text-sm font-serif font-bold text-stone-500">
                  पर्युषण पर्व सम्पन्न हो चुका है।
                </p>
                <p className="text-[10px] text-stone-400 mt-1 font-mono">मिच्छामि दुक्कड़म्! 🙏</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Days block */}
                <div className={`p-2 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-stone-950/80 border-stone-800' : 'bg-white border-stone-200/50 shadow-2xs'
                }`}>
                  <div className="text-2xl font-mono font-bold text-orange-500 dark:text-orange-400 leading-none">
                    {String(paryushanaCountdown.days).padStart(2, '0')}
                  </div>
                  <div className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    Days
                  </div>
                  <div className={`text-[8px] font-medium opacity-80 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    दिन
                  </div>
                </div>

                {/* Hours block */}
                <div className={`p-2 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-stone-950/80 border-stone-800' : 'bg-white border-stone-200/50 shadow-2xs'
                }`}>
                  <div className="text-2xl font-mono font-bold text-orange-500 dark:text-orange-400 leading-none">
                    {String(paryushanaCountdown.hours).padStart(2, '0')}
                  </div>
                  <div className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    Hours
                  </div>
                  <div className={`text-[8px] font-medium opacity-80 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    घंटे
                  </div>
                </div>

                {/* Minutes block */}
                <div className={`p-2 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-stone-950/80 border-stone-800' : 'bg-white border-stone-200/50 shadow-2xs'
                }`}>
                  <div className="text-2xl font-mono font-bold text-orange-500 dark:text-orange-400 leading-none">
                    {String(paryushanaCountdown.minutes).padStart(2, '0')}
                  </div>
                  <div className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    Mins
                  </div>
                  <div className={`text-[8px] font-medium opacity-80 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    मिनट
                  </div>
                </div>

                {/* Seconds block */}
                <div className={`p-2 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-stone-950/80 border-stone-800' : 'bg-white border-stone-200/50 shadow-2xs'
                }`}>
                  <div className="text-2xl font-mono font-bold text-orange-500 dark:text-orange-400 leading-none">
                    {String(paryushanaCountdown.seconds).padStart(2, '0')}
                  </div>
                  <div className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    Secs
                  </div>
                  <div className={`text-[8px] font-medium opacity-80 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    सेकंड
                  </div>
                </div>
              </div>
            )}

            <div className={`p-2 rounded-lg text-center text-[10px] font-medium ${
              isDarkMode ? 'bg-stone-950/30 text-stone-400' : 'bg-stone-50 text-stone-500'
            }`}>
              📅 तिथि: <span className="font-semibold text-orange-600 dark:text-orange-400">भाद्रपद कृष्ण द्वादशी से शुक्ल चतुर्थी</span> (7-15 सितम्बर)
            </div>
          </div>

          {/* Quick-action to redirect to Sadhana tab */}
          <button 
            onClick={() => setActiveTab('sadhana')}
            className={`w-full text-center text-xs font-bold uppercase tracking-wider transition-colors px-2.5 py-2.5 rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${
              isDarkMode 
                ? 'bg-orange-500/10 border-orange-950/45 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20' 
                : 'bg-orange-500 text-white border-transparent hover:bg-orange-600 shadow-sm shadow-orange-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>साधना की तैयारी करें (Prepare Sadhana)</span>
          </button>
        </div>

        {/* 4. VIHAR STATUS CARD */}
        {preferences.quick_actions && (
          <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-4 ${
            isDarkMode 
              ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
              : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${isDarkMode ? 'bg-stone-800 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>📍</div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-500 font-semibold'}`}>Vihar Status</h4>
                <p className={`text-xs mt-1 leading-tight ${isDarkMode ? 'text-stone-200' : 'text-stone-900 font-bold'}`}>Acharya Shri Mahashraman Ji is currently in Jain Vishva Bharati, Ladnun, Rajasthan.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveProvince('DELHI');
                document.getElementById('monastic-itinerary-deck')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full text-center text-xs font-bold uppercase tracking-wider transition-colors px-2.5 py-2 rounded-lg border cursor-pointer ${
                isDarkMode 
                  ? 'bg-stone-800 border-stone-700/60 text-orange-400 hover:text-orange-300' 
                  : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
              }`}
            >
              Track
            </button>
          </div>
        )}

        {/* MY SAVED SAINTS QUICK-ACCESS DECK */}
        {preferences.quick_links && (
          <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-3 ${
            isDarkMode 
              ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
              : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
          }`}>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <h3 className={`font-serif text-base font-bold ${isDarkMode ? 'text-stone-50' : 'text-stone-950'}`}>
                  My Saved Saints (सहेजे गए संत)
                </h3>
              </div>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'text-amber-700 bg-amber-50'}`}>
                {savedSaints.length} PINNED
              </span>
            </div>

            {savedSaints.length === 0 ? (
              <div className={`p-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-1 flex-1 ${isDarkMode ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50/50 border-stone-200'}`}>
                <span className="text-xl">⭐️</span>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>No saints or centers pinned yet.</p>
                <p className={`text-[10px] leading-normal max-w-[280px] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                  Tap the star icon next to entries in the Monastic Directory or Saints List to pin vital contacts here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 flex-1">
                {savedSaints.map((saint) => (
                  <div 
                    key={saint.id} 
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${isDarkMode ? 'bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-900/60' : 'bg-stone-50/60 border-stone-150 text-stone-700 hover:bg-stone-50'}`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-wider ${isDarkMode ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-orange-50 text-orange-700 border border-orange-200/30'}`}>
                          {saint.rank}
                        </span>
                        <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-stone-100' : 'text-stone-900'}`}>{saint.name}</h4>
                      </div>
                      <span className={`text-[10px] truncate mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        📍 {saint.loc}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      {saint.contact && (
                        <a 
                          href={`tel:${saint.contact}`}
                          className={`p-1.5 rounded-lg border transition-all ${isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 hover:bg-emerald-950/60' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200/30'}`}
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => removeSavedSaint(saint.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isDarkMode ? 'bg-rose-950/40 text-rose-400 border-rose-900/30 hover:bg-rose-950/60' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200/30'}`}
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. MONASTIC ITINERARY SYSTEM WITH SMOOTH REGIONAL FILTERING */}
        {preferences.quick_links && (
          <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-3 ${
            isDarkMode 
              ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
              : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
          }`} id="monastic-itinerary-deck">
            <div className="flex justify-between items-center w-full">
              <div>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest rounded-md w-fit px-2 py-0.5 ${isDarkMode ? 'bg-orange-500/15 text-orange-400' : 'text-orange-700 bg-orange-50'}`}>
                  क्षेत्रीय धवल सेना अपडेट
                </span>
                <h3 className={`font-serif text-base font-bold mt-1 ${isDarkMode ? 'text-stone-50' : 'text-stone-950'}`}>
                  पदविहार प्रवास सूची (Live Updates)
                </h3>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${isDarkMode ? 'bg-stone-950 text-stone-400' : 'bg-stone-100 text-stone-600'}`}>05 JUL 2026</span>
            </div>

            {/* Tab Strip Selector */}
            <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-none text-[10px] font-bold w-full border-b shrink-0 ${isDarkMode ? 'border-stone-800' : 'border-stone-100'}`}>
              {Object.keys(PROVINCE_DATA).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => { setActiveProvince(prov); setSearchQuery(''); }}
                  className={`px-3 py-1.5 rounded-xl uppercase tracking-wider shrink-0 transition-all cursor-pointer ${activeProvince === prov ? 'bg-orange-500 text-white shadow-xs' : isDarkMode ? 'bg-stone-950 text-stone-400 border border-stone-800 hover:bg-stone-900' : 'bg-stone-50 text-stone-500 border border-stone-200/40 hover:bg-stone-100'}`}
                >
                  {prov}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input 
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-orange-300 transition-all ${isDarkMode ? 'bg-stone-950 border-stone-800 text-stone-200 placeholder-stone-600' : 'bg-white border-stone-200 text-stone-800 placeholder-stone-400'}`}
            />

            {/* Dynamic Card Roster Container */}
            <div className="flex flex-col gap-3 max-h-[290px] overflow-y-auto pr-1 pb-1 w-full mt-1 flex-1">
              {((PROVINCE_DATA[activeProvince as keyof typeof PROVINCE_DATA]) || [])
                .filter(monk => 
                  monk.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  monk.loc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((monk, index) => (
                <div key={`${activeProvince}-${index}`} className={`p-3 rounded-xl border flex flex-col gap-2 relative transition-all ${isDarkMode ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50/70 border-stone-200/60'}`}>
                  <span className={`absolute top-3 right-3 text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded uppercase font-mono ${isDarkMode ? 'bg-stone-900 text-stone-400' : 'bg-stone-200 text-stone-600'}`}>
                    {activeProvince}
                  </span>
                  <div className="flex items-center gap-1.5 w-full">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/30'}`}>
                      {monk.tag}
                    </span>
                    <h4 className={`text-xs font-bold pr-14 leading-tight ${isDarkMode ? 'text-stone-100' : 'text-stone-950'}`}>{monk.name}</h4>
                  </div>
                  <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    📍 <span className={`font-semibold ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>प्रवास स्थल:</span> {monk.loc}
                  </p>
                  <div className={`flex items-center justify-end text-[11px] border-t pt-2 mt-0.5 font-mono ${isDarkMode ? 'border-stone-800' : 'border-stone-200/40'}`}>
                    <a href={`tel:${monk.contact}`} className={`font-bold text-[10px] px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all active:scale-95 ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-950/40' : 'bg-orange-50 text-orange-600 border-orange-100/60'}`}>
                      📞 {monk.contact}
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(monk.contact);
                      }}
                      className={`ml-2 p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-stone-900 hover:bg-stone-850 text-stone-400' : 'bg-stone-100 hover:bg-stone-200'}`}
                      title="Copy contact"
                    >
                      <Copy className="w-3 h-3 text-stone-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSaveItinerary(monk);
                      }}
                      className={`ml-2 p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-stone-900 hover:bg-stone-850 text-stone-400' : 'bg-stone-100 hover:bg-stone-200'}`}
                      title={savedSaints.some((s: any) => s.id === `itinerary-${monk.name}`) ? "Remove from Favorites" : "Save to Favorites"}
                    >
                      <Star className={`w-3 h-3 ${savedSaints.some((s: any) => s.id === `itinerary-${monk.name}`) ? 'text-amber-500 fill-amber-400' : 'text-stone-400'}`} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Knowledge Base matching items */}
              {searchQuery.trim() !== '' && (
                <>
                  <div className="border-t pt-3 mt-1 pb-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest rounded-md w-fit px-2.5 py-1 ${isDarkMode ? 'bg-orange-500/15 text-orange-400' : 'text-orange-700 bg-orange-50'}`}>
                      📖 जैन ज्ञान एवं इतिहास (Knowledge Results)
                    </span>
                  </div>
                  {filteredKnowledge.length === 0 ? (
                    <p className="text-[11px] text-stone-500 italic px-2">No matching knowledge items found.</p>
                  ) : (
                    filteredKnowledge.map((item: any, idx: number) => (
                      <div key={`knowledge-${item.id}-${idx}`} className={`p-3 rounded-xl border flex flex-col gap-1.5 relative transition-all ${isDarkMode ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50/70 border-stone-200/60'}`}>
                        <span className={`absolute top-3 right-3 text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded uppercase font-mono ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                          {item.category}
                        </span>
                        <h4 className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-stone-100' : 'text-stone-950'}`}>{item.title}</h4>
                        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          {item.description}
                        </p>
                        {item.details && (
                          <p className={`text-[10px] italic border-t pt-1.5 mt-0.5 ${isDarkMode ? 'border-stone-800 text-stone-500' : 'border-stone-200/40 text-stone-500'}`}>
                            {item.details}
                          </p>
                        )}
                      </div>
                    ))
                  )}

                  {/* Acharya Records matching items */}
                  <div className="border-t pt-3 mt-1 pb-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest rounded-md w-fit px-2.5 py-1 ${isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'text-amber-700 bg-amber-50'}`}>
                      👑 आचार्यश्री इतिहास (Acharya Records)
                    </span>
                  </div>
                  {filteredAcharyas.length === 0 ? (
                    <p className="text-[11px] text-stone-500 italic px-2">No matching Acharya records found.</p>
                  ) : (
                    filteredAcharyas.map((acharya: any, idx: number) => (
                      <div key={`acharya-${acharya.nr}-${idx}`} className={`p-3 rounded-xl border flex flex-col gap-1.5 relative transition-all ${isDarkMode ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50/70 border-stone-200/60'}`}>
                        <div className="flex items-center gap-2">
                          {acharya.img && (
                            <img src={acharya.img} alt={acharya.name} className="w-8 h-8 rounded-full object-cover border border-amber-500" referrerPolicy="no-referrer" />
                          )}
                          <div>
                            <h4 className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-stone-100' : 'text-stone-950'}`}>{acharya.name}</h4>
                            <span className="text-[9px] text-amber-500 font-medium">{acharya.title}</span>
                          </div>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          {acharya.desc}
                        </p>
                        {acharya.quote && (
                          <p className={`text-[10px] italic border-t pt-1.5 mt-0.5 ${isDarkMode ? 'border-stone-800 text-stone-500' : 'border-stone-200/40 text-stone-500'}`}>
                            &ldquo;{acharya.quote}&rdquo;
                          </p>
                        )}
                        <button
                          onClick={() => setActiveTab('knowledge')}
                          className="text-[10px] text-orange-500 font-semibold self-end hover:underline mt-1 cursor-pointer"
                        >
                          Learn more in Knowledge Tab &rarr;
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* COMMUNITY POLLS COMPONENT */}
        {preferences.quick_links && (
          <div className="md:col-span-2 lg:col-span-3">
            <CommunityPolls user={user} setIsLoginModalOpen={setIsLoginModalOpen} />
          </div>
        )}

        {/* DAILY VACHAN CARD */}
        <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-3 ${
          isDarkMode 
            ? 'bg-amber-950/20 border-amber-900/30 text-stone-100' 
            : 'bg-amber-50/60 border-amber-150 text-stone-800 shadow-xs'
        }`}>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500">📜</span>
              <span className={`font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>DAILY VACHAN</span>
            </div>
            <span className={`${isDarkMode ? 'text-stone-400' : 'text-stone-500'} font-bold`}>गुरुदेव पावन वचन</span>
          </div>
          <div className="flex-1 flex flex-col justify-center py-2">
            <p className="text-sm font-serif font-bold leading-relaxed italic">
              “मनुष्य का जीवन केवल खाने और भोगने के लिए नहीं है, वह साधना और आत्म-शुद्धि का अनुपम अवसर है। संयम ही जीवन की वास्तविक निधि है।”
            </p>
            <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-extrabold mt-2 block">
              — आचार्य श्री महाश्रमण जी (धवल सेना)
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('vachan')}
            className="w-full mt-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer"
          >
            <span>दर्शन एवं वाचन (View Daily Vachan)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6. DAILY SUVICHAR ENGINE LAYER */}
        <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-3 ${
          isDarkMode 
            ? 'bg-emerald-950/20 border-emerald-900/30 text-stone-100' 
            : 'bg-emerald-50/70 border-emerald-100/60 text-stone-800 shadow-xs'
        }`}>
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-800 bg-emerald-100/60'}`}>आज का सुविचार — 05 JULY 2026</span>
          </div>
          <div className="min-h-[50px] flex-1 flex flex-col justify-center">
            <p className={`text-base font-serif font-bold leading-relaxed ${isDarkMode ? 'text-stone-50' : 'text-stone-950'}`}>“{SUVICHAR_BANK[quoteIndex].text}”</p>
            <p className={`text-xs font-medium mt-1.5 flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <span className={`w-4 h-[1px] ${isDarkMode ? 'bg-emerald-500/50' : 'bg-emerald-400'}`}></span>{SUVICHAR_BANK[quoteIndex].author}
            </p>
          </div>
          <div className={`grid grid-cols-3 gap-2 pt-2 border-t ${isDarkMode ? 'border-emerald-950/30' : 'border-emerald-100/40'}`}>
            <button className={`flex items-center justify-center gap-1 py-1.5 border rounded-xl text-xs font-semibold active:scale-95 transition-transform ${isDarkMode ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-600'}`}><Share2 className="w-3.5 h-3.5" /> Share</button>
            <button className={`flex items-center justify-center gap-1 py-1.5 border rounded-xl text-xs font-semibold active:scale-95 transition-transform ${isDarkMode ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-600'}`}><Bookmark className="w-3.5 h-3.5" /> Save</button>
            <button onClick={() => setQuoteIndex((prev) => (prev + 1) % SUVICHAR_BANK.length)} className="flex items-center justify-center gap-1 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform cursor-pointer">Next <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* 7. SPIRITUAL CHRONOMETER AND SUN CALCULATOR */}
        <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-4 ${
          isDarkMode 
            ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
            : 'bg-stone-950/75 border-stone-900 text-stone-100'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 bg-stone-800 px-2 py-1 rounded-md tracking-wider uppercase">⏱️ 4th Prahar (Day)</span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Solar Lifecycle</span>
          </div>
          <div className="text-center py-2.5 rounded-xl bg-stone-950/40 border border-stone-800/40">
            <div className="text-3xl font-mono font-bold text-amber-400 tracking-widest">{timeString}</div>
            <div className="text-[10px] text-stone-500 mt-1 font-mono">Sunday, July 5 • आषाढ़ कृष्ण पक्ष -05 (2083)</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-orange-950/20 text-orange-400 border border-orange-950/60"><div className="text-[9px] font-bold uppercase opacity-70">SUNRISE</div><div className="text-sm font-mono font-bold mt-0.5">06:01:12 AM</div></div>
            <div className="p-3 rounded-xl bg-amber-950/20 text-amber-400 border border-amber-950/60"><div className="text-[9px] font-bold uppercase opacity-70">NAVKARSI</div><div className="text-sm font-mono font-bold mt-0.5">06:49:12 AM</div></div>
            <div className="p-3 rounded-xl bg-yellow-950/20 text-yellow-400 border border-yellow-950/60"><div className="text-[9px] font-bold uppercase opacity-70">PAURUSHI</div><div className="text-sm font-mono font-bold mt-0.5">09:27:30 AM</div></div>
            <div className="p-3 rounded-xl bg-purple-950/20 text-purple-400 border border-purple-950/60"><div className="text-[9px] font-bold uppercase opacity-70">SUNSET</div><div className="text-sm font-mono font-bold mt-0.5">07:44:05 PM</div></div>
          </div>
          <div className="w-full bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-2.5 text-center text-xs text-emerald-400 font-semibold">
            ✨ APPROXIMATE TITHI: आषाढ़ कृष्ण पक्ष, पंचमी (5)
          </div>
        </div>

        {/* 7.1. DYNAMIC LUNAR MOON PHASE & TITHI WIDGET */}
        <MoonPhaseWidget isDarkMode={isDarkMode} setActiveTab={setActiveTab} />

        {/* DARSHAN GALLERY CARD (Migrated from Footer) */}
        <div className={`w-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
          isDarkMode 
            ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
            : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                स्मृतियाँ
              </span>
              <h3 className={`font-serif text-sm font-bold ${isDarkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                Darshan Gallery
              </h3>
            </div>
            <button 
              onClick={() => setActiveTab('gallery')}
              className="text-[10px] font-bold text-orange-500 hover:text-orange-600 active:scale-95 transition-transform cursor-pointer"
            >
              VIEW ALL ➔
            </button>
          </div>

          {/* Horizontal Scrollable Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {[
              { id: 1, img: "https://i.postimg.cc/vmrrKKDp/4f9ba4b7a8d6fd8a83f711595c3f3242-3.jpg", title: "आचार्य श्री" },
              { id: 2, img: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=200&q=80", title: "प्रवास" },
              { id: 3, img: "https://images.unsplash.com/photo-1582560469780-e83f2a87a1d1?auto=format&fit=crop&w=200&q=80", title: "समारोह" },
              { id: 4, img: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=200&q=80", title: "अणुव्रत" }
            ].map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5 shrink-0 w-24 snap-start">
                <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-stone-200/50 dark:border-stone-700/50 relative group cursor-pointer" onClick={() => setActiveTab('gallery')}>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                </div>
                <span className={`text-[9px] text-center font-bold uppercase tracking-wide ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* THE CANONICAL UNIFIED WINGS MATRIX - FULL GRAPHICAL BRANDING UPGRADE */}
        <div className={`w-full h-full p-5 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-4 ${
          isDarkMode 
            ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
            : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
        }`}>
          <div>
            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'text-emerald-700 bg-emerald-50'}`}>
              धर्मसंघीय संस्थाएं
            </span>
            <h3 className={`font-serif text-base font-bold mt-1 ${isDarkMode ? 'text-stone-50' : 'text-stone-950'}`}>
              Unified Wings (सामुदायिक संगठन)
            </h3>
          </div>

          {/* Definitive 2-Row Grid rendering high-definition official logo assets */}
          <div className="grid grid-cols-3 gap-y-5 gap-x-2 pt-1 w-full flex-1">
            {[
              { id: "TPF", logo: "https://i.postimg.cc/ydXQL3gn/logo-1.png", padding: "p-0" },
              { id: "ABTYP", logo: "https://i.postimg.cc/Pqf904hh/Abtyp-logo.png", padding: "p-1.5" },
              { id: "ABTMM", logo: "https://i.postimg.cc/VNbZy9dT/dz5x1oj15hmj06kinnr0.jpg", padding: "p-0" },
              { id: "ANUVIBHA", logo: "https://i.postimg.cc/tg92YCmK/Anuvibha-logo.png", padding: "p-1" },
              { id: "GYANSHALA", logo: "https://i.postimg.cc/fR5DtNCD/Gyanshala-2.png", padding: "p-1.5" },
              { id: "TERAPANTH", logo: "https://i.postimg.cc/vmrrKKDp/4f9ba4b7a8d6fd8a83f711595c3f3242-3.jpg", padding: "p-0" }
            ].map((wing) => (
              <div key={wing.id} className="flex flex-col items-center justify-center gap-1.5 w-full">
                <div className={`w-14 h-14 rounded-full shadow-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:border-orange-300 overflow-hidden ${wing.padding} ${isDarkMode ? 'bg-stone-950 border border-stone-800' : 'bg-white border border-stone-200/60'}`}>
                  <img 
                    src={wing.logo} 
                    alt={`${wing.id} Official Logo`} 
                    className="w-full h-full object-contain select-none"
                    loading="lazy"
                  />
                </div>
                <span className={`text-[10px] font-bold tracking-wide uppercase block text-center mt-0.5 select-none ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {wing.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 9. REFINEMENT TRACK FOR CHECKLIST AND QUIZ CORES */}
        <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-4 ${
          isDarkMode 
            ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
            : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
        }`}>
          <div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isDarkMode ? 'text-purple-400 bg-purple-500/15' : 'text-purple-600 bg-purple-50'}`}>Knowledge Test (ज्ञान परीक्षा)</span>
            <h3 className={`font-serif text-base font-bold mt-1 leading-snug ${isDarkMode ? 'text-stone-50' : 'text-stone-950'}`}>अजीव तत्व के कुल कितने मुख्य भेद जैन आगमों में वर्णित हैं?</h3>
          </div>
          <div className="flex flex-col gap-2 w-full flex-1 justify-center">
            {['क. ५ भेद', 'ख. ६ भेद', 'ग. ९ भेद'].map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setQuizAnswered(idx)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                  quizAnswered === idx 
                    ? idx === 1 
                      ? isDarkMode ? 'bg-emerald-950/45 border-emerald-500/50 text-emerald-400 font-medium' : 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium' 
                      : isDarkMode ? 'bg-rose-950/45 border-rose-500/50 text-rose-400' : 'bg-rose-50 border-rose-500 text-rose-900' 
                    : isDarkMode ? 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-850' : 'bg-stone-50 border-stone-150 text-stone-700 hover:bg-stone-100/60'
                }`}
              >
                <span>{opt}</span>
                {quizAnswered !== null && idx === 1 && <span className="text-emerald-500 font-bold">✓ Right</span>}
                {quizAnswered === idx && idx !== 1 && <span className="text-rose-500 font-bold">✗ Wrong</span>}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* COMPLETELY REFACTORED PREMIUM LIGHT-THEME ABOUT US & FOOTER */}
      <div className="clear-both w-full block mt-4 mb-6 px-1">
        <div className={`w-full p-5 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col gap-4 ${
          isDarkMode 
            ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
            : 'bg-white/80 border-stone-200/70 text-stone-800 shadow-2xs'
        }`}>
          
          {/* Clean Monastic Header Section */}
          <div className={`flex items-center gap-3 border-b pb-3 ${isDarkMode ? 'border-stone-800' : 'border-stone-100'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-base select-none ${isDarkMode ? 'bg-orange-500/15 border border-orange-900/40 text-orange-400' : 'bg-orange-50 border border-orange-200 text-orange-600'}`}>
              ॐ
            </div>
            <div className="flex flex-col">
              <h3 className={`font-serif text-sm font-bold tracking-wide ${isDarkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                जैन श्वेतांबर तेरापंथ धर्मसंघ
              </h3>
              <p className={`text-[9px] uppercase tracking-widest font-extrabold mt-0.5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Unified Knowledge Hub • v2.6
              </p>
            </div>
          </div>

          {/* Elegant Descriptions */}
          <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            यह एप्लिकेशन जैन श्वेतांबर तेरापंथ धर्मसंघ के समृद्ध इतिहास, पूज्य आचार्यों के पावन दर्शन, आगम सम्मत सिद्धांतों, दैनिक आध्यात्मिक चर्या (सामायिक, प्रतिक्रमण) और समसामयिक विहार प्रवास के विवरण को आधुनिकतम तकनीक के माध्यम से सुलभ कराने का एक एकीकृत प्रयास है।
          </p>

          {/* Grid Pillar Components */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold mt-1">
            <div className={`border rounded-xl p-2.5 flex items-center gap-2 ${isDarkMode ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-stone-50/60 border border-stone-150 text-stone-700'}`}>
              <span className="text-orange-500 text-xs">✨</span> आचार्य तुलसी कृत अणुव्रत आंदोलन
            </div>
            <div className={`border rounded-xl p-2.5 flex items-center gap-2 ${isDarkMode ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-stone-50/60 border border-stone-150 text-stone-700'}`}>
              <span className="text-emerald-500 text-xs">✨</span> आचार्य महाप्रज्ञ प्रणीत प्रेक्षा ध्यान
            </div>
          </div>

          {/* Metadata and Digital Desk Signatures */}
          <div className={`border-t pt-3 mt-1 flex flex-col gap-2.5 text-[11px] font-medium ${isDarkMode ? 'border-stone-800 text-stone-400' : 'border-stone-200 text-stone-600'}`}>
            <div className="flex justify-between items-center gap-4">
              <span>संकलन सहयोग:</span>
              <span className={`text-right ${isDarkMode ? 'text-stone-200 font-semibold' : 'text-stone-900 font-bold'}`}>Jain Shwetambar Terapanth (Terapanth)</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span>तकनीकी प्रबंधन:</span>
              <span className={`text-right font-mono text-[10px] ${isDarkMode ? 'text-stone-300 font-semibold' : 'text-stone-900 font-bold'}`}>Terapanth AI Core Developers</span>
            </div>
            
            {/* Safe Base Padding to Avoid Bottom Bar Collisions */}
            <p className={`text-center text-[10px] font-mono tracking-wider mt-4 border-t pt-3 pb-2 ${isDarkMode ? 'border-stone-800 text-stone-600' : 'border-stone-200 text-stone-500 font-semibold'}`}>
              © 2026 JAIN TERAPANTH DHARMASANGH. ALL RIGHTS RESERVED.
            </p>
          </div>

        </div>
      </div>

      {/* FIXED POSITIONED SYSTEM FLOATING NAVIGATION INTERACTION BAR BUTTONS */}
      <DashboardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        user={user}
        onPreferencesChanged={(newPrefs) => setPreferences(newPrefs)}
      />

    </div>
  );
}

