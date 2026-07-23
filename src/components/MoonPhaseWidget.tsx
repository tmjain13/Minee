import React, { useState, useEffect, useMemo } from 'react';
import SunCalc from 'suncalc';
import { Moon, Sparkles, HelpCircle, ArrowRight, Compass, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FESTIVALS_2026_2027 } from '../data/panchang';

export interface MoonPhaseDetails {
  nameHi: string;
  nameEn: string;
  phaseCode: string;
  illumination: number;
  paksha: 'शुक्ल' | 'कृष्ण' | 'अमावस्या' | 'पूर्णिमा';
  significance: string;
  significanceHi: string;
  color: string;
}

export interface SpecialTithiInfo {
  isSpecial: boolean;
  title: string;
  titleEn: string;
  ritual: string;
  ritualEn: string;
}

export const getSpecialTithiInfo = (phase: number): SpecialTithiInfo => {
  // New Moon (Amavasya)
  if (phase < 0.03 || phase > 0.97) {
    return {
      isSpecial: true,
      title: 'अमावस्या (New Moon)',
      titleEn: 'New Moon',
      ritual: 'सामायिक साधना, मौन चिन्तन एवं कषायों का शमन करें।',
      ritualEn: 'Perform silent Samayik, introspection & practice self-restraint.',
    };
  }
  // Shukla Ashtami
  if (phase >= 0.22 && phase < 0.28) {
    return {
      isSpecial: true,
      title: 'शुक्ल अष्टमी (Shukla Ashtami)',
      titleEn: 'Shukla Ashtami',
      ritual: 'उपवास/एकासन तप की आराधना करें एवं हरी सब्जी का त्याग (सचित्त परिहार) रखें।',
      ritualEn: 'Observe Upvas/Ekasana penance and avoid green vegetables.',
    };
  }
  // Full Moon (Poornima)
  if (phase >= 0.47 && phase < 0.53) {
    return {
      isSpecial: true,
      title: 'पूर्णिमा (Full Moon)',
      titleEn: 'Poornima',
      ritual: 'महामंगल ध्यान साधना, अखण्ड जप एवं प्रेक्षाध्यान का अभ्यास करें।',
      ritualEn: 'Practice Mahamangal meditation, continuous chanting & Preksha Dhyan.',
    };
  }
  // Krishna Ashtami
  if (phase >= 0.72 && phase < 0.78) {
    return {
      isSpecial: true,
      title: 'कृष्ण अष्टमी (Krishna Ashtami)',
      titleEn: 'Krishna Ashtami',
      ritual: 'मौन साधना, जप तप आराधना एवं कषाय विजय का अभ्यास करें।',
      ritualEn: 'Engage in silent meditation, penance, and control over passions.',
    };
  }
  
  // Chaturdashi (Highly sacred Parva Day in Jain calendar)
  if ((phase >= 0.435 && phase < 0.47) || (phase >= 0.93 && phase < 0.97)) {
    return {
      isSpecial: true,
      title: 'चतुर्दशी (Chaturdashi)',
      titleEn: 'Chaturdashi',
      ritual: 'पर्व तिथि साधना: हरी वनस्पति त्याग रखें, व्रत-नियम पालें एवं प्रतिक्रमण करें।',
      ritualEn: 'Sacred Parva day: Abjure green vegetables, observe vows & perform Pratikraman.',
    };
  }

  return {
    isSpecial: false,
    title: '',
    titleEn: '',
    ritual: '',
    ritualEn: '',
  };
};

