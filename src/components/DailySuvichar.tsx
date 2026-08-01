import { useState, useEffect } from 'react';
import { Share2, Heart, RefreshCw, Bookmark, Calendar, ArrowRight, Quote, Trash2, Check, Users, Send, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { devLog } from '../lib/devLog';

interface SuvicharType {
  text: string;
  author: string;
  source: string;
}

const SUVICHAR: SuvicharType[] = [
  { text: "जो व्यक्ति क्रोध को क्षमा से जीत लेता है, वह सबसे बड़ा विजेता है।", author: "आचार्य श्री महाश्रमण जी", source: "प्रवचन" },
  { text: "अहिंसा केवल शरीर की नहीं, वाणी और मन की भी होनी चाहिए।", author: "आचार्य श्री महाप्रज्ञ जी", source: "जीवन विज्ञान" },
  { text: "सत्य बोलना कठिन है, पर उसका फल मीठा होता है।", author: "आचार्य श्री तुलसी जी", source: "अणुव्रत संदेश" },
  { text: "मन की शांति बाहर नहीं, भीतर खोजनी होगी।", author: "आचार्य श्री महाप्रज्ञ जी", source: "प्रेक्षाध्यान" },
  { text: "अपरिग्रह का अर्थ है — जितनी जरूरत उतना ही संग्रह।", author: "आचार्य श्री भिक्षु जी", source: "तेरापंथ मर्यादा" },
  { text: "धर्म वह है जो जीव को उन्नति की ओर ले जाए।", author: "आचार्य श्री महाश्रमण जी", source: "प्रवचन" },
  { text: "संयम जीवन की सबसे बड़ी शक्ति है।", author: "आचार्य श्री कालूगणी जी", source: "उपदेश" },
  { text: "प्रेक्षाध्यान से भीतर की दुनिया बदलती है।", author: "आचार्य श्री महाप्रज्ञ जी", source: "प्रेक्षाध्यान विज्ञान" },
  { text: "एक गुरु, एक आज्ञा — यही तेरापंथ की पहचान है।", author: "आचार्य श्री भिक्षु जी", source: "तेरापंथ स्थापना" },
  { text: "व्यसन मुक्ति ही सच्ची स्वतंत्रता है।", author: "आचार्य श्री महाश्रमण जी", source: "अहिंसा यात्रा" },
  { text: "क्षमा वीरों का आभूषण है।", author: "आचार्य श्री तुलसी जी", source: "अणुव्रत" },
  { text: "जो मन को जीत ले, उसने सब कुछ जीत लिया।", author: "आचार्य श्री महाप्रज्ञ जी", source: "मन का विज्ञान" },
  { text: "सामायिक में बैठना आत्मा से मिलना है।", author: "आचार्य श्री महाश्रमण जी", source: "साधना शिविर" },
  { text: "अनेकांत की दृष्टि ही सच्ची सहिष्णुता है।", author: "आचार्य श्री महाप्रज्ञ जी", source: "अनेकांतवाद" },
  { text: "तप से कर्म की निर्जरा होती है।", author: "आचार्य श्री भिक्षु जी", source: "तेरापंथ सिद्धांत" },
  { text: "बोलने से पहले सोचो — वाणी का संयम सबसे कठिन है।", author: "आचार्य श्री तुलसी जी", source: "अणुव्रत संदेश" },
  { text: "ज्ञानशाला बच्चों के भविष्य की नींव है।", author: "मुनि श्री उदित कुमार जी", source: "ज्ञानशाला प्रवचन" },
  { text: "आत्मा का विकास ही मोक्ष का मार्ग है।", author: "आचार्य श्री महाश्रमण जी", source: "प्रवचन" },
  { text: "अहिंसा यात्रा केवल पैरों की नहीं, आत्मा की यात्रा है।", author: "आचार्य श्री महाश्रमण जी", source: "अहिंसा यात्रा 2024" },
  { text: "धर्म आचरण में है, केवल शास्त्र पढ़ने में नहीं।", author: "आचार्य श्री भिक्षु जी", source: "भिक्षु स्तुति" },
  { text: "जीवन की सार्थकता सेवा और साधना में है।", author: "आचार्य श्री महाप्रज्ञ जी", source: "जीवन दर्शन" },
  { text: "मर्यादा ही संघ की शक्ति है।", author: "आचार्य श्री भिक्षु जी", source: "तेरापंथ मर्यादा" },
  { text: "प्रतिक्रमण पाप की सफाई है, आत्मा की स्नान।", author: "आचार्य श्री तुलसी जी", source: "साधना" },
  { text: "सच्चा सुख बाहर की वस्तुओं में नहीं, भीतर की शांति में है।", author: "आचार्य श्री महाश्रमण जी", source: "प्रवचन" },
  { text: "नवकार मंत्र गुणों की वंदना है, व्यक्तियों की नहीं।", author: "आचार्य श्री महाप्रज्ञ जी", source: "नवकार विज्ञान" },
  { text: "युवा पीढ़ी ही धर्मसंघ का भविष्य है।", author: "आचार्य श्री तुलसी जी", source: "ABTYP स्थापना" },
  { text: "संकल्प लो तो पूरा करो — अधूरा तप व्यर्थ है।", author: "आचार्य श्री भिक्षु जी", source: "तप विधान" },
  { text: "ध्यान से मन शांत होता है, और शांत मन से बुद्धि निर्मल।", author: "आचार्य श्री महाप्रज्ञ जी", source: "प्रेक्षाध्यान" },
  { text: "सेवा ही साधना है जब वह निःस्वार्थ हो।", author: "आचार्य श्री महाश्रमण जी", source: "प्रवचन" },
  { text: "अणुव्रत छोटे नियम हैं पर जीवन बड़ा बदलते हैं।", author: "आचार्य श्री तुलसी जी", source: "अणुव्रत आंदोलन" }
];

// Seed value based on date for unique but stable daily index
const getDailyIndex = (maxLen: number): number => {
  const d = new Date();
  const seed = (d.getFullYear() * 365) + ((d.getMonth() + 1) * 31) + d.getDate();
  return seed % maxLen;
};

// Month conversion translation
const getFormattedDateString = () => {
  const d = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function DailySuvichar({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const dailyIndex = getDailyIndex(SUVICHAR.length);
  const [currentIndex, setCurrentIndex] = useState<number>(dailyIndex);
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const activeQuote = SUVICHAR[currentIndex];

  // Stop speech when changing quote or unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakQuote = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const textToSpeak = `${activeQuote.text} - ${activeQuote.author}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.88; // Peaceful pace
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Retrieve saved quotes in real-time
  useEffect(() => {
    if (!user) {
      setSavedQuotes([]);
      return;
    }

    const path = `users/${user.uid}/savedQuotes`;
    const q = query(
      collection(db, path),
      orderBy('savedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedQuotes(list);
    }, (error) => {
      console.warn("Retrying/ignoring saved suvichar loading:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle saving current quote to Firestore
  const handleSaveQuote = async () => {
    if (!user) {
      alert("Please log in to save quotes to your personal profile.");
      return;
    }

    // Check if simple duplicate exists in the currently loaded last 5 quotes
    const alreadySaved = savedQuotes.some(q => q.text === activeQuote.text);
    if (alreadySaved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return;
    }

    setIsSaving(true);
    const path = `users/${user.uid}/savedQuotes`;
    try {
      await addDoc(collection(db, path), {
        text: activeQuote.text,
        author: activeQuote.author,
        source: activeQuote.source,
        savedAt: new Date().toISOString()
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete saved quote
  const handleDeleteSaved = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/savedQuotes/${id}`;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/savedQuotes`, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  // Manual cyclic navigations
  const handleNextQuote = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentIndex((prev) => (prev + 1) % SUVICHAR.length);
  };

  // Share quote with formatting context to Community via Web Share API or WhatsApp
  const handleShareToCommunity = async (targetPlatform?: 'native' | 'whatsapp') => {
    const preformattedMessage = `🕊️ *तेरापंथ AI — आज का सुविचार (Daily Suvichar)* 🕊️
📅 ${getFormattedDateString()}

"${activeQuote.text}"
— ${activeQuote.author} (${activeQuote.source})

✨ "अहिंसा, संयम और तप ही जीवन के मूल स्तंभ हैं।"

आध्यात्मिक संघ और समुदाय से जुड़ें:
${window.location.origin}`;

    if (targetPlatform === 'whatsapp') {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(preformattedMessage)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'आज का सुविचार - Terapanth Spiritual Wisdom',
          text: preformattedMessage,
          url: window.location.origin
        });
      } catch (e) {
        devLog("Community share skipped:", e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(preformattedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  const handleShareQuote = async () => {
    await handleShareToCommunity('native');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-4 sm:p-6" id="daily-suvichar-container">
      
      {/* Date Header Title */}
      <div className="flex items-center justify-between gap-2 text-emerald-600 dark:text-emerald-400">
        <div className="flex items-center gap-2">
          <Calendar size={18} />
          <span className="text-xs font-extrabold uppercase tracking-widest">
            आज का सुविचार — {getFormattedDateString()}
          </span>
        </div>

        {/* Listen / TTS Button */}
        <button
          type="button"
          onClick={handleSpeakQuote}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isSpeaking
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
          }`}
          title={isSpeaking ? "रोकें (Stop Reading)" : "सुविचार सुनें (Listen Suvichar)"}
        >
          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isSpeaking ? 'रोकें (Stop)' : 'सुनें (Listen)'}</span>
        </button>
      </div>

      {/* Primary Decorative Quote Card Container */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-[2rem] p-8 border border-[var(--border-color)] relative overflow-hidden shadow-sm" id="suvichar-primary-card">
        {/* Giant quotation visual mark */}
        <Quote className="absolute top-2 left-4 w-28 h-28 text-emerald-300/15 dark:text-emerald-500/10 pointer-events-none select-none z-0" />

        <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
          <p className="text-lg sm:text-xl font-bold leading-relaxed text-gray-800 dark:text-gray-100 serif-text">
            &ldquo;{activeQuote.text}&rdquo;
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                {activeQuote.author}
              </h4>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-widest mt-0.5 block">
                Source: {activeQuote.source}
              </span>
            </div>

            {/* Is this a special seed daily quote badge */}
            {currentIndex === dailyIndex && (
              <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full w-fit">
                Daily Focus
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interaction buttons container */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        {/* Share to Community (Web Share API) */}
        <button
          onClick={() => handleShareToCommunity('native')}
          className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 relative cursor-pointer"
          id="share-suvichar-community-btn"
        >
          <Users size={16} />
          {copied ? "Copied Message!" : "Share to Community"}
        </button>

        {/* WhatsApp Quick Share */}
        <button
          onClick={() => handleShareToCommunity('whatsapp')}
          className="py-3.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          title="Share on WhatsApp"
          id="share-suvichar-whatsapp-btn"
        >
          <MessageCircle size={16} />
          <span>WhatsApp</span>
        </button>

        {/* Save to Profile */}
        <button
          onClick={handleSaveQuote}
          disabled={isSaving}
          className={`py-3.5 px-4 border text-xs uppercase tracking-wider font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
            justSaved
              ? 'bg-emerald-700 border-emerald-700 text-white'
              : 'bg-[var(--card-bg)] hover:bg-black/5 dark:hover:bg-white/5 border-[var(--border-color)] text-[var(--text-spiritual)]'
          }`}
        >
          {justSaved ? <Check size={16} /> : <Heart size={16} className={justSaved ? "fill-white" : ""} />}
          {justSaved ? "Saved!" : isSaving ? "Saving..." : "Save"}
        </button>

        {/* Next cyclic */}
        <button
          onClick={handleNextQuote}
          className="py-3.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 border border-[var(--border-color)] rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
          title="See next suvichar"
        >
          <RefreshCw size={16} />
          Next
        </button>
      </div>

      {/* History subcollection viewer */}
      {user && savedQuotes.length > 0 && (
        <div className="mt-4 flex flex-col gap-3" id="saved-suvichars-feed">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Bookmark className="text-emerald-600 dark:text-emerald-400" size={14} />
            <h5 className="text-xs font-black uppercase tracking-widest text-gray-500">
              Your Saved Suvichars ({savedQuotes.length}/5)
            </h5>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {savedQuotes.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl flex justify-between gap-4 shadow-sm"
              >
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1.5 block">
                    — {item.author} ({item.source})
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteSaved(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all h-fit self-center"
                  title="Remove from saved"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
