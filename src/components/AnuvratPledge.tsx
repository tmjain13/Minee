import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  increment, 
  serverTimestamp,
  FieldPath
} from 'firebase/firestore';
import { 
  Award, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Share2, 
  Bookmark, 
  Info, 
  CheckSquare, 
  Square,
  Users,
  Activity,
  Calendar,
  Sparkles,
  PartyPopper,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

// Enum for OperationType to match firewall requirements
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

interface Anuvrat {
  id: number;
  name: string;
  category: "सभी" | "नैतिक" | "चारित्रिक" | "सांसारिक" | "आध्यात्मिक" | "सामाजिक";
  description: string;
  practical: string;
  icon: string;
}

const ANUVRATS: Anuvrat[] = [
  { id: 1, name: "अहिंसा अणुव्रत", category: "नैतिक", description: "स्थूल प्राणियों की जान-बूझकर हत्या न करना", practical: "मांसाहार बंद करें, जीव-जंतुओं को न सताएं", icon: "🕊️" },
  { id: 2, name: "सत्य अणुव्रत", category: "नैतिक", description: "स्थूल झूठ न बोलना — विशेषकर स्वार्थ के लिए नहीं", practical: "व्यापार में झूठ न बोलें, वादा निभाएं", icon: "✊" },
  { id: 3, name: "अचौर्य अणुव्रत", category: "नैतिक", description: "बिना अनुमति किसी की वस्तु न लेना", practical: "कर चोरी न करें, बेईमानी न करें", icon: "🤝" },
  { id: 4, name: "शील अणुव्रत", category: "चारित्रिक", description: "पर-स्त्री/पर-पुरुष से संबंध न रखना", practical: "वैवाहिक निष्ठा, चारित्रिक पवित्रता", icon: "💎" },
  { id: 5, name: "अपरिग्रह अणुव्रत", category: "चारित्रिक", description: "आवश्यकता से अधिक संग्रह न करना", practical: "जरूरत से ज्यादा न खरीदें, दान करें", icon: "🌿" },
  { id: 6, name: "दिग्व्रत", category: "सांसारिक", description: "अपनी गतिविधियों की सीमा तय करना", practical: "व्यापार और यात्रा की सीमा निर्धारित करें", icon: "🗺️" },
  { id: 7, name: "भोगोपभोग परिमाण व्रत", category: "सांसारिक", description: "दैनिक उपभोग की वस्तुओं की सीमा", practical: "खाने-पीने, वस्त्र, वाहन आदि की सीमा", icon: "⚖️" },
  { id: 8, name: "अनर्थदण्ड विरमण व्रत", category: "सांसारिक", description: "बिना कारण हिंसक गतिविधियों से दूर रहना", practical: "हिंसक खेल, नशीले पदार्थ, अश्लील सामग्री से दूर", icon: "🚫" },
  { id: 9, name: "सामायिक व्रत", category: "आध्यात्मिक", description: "प्रतिदिन निश्चित समय ध्यान-चिंतन", practical: "रोज 48 मिनट सामायिक करें", icon: "🧘" },
  { id: 10, name: "देशावगासिक व्रत", category: "आध्यात्मिक", description: "दिग्व्रत की सीमा को और कम करना", practical: "विशेष दिनों में घर से बाहर न जाएं", icon: "🏠" },
  { id: 11, name: "पौषध व्रत", category: "आध्यात्मिक", description: "विशेष दिनों में साधु जैसा जीवन जीना", practical: "अष्टमी/चतुर्दशी को उपवास और ध्यान", icon: "🌙" },
  { id: 12, name: "अतिथि संविभाग व्रत", category: "सामाजिक", description: "साधु-संतों और जरूरतमंदों की सेवा", practical: "साधुओं को गोचरी, गरीबों को दान", icon: "🙏" }
];

const CATEGORIES = ["सभी", "नैतिक", "चारित्रिक", "सांसारिक", "आध्यात्मिक", "सामाजिक"] as const;

export default function AnuvratPledge({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("सभी");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [userPledges, setUserPledges] = useState<Record<number, { takenAt?: any; anuvratName: string }>>({});
  const [globalStats, setGlobalStats] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [transitioningId, setTransitioningId] = useState<number | null>(null);

  // Load user pledges real-time from users/{uid}/anuvratPledges
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const path = `users/${user.uid}/anuvratPledges`;
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const pledges: Record<number, { takenAt?: any; anuvratName: string }> = {};
        snapshot.forEach((doc) => {
          const idStr = doc.id;
          const idNum = parseInt(idStr, 10);
          if (!isNaN(idNum)) {
            pledges[idNum] = doc.data() as { takenAt?: any; anuvratName: string };
          }
        });
        setUserPledges(pledges);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load global stats real-time from anuvratStats
  useEffect(() => {
    const path = `anuvratStats`;
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const stats: Record<number, number> = {};
        snapshot.forEach((doc) => {
          const idStr = doc.id;
          const idNum = parseInt(idStr, 10);
          if (!isNaN(idNum)) {
            stats[idNum] = doc.data().count || 0;
          }
        });
        setGlobalStats(stats);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleTogglePledge = async (anuvratId: number, anuvratName: string) => {
    if (!user) {
      alert("कृपया व्रत लेने के लिए लॉगिन करें।");
      return;
    }

    const alreadyPledged = !!userPledges[anuvratId];
    setTransitioningId(anuvratId);

    const userPledgeRef = doc(db, `users/${user.uid}/anuvratPledges`, anuvratId.toString());
    const statRef = doc(db, 'anuvratStats', anuvratId.toString());

    try {
      if (alreadyPledged) {
        // Untake Pledge
        await deleteDoc(userPledgeRef);
        await setDoc(statRef, { count: increment(-1) }, { merge: true });
      } else {
        // Take Pledge
        await setDoc(userPledgeRef, {
          anuvratId,
          anuvratName,
          takenAt: serverTimestamp()
        });
        await setDoc(statRef, { count: increment(1) }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/anuvratPledges/${anuvratId}`);
    } finally {
      setTransitioningId(null);
    }
  };

  const totalTaken = Object.keys(userPledges).length;
  const isCertified = totalTaken === 12;

  const filteredAnuvrats = selectedCategory === "सभी" 
    ? ANUVRATS 
    : ANUVRATS.filter(a => a.category === selectedCategory);

  const getFullCertificateShareText = () => {
    return `📜 अणुव्रत गौरव प्रमाण-पत्र\nमैंने तेरापंथ AI के माध्यम से आचार्य तुलसी द्वारा प्रणीत सभी 12 महान अणुव्रतों को अपने जीवन में स्वीकार कर लिया है।\n\n🕊️ "अणुव्रत छोटे नियम हैं, पर जीवन को बड़ा बदल देते हैं।"\nआप भी आज ही जुड़ें और अणुव्रत संकल्प लें!`;
  };

  const handleShareCertificate = async () => {
    const text = getFullCertificateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "अणुव्रत गौरव संकल्प",
          text: text,
        });
      } catch (err) {
        navigator.clipboard.writeText(text);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("प्रमाण-पत्र संदेश क्लिपबोर्ड पर कॉपी हो गया है!");
    }
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--border-color)] space-y-6 shadow-sm overflow-hidden text-left" id="anuvrat-pledge-container">
      
      {/* Header section with quote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-start gap-4.5">
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-rose-500 rounded-2xl shadow-sm border border-rose-500/10 shrink-0">
            <Award className="animate-bounce" size={24} />
          </div>
          <div>
            <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl flex items-center gap-2">
              अणुव्रत संकल्प शाला
              <span className="text-[10px] py-1 px-2.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold uppercase rounded-lg border border-rose-500/10 tracking-wider">
                12 Vows
              </span>
            </h3>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-0.5">Small Vows — Big Change</p>
          </div>
        </div>
      </div>

      {/* Acharya Tulsi Quote Callout */}
      <div className="relative overflow-hidden bg-rose-500/[0.02] dark:bg-white/[0.01] border border-red-500/10 rounded-2xl p-4.5 space-y-2">
        <div className="absolute right-3 top-2 text-rose-500/5 select-none font-black text-7xl">"</div>
        <p className="serif-text font-bold text-gray-800 dark:text-gray-200 text-sm italic leading-relaxed text-center sm:text-left">
          "अणुव्रत छोटे नियम हैं, पर जीवन को बड़ा बदल देते हैं।"
        </p>
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block text-center sm:text-right">
          — युगप्रधान आचार्य तुलसी
        </span>
      </div>

      {/* Vow Tracker Progress Dashboard */}
      <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-[var(--border-color)] rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">आपका संकल्प मीटर</span>
            <h4 className="serif-text font-extrabold text-gray-900 dark:text-white text-base">
              सक्रिय संकल्प: {totalTaken} / 12 अणुव्रत
            </h4>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black">
            <Activity size={12} className="animate-pulse" />
            <span>{Math.round((totalTaken / 12) * 100)}% संवर्धित</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(totalTaken / 12) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        
        <p className="text-[10.5px] text-gray-400 dark:text-gray-500 font-semibold leading-relaxed">
          {totalTaken === 0 
            ? "आध्यात्मिक प्रगति के लिए प्रत्येक अणुव्रत पर विचार करें और अपनी सहूलियत और क्षमता के अनुसार संकल्प लें।"
            : totalTaken === 12 
              ? "असाधारण! आपने सभी 12 नियमों को अपने जीवन में उतारा है। आपका जीवन मानवता के लिए एक प्रेरणा है।"
              : `शानदार! आपने 12 में से ${totalTaken} व्रतों को अपनाया है। अन्य व्रतों के व्यावहारिक सुझाव पढ़कर समाज को बेहतर बनाएं।`
          }
        </p>
      </div>

      {/* Special Certificate Modal Content if all 12 are committed */}
      <AnimatePresence>
        {isCertified && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.04] to-rose-500/[0.04] border-2 border-dashed border-amber-500/30 rounded-[2.5rem] p-6 sm:p-8 space-y-6 text-center"
            id="anuvrat-certificate-panel"
          >
            {/* Absolute sparkle backdrops */}
            <div className="absolute top-4 left-6 text-amber-500/20 animate-spin text-xl">✨</div>
            <div className="absolute bottom-6 right-8 text-rose-500/20 animate-bounce text-2xl">✨</div>

            <div className="inline-flex p-4.5 bg-amber-500/10 rounded-full text-amber-500 mb-2">
              <PartyPopper size={36} className="animate-wiggle" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/10">
                अणुव्रत गौरव प्रमाण-पत्र
              </span>
              <h2 className="serif-text font-black text-gray-900 dark:text-white text-2xl">
                परम संकल्प सिद्धि अभिनन्दन
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-xs max-w-md mx-auto leading-relaxed">
                यह प्रमाणित किया जाता है कि आपने आचार्य तुलसी द्वारा प्रज्वलित अहिंसा और सदाचार की ज्योति को सहेजते हुए सभी <b>12 अणुव्रत</b> स्वीकार किए हैं।
              </p>
            </div>

            {/* Certificate Medal Representation Container */}
            <div className="border border-amber-500/15 py-6 px-10 rounded-[2rem] max-w-sm mx-auto bg-amber-500/[0.02] space-y-4">
              <div className="inline-flex p-3 bg-gradient-to-br from-amber-400 to-rose-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h4 className="serif-text font-black text-gray-800 dark:text-gray-200 text-base">
                  {user?.displayName || "परम श्रावक"}
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mt-1">
                  तेरापंथ अणुव्रती साधक
                </p>
              </div>
              <div className="text-[9px] text-gray-400 font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wider">
                <Calendar size={11} className="text-amber-500" />
                <span>तारीख: {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleShareCertificate}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <Share2 size={14} />
                <span>संकल्प साझा करें</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Horizontally scrolling Category Filters */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-2 px-2 mask-linear-edges" id="anuvrat-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-400 dark:text-gray-400 border-black/5 dark:border-white/5 hover:bg-black/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid List of Anuvrats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAnuvrats.map((anuvrat) => {
          const isPledged = !!userPledges[anuvrat.id];
          const isExpanded = expandedId === anuvrat.id;
          const isProcessing = transitioningId === anuvrat.id;
          const pledgersCount = globalStats[anuvrat.id] || 0;

          return (
            <div 
              key={anuvrat.id}
              className={`bg-black/[0.01]/[0.01] dark:bg-white/[0.01] border transition-all rounded-[2rem] p-5 space-y-4 relative overflow-hidden ${
                isPledged 
                  ? 'border-rose-500/25 bg-rose-500/[0.01]' 
                  : 'border-black/5 dark:border-white/5 hover:bg-black/[0.02]/[0.02]'
              }`}
            >
              {isPledged && (
                <div className="absolute right-0 top-0 bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-bl-2xl">
                  स्वीकृत
                </div>
              )}

              {/* Top info and checkbox */}
              <div className="flex gap-4 items-start">
                {/* Interactive State Commitment */}
                <button
                  disabled={isProcessing}
                  onClick={() => handleTogglePledge(anuvrat.id, anuvrat.name)}
                  className={`p-2 rounded-xl transition-all border shrink-0 ${
                    isPledged
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-400 border-black/5 dark:border-white/5 hover:bg-black/5'
                  } ${isProcessing ? 'opacity-30' : 'cursor-pointer'}`}
                  title={isPledged ? "संकल्प वापस लें" : "संकल्प स्वीकार करें"}
                >
                  {isPledged ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>

                {/* Vow Details */}
                <div className="space-y-1 pr-6 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl shrink-0 select-none">{anuvrat.icon}</span>
                    <h4 className="serif-text font-black text-gray-900 dark:text-white text-sm">
                      {anuvrat.name}
                    </h4>
                  </div>
                  <span className="text-[8px] font-black uppercase text-gray-400 block tracking-wider">
                    श्रेणी: {anuvrat.category}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed pt-1">
                    {anuvrat.description}
                  </p>
                </div>
              </div>

              {/* Bottom Community and Expand controls */}
              <div className="border-t border-black/[0.03] dark:border-white/[0.03] pt-3 flex items-center justify-between gap-2">
                
                {/* Community count display */}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black flex items-center gap-1.5">
                  <Users size={12} className="text-rose-400" />
                  <span>{pledgersCount > 0 ? `${pledgersCount.toLocaleString('hi-IN')} साधक` : "पहले साधक बनें"}</span>
                </span>

                {/* Expand Toggle Button */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : anuvrat.id)}
                  className="px-3.5 py-1.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 transition-all flex items-center gap-1 cursor-pointer text-xs font-bold text-gray-500"
                >
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {isExpanded ? "छिपाएं" : "व्यावहारिक सुझाव"}
                  </span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {/* Expandable Section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-dashed border-rose-500/10 pt-3.5 space-y-2 text-left"
                  >
                    <div className="bg-rose-500/[0.02] dark:bg-white/[0.02] rounded-2xl p-3 border border-rose-500/5">
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-1">
                        दैनिक जीवन के व्यावहारिक सुझाव:
                      </span>
                      <p className="text-xs leading-relaxed italic text-gray-500 dark:text-gray-400">
                        ✨ {anuvrat.practical}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Safety info footer checklist info block */}
      <div className="flex gap-3.5 p-4 bg-rose-500/[0.02] dark:bg-white/[0.01] rounded-2xl border border-rose-500/10">
        <Info size={16} className="text-rose-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold leading-relaxed">
          <b>संस्कृति गौरव:</b> अणुव्रत आंदोलन की स्थापना सन् 1949 में द्वितीय संघचालक आचार्य श्री तुलसी द्वारा संपूर्ण मानव जाति के नैतिक उत्थान हेतु की गई थी। इसके नियम किसी विशेष संप्रदाय के न होकर सार्वभौमिक तथा मानवतावादी हैं। अपनी आत्मा को पवित्र और समाज को शांत बनाने के लिए इनका नियमित अभ्यास करें।
        </p>
      </div>

    </div>
  );
}