export const getSpiritualRecommendation = (phaseCode: string): { textHi: string, textEn: string } => {
  switch (phaseCode) {
    case 'new-moon':
      return {
        textHi: 'आज अमावस्या है: 48 मिनट की मौन सामायिक साधना करें एवं आत्म-चिन्तन में समय व्यतीत करें।',
        textEn: 'Today is Amavasya: Engage in a 48-minute silent Samayik session & spend time in introspection.'
      };
    case 'waxing-crescent':
      return {
        textHi: 'आज शुक्ल प्रतिपदा-पंचमी है: नवीन साधना संकल्प ग्रहण करें एवं नवकार महामंत्र का ध्यान करें।',
        textEn: 'Today is Waxing Crescent: Undertake fresh spiritual commitments & chant Navkar Mantra.'
      };
    case 'first-quarter':
      return {
        textHi: 'आज शुक्ल अष्टमी है: उपवास या एकासन तप करें एवं हरी वनस्पति (सचित्त) का पूर्ण त्याग रखें।',
        textEn: 'Today is Shukla Ashtami: Keep Upvas/Ekasana penance & strictly abjure green vegetables.'
      };
    case 'waxing-gibbous':
      return {
        textHi: 'आज शुक्ल नवमी-चतुर्दशी है: आगम ग्रंथों का स्वाध्याय करें और कषायों (क्रोध/अहंकार) पर नियंत्रण रखें।',
        textEn: 'Today is Waxing Gibbous: Dedicate time to scriptural Swadhyay & calm emotional impulses.'
      };
    case 'full-moon':
      return {
        textHi: 'आज पूर्णिमा है: सम्पूर्ण उपवास रखें, प्रेक्षाध्यान करें एवं रात्रि में चंद्रदर्शन संग मौन धारण करें।',
        textEn: 'Today is Poornima: Observe complete fasting, practice Preksha Dhyan & meditate in silence.'
      };
    case 'waning-gibbous':
      return {
        textHi: 'आज कृष्ण प्रतिपदा-सप्तमी है: आचार्य श्री महाश्रमणजी के वचनों का चिंतन करें एवं प्रतिक्रमण करें।',
        textEn: 'Today is Waning Gibbous: Contemplate Acharya Mahashramans discourses & perform Pratikraman.'
      };
    case 'third-quarter':
      return {
        textHi: 'आज कृष्ण अष्टमी है: उपवास या बेला तप की आराधना करें एवं स्वाध्याय में चित्त एकाग्र करें।',
        textEn: 'Today is Krishna Ashtami: Keep fasting with devotion & focus your awareness through Swadhyay.'
      };
    case 'waning-crescent':
    default:
      return {
        textHi: 'आज कृष्ण नवमी-चतुर्दशी है: आगामी अमावस्या हेतु इन्द्रिय संयम बढ़ाएं और जाप साधना करें।',
        textEn: 'Today is Waning Crescent: Amplify sensory self-regulation & focus on continuous chanting.'
      };
  }
};

export const getMoonPhaseDetails = (phase: number, fraction: number): MoonPhaseDetails => {
  const pct = Math.round(fraction * 100);
  
  if (phase < 0.03 || phase > 0.97) {
    return {
      nameHi: 'अमावस्या (New Moon)',
      nameEn: 'New Moon',
      phaseCode: 'new-moon',
      illumination: pct,
      paksha: 'अमावस्या',
      significance: 'Night of profound silence & deep meditation. Recommended for self-contemplation and reciting Samayik.',
      significanceHi: 'गहन आत्म-निरीक्षण और मौन साधना की रात्रि। सामायिक और जप साधना के लिए सर्वोत्तम समय।',
      color: 'text-stone-500'
    };
  } else if (phase >= 0.03 && phase < 0.22) {
    return {
      nameHi: 'शुक्ल प्रतिपदा - पंचमी',
      nameEn: 'Waxing Crescent',
      phaseCode: 'waxing-crescent',
      illumination: pct,
      paksha: 'शुक्ल',
      significance: 'The energy of growth begins. Excellent period for embarking on spiritual resolutions and learning new sutras.',
      significanceHi: 'ऊर्जा के विकास का प्रारंभ। नए धार्मिक संकल्पों, स्वाध्याय और सूत्र याद करने के लिए अनुकूल काल।',
      color: 'text-amber-300'
    };
  } else if (phase >= 0.22 && phase < 0.28) {
    return {
      nameHi: 'शुक्ल अष्टमी (अर्ध चंद्र)',
      nameEn: 'First Quarter',
      phaseCode: 'first-quarter',
      illumination: pct,
      paksha: 'शुक्ल',
      significance: 'Auspicious Ashtami Tithi. Traditionally observed with fasting (Upvas) or Ekasana, avoiding green vegetables (सचित्त त्याग).',
      significanceHi: 'पवित्र अष्टमी तिथि। तप (उपवास/एकासन) के लिए उत्तम। हरी सब्जी त्याग (सचित्त परिहार) का दिवस।',
      color: 'text-amber-400'
    };
  } else if (phase >= 0.28 && phase < 0.47) {
    return {
      nameHi: 'शुक्ल नवमी - चतुर्दशी',
      nameEn: 'Waxing Gibbous',
      phaseCode: 'waxing-gibbous',
      illumination: pct,
      paksha: 'शुक्ल',
      significance: 'High spiritual receptivity. Preparing for the Full Moon with increased mindfulness and evening Pratikraman.',
      significanceHi: 'उच्च आध्यात्मिक संवेदनशीलता का समय। मन की स्थिरता, ध्यान और रात्रि प्रतिक्रमण द्वारा पूर्णिमा की पूर्व तैयारी।',
      color: 'text-amber-200'
    };
  } else if (phase >= 0.47 && phase < 0.53) {
    return {
      nameHi: 'पूर्णिमा (Full Moon)',
      nameEn: 'Full Moon',
      phaseCode: 'full-moon',
      illumination: pct,
      paksha: 'पूर्णिमा',
      significance: 'Peak spiritual energy. Highly recommended to observe complete Upvas, continuous chanting, and Preksha meditation.',
      significanceHi: 'पराकाष्ठा की चैतन्य ऊर्जा। अखंड सामायिक, जप साधना, और प्रेक्षाध्यान के लिए अत्यंत प्रभावशाली दिन।',
      color: 'text-yellow-400'
    };
  } else if (phase >= 0.53 && phase < 0.72) {
    return {
      nameHi: 'कृष्ण प्रतिपदा - सप्तमी',
      nameEn: 'Waning Gibbous',
      phaseCode: 'waning-gibbous',
      illumination: pct,
      paksha: 'कृष्ण',
      significance: 'Period of emotional calmness and internalization. Good for intensive scriptural study (Swadhyay).',
      significanceHi: 'भावनात्मक शांतता और अंतर्मुखता का काल। आगम ग्रंथों के गहन स्वाध्याय और चिंतन के लिए सर्वश्रेष्ठ समय।',
      color: 'text-amber-200'
    };
  } else if (phase >= 0.72 && phase < 0.78) {
    return {
      nameHi: 'कृष्ण अष्टमी (अर्ध चंद्र)',
      nameEn: 'Third Quarter',
      phaseCode: 'third-quarter',
      illumination: pct,
      paksha: 'कृष्ण',
      significance: 'Auspicious Krishna Ashtami. Conducive for fasting, giving up sensory attachments, and seeking forgiveness.',
      significanceHi: 'कृष्ण पक्ष की अष्टमी तिथि। तपस्या, कषाय विजय (गुस्सा/अहंकार शांत करने) और प्रतिक्रमण के लिए पावन दिन।',
      color: 'text-amber-400'
    };
  } else {
    return {
      nameHi: 'कृष्ण नवमी - चतुर्दशी',
      nameEn: 'Waning Crescent',
      phaseCode: 'waning-crescent',
      illumination: pct,
      paksha: 'कृष्ण',
      significance: 'Auspicious Chaturdashi period leading to Amavasya. Recommended for rigorous kashay-control and self-discipline.',
      significanceHi: 'अमावस्या की ओर बढ़ती तिथियां (चतुर्दशी)। कठिन तप, कषाय संवर और आत्म-संयम की साधना के लिए उपयुक्त काल।',
      color: 'text-amber-300'
    };
  }
};

