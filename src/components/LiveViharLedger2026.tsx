import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LiveLocationVihar2026 from './LiveLocationVihar2026';
import UnifiedRegistry from './UnifiedRegistry';
import SaintsList from './SaintsList';
import ViharTracker from './ViharTracker';
import { 
  MapPin, 
  Search, 
  Phone, 
  X, 
  ShieldCheck, 
  User, 
  Share2, 
  Check, 
  Compass, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface ViharLedgerRecord {
  id: number;
  state: "RAJASTHAN" | "GUJARAT" | "MAHARASHTRA" | "DELHI" | "SOUTH" | "EAST";
  title: string;
  name: string;
  thana: string;
  venue: string;
  contactName: string;
  phone: string;
}

export const LiveViharLedger2026: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { language } = useLanguage();
  const [searchKey, setSearchKey] = useState('');
  const [selectedState, setSelectedState] = useState<'ALL' | 'RAJASTHAN' | 'GUJARAT' | 'MAHARASHTRA' | 'DELHI' | 'SOUTH' | 'EAST'>('ALL');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'DELHI_REALTIME' | 'DELHI_BOARD' | 'NATIONAL_REGISTRY' | 'KASHID_REGISTRY' | 'DELHI_SAINTS'>('LEDGER');

  // 100% CORRECTED, AUDITED & UNIFIED ALL-INDIA VERTICAL INDEX (NO DUPLICATES)
  const masterViharData: ViharLedgerRecord[] = useMemo(() => [
    // --- CENTRAL COMMAND ---
    { id: 1, state: "RAJASTHAN", title: "आचार्यप्रवर", name: "आचार्य श्री महाश्रमणजी (धवल सेना सह)", thana: "धवल सेना", venue: "महाश्रमण विहार, जैन विश्व भारती, लाडनूं", contactName: "शिविर कार्यालय", phone: "7044448888" },
    
    // --- DELHI / NCR & HARYANA SECTOR (FULLY INTEGRATED & CORRECTED) ---
    { id: 2, state: "DELHI", title: "बहुश्रुत", name: "मुनिश्री उदित कुमार जी", thana: "ठाना-३", venue: "अणुव्रत भवन, २१०, दीनदयाल उपाध्याय मार्ग, नई दिल्ली", contactName: "मंडी हाउस प्रभाग", phone: "9983478999" },
    { id: 3, state: "DELHI", title: "श्रमण", name: "मुनिश्री जय कुमार जी", thana: "ठाना-३", venue: "अणुव्रत भवन, २१०, दीनदयाल उपाध्याय मार्ग, नई दिल्ली", contactName: "मंडी हाउस प्रभाग", phone: "9602711402" },
    { id: 4, state: "DELHI", title: "डॉ.", name: "मुनिश्री अभिजित कुमार जी", thana: "ठाना-२", venue: "तेरापंथ भवन, एफ.बी-१२९, मानसरोवर गार्डन, दिल्ली", contactName: "केन्द्रीय कार्यालय", phone: "8291669704" },
    { id: 5, state: "DELHI", title: "शासनश्री", name: "मुनिश्री विमल कुमार जी", thana: "आदि ठाना-४", venue: "तेरापंथ भवन, डी-२/१३, अणुव्रत मार्ग, सेक्टर-१०, फरीदाबाद", contactName: "श्री सुखराज जी सेठिया", phone: "9983478999" },
    { id: 6, state: "DELHI", title: "शासनश्री", name: "साध्वीश्री संघमित्रा जी", thana: "आदि ठाना-५", venue: "गोयल श्रद्धा निवास, सी-१४, ग्रीन पार्क मेन, दिल्ली", contactName: "श्री जयप्रकाश जी गोयल", phone: "9950120242" },
    { id: 7, state: "DELHI", title: "शासनश्री", name: "साध्वीश्री सुमन श्री जी", thana: "आदि ठाना-४", venue: "तेरापंथ भवन, सेक्टर-५, रोहिणी, दिल्ली", contactName: "श्री पूनमचंद जी चौरड़िया", phone: "9915501240" },
    { id: 8, state: "DELHI", title: "शासनश्री", name: "साध्वीश्री सुव्रता जी", thana: "आदि ठाना-४", venue: "श्री धनपत जी सुराणा, क्यू पी - ८१, पीतमपुरा, दिल्ली", contactName: "श्री अरुण जी सुराणा", phone: "8375941210" },
    { id: 9, state: "DELHI", title: "साध्वी", name: "साध्वीश्री लब्धिप्रभा जी", thana: "आदि ठाना-३", venue: "अध्यात्म साधना केंद्र, महाश्रमण सदन, छतरपुर, दिल्ली", contactName: "केन्द्रीय प्रभाग कार्यालय", phone: "6295084007" },
    { id: 10, state: "DELHI", title: "साध्वी डा.", name: "साध्वीश्री कुन्दनरेखा जी", thana: "आदि ठाना-३", venue: "अणुव्रत भवन, २१०, दीनदयाल उपाध्याय मार्ग, दिल्ली", contactName: "श्री दिनेश जी संचेती", phone: "8104273773" },

    // --- RAJASTHAN SECTOR ---
    { id: 11, state: "RAJASTHAN", title: "मुनिश्री", name: "मुनिश्री मुनिव्रत जी", thana: "आदि ठाना ३", venue: "महाप्रज्ञ भवन, सिरियारी", contactName: "सम्पर्क सूत्र", phone: "N/A" },
    { id: 12, state: "RAJASTHAN", title: "मुनिश्री", name: "मुनिश्री संजयकुमार जी", thana: "ठाना ३", venue: "चंडालिया भवन, गांधी सेवा सदन के सामने, राजनगर", contactName: "सम्पर्क सूत्र", phone: "9819063015" },
    { id: 13, state: "RAJASTHAN", title: "मुनिश्री", name: "मुनिश्री तत्व रुचि जी 'तरुण'", thana: "आदि ठाना २", venue: "चौरडिया विला, पोद्दार स्कूल के पास, अजमेर रोड, जयपुर", contactName: "सम्पर्क सूत्र", phone: "9660692852" },
    { id: 14, state: "RAJASTHAN", title: "मुनिश्री", name: "मुनिश्री सुधाकर जी", thana: "आदि ठाना २", venue: "श्रीमान हर्ष जी बैद, एल-५२, इनकम टैक्स कॉलोनी, दुर्गापुरा, जयपुर", contactName: "सम्पर्क सूत्र", phone: "8870651529" },
    { id: 15, state: "RAJASTHAN", title: "साध्वीश्री", name: "साध्वीश्री जसवती जी", thana: "ठाना ४", venue: "तेरापंथ भवन, आसींद", contactName: "सम्पर्क सूत्र", phone: "N/A" },
    { id: 16, state: "RAJASTHAN", title: "साध्वीश्री", name: "साध्वीश्री धनश्री जी", thana: "आदि ठाना ४", venue: "तेरापंथ भवन, गुलाब बाड़ी, कोटा", contactName: "सम्पर्क सूत्र", phone: "9649509233" },
    { id: 17, state: "RAJASTHAN", title: "साध्वीश्री", name: "साध्वीश्री सत्यप्रभाजी", thana: "ठाना ३", venue: "तेरापंथ भवन, अग्रवाल कॉलोनी, बालोतरा", contactName: "सम्पर्क सूत्र", phone: "N/A" },

    // --- GUJARAT SECTOR ---
    { id: 18, state: "GUJARAT", title: "मुनिश्री", name: "मुनिश्री मुनिसुव्रत कुमार जी स्वामी", thana: "आदि ठाना-३", venue: "अर्हम कुंज, तेरापंथ भवन के पास, शाहीबाग, अहमदाबाद", contactName: "सम्पर्क सूत्र", phone: "7021591184" },
    { id: 19, state: "GUJARAT", title: "मुनिश्री", name: "डॉ. मुनिश्री मदन कुमारजी स्वामी", thana: "ठाना ३", venue: "B-4, B-wing, ग्रीन विक्ट्री, अलथान भीमराड़ रोड, सूरत", contactName: "सम्पर्क सूत्र", phone: "6377377427" },
    { id: 20, state: "GUJARAT", title: "साध्वीश्री", name: "साध्वीश्री रामकुमारीजी", thana: "आदि ठाना ४", venue: "तेरापंथ भवन, कांकरिया, मणिनगर, अहमदाबाद", contactName: "सम्पर्क सूत्र", phone: "9408472957" },
    { id: 21, state: "GUJARAT", title: "साध्वीश्री", name: "साध्वीश्री अणिमा श्री जी", thana: "आदि ठाना ५", venue: "तेरापंथ भवन, नरेंद्र मोदी स्टेडियम के पास, मोटेरा, अहमदाबाद", contactName: "सम्पर्क सूत्र", phone: "N/A" },
    { id: 22, state: "GUJARAT", title: "साध्वीश्री", name: "साध्वीश्री मधुबालाजी", thana: "ठाना-५", venue: "तेरापंथ भवन, सिटीलाइट, सूरत", contactName: "सम्पर्क सूत्र", phone: "N/A" },

    // --- MAHARASHTRA SECTOR ---
    { id: 23, state: "MAHARASHTRA", title: "मुनिश्री", name: "मुनिश्री अनंत कुमार जी", thana: "आदि ठाना २", venue: "तेरापंथ भवन, इचलकरंजी", contactName: "सम्पर्क सूत्र", phone: "8755109325" },
    { id: 24, state: "MAHARASHTRA", title: "साध्वीश्री", name: "साध्वीश्री विद्यावती जी 'द्वितीय'", thana: "आदि ठाना-५", venue: "तेरापंथ भवन, ठाकुर कॉम्प्लेक्स, कांदिवली (पूर्व) मुंबई", contactName: "सम्पर्क सूत्र", phone: "8850280184" },
    { id: 25, state: "MAHARASHTRA", title: "साध्वीश्री", name: "साध्वीश्री कंचनप्रभाजी", thana: "ठाना-५", venue: "तेरापंथ भवन, चेम्बुर, मुंबई", contactName: "सम्पर्क सूत्र", phone: "7061598749" },
    { id: 26, state: "MAHARASHTRA", title: "साध्वीश्री", name: "साध्वीश्री शिवमालाजी", thana: "ठाना-३", venue: "कोपरी तेरापंथ भवन, गांवदेवी मंदिर के सामने, ठाणे (पूर्व)", contactName: "सम्पर्क सूत्र", phone: "9892302847" },
    { id: 27, state: "MAHARASHTRA", title: "साध्वीश्री", name: "साध्वीश्री राकेश कुमारी जी", thana: "आदि ठाना-४", venue: "आयरन बिल्डिंग, विलेपार्ले (पूर्व) मुंबई", contactName: "सम्पर्क सूत्र", phone: "7972375908" },
    { id: 28, state: "MAHARASHTRA", title: "साध्वीश्री", name: "साध्वीश्री निर्वाणजी", thana: "ठाना ६", venue: "तेरापंथ सभा भवन, मनु मार्केट, घाटकोपर (पश्चिम) मुम्बई", contactName: "सम्पर्क सूत्र", phone: "7891817906" },

    // --- SOUTHERN INDIA (TAMIL NADU & KARNATAKA & TELANGANA) ---
    { id: 29, state: "SOUTH", title: "मुनिश्री", name: "मुनिश्री विनीत कुमारजी एवं मुनिश्री आकाश कुमार जी", thana: "आदि ठाना ४", venue: "अमृत लाल जी देवड़ा, मधुबन बिडदी, कर्नाटक", contactName: "सम्पर्क सूत्र", phone: "6378404756" },
    { id: 30, state: "SOUTH", title: "मुनिश्री", name: "मुनिश्री पुलकित कुमार जी", thana: "ठाना -२", venue: "श्री वंसतलालजी जी भरत जी मरलेचा, एलिस रोड, चेन्नई, तमिलनाडु", contactName: "सम्पर्क सूत्र", phone: "9104006286" },
    { id: 31, state: "SOUTH", title: "साध्वीश्री", name: "साध्वीश्री उदितयशा जी", thana: "ठाना ४", venue: "श्री रतनलाल जी डोसी निवास, किलपॉक, चेन्नई, तमिलनाडु", contactName: "सम्पर्क सूत्र", phone: "9898502684" },
    { id: 32, state: "SOUTH", title: "साध्वीश्री", name: "साध्वीश्री सिद्धप्रभा जी", thana: "आदि ठाना ४", venue: "तेरापंथ भवन, कोयंबतूर, तमिलनाडु", contactName: "सम्पर्क सूत्र", phone: "9363105602" },
    { id: 33, state: "SOUTH", title: "मुनिश्री", name: "मुनिश्री दीप कुमार जी", thana: "ठाना-२", venue: "बैला विष्ठा अपार्टमेंट, आदर्श नगर, हैदराबाद, तेलंगाना", contactName: "सम्पर्क सूत्र", phone: "8505098254" },

    // --- EASTERN INDIA (WEST BENGAL & ORISSA & ASSAM & BIHAR) ---
    { id: 34, state: "EAST", title: "मुनिश्री", name: "मुनिश्री जिनेश कुमार जी", thana: "ठाना ३", venue: "अलीपुर एक्ज़ोटिका, ३७B, अलीपुर रोड, श्री श्री एकेडमी के पास, कोलकाता", contactName: "सम्पर्क सूत्र", phone: "9831086310" },
    { id: 35, state: "EAST", title: "मुनिश्री", name: "डॉ. मुनिश्री ज्ञानेन्द्र कुमार जी", thana: "ठाना २", venue: "लायंस क्लब फरक्का से पदविहार कर धुलियन प्रस्थान, पश्चिम बंगाल", contactName: "सम्पर्क सूत्र", phone: "9445696470" },
    { id: 36, state: "EAST", title: "मुनिश्री", name: "मुनिश्री मोहजीत कुमार जी", thana: "ठाना ३", venue: "तेरापंथ भवन, भुवनेश्वर, उड़ीसा", contactName: "सम्पर्क सूत्र", phone: "N/A" },
    { id: 37, state: "EAST", title: "मुनिश्री", name: "मुनिश्री आनंदकुमार जी 'कालू'", thana: "ठाना २", venue: "तेरापंथ भवन, हैबरगांव, नोगांव, असम", contactName: "सम्पर्क सूत्र", phone: "9601420513" },
    { id: 38, state: "EAST", title: "मुनिश्री", name: "मुनिश्री प्रशांतकुमार जी", thana: "ठाना २", venue: "अररिया RS, बिहार प्रान्त प्रभाग", contactName: "सम्पर्क सूत्र", phone: "6000696420" }
  ], []);

  const handleCopyContact = (id: number, desc: string, phone: string) => {
    if (phone === 'N/A') return;
    const textToCopy = `सम्पर्क (विहार संवाहक): ${phone}\nविवरण: ${desc}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = useMemo(() => {
    return masterViharData.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchKey.toLowerCase()) || 
        item.venue.toLowerCase().includes(searchKey.toLowerCase()) ||
        item.thana.toLowerCase().includes(searchKey.toLowerCase());
      const matchesState = selectedState === 'ALL' || item.state === selectedState;
      return matchesSearch && matchesState;
    });
  }, [searchKey, selectedState, masterViharData]);

  if (activeTab === 'DELHI_REALTIME') {
    return <LiveLocationVihar2026 onClose={onClose} />;
  }

  if (activeTab === 'DELHI_BOARD') {
    return (
      <div className="relative w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-y-auto flex flex-col shadow-2xl">
        <div className="absolute top-4 right-4 z-50">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 bg-black/40 hover:bg-black/60 rounded-full transition-colors text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <ViharTracker />
      </div>
    );
  }

  if (activeTab === 'NATIONAL_REGISTRY') {
    return <UnifiedRegistry onClose={onClose} defaultTab="national" />;
  }

  if (activeTab === 'KASHID_REGISTRY') {
    return <UnifiedRegistry onClose={onClose} defaultTab="kashid" />;
  }

  if (activeTab === 'DELHI_SAINTS') {
    return (
      <div className="relative w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl p-2">
        <div className="flex justify-end p-2 pb-0">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 pb-6">
          <SaintsList />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#060814] text-white rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative flex flex-col w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] font-sans" id="live-vihar-ledger-card">
      
      {/* Absolute Global Viewport Layout Style Injection Mandate */}
      <style>{`
        /* Force Core Content Window to Self-Correct and Avoid Cutoffs */
        [class*="main-content"], [class*="scroll-container"], .main-content {
          flex: 1 1 auto !important;
          height: auto !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          padding-bottom: 80px !important;
          box-sizing: border-box !important;
        }

        .ledger-vihar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .ledger-vihar-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .ledger-vihar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 999px;
        }
      `}</style>

      {/* Background ambient radial glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/10 shrink-0">
            <Compass size={18} className="text-zinc-950 transform rotate-45" />
          </div>
          <div className="text-left">
            <h2 className="font-extrabold text-white text-base sm:text-lg leading-tight uppercase tracking-wide">
              {language === 'hi' ? '📍 लाइव विहार एवं कम्पलीट प्रवास' : '📍 Live Monastic Vihar Ledger'}
            </h2>
            <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest leading-none mt-1.5">
              {language === 'hi' ? '११ जून २०२६ • अखिल भारतीय प्रवास निर्देशिका' : '11 June 2026 • All India Vihar Directory'}
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-300 pointer-events-auto"
            id="close-vihar-ledger-btn"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Tab Switcher */}
      <div className="px-3 py-2.5 bg-slate-950/60 border-b border-white/5 flex gap-1.5 shrink-0 z-10 relative overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
            (activeTab as string) === 'LEDGER'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-black shadow'
              : 'bg-[#11152b] text-zinc-400 font-bold hover:text-zinc-200'
          }`}
        >
          {language === 'hi' ? '🗂️ प्रवास निर्देशिका' : '🗂️ Travel Ledger'}
        </button>
        <button
          onClick={() => setActiveTab('DELHI_REALTIME')}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            (activeTab as string) === 'DELHI_REALTIME'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black shadow shadow-cyan-500/10'
              : 'bg-[#11152b] text-zinc-400 font-bold hover:text-zinc-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {language === 'hi' ? '📡 दिल्ली रियल-टाइम' : '📡 Live Proximity'}
        </button>
        <button
          onClick={() => setActiveTab('DELHI_BOARD')}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            (activeTab as string) === 'DELHI_BOARD'
              ? 'bg-gradient-to-r from-emerald-600 to-green-500 Richmond text-white font-black shadow shadow-emerald-550/10'
              : 'bg-[#11152b] text-zinc-400 font-bold hover:text-zinc-200'
          }`}
        >
          {language === 'hi' ? '🗺️ दिल्ली प्रवास बोर्ड' : '🗺️ Delhi Pravas Board'}
        </button>
        <button
          onClick={() => setActiveTab('DELHI_SAINTS')}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            (activeTab as string) === 'DELHI_SAINTS'
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black shadow shadow-rose-500/10'
              : 'bg-[#11152b] text-zinc-400 font-bold hover:text-zinc-200'
          }`}
        >
          🪷 {language === 'hi' ? 'दिल्ली चारित्रात्माएं' : 'Delhi Saints'}
        </button>
        <button
          onClick={() => setActiveTab('NATIONAL_REGISTRY')}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            (activeTab as string) === 'NATIONAL_REGISTRY'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow shadow-purple-500/10'
              : 'bg-[#11152b] text-zinc-400 font-bold hover:text-zinc-200'
          }`}
        >
          {language === 'hi' ? '🌐 महा-रजिस्ट्री २०२६' : '🌐 National Registry'}
        </button>
        <button
          onClick={() => setActiveTab('KASHID_REGISTRY')}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
            (activeTab as string) === 'KASHID_REGISTRY'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow shadow-emerald-500/10'
              : 'bg-[#11152b] text-zinc-400 font-bold hover:text-zinc-200'
          }`}
        >
          {language === 'hi' ? '📞 कासीद हेल्पलाइन' : '📞 Helplines'}
        </button>
      </div>

      {/* COMPLIANCE ALERT & STRICT INFORMATION */}
      <div className="p-4 bg-slate-950/50 border-b border-white/5 space-y-3 z-10 shrink-0">
        <div className="bg-gradient-to-br from-amber-500/12 via-zinc-950/50 to-slate-950/60 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3 text-left">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0 mt-0.5">
            <AlertCircle size={15} />
          </div>
          <div className="space-y-1">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-[#ffaa00] block leading-none">
              ⚠️ मर्यादा अनुपालन निर्देश (Monastic Rules Compliance)
            </span>
            <p className="text-[10.5px] sm:text-[11px] text-zinc-300 leading-relaxed font-semibold">
              <strong>परम पूज्य साधु-साध्वी वृन्द</strong> जैन मर्यादाओं के अनुसार किसी भी प्रकार के <strong>मोबाइल, विद्युत यंत्रों या तकनीकी गैजेट्स का बिलकुल उपयोग नहीं करते हैं</strong>। यहाँ दिए गए नम्बर विशुद्ध रूप से स्थानीय श्रावक समाज या <strong>'विहार प्रवास संवाहक' (Emissaries)</strong> के हैं जो इनकी चरणयात्रा की रीयल-टाइम सूचना सँभालते हैं।
            </p>
          </div>
        </div>

        {/* STATE SELECTED TAB PILLS */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mt-2 scrollbar-none">
          {[
            { id: 'ALL', label: '🗂️ अखिल भारतीय' },
            { id: 'RAJASTHAN', label: '🐪 राजस्थान' },
            { id: 'GUJARAT', label: '💎 गुजरात' },
            { id: 'MAHARASHTRA', label: '🏢 महाराष्ट्र' },
            { id: 'DELHI', label: '🏛️ दिल्ली-NCR' },
            { id: 'SOUTH', label: '🌴 दक्षिण भारत' },
            { id: 'EAST', label: '🌅 पूर्वी भारत' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setSelectedState(pill.id as any)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-colors cursor-pointer shrink-0 border ${
                selectedState === pill.id 
                  ? 'bg-amber-500 text-zinc-950 border-transparent font-black shadow-md shadow-amber-500/10' 
                  : 'bg-[#11152b] text-zinc-400 border-white/5 hover:border-white/10'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Dynamic query search interface */}
        <div className="relative mt-2">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'चारित्रआत्मा का नाम, प्रवास स्थल या ठाना खोजें...' : 'Search monk/sadhvi name, stay location or thana...'}
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-[#11152b] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-500 text-white"
            id="vihar-search-input"
          />
        </div>
      </div>

      {/* MASONRY LEDGER DISPATCH CANVAS */}
      <div className="overflow-y-auto p-4 space-y-3 z-10 flex-grow ledger-vihar-scroll max-h-[48vh] text-left">
        <AnimatePresence mode="popLayout">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((item, idx) => {
              const isAcharya = item.title === "आचार्यप्रवर";
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22, delay: idx * 0.03 }}
                  className={`vihar-card p-4 rounded-2xl border transition-all ${
                    isAcharya 
                      ? 'bg-gradient-to-br from-amber-500/15 via-zinc-950/40 to-slate-950/60 border-amber-500/30 shadow-lg' 
                      : 'bg-[#11152b]/40 border-white/5 hover:border-amber-500/15'
                  }`}
                  id={`vihar-ledger-card-${item.id}`}
                >
                  {/* Item Header info */}
                  <div className="flex justify-between items-start gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isAcharya 
                          ? 'bg-amber-500 text-zinc-950' 
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}>
                        <User size={13} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          {item.title} {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-full text-zinc-400 font-bold uppercase tracking-wider">
                            {item.state}
                          </span>
                          <span className="text-[8.5px] font-black text-amber-500 uppercase tracking-widest">
                            {item.thana}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded font-black uppercase">
                      ID {item.id}
                    </span>
                  </div>

                  {/* Travel Venue details */}
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1 mb-2.5">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block leading-none mb-1">
                      🏢 वर्तमान प्रवास स्थल ( shelter details )
                    </span>
                    <p className="text-[11px] sm:text-[12px] text-zinc-200 font-black leading-tight">
                      {item.venue}
                    </p>
                  </div>

                  {/* Contact line / Messenger details */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider">
                        📡 संवाहक: <strong className="text-zinc-200">{item.contactName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.phone !== 'N/A' ? (
                        <>
                          <button
                            onClick={() => handleCopyContact(item.id, `${item.title} ${item.name} (${item.thana}) @ ${item.venue}`, item.phone)}
                            className={`py-1 px-2.5 rounded-lg border text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                              copiedId === item.id 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : 'bg-white/5 text-zinc-300 border-white/5 hover:bg-white/10'
                            }`}
                            id={`copy-kashid-btn-${item.id}`}
                          >
                            {copiedId === item.id ? <Check size={10} /> : <Share2 size={10} />}
                            {copiedId === item.id ? 'कॉपी पूर्ण!' : 'कॉपी करें'}
                          </button>

                          <a
                            href={`tel:${item.phone}`}
                            className="p-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 active:scale-95 text-zinc-950 rounded-lg transition-all text-xs inline-flex items-center justify-center cursor-pointer"
                            title="Call Messenger Helpline"
                            id={`call-kashid-btn-${item.id}`}
                          >
                            <Phone size={10} className="text-zinc-950 font-black" />
                          </a>
                        </>
                      ) : (
                        <span className="text-[8.5px] font-bold text-zinc-500 italic bg-white/5 px-2 py-0.5 rounded">
                          संवाद लाइन उपलब्ध नहीं है
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-bold uppercase tracking-wider" id="no-vihar-results-fallback">
              🔍 {language === 'hi' ? 'खोज से मेल खाता हुआ कोई निवासी दल नहीं मिला।' : 'No matching monastic Vihar stays found.'}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER CO-COMPLIANCE OFFICIAL SYSTEM STAMP */}
      <div className="p-4 bg-slate-950 border-t border-white/10 shrink-0 flex flex-wrap items-center justify-between text-[9px] font-bold text-zinc-500 z-10" id="vihar-ledger-footer">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-amber-500" />
          <span>{language === 'hi' ? 'अखिल भारतीय तेरापंथ युवक परिषद (ABTYP) अधिकृत' : 'Sect-Compliant Pedestrian Information System'}</span>
        </div>
        <span>{language === 'hi' ? 'विहार व्यवस्था प्रभाग • २०२६' : 'Vihar Management Board • 2026'}</span>
      </div>

    </div>
  );
};
