import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  Award, 
  Flame, 
  MapPin, 
  Users, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowLeft,
  Calendar,
  FolderOpen,
  Folder,
  Layers,
  History,
  Check,
  Loader2,
  Bookmark,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface FaqItem {
  id: string;
  topicId: 'LEADERSHIP' | 'ASCETICISM' | 'SAMSKAR_STAYS' | 'AI_GENERATED';
  subTopicId: 'ACHARYA' | 'ADMIN' | 'CONDUCT' | 'GYANSHALA' | 'CHATURMAS' | 'AI_QUERY';
  topicLabel: string;
  subTopicLabel: string;
  q: string;
  a: string;
  hindiQ: string;
  hindiA: string;
  icon?: React.ReactNode;
  isAiGenerated?: boolean;
  timestamp?: string;
}

interface AiSmartFaqEngineProps {
  onBack?: () => void;
}

export const AiSmartFaqEngine: React.FC<AiSmartFaqEngineProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [searchKey, setSearchKey] = useState('');
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [expandedSubTopic, setExpandedSubTopic] = useState<string | null>(null);

  // Caching & Recent Searches State
  const [cachedFaqs, setCachedFaqs] = useState<FaqItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // AI Generation State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResponseText, setAiResponseText] = useState('');

  // Journal Saving State
  const [journalAddingId, setJournalAddingId] = useState<string | null>(null);
  const [journalSuccessId, setJournalSuccessId] = useState<string | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCache = localStorage.getItem('terapanth_faq_cache');
      if (storedCache) {
        setCachedFaqs(JSON.parse(storedCache));
      }
      
      const storedSearches = localStorage.getItem('terapanth_recent_searches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (e) {
      console.error("Failed to load local storage FAQ configurations:", e);
    }
  }, []);

  // Sync online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const aiFaqCoreData = useMemo<FaqItem[]>(() => [
    {
      id: "FAQ-01",
      topicId: "LEADERSHIP",
      subTopicId: "ACHARYA",
      topicLabel: "संघीय संगठन व नेतृत्व",
      subTopicLabel: "आचार्य परंपरा व नेतृत्व (Divine Lineage)",
      q: "Who is the current leader (Acharya) and Sadhvi Pramukha of Terapanth?",
      hindiQ: "तेरापंथ धर्मसंघ के वर्तमान अनुशास्ता और साध्वी प्रमुखा का अधिकृत विवरण क्या है?",
      a: "Currently, the 11th Acharya, Yugpradhan Shri Mahashraman Ji, is the sole spiritual sovereign of the Terapanth Dharmasangh. Following the heavenly departure (Devlok Gaman) of the 8th Sadhvi Pramukha, Sadhvi Kanakprabha Ji, on March 17, 2022, the 9th and current Sadhvi Pramukha, Shri Vishrutvibha Ji (appointed on Vaishakh Shukla Chaturdashi, 2022), efficiently leads the order of nuns (Sadhvi Sangh) under his spiritual guidance.",
      hindiA: "वर्तमान में ११वें अधिनायक युगप्रधान आचार्य श्री महाश्रमण जी धर्मसंघ के एकमात्र सर्वोच्च आध्यात्मिक अधिपति हैं। ८वीं साध्वी प्रमुखा कनकप्रभा जी के १७ मार्च २०२२ को हुए देवलोक गमन के बाद, वर्तमान में ९वीं साध्वी प्रमुखा श्री विश्रुतविभा जी (पद स्थापना: वैशाख शुक्ल चतुर्दशी, २०२२) साध्वी संघ का कुशल संचालन कर रही हैं।",
      icon: <Flame className="w-5 h-5 text-amber-500" />
    },
    {
      id: "FAQ-02",
      topicId: "LEADERSHIP",
      subTopicId: "ADMIN",
      topicLabel: "संघीय संगठन व नेतृत्व",
      subTopicLabel: "प्रशासनिक स्तंभ व बहुरूपी परिषद (Consultative Assembly)",
      q: "What is the history and responsibility of the Chief Monk (Mukhya Muni) and Sadhvi Varya?",
      hindiQ: "मुख्यमुनि स्वामी और साध्वी वर्या जी के आधिकारिक पदों का क्या इतिहास है?",
      a: "These administrative leadership posts were created by Acharya Shri Mahashraman Ji to reinforce sangh governance. Mukhya Muni Muni Shri Mahavir Kumar Ji Swami (appointed in 2017, Assam) is the administrative head of the monks. Sadhvi Varya Sambuddhaysha Ji (appointed in 2016, Assam) is the historic first-ever coordinator and educator-in-chief of the sisters. Both are key members of the supreme consultative 'Bahushrut Parishad' (7-in-1 elite matrix).",
      hindiA: "आचार्य श्री महाश्रमण जी द्वारा संघ प्रबंधन को सुदृढ़ करने हेतु इन पदों का सृजन किया गया। मुख्यमुनि मुनि श्री महावीर कुमार जी स्वामी मुनि संघ के मुख्य स्तंभ हैं (स्थापना: २०१७, असम)। साध्वी वर्या संबुद्धयशा जी इस पद पर प्रतिष्ठित होने वाली इतिहास की प्रथम साध्वी हैं (स्थापना: २०१६, असम)। दोनों ही संत 'बहुश्रुत परिषद' के गौरवशाली अंग हैं।",
      icon: <Users className="w-5 h-5 text-indigo-500" />
    },
    {
      id: "FAQ-03",
      topicId: "ASCETICISM",
      subTopicId: "CONDUCT",
      topicLabel: "श्रमण आचार व साधना",
      subTopicLabel: "साधु-साध्वी आचार मर्यादा (Ascetic Vows)",
      q: "What are the core conduct rules and initiation (Diksha) restrictions for monks and nuns?",
      hindiQ: "तेरापंथ साधु-साध्वी आचार और दीक्षा मर्यादा के मुख्य नियम क्या हैं?",
      a: "Ascetics strictly observe the absolute great vows (Mahavratas) of non-violence. They travel exclusively on foot (Padayatra) and never use vehicles, mobile phones, electricity, or modern machinery. They accept pure, non-violent food begging (Nirdosh Gochari) in wooden bowls (Kashtapatra), ensuring zero burden on households. Initiation (Diksha) requires rigorous spiritual testing and strictly adheres to age restrictions (denying minors without compliance) under strict approvals from the Acharya.",
      hindiA: "संत पूर्ण अहिंसा महाव्रत के धारक होते हैं; वे नंगे पैर पैदल पदविहार (Padayatra) करते हैं और किसी भी प्रकार के वाहन, मोबाइल या बिजली उपकरणों का उपयोग नहीं करते। वे काष्ठ (लकड़ी) के पात्रों में निर्दोष गोचरी ग्रहण करते हैं। मुमुक्षु दीक्षा कड़े वैराग्य परीक्षण और अल्पायु दीक्षा मर्यादाओं के कड़े अनुपालन के बाद गुरुदेव की आज्ञा से ही संभव है।",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />
    },
    {
      id: "FAQ-04",
      topicId: "SAMSKAR_STAYS",
      subTopicId: "GYANSHALA",
      topicLabel: "शिक्षा, संस्कार व प्रवास",
      subTopicLabel: "ज्ञानशाला मूल्यपरक शिक्षा पद्धति (Values System)",
      q: "What is the current nation-wide and state-wise census of the Gyanshala network?",
      hindiQ: "महासभा के अंतर्गत ज्ञानशाला नेटवर्क की वर्तमान सांख्यिकी क्या है?",
      a: "According to the official central census data of the Jain Shvetambar Terapanthi Mahasabha, there are 571 active Gyanshala centers running across 23 states. This value education system educates over 18,098 young students, empowered by 4,038 certified teachers globally classified into certified levels: Vigya, Visharad, and Snatak.",
      hindiA: "जैन श्वेतांबर तेरापंथी महासभा के केंद्रीय डेटा के अनुसार, देश के २३ राज्यों में ५७१ सक्रिय ज्ञानशाला केंद्र संचालित हैं। इनमें १८,०९८ से अधिक ज्ञानार्थी बच्चे और ४,०३८ से अधिक क्षेत्रीय प्रमाणित प्रशिक्षिकाएं (श्रेणियां: विज्ञ, विशारद, स्नातक) सक्रिय रूप से संस्कार निर्माण का कार्य कर रही हैं।",
      icon: <BookOpen className="w-5 h-5 text-teal-500" />
    },
    {
      id: "FAQ-05",
      topicId: "SAMSKAR_STAYS",
      subTopicId: "CHATURMAS",
      topicLabel: "शिक्षा, संस्कार व प्रवास",
      subTopicLabel: "चातुर्मास प्रवास गोष्ठियां २०२६ (Chaturmas Destinations)",
      q: "Where are the official large Chaturmas destinations declared for the year 2026 (V.S. 2083)?",
      hindiQ: "वर्ष २०२६ (वि.सं. २०८३) के नवीन चातुर्मास घोषणाओं के प्रमुख केंद्र कौन से हैं?",
      a: "Under the benign grace of Acharya Shri Mahashraman Ji, 10 primary large Chaturmas centers have been designated for 2026: Muni Suvrat Kumar Ji Swami (West Ahmedabad Navrangpura), Muni Shri Vimal Kumar Ji (Shahdara, Delhi / Faridabad), Sadhvi Satyaprabha Ji (Pachpadra), Sadhvi Madhubala Ji (Parvat Patiya, Surat), Sadhvi Kundan Prabha Ji (Jasol), Sadhvi Kanchanprabha Ji (Kalbadevi, Mumbai), Sadhvi Nirvanshree Ji (Chembur), and Sadhvi Shivmala Ji (Vashi), among others.",
      hindiA: "गुरुदेव द्वारा घोषित १० मुख्य चातुर्मास केंद्रों में: मुनि सुव्रत कुमार जी स्वामी (पश्चिम अहमदाबाद नवरंगपुरा), मुनिश्री विमल कुमार जी (शाहदरा, दिल्ली), साध्वी सत्यप्रभा जी (Pachpadra), साध्वी मधुबालाजी (पर्वतपाटिया, सूरत), साध्वी कुंदन प्रभाजी (Jasol), साध्वी कंचनप्रभाजी (कालबादेवी, मुम्बई), साध्वी निर्वाणश्रीजी (चेम्बूर) और साध्वी शिवमाला जी (वाशी) शामिल हैं।",
      icon: <MapPin className="w-5 h-5 text-rose-500" />
    }
  ], []);

  // Combined Faq Items (Static and Dynamic cached ones)
  const combinedFaqs = useMemo(() => {
    return [...aiFaqCoreData, ...cachedFaqs];
  }, [aiFaqCoreData, cachedFaqs]);

  // Topic filter configuration
  const mainTopics = useMemo(() => {
    const topics = [
      { id: 'ALL', label: '🗂️ सभी प्रश्न (All)' },
      { id: 'LEADERSHIP', label: '👑 संघीय नेतृत्व' },
      { id: 'ASCETICISM', label: '🛡️ श्रमण आचार' },
      { id: 'SAMSKAR_STAYS', label: '📢 प्रवास व संस्कार' },
    ];
    if (cachedFaqs.length > 0) {
      topics.push({ id: 'AI_GENERATED', label: '🤖 एआई समाधान (AI Answers)' });
    }
    return topics;
  }, [cachedFaqs.length]);

  // Filters Faq array based on search text and active category
  const sortedFaqs = useMemo(() => {
    return combinedFaqs.filter(item => {
      const query = searchKey.toLowerCase().trim();
      if (!query) {
        return selectedTopic === 'ALL' || item.topicId === selectedTopic;
      }
      const matchesSearch = 
        item.q.toLowerCase().includes(query) || 
        item.a.toLowerCase().includes(query) || 
        item.hindiQ.includes(query) || 
        item.hindiA.includes(query);
      const matchesTopic = selectedTopic === 'ALL' || item.topicId === selectedTopic;
      return matchesSearch && matchesTopic;
    });
  }, [searchKey, selectedTopic, combinedFaqs]);

  // Group by subTopicId
  const groupedFaqs = useMemo(() => {
    const groups: Record<string, { label: string; topicId: string; items: FaqItem[] }> = {};
    sortedFaqs.forEach(item => {
      if (!groups[item.subTopicId]) {
        groups[item.subTopicId] = {
          label: item.subTopicLabel,
          topicId: item.topicId,
          items: []
        };
      }
      groups[item.subTopicId].items.push(item);
    });
    return Object.entries(groups);
  }, [sortedFaqs]);

  const quickSuggestions = [
    { phrase: 'वर्तमान अनुशास्ता', label: '👑 अनुशास्ता' },
    { phrase: 'साधु आचार', label: '🛡️ साधु आचार' },
    { phrase: '२०२६ चातुर्मास', label: '📢 २०२६ चातुर्मास' },
    { phrase: 'ज्ञानशाला', label: '🎓 ज्ञानशाला' },
    { phrase: 'बहुश्रुत परिषद', label: '👥 शीर्ष परिषद' }
  ];

  // Caching recent search logic
  const saveRecentSearch = (queryStr: string) => {
    const trimmed = queryStr.trim();
    if (!trimmed) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Store last 5 entries
      localStorage.setItem('terapanth_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  // Triggers Gemini AI FAQ resolver securely via server api
  const handleAskAi = async () => {
    const trimmedQuery = searchKey.trim();
    if (!trimmedQuery) return;
    
    if (isOffline) {
      alert("आप अभी ऑफ़लाइन हैं। नए एआई समाधान के लिए इंटरनेट की आवश्यकता है। हालांकि, आप अपने पहले से खोजे गए उत्तर देख सकते हैं।");
      return;
    }

    setAiGenerating(true);
    setAiResponseText("");
    
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Secure Weetragi system guideline context proxy
      const systemPrompt = "You are 'Weetragi', a serene, highly-objective, and respectful Jain Terapanth spiritual intelligence. " +
        "Respond strictly in accordance with Jain Shwetambar Terapanth philosophy, Acharyas (Bhikshu to Mahashraman), and values. " +
        "Provide a concise, accurate, and clear explanation. " +
        "Always structure your response with: " +
        "1. Hindi translation / scriptural citation. " +
        "2. Elegant, professional explanation in both Hindi and English. " +
        "Keep it structured and under 150 words. Do not inject HTML style tags.";

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: `User is asking this FAQ: "${trimmedQuery}". (Instructions: ${systemPrompt})`
        })
      });

      if (!response.ok) {
        throw new Error('विफल हो गया');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                if (!parsed.chunk.includes("<style>")) {
                  fullText += parsed.chunk;
                  setAiResponseText(fullText);
                }
              }
            } catch (e) {
              // Parse fail
            }
          }
        }
      }

      // Assemble new dynamic FAQ Item
      const newFaq: FaqItem = {
        id: `AI-FAQ-${Date.now()}`,
        topicId: 'AI_GENERATED',
        subTopicId: 'AI_QUERY',
        topicLabel: '🤖 एआई जिज्ञासा समाधान',
        subTopicLabel: '🤖 एआई समाधान (AI Generated Answers)',
        q: trimmedQuery,
        hindiQ: trimmedQuery,
        a: fullText,
        hindiA: fullText,
        isAiGenerated: true,
        timestamp: new Date().toISOString()
      };

      const updatedCached = [newFaq, ...cachedFaqs];
      setCachedFaqs(updatedCached);
      localStorage.setItem('terapanth_faq_cache', JSON.stringify(updatedCached));

      // Append query to recent searches
      saveRecentSearch(trimmedQuery);

      // Auto expand / show the newly resolved AI answer
      setActiveFaqId(newFaq.id);
      setSelectedTopic('AI_GENERATED');
    } catch (err) {
      console.error("AI FAQ error:", err);
      alert("एआई समाधान प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।");
    } finally {
      setAiGenerating(false);
    }
  };

  // Add insightful answer directly to user's SpiritualJournal
  const handleAddToJournal = async (faq: FaqItem) => {
    setJournalAddingId(faq.id);
    try {
      const insightText = `[जिज्ञासा समाधान]\nप्रश्न: ${faq.hindiQ || faq.q}\nउत्तर: ${faq.hindiA || faq.a}`;

      // Update LocalStorage journal draft
      const currentDraft = localStorage.getItem('spiritual_journal_draft') || "";
      const newDraft = currentDraft 
        ? `${currentDraft}\n\n${insightText}` 
        : insightText;
      localStorage.setItem('spiritual_journal_draft', newDraft);

      // Sync to Firestore if user logged in
      const currentUser = auth.currentUser;
      if (currentUser) {
        const dateId = new Date().toISOString().split('T')[0];
        const recordRef = doc(db, `users/${currentUser.uid}/spiritualJournal`, dateId);
        
        // Load current entry safely first
        const snap = await getDoc(recordRef);
        let currentText = "";
        let currentMood = "🧘 शांत";
        let currentEmotionalState = "";

        if (snap.exists()) {
          const data = snap.data();
          currentText = data.text || "";
          currentMood = data.mood || "🧘 शांत";
          currentEmotionalState = data.emotionalState || "";
        }

        const mergedText = currentText 
          ? `${currentText}\n\n${insightText}` 
          : insightText;

        await setDoc(recordRef, {
          text: mergedText,
          mood: currentMood,
          emotionalState: currentEmotionalState,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      setJournalSuccessId(faq.id);
      setTimeout(() => setJournalSuccessId(null), 3000);
    } catch (err) {
      console.error("Failed to append to journal:", err);
      alert("जर्नल में सहेजने में त्रुटि आई। कृपया पुनः प्रयास करें।");
    } finally {
      setJournalAddingId(null);
    }
  };

  // Staggered Motion Layout Animation Presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-6 bg-[#FCF8F2] relative rounded-[2rem] p-5 border border-zinc-200/50 dark:border-zinc-800/10" id="ai-smart-faq-engine-outer">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      
      {/* 1. TOP SECTION: Header & Search & Offline Banner */}
      <div className="flex flex-col gap-4 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/20 relative z-10" id="faq-header-container">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 mr-1 rounded-xl bg-zinc-900/5 hover:bg-zinc-900/10 active:scale-95 transition-all text-zinc-700 border border-zinc-200">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-rose-500/10 border border-rose-500/25 rounded-full text-[10px] font-black tracking-widest text-[#ff5e7e] uppercase">Knowledge Hub</span>
                {isOffline && (
                  <span className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    <WifiOff size={10} /> ऑफ़लाइन मोड (Offline)
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-zinc-800 mt-1">🧠 एआई-पावर्ड जिज्ञासा समाधान केंद्र</h2>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative group" id="faq-search-wrapper">
          <div className="absolute inset-y-0 left-4 flex items-center text-zinc-400 group-focus-within:text-rose-500">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="जिज्ञासा या कीवर्ड टाइप करें (जैसे: दीक्षा, सामायिक, आचार)..." 
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-rose-500/50 shadow-inner"
          />
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Categories & Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar relative z-10" id="faq-tag-pills">
        {mainTopics.map(topic => (
          <button
            key={topic.id}
            onClick={() => { setSelectedTopic(topic.id); setExpandedSubTopic(null); }}
            className={`px-4 py-2.5 rounded-2xl text-[10.5px] font-black uppercase tracking-wider border flex items-center gap-2 whitespace-nowrap transition-all ${
              selectedTopic === topic.id 
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white border-transparent shadow-md' 
                : 'bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50'
            }`}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Quick suggestions tag bar */}
      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs relative z-10" id="faq-predictive-bar">
        <span className="text-[9.5px] font-bold text-zinc-400 mr-1 uppercase">सुझाव:</span>
        {quickSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => { setSearchKey(suggestion.phrase); setSelectedTopic('ALL'); saveRecentSearch(suggestion.phrase); }}
            className="px-2.5 py-1 text-[10px] font-bold text-zinc-600 bg-white hover:text-[#ff5e7e] hover:border-rose-500/20 rounded-xl border border-zinc-200/60 transition-all"
          >
            {suggestion.label}
          </button>
        ))}
      </div>

      {/* Recent Searches Block */}
      {recentSearches.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1 relative z-10" id="faq-recent-searches">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <History size={11} className="text-zinc-400" /> हालिया खोजें (Recent Searches):
            </span>
            <button
              onClick={() => {
                setRecentSearches([]);
                localStorage.removeItem('terapanth_recent_searches');
              }}
              className="text-[9px] font-bold text-zinc-400 hover:text-rose-500 underline uppercase tracking-wider cursor-pointer"
            >
              साफ़ करें (Clear)
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((query, index) => (
              <button
                key={index}
                onClick={() => { setSearchKey(query); setSelectedTopic('ALL'); }}
                className="px-2.5 py-1 text-[10px] font-bold text-zinc-600 bg-white hover:text-rose-500 hover:border-rose-500/30 rounded-xl border border-zinc-200/50 transition-all"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Secure Ask AI Promo Banner */}
      {searchKey.trim().length > 0 && !aiGenerating && (
        <div className="bg-gradient-to-r from-rose-500/5 to-amber-500/5 border border-rose-500/10 rounded-2xl p-4 flex flex-col gap-2.5 mt-2 relative overflow-hidden" id="faq-ask-ai-cta">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl" />
          <div className="flex items-center gap-2">
            <Sparkles className="text-rose-500 shrink-0" size={16} />
            <h4 className="text-xs font-black text-zinc-800 uppercase">गुरूकृपा एआई समाधान (Ask Terapanth AI)</h4>
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            क्या आपको अपनी जिज्ञासा का समाधान नहीं मिला? इस कीवर्ड <strong>"{searchKey}"</strong> पर पूज्य आचार्य श्री महाश्रमण जी के धर्मसंघ के सिद्धांतों के अनुरूप एआई से समाधान प्राप्त करें।
          </p>
          <button
            onClick={handleAskAi}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 transition-all text-[11px] font-black uppercase tracking-wider text-white rounded-xl active:scale-95 self-start cursor-pointer shadow-md"
          >
            ✨ एआई से समाधान पूछें (Consult AI)
          </button>
        </div>
      )}

      {/* AI Streaming Response Widget */}
      {aiGenerating && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex flex-col gap-3 animate-pulse shadow-sm" id="faq-ai-streaming">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-rose-500" size={15} />
              <span className="text-xs font-black text-rose-500 uppercase tracking-wider">गुरूकृपा एआई समाधान प्रदाता...</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">वीतरागी मोड (Weetragi Persona)</span>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">जिज्ञासा: {searchKey}</p>
            <div className="border-t border-zinc-100 pt-2">
              <p className="text-xs text-zinc-700 leading-relaxed italic">{aiResponseText || "चिंतन व समाधान की धारा बह रही है..."}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOTTOM SECTION: Accordion List with motion staggered animations */}
      {groupedFaqs.length > 0 ? (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="flex flex-col gap-4 relative z-10" 
          id="faq-nested-container"
        >
          {groupedFaqs.map(([subTopicId, group]) => {
            const isSubExpanded = expandedSubTopic === subTopicId || searchKey.trim().length > 0;
            return (
              <motion.div 
                variants={itemVariants} 
                key={subTopicId} 
                className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-3 shadow-sm"
              >
                <div onClick={() => setExpandedSubTopic(isSubExpanded ? null : subTopicId)} className="flex items-center justify-between cursor-pointer">
                  <h4 className="text-xs font-black text-rose-600 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {group.label}
                  </h4>
                  {isSubExpanded ? <ChevronUp size={15} className="text-zinc-400" /> : <ChevronDown size={15} className="text-zinc-400" />}
                </div>

                {isSubExpanded && (
                  <div className="space-y-3 pt-1.5 pl-3 border-l border-rose-200">
                    {group.items.map(faq => {
                      const isOpen = activeFaqId === faq.id;
                      return (
                        <div 
                          key={faq.id} 
                          onClick={() => setActiveFaqId(isOpen ? null : faq.id)} 
                          className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-all"
                        >
                          <div className="flex items-start gap-2.5 justify-between">
                            <h3 className="text-zinc-800 font-bold text-xs leading-normal flex-1">{faq.hindiQ}</h3>
                            <div className="text-zinc-400 pt-0.5">
                              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-zinc-100 space-y-3 overflow-hidden"
                              >
                                <p className="text-zinc-700 text-xs leading-relaxed font-medium">{faq.hindiA}</p>
                                {faq.a && faq.a !== faq.hindiA && (
                                  <p className="text-zinc-500 text-[11px] leading-relaxed italic border-l border-zinc-200 pl-2 mt-1.5">{faq.a}</p>
                                )}
                                
                                <div className="flex items-center justify-between pt-1">
                                  {faq.isAiGenerated && (
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/10">
                                      🤖 AI generated
                                    </span>
                                  )}
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent accordion state toggle
                                      handleAddToJournal(faq);
                                    }}
                                    disabled={journalAddingId === faq.id}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                                      journalSuccessId === faq.id
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-rose-500'
                                    } ml-auto`}
                                  >
                                    {journalAddingId === faq.id ? (
                                      <>
                                        <Loader2 size={12} className="animate-spin text-amber-500" />
                                        <span>सहेज रहा है...</span>
                                      </>
                                    ) : journalSuccessId === faq.id ? (
                                      <>
                                        <Check size={12} className="text-emerald-500" />
                                        <span>जर्नल में सहेजा गया!</span>
                                      </>
                                    ) : (
                                      <>
                                        <BookOpen size={12} className="text-rose-500" />
                                        <span>जर्नल में जोड़ें (+ Journal)</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 space-y-2" id="faq-empty-state">
          <HelpCircle size={32} className="mx-auto text-zinc-300" />
          <p className="text-xs font-bold">कोई प्रश्न नहीं मिला।</p>
          <p className="text-[11.5px] text-zinc-400">अपनी जिज्ञासा को ऊपर खोजें या "Ask AI" बटन दबाकर गुरूकृपा एआई से सीधा समाधान प्राप्त करें।</p>
        </div>
      )}
      
      {/* 4. FOOTER */}
      <div className="text-center text-[10px] text-zinc-400 mt-6 border-t border-zinc-200/60 pt-4 uppercase tracking-wider">
        मर्यादा संकेत: सत्यापित सत्य।
      </div>
    </div>
  );
};