const MoonPhaseViz = ({ phase, size = 48 }: { phase: number; size?: number }) => {
  let phaseCode = 'new-moon';
  
  if (phase < 0.03 || phase > 0.97) {
    phaseCode = 'new-moon';
  } else if (phase >= 0.03 && phase < 0.22) {
    phaseCode = 'waxing-crescent';
  } else if (phase >= 0.22 && phase < 0.28) {
    phaseCode = 'first-quarter';
  } else if (phase >= 0.28 && phase < 0.47) {
    phaseCode = 'waxing-gibbous';
  } else if (phase >= 0.47 && phase < 0.53) {
    phaseCode = 'full-moon';
  } else if (phase >= 0.53 && phase < 0.72) {
    phaseCode = 'waning-gibbous';
  } else if (phase >= 0.72 && phase < 0.78) {
    phaseCode = 'third-quarter';
  } else {
    phaseCode = 'waning-crescent';
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      className="drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] dark:drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] transition-all duration-350"
    >
      {/* Deep night sky backing circle */}
      <circle cx="24" cy="24" r="20" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      
      {/* Glowing atmospheric outer ring */}
      <circle cx="24" cy="24" r="20.5" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.15" />

      {/* Subtle background craters */}
      <circle cx="14" cy="18" r="2.5" fill="#1e293b" opacity="0.3" />
      <circle cx="32" cy="16" r="3" fill="#1e293b" opacity="0.3" />
      <circle cx="22" cy="32" r="2" fill="#1e293b" opacity="0.3" />

      {/* Render the illuminated part */}
      {phaseCode === 'new-moon' && (
        <circle cx="24" cy="24" r="20" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      )}
      {phaseCode === 'waxing-crescent' && (
        <path d="M 24,4 A 20,20 0 0,1 24,44 A 10,20 0 0,1 24,4 Z" fill="#f59e0b" />
      )}
      {phaseCode === 'first-quarter' && (
        <path d="M 24,4 A 20,20 0 0,1 24,44 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'waxing-gibbous' && (
        <path d="M 24,4 A 20,20 0 0,1 24,44 A 10,20 0 0,0 24,4 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'full-moon' && (
        <>
          <circle cx="24" cy="24" r="20" fill="#fbbf24" />
          <circle cx="24" cy="24" r="19.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
          <circle cx="16" cy="18" r="2" fill="#d97706" opacity="0.15" />
          <circle cx="30" cy="16" r="2.5" fill="#d97706" opacity="0.15" />
          <circle cx="24" cy="30" r="1.5" fill="#d97706" opacity="0.15" />
        </>
      )}
      {phaseCode === 'waning-gibbous' && (
        <path d="M 24,4 A 20,20 0 0,0 24,44 A 10,20 0 0,1 24,4 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'third-quarter' && (
        <path d="M 24,4 A 20,20 0 0,0 24,44 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'waning-crescent' && (
        <path d="M 24,4 A 20,20 0 0,0 24,44 A 10,20 0 0,0 24,4 Z" fill="#f59e0b" />
      )}
    </svg>
  );
};

