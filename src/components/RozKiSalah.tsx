import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Quote, Calendar, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Share2, 
  Award, Heart, Sparkles, HelpCircle, History, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { devLog } from '../lib/devLog';

export interface SalahItem {
  id: string;
  salah: string;
  english: string;
  category: 'Sanyam' | 'Sadhana' | 'Aparigraha' | 'Vani' | 'Seva' | 'Dhyan';
  categoryLabel: string;
  source: string;
}

export const SALAH_POOL: SalahItem[] = [
  {
    id: 'salah-1',
    salah: "आज सूर्यास्त से पहले चौविहार (भोजन-पानी का त्याग) पूर्ण करें। रात्रि भोजन त्याग स्वास्थ्य और आत्मा की शुद्धि का परम आधार है।",
    english: "Complete your dinner before sunset. Avoiding late-night meals strengthens physical health and spiritual focus.",
    category: 'Sanyam',
    categoryLabel: "संयम (Self-Control)",
    source: "आचार्य श्री भिक्षु जी"
  },
  {
    id: 'salah-2',
    salah: "आज दिन भर में कम से कम १० मिनट के लिए पूर्ण मौन धारण करें। वाणी का संयम हमारे भीतर के कोलाहल को शांत करता है।",
    english: "Practice complete silence for at least 10 minutes today. Speech control calms the internal chaos and builds mental energy.",
    category: 'Vani',
    categoryLabel: "वाणी संयम (Speech Control)",
    source: "आचार्य श्री महाप्रज्ञ जी"
  },
  {
    id: 'salah-3',
    salah: "आज किसी भी व्यक्ति पर क्रोध न करने का सचेत रूप से संकल्प लें। क्रोध आने की स्थिति में तुरंत ३ गहरी लंबी सांसें लें।",
    english: "Make a conscious vow to avoid anger today. Take 3 deep diaphragmatic breaths immediately if you feel provoked.",
    category: 'Dhyan',
    categoryLabel: "क्रोध विसर्जन (Anger Release)",
    source: "आचार्य श्री महाप्रज्ञ जी"
  },
  {
    id: 'salah-4',
    salah: "आज भोजन करने से पूर्व भोजन की थाली के समक्ष बैठकर १५ सेकंड के लिए सभी के प्रति कृतज्ञता व्यक्त करें और अन्न की बर्बादी बिलकुल न करें।",
    english: "Express deep gratitude before taking your meal and make a vow to never waste food in your plate.",
    category: 'Sadhana',
    categoryLabel: "कृताज्ञता (Gratitude)",
    source: "आचार्य श्री तुलसी जी"
  },
  {
    id: 'salah-5',
    salah: "आज अपने मोबाइल फोन या सोशल मीडिया उपयोग का समय कम से कम १ घंटा घटाएं और उस समय में कोई अच्छी धार्मिक या दार्शनिक पुस्तक का स्वाध्याय करें।",
    english: "De-clutter your mind by reducing screen-time by 1 hour today, utilizing that saved time for spiritual reading and study.",
    category: 'Sadhana',
    categoryLabel: "स्वाध्याय (Self-Study)",
    source: "आचार्य श्री तुलसी जी"
  },
  {
    id: 'salah-6',
    salah: "आज अपनी आय या संग्रह में से एक छोटा सा हिस्सा किसी धार्मिक कार्य, निर्धन बच्चों की शिक्षा या साधु-साध्वी की सेवा सुश्रूषा में दान करें।",
    english: "Practice non-attachment by dedicating a portion of your earnings or resources towards charity and monastic service.",
    category: 'Aparigraha',
    categoryLabel: "अपरिग्रह (Charity/Dana)",
    source: "आचार्य श्री भिक्षु जी"
  },
  {
    id: 'salah-7',
    salah: "आज किसी के पीठ पीछे उसकी बुराई या निंदा न करने का संकल्प लें। किसी का दोष देखने के बजाय उसके गुणों को सराहें।",
    english: "Commit to positive speech; avoid backbiting or examining other's flaws. Appreciate high qualities and strengths instead.",
    category: 'Vani',
    categoryLabel: "प्रिय वचन (Noble Speech)",
    source: "आचार्य श्री महाश्रमण जी"
  },
  {
    id: 'salah-8',
    salah: "आज घर के बड़े-बुजुर्गों या माता-पिता के पास कम से कम १० मिनट शांति से बैठें, उनके अनुभव सुनें और उन्हें सादर नमन करें।",
    english: "Spend at least 10 minutes playing or discussing with elders or parents. Respecting family builds domestic harmony.",
    category: 'Seva',
    categoryLabel: "विनय और सेवा (Filial Seva)",
    source: "आचार्य श्री तुलसी जी"
  },
  {
    id: 'salah-9',
    salah: "आज सामायिक या २४ मिनट के ध्यान की साधना करें। आत्मा के समीप बैठने का प्रयास संसार के सारे दुखों की अनुपम विस्मृति है।",
    english: "Practice Samayik meditation for 48 or 24 minutes. Sitting with your inner self dispels worldly stresses.",
    category: 'Sadhana',
    categoryLabel: "सामायिक (Meditation)",
    source: "आचार्य श्री महाश्रमण जी"
  },
  {
    id: 'salah-10',
    salah: "आज कम से कम १ घंटे के लिए 'अहिंसा व्रत' का सघन चिंतन करें — न किसी जीव को मारना, न सताना, न ही कठोर शब्दों से ठेस पहुंचाना।",
    english: "Consciously practice non-violence (Ahimsa) for at least 1 hour today: no harm, no torment, no harsh words to anyone.",
    category: 'Sanyam',
    categoryLabel: "अहिंसा व्रत (Non-Violence)",
    source: "आचार्य श्री तुलसी जी"
  },
  {
    id: 'salah-11',
    salah: "आज दिन में ३ बार अपनी नाभि से सांस लेते हुए गहरी श्वास-प्रश्वास साधना करें, इसे प्रेक्षाध्यान का प्राण-दर्शन कहा जाता है।",
    english: "Utilize deep abdominal breathing 3 times today, bringing full mind awareness to biological respiration.",
    category: 'Dhyan',
    categoryLabel: "श्वसन प्रेक्षा (Deep Breath)",
    source: "आचार्य श्री महाप्रज्ञ जी"
  },
  {
    id: 'salah-12',
    salah: "आज अपने दिन भर के व्यवहार की छोटी सी समीक्षा (प्रतिक्रमण) रात को सोने से पहले करें। अनजाने में हुई गलतियों के लिए क्षमा याचना करें।",
    english: "Review your day before sleeping. Practice remorse (Pratikraman) and seek mental forgiveness from all living beings.",
    category: 'Sadhana',
    categoryLabel: "प्रतिक्रमण (Daily Review)",
    source: "आचार्य श्री महाश्रमण जी"
  },
  {
    id: 'salah-13',
    salah: "आज अनावश्यक संग्रह (Cluttering) या अतिरिक्त परिधानों की खरीदारी से बचें। सादगी में ही जीवन की सुंदरता और संयम सहेजें।",
    english: "Avoid buying unnecessary clothes or devices today. Treasure the simplicity of living lighter, avoiding storage clutter.",
    category: 'Aparigraha',
    categoryLabel: "सादगी (Simplicity)",
    source: "आचार्य श्री भिक्षु जी"
  },
  {
    id: 'salah-14',
    salah: "आज नवकार महामंत्र की २७ सांसों के साथ मानसिक जाप करें। यह मंत्र सांस पर आधारित होने पर मन का निरोध करता है।",
    english: "Recite the Navkar mantra mentally in synchronization with 27 complete breathing cycles to anchor your thoughts.",
    category: 'Sadhana',
    categoryLabel: "जाप साधना (Inward Jaap)",
    source: "आचार्य श्री कालूगणी जी"
  },
  {
    id: 'salah-15',
    salah: "आज अपने आस-पास किसी भी पीड़ित पशु-पक्षी या व्यक्ति के प्रति मन में करुणा और मैत्री भाव लाएं, उन्हें अन्न-जल या सहायता प्रदान करें।",
    english: "Evoke absolute compassion and friendliness towards suffering animals or folks today; aid them with nutrition.",
    category: 'Seva',
    categoryLabel: "करुणाभाव (Compassion Seva)",
    source: "आचार्य श्री महाश्रमण जी"
  }
];

