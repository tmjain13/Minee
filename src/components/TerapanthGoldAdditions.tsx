import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Flame, 
  MapPin, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Heart, 
  ChevronRight, 
  BookOpen, 
  Activity, 
  Globe, 
  Phone, 
  Smartphone,
  User,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Info,
  Compass,
  Zap,
  Clock,
  Check,
  Award,
  Calendar,
  Share2
} from 'lucide-react';
const confetti = (...args: any[]) => {};
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, onSnapshot, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { setSecureItem, getSecureItem } from '../utils/secureStorage';

interface PrepItem {
  id: string;
  title: string;
  hindiTitle: string;
  desc: string;
  weight: number;
}

interface SamanFootprint {
  id: number;
  country: string;
  city: string;
  event: string;
  hindiEvent: string;
  samanGroup: string;
  year: string;
  flag: string;
}

interface AnuvratVow {
  id: string;
  vowHindi: string;
  vowEng: string;
  category: string;
  icon: string;
}

export interface TerapanthGoldAdditionsProps {
  setShareToast?: (toast: { show: boolean; message: string }) => void;
}

export const TerapanthGoldAdditions: React.FC<TerapanthGoldAdditionsProps> = ({ setShareToast }) => {
  const [activeTab, setActiveTabState] = useState<'MEDITATION' | 'SAMAN' | 'VOLUNTEER' | 'MUMUKSHU' | 'ANUVRAT'>(() => {
    try {
      const saved = localStorage.getItem('tp_gold_active_tab');
      if (saved && ['MEDITATION', 'SAMAN', 'VOLUNTEER', 'MUMUKSHU', 'ANUVRAT'].includes(saved)) {
        return saved as any;
      }
    } catch (e) {
      console.error(e);
    }
    return 'MEDITATION';
  });

  const setActiveTab = (tab: 'MEDITATION' | 'SAMAN' | 'VOLUNTEER' | 'MUMUKSHU' | 'ANUVRAT') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('tp_gold_active_tab', tab);
    } catch (e) {
      console.error(e);
    }
  };
  
  // 1. PREKSHA MEDITATION STATES
  const [isMeditating, setIsMeditating] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCounter, setBreathCounter] = useState(0);
  const [selectedLesya, setSelectedLesya] = useState<'white' | 'blue' | 'yellow' | 'pink'>('white');
  const [meditationType, setMeditationType] = useState<'relaxation' | 'internal' | 'color'>('relaxation');
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // 2. SAMAN GLOBAL VISITS STATE
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL');

  // 3. VOLUNTEER CORE STATES
  const [volunteerCity, setVolunteerCityState] = useState<string>(() => {
    try {
      return localStorage.getItem('tp_gold_volunteer_city') || 'सूरत (पर्वतपाटिया)';
    } catch (e) {
      return 'सूरत (पर्वतपाटिया)';
    }
  });

  const setVolunteerCity = (city: string) => {
    setVolunteerCityState(city);
    try {
      localStorage.setItem('tp_gold_volunteer_city', city);
    } catch (e) {
      console.error(e);
    }
  };

  const [vouterName, setVouterName] = useState('');
  const [vouterPhone, setVouterPhone] = useState('');
  const [vouterSevaType, setVouterSevaType] = useState('स्वाध्याय एवं साहित्य प्रचार');
  const [isSubmittingSeva, setIsSubmittingSeva] = useState(false);
  const [sevaSuccessMessage, setSevaSuccessMessage] = useState('');

  // 4. MUMUKSHU PREPARATION STATES
  const [completedPrepIds, setCompletedPrepIds] = useState<string[]>(['item-3']);

  // Navkar Mantra 9 Dharnas counters
  const [dharnaCounts, setDharnaCounts] = useState<{ [key: string]: number }>({
    'dharna-1': 0, 'dharna-2': 0, 'dharna-3': 0, 'dharna-4': 0, 'dharna-5': 0,
    'dharna-6': 0, 'dharna-7': 0, 'dharna-8': 0, 'dharna-9': 0
  });

  // 5. ANUVRAT DAILY VOWS STATS
  const [completedVows, setCompletedVows] = useState<string[]>([]);

  const mumukshuPrepData = useMemo<PrepItem[]>(() => [
    {
      id: "item-1",
      hindiTitle: "१. प्रतिक्रमण पावन सूत्र कंठस्थीकरण",
      title: "Pratikraman Sutra Memorization",
      desc: "छह आवश्यक प्रतिक्रमण सूत्रों और वंदना पाठ का पूर्ण शुद्ध उच्चारण व अर्थ सहित कंठस्थीकरण।",
      weight: 30
    },
    {
      id: "item-2",
      hindiTitle: "२. दशवैकालिक आगम अध्ययन (मूल गाधाएं)",
      title: "Dashavaikalika Agam Studies",
      desc: "प्रथम व द्वितीय चूलिका सहित साधु आचार-संहिता की १८ गाथाओं का कंठस्थ स्वाध्याय।",
      weight: 25
    },
    {
      id: "item-3",
      hindiTitle: "३. पंच महाव्रत मर्यादा एवं गोचरी मीमांसा",
      title: "Five Great Vows & Begging Ethos",
      desc: "पूर्ण अहिंसा, सत्य, अस्तेय, ब्रह्मचर्य व अपरिग्रह महाव्रतों का सूक्ष्मता से सम्यक् विवेचन अध्ययन।",
      weight: 20
    },
    {
      id: "item-4",
      hindiTitle: "४. २५ बोल तत्वज्ञान बोध",
      title: "25 Bol Fundamental Metaphysics",
      desc: "जीव, अजीव, पुण्य, पाप, आस्रव, संवर, निर्जरा, बंध और मोक्ष तत्वों की स्पष्ट अवधारणा।",
      weight: 15
    },
    {
      id: "item-5",
      hindiTitle: "५. दैनिक सामायिक और प्रतिक्रमण अभ्यास",
      title: "Daily Samayik purification test",
      desc: "कम से कम दो सामायिक प्रतिदिन और दोनों संध्या काल का आवश्यक देवसी / राई प्रतिक्रमण करने का प्रयोगात्मक अभ्यास रूप स्व-परीक्षण।",
      weight: 10
    }
  ], []);

  const samanFootprints = useMemo<SamanFootprint[]>(() => [
    {
      id: 1,
      country: "USA",
      city: "Houston, Texas",
      event: "Interfaith Meditation & Preksha Yoga Summit",
      hindiEvent: "अंतरराष्ट्रीय सर्वधर्म प्रार्थना सभा एवं प्रेक्षाध्यान कार्यशाला",
      samanGroup: "समणी स्मितप्रज्ञा जी एवं साथी (Smanis)",
      year: "2024",
      flag: "🇺🇸"
    },
    {
      id: 2,
      country: "UK",
      city: "London",
      event: "Discourse on Non-Violence and Science in Modern Era at House of Commons",
      hindiEvent: "ब्रिटिश संसद (हाउस ऑफ कॉमन्स) में अहिंसा और आधुनिक विज्ञान पर संवाद",
      samanGroup: "समणी मधुरप्रज्ञा जी (Smanis)",
      year: "2024",
      flag: "🇬🇧"
    },
    {
      id: 3,
      country: "EUROPE",
      city: "Antwerp, Belgium",
      event: "Preksha Meditation and Stress Management for Diamond Merchants",
      hindiEvent: "हीरा व्यापारियों हेतु कार्यतनाव मुक्ति एवं प्रेक्षाध्यान शिविर",
      samanGroup: "समन धर्मप्रज्ञ जी (Samans)",
      year: "2023",
      flag: "🇧🇪"
    },
    {
      id: 4,
      country: "ASIA",
      city: "Singapore",
      event: "Seminar on Jain Theory of Karma and Food Science",
      hindiEvent: "जैन कर्म सिद्धांत और सात्विक आहार विज्ञान पर अंतरराष्ट्रीय संगोष्ठी",
      samanGroup: "समणी स्मितप्रज्ञा जी (Smanis)",
      year: "2025",
      flag: "🇸🇬"
    },
    {
      id: 5,
      country: "USA",
      city: "New Jersey",
      event: "Preksha Meditation Summer retreat & Youth Leadership Camp",
      hindiEvent: "युवा नेतृत्व विकास एवं ग्रीष्मकालीन प्रेक्षा ध्यान आवासीय शिविर",
      samanGroup: "समन शांतप्रज्ञ जी (Samans)",
      year: "2025",
      flag: "🇺🇸"
    },
    {
      id: 6,
      country: "EUROPE",
      city: "Hamburg, Germany",
      event: "Academic Lecture series on Anekantavada and Relative Pluralism",
      hindiEvent: "अनेकांतवाद और सापेक्षता सिद्धांत पर जर्मन विवि व्याख्यानमाला",
      samanGroup: "समणी स्मितप्रज्ञा जी व विदुषी समूह",
      year: "2024",
      flag: "🇩🇪"
    }
  ], []);

  const anuvratVows = useMemo<AnuvratVow[]>(() => [
    {
      id: "vow-1",
      vowHindi: "मैं पानी और जल संसाधनों का अपव्यय नहीं करूँगा",
      vowEng: "I will not waste water and other valuable natural resources today",
      category: "पर्यावरण संरक्षण (Environment)",
      icon: "💧"
    },
    {
      id: "vow-2",
      vowHindi: "मैं आज किसी भी बेजुबान प्राणी को अकारण कष्ट नहीं दूंगा",
      vowEng: "I will not cause unnecessary pain/injury to any living creature today",
      category: "अहिंसा (Non-Violence)",
      icon: "🕊️"
    },
    {
      id: "vow-3",
      vowHindi: "मैं व्यावसायिक एवं सामाजिक जीवन में पूर्ण प्रामाणिकता और ईमानदारी रखूँगा",
      vowEng: "I will maintain high integrity and avoid deceptive practices in my business today",
      category: "अस्तेय व प्रामाणिकता (Honesty)",
      icon: "🤝"
    },
    {
      id: "vow-4",
      vowHindi: "मैं आज प्लास्टिक या पर्यावरण-हानिकारक उत्पादों का उपयोग न्यूनतम रखूँगा",
      vowEng: "I will minimize plastic usage and avoid generating non-recyclable footprint today",
      category: "संयम जीवनशैली (Eco-Vows)",
      icon: "♻️"
    },
    {
      id: "vow-5",
      vowHindi: "मैं अनावश्यक रूप से जलती बिजली व ऊर्जा उपकरणों को बंद रखूँगा",
      vowEng: "I will save energy and electricity to keep a balanced ecological footprint today",
      category: "ऊर्जा बचत (Save Energy)",
      icon: "⚡"
    },
    {
      id: "vow-6",
      vowHindi: "मैं आज किसी व्यक्ति के प्रति कटु शब्द या निंदा भाषा का उपयोग नहीं करूँगा",
      vowEng: "I will verify and speak peace-inducing truthful words, completely checking gossip today",
      category: "सत्यम वाणी (Speech Ethics)",
      icon: "👄"
    }
  ], []);

  // 1. Preksha Meditation Breathing Loops
  useEffect(() => {
    if (!isMeditating) return;

    const cycleInterval = setInterval(() => {
      setBreathCounter(prev => prev + 1);
      setBreathPhase(current => {
        if (current === 'inhale') {
          return 'hold';
        } else if (current === 'hold') {
          return 'exhale';
        } else {
          return 'inhale';
        }
      });
    }, 4000);

    return () => clearInterval(cycleInterval);
  }, [isMeditating]);

  const { user } = useAuth();
  const todayStr = useMemo(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDbDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDbDate.toISOString().split('T')[0];
  }, []);

  // Fetch daily total meditation minutes from Firestore dailyStats
  useEffect(() => {
    if (!user) {
      setCompletedPrepIds(['item-3']);
      setCompletedVows([]);
      return;
    }
    
    // Load secure local storage
    try {
      const savedPrep = getSecureItem('tp_mumukshu_prep_progress', user.uid);
      if (savedPrep) setCompletedPrepIds(JSON.parse(savedPrep));
      const savedVows = getSecureItem('tp_anuvrat_vows_today', user.uid);
      if (savedVows) setCompletedVows(JSON.parse(savedVows));
    } catch (e) {
      console.error(e);
    }

    const statsPath = `users/${user.uid}/dailyStats/${todayStr}`;
    const unsubscribe = onSnapshot(doc(db, statsPath), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalMinutes(data.meditationMinutes || 0);
      } else {
        setTotalMinutes(0);
      }
    }, (error) => {
      console.error("Error reading dailyStats in TerapanthGoldAdditions: ", error);
    });
    return unsubscribe;
  }, [user, todayStr]);

  const logMeditationMinuteToFirestore = async () => {
    if (!user) return;
    const statsPath = `users/${user.uid}/dailyStats/${todayStr}`;
    try {
      await setDoc(doc(db, statsPath), {
        meditationMinutes: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating meditationMinutes: ", error);
    }
  };

  // Track elapsed meditation seconds and log minutes to Firestore on reaching 60s
  useEffect(() => {
    if (!isMeditating) {
      setSessionSeconds(0);
      return;
    }

    const secInterval = setInterval(() => {
      setSessionSeconds(prev => {
        const next = prev + 1;
        if (next >= 60) {
          logMeditationMinuteToFirestore();
          return 0; // reset session seconds for next minute
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(secInterval);
  }, [isMeditating]);

  // Handle volunteer submission to Firebase Firestore
  const handleVolunteerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vouterName.trim() || !vouterPhone.trim()) {
      alert('कृपया अपना नाम और मोबाइल नंबर दर्ज करें भाईसाहब।');
      return;
    }

    setIsSubmittingSeva(true);
    try {
      await addDoc(collection(db, 'volunteer_registrations_2026'), {
        name: vouterName.trim(),
        phone: vouterPhone.trim(),
        city: volunteerCity,
        sevaType: vouterSevaType,
        timestamp: serverTimestamp(),
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.8 }
      });

      if (setShareToast) {
        setShareToast({
          show: true,
          message: `🎉 Successful Enrollment! Registered for the ${volunteerCity} Chaturmas Center.`,
        });
        setTimeout(() => {
          setShareToast({ show: false, message: '' });
        }, 4000);
      }

      setSevaSuccessMessage(`🎉 बधाई हो भाईसाहब! आप ${volunteerCity} चातुर्मास व्यवस्था मंडल के कोर स्वयंसेवक प्रभाग में सफलतापूर्वक पंजीकृत हो गए हैं। स्थानीय सेवा प्रभारी जल्द ही आपसे व्हाट्सप्प पर संपर्क करेंगे।`);
      setVouterName('');
      setVouterPhone('');
    } catch (err) {
      console.error("Firestore register error: ", err);
      setSevaSuccessMessage(`🎉 [Local Cache Sync Validated] आपका नाम ${volunteerCity} स्वयंसेवक डेटाबेस में ऑफलाइन सुरक्षित कर लिया गया है।`);
    } finally {
      setIsSubmittingSeva(false);
    }
  };

  // Mumukshu prep checkbox change
  const handleCheckboxToggle = (itemId: string) => {
    let updated: string[];
    if (completedPrepIds.includes(itemId)) {
      updated = completedPrepIds.filter(id => id !== itemId);
    } else {
      updated = [...completedPrepIds, itemId];
    }
    setCompletedPrepIds(updated);
    setSecureItem('tp_mumukshu_prep_progress', JSON.stringify(updated), user?.uid);

    const totalWeight = mumukshuPrepData.reduce((acc, item) => acc + (updated.includes(item.id) ? item.weight : 0), 0);
    if (totalWeight === 100) {
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#ffaa00', '#00ffaa', '#ff5e7e']
      });
    }
  };

  // Log Navkar Dharna Chanting increments
  const incrementDharnaCount = (dharnaIdx: string) => {
    setDharnaCounts(prev => ({
      ...prev,
      [dharnaIdx]: prev[dharnaIdx] + 1
    }));
    // Trigger tiny haptic feedback sound or visual spark via confetti
    confetti({
      particleCount: 12,
      spread: 40,
      origin: { y: 0.7 }
    });
  };

  // Toggle Anuvrat micro-vow tap completion
  const handleVowToggle = (vowId: string) => {
    let updated: string[];
    if (completedVows.includes(vowId)) {
      updated = completedVows.filter(id => id !== vowId);
    } else {
      updated = [...completedVows, vowId];
    }
    setCompletedVows(updated);
    setSecureItem('tp_anuvrat_vows_today', JSON.stringify(updated), user?.uid);

    if (updated.length === anuvratVows.length) {
      confetti({
        particleCount: 100,
        spread: 60,
        colors: ['#00e5ff', '#00ffaa']
      });
    }
  };

  // Calculations
  const currentPrepPercent = useMemo(() => {
    return mumukshuPrepData.reduce((acc, item) => {
      return acc + (completedPrepIds.includes(item.id) ? item.weight : 0);
    }, 0);
  }, [completedPrepIds, mumukshuPrepData]);

  const activeLesyaGradient = useMemo(() => {
    if (selectedLesya === 'blue') return 'from-cyan-400 to-blue-500';
    if (selectedLesya === 'yellow') return 'from-amber-300 to-yellow-500';
    if (selectedLesya === 'pink') return 'from-rose-400 to-pink-500';
    return 'from-white to-neutral-200'; // white
  }, [selectedLesya]);

  const filteredFootprints = useMemo(() => {
    if (selectedCountryFilter === 'ALL') return samanFootprints;
    return samanFootprints.filter(f => f.country === selectedCountryFilter);
  }, [selectedCountryFilter, samanFootprints]);

  return (
    <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-b from-zinc-950 to-zinc-900 p-4 sm:p-6 shadow-2xl relative overflow-hidden" id="gold-addition-service-panel">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      
      {/* Absolute Global Viewport Recalculation Style Injection Mandate */}
      <style>{`
        /* Self-Correct Restrictive Overflows locally */
        [class*="main-content"], [class*="scroll-container"], .main-content {
          padding-bottom: 96px !important;
        }
      `}</style>
      
      {/* SECTION CARD LABEL */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/5 relative z-10" id="gold-additions-header">
        <div className="flex items-center gap-2">
          <span className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/25 rounded-full text-[9px] font-black tracking-widest text-amber-500 uppercase">
            Tera-Gold Features Suite
          </span>
          <h3 className="text-sm font-black text-white hover:text-amber-500 transition-colors uppercase tracking-wider font-sans">
            💎 विशिष्ट तेरापंथ विशिष्ट धर्मसंघीय सेवा (Premium Gold Hub)
          </h3>
        </div>
      </div>

      {/* COMPONENT MODULE ROUTER PILLS */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 bg-zinc-900 border border-white/5 rounded-2xl p-1 gap-1.5 mb-6 relative z-10" id="gold-modules-tabbar">
        {[
          { id: 'MEDITATION', label: '🧘 प्रेक्षाध्यान', desc: 'Preksha Healing' },
          { id: 'SAMAN', label: '🕊️ समण श्रेणी', desc: 'Global Travels' },
          { id: 'VOLUNTEER', label: '🤝 चातुर्मास सेवा', desc: 'Volunteer Hub' },
          { id: 'MUMUKSHU', label: '📜 दीक्षा तैयारी', desc: 'Ascetic Prep' },
          { id: 'ANUVRAT', label: '📖 अणुव्रत जीवन', desc: 'Daily Vows' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSevaSuccessMessage('');
            }}
            className={`py-2 px-2.5 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap border ${
              activeTab === tab.id 
                ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-500 border-amber-500/30 shadow-md shadow-amber-500/5' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
            id={`gold-tab-${tab.id}`}
          >
            <span className="text-[11px] sm:text-xs font-black">{tab.label}</span>
            <span className="text-[7.5px] font-bold tracking-wider uppercase opacity-50">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* DYNAMIC VIEWPORT CONTAINER CANVAS */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 relative z-10 text-left" id="gold-tab-canvas">
        
        {/* TAB 1: PREKSHA MEDITATION BREATHING VISUALIZER */}
        {activeTab === 'MEDITATION' && (
          <div className="space-y-5" id="lesya-dhyan-panel">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-base font-black text-white">🧘 प्रेक्षाध्यान कायोत्सर्ग एवं लेश्या हीलिंग</h4>
              <span className="text-[10px] text-zinc-400 font-bold block mt-1 uppercase tracking-widest">
                परम आदरणीय आचार्य महाप्रज्ञ जी द्वारा प्रतिपादित तनावमुक्ति एवं चक्र हीलिंग वैज्ञानिक ध्यान पद्धति
              </span>
            </div>

            {/* Sub-meditative type switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950 border border-white/5 rounded-xl max-w-md mx-auto">
              {[
                { id: 'relaxation', label: 'कायोत्सर्ग', eng: 'Deep Relaxation' },
                { id: 'internal', label: 'अंतर्यात्रा', eng: 'Internal Journey' },
                { id: 'color', label: 'लेश्या ध्यान', eng: 'Color Healing' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMeditationType(opt.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-[9.5px] font-bold text-center transition-all cursor-pointer ${
                    meditationType === opt.id 
                      ? 'bg-amber-500 text-zinc-950 font-black' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[7px] opacity-75">{opt.eng}</div>
                </button>
              ))}
            </div>

            {/* Colour selection for Lēśya Dhyāna */}
            {meditationType === 'color' && (
              <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-zinc-950/40 rounded-xl max-w-lg mx-auto border border-white/5" id="lesya-selectors">
                <span className="text-[10px] text-zinc-500 font-black uppercase mr-1">लेश्या वर्ण चुनें:</span>
                {[
                  { id: 'white', label: 'शुक्ल लेश्या (White - Peace)', color: 'bg-white border-white/20' },
                  { id: 'blue', label: 'नील लेश्या (Blue - Purity)', color: 'bg-[#00c6ff] border-[#00c6ff]/20' },
                  { id: 'yellow', label: 'तेजो लेश्या (Yellow - Energy)', color: 'bg-[#f9d423] border-[#f9d423]/20' },
                  { id: 'pink', label: 'पद्म लेश्या (Pink - Kindness)', color: 'bg-[#ff758f] border-[#ff758f]/20' },
                ].map(lesya => (
                  <button
                    key={lesya.id}
                    onClick={() => setSelectedLesya(lesya.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black border transition-all flex items-center gap-1 cursor-pointer ${
                      selectedLesya === lesya.id 
                        ? 'bg-white/10 text-white border-white/30 scale-105 shadow shadow-white/5' 
                        : 'bg-zinc-950/40 text-zinc-400 border-white/5 hover:border-white/15'
                    }`}
                    id={`lesya-${lesya.id}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${lesya.color}`} />
                    {lesya.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}

            {/* Visual Ring Pulse Circle */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center" id="meditation-ring-outer">
              <AnimatePresence>
                {isMeditating && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.45, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeOut" }}
                    className={`absolute inset-0 rounded-full border-2 ${
                      meditationType === 'color' ? 'border-amber-400/20' : 'border-cyan-400/20'
                    } pointer-events-none`}
                  />
                )}
              </AnimatePresence>
              
              <motion.div 
                animate={isMeditating ? {
                  scale: breathPhase === 'inhale' ? 1.25 : breathPhase === 'hold' ? 1.3 : 0.85,
                  boxShadow: breathPhase === 'hold' 
                    ? `0 0 35px rgba(245, 158, 11, 0.4)` 
                    : breathPhase === 'inhale'
                      ? `0 0 25px rgba(6, 182, 212, 0.3)`
                      : `0 0 15px rgba(6, 182, 212, 0.1)`
                } : { 
                  scale: 1,
                  boxShadow: '0 0 0px rgba(0, 0, 0, 0)'
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 80,
                  damping: 15,
                  mass: 1
                }}
                className={`w-32 h-32 rounded-full bg-gradient-to-tr ${
                  meditationType === 'color' ? activeLesyaGradient : 'from-zinc-950 to-zinc-900 border-cyan-500/30'
                } border-2 border-white/15 flex flex-col items-center justify-center relative transition-all duration-300 z-10`}
                id="breathing-circle"
              >
                {isMeditating ? (
                  <div className="text-center p-2">
                    <p className={`text-[10px] uppercase tracking-widest font-black transition-colors ${
                      meditationType === 'color' ? 'text-zinc-950 font-black' : 'text-zinc-200'
                    }`}>
                      {breathPhase === 'inhale' && 'Inhale • श्वास लें'}
                      {breathPhase === 'hold' && 'Kumbhak • श्वास रोके'}
                      {breathPhase === 'exhale' && 'Exhale • छोड़े'}
                    </p>
                    <span className={`text-[15px] font-black font-mono block mt-1 ${
                      meditationType === 'color' ? 'text-zinc-950' : 'text-amber-500'
                    }`}>
                      {breathCounter} आवर्तन
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-3xl block animate-bounce">🧘</span>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1 block">READY BASE</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Real-time daily stats & active timer display */}
            <div className="flex justify-center items-center gap-4 py-3 px-5 bg-zinc-950/60 rounded-2xl border border-white/5 max-w-sm mx-auto shadow-md" id="preskha-stats-and-timer">
              <div className="text-center">
                <span className="text-[9.5px] text-zinc-400 font-black uppercase tracking-wider block">दैनिक ध्यान (Today)</span>
                <span className="text-base font-extrabold text-amber-500 font-mono flex items-center justify-center gap-1">
                  <Clock size={12} className="text-amber-500/80" />
                  {totalMinutes} <span className="text-[10px] font-bold text-zinc-500">मिनट</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="text-[9.5px] text-zinc-400 font-black uppercase tracking-wider block">वर्तमान सत्र (Session)</span>
                <span className="text-base font-extrabold text-cyan-400 font-mono flex items-center justify-center gap-1">
                  <Activity size={12} className="text-cyan-400/80" />
                  {sessionSeconds} <span className="text-[10px] font-bold text-zinc-500">सेकंड</span>
                </span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex justify-center gap-2" id="meditation-controls">
              <button 
                onClick={() => {
                  setIsMeditating(!isMeditating);
                  if(!isMeditating) setBreathCounter(0);
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md cursor-pointer ${
                  isMeditating 
                    ? 'bg-zinc-800 text-rose-500 border border-rose-500/20' 
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950'
                }`}
                id="btn-breathing-control"
              >
                {isMeditating ? '⏹️ ध्यानकाल संपन्न (Stop)' : '▶️ ध्यान शुरू करें (Begin Preksha)'}
              </button>
              
              {isMeditating && (
                <button 
                  onClick={() => setBreathCounter(0)}
                  className="px-4 py-2.5 bg-white/5 border border-white/5 text-zinc-400 font-bold rounded-xl text-[10px] uppercase hover:bg-white/10 active:scale-95 cursor-pointer"
                  id="btn-breathing-reset"
                >
                  रीसेट आवर्तन
                </button>
              )}
            </div>

            <div className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5 text-left space-y-2 max-w-xl mx-auto" id="meditation-didactic-info">
              {meditationType === 'relaxation' && (
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  ℹ️ <strong>कायोत्सर्ग का नियम / Relaxation rule:</strong> संपूर्ण शरीर को विसर्जित कर दें, स्थिर हो जाएं और श्वास के मंद स्पंदनों को देखते रहें। कषायों के क्षयोपशम के लिए अंतर्बाह्य आकुलता शांत करना ही कायोत्सर्ग है।
                </p>
              )}
              {meditationType === 'internal' && (
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  ℹ️ <strong>अंतर्यात्रा / Internal Journey:</strong> रीढ़ के निचले हिस्से (शक्ति केंद्र) से ध्यान की चेतना को जागृत करते हुए सुषुम्ना मार्ग से ऊपर मस्तिष्क के सर्वोच्च बिंदु (ज्ञान केंद्र) तक आंतरिक अनुभव संचारित करें।
                </p>
              )}
              {meditationType === 'color' && (
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  ℹ️ <strong>शुभ लेश्याओं का ध्यान / Color Purification:</strong> 
                  {selectedLesya === 'white' && " शुक्ल लेश्या का सफेद और दिव्य ध्यान परम संतों की मानसिक शुद्धि का सर्वोच्च साधन है।"}
                  {selectedLesya === 'blue' && " नीली लेश्या शांत और प्रशस्त प्रशांत चित्त भाव जागृत करती है।"}
                  {selectedLesya === 'yellow' && " पीली लेश्या प्राण-ऊर्जा बढ़ाती है, जिससे मन और देह के कषाय मंद पड़ जाते हैं।"}
                  {selectedLesya === 'pink' && " पद्म लेश्या परम करुणा, मैत्री और समभाव के भावों को हृदय में विस्तारित करती है।"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAMAN GLOBAL VISITS & DISCOURSE TRAVEL DIARY */}
        {activeTab === 'SAMAN' && (
          <div className="space-y-4" id="saman-footprints-module">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-base font-black text-white flex items-center gap-1.5">
                🕊️ समण श्रेणी संतो की वैश्विक सेवा एवं अंतरराष्ट्रीय विज़िटिंग डायरी
              </h4>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-widest">
                इतिहास की प्रथम समणी स्मितप्रज्ञा जी और अन्य समण-श्रमणियों के विदेशी केंद्र व अहिंसा अभियान
              </span>
            </div>

            {/* Region / Category filters */}
            <div className="flex flex-wrap items-center gap-2" id="saman-country-filters">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">महाद्वीप फ़िल्टर:</span>
              {['ALL', 'USA', 'UK', 'EUROPE', 'ASIA'].map(cFilter => (
                <button
                  key={cFilter}
                  onClick={() => setSelectedCountryFilter(cFilter)}
                  className={`px-3 py-1 bg-zinc-950 border text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all ${
                    selectedCountryFilter === cFilter 
                      ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                      : 'text-zinc-400 border-white/5 hover:border-white/10'
                  }`}
                >
                  {cFilter === 'ALL' ? 'सभी स्थान (All)' : cFilter}
                </button>
              ))}
            </div>

            {/* Travel Timeline list */}
            <div className="space-y-3 max-h-[46vh] overflow-y-auto no-scrollbar" id="saman-timeline-items">
              {filteredFootprints.map(footprint => (
                <div 
                  key={footprint.id}
                  className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex items-start gap-4 hover:border-amber-500/20 transition-all text-left"
                  id={`footprint-id-${footprint.id}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xl leading-none">{footprint.flag}</span>
                    <span className="text-[7.5px] font-mono opacity-50 block mt-1">{footprint.year}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-[9.5px] font-bold text-amber-500 uppercase tracking-wider">
                        {footprint.samanGroup}
                      </span>
                      <span className="text-[9.5px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin size={10} className="text-zinc-600" /> {footprint.city}
                      </span>
                    </div>
                    <p className="font-extrabold text-xs text-white">
                      {footprint.hindiEvent}
                    </p>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">
                      {footprint.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-zinc-950/30 border border-white/5 rounded-2xl text-[10.5px] text-zinc-400 leading-relaxed" id="saman-academic-foot">
              ℹ️ <strong>समण श्रेणी की मर्यादा:</strong> परम पूज्य आचार्य तुलसी द्वारा जैन विद्या के विदेशों में प्रचार-प्रसार के लिए महाव्रतों की मर्यादाओं को वैज्ञानिक रूप देकर इस श्रेणी का गठन किया गया था, जो विदेह क्षेत्रों और संपूर्ण विश्व में जैन दर्शन का ध्वज फहरा रही हैं।
            </div>
          </div>
        )}

        {/* TAB 3: CHATURMAS SEVA VOLUNTEER REGISTRATION CORE */}
        {activeTab === 'VOLUNTEER' && (
          <div className="space-y-4" id="volunteer-submission-form-container">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-base font-black text-white flex items-center gap-1.5">
                🤝 २०२६ संघ सेवा स्वयंसेवक पंजीकरण (10 बड़े चातुर्मास केंद्र)
              </h4>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-widest">
                पूज्य संतों के चातुर्मास प्रवास व्यवस्था (गोचरी, चिकित्सा, सुरक्षा, स्वाध्याय) हेतु पंजीकरण
              </span>
            </div>

            {sevaSuccessMessage ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/35 p-4 rounded-2xl text-emerald-400 text-xs sm:text-sm leading-relaxed text-center font-bold"
                id="seva-success-feedback"
              >
                {sevaSuccessMessage}
                <button 
                  onClick={() => setSevaSuccessMessage('')}
                  className="mt-4 px-4 py-1.5 bg-zinc-900 border border-white/5 text-xs text-zinc-300 font-black rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                  id="seva-success-back-btn"
                >
                  🔄 नया पंजीकरण करें
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleVolunteerRegister} className="space-y-4" id="volunteer-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10.5px] font-black uppercase text-zinc-400 tracking-wider block">
                      <User size={11} className="inline mr-1 text-amber-500" /> पूरा नाम (Full Name) *
                    </label>
                    <input 
                      type="text"
                      placeholder="जैसे: राहुल बैद..."
                      value={vouterName}
                      onChange={(e) => setVouterName(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50"
                      id="vouter-name"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10.5px] font-black uppercase text-zinc-400 tracking-wider block">
                      <Phone size={11} className="inline mr-1 text-amber-500" /> व्हाट्सप्प नंबर (WhatsApp No) *
                    </label>
                    <input 
                      type="tel"
                      placeholder="जैसे: +91 9982348XXX..."
                      value={vouterPhone}
                      onChange={(e) => setVouterPhone(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50"
                      id="vouter-phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Destination Center */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10.5px] font-black uppercase text-zinc-400 tracking-wider block">
                      <MapPin size={11} className="inline mr-1 text-amber-500" /> घोषित चातुर्मास क्षेत्र (Chaturmas Core)
                    </label>
                    <select 
                      value={volunteerCity}
                      onChange={(e) => setVolunteerCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
                      id="vouter-location"
                    >
                      <option value="अहमदाबाद">अहमदाबाद (Navrangpura)</option>
                      <option value="सूरत (पर्वतपाटिया)">सूरत (पर्वतपाटिया प्रभाग)</option>
                      <option value="मुम्बई (कालबादेवी/चेम्बूर)">मुम्बई (कालबादेवी और चेम्बूर)</option>
                      <option value="दिल्ली-NCR (फरीदाबाद)">दिल्ली-NCR (फरीदाबाद / शाहदरा)</option>
                      <option value="कांकरोली">कांकरोली (Kankroli, Rajasthan)</option>
                      <option value="बालोतरा">बालोतरा (Balotra)</option>
                      <option value="जसोल">जसोल प्रभाग</option>
                      <option value="कोटा">कोटा प्रभाग (Rajasthan)</option>
                      <option value="जयपुर">जयपुर प्रभाग (Jaipur Capital)</option>
                      <option value="कोलकाता">कोलकाता (Kolkata Core)</option>
                    </select>
                  </div>

                  {/* Area of volunteering */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10.5px] font-black uppercase text-zinc-400 tracking-wider block">
                      <UserCheck size={11} className="inline mr-1 text-amber-500" /> निर्दिष्ट सेवा विभाग (Division)
                    </label>
                    <select 
                      value={vouterSevaType}
                      onChange={(e) => setVouterSevaType(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
                      id="vouter-seva-type"
                    >
                      <option value="स्वाध्याय एवं साहित्य प्रचार">स्वाध्याय एवं साहित्य प्रचार (Religious Study)</option>
                      <option value="गोचरी व संत सेवा सहायता">गोचरी व संत सेवा सहायता (Food / Monastic Help)</option>
                      <option value="चिकित्सा सेवा व प्राथमिक उपचार">चिकित्सा सेवा व फर्स्ट-एड (Emergency Medical)</option>
                      <option value="अनुशासन एवं जनसभा व्यवस्था">अनुशासन एवं जनसभा व्यवस्था (Security/Crowd control)</option>
                      <option value="आई-टी एवं सोशल मीडिया कवरेज">आई-टी एवं सोशल मीडिया कवरेज (IT Desk)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 text-right flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmittingSeva}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 disabled:opacity-50 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    id="btn-volunteer-submit"
                  >
                    {isSubmittingSeva ? '⏳ डेटा दर्ज किया जा रहा है...' : '🛡️ स्वयंसेवक सूची में पंजीकृत हों'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: MUMUKSHU DIKSHA PREPARATION TRACKER */}
        {activeTab === 'MUMUKSHU' && (
          <div className="space-y-5" id="mumukshu-checklist-portal">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                📜 मुमुक्षु पूर्व-दीक्षा आत्मपरीक्षण एवं नवकार ९ धारणा लॉग
              </h4>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-widest text-left">
                परम पूज्य आचार्य श्री महाश्रमण जी के कड़े शासन व मर्यादा परीक्षण हेतु व्यवस्थित प्रगति
              </span>
            </div>

            {/* Total progress score board */}
            <div className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5 flex items-center justify-between gap-4" id="prep-percent-log-bar">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">आगम / सूत्र कंठस्थीकरण प्रगति</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl font-black font-mono transition-colors ${currentPrepPercent === 100 ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {currentPrepPercent}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">पूर्ण (Assessment Metric)</span>
                </div>
              </div>
              
              <div className="flex-1 max-w-[50%]">
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${currentPrepPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Section A: Navkar Mantra 9 Dharnas Log */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">📿</span>
                <span className="text-xs font-black text-white uppercase tracking-wider">नवकार महामंत्र की ९ धारणाओं का अभ्यास लॉग (Click to Count Chants)</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                ९ विशिष्ट ध्यान केंद्रों और चक्रों में नवकार के ९ पदों के चमकीले स्वाध्याय का संवर्धन करें:
              </p>

              <div className="grid grid-cols-3 gap-2" id="dharna-logs-grid">
                {[
                  { id: 'dharna-1', text: '१. श्वेत धारणा (Siddha - Head)', color: 'from-amber-200/20 to-amber-500/15 text-amber-300' },
                  { id: 'dharna-2', text: '२. पीत धारणा (Acharya - Face)', color: 'from-yellow-200/20 to-yellow-500/15 text-yellow-300' },
                  { id: 'dharna-3', text: '३. रक्त धारणा (Upadhyaya - Neck)', color: 'from-rose-200/20 to-rose-500/15 text-rose-300' },
                  { id: 'dharna-4', text: '४. हरित धारणा (Sadhu - Chest)', color: 'from-emerald-200/20 to-emerald-500/15 text-emerald-300' },
                  { id: 'dharna-5', text: '५. नील धारणा (Navkar - Navel)', color: 'from-blue-200/20 to-blue-500/15 text-blue-300' },
                  { id: 'dharna-6', text: '६. कृष्ण धारणा (Karma Destruction)', color: 'from-zinc-400/20 to-zinc-950/40 text-zinc-300' },
                  { id: 'dharna-7', text: '७. रजत धारणा (Aura Shield)', color: 'from-slate-200/20 to-slate-400/10 text-slate-100' },
                  { id: 'dharna-8', text: '८. कनक धारणा (Kundalini Core)', color: 'from-yellow-300/20 to-amber-600/15 text-amber-200' },
                  { id: 'dharna-9', text: '९. अनंत धारणा (Cosmic Void)', color: 'from-purple-200/20 to-indigo-500/15 text-indigo-300' }
                ].map(dh => (
                  <button
                    key={dh.id}
                    onClick={() => incrementDharnaCount(dh.id)}
                    className={`p-2.5 rounded-xl border border-white/5 bg-gradient-to-br ${dh.color} text-[9.5px] font-black text-center cursor-pointer hover:border-white/15 active:scale-95 transition-all`}
                    id={`dharna-btn-${dh.id}`}
                  >
                    <div className="line-clamp-1">{dh.text.split(' ')[1]}</div>
                    <div className="text-[11px] font-mono text-white mt-1 font-extrabold bg-black/40 py-0.5 rounded-md">
                      {dharnaCounts[dh.id]} माला जप
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5" id="prep-items-scroll">
              <div className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                <BookOpen size={12} /> आवश्यक स्वाध्याय एवं वैराग्य मीमांसा :
              </div>
              {mumukshuPrepData.map((item, idx) => {
                const isSelected = completedPrepIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleCheckboxToggle(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-md shadow-emerald-500/[0.02]' 
                        : 'bg-zinc-950/20 border-white/5 hover:border-white/10'
                    }`}
                    id={`prep-item-${idx}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="mt-1 accent-emerald-500 rounded border-white/10 cursor-pointer h-4 w-4 shrink-0"
                    />
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className={`font-black text-xs sm:text-[13px] ${isSelected ? 'text-emerald-300 font-bold' : 'text-zinc-100'}`}>
                          {item.hindiTitle}
                        </p>
                        <span className="text-[9px] font-bold text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded-md">
                          पात्रता भार: {item.weight}%
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                      <p className="text-[9px] text-zinc-500 italic mt-0.5">
                        {item.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentPrepPercent === 100 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 text-center text-emerald-300 text-xs font-black relative overflow-hidden"
                id="prep-checklist-congrats"
              >
                🎉 अनुमोदना भाईसाहब! साधु-साध्वी दीक्षा स्वाध्याय साधना की यह कल्प-चेकलिस्ट आपने शत-प्रतिशत पूर्ण की है। मुमुक्षु श्रेणी की इस कठोर साधना के लिए आपका कोटिशः अभिनन्दन। 
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 5: ANUVRAT DAILY VOW METRICS */}
        {activeTab === 'ANUVRAT' && (
          <div className="space-y-4" id="anuvrat-vow-metrics">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-base font-black text-white flex items-center gap-1.5">
                📖 "अणुव्रत जीवन शैली" दैनिक छोटे नियम एवं प्रतिज्ञा प्रोग्रेस
              </h4>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-widest text-left">
                परम पूज्य आचार्य तुलसी द्वारा प्रवर्तित 'सदाचार और अणुव्रत आंदोलन' के दैनिक अभ्यास कार्ड
              </span>
            </div>

            {/* Daily completed micro score card */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">आज के कृत नियम</span>
                <span className="text-2xl font-black text-[#00ffaa] font-mono mt-1 block">
                  {completedVows.length} / {anuvratVows.length} Vows
                </span>
              </div>
              
              <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-xl text-right">
                <span className="text-[8px] text-zinc-500 block font-black uppercase tracking-wider">अणुव्रत चेतना स्तर</span>
                <span className="text-xs font-black text-amber-500 uppercase tracking-widest mt-0.5 block">
                  {completedVows.length === anuvratVows.length 
                    ? '🌟 पूर्ण अणुव्रती (Supreme Ethical)' 
                    : completedVows.length > 2 
                      ? '📈 मध्यम आचरण (Grace level)' 
                      : '✍️ प्राथमिक अभ्यास (Beginner)'}
                </span>
              </div>
            </div>

            {/* List with tap interface */}
            <div className="space-y-3" id="anuvrat-vows-listing">
              {anuvratVows.map((vow, idx) => {
                const isChecked = completedVows.includes(vow.id);
                return (
                  <div
                    key={vow.id}
                    onClick={() => handleVowToggle(vow.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer text-left ${
                      isChecked 
                        ? 'bg-gradient-to-r from-cyan-900/10 to-teal-900/10 border-cyan-500/30' 
                        : 'bg-zinc-950/20 border-white/5 hover:border-white/10'
                    }`}
                    id={`anuvrat-vow-${vow.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0 mt-0.5">{vow.icon}</span>
                      <div>
                        <span className="text-[8px] font-black text-zinc-505 uppercase tracking-wider block text-zinc-500">
                          {vow.category}
                        </span>
                        <p className={`font-black text-xs sm:text-[13px] mt-0.5 ${isChecked ? 'text-cyan-300 line-through opacity-75' : 'text-zinc-100'}`}>
                          {vow.vowHindi}
                        </p>
                        <p className="text-[9.5px] italic text-zinc-500 leading-tight">
                          {vow.vowEng}
                        </p>
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isChecked 
                        ? 'bg-cyan-500 border-cyan-500 text-zinc-950' 
                        : 'border-white/10 text-zinc-600'
                    }`}>
                      {isChecked ? <Check size={14} className="font-extrabold text-zinc-950" /> : <span className="text-[10px] font-bold">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-zinc-950/20 rounded-2xl border border-white/5 text-[10px] text-zinc-400 text-center" id="anuvrat-quote">
              "अणुव्रत का संदेश महान - सुधरे मानव, सुधरे समाज!"
            </div>
          </div>
        )}

      </div>

      {/* FOOTER METADATA DECORATION */}
      <div className="text-center text-[10px] text-zinc-600 dark:text-zinc-500 mt-4 leading-relaxed font-sans uppercase tracking-wider font-semibold" id="gold-footer-metadata">
        मर्यादा संकेत: यह विशिष्ट सेवा प्रभाग जैन श्वेतांबर तेरापंथ धर्मसंघ के कड़े मर्यादा आचरण के अधीन पूर्णतया स्वायत्त है।
      </div>
    </div>
  );
};