interface MoonPhaseWidgetProps {
  isDarkMode?: boolean;
  setActiveTab?: (tab: string) => void;
}

export default function MoonPhaseWidget({ isDarkMode = false, setActiveTab }: MoonPhaseWidgetProps) {
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090 }); // Default Delhi
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showToast, setShowToast] = useState(false);

  // Track dynamic date and location
  useEffect(() => {
    // Keep date accurate
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    
    // Attempt Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn("MoonPhaseWidget: defaulting to Delhi coordinates.", error);
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const tithiData = useMemo(() => {
    const d = currentDate;
    const day = d.getDate();
    const monthNames = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const dateString = `${day} ${month} ${year}`;
    
    const sunTimes = SunCalc.getTimes(d, location.lat, location.lon);
    const moonIllum = SunCalc.getMoonIllumination(sunTimes.sunrise);
    const phase = moonIllum.phase;
    const fraction = moonIllum.fraction;

    const festivalsFound = FESTIVALS_2026_2027.filter(f => f.date === dateString);
    if (festivalsFound.length > 0) {
      return { 
        tithi: festivalsFound[0].tithi, 
        name: festivalsFound[0].name, 
        isApprox: false,
        phase,
        fraction
      };
    }

    const totalPhase = phase * 30;
    let tithiNumber = Math.ceil(totalPhase);
    if (tithiNumber === 0) tithiNumber = 30; 

    const paksha = phase <= 0.5 ? 'शुक्ल' : 'कृष्ण';
    const tithiNameNumber = tithiNumber > 15 ? tithiNumber - 15 : tithiNumber;
    
    const tithiNames = [
      'प्रतिपदा (1)', 'द्वितीया (2)', 'तृतीया (3)', 'चतुर्थी (4)', 'पंचमी (5)',
      'षष्ठी (6)', 'सप्तमी (7)', 'अष्टमी (8)', 'नवमी (9)', 'दशमी (10)',
      'एकादशी (11)', 'द्वादशी (12)', 'त्रयोदशी (13)', 'चतुर्दशी (14)', 'पूर्णिमा / अमावस्या'
    ];

    let tithiName = tithiNames[tithiNameNumber - 1] || '';
    if (tithiNumber === 15) tithiName = 'पूर्णिमा (15)';
    if (tithiNumber === 30) tithiName = 'अमावस्या (30)';

    return { 
      tithi: `${paksha} पक्ष, ${tithiName}`, 
      name: '', 
      isApprox: true,
      phase,
      fraction
    };
  }, [currentDate, location]);

  const details = useMemo(() => {
    return getMoonPhaseDetails(tithiData.phase, tithiData.fraction);
  }, [tithiData]);

  const specialTithiInfo = useMemo(() => {
    return getSpecialTithiInfo(tithiData.phase);
  }, [tithiData.phase]);

  const isSpecialTithi = specialTithiInfo.isSpecial;

  const ritualRecommendation = useMemo(() => {
    return getSpiritualRecommendation(details.phaseCode);
  }, [details.phaseCode]);

  // Trigger toast notification if today is a special Tithi
  useEffect(() => {
    if (specialTithiInfo.isSpecial) {
      const timer = setTimeout(() => {
        setShowToast(true);
      }, 1500); // Elegant entry delay
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [specialTithiInfo]);

  return (
    <motion.div 
      id="moon-phase-home-widget"
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between gap-3 relative ${
        isSpecialTithi 
          ? isDarkMode 
            ? 'bg-stone-900/95 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-stone-100 ring-1 ring-amber-500/25' 
            : 'bg-amber-50/40 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-stone-800 ring-1 ring-amber-500/10'
          : isDarkMode 
            ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
            : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
      }`}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSpecialTithi ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-amber-500/10 text-amber-500'}`}>
            <Moon size={13} className="fill-amber-500/20" />
          </div>
          <h3 className={`font-serif text-sm font-bold ${isDarkMode ? 'text-stone-50' : 'text-stone-900'}`}>
            Moon Phase & Tithi (चन्द्र कला)
          </h3>
          {isSpecialTithi && (
            <span className="flex items-center gap-1 text-[9px] font-extrabold text-amber-600 bg-amber-500/15 px-1.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
              <Sparkles size={8} className="fill-amber-500" /> पावन पर्व
            </span>
          )}
        </div>
        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${
          tithiData.isApprox ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
        }`}>
          {tithiData.isApprox ? 'Approx Tithi' : 'Verified'}
        </span>
      </div>

      <div className="flex items-center gap-4 py-1.5">
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          <MoonPhaseViz phase={tithiData.phase} size={54} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className={`text-sm font-extrabold leading-tight ${isDarkMode ? 'text-stone-100' : 'text-stone-950'}`}>
              {tithiData.tithi}
            </h4>
            {tithiData.name && (
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded">
                {tithiData.name}
              </span>
            )}
          </div>
          <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5 leading-none">
            {details.nameEn} • Illumination: <span className="font-mono text-amber-500 font-bold">{details.illumination}%</span>
          </p>
          <p className={`text-[10px] mt-1.5 font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-700'} leading-snug`}>
            {details.nameHi}
          </p>
        </div>
      </div>

      <div className={`pt-3 border-t flex flex-col gap-2.5 ${isDarkMode ? 'border-stone-850' : 'border-stone-100'}`}>
        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
          <span className="font-extrabold text-amber-500">Significance:</span> {details.significanceHi}
        </p>

        {/* Spiritual Ritual Recommendation (साधना निर्देश) */}
        <div className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
          isSpecialTithi 
            ? 'bg-amber-500/10 border-amber-500/20 shadow-xs' 
            : isDarkMode ? 'bg-stone-850/40 border-stone-800' : 'bg-stone-50 border-stone-200/60'
        }`}>
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isSpecialTithi ? 'animate-pulse' : ''}`} />
            <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              Sadhana Recommendation (साधना अनुशंसा)
            </span>
          </div>
          <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>
            {ritualRecommendation.textHi}
          </p>
          <p className="text-[10px] text-stone-400 font-medium leading-normal italic">
            {ritualRecommendation.textEn}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
          {setActiveTab && (
            <button 
              id="view-full-panchang-btn"
              onClick={() => setActiveTab('panchang')}
              className={`text-[10px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1.5 cursor-pointer group`}
            >
              <span>View Full Panchang Calendar</span>
              <ArrowRight size={10} className="transform transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
          {isSpecialTithi && !showToast && (
            <button 
              onClick={() => setShowToast(true)}
              className="text-[9px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={8} /> Trigger Alert
            </button>
          )}
        </div>
      </div>

      {/* Non-intrusive Special Tithi Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 p-4 rounded-2xl bg-stone-950/95 text-stone-100 border border-amber-500/45 shadow-2xl backdrop-blur-md flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 block leading-none mb-1">
                    Special Parva Tithi • विशेष पर्व तिथि
                  </span>
                  <h4 className="font-serif text-sm font-bold text-white leading-tight">
                    {specialTithiInfo.title}
                  </h4>
                </div>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="text-stone-400 hover:text-stone-200 p-1 hover:bg-stone-800/50 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
            
            <p className="text-xs text-stone-300 leading-relaxed mt-1">
              आज साधना, तपस्या और धार्मिक संयम का विशेष पावन दिन है। <span className="text-amber-400 font-bold">{specialTithiInfo.ritual}</span>
            </p>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-800 text-[10px] text-stone-400 font-medium">
              <span>{specialTithiInfo.ritualEn}</span>
              <button
                onClick={() => {
                  setShowToast(false);
                  const widgetEl = document.getElementById('moon-phase-home-widget');
                  if (widgetEl) {
                    widgetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    widgetEl.classList.add('ring-4', 'ring-amber-500/50');
                    setTimeout(() => {
                      widgetEl.classList.remove('ring-4', 'ring-amber-500/50');
                    }, 2000);
                  }
                }}
                className="text-amber-400 hover:text-amber-350 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Focus Widget</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
