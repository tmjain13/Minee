import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import {
  Calendar,
  Sparkles,
  Users,
  Send,
  Loader2,
  Heart,
  ChevronLeft,
  Volume2,
  ExternalLink,
  Flame,
  Search,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

interface ForgivenessPost {
  id: string;
  recipient: string;
  createdAt: any;
  message: string;
}

const PARYUSHANA_DAYS = [
  { day: 1, tithi: "भाद्रपद कृष्णा १२", theme: "मैत्री भावना", activity: "किसी पुराने मित्र या रिश्तेदार से माफी मांगें", sutra: "खमेमि सव्वे जीवे" },
  { day: 2, tithi: "भाद्रपद कृष्णा १३", theme: "प्रमोद भावना", activity: "किसी की सफलता में खुशी मनाएं, ईर्ष्या त्यागें", sutra: "नवकार मंत्र — 9 बार" },
  { day: 3, tithi: "भाद्रपद कृष्णा १४", theme: "कारुण्य भावना", activity: "किसी जरूरतमंद की सेवा करें", sutra: "इरियावही सूत्र" },
  { day: 4, tithi: "भाद्रपद शुक्ला १", theme: "माध्यस्थ भावना", activity: "विपरीत विचारों के प्रति तटस्थ रहें", sutra: "करेमि भंते" },
  { day: 5, tithi: "भाद्रपद शुक्ला २", theme: "तप साधना", activity: "उपवास या अयंबिल करें", sutra: "लोगस्स सूत्र" },
  { day: 6, tithi: "भाद्रपद शुक्ला ३", theme: "स्वाध्याय", activity: "आगम ग्रंथ या धार्मिक पुस्तक पढ़ें", sutra: "नवकार — 108 बार" },
  { day: 7, tithi: "भाद्रपद शुक्ला ४", theme: "ध्यान", activity: "1 घंटे का प्रेक्षाध्यान करें", sutra: "कायोत्सर्ग — 10 मिनट" },
  { day: 8, tithi: "भाद्रपद शुक्ला ५ (संवत्सरी)", theme: "क्षमापना", activity: "सभी से हृदय से क्षमा मांगें — मिच्छामि दुक्कडं", sutra: "खमेमि सव्वे जीवे — पूर्ण पाठ" }
];

const BHAJANS = [
  { title: "मैत्री भाव का बहता झरना" },
  { title: "मिच्छामि दुक्कड़म भजन" },
  { title: "पर्युषण पर्व है आया" },
  { title: "आतम को जगाने आया पर्व पर्युषण महान" },
  { title: "क्षमापना भजन: भूल चूक सब माफ़ करना" }
];

interface ParyushanaTabProps {
  onBack?: () => void;
}

export default function ParyushanaTab({ onBack }: ParyushanaTabProps) {
  const { user } = useAuth();
  
  // Real-time calculation state
  const [recipient, setRecipient] = useState("");
  const [wallPosts, setWallPosts] = useState<ForgivenessPost[]>([]);
  const [posting, setPosting] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // Simulation mode toggler to let users play with Paryushana views when outside the official September 8-15, 2026 range.
  const [forcePreview, setForcePreview] = useState(false);

  // Parse Today's date relative to Year 2026 Paryushana: September 8, 2026 to September 15, 2026
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Official Date limits for 2026
  const startParyushana = new Date("2026-09-08T00:00:00");
  const endParyushana = new Date("2026-09-15T23:59:59");
  const samvatsariDate = new Date("2026-09-15T00:00:00");

  const isDuringParyushana = (now >= startParyushana && now <= endParyushana) || forcePreview;

  // Calculates countdown numbers
  const getCountdownText = () => {
    // If today is September 15 (or matches forcePreview day 8 simulate)
    const isTodaySamvatsari = (now.getMonth() === 8 && now.getDate() === 15) || (forcePreview && activeDayIdx === 7);
    if (isTodaySamvatsari) {
      return "आज महान संवत्सरी पर्व है 🙏";
    }

    if (now > endParyushana) {
      return "पर्युषण पर्व समाप्त हो चुका है। क्षमापना जीवन का नित्य नियम है! 🙏";
    }

    // Days remaining until Samvatsari
    const diffTime = samvatsariDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `संवत्सरी में ${diffDays} दिन शेष`;
    }

    return "संवत्सरी क्षमावाणी पर्व प्रारंभ है 🙏";
  };

  // Pre-Paryushana countdown
  const getPreParyushanaCountdown = () => {
    const diffTime = startParyushana.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return `पर्व प्रारंभ होने में ${diffDays} दिन शेष`;
    }
    return "";
  };

  // Load live feed from Firestore collection 'paryushanaWall'
  useEffect(() => {
    const path = `paryushanaWall`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts: ForgivenessPost[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          recipient: data.recipient || "सभी जीव",
          createdAt: data.createdAt,
          message: data.message || "मिच्छामि दुक्कडं 🙏"
        });
      });
      setWallPosts(posts);
    }, (error) => {
      console.error("Khamauji wall loading issues:", error);
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  const handlePostForgiveness = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    const path = `paryushanaWall`;

    try {
      await addDoc(collection(db, path), {
        recipient: recipient.trim() || 'सभी जीव',
        message: 'मिच्छामि दुक्कडं 🙏',
        createdAt: serverTimestamp(),
        // Unified cross-schema compatible keys for the Forgiveness Wall:
        name: user?.email?.split('@')[0] || "श्रद्धालु श्रावक",
        text: `प्रति: ${recipient.trim() || 'सभी जीव'} - मिच्छामि दुक्कडं 🙏`,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || null,
        timestamp: serverTimestamp()
      });
      setRecipient("");
      alert("मिच्छामि दुक्कडं! आपका संदेश क्षमापना दीवार पर जुड़ गया है।");
    } catch (err) {
      console.error("Posting to wall failed:", err);
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--border-color)] space-y-6 shadow-sm overflow-hidden text-left" id="paryushana-portal">
      
      {/* Header sections */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-start gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 transition-all cursor-pointer text-gray-700 dark:text-gray-300"
              title="पीछे जाएं"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl flex items-center gap-2">
              महापर्व पर्युषण साधना
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Spiritual Cleanse & Forgiveness
            </p>
          </div>
        </div>

        {/* Simulator switch */}
        <button
          onClick={() => setForcePreview(!forcePreview)}
          className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
            forcePreview 
              ? 'bg-rose-500 text-white border-rose-500' 
              : 'bg-black/5 dark:bg-white/5 text-gray-400 border-transparent hover:bg-black/10'
          }`}
        >
          {forcePreview ? "PREVIEW MODE: ON" : "PREVIEW MODE: OFF"}
        </button>
      </div>

      {/* Conditional rendering based on date criteria */}
      {!isDuringParyushana && (
        <div className="space-y-6 text-center py-6">
          <div className="inline-flex p-4.5 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-full shadow-lg shadow-rose-500/20">
            <Calendar size={36} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/10">
              पर्युषण महापर्व 2026
            </span>
            <h2 className="serif-text font-black text-gray-900 dark:text-white text-2xl">
              8 सितम्बर – 15 सितम्बर 2026
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
              जैन धर्म का महानतम शुद्धि पर्व पर्युषण आगामी सितम्बर माह में प्रारंभ होगा। नीचे दी गई समयावधि की उलट गिनती से मानसिक तैयारी करें।
            </p>
          </div>

          {getPreParyushanaCountdown() && (
            <div className="bg-black/[0.02] dark:bg-white/[0.01] border border-[var(--border-color)] py-4.5 px-6 rounded-2xl font-black text-rose-500 text-sm tracking-widest uppercase flex items-center justify-center gap-2 max-w-xs mx-auto">
              <Clock size={16} className="animate-pulse" />
              <span>{getPreParyushanaCountdown()}</span>
            </div>
          )}

          <p className="text-[10.5px] text-gray-400 max-w-md mx-auto italic leading-relaxed">
            *पर्युषण पर्व के दौरान यहाँ ८ दिनों की दैनिक तप-सज्जा कार्यक्रम, मिच्छामि दुक्कड़ं क्षमापना बोर्ड और साधना भजन चालू हो जाएंगे। आप ऊपर <b>PREVIEW MODE</b> चालू करके संपूर्ण कार्यप्रणाली का अवलोकन अभी कर सकते हैं।*
          </p>
        </div>
      )}

      {isDuringParyushana && (
        <div className="space-y-6">
          
          {/* Active Countdown Ribbon */}
          <div className="bg-gradient-to-r from-red-600 to-rose-500 p-5 rounded-3xl text-white space-y-2.5 relative overflow-hidden shadow-lg shadow-rose-500/10">
            {/* Ambient fire background */}
            <div className="absolute right-4 bottom-2 text-white/5 select-none font-black text-7xl">🔥</div>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80 block">पर्युषण आत्म-शुद्धि महापर्व</span>
            <h4 className="serif-text font-black text-xl flex items-center gap-2">
              <Sparkles className="animate-bounce" size={20} />
              {getCountdownText()}
            </h4>
            <p className="text-[10.5px] opacity-90 leading-relaxed font-semibold">
              क्रोध, लोभ, मान और माया के बंधनों से मुक्त होकर सच्चे हृदय से जीव मात्र के साथ मैत्री सूत्र 'खमेमि सव्वे जीवे' का ध्यान करें।
            </p>
          </div>

          {/* Daily activity of 8 Days Accordion Timeline */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">
                ८ दिवसीय दैनिक शुद्धि पथ (8-Day Schedule)
              </h4>
              <span className="text-[9px] font-extrabold uppercase bg-red-500/10 text-red-500 px-2.5 py-1 rounded-md border border-red-500/10">
                DAILY SUTRAS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PARYUSHANA_DAYS.map((p, idx) => {
                const isActive = activeDayIdx === idx;
                return (
                  <div
                    key={p.day}
                    className={`border transition-all rounded-[1.5rem] p-4.5 ${
                      isActive 
                        ? 'border-rose-500/25 bg-rose-500/[0.01]' 
                        : 'border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex items-start gap-3">
                        {/* Day indicator */}
                        <div 
                          onClick={() => setActiveDayIdx(idx)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs cursor-pointer select-none border transition-all ${
                            isActive 
                              ? 'bg-rose-500 text-white border-rose-500' 
                              : 'bg-black/5 dark:bg-white/5 text-gray-500 border-black/5 dark:border-white/5 hover:bg-black/10'
                          }`}
                        >
                          D-{p.day}
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">तिथि: {p.tithi}</span>
                          <h5 className="serif-text font-black text-gray-900 dark:text-white text-sm">
                            भावना: {p.theme}
                          </h5>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveDayIdx(idx)}
                        className="px-3 py-1 bg-black/5 hover:bg-black/10 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase text-gray-400 border border-black/5 cursor-pointer"
                      >
                        {isActive ? "सक्रिय कार्य" : "कार्य देखें"}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-t border-dashed border-rose-500/10 mt-3 pt-3.5 space-y-3 text-xs leading-relaxed"
                        >
                          <div className="p-3.5 bg-rose-500/[0.02] dark:bg-white/[0.02] rounded-xl border border-rose-500/5">
                            <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest block mb-1">
                              आज का साधना संकल्प / गतिविधि:
                            </span>
                            <p className="font-bold text-gray-800 dark:text-gray-200">
                              👉 {p.activity}
                            </p>
                          </div>

                          <div className="p-3.5 bg-amber-500/[0.02] dark:bg-white/[0.02] rounded-xl border border-amber-500/5 flex items-center gap-2">
                            <Flame size={14} className="text-amber-500 shrink-0" />
                            <div>
                              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                                प्रस्तावित सूत्र / मंत्र साधना:
                              </span>
                              <p className="font-extrabold text-amber-600 dark:text-amber-400 serif-text text-sm">
                                🕉️ {p.sutra}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Khamauji (Forgiveness) Board Wall */}
          <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-[var(--border-color)] p-6 rounded-3xl space-y-4">
            <div>
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">सामुदायिक क्षमापना</span>
              <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">
                खमाऊजी सार्वजनिक दीवार — Forgiveness Wall
              </h4>
            </div>

            {/* Input Submission */}
            <form onSubmit={handlePostForgiveness} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">किसे क्षमा मांग रहे हैं? (वैकल्पिक / Optional)</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="उदा. माता-पिता, मित्र, कोई विशेष व्यक्ति या समस्त जीव..."
                  maxLength={60}
                  className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 focus:border-rose-500/30 rounded-2xl px-4.5 py-3 text-xs font-semibold outline-none transition-all text-gray-850 dark:text-gray-200"
                />
              </div>

              {/* Fixed message block */}
              <div className="bg-rose-500/5 px-4.5 py-3 rounded-2xl border border-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                <span>संदेश: <b>मिच्छामि दुक्कडं 🙏</b></span>
                <span className="text-[8px] font-black tracking-wider uppercase bg-rose-500/10 px-2 py-1 rounded">स्वचालित</span>
              </div>

              <div className="flex justify-between items-center flex-wrap gap-2 pt-1">
                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wide">
                  📌 नोट: यह दीवाल सार्वजनिक है।
                </span>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-rose-500/10 flex items-center gap-2 cursor-pointer"
                >
                  {posting ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                  <span>दीवार पर पोस्ट करें</span>
                </button>
              </div>
            </form>

            {/* Wall list stream feed */}
            <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10.5px] font-black uppercase tracking-wider mb-2">
                <Users size={12} />
                <span>सामुदायिक क्षमा प्रवाह (अंतिम २० संदेश)</span>
              </div>

              {wallPosts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">दीवार पर अभी कोई संदेश नहीं है। पहले साधक बनें और अपना क्षमा भाव जोड़ें।</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin">
                  {wallPosts.map((post) => (
                    <div 
                      key={post.id}
                      className="bg-black/[0.02]/50 dark:bg-white/[0.01] border border-black/5 dark:border-white/5 p-3 rounded-xl flex items-start gap-2 text-left shrink-0"
                    >
                      <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg shrink-0 mt-0.5">
                        <Heart size={12} className="fill-rose-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-gray-800 dark:text-gray-200">
                            प्राप्तकर्ता: <span className="text-rose-500 font-extrabold">{post.recipient}</span>
                          </span>
                          <span className="text-[8px] text-gray-400 font-bold">
                            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : "अभी-अभी"}
                          </span>
                        </div>
                        <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-1">
                          {post.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Paryushana Bhajans playlist with search links */}
          <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-[var(--border-color)] p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-black/5 pb-3">
              <Volume2 className="text-amber-500" size={16} />
              <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">
                पर्युषण पर्व आराधना भजन (Bhajans)
              </h4>
            </div>

            <div className="space-y-2">
              {BHAJANS.map((b, idx) => {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(b.title + " जैन भजन")}`;
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center gap-3 bg-black/[0.02]/30 dark:bg-white/[0.01] hover:bg-black/[0.03]/40 border border-black/5 dark:border-white/5 p-3 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 font-mono">
                        0{idx + 1}
                      </span>
                      <p className="text-xs font-bold text-gray-850 dark:text-gray-100">
                        {b.title}
                      </p>
                    </div>

                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-rose-500/5 rounded-xl border border-rose-500/10 text-rose-500 transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="यूट्यूब पर खोजें"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-gray-400 italic">
              *इन भजनों को यूट्यूब पर स्वतंत्र रूप से सुनने के लिए आइकन पर क्लिक करें। अपने घर में संगीत की पावन लहर लहराएं।*
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
