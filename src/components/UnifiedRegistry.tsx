import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldAlert, Award, Globe, MapPin, FileText, QrCode, Star, Calendar, X, Copy, Check, Info, Phone, WifiOff } from 'lucide-react';
import { MONK_REGISTRY } from '../data/monkRegistry';
import { MANTRI_MUNI_DATABASE } from '../data/mantriMuniDatabase';

type RegistryTab = 'national' | 'regional' | 'kashid';

interface MonkRecord {
  id: string;
  name: string;
  dikshaDate?: string;
  currentLocation?: string;
  region?: string;
  kashidStatus?: boolean;
  rank?: string;
  contact?: string;
}

export default function UnifiedRegistry({ onClose, defaultTab = 'national' }: { onClose: () => void; defaultTab?: RegistryTab }) {
  const [activeSubTab, setActiveSubTab] = useState<RegistryTab>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom States for new features
  const [selectedRecord, setSelectedRecord] = useState<MonkRecord | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<MonkRecord | null>(null);
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);

  // Favorites state synced with localStorage
  const [savedSaints, setSavedSaints] = useState<any[]>(() => {
    const saved = localStorage.getItem('saved_saints');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSaveSaint = (record: MonkRecord) => {
    const compositeId = `registry-${record.id}`;
    const isSaved = savedSaints.some((s: any) => s.id === compositeId);
    let updated;
    if (isSaved) {
      updated = savedSaints.filter((s: any) => s.id !== compositeId);
    } else {
      updated = [...savedSaints, {
        id: compositeId,
        name: record.name,
        rank: record.rank || 'Muni',
        loc: record.currentLocation || 'In Transit',
        contact: record.contact || '9983478999',
        type: 'registry'
      }];
    }
    setSavedSaints(updated);
    localStorage.setItem('saved_saints', JSON.stringify(updated));
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High-pitched A
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("AudioContext block", e);
    }
  };

  const exportToICS = (record: MonkRecord) => {
    const title = `Vihar Update: ${record.name}`;
    const description = `Monastic Registry Details - Name: ${record.name}, Title/Rank: ${record.rank || 'Ascetic'}, Diksha Date: ${record.dikshaDate || 'N/A'}`;
    const location = record.currentLocation || 'Jain Terapanth Bhawan';
    
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Terapanth AI//NONSGML v1.0//EN",
      "BEGIN:VEVENT",
      `UID:registry-${record.id}-${Date.now()}@terapanth.ai`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTEND:${new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    
    const icsContent = icsLines.join("\r\n");
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${record.name.replace(/\s+/g, "_")}_Vihar.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process and filter the unified data set based on search and sub-tab criteria
  const filteredRecords = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    
    // Combine underlying registry datasets safely
    const monkRecords: MonkRecord[] = MONK_REGISTRY.map(m => ({
      id: m.infoId.toString(),
      name: m.name,
      dikshaDate: m.diksha,
      currentLocation: m.base,
      rank: m.title,
      contact: m.infoId === 866 ? '9983478999' : m.infoId === 697 ? '9950120242' : '9210095347'
    }));

    const mantriRecords: MonkRecord[] = MANTRI_MUNI_DATABASE.map(m => ({
      id: m.id?.toString() || `${m.subject}-${m.samvat}-${m.year}`,
      name: m.subject,
      currentLocation: m.chaturmas_kshetra,
      rank: 'Mantri Muni',
      contact: '7044448888'
    }));

    const baseRecords: MonkRecord[] = [...monkRecords, ...mantriRecords];

    return baseRecords.filter((monk) => {
      // 1. Search filter criteria
      const matchesSearch = 
        monk.name?.toLowerCase().includes(cleanQuery) ||
        monk.currentLocation?.toLowerCase().includes(cleanQuery) ||
        monk.rank?.toLowerCase().includes(cleanQuery);

      if (!matchesSearch) return false;

      // 2. Tab filtering logic
      if (activeSubTab === 'kashid') {
        return !!monk.kashidStatus || monk.rank?.toLowerCase().includes('kashid') || monk.name.includes('विनय');
      }
      if (activeSubTab === 'regional') {
        // Filter out records assigned to specific regional chapters
        return !!monk.region && monk.region !== 'National';
      }
      // Default fallback: national view displays all records
      return true;
    });
  }, [activeSubTab, searchQuery]);

  // Handle simulated scans
  const triggerSimulatedScan = (data: MonkRecord) => {
    setIsScanningSimulated(true);
    setScanResult(null);
    setTimeout(() => {
      playBeep();
      setScanResult(data);
      setIsScanningSimulated(false);
    }, 1200);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF8F2] p-4 pb-24 font-sans text-stone-800">
      {/* Dynamic Mobile Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-950">Unified Monastic Registry</h2>
          <p className="text-xs text-stone-500 mt-1">Verified Central Ascetic & Vihar Chronology Logs</p>
        </div>
        <div className="flex items-center gap-2">
          {/* QR Scan Button */}
          <button 
            onClick={() => {
              setShowScanner(true);
              setScanResult(null);
            }}
            className="p-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Scan Contact QR"
          >
            <QrCode className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold font-sans">Scan</span>
          </button>
          
          <button onClick={onClose} className="p-2 bg-stone-200 rounded-full text-stone-600 hover:text-stone-900 cursor-pointer">
             ✕
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher Bar */}
      <div className="flex bg-stone-200/60 p-1 rounded-xl mb-4 gap-1">
        {(['national', 'regional', 'kashid'] as RegistryTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all capitalize flex items-center justify-center gap-1.5 ${
              activeSubTab === tab
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab === 'national' && <Globe className="w-3.5 h-3.5" />}
            {tab === 'regional' && <MapPin className="w-3.5 h-3.5" />}
            {tab === 'kashid' && <Award className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Modern Search Filter Field */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name, rank, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-400 text-stone-900 placeholder-stone-400 shadow-sm"
        />
      </div>

      {/* Interactive Records Output Stack */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const compositeId = `registry-${record.id}`;
              const isFavorite = savedSaints.some((s: any) => s.id === compositeId);
              return (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedRecord(record)}
                  className="bg-white p-4 rounded-2xl border border-stone-150 shadow-sm flex flex-col gap-2 relative overflow-hidden cursor-pointer hover:border-orange-200 hover:shadow-xs transition-all duration-200 group"
                >
                  {/* Visual indicator tag for specific categories */}
                  {record.kashidStatus && (
                    <div className="absolute right-0 top-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider uppercase">
                      Kashid
                    </div>
                  )}

                  <div className="flex items-start justify-between pr-8">
                    <div>
                      <h3 className="font-serif font-bold text-stone-950 text-base group-hover:text-orange-600 transition-colors">{record.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {record.rank && (
                          <span className="inline-block text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                            {record.rank}
                          </span>
                        )}
                        {isFavorite ? (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase font-sans shrink-0" title="Saved locally and fully offline-cached">
                            <WifiOff className="w-2.5 h-2.5 stroke-[2.5]" />
                            Cached Offline
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase font-sans shrink-0" title="Available offline without internet connection">
                            <WifiOff className="w-2.5 h-2.5 stroke-[2.5]" />
                            Offline Ready
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Favorite toggle star inside the card row */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveSaint(record);
                      }}
                      className="p-1.5 rounded-lg hover:bg-stone-50 text-stone-400 hover:text-amber-500 transition-all absolute right-2 top-2 z-10"
                      title={isFavorite ? "Remove from Saved" : "Save to Favorites"}
                    >
                      <Star
                        size={17}
                        className={isFavorite ? "fill-amber-400 text-amber-500" : "text-stone-300"}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2 border-t border-stone-100 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Diksha: {record.dikshaDate || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">Vihar: {record.currentLocation || 'In Transit'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4 bg-white rounded-2xl border border-stone-200"
            >
              <ShieldAlert className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-500">No matching monastic records located.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAIL VIEW MODAL popup */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-3xl p-5 border border-stone-200/80 shadow-xl overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedRecord(null)}
                className="absolute right-4 top-4 p-1.5 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-stone-600" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">🕉️</span>
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-orange-600">Monastic Card Details</h4>
              </div>

              <div className="mb-5">
                <h3 className="font-serif font-black text-2xl text-stone-950 leading-tight mb-1">{selectedRecord.name}</h3>
                <span className="inline-block text-xs font-semibold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                  {selectedRecord.rank || 'Muni'}
                </span>
              </div>

              {/* Data Table */}
              <div className="bg-stone-50/80 rounded-2xl border border-stone-150 p-4 flex flex-col gap-3 mb-6 text-sm">
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-450 font-medium">Diksha (ordination)</span>
                  <span className="font-bold text-stone-800">{selectedRecord.dikshaDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-450 font-medium">Current Location / Vihar</span>
                  <span className="font-bold text-stone-800 text-right max-w-[200px]">{selectedRecord.currentLocation || 'In Transit'}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-450 font-medium">Contact Number</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-orange-600">{selectedRecord.contact || '9983478999'}</span>
                    <button
                      onClick={() => copyToClipboard(selectedRecord.contact || '9983478999', 'modal-contact')}
                      className="p-1 rounded-md hover:bg-stone-200 transition-colors"
                      title="Copy Contact"
                    >
                      {copiedId === 'modal-contact' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Suite */}
              <div className="grid grid-cols-2 gap-3">
                {/* Save Toggle */}
                <button
                  onClick={() => toggleSaveSaint(selectedRecord)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    savedSaints.some((s: any) => s.id === `registry-${selectedRecord.id}`)
                      ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Star className={`w-4 h-4 ${savedSaints.some((s: any) => s.id === `registry-${selectedRecord.id}`) ? 'fill-current' : ''}`} />
                  <span>
                    {savedSaints.some((s: any) => s.id === `registry-${selectedRecord.id}`) ? 'Favorited ✓' : 'Add Favorite'}
                  </span>
                </button>

                {/* Export ICS */}
                <button
                  onClick={() => exportToICS(selectedRecord)}
                  className="py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Export Calendar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR CODE SCANNER OVERLAY */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 border border-stone-200 shadow-2xl relative overflow-hidden flex flex-col gap-4"
            >
              <button 
                onClick={() => {
                  setShowScanner(false);
                  setScanResult(null);
                }}
                className="absolute right-4 top-4 p-1.5 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4 text-stone-600" />
              </button>

              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <QrCode className="w-5 h-5 text-orange-600 animate-pulse" />
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-lg">Contact QR Scanner</h3>
                  <p className="text-[10px] text-stone-500 font-medium">Scan and instantly import Monastic contact details</p>
                </div>
              </div>

              {/* Simulated Camera Target Frame */}
              <div className="relative bg-stone-950 aspect-video rounded-2xl border-2 border-dashed border-stone-700 overflow-hidden flex flex-col items-center justify-center text-center p-4">
                {/* Laser scan line sweep */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[bounce_2s_infinite]" />

                {isScanningSimulated ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-1" />
                    <span className="text-xs font-mono text-emerald-400 tracking-wider">ALIGNING & READING...</span>
                  </div>
                ) : scanResult ? (
                  <div className="flex flex-col items-center gap-1.5 text-emerald-400">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                      ✓
                    </div>
                    <span className="text-xs font-bold font-mono tracking-widest">DECODED SUCCESSFULLY!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-stone-500 z-0">
                    <QrCode className="w-12 h-12 stroke-[1.25] text-stone-600 animate-pulse mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Camera Viewfinder</span>
                    <span className="text-[10px] text-stone-500 max-w-[200px]">Center the monastic QR code inside this target screen</span>
                  </div>
                )}
              </div>

              {/* DEMO SCAN TRIGGER SECTION */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block mb-2">Simulated Scan Cards (Select to Scan)</span>
                <div className="flex flex-col gap-2">
                  {[
                    { id: "866", name: "Muni Jyotirmay Kumar", rank: "Scholar-Monk", dikshaDate: "VS 2075", currentLocation: "Adhyatma Sadhana Kendra, Delhi", contact: "9983478999" },
                    { id: "697", name: "Muni Udit Kumar Ji", rank: "Dedicated Ascetic", dikshaDate: "VS 2081", currentLocation: "Jaipur Centre", contact: "9950120242" },
                    { id: "bhawan-mumbai", name: "Mumbai Terapanth Bhawan", rank: "Spiritual Center", dikshaDate: "N/A", currentLocation: "Nandanvan, Walkeshwar, Mumbai", contact: "2223692003" }
                  ].map((demoCard) => (
                    <button
                      key={demoCard.id}
                      onClick={() => triggerSimulatedScan(demoCard)}
                      disabled={isScanningSimulated}
                      className="w-full text-left p-2.5 bg-white border border-stone-200 rounded-xl text-xs hover:border-orange-400 hover:bg-orange-50/25 transition-all flex items-center justify-between font-sans group cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-800 group-hover:text-orange-700 transition-colors">{demoCard.name}</span>
                        <span className="text-[10px] text-stone-500 font-medium">{demoCard.rank}</span>
                      </div>
                      <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Scan Card
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SCAN RESULT & IMPORT POPUP PANEL */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">New Contact Found!</span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-black text-stone-900 text-base">{scanResult.name}</h4>
                        <p className="text-xs text-stone-500 font-semibold">{scanResult.rank} • Vihar: {scanResult.currentLocation}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-700">{scanResult.contact}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-100/60">
                      <button
                        onClick={() => {
                          toggleSaveSaint(scanResult);
                          setShowScanner(false);
                          setScanResult(null);
                        }}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Save Contact</span>
                      </button>
                      <button
                        onClick={() => {
                          exportToICS(scanResult);
                        }}
                        className="py-2 px-3 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Export ICS</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
