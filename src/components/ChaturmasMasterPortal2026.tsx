import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  X, 
  Calendar, 
  Layers, 
  Sparkles, 
  Navigation, 
  Award, 
  Info, 
  Share2, 
  Check, 
  ArrowRight,
  BookOpen,
  Search,
  Filter,
  Bell,
  Download,
  RefreshCw,
  Map,
  List,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { CHATURMAS_MASTER_2026, ChaturmasDeclaration } from '../data/chaturmas2026';

export interface HistoricalAuraTrack {
  year: string;
  place: string;
  placeEn: string;
  type: 'historical' | 'active';
}

export default function ChaturmasMasterPortal2026({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab ] = useState<'NEW_2026' | 'HISTORICAL_MAP'>('NEW_2026');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'MAHARASHTRA' | 'GUJARAT' | 'RAJASTHAN' | 'DELHI'>('ALL');
  const [copied, setCopied] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Firestore & Master Fallback State Integration
  const [declarationsList, setDeclarationsList] = useState<ChaturmasDeclaration[]>(CHATURMAS_MASTER_2026);
  const [isLoadingDynamicData, setIsLoadingDynamicData] = useState(false);
  const [remindStatus, setRemindStatus] = useState<Record<number, string>>({}); // 'calendar' | 'notified'
  const [leafletReady, setLeafletReady] = useState(false);

  // 1. Fetch live declarations from Firestore to satisfy administrative synchronization rules.
  useEffect(() => {
    const fetchDynamicData = async () => {
      setIsLoadingDynamicData(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'chaturmas_registry_2026'));
        if (!querySnapshot.empty) {
          const list: ChaturmasDeclaration[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as ChaturmasDeclaration);
          });
          // Preserve sequence
          list.sort((a, b) => a.id - b.id);
          setDeclarationsList(list);
        }
      } catch (err) {
        console.warn("Could not load dynamic Chaturmas data from Firestore, falling back to secure local master:", err);
      } finally {
        setIsLoadingDynamicData(false);
      }
    };
    fetchDynamicData();
  }, []);

  // 2. Load Leaflet script/stylesheet dynamically into container
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ((window as any).L) {
      setLeafletReady(true);
      return;
    }

    // Load Leaflet CSS
    const linkId = 'leaflet-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const scriptId = 'leaflet-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setLeafletReady(true);
      };
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if ((window as any).L) {
          setLeafletReady(true);
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // Timeline chronology matrix
  const historicalAuraTracks: HistoricalAuraTrack[] = [
    { year: "2015", place: "दिल्ली (ओसवाल भवन)", placeEn: "Delhi (Oswal Bhawan)", type: 'historical' },
    { year: "2016", place: "दिल्ली (पीतमपुरा)", placeEn: "Delhi (Pitampura)", type: 'historical' },
    { year: "2017", place: "जयपुर (अणुविभा)", placeEn: "Jaipur (Anuvibha)", type: 'historical' },
    { year: "2018", place: "जयपुर (तेरापंथ भवन)", placeEn: "Jaipur (Terapanth Bhawan)", type: 'historical' },
    { year: "2019", place: "जयपुर (विद्याधर नगर)", placeEn: "Jaipur (Vidyadhar Nagar)", type: 'historical' },
    { year: "2020", place: "जलगांव (अणुव्रत भवन)", placeEn: "Jalgaon (Anuvrat Bhawan)", type: 'historical' },
    { year: "2021", place: "भीलवाड़ा (तेरापंथ नगर)", placeEn: "Bhilwara (Terapanth Nagar)", type: 'historical' },
    { year: "2022", place: "सूरत (सिटी लाइट)", placeEn: "Surat (City Light)", type: 'historical' },
    { year: "2023", place: "सूरत (उधना)", placeEn: "Surat (Udhana)", type: 'historical' },
    { year: "2024", place: "सूरत (भगवान महावीर कॉलेज)", placeEn: "Surat (Bhagwan Mahavir College)", type: 'historical' },
    { year: "2025", place: "दिल्ली (ओसवाल भवन)", placeEn: "Delhi (Oswal Bhawan)", type: 'historical' },
    { year: "2026", place: "दिल्ली (पीतमपुरा) [सक्रिय चातुर्मास]", placeEn: "Delhi (Pitampura) [Active Station]", type: 'active' }
  ];

  // Filters logic
  const filteredDeclarations = useMemo(() => {
    return declarationsList.filter(item => {
      const matchText = (language === 'hi' 
        ? `${item.monk} ${item.venue} ${item.zone}` 
        : `${item.monkEn} ${item.venueEn} ${item.zoneEn}`).toLowerCase();
      const matchSearch = matchText.includes(searchTerm.toLowerCase());
      const matchRegion = regionFilter === 'ALL' || item.state === regionFilter;
      return matchSearch && matchRegion;
    });
  }, [language, searchTerm, regionFilter, declarationsList]);

  // Leaflet Map Rendering Trigger
  useEffect(() => {
    if (!leafletReady || viewMode !== 'map' || activeTab !== 'NEW_2026') return;
    
    const L = (window as any).L;
    if (!L) return;

    const container = L.DomUtil.get('chaturmas-leaflet-map');
    if (container) {
      (container as any)._leaflet_id = null;
    }

    const map = L.map('chaturmas-leaflet-map', {
      center: [23.0000, 78.0000],
      zoom: 4.5,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-500 opacity-60"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white"></span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const markersGroup = L.featureGroup();

    filteredDeclarations.forEach(item => {
      const lat = item.lat || 20;
      const lng = item.lng || 78;

      const title = language === 'hi' ? item.monk : item.monkEn;
      const desc = language === 'hi' ? `${item.thana}<br/>स्थल: ${item.venue}` : `${item.thanaEn}<br/>Venue: ${item.venueEn}`;

      const popupContent = `
        <div class="p-2 text-slate-900 font-sans leading-tight">
          <h4 class="font-extrabold text-[12px] text-[#b45309] m-0 mb-1 leading-tight">${title}</h4>
          <p class="text-[10px] text-slate-700 m-0 leading-snug">${desc}</p>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(popupContent, { closeButton: false })
        .addTo(map);

      marker.on('click', () => {
        setSelectedCardId(item.id);
        const cardElem = document.getElementById(`chaturmas-card-${item.id}`);
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      markersGroup.addLayer(marker);
    });

    if (filteredDeclarations.length > 0) {
      map.fitBounds(markersGroup.getBounds(), { padding: [30, 30] });
    }

    return () => {
      map.remove();
    };
  }, [leafletReady, viewMode, activeTab, filteredDeclarations, language]);

  // Remind Me Action Helpers
  const handleReminderNotification = async (item: ChaturmasDeclaration) => {
    if (!("Notification" in window)) {
      alert("This browser context does not support push notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(`chaturmas-reminder-${item.id}`, 'true');
      setRemindStatus(prev => ({ ...prev, [item.id]: 'notified' }));
      
      new Notification(
        language === 'hi' ? "चातुर्मास अनुस्मारक सक्रिय!" : "Chaturmas 2026 Notification Saved!",
        {
          body: language === 'hi' 
            ? `${item.monk} (${item.venue}) का चातुर्मास अनुस्मारक चालू हुआ।` 
            : `Set alerts for ${item.monkEn} at ${item.venueEn}.`,
          icon: 'https://i.postimg.cc/rp8MS1YG/Untitled-design-20260719-150333-0000.png'
        }
      );
    } else {
      alert(language === 'hi' ? "अनुमति अस्वीकार की गई। कृपया ब्राउज़र सेटिंग्स में सूचनाओं को चालू करें।" : "Notifications default denied. Please permit them in your browser configuration.");
    }
  };

  const downloadIcs = (item: ChaturmasDeclaration) => {
    const summary = language === 'hi'
      ? `चातुर्मास प्रारंभ दिवस २०२६ - ${item.monk}`
      : `Chaturmas Commencement 2026 - ${item.monkEn}`;
    const description = language === 'hi'
      ? `स्थल: ${item.venue}\nक्षेत्र: ${item.zone}\nठाना संख्या: ${item.thana}\nस्रोत: ${item.source}`
      : `Venue: ${item.venueEn}\nZone: ${item.zoneEn}\nThana group: ${item.thanaEn}\nSource: ${item.sourceEn}`;
    const location = language === 'hi' ? item.venue : item.venueEn;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Terapanth AI//Chaturmas Event//EN",
      "BEGIN:VEVENT",
      "UID:chaturmas-2026-" + item.id,
      "DTSTAMP:20260610T094400Z",
      "DTSTART:20260729T043000Z", // Typical commencement Ashadha Purnima
      "DTEND:20260729T063000Z",
      "SUMMARY:" + summary.replace(/,/g, "\\,"),
      "DESCRIPTION:" + description.replace(/\n/g, "\\n").replace(/,/g, "\\,"),
      "LOCATION:" + location.replace(/,/g, "\\,"),
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "DESCRIPTION:Chaturmas Alert",
      "ACTION:DISPLAY",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `chaturmas_reminder_${item.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setRemindStatus(prev => ({ ...prev, [item.id]: 'calendar' }));
  };

  const getGoogleCalendarUrl = (item: ChaturmasDeclaration) => {
    const title = language === 'hi' ? `चातुर्मास २०२६: ${item.monk}` : `Chaturmas 2026: ${item.monkEn}`;
    const details = language === 'hi'
      ? `स्थल: ${item.venue}\nप्रभाग: ${item.zone}\nसंघ आकार: ${item.thana}`
      : `Venue: ${item.venueEn}\nSector: ${item.zoneEn}\nMonastic Size: ${item.thanaEn}`;
    const location = language === 'hi' ? item.venue : item.venueEn;
    const times = "20260729T090000/20260729T110000";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${times}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  };

  const handleShare = () => {
    let textToCopy = '';
    if (language === 'hi') {
      textToCopy = `📚 जैन तेरापंथ चातुर्मास महा-निर्देशिका २०२६ (वि.सं. २०८३) - कुल १० आधिकारिक घोषणाएँ:\n\n` + 
        filteredDeclarations.map((d, i) => `${i + 1}. ${d.monk} (${d.thana}) -> स्थल: ${d.venue} (${d.zone})\n   घोषणा तिथि: ${d.date}`).join('\n\n') + 
        `\n\n• अनुशासक: युगप्रधान आचार्य श्री महाश्रमण जी\n• स्रोतः ABTYP Jain Terapanth News`;
    } else {
      textToCopy = `📚 Jain Terapanth Chaturmas Master Directory 2026 (V.S. 2083) - ${filteredDeclarations.length} Active Records:\n\n` + 
        filteredDeclarations.map((d, i) => `${i + 1}. ${d.monkEn} (${d.thanaEn}) -> Venue: ${d.venueEn} (${d.zoneEn})\n   Declared on: ${d.dateEn}`).join('\n\n') + 
        `\n\n• Spiritual Guide: Yugpradhan Acharya Shri Mahashraman Ji\n• Source: ABTYP Jain Terapanth News`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[var(--card-bg)] text-[var(--text-spiritual)] rounded-[2.5rem] overflow-hidden border border-[var(--border-color)] shadow-2xl relative flex flex-col w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] font-sans">
      
      {/* Scrollbar style */}
      <style>{`
        .chaturmas-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chaturmas-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .chaturmas-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
        }
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER SECTION */}
      <div className="bg-[var(--card-bg)]/85 backdrop-blur-xl border-b border-[var(--border-color)] p-6 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shrink-0">
            <Award size={18} className="text-white" />
          </div>
          <div>
            <h2 className="serif-text font-black text-[var(--text-spiritual)] text-base sm:text-lg leading-tight flex items-center gap-2">
              {language === 'hi' ? 'चातुर्मास महा-निर्देशिका (२०२६)' : 'Chaturmas Master Directory 2026'}
              {isLoadingDynamicData && <RefreshCw size={12} className="animate-spin text-amber-500" />}
            </h2>
            <p className="text-[9px] text-orange-600 dark:text-amber-400 font-bold uppercase tracking-widest leading-none mt-1">
              {language === 'hi' ? 'अनुशासक: युगप्रधान आचार्य श्री महाश्रमण जी' : 'Spiritual Guide: Acharya Shri Mahashraman Ji'}
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-gray-300 pointer-events-auto cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* TABS SELECTOR */}
      <div className="p-4 bg-[var(--card-bg)]/80 border-b border-[var(--border-color)] shrink-0 z-10 w-full box-border">
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-[var(--border-color)] gap-1">
          <button
            onClick={() => setActiveTab('NEW_2026')}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center border-none outline-none ${
              activeTab === 'NEW_2026'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            📢 {language === 'hi' ? 'नवीन घोषणाएं (२०२६)' : 'New Declarations (2026)'}
          </button>
          <button
            onClick={() => setActiveTab('HISTORICAL_MAP')}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center border-none outline-none ${
              activeTab === 'HISTORICAL_MAP'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            📜 {language === 'hi' ? 'कालक्रम संदर्भ सूची' : 'Chronicle Index'}
          </button>
        </div>
      </div>

      {/* FILTER & STATE PILLS */}
      {activeTab === 'NEW_2026' && (
        <div className="px-4 pt-3 space-y-3 shrink-0 z-10">
          {/* Search Input bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder={language === 'hi' ? "संत का नाम, चातुर्मास स्थल या प्रभाग खोजें..." : "Search worker name, venue, division..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-spiritual)] focus:outline-none focus:border-orange-500 dark:focus:border-amber-500 transition-colors placeholder:text-gray-500 font-semibold"
            />
          </div>

          {/* Region pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full chaturmas-scroll">
            {[
              { id: 'ALL', labelHi: '🗂️ सभी क्षेत्र', labelEn: '🗂️ All Regions' },
              { id: 'MAHARASHTRA', labelHi: '🏢 मुम्बई', labelEn: '🏢 Mumbai' },
              { id: 'GUJARAT', labelHi: '💎 गुजरात', labelEn: '💎 Gujarat' },
              { id: 'RAJASTHAN', labelHi: '🐪 राजस्थान', labelEn: '🐪 Rajasthan' },
              { id: 'DELHI', labelHi: '🏛️ दिल्ली-NCR', labelEn: '🏛️ Delhi-NCR' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setRegionFilter(pill.id as any)}
                className={`py-1.5 px-3 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer border transition-all ${
                  regionFilter === pill.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold scale-105'
                    : 'bg-slate-900/65 text-gray-400 border-white/5 hover:text-white hover:bg-slate-800'
                }`}
              >
                {language === 'hi' ? pill.labelHi : pill.labelEn}
              </button>
            ))}
          </div>

          {/* List and Map toggle */}
          <div className="flex bg-slate-950/90 p-1 rounded-xl border border-white/10 gap-1.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List size={11} /> {language === 'hi' ? 'सूचीबद्ध विवरण' : 'List View'}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Map size={11} /> {language === 'hi' ? 'सक्रिय मानचित्र (10 Pins)' : 'Spatial Map Index'}
            </button>
          </div>
        </div>
      )}

      {/* CORE DISPLAY CANVAS */}
      <div className="overflow-y-auto p-4 space-y-3.5 z-10 flex-grow chaturmas-scroll max-h-[50vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'NEW_2026' ? (
            <motion.div 
              key="new_2026_list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3.5"
            >
              {/* Render Map directly at head when in viewMode === 'map' */}
              {viewMode === 'map' && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 h-[320px] w-full bg-slate-950 shadow-inner">
                  <div id="chaturmas-leaflet-map" className="w-full h-full" style={{ minHeight: '320px' }} />
                  <div className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur border border-white/10 text-amber-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-[1000] shadow-md flex items-center gap-1.5 animate-pulse">
                    <Map size={10} /> {language === 'hi' ? 'लाइव भौगोलिक पिन' : 'Live Spatial Index'}
                  </div>
                </div>
              )}

              {filteredDeclarations.length > 0 ? (
                filteredDeclarations.map((item) => {
                  const isHighlighted = selectedCardId === item.id;
                  return (
                    <div 
                      key={item.id} 
                      id={`chaturmas-card-${item.id}`}
                      className={`p-4 rounded-2xl bg-slate-950/60 border hover:border-amber-500/30 transition-all space-y-3 relative group overflow-hidden ${
                        isHighlighted ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/5' : 'border-amber-500/10'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-amber-500/10 transition-colors" />

                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          📢 {language === 'hi' ? 'घोषणा: ' : 'Declared: '} {language === 'hi' ? item.date : item.dateEn}
                        </span>
                        <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          {language === 'hi' ? item.thana : item.thanaEn}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest block">{language === 'hi' ? 'श्रमण/श्रमणी समुदाय:' : 'Monastic Ascetic:'}</span>
                        <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-500 shrink-0" />
                          {language === 'hi' ? item.monk : item.monkEn}
                        </h3>
                      </div>

                      <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                        <MapPin size={14} className="text-rose-500 shrink-0" />
                        <div>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block leading-none mb-1">
                            {language === 'hi' ? '📍 चातुर्मास स्थल व प्रभाग:' : '📍 Allocated Campus & Section:'}
                          </span>
                          <p className="text-xs sm:text-sm text-amber-400 font-extrabold leading-tight">
                            {language === 'hi' ? item.venue : item.venueEn} 
                            <span className="text-[10px] text-gray-400 font-bold ml-1">
                              ({language === 'hi' ? item.zone : item.zoneEn})
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[8.5px] text-gray-500 leading-none">
                        <span className="font-bold text-gray-600 bg-white/[0.02] px-2 py-1 rounded-md border border-white/[0.04]">
                          {language === 'hi' ? item.era : item.eraEn}
                        </span>
                        <span className="italic">
                          {language === 'hi' ? 'स्रोत: ' : 'Source: '} {language === 'hi' ? item.source : item.sourceEn}
                        </span>
                      </div>

                      {/* Reminder & Add to Calendar widgets */}
                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => downloadIcs(item)}
                            className="bg-white/5 hover:bg-white/10 active:scale-95 text-[10px] text-amber-400 font-bold px-2.5 py-1.5 rounded-xl border border-white/5 cursor-pointer flex items-center gap-1 transition-all"
                            title="Download calendar .ics"
                          >
                            <Download size={11} />
                            {remindStatus[item.id] === 'calendar' ? (language === 'hi' ? '📅 सेव किया' : '📅 Saved') : (language === 'hi' ? 'कैलेंडर' : 'Calendar (.ics)')}
                          </button>
                          
                          <a
                            href={getGoogleCalendarUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-white font-bold px-2.5 py-2 rounded-xl border border-amber-500/10 cursor-pointer flex items-center gap-1 transition-all text-[10px] sm:text-xs"
                            title="Add directly to Google Calendar"
                          >
                            <ExternalLink size={10} /> Google Calendar
                          </a>
                        </div>

                        <button
                          onClick={() => handleReminderNotification(item)}
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold px-2.5 py-1.5 rounded-xl border border-sky-500/10 cursor-pointer flex items-center gap-1 transition-all text-[10px] ml-auto"
                        >
                          <Bell size={11} className={remindStatus[item.id] === 'notified' ? "fill-sky-400 animate-pulse animate-duration-1000" : ""} />
                          {remindStatus[item.id] === 'notified' ? (language === 'hi' ? 'अलर्ट ऑन' : 'Notified') : (language === 'hi' ? 'याद दिलाएं' : 'Remind Me')}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-gray-500 font-bold">
                    {language === 'hi' ? 'कोई परिणाम नहीं मिला। कृपया अपना सर्च कीवर्ड बदलें।' : 'No verified declarations match your criteria.'}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="historical_list"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-black/5 dark:bg-white/[0.012] border border-[var(--border-color)] rounded-2xl p-4 space-y-3"
            >
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
                <span className="text-[10px] font-black text-orange-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} /> {language === 'hi' ? 'संघ मुख्य चातुर्मास कालक्रम' : 'Monastic Chief Chronology'}
                </span>
                <span className="text-[9px] text-gray-400 font-bold">{language === 'hi' ? '१२ महत्वपूर्ण वर्ष' : '12 Landmark Years'}</span>
              </div>

              <div className="space-y-2">
                {historicalAuraTracks.map((item, index) => {
                  const isActive = item.type === 'active';
                  return (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/30 dark:border-amber-500/30 shadow-md' 
                          : 'bg-black/5 dark:bg-white/[0.005] hover:bg-black/10 dark:hover:bg-white/[0.015] border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] sm:text-xs font-black min-w-[32px] ${
                          isActive ? 'text-rose-500' : 'text-amber-400'
                        }`}>
                          {item.year}
                        </span>
                        <span className={`text-xs ${
                          isActive ? 'text-[var(--text-spiritual)] font-extrabold' : 'text-gray-300 font-semibold'
                        }`}>
                          {language === 'hi' ? item.place : item.placeEn}
                        </span>
                      </div>
                      
                      {isActive && (
                        <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-black animate-pulse leading-none">
                          {language === 'hi' ? 'सक्रिय' : 'Active'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SHARE AND CONTROLS DOCK */}
      <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)] shrink-0 space-y-3 z-10">
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 active:scale-95 text-white font-black uppercase tracking-widest py-3.5 rounded-2xl text-[10px] sm:text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg border-none outline-none"
        >
          <Share2 size={13} className="text-white" />
          {language === 'hi' ? 'चातुर्मास सूची साझा करें' : 'Share Filtered Chaturmas List'}
        </button>

        <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 border-t border-[var(--border-color)] pt-2">
          <div className="flex items-center gap-1.5">
            <Check size={12} className="text-emerald-500 font-black" />
            <span>{language === 'hi' ? 'प्रामाणिक जैन तेरापंथ लेखागार' : 'Canonical History Verified'}</span>
          </div>
          <span>{language === 'hi' ? 'वि.सं. २०८३' : 'V.S. 2083 Sync'}</span>
        </div>
      </div>

      {/* Toast alert */}
      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2 border border-white/20 whitespace-nowrap"
          >
            <Check size={12} className="stroke-slate-950 stroke-2" />
            <span>{language === 'hi' ? 'विवरण क्लिपबोर्ड पर कॉपी किया गया!' : 'Details copied to clipboard!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
