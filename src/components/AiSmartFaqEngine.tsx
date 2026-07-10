import React, { useState, useMemo } from 'react';
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
  Layers
} from 'lucide-react';

interface FaqItem {
  id: string;
  topicId: 'LEADERSHIP' | 'ASCETICISM' | 'SAMSKAR_STAYS';
  subTopicId: 'ACHARYA' | 'ADMIN' | 'CONDUCT' | 'GYANSHALA' | 'CHATURMAS';
  topicLabel: string;
  subTopicLabel: string;
  q: string;
  a: string;
  hindiQ: string;
  hindiA: string;
  icon: React.ReactNode;
}

interface AiSmartFaqEngineProps {
  onBack?: () => void;
}

export const AiSmartFaqEngine: React.FC<AiSmartFaqEngineProps> = ({ onBack }) => {
  const [searchKey, setSearchKey] = useState('');
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [expandedSubTopic, setExpandedSubTopic] = useState<string | null>(null);

  const mainTopics = [
    { id: 'ALL', label: '🗂️ सभी प्रश्न (All)', count: 5 },
    { id: 'LEADERSHIP', label: '👑 संघीय नेतृत्व (Leadership)', count: 2 },
    { id: 'ASCETICISM', label: '🛡️ श्रमण आचार (Ascetic Conduct)', count: 1 },
    { id: 'SAMSKAR_STAYS', label: '📢 संस्कार व प्रवास (Stays & Samskar)', count: 2 },
  ];

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

  const sortedFaqs = useMemo(() => {
    return aiFaqCoreData.filter(item => {
      const query = searchKey.toLowerCase().trim();
      const matchesSearch = 
        item.q.toLowerCase().includes(query) || 
        item.a.toLowerCase().includes(query) || 
        item.hindiQ.includes(query) || 
        item.hindiA.includes(query);
      const matchesTopic = selectedTopic === 'ALL' || item.topicId === selectedTopic;
      return matchesSearch && matchesTopic;
    });
  }, [searchKey, selectedTopic, aiFaqCoreData]);

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

  return (
    <div className="w-full flex flex-col gap-4 pb-6 bg-[#FCF8F2]" id="ai-smart-faq-engine-outer">
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      
      {/* 1. TOP SECTION: Header & Search */}
      <div className="flex flex-col gap-4 pb-4 border-b border-white/5 relative z-10" id="faq-header-container">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 mr-1 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white border border-white/10">
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-rose-500/10 border border-rose-500/25 rounded-full text-[10px] font-black tracking-widest text-[#ff5e7e] uppercase">Knowledge Hub</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">🧠 एआई-पावर्ड जिज्ञासा समाधान केंद्र</h2>
          </div>
        </div>

        <div className="relative group" id="faq-search-wrapper">
          <div className="absolute inset-y-0 left-4 flex items-center text-zinc-400 group-focus-within:text-rose-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="जिज्ञासा या कीवर्ड टाइप करें (जैसे: दीक्षा, सामायिक)..." 
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-zinc-900 border-2 border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Categories & Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-4 no-scrollbar relative z-10" id="faq-tag-pills">
        {mainTopics.map(topic => (
          <button
            key={topic.id}
            onClick={() => { setSelectedTopic(topic.id); setExpandedSubTopic(null); }}
            className={`px-4 py-2.5 rounded-2xl text-[10.5px] font-black uppercase tracking-wider border flex items-center gap-2 whitespace-nowrap ${
              selectedTopic === topic.id ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            {topic.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-5 mt-2 text-xs relative z-10" id="faq-predictive-bar">
        {quickSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => { setSearchKey(suggestion.phrase); setSelectedTopic('ALL'); }}
            className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 bg-white/5 rounded-xl border border-white/5 hover:text-[#ff5e7e]"
          >
            {suggestion.label}
          </button>
        ))}
      </div>

      {/* 3. BOTTOM SECTION: Accordion List */}
      <div className="flex flex-col gap-4 relative z-10" id="faq-nested-container">
        <AnimatePresence mode="popLayout">
          {groupedFaqs.map(([subTopicId, group]) => {
            const isSubExpanded = expandedSubTopic === subTopicId || searchKey.trim().length > 0;
            return (
              <motion.div key={subTopicId} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-3.5 space-y-3">
                <div onClick={() => setExpandedSubTopic(isSubExpanded ? null : subTopicId)} className="flex items-center justify-between cursor-pointer">
                  <h4 className="text-xs font-black text-zinc-300 uppercase">{group.label}</h4>
                  {isSubExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>

                {isSubExpanded && (
                  <motion.div className="space-y-2.5 pt-1.5 pl-4 border-l border-zinc-800">
                    {group.items.map(faq => {
                      const isOpen = activeFaqId === faq.id;
                      return (
                        <div key={faq.id} onClick={() => setActiveFaqId(isOpen ? null : faq.id)} className="border border-white/5 rounded-xl p-3 bg-zinc-900/30">
                          <h3 className="text-zinc-100 font-black text-xs">{faq.hindiQ}</h3>
                          {isOpen && (
                            <motion.div className="mt-3 pt-2 border-t border-white/5">
                              <p className="text-zinc-200 text-xs leading-relaxed">{faq.hindiA}</p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* 4. FOOTER */}
      <div className="text-center text-[10px] text-zinc-600 mt-6 border-t border-white/5 pt-4 uppercase tracking-wider">
        मर्यादा संकेत: सत्यापित सत्य।
      </div>
    </div>
  );
};
