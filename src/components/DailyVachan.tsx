import { useState, useEffect } from 'react';
import { Share2, Heart, RefreshCw, Calendar, Quote, Check, Volume2, BookOpen, ChevronRight, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface DailyVachanType {
  id?: string;
  textHi: string;
  textEn: string;
  tithiHi: string;
  tithiEn: string;
  explanationHi: string;
  explanationEn: string;
  acharya: string;
  tagHi: string;
  tagEn: string;
}

const DAILY_VACHANS: DailyVachanType[] = [
  {
    textHi: "मनुष्य का जीवन केवल खाने और भोगने के लिए नहीं है, वह साधना और आत्म-शुद्धि का अनुपम अवसर है। संयम ही जीवन की वास्तविक निधि है।",
    textEn: "Human life is not merely for eating and indulgence; it is a matchless opportunity for spiritual practice and self-purification. Self-restraint is the true treasure of life.",
    tithiHi: "आषाढ़ शुक्ल एकादशी",
    tithiEn: "Ashadha Shukla Ekadashi",
    explanationHi: "आचार्यश्री फरमाते हैं कि बाह्य सुखों की लालसा कभी समाप्त नहीं होती। संयमित जीवन ही आत्मा को शाश्वत आनंद प्रदान कर सकता है।",
    explanationEn: "Acharya Shri explains that the craving for external pleasures never ends. Only a disciplined life of self-restraint can grant eternal bliss to the soul.",
    acharya: "आचार्य श्री महाश्रमण जी",
    tagHi: "संयम एवं साधना",
    tagEn: "Self-restraint"
  },
  {
    textHi: "अहिंसा केवल किसी को न मारना नहीं है, वरन सबके प्रति मैत्री और करुणा का भाव रखना है। जहाँ मैत्री है, वहाँ भय और बैर का कोई स्थान नहीं।",
    textEn: "Non-violence is not just about not killing; it is about cultivating friendship and compassion for all. Where there is friendship, there is no room for fear or animosity.",
    tithiHi: "श्रावण कृष्ण प्रतिपदा",
    tithiEn: "Shravana Krishna Pratipada",
    explanationHi: "मन, वचन और कर्म से किसी जीव को आहत न करना और सभी के प्रति समता का भाव रखना ही सच्ची अहिंसा है।",
    explanationEn: "True non-violence lies in not hurting any living being through mind, speech, or action, and maintaining a state of equanimity toward all.",
    acharya: "आचार्य श्री महाश्रमण जी",
    tagHi: "अहिंसा एवं मैत्री",
    tagEn: "Non-Violence"
  },
  {
    textHi: "सत्य की राह कठिन अवश्य हो सकती है, किन्तु आत्मिक संतोष केवल सत्य के आचरण से ही सम्भव है। कपट और असत्य से आत्मा भारी होती है।",
    textEn: "The path of truth may indeed be difficult, but spiritual contentment is possible only through the practice of truth. Deceit and untruth make the soul heavy.",
    tithiHi: "श्रावण शुक्ल पंचमी",
    tithiEn: "Shravana Shukla Panchami",
    explanationHi: "असत्य का आचरण तत्कालिक लाभ दे सकता है परंतु दीर्घकाल में वह बंधन कारक होता है। सत्यवादी निर्भय रहता है।",
    explanationEn: "Practicing untruth may yield temporary gains, but in the long run, it binds the soul. The one who speaks truth remains fearless.",
    acharya: "आचार्य श्री महाश्रमण जी",
    tagHi: "सत्य निष्ठा",
    tagEn: "Truthfulness"
  },
  {
    textHi: "संगठन और मर्यादा ही संघ की रीढ़ हैं। एक गुरु की आज्ञा में रहकर किया गया सूक्ष्म पुरुषार्थ भी मुक्ति का मार्ग प्रशस्त करता है।",
    textEn: "Organization and disciplined boundaries are the backbone of the congregation. Even a subtle effort made under the guidance of one Guru paves the way to liberation.",
    tithiHi: "भाद्रपद कृष्ण दशमी",
    tithiEn: "Bhadrapada Krishna Dashami",
    explanationHi: "तेरापंथ धर्मसंघ की मुख्य विशेषता 'एक गुरु और एक मर्यादा' है। अनुशासन और गुरु-आज्ञा का पालन ही मोक्ष का साधन है।",
    explanationEn: "The primary attribute of the Terapanth spiritual order is 'One Guru and One Code'. Abiding by discipline and the Guru's decree leads to liberation.",
    acharya: "आचार्य श्री महाश्रमण जी",
    tagHi: "मर्यादा एवं आज्ञा",
    tagEn: "Discipline & Obedience"
  },
  {
    textHi: "अपरिग्रह हमें सिखाता है कि हम तृष्णा को सीमित करें। इच्छाओं का अंतहीन विस्तार ही अशान्ति का मूल कारण है।",
    textEn: "Non-possessiveness teaches us to limit our desires. The endless expansion of desires is the root cause of all restlessness and conflict.",
    tithiHi: "आश्विन शुक्ल प्रतिपदा",
    tithiEn: "Ashvina Shukla Pratipada",
    explanationHi: "भौतिक वस्तुओं का संचय केवल बाहरी बोझ बढ़ाता है, जबकि इच्छाओं को सीमित करने से मन हल्का और प्रसन्न रहता है।",
    explanationEn: "Accumulating material goods only increases external burden, whereas limiting desires keeps the mind light, content, and peaceful.",
    acharya: "आचार्य श्री महाश्रमण जी",
    tagHi: "अपरिग्रह",
    tagEn: "Non-Possessiveness"
  },
  {
    textHi: "सामायिक का ४८ मिनट का समय आत्मा के निकट जाने का स्वर्णिम अवसर है। इस काल में संसार की सभी चिंताओं को त्याग कर केवल स्वाध्याय और ध्यान करें।",
    textEn: "The 48-minute duration of Samayik is a golden opportunity to draw closer to the soul. In this period, cast aside all worldly worries and engage solely in study and meditation.",
    tithiHi: "कार्तिक शुक्ल पूर्णिमा",
    tithiEn: "Kartika Shukla Purnima",
    explanationHi: "सामायिक में श्रावक गृहस्थ जीवन के पापों का त्याग कर कुछ समय के लिए साधु तुल्य बन जाता है। यह समता की उत्तम साधना है।",
    explanationEn: "In Samayik, a layperson renounces householder attachments to live like an ascetic for a brief period. This is the supreme practice of equanimity.",
    acharya: "आचार्य श्री महाश्रमण जी",
    tagHi: "सामायिक साधना",
    tagEn: "Samayik Meditation"
  },
  {
    textHi: "अणुव्रत जीवन जीने की एक सरल आचार संहिता है। छोटे-छोटे संकल्पों से ही व्यक्ति महान बनता है और समाज में नैतिक क्रांति का सूत्रपात होता है।",
    textEn: "Anuvrat is a simple code of conduct for living. Through small vows, an individual achieves greatness and triggers a moral revolution in society.",
    tithiHi: "मार्गशीर्ष शुक्ल एकादशी",
    tithiEn: "Margashirsha Shukla Ekadashi",
    explanationHi: "आचार्य तुलसी द्वारा प्रवर्तित अणुव्रत आंदोलन मानव को बेहतर बनाने का एक व्यावहारिक मार्ग है, जो सांप्रदायिकता से ऊपर उठकर मानवता की सेवा करता है।",
    explanationEn: "The Anuvrat Movement initiated by Acharya Tulsi is a practical way of self-transformation, serving humanity beyond sectarian divides.",
    acharya: "आचार्य श्री महाश्रमण जी",
    tagHi: "अणुव्रत संकल्प",
    tagEn: "Anuvrat Vows"
  }
];

const getDailyIndex = (maxLen: number): number => {
  const d = new Date();
  const seed = (d.getFullYear() * 365) + ((d.getMonth() + 1) * 31) + d.getDate();
  return seed % maxLen;
};

const getFormattedDateString = (lang: string) => {
  const d = new Date();
  const monthsEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthsHi = [
    "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ];
  
  if (lang === 'hi') {
    return `${d.getDate()} ${monthsHi[d.getMonth()]} ${d.getFullYear()}`;
  }
  return `${d.getDate()} ${monthsEn[d.getMonth()]} ${d.getFullYear()}`;
};

export default function DailyVachan() {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const dailyIndex = getDailyIndex(DAILY_VACHANS.length);
  const [currentIndex, setCurrentIndex] = useState<number>(dailyIndex);
  const [vachansList, setVachansList] = useState<DailyVachanType[]>(DAILY_VACHANS);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch from Firebase with real-time sync if collection exists
  useEffect(() => {
    const q = query(collection(db, 'hukamnamas'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: DailyVachanType[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DailyVachanType[];
        setVachansList(loaded);
        setCurrentIndex(getDailyIndex(loaded.length));
      }
    }, (error) => {
      console.log("Firestore collection 'hukamnamas' not found or inaccessible. Using local authentic cache:", error);
    });

    return () => unsubscribe();
  }, []);

  const activeVachan = vachansList[currentIndex % vachansList.length];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vachansList.length);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + vachansList.length) % vachansList.length);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const textToSpeak = language === 'hi' ? activeVachan.textHi : activeVachan.textEn;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleShare = async () => {
    const formattedDate = getFormattedDateString(language);
    const titleText = language === 'hi' ? `✨ आज का गुरुवचन (आध्यात्मिक संदेश) — ${formattedDate} ✨` : `✨ Daily Spiritual Vachan — ${formattedDate} ✨`;
    const bodyText = language === 'hi' ? activeVachan.textHi : activeVachan.textEn;
    const authorLine = `— ${activeVachan.acharya} (${language === 'hi' ? activeVachan.tithiHi : activeVachan.tithiEn})`;
    
    const shareText = `${titleText}\n\n"${bodyText}"\n\n${authorLine}\n\nShared via Terapanth AI App.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'hi' ? 'दैनिक गुरुवचन' : 'Daily Acharya Vachan',
          text: shareText,
          url: window.location.origin
        });
      } catch (e) {
        console.log("Share skipped or canceled:", e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy share text:", err);
      }
    }
  };

  const toggleFavorite = () => {
    if (favorites.includes(currentIndex)) {
      setFavorites(favorites.filter(i => i !== currentIndex));
    } else {
      setFavorites([...favorites, currentIndex]);
    }
  };

  const isFavorite = favorites.includes(currentIndex);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-4 sm:p-6 pb-28 text-left" id="daily-vachan-viewport">
      
      {/* 1. Header Information Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-amber-400 font-bold">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-stone-800 dark:text-zinc-100 uppercase tracking-wider">
              {language === 'hi' ? 'आचार्यश्री गुरुवचन' : "Acharya's Daily Vachan"}
            </h3>
            <p className="text-[11px] text-orange-600 dark:text-amber-400 font-extrabold uppercase tracking-widest mt-0.5">
              {language === 'hi' ? activeVachan.tithiHi : activeVachan.tithiEn}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 px-3 py-1.5 rounded-full font-bold">
            📅 {getFormattedDateString(language)}
          </span>
        </div>
      </div>

      {/* 2. Main Decorative Spiritual Document Card */}
      <div 
        className="bg-stone-50 dark:bg-zinc-950 rounded-[2.5rem] p-6 sm:p-8 border-4 border-amber-500/20 dark:border-amber-500/10 shadow-lg relative overflow-hidden" 
        id="vachan-card-container"
      >
        {/* Golden Indian spiritual ornamental motifs */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
        
        {/* Giant quotation visual mark */}
        <Quote className="absolute top-4 left-6 w-24 h-24 text-amber-500/5 dark:text-amber-400/5 pointer-events-none select-none z-0" />

        <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
          
          {/* Tag Category Badge */}
          <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg w-fit mb-6">
            ✨ {language === 'hi' ? activeVachan.tagHi : activeVachan.tagEn}
          </span>

          {/* Core Sacred Message */}
          <p className="text-lg sm:text-2xl font-serif font-semibold leading-relaxed text-stone-900 dark:text-zinc-50 italic px-2">
            &ldquo;{language === 'hi' ? activeVachan.textHi : activeVachan.textEn}&rdquo;
          </p>

          <div className="mt-8 pt-6 border-t border-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 font-black flex items-center justify-center text-xs shadow-md">
                गुरु
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-700 dark:text-amber-400 tracking-wide">
                  {activeVachan.acharya}
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-zinc-500 font-extrabold uppercase tracking-wider mt-0.5">
                  {language === 'hi' ? '११वें गुरुवर संदेश' : '11th Monastic Leader'}
                </p>
              </div>
            </div>

            {/* Daily Stable Flag */}
            {currentIndex % vachansList.length === dailyIndex && (
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm shadow-orange-500/20">
                {language === 'hi' ? 'आज का महामंत्र' : "TODAY'S DECREE"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Commentary / Swadhyay Explanation Card */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-stone-800 dark:text-zinc-100 mb-3">
          <BookOpen size={16} className="text-amber-500" />
          <h4 className="text-xs font-black uppercase tracking-widest">
            {language === 'hi' ? 'चित्त-चिंतन / स्वाध्याय' : 'Daily Reflection & Study'}
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed font-medium">
          {language === 'hi' ? activeVachan.explanationHi : activeVachan.explanationEn}
        </p>
      </div>

      {/* 4. Controls & Interactions */}
      <div className="grid grid-cols-4 gap-3">
        {/* Speak Audio */}
        <button
          onClick={handleSpeak}
          className={`col-span-1 py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
            isSpeaking
              ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10 animate-pulse'
              : 'bg-white dark:bg-zinc-900 border-stone-200/60 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-50'
          }`}
          title="Listen"
        >
          <Volume2 size={18} />
          <span className="text-[9px] font-bold tracking-widest uppercase">
            {isSpeaking ? (language === 'hi' ? 'सुनें' : 'STOP') : (language === 'hi' ? 'वाचन' : 'LISTEN')}
          </span>
        </button>

        {/* Favorite */}
        <button
          onClick={toggleFavorite}
          className={`col-span-1 py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-600'
              : 'bg-white dark:bg-zinc-900 border-stone-200/60 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-50'
          }`}
          title="Favorite"
        >
          <Heart size={18} className={isFavorite ? 'fill-rose-600' : ''} />
          <span className="text-[9px] font-bold tracking-widest uppercase">
            {isFavorite ? (language === 'hi' ? 'प्रिय' : 'SAVED') : (language === 'hi' ? 'संग्रह' : 'SAVE')}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="col-span-2 py-3.5 bg-white dark:bg-zinc-900 hover:bg-stone-50 dark:hover:bg-zinc-800 border border-stone-200/60 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
        >
          <Share2 size={16} className="text-amber-500" />
          {copied ? (language === 'hi' ? 'प्रतिलिपि की गई!' : 'Copied!') : (language === 'hi' ? 'साझा करें' : 'Share Message')}
        </button>
      </div>

      {/* 5. Pagination */}
      <div className="flex items-center justify-between border-t border-stone-200/50 dark:border-zinc-800/80 pt-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-stone-100 dark:bg-zinc-800/60 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← {language === 'hi' ? 'पिछला' : 'Prev'}
        </button>
        <span className="text-xs text-stone-400 font-bold">
          {currentIndex % vachansList.length + 1} / {vachansList.length}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-stone-100 dark:bg-zinc-800/60 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
        >
          {language === 'hi' ? 'अगला' : 'Next'} →
        </button>
      </div>

    </div>
  );
}
