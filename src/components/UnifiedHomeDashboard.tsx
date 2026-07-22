import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Bookmark, ArrowRight, MapPin, Flame, Clock, Calendar, Sun, Moon, Sunrise, BarChart3, RefreshCw, Plus, Mic, Send, Copy, Star, Phone, Trash2, Sparkles, Sliders, Quote, BookOpen, Loader2, X, Search } from 'lucide-react';
import DashboardCustomizerModal, { DashboardPreferences, DEFAULT_PREFERENCES } from './DashboardCustomizerModal';
import { useAuth } from '../context/AuthContext';
import CommunityPolls from './CommunityPolls';
import { ACHARYAS } from '../data/acharyas';
import MoonPhaseWidget from './MoonPhaseWidget';
import SunriseSunset from './SunriseSunset';
import { useLanguage } from '../context/LanguageContext';
import { DAILY_VACHANS, DailyVachanType } from './DailyVachan';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useLocation } from '../context/LocationContext';
import { searchCities } from '../data/cities';
import SunCalc from 'suncalc';

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

interface HomeVachanType {
  textHi: string;
  textEn: string;
  explanationHi: string;
  explanationEn: string;
  acharya: string;
  categoryHi: string;
  categoryEn: string;
  matchCategories: string[];
}

const HOME_VACHAN_BANK: HomeVachanType[] = [
  {
    textHi: "मनुष्य का जीवन केवल खाने और भोगने के लिए नहीं है, वह साधना और आत्म-शुद्धि का अनुपम अवसर है। संयम ही जीवन की वास्तविक निधि है।",
    textEn: "Human life is not merely for eating and indulgence; it is a matchless opportunity for spiritual practice and self-purification. Self-restraint is the true treasure of life.",
    explanationHi: "आचार्यश्री फरमाते हैं कि बाह्य सुखों की लालसा कभी समाप्त नहीं होती। संयमित जीवन ही आत्मा को शाश्वत आनंद प्रदान कर सकता है।",
    explanationEn: "Acharya Shri explains that the craving for external pleasures never ends. Only a disciplined life of self-restraint can grant eternal bliss to the soul.",
    acharya: "आचार्य श्री महाश्रमण जी",
    categoryHi: "संयम एवं साधना",
    categoryEn: "Self-restraint",
    matchCategories: ["Sanyam", "Sadhana", "संयम", "साधना", "Eco-Vows", "संयम जीवनशैली"]
  },
  {
    textHi: "अहिंसा केवल किसी को न मारना नहीं है, वरन सबके प्रति मैत्री और करुणा का भाव रखना है। जहाँ मैत्री है, वहाँ भय और बैर का कोई स्थान नहीं।",
    textEn: "Non-violence is not just about not killing; it is about cultivating friendship and compassion for all. Where there is friendship, there is no room for fear or animosity.",
    explanationHi: "मन, वचन और कर्म से किसी जीव को आहत न करना और सभी के प्रति समता का भाव रखना ही सच्ची अहिंसा है।",
    explanationEn: "True non-violence lies in not hurting any living being through mind, speech, or action, and maintaining a state of equanimity toward all.",
    acharya: "आचार्य श्री महाश्रमण जी",
    categoryHi: "अहिंसा एवं मैत्री",
    categoryEn: "Non-Violence",
    matchCategories: ["अहिंसा", "Non-Violence", "Ahimsayatra", "Seva", "सेवा"]
  },
  {
    textHi: "सत्य की राह कठिन अवश्य हो सकती है, किन्तु आत्मिक संतोष केवल सत्य के आचरण से ही सम्भव है। कपट और असत्य से आत्मा भारी होती है।",
    textEn: "The path of truth may indeed be difficult, but spiritual contentment is possible only through the practice of truth. Deceit and untruth make the soul heavy.",
    explanationHi: "असत्य का आचरण तत्कालिक लाभ दे सकता है परंतु दीर्घकाल में वह बंधन कारक होता है। सत्यवादी निर्भय रहता है।",
    explanationEn: "Practicing untruth may yield temporary gains, but in the long run, it binds the soul. The one who speaks truth remains fearless.",
    acharya: "आचार्य श्री महाश्रमण जी",
    categoryHi: "सत्य निष्ठा",
    categoryEn: "Truthfulness",
    matchCategories: ["सत्य", "Truth", "Honesty", "Speech Ethics", "सत्यम वाणी", "अस्तेय व प्रामाणिकता"]
  },
  {
    textHi: "अपरिग्रह हमें सिखाता है कि हम तृष्णा को सीमित करें। इच्छाओं का अंतहीन विस्तार ही अशान्ति का मूल कारण है।",
    textEn: "Non-possessiveness teaches us to limit our desires. The endless expansion of desires is the root cause of all restlessness and conflict.",
    explanationHi: "भौतिक वस्तुओं का संचय केवल बाहरी बोझ बढ़ाता है, जबकि इच्छाओं को सीमित करने से मन हल्का और प्रसन्न रहता है।",
    explanationEn: "Accumulating material goods only increases external burden, whereas limiting desires keeps the mind light, content, and peaceful.",
    acharya: "आचार्य श्री महाश्रमण जी",
    categoryHi: "अपरिग्रह",
    categoryEn: "Non-Possessiveness",
    matchCategories: ["Aparigraha", "अपरिग्रह", "Environment", "पर्यावरण संरक्षण"]
  },
  {
    textHi: "सामायिक का ४८ मिनट का समय आत्मा के निकट जाने का स्वर्णिम अवसर है। इस काल में संसार की सभी चिंताओं को त्याग कर केवल स्वाध्याय और ध्यान करें।",
    textEn: "The 48-minute duration of Samayik is a golden opportunity to draw closer to the soul. In this period, cast aside all worldly worries and engage solely in study and meditation.",
    explanationHi: "सामायिक में श्रावक गृहस्थ जीवन के पापों का त्याग कर कुछ समय के लिए साधु तुल्य बन जाता है। यह समता की उत्तम साधना है।",
    explanationEn: "In Samayik, a layperson renounces householder attachments to live like an ascetic for a brief period. This is the supreme practice of equanimity.",
    acharya: "आचार्य श्री महाश्रमण जी",
    categoryHi: "सामायिक साधना",
    categoryEn: "Samayik Meditation",
    matchCategories: ["Dhyan", "Dhyana", "ध्यान", "Samayik", "सामायिक", "meditationLogs"]
  },
  {
    textHi: "अणुव्रत जीवन जीने की एक सरल आचार संहिता है। छोटे-छोटे संकल्पों से ही व्यक्ति महान बनता है और समाज में नैतिक क्रांति का सूत्रपात होता है।",
    textEn: "Anuvrat is a simple code of conduct for living. Through small vows, an individual achieves greatness and triggers a moral revolution in society.",
    explanationHi: "आचार्य तुलसी द्वारा प्रवर्तित अणुव्रत आंदोलन मानव को बेहतर बनाने का एक व्यावहारिक मार्ग है, जो सांप्रदायिकता से ऊपर उठकर मानवता की सेवा करता है।",
    explanationEn: "The Anuvrat Movement initiated by Acharya Tulsi is a practical way of self-transformation, serving humanity beyond sectarian divides.",
    acharya: "आचार्य श्री महाश्रमण जी",
    categoryHi: "अणुव्रत संकल्प",
    categoryEn: "Anuvrat Vows",
    matchCategories: ["Anuvrat", "अणुव्रत", "Vows", "संकल्प", "Sravaka Vrats"]
  }
];