export const RozKiSalah = memo(() => {
  const { user } = useAuth();
  
  // Daily Index calculation based on stable seed
  const dailyIndex = useMemo(() => {
    const today = new Date();
    const seed = (today.getFullYear() * 370) + ((today.getMonth() + 1) * 31) + today.getDate();
    return seed % SALAH_POOL.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(dailyIndex);
  const [direction, setDirection] = useState<'up' | 'down'>('up'); // 'down' means going older, 'up' means going newer
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [userCommitments, setUserCommitments] = useState<string[]>([]);
  const [savingCommit, setSavingCommit] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<string>('');
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  const activeSalah = SALAH_POOL[currentIndex];

  // Subscribe to real-time firestore logs of user's vows
  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    const path = `users/${user.uid}/dailySalahVows`;
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      const vowedIds: string[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const dateStr = data.date || '';
        list.push({
          id: docSnap.id,
          salahId: data.salahId,
          salahText: data.salahText,
          date: dateStr,
          vowed: data.vowed,
          category: data.category
        });
        
        // Check if committed today
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr === todayStr && data.salahId) {
          vowedIds.push(data.salahId);
        }
      });
      
      setUserCommitments(vowedIds);
      setHistoryLogs(list);
      setLoadingHistory(false);
    }, (err) => {
      console.warn("Firestore error in RozKiSalah:", err);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Autoplay intervals: downward to upward transition tick
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setDirection('up');
      setCurrentIndex((prev) => (prev + 1) % SALAH_POOL.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  // Handle slide upward (or downward manually)
  const handleNext = () => {
    setDirection('up');
    setCurrentIndex((prev) => (prev + 1) % SALAH_POOL.length);
  };

  const handlePrev = () => {
    setDirection('down');
    setCurrentIndex((prev) => (prev - 1 + SALAH_POOL.length) % SALAH_POOL.length);
  };

  const handleCommitVow = async () => {
    if (!user) {
      setAlertMsg("कृपया आज की सलाह का संकल्प लेने के लिए पहले लॉगिन करें! 🌸");
      setTimeout(() => setAlertMsg(''), 4000);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const targetSalahId = activeSalah.id;

    if (userCommitments.includes(targetSalahId)) {
      setAlertMsg("आप पहले ही आज इस सलाह का पालन करने का सुंदर संकल्प ले चुके हैं! 🙏");
      setTimeout(() => setAlertMsg(''), 4000);
      return;
    }

    setSavingCommit(true);
    try {
      const path = `users/${user.uid}/dailySalahVows`;
      await addDoc(collection(db, path), {
        salahId: targetSalahId,
        salahText: activeSalah.salah,
        category: activeSalah.category,
        date: todayStr,
        vowed: true,
        timestamp: serverTimestamp()
      });

      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      setAlertMsg("मंगलकारी संकल्प दर्ज हुआ! 'अहिंसा परमो धर्मः' — आपका दिन मंगलमय हो। 🌟");
      setTimeout(() => setAlertMsg(''), 5000);
    } catch (e) {
      console.error(e);
      setAlertMsg("संकल्प सहेजने में तकनीकी बाधा आई। कृपया पुनः प्रयास करें।");
    } finally {
      setSavingCommit(false);
    }
  };

  const handleShare = async () => {
    const textMsg = `💡 *तेरापंथ रोज की एक सलाह (Daily Life Counsel)* 💡\n\n` +
                    `🌿 *${activeSalah.categoryLabel}*:\n` +
                    `"${activeSalah.salah}"\n\n` +
                    `— *${activeSalah.source}*\n\n` +
                    `🌸 *इंग्लिश व्याख्या*:\n` +
                    `"${activeSalah.english}"\n\n` +
                    `आप भी अपने दैनिक जीवन में आत्म-संयम, साधना और सेवा की ज्योति जलाएं!\n` +
                    `📲 तेरापंथ AI से आज ही जुड़ें और अपनी साधना का बहीखाता सहेजें:\n${window.location.origin}`;
                    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'रोज की एक सलाह — Jain Wisdom Daily',
          text: textMsg,
          url: window.location.origin
        });
      } catch (e) {
        devLog("Web Share skipped:", e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textMsg);
        setAlertMsg("सलाह संदेश सफलतापूर्वक कॉपी हो गया! अब आप इसे व्हाट्सएप पर साझा कर सकते हैं। 📲");
        setTimeout(() => setAlertMsg(''), 4000);
      } catch (e) {
        console.error("Clipboard copy failed: ", e);
      }
    }
  };

  // Slide Animation configurations (downward to upward)
  // For upward slide ('up'):
  //   entering item starts at bottom (y: 60) and finishes at center (y: 0).
  //   exiting item starts at center (y: 0) and moves upward (y: -60).
  // For downward slide ('down'):
  //   entering item starts at top (y: -60) and finishes at center (y: 0).
  //   exiting item starts at center (y: 0) and moves downward (y: 60).
  const slideVariants: any = {
    enter: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? 60 : -60,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring', stiffness: 350, damping: 25 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? -60 : 60,
      opacity: 0,
      scale: 0.95,
      transition: {
        y: { type: 'spring', stiffness: 350, damping: 25 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Filter aggregate stats of vowing counts
  const totalVowsCount = historyLogs.length;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden text-left space-y-6">
      {/* Universal styling wrapper to bypass iframe restriction and layout squeezing */}

      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header element */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
            <Heart size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="serif-text text-sm sm:text-base font-black text-amber-600 dark:text-amber-500 leading-tight">रोज की एक सलाह — Daily Resolution</h3>
            <p className="text-[9px] text-[#A1A1AA] uppercase tracking-widest font-black">Down-to-Up Vertical Wisdom Ticker</p>
          </div>
        </div>

        {/* AutoPlay Toggle */}
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
            autoPlay 
              ? 'bg-amber-500 text-zinc-950 font-black shadow-sm shadow-amber-500/30' 
              : 'bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-gray-400'
          }`}
          title="Toggle Auto Slide"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoPlay ? 'bg-zinc-950 animate-ping' : 'bg-gray-405'}`} />
          {autoPlay ? "Auto-Play ON (7s)" : "Auto-Play OFF"}
        </button>
      </div>

      {/* Core slide viewport (Strict downward to upward container) */}
      <div className="bg-gradient-to-br from-amber-50/20 via-[var(--card-bg)] to-amber-500/[0.02] border border-[var(--border-color)] rounded-3xl p-6 relative overflow-hidden min-h-[220px] flex flex-col justify-between">
        
        {/* Double background quotes visual */}
        <Quote className="absolute top-4 left-4 w-28 h-28 text-amber-500/5 dark:text-amber-500/5 pointer-events-none select-none z-0" />
        
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {currentIndex === dailyIndex && (
            <span className="bg-amber-600/10 border border-amber-600/20 text-amber-600 dark:text-amber-400 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              🎯 Today's Special Focus
            </span>
          )}
          <span className="bg-black/5 dark:bg-white/5 text-[9px] font-mono font-bold px-2 py-0.5 rounded text-gray-400">
            {currentIndex + 1} / {SALAH_POOL.length}
          </span>
        </div>

        {/* Animation stage */}
        <div className="relative flex-1 flex items-center justify-center my-4 z-10 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full text-center space-y-4"
            >
              {/* Category tag */}
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/10 text-[9.5px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                {activeSalah.categoryLabel}
              </div>

              {/* Devnagari advice statement */}
              <p className="serif-text salah-text-box font-extrabold text-gray-900 dark:text-gray-100 px-2 sm:px-6 leading-relaxed">
                &ldquo;{activeSalah.salah}&rdquo;
              </p>

              {/* English description */}
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium px-4 leading-relaxed italic max-w-xl mx-auto">
                "{activeSalah.english}"
              </p>

              {/* Auth Details / Source */}
              <div className="pt-2">
                <span className="text-[9.5px] uppercase font-black tracking-widest text-[#B45309]">
                  — {activeSalah.source}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Up-down slider navigation triggers */}
        <div className="border-t border-[var(--border-color)] pt-4 flex items-center justify-between gap-4 z-10">
          <button
            onClick={handlePrev}
            className="p-2 border border-[var(--border-color)] rounded-xl text-gray-400 hover:text-[var(--text-spiritual)] hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Older Tip"
          >
            <ChevronDown size={14} />
            Prev
          </button>

          {/* Action trigger: Commit vow button */}
          <button
            onClick={handleCommitVow}
            disabled={savingCommit}
            className={`px-5 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all active:scale-95 flex items-center gap-2 ${
              userCommitments.includes(activeSalah.id)
                ? 'bg-emerald-500 text-white font-extrabold shadow-sm'
                : 'bg-amber-500 text-zinc-950 font-black hover:bg-amber-600'
            }`}
          >
            {userCommitments.includes(activeSalah.id) ? (
              <>
                <CheckCircle2 size={13} />
                <span>संकल्प ग्रहण पूर्ण (Vow Taken)</span>
              </>
            ) : (
              <>
                <Heart size={13} className={savingCommit ? 'animate-ping' : ''} />
                <span>आज इस नियम का पालन करूँगा (Take Vow)</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 border border-[var(--border-color)] rounded-xl text-gray-400 hover:text-[var(--text-spiritual)] hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Newer Tip"
          >
            Next
            <ChevronUp size={14} />
          </button>
        </div>
      </div>

      {/* Dynamic Interaction Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Share box */}
        <div className="bg-black/5 dark:bg-white/[0.02] border border-[var(--border-color)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">धर्म प्रचार सहयोग (Social Propagation)</span>
            <h4 className="serif-text text-sm font-black text-gray-800 dark:text-gray-200">सत्संग एवं सुसंस्कार साझा करें</h4>
            <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
              एक छोटी से सलाह समाज को अहिंसक, शाकाहारी और संयमित बना सकती है। आज का सुविचार अभी अपने व्हाट्सएप समूहों में शेयर करें।
            </p>
          </div>

          <button
            onClick={handleShare}
            className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-widest rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Share2 size={12} />
            <span>व्हाट्सएप पर शेयर करें WhatsApp</span>
          </button>
        </div>

        {/* Aggregates block */}
        <div className="bg-amber-500/[0.02] border border-amber-500/10 p-4 rounded-2xl flex flex-col justify-between relative group">
          <div className="space-y-1 text-left">
            <span className="text-[9px] uppercase tracking-widest font-black text-amber-600 dark:text-amber-400 block">सयंम साधना स्कोरबोर्ड (Your Resolution Ledger)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[var(--text-spiritual)] font-mono">{totalVowsCount}</span>
              <span className="text-[9.5px] text-gray-400 font-black">कुल सवचेत संकल्प (Total Acts)</span>
            </div>
            <p className="text-[10px] text-gray-500 font-semibold leading-normal">
              आपके आध्यात्मिक संकल्प 'तेरापंथ AI' डेटाबेस पे सुरक्षित दर्ज किए जा रहे हैं। अपनी जीवनशैली को प्रति दिन सुसंस्कृत बनाएं।
            </p>
          </div>

          <div className="pt-2 text-[9px] font-black text-amber-600 flex items-center gap-1 uppercase tracking-wider">
            <Award size={11} className="shrink-0" />
            <span>संकल्प स्तर: {totalVowsCount >= 10 ? 'साधना शिरोमणि (Sadhadhupati)' : totalVowsCount >= 3 ? 'व्रत धारक (Vowed Ascetic)' : 'जिज्ञासु उपासक (Secker)'}</span>
          </div>
        </div>
      </div>

      {/* Persistence Log Feed */}
      {user && historyLogs.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 mb-2">
            <History className="text-amber-500 shrink-0" size={14} />
            <h5 className="text-[10px] font-black uppercase tracking-widest text-[#B45309]">आपके संकल्प कालानुक्रम (History of Resolved Vows)</h5>
          </div>

          <div className="grid grid-cols-1 select-none gap-2.5 max-h-[160px] overflow-y-auto pr-1">
            {historyLogs.map((log) => (
              <div 
                key={log.id}
                className="bg-zinc-50 dark:bg-zinc-950 border border-[var(--border-color)] p-3 rounded-xl flex items-center justify-between gap-3 shadow-none hover:shadow-xs transition-all"
              >
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8.5px] font-bold text-gray-400">
                      {log.date}
                    </span>
                    <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black uppercase px-2 py-0.5 rounded">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-[10.5px] font-bold text-gray-700 dark:text-gray-300 truncate mt-1">
                    "{log.salahText}"
                  </p>
                </div>

                <span className="text-[8px] font-black text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1">
                  🌿 RESOLVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Alert */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2"
          >
            <CheckCircle2 className="text-amber-600 shrink-0" size={14} />
            <span>{alertMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

RozKiSalah.displayName = 'RozKiSalah';
export default RozKiSalah;