// --- Official Verified Monastic Directory Data (06 July 2026 Release) ---
const PROVINCE_DATA = {
  DELHI: [
    { name: "बहुश्रुत मुनिश्री उदित कुमार जी", tag: "ठाना-3", loc: "तेरापंथ भवन, ए-875, शास्त्री नगर, दिल्ली।", contact: "9983478999" },
    { name: "शासनश्री साध्वीश्री संघमित्राजी", tag: "ठाना-5", loc: "एक्शन बालाजी हॉस्पिटल, पश्चिम विहार, दिल्ली।", contact: "9950120242" },
    { name: "शासनश्री साध्वीश्री सुव्रताजी", tag: "ठाना-4", loc: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली।", contact: "8375941210" },
    { name: "शासनश्री साध्वीश्री सुमनश्री जी", tag: "ठाना-4", loc: "तेरापंथ भवन, सेक्टर-05, रोहिणी, दिल्ली।", contact: "9915501240" },
    { name: "शासनश्री साध्वीश्री रविप्रभाजी", tag: "ठाना-5", loc: "ओसवाल भवन, बी-69, विवेक विहार-2, दिल्ली।", contact: "8104273773" }
  ],
  RAJASTHAN: [
    { name: "मुनिश्री मुनिव्रत जी", tag: "ठाना-3", loc: "महाप्रज्ञ भवन, सिरियारी, राजस्थान।", contact: "ℹ️ ऑन-साइट" },
    { name: "मुनिश्री तत्व रुचि जी 'तरुण'", tag: "ठाना-2", loc: "भिक्षु साधना केंद्र, श्याम नगर, जयपुर।", contact: "9660692852" },
    { name: "मुनिश्री सुधाकर जी", tag: "ठाना-2", loc: "नरेंद्र जी धीरज जी अरविंद बैद निवास, 179, मल्होत्रा नगर, विद्याधर नगर स्टेडियम के पास, जयपुर।", contact: "8870651529" },
    { name: "मुनिश्री अमृत कुमार जी", tag: "ठाना-4", loc: "बोथरा भवन, गंगाशहर, राजस्थान।", contact: "ℹ️ ऑन-साइट" },
    { name: "शासनश्री साध्वीश्री जसवती जी", tag: "ठाना-3", loc: "तेरापंथ भवन, आसींद, राजस्थान।", contact: "9251316471" },
    { name: "शासनश्री साध्वीश्री धनश्री जी", tag: "ठाना-4", loc: "तेरापंथ भवन, गुलाब बाड़ी, कोटा।", contact: "9649509233" },
    { name: "शासनश्री मंजु प्रभा जी", tag: "ठाना-3", loc: "दुग्गड़ भवन, बीकानेर, राजस्थान।", contact: "ℹ️ ऑन-साइट" }
  ],
  GUJARAT: [
    { name: "डॉ मुनिश्री मदन कुमारजी स्वामी", tag: "ठाना-3", loc: "क्रिश हाइट्स, संजीव कुमार ऑडिटोरियम के पास, RTO रोड, पाल अडाजण, सूरत।", contact: "6377377427", spec: "Jignesh Chinubhai Shah Residence" },
    { name: "मुनिश्री मुनिसुव्रत कुमार जी स्वामी", tag: "ठाना-3", loc: "अर्हम कुंज, तेरापंथ भवन के पास, शाहीबाग, अहमदाबाद।", contact: "7021591184" },
    { name: "मुनिश्री संजयकुमार जी", tag: "ठाना-4", loc: "राहुल हाउस, प्रशांत सोसायटी, नवरंग पुरा, अहमदाबाद।", contact: "7597245913" },
    { name: "शासनश्री साध्वीश्री रामकुमारीजी", tag: "ठाना-4", loc: "तेरापंथ भवन, कांकरिया, मणिनगर, अहमदाबाद।", contact: "9408472957" },
    { name: "साध्वीश्री मधुबाला जी (शासनश्री)", tag: "ठाना-5", loc: "तेरापंथ भवन, सिटीलाइट, सूरत, गुजरात।", contact: "8128559659" },
    { name: "डॉ साध्वीश्री परमयशा जी", tag: "ठाना-5", loc: "आशीर्वाद पैलेस, भट्टार रोड, सूरत, गुजरात।", contact: "ℹ️ ऑन-साइट" }
  ],
  MAHARASHTRA: [
    { name: "मुनिश्री कुलदीप कुमारजी स्वामी", tag: "ठाना-2", loc: "तेरापंथ भवन, हेमलीला अपार्टमेंट, मुलुंड (पूर्व), मुंबई।", contact: "9919601313" },
    { name: "शासनश्री साध्वीश्री विद्यावती जी 'द्वितीय'", tag: "ठाना-5", loc: "तेरापंथ भवन, ठाकुर काॅम्प्लेक्स, कांदिवली (पूर्व), मुंबई।", contact: "8850280148" },
    { name: "शासनश्री साध्वीश्री कंचन प्रभाजी", tag: "ठाना-5", loc: "तेरापंथ भवन, सन टॉवर, भोईवाड़ा परेल, मुंबई।", contact: "7061598749" },
    { name: "साध्वीश्री राकेश कुमारीजी", tag: "ठाना-4", loc: "गोयल निवास, 201 आयरन बिल्डिंग, हनुमान रोड, विलेपार्ले (पूर्व), मुंबई।", contact: "7972375908" },
    { name: "साध्वीश्री निर्वाणश्री जी", tag: "ठाना-6", loc: "तेरापंथ सभा भवन, मनु मार्केट, घाटकोपर (पश्चिम), मुंबई।", contact: "7891817906" }
  ],
  HARYANA: [
    { name: "साध्वीश्री राजकुमारी जी", tag: "ठाना-3", loc: "तुलसी सेवा केंद्र, मॉडल टाउन, हिसार, हरियाणा।", contact: "ℹ️ ऑन-साइट" },
    { name: "शासनश्री साध्वीश्री यशोधरा जी", tag: "ठाना-6", loc: "तेरापंथ भवन, मॉडल टाउन, हिसार, हरियाणा।", contact: "ℹ️ ऑन-साइट" },
    { name: "शासनश्री साध्वीश्री प्रशमरतीजी", tag: "ठाना-4", loc: "तुलसी सेवा केंद्र, MODEL TOWN, हिसार।", contact: "ℹ️ ऑन-साइट" },
    { name: "शासनश्री साध्वीश्री भाग्यवतीजी", tag: "ठाना-4", loc: "तेरापंथ भवन, हांसी, हरियाणा।", contact: "ℹ️ ऑन-साइट" },
    { name: "साध्वीश्री संयमप्रभा जी", tag: "ठाना-4", loc: "तेरापंथ भवन, सिरसा, हरियाणा।", contact: "ℹ️ ऑन-साइट" }
  ],
  KARNATAKA: [
    { name: "मुनिश्री अनंत कुमार जी", tag: "ठाना-2", loc: "वासु पूज्य नूतन भवन, केशवापुर, हुबली, कर्नाटक।", contact: "8755109325" },
    { name: "मुनिश्री विनीत कुमार जी", tag: "ठाना-2", loc: "प्रवीण कुमार जी दीक्षित जी सोलंकी निवास, त्यागराजनगर, बैंगलोर-70।", contact: "ℹ️ रायसोनी निवास से विहार" },
    { name: "मुनिश्री आकाश कुमार जी", tag: "ठाना-2", loc: "नंबर 264, 8वां क्रॉस, शास्त्रीनगर, त्यागराजनगर, बेंगलुरु - 70।", contact: "8553336928" },
    { name: "साध्वीश्री पावनप्रभा जी", tag: "ठाना-4", loc: "श्री निर्मलजी राजेशजी मूथा निवास, हीराचंद लेआउट, कॉक्स टाउन, बेंगलुरु।", contact: "9844662296" }
  ],
  TAMILNADU: [
    { name: "डॉ मुनिश्री पुलकित कुमार जी", tag: "ठाना-2", loc: "श्री जैन श्वेताम्बर तेरापंथ ट्रस्ट भवन, माधावरम, चेन्नई।", contact: "9104006286" },
    { name: "साध्वीश्री उदितयशा जी", tag: "ठाना-4", loc: "श्री रतनलाल जी डोसी निवास, किलपॉक, चेन्नई, तमिलनाडु।", contact: "9898502684" },
    { name: "साध्वीश्री सोमयशा जी", tag: "ठाना-3", loc: "PRM कल्याण मण्डपम, इदायपट्टी, सेलम मैन रोड़, वैगुण्डम, संकगिरि।", contact: "9602007283" }
  ],
  TELANGANA: [
    { name: "मुनिश्री दीप कुमार जी", tag: "ठाना-2", loc: "पंकज जी हेमा जी मालू निवास, फ्लैट 725, BLOCK 3 मानसरोवर हाइट्स, हैदराबाद।", contact: "8505098254" }
  ],
  EAST_INDIA: [
    { name: "मुनिश्री हिमांशु कुमार जी", tag: "ठाना-2", loc: "टिटिलागड, उड़ीसा प्रांत।", contact: "9928663589" },
    { name: "मुनिश्री मोहजीत कुमार जी", tag: "ठाना-3", loc: "ग्रैंड बाजार ग्रैंड आवास, श्री मोहनलाल जी सिंघी निवास, भुवनेश्वर, उड़ीसा।", contact: "9664413522" },
    { name: "डॉ मुनिश्री ज्ञानेन्द्र कुमार जी", tag: "ठाना-2", loc: "मारवाड़ी भवन, बेलडांगा, पश्चिम बंगाल प्रांत।", contact: "9445696470" },
    { name: "मुनिश्री रमेश कुमार जी", tag: "ठाना-1", loc: "मारवाड़ी भवन, बेलडांगा, पश्चिम बंगाल।", contact: "9445696470" },
    { name: "मुनिश्री आनंदकुमार जी 'कालू'", tag: "ठाना-2", loc: "नवीन जी नौलखा निवास, गुवाहाटी क्लब, असम प्रांत।", contact: "9601420513" },
    { name: "मुनिश्री प्रशांतकुमार जी", tag: "ठाना-2", loc: "तेरापंथ भवन, गुलाबबाग, बिहार प्रांत।", contact: "6000696420" }
  ]
};

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
  const { language } = useLanguage();

  // --- Real-time Local Digital Clock Engine ---
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // --- Swadhyay-Based Recommendation Engine for Daily Vachan ---
  const [recommendedVachan, setRecommendedVachan] = useState<HomeVachanType>(HOME_VACHAN_BANK[0]);
  const [recommendationReason, setRecommendationReason] = useState<{hi: string, en: string} | null>(null);
  const [recommendedList, setRecommendedList] = useState<HomeVachanType[]>([]);
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  const processRecommendations = (history: any[]) => {
    if (!history || history.length === 0) {
      // Fallback: seed-based daily vachan
      const d = new Date();
      const index = ((d.getFullYear() * 365) + ((d.getMonth() + 1) * 31) + d.getDate()) % HOME_VACHAN_BANK.length;
      setRecommendedVachan(HOME_VACHAN_BANK[index]);
      setRecommendationReason(null);
      setRecommendedList([]);
      setRecommendationIndex(0);
      return;
    }

    // Map categories read
    const categoriesRead = history.map(h => h.category).filter(Boolean);
    
    // Look for all matched vachans
    const matchedVachans: HomeVachanType[] = [];
    let matchedCat = "";

    for (const vachan of HOME_VACHAN_BANK) {
      const match = vachan.matchCategories.find(mc => 
        categoriesRead.some(cr => String(cr).toLowerCase().includes(mc.toLowerCase()) || mc.toLowerCase().includes(String(cr).toLowerCase()))
      );
      if (match) {
        matchedVachans.push(vachan);
        if (!matchedCat) {
          matchedCat = match;
        }
      }
    }

    if (matchedVachans.length > 0) {
      setRecommendedList(matchedVachans);
      setRecommendationIndex(0);
      setRecommendedVachan(matchedVachans[0]);
      setRecommendationReason({
        hi: `✨ अनुशंसित: आपके स्वाध्याय "${matchedCat}" के आधार पर`,
        en: `✨ Recommended: Based on your Swadhyay in "${matchedCat}"`
      });
    } else {
      // Default seed-based
      const d = new Date();
      const index = ((d.getFullYear() * 365) + ((d.getMonth() + 1) * 31) + d.getDate()) % HOME_VACHAN_BANK.length;
      setRecommendedVachan(HOME_VACHAN_BANK[index]);
      setRecommendationReason(null);
      setRecommendedList([]);
      setRecommendationIndex(0);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      // Fetch from Firestore
      const path = `users/${user.uid}/readHistory`;
      const q = query(
        collection(db, path),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        processRecommendations(loaded);
      }, (err) => {
        console.warn("[Home Rec Engine] Failed to query readHistory, fallback to localStorage:", err);
        try {
          const localStr = localStorage.getItem('terapanth_read_books_history') || localStorage.getItem('sadhana_swadhya_read_history');
          const localHistory = localStr ? JSON.parse(localStr) : [];
          processRecommendations(localHistory);
        } catch {
          processRecommendations([]);
        }
      });
    } else {
      // Fallback to local storage for guest
      try {
        const localStr = localStorage.getItem('terapanth_read_books_history') || localStorage.getItem('sadhana_swadhya_read_history');
        const localHistory = localStr ? JSON.parse(localStr) : [];
        processRecommendations(localHistory);
      } catch {
        processRecommendations([]);
      }
    }

    // Dynamic listener for custom download event (updates in real-time)
    const handleHistoryUpdate = () => {
      try {
        const localStr = localStorage.getItem('terapanth_read_books_history') || localStorage.getItem('sadhana_swadhya_read_history');
        const localHistory = localStr ? JSON.parse(localStr) : [];
        processRecommendations(localHistory);
      } catch {
        processRecommendations([]);
      }
    };

    window.addEventListener('terapanth_history_update', handleHistoryUpdate);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('terapanth_history_update', handleHistoryUpdate);
    };
  }, [user]);

  const handleNextRecommendation = () => {
    if (recommendedList.length <= 1) return;
    const nextIdx = (recommendationIndex + 1) % recommendedList.length;
    setRecommendationIndex(nextIdx);
    setRecommendedVachan(recommendedList[nextIdx]);
  };

  const hasReadHistory = recommendationReason !== null;

  // --- Core Reactive States ---
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [calendarMode, setCalendarMode] = useState<'GREGORIAN' | 'VIKRAMI'>('GREGORIAN');
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeProvince, setActiveProvince] = useState('DELHI');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Location & Active City States ---
  const { activeCity, setActiveCity, isDefault, setDefaultCity, showLocationModal, setShowLocationModal } = useLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const isModalOpen = isLocationModalOpen || showLocationModal;
  const setModalOpen = (open: boolean) => {
    setIsLocationModalOpen(open);
    setShowLocationModal(open);
  };
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
  const [isCitySearching, setIsCitySearching] = useState(false);

  useEffect(() => {
    if (citySearchQuery.trim().length > 1) {
      setIsCitySearching(true);
      const timer = setTimeout(() => {
        const results = searchCities(citySearchQuery.trim(), 8);
        setCitySearchResults(results);
        setIsCitySearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCitySearchResults([]);
      setIsCitySearching(false);
    }
  }, [citySearchQuery]);

  // --- Real-time SunCalc Solar Calculations ---
  const sunTimes = useMemo(() => {
    try {
      return SunCalc.getTimes(currentTime, activeCity.lat, activeCity.lng);
    } catch (e) {
      // Fallback
      return SunCalc.getTimes(currentTime, 28.6139, 77.2090);
    }
  }, [currentTime, activeCity]);

  const panchangSunrise = useMemo(() => new Date(sunTimes.sunrise.getTime() + 3 * 60000), [sunTimes]);
  const panchangSunset = useMemo(() => new Date(sunTimes.sunset.getTime() - 3 * 60000), [sunTimes]);
  const navkarsi = useMemo(() => new Date(panchangSunrise.getTime() + 48 * 60000), [panchangSunrise]);
  const dayLength = useMemo(() => panchangSunset.getTime() - panchangSunrise.getTime(), [panchangSunset, panchangSunrise]);
  const paurushi = useMemo(() => new Date(panchangSunrise.getTime() + (dayLength / 4)), [panchangSunrise, dayLength]);

  const formatShortTime = useCallback((d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }, []);

  const sunriseString = useMemo(() => formatShortTime(panchangSunrise), [panchangSunrise, formatShortTime]);
  const navkarsiString = useMemo(() => formatShortTime(navkarsi), [navkarsi, formatShortTime]);
  const paurushiString = useMemo(() => formatShortTime(paurushi), [paurushi, formatShortTime]);
  const sunsetString = useMemo(() => formatShortTime(panchangSunset), [panchangSunset, formatShortTime]);

  // Hindu Tithi calculation
  const getTithiString = useCallback((date: Date) => {
    try {
      const phase = SunCalc.getMoonIllumination(date).phase;
      const totalPhase = phase * 30; 
      let tithiNumber = Math.ceil(totalPhase);
      if (tithiNumber === 0) tithiNumber = 30; 
      
      const paksha = phase <= 0.5 ? 'शुक्ल' : 'कृष्ण';
      const tithiNameNumber = tithiNumber > 15 ? tithiNumber - 15 : tithiNumber;
      
      const tithiNames = [
        'प्रतिपदा (1)', 'द्वितीया (2)', 'तृतीया (3)', 'चतुर्थी (4)', 'पंचमी (5)',
        'षष्ठी (6)', 'सप्तमी (7)', 'अष्टमी (8)', 'नवमी (9)', 'दशमी (10)',
        'एकादशी (11)', 'द्वादशी (12)', 'त्रयोदशी (13)', 'चतुर्दशी (14)', 'पूर्णिमा (15)'
      ];
      
      const isAmavasya = tithiNumber === 30;
      const resolvedTithiName = isAmavasya 
        ? 'अमावस्या (15)' 
        : (tithiNames[tithiNameNumber - 1] || `Tithi ${tithiNameNumber}`);
        
      return `${paksha} पक्ष - ${resolvedTithiName}`;
    } catch {
      return 'कृष्ण पक्ष - पंचमी (5)';
    }
  }, []);

  const getHinduMonth = useCallback((date: Date) => {
    const m = date.getMonth();
    const hinduMonths = [
      'पौष', 'माघ', 'फाल्गुन', 'चैत्र', 'वैशाख', 'ज्येष्ठ',
      'आषाढ़', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष'
    ];
    return hinduMonths[m] || 'आषाढ़';
  }, []);

  const tithiString = useMemo(() => `${getHinduMonth(currentTime)} ${getTithiString(currentTime)}`, [currentTime, getHinduMonth, getTithiString]);
  
  const formattedDateString = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return currentTime.toLocaleDateString('en-US', options);
  }, [currentTime]);

  const activePrahar = useMemo(() => {
    const now = currentTime.getTime();
    const sunrise = panchangSunrise.getTime();
    const sunset = panchangSunset.getTime();
    
    const dayLengthVal = sunset - sunrise;
    const dayPraharLength = dayLengthVal / 4;
    
    const nextSunrise = sunrise + 24 * 60 * 60 * 1000;
    const nightLength = nextSunrise - sunset;
    const nightPraharLength = nightLength / 4;

    if (now >= sunrise && now < sunset) {
      const elapsed = now - sunrise;
      const praharNum = Math.floor(elapsed / dayPraharLength) + 1;
      const suffixes = ['st', 'nd', 'rd', 'th'];
      const suffix = suffixes[praharNum - 1] || 'th';
      return {
        label: `${praharNum}${suffix} Prahar (Day)`,
        num: praharNum,
        type: 'Day'
      };
    } else {
      let elapsed;
      if (now >= sunset) {
        elapsed = now - sunset;
      } else {
        const prevSunset = sunset - 24 * 60 * 60 * 1000;
        elapsed = now - prevSunset;
      }
      const praharNum = Math.floor(elapsed / nightPraharLength) + 1;
      const suffixes = ['st', 'nd', 'rd', 'th'];
      const suffix = suffixes[praharNum - 1] || 'th';
      return {
        label: `${praharNum}${suffix} Prahar (Night)`,
        num: praharNum,
        type: 'Night'
      };
    }
  }, [currentTime, panchangSunrise, panchangSunset]);

  const paryushanaCountdown = useMemo(() => {
    const targetStart = new Date('2026-09-07T00:00:00');
    const targetEnd = new Date('2026-09-15T23:59:59');
    const now = currentTime.getTime();
    
    if (now >= targetStart.getTime() && now <= targetEnd.getTime()) {
      return {
        isLive: true,
        isPast: false,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }
    
    if (now > targetEnd.getTime()) {
      return {
        isLive: false,
        isPast: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }
    
    const diff = targetStart.getTime() - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return {
      isLive: false,
      isPast: false,
      days,
      hours,
      minutes,
      seconds
    };
  }, [currentTime]);

  const getProvinceKeyForCity = useCallback((city: any) => {
    const reg = (city.region || '').toLowerCase();
    const name = (city.name || '').toLowerCase();
    
    if (reg.includes('delhi') || name.includes('delhi') || name.includes('new delhi')) return 'DELHI';
    if (reg.includes('rajasthan') || name.includes('jaipur') || name.includes('bikaner') || name.includes('jodhpur') || name.includes('udaipur')) return 'RAJASTHAN';
    if (reg.includes('gujarat') || name.includes('surat') || name.includes('ahmedabad') || name.includes('baroda') || name.includes('rajkot')) return 'GUJARAT';
    if (reg.includes('maharashtra') || name.includes('mumbai') || name.includes('pune') || name.includes('nagpur') || name.includes('thane')) return 'MAHARASHTRA';
    if (reg.includes('haryana') || name.includes('hisar') || name.includes('gurugram') || name.includes('faridabad')) return 'HARYANA';
    if (reg.includes('karnataka') || name.includes('bengaluru') || name.includes('bangalore') || name.includes('hubli')) return 'KARNATAKA';
    if (reg.includes('tamil nadu') || reg.includes('tamilnadu') || name.includes('chennai') || name.includes('madurai') || name.includes('coimbatore')) return 'TAMILNADU';
    if (reg.includes('telangana') || name.includes('hyderabad')) return 'TELANGANA';
    if (reg.includes('west bengal') || reg.includes('odisha') || reg.includes('assam') || reg.includes('bihar') || name.includes('kolkata') || name.includes('guwahati') || name.includes('patna')) return 'EAST_INDIA';
    return null;
  }, []);

  const activeProvinceKeyForUpdates = useMemo(() => getProvinceKeyForCity(activeCity), [activeCity, getProvinceKeyForCity]);
  const localViharUpdates = useMemo(() => {
    return activeProvinceKeyForUpdates ? PROVINCE_DATA[activeProvinceKeyForUpdates as keyof typeof PROVINCE_DATA] : [];
  }, [activeProvinceKeyForUpdates]);

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    try {
      const stored = localStorage.getItem('terapanth_dashboard_preferences');
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    const handleOpenCustomizer = () => {
      setIsCustomizerOpen(true);
    };
    window.addEventListener('open-dashboard-customizer', handleOpenCustomizer);
    return () => {
      window.removeEventListener('open-dashboard-customizer', handleOpenCustomizer);
    };
  }, []);

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
        try {
          setSavedSaints(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved saints", e);
        }
      } else {
        setSavedSaints([]);
      }
    };
    loadSaved();
    window.addEventListener('storage', loadSaved);
    window.addEventListener('saints-updated', loadSaved);
    return () => {
      window.removeEventListener('storage', loadSaved);
      window.removeEventListener('saints-updated', loadSaved);
    };
  }, []);

  const toggleSaveItinerary = (monk: any) => {
    const compositeId = `itinerary-${monk.name}`;
    const isSaved = savedSaints.some((s) => s.id === compositeId);
    let updated;
    if (isSaved) {
      updated = savedSaints.filter((s) => s.id !== compositeId);
    } else {
      updated = [...savedSaints, {
        id: compositeId,
        name: monk.name,
        rank: monk.tag || 'Muni',
        loc: monk.loc || 'In Transit',
        contact: monk.contact || '',
        type: 'itinerary'
      }];
    }
    setSavedSaints(updated);
    localStorage.setItem('saved_saints', JSON.stringify(updated));
    window.dispatchEvent(new Event('saints-updated'));
  };

  const removeSavedSaint = (id: string) => {
    const updated = savedSaints.filter((s) => s.id !== id);
    setSavedSaints(updated);
    localStorage.setItem('saved_saints', JSON.stringify(updated));
    window.dispatchEvent(new Event('saints-updated'));
  };

  // Dynamic Streak State with LocalStorage and Custom Event Synchronization
  const [streakCount, setStreakCount] = useState<number>(() => {
    return Number(localStorage.getItem('terapanth_sadhana_streak_count') || 5);
  });

  useEffect(() => {
    const handleSadhanaUpdate = () => {
      const currentStreak = Number(localStorage.getItem('terapanth_sadhana_streak_count') || 5);
      setStreakCount(currentStreak);
    };

    window.addEventListener('sadhana-updated', handleSadhanaUpdate);
    window.addEventListener('sadhana-streak-completed', handleSadhanaUpdate);
    return () => {
      window.removeEventListener('sadhana-updated', handleSadhanaUpdate);
      window.removeEventListener('sadhana-streak-completed', handleSadhanaUpdate);
    };
  }, []);

  const getDynamicGreeting = () => {
    const hour = currentTime.getHours();
    if (language === 'hi') {
      if (hour < 12) return "सुप्रभात";
      if (hour < 17) return "शुभ अपराह्न";
      return "शुभ संध्या";
    } else {
      if (hour < 12) return "Good Morning";
      if (hour < 17) return "Good Afternoon";
      return "Good Evening";
    }
  };

  // Swipe Navigation Tip Toast State
  const [showSwipeTip, setShowSwipeTip] = useState(false);

  useEffect(() => {
    const hasShownTip = localStorage.getItem('terapanth_swipe_tip_shown');
    if (hasShownTip !== 'true') {
      const timer = setTimeout(() => {
        setShowSwipeTip(true);
      }, 1500); // Show after a 1.5s delay on first visit
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissSwipeTip = () => {
    setShowSwipeTip(false);
    localStorage.setItem('terapanth_swipe_tip_shown', 'true');
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
      
      {/* GREETING BAR */}
      <div className={`py-2 px-4 text-center border rounded-2xl shadow-xs shrink-0 flex items-center justify-center gap-1.5 ${
        isDarkMode 
          ? 'bg-orange-950/20 border-orange-900/30 text-orange-400 font-semibold' 
          : 'bg-orange-50/50 border-orange-100 text-orange-700 font-semibold'
      }`}>
        <span className="text-xs">
          {getDynamicGreeting()} • जय जिनेन्द्र! 🔥 {streakCount} {language === 'hi' ? 'दिनों का सिलसिला' : 'Days Streak'}
        </span>
      </div>

      {/* LOCATION SELECTION BAR */}
      <div className="flex items-center justify-between w-full shrink-0 gap-3 mt-5 mb-3 px-1">
        <button 
          onClick={() => setModalOpen(true)}
          className={`group flex items-center gap-2.5 px-6 py-3 transition-all duration-300 rounded-full text-xs font-black shadow-lg border cursor-pointer hover:scale-[1.03] active:scale-95 translate-y-3.5 ${
            isDarkMode 
              ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500/50 shadow-orange-950/40' 
              : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400/40 shadow-orange-500/25'
          }`}
        >
          <MapPin size={16} className="group-hover:animate-bounce text-white stroke-[2.5]" />
          <span>{activeCity.name}, {activeCity.country}</span>
        </button>

        {!isDefault && (
          <button 
            onClick={() => setDefaultCity(activeCity)}
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold px-4 py-2.5 rounded-full transition-all duration-300 shadow-md border cursor-pointer hover:scale-[1.02] active:scale-95 translate-y-3.5 ${
              isDarkMode 
                ? 'bg-stone-800 hover:bg-stone-750 text-orange-400 border-stone-750 shadow-stone-950/30' 
                : 'bg-orange-50 hover:bg-orange-100/70 text-orange-700 border-orange-200/50 shadow-orange-100/30'
            }`}
          >
            <Star size={13} className="fill-current text-orange-500" />
            Set Default
          </button>
        )}
      </div>
      
      {/* 1. PATH OF NON-VIOLENCE MOUNTAIN BANNER */}
      <div className={`relative w-full h-36 rounded-2xl overflow-hidden shadow-xs border shrink-0 transition-all ${isDarkMode ? 'border-stone-800' : 'border-stone-200'}`}>
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" 
          alt="Path of Non-Violence" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent flex flex-col justify-end p-4">
          <h3 className="font-serif italic text-lg text-white tracking-wide">
            {language === 'hi' ? 'अहिंसा का मार्ग' : 'Path of Non-Violence'}
          </h3>
          <p className="text-[9px] uppercase tracking-widest text-stone-300 font-semibold mt-0.5">
            {language === 'hi' ? 'अहिंसा परमो धर्मः' : 'Ahimsa Paramo Dharma'}
          </p>
        </div>
      </div>

      {/* 2. PERSONALIZED GREETING LAYER */}
      <div className={`w-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 shrink-0 flex justify-between items-center ${
        isDarkMode 
          ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
          : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
      }`}>
        <div>
          <h2 className={`font-serif text-xl font-bold ${isDarkMode ? 'text-stone-50' : 'text-stone-950'}`}>
            {language === 'hi' ? 'जय जिनेन्द्र! 🙏' : 'Jai Jinendra! 🙏'}
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            {language === 'hi' ? 'आज का दिन मंगलमय हो' : 'Have a blessed day ahead'}
          </p>
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
              <span className="text-base font-mono font-bold block leading-none">{streakCount}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-90">
                {language === 'hi' ? 'दिन' : 'Days'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC CARD GRID (1 col mobile, 2 cols tablet, 3 cols desktop) with consistent card heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full items-stretch">

        {/* SOLAR LIFECYCLE CARD */}
        <div className={`w-full p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
          isDarkMode 
            ? 'bg-[#292724]/90 border-stone-800 text-stone-100 shadow-none' 
            : 'bg-[#faf7f2] border-stone-200/65 text-stone-800 shadow-xs'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
              isDarkMode 
                ? 'bg-orange-950/40 text-orange-400 border-orange-900/30' 
                : 'bg-orange-50 text-orange-700 border-orange-200/50'
            }`}>
              ⏱ {activePrahar.label}
            </div>
            <span className={`text-[9px] tracking-widest uppercase font-bold ${
              isDarkMode ? 'text-stone-400' : 'text-stone-500'
            }`}>Solar Lifecycle</span>
          </div>

          {/* Time and Date */}
          <div className={`rounded-xl p-4 flex flex-col items-center justify-center border ${
            isDarkMode 
              ? 'bg-stone-900/80 border-stone-800/80' 
              : 'bg-white border-stone-200/40 shadow-2xs'
          }`}>
            <div className="text-orange-500 dark:text-orange-400 text-3xl font-mono font-bold tracking-tight flex items-baseline gap-1">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <p className={`text-center text-[10px] mt-1.5 font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              {formattedDateString}
            </p>
            <p className="text-center text-xs text-orange-600 dark:text-orange-400 font-serif font-black mt-1">
              {tithiString}
            </p>
          </div>

          {/* Times Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className={`border rounded-xl p-2.5 transition-all ${
              isDarkMode ? 'bg-[#332f2a] border-[#4a4237]' : 'bg-[#fcfaf5] border-orange-100/50 shadow-2xs'
            }`}>
              <div className="text-[8px] text-orange-600 dark:text-orange-400 font-extrabold uppercase tracking-wider mb-1">Sunrise</div>
              <div className="text-stone-800 dark:text-orange-400 font-mono text-xs font-bold">{sunriseString}</div>
            </div>
            <div className={`border rounded-xl p-2.5 transition-all ${
              isDarkMode ? 'bg-[#332f2a] border-[#4a4237]' : 'bg-[#fcfaf5] border-orange-100/50 shadow-2xs'
            }`}>
              <div className="text-[8px] text-orange-600 dark:text-orange-400 font-extrabold uppercase tracking-wider mb-1">Navkarsi</div>
              <div className="text-stone-800 dark:text-orange-400 font-mono text-xs font-bold">{navkarsiString}</div>
            </div>
            <div className={`border rounded-xl p-2.5 transition-all ${
              isDarkMode ? 'bg-[#332f2a] border-[#4a4237]' : 'bg-[#fcfaf5] border-orange-100/50 shadow-2xs'
            }`}>
              <div className="text-[8px] text-orange-600 dark:text-orange-400 font-extrabold uppercase tracking-wider mb-1">Paurushi</div>
              <div className="text-stone-800 dark:text-orange-400 font-mono text-xs font-bold">{paurushiString}</div>
            </div>
            <div className={`border rounded-xl p-2.5 transition-all ${
              isDarkMode ? 'bg-[#29222c] border-[#3e3146]' : 'bg-[#faf5fc] border-purple-100/50 shadow-2xs'
            }`}>
              <div className="text-[8px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider mb-1">Sunset</div>
              <div className="text-stone-800 dark:text-purple-400 font-mono text-xs font-bold">{sunsetString}</div>
            </div>
          </div>
        </div>

        {/* LOCAL VIHAR UPDATES CARD */}
        <div className={`w-full p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-stone-900/90 to-stone-950/90 border-stone-800 text-stone-100 shadow-none' 
            : 'bg-gradient-to-b from-orange-50/20 to-amber-50/30 border-stone-200/65 text-stone-800 shadow-xs'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-xl shrink-0 ${isDarkMode ? 'bg-orange-950/40 text-orange-400' : 'bg-orange-100/60 text-orange-600'}`}>
                <MapPin className="w-4 h-4 shrink-0" />
              </div>
              <span className="font-bold text-xs">विहार • {activeCity.name}</span>
            </div>
            <span className={`text-[8px] px-2 py-1 rounded-full font-extrabold tracking-wider ${
              isDarkMode ? 'bg-orange-500/10 text-orange-400 animate-pulse' : 'bg-orange-50 text-orange-700'
            }`}>
              {localViharUpdates.length} ACTIVE
            </span>
          </div>

          {/* Vihar items / updates */}
          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1 custom-scrollbar">
            {localViharUpdates.length > 0 ? (
              localViharUpdates.map((vihar: any, idx: number) => (
                <div 
                  key={`${vihar.name}-${idx}`} 
                  className={`p-2.5 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'bg-stone-950/60 border-stone-850' 
                      : 'bg-white/80 border-stone-200/50 shadow-2xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <h5 className="font-bold text-[11px] leading-tight break-words">{vihar.name}</h5>
                    <span className={`text-[8px] font-bold px-1 py-0.2 rounded shrink-0 ${
                      isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {vihar.tag || `ठाना ${vihar.thana || 'N/A'}`}
                    </span>
                  </div>
                  <p className={`text-[10px] flex items-start gap-1 mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    <MapPin size={10} className="text-orange-500 shrink-0 mt-0.5" />
                    <span className="break-words">{vihar.loc || vihar.location}</span>
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                    <Phone size={10} className="shrink-0" />
                    {vihar.contact && vihar.contact !== 'N/A' && vihar.contact !== 'ℹ️ ऑन-साइट' ? (
                      <a href={`tel:${vihar.contact}`} className="hover:underline">{vihar.contact}</a>
                    ) : (
                      <span>{vihar.contact || 'N/A'}</span>
                    )}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 text-stone-400 dark:text-stone-500 gap-1.5">
                <p className="text-[11px] font-medium font-serif italic">No Active Vihar near you</p>
                <p className="text-[9px] opacity-75">विहार सूची देखने के लिए 'विहार' टैब देखें।</p>
              </div>
            )}
          </div>

          {/* Quick link button to Vihar tab */}
          <button 
            onClick={() => setActiveTab('vihar')}
            className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
              isDarkMode 
                ? 'bg-stone-900 border-stone-850 text-orange-400 hover:bg-orange-950/20' 
                : 'bg-white border-stone-200/50 text-orange-700 hover:bg-orange-50/50 shadow-2xs'
            }`}
          >
            <span>विहार ट्रैकर खोलें</span>
            <ArrowRight size={10} />
          </button>
        </div>

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

        {/* RECOMMENDED DAILY VACHAN */}
        <div className={`w-full h-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex flex-col justify-between gap-4 ${
          isDarkMode 
            ? 'bg-stone-900/80 border-stone-800/80 text-stone-100 shadow-none' 
            : 'bg-white/80 border-stone-200/50 text-stone-800 shadow-xs'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-xl shrink-0 ${isDarkMode ? 'bg-orange-950/40 text-orange-400' : 'bg-orange-100/60 text-orange-600'}`}>
                <Quote className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    hasReadHistory 
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' 
                      : 'bg-stone-100 dark:bg-stone-850 text-stone-500'
                  }`}>
                    {hasReadHistory ? '🎯 Recommended For You' : '✨ Daily Vachan'}
                  </span>
                  {hasReadHistory && (
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                      Based on library reads
                    </span>
                  )}
                </div>
                <h3 className={`font-serif text-base font-bold mt-1 tracking-wide ${isDarkMode ? 'text-stone-50' : 'text-stone-900'}`}>
                  {language === 'hi' ? 'अनुशंसित गुरुवचन' : 'Recommended Guru Vachan'}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className={`p-3 rounded-xl border relative overflow-hidden ${
              isDarkMode ? 'bg-stone-950/50 border-stone-850' : 'bg-amber-50/20 border-amber-100/60'
            }`}>
              <p className={`text-xs font-serif font-medium leading-relaxed italic ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                &ldquo;{language === 'hi' ? recommendedVachan.textHi : recommendedVachan.textEn}&rdquo;
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="font-bold text-orange-600 dark:text-amber-400">— {recommendedVachan.acharya}</span>
                <span className="font-semibold bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  {language === 'hi' ? recommendedVachan.categoryHi : recommendedVachan.categoryEn}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recommendedList.length > 1 && (
              <button
                onClick={handleNextRecommendation}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isDarkMode 
                    ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900' 
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
                title="Next recommendation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex-1 text-center text-xs font-bold uppercase tracking-wider transition-colors px-2.5 py-2.5 rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${
                isDarkMode 
                  ? 'bg-orange-500/10 border-orange-950/45 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20' 
                  : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'पुस्तकालय देखें' : 'Browse Library'}</span>
            </button>
          </div>
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
            {recommendationReason ? (
              <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">
                {language === 'hi' ? recommendationReason.hi : recommendationReason.en}
              </span>
            ) : (
              <span className={`${isDarkMode ? 'text-stone-400' : 'text-stone-500'} font-bold`}>
                {language === 'hi' ? 'गुरुदेव पावन वचन' : 'Guru Dev Holy Quote'}
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center py-2">
            <p className="text-sm font-serif font-bold leading-relaxed italic">
              “{language === 'hi' ? recommendedVachan.textHi : recommendedVachan.textEn}”
            </p>
            <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-extrabold mt-2 block">
              — {recommendedVachan.acharya} {recommendationReason && (language === 'hi' ? '(अनुशंसित)' : '(Recommended)')}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('vachan')}
            className="w-full mt-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer"
          >
            <span>{language === 'hi' ? 'दर्शन एवं वाचन' : 'View Daily Vachan'}</span>
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
              { id: 1, img: "https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png", title: "आचार्य श्री" },
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
              { id: "TERAPANTH", logo: "https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png", padding: "p-0" }
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

      {/* CITY SELECTION MODAL */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
          />
          
          {/* Modal Container */}
          <div className={`relative w-full max-w-md rounded-3xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-xl' : 'bg-white border-stone-200 text-stone-800 shadow-xl'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center ${
              isDarkMode ? 'border-stone-800 bg-stone-950/40' : 'border-stone-100 bg-stone-50/50'
            }`}>
              <div>
                <h3 className="font-bold text-sm">स्थान बदलें (Change Location)</h3>
                <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  सूर्योदय/सूर्यास्त एवं विहार अपडेट्स चयनित स्थान के अनुसार परिवर्तित होंगे।
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-500/10 cursor-pointer transition-colors text-stone-400 hover:text-stone-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content / Search Input */}
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-stone-500' : 'text-stone-400'
                }`} />
                <input 
                  type="text" 
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  placeholder="शहर का नाम खोजें (उदा. Delhi, Surat)..."
                  className={`w-full pl-9 pr-8 py-2.5 rounded-2xl text-xs border transition-all focus:outline-hidden ${
                    isDarkMode 
                      ? 'bg-stone-950 border-stone-800 focus:border-orange-500/50 text-stone-100' 
                      : 'bg-stone-50 border-stone-200 focus:border-orange-500 focus:bg-white text-stone-800'
                  }`}
                  autoFocus
                />
                {citySearchQuery && (
                  <button 
                    onClick={() => setCitySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-stone-500/10 text-stone-400"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Loader */}
              {isCitySearching && (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-orange-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span>खोज रहे हैं...</span>
                </div>
              )}

              {/* Results */}
              {!isCitySearching && (
                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                  {citySearchResults.length > 0 ? (
                    citySearchResults.map((city: any) => (
                      <button
                        key={`${city.name}-${city.region}`}
                        onClick={() => {
                          setActiveCity(city);
                          setModalOpen(false);
                          setCitySearchQuery('');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer border ${
                          activeCity.name === city.name 
                            ? isDarkMode 
                              ? 'bg-orange-950/20 border-orange-900/30 text-orange-400 font-semibold' 
                              : 'bg-orange-50 border-orange-100 text-orange-700 font-semibold'
                            : isDarkMode 
                              ? 'bg-transparent border-transparent hover:bg-stone-800/50 text-stone-300' 
                              : 'bg-transparent border-transparent hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-orange-500" />
                          <div>
                            <p className="font-bold">{city.name}</p>
                            <p className={`text-[9px] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              {city.region}, {city.country}
                            </p>
                          </div>
                        </div>
                        {activeCity.name === city.name && (
                          <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                        )}
                      </button>
                    ))
                  ) : citySearchQuery.trim().length > 1 ? (
                    <div className="py-8 text-center text-stone-400 dark:text-stone-500 text-xs">
                      कोई परिणाम नहीं मिला। कृपया अन्य वर्तनी का उपयोग करें।
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                        isDarkMode ? 'text-stone-500' : 'text-stone-400'
                      }`}>प्रमुख भारतीय शहर (Popular Cities)</p>
                      
                      {/* List of popular cities as quick shortcuts */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Delhi", lat: 28.6139, lng: 77.2090, region: "Delhi", country: "India" },
                          { name: "Mumbai", lat: 19.0760, lng: 72.8777, region: "Maharashtra", country: "India" },
                          { name: "Surat", lat: 21.1702, lng: 72.8311, region: "Gujarat", country: "India" },
                          { name: "Jaipur", lat: 26.9124, lng: 75.7873, region: "Rajasthan", country: "India" },
                          { name: "Ladnun", lat: 27.6500, lng: 74.3800, region: "Rajasthan", country: "India" },
                          { name: "Bengaluru", lat: 12.9716, lng: 77.5946, region: "Karnataka", country: "India" },
                          { name: "Kolkata", lat: 22.5726, lng: 88.3639, region: "West Bengal", country: "India" },
                          { name: "Pune", lat: 18.5204, lng: 73.8567, region: "Maharashtra", country: "India" }
                        ].map((city) => (
                          <button
                            key={city.name}
                            onClick={() => {
                              setActiveCity(city);
                              setModalOpen(false);
                            }}
                            className={`px-3 py-2 rounded-xl text-left transition-all border text-xs cursor-pointer ${
                              isDarkMode 
                                ? 'bg-stone-950 border-stone-850 hover:bg-stone-800 hover:border-stone-750 text-stone-300' 
                                : 'bg-stone-50 border-stone-200/50 hover:bg-stone-100 hover:border-stone-300 text-stone-700 shadow-2xs'
                            }`}
                          >
                            <span className="font-semibold">{city.name}</span>
                            <span className={`block text-[8px] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>{city.region}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SWIPE NAVIGATION TUTORIAL TIP TOAST */}
      <AnimatePresence>
        {showSwipeTip && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-[84px] left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 pointer-events-auto"
          >
            <div className={`p-4 rounded-2xl border shadow-xl relative overflow-hidden ${
              isDarkMode 
                ? 'bg-stone-900/95 border-stone-800 text-stone-100' 
                : 'bg-amber-50/95 border-amber-200/80 text-stone-900'
            }`}>
              {/* Subtle decorative glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0" role="img" aria-label="lightbulb">💡</span>
                <div className="flex-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-orange-500 dark:text-orange-400">
                    {language === 'hi' ? 'नेविगेशन सुझाव' : 'Navigation Tip'}
                  </h5>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {language === 'hi' ? (
                      <>आप <b>होम, चैट, साधना, पंचांग, और प्रोफ़ाइल</b> के बीच नेविगेट करने के लिए स्क्रीन पर <span className="font-semibold text-orange-600 dark:text-orange-400">बाएँ या दाएँ स्वाइप</span> कर सकते हैं!</>
                    ) : (
                      <>You can <span className="font-semibold text-orange-600 dark:text-orange-400">swipe left or right</span> anywhere on the screen to switch between <b>Home, Chat, Sadhana, Panchang, and Profile</b> tabs!</>
                    )}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleDismissSwipeTip}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        isDarkMode 
                          ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {language === 'hi' ? 'समझ गए' : 'Got It'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Absolute corner close button */}
              <button
                onClick={handleDismissSwipeTip}
                className="absolute top-2.5 right-2.5 p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10 transition-colors cursor-pointer text-stone-500 dark:text-stone-400"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

