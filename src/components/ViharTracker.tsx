import { useState, useEffect } from 'react';
import { chaturmasLocations2026 } from '../data/chaturmasLocations2026';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';

// --- Offline Map Caching Logic (IndexedDB) ---
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ViharMapTilesDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('tiles')) {
        db.createObjectStore('tiles', { keyPath: 'url' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const cacheTile = async (url: string, blob: Blob) => {
  try {
    const db = await initDB();
    const tx = db.transaction('tiles', 'readwrite');
    tx.objectStore('tiles').put({ url, blob });
  } catch (err) {
    console.error('Failed to cache map tile', err);
  }
};

const getCachedTile = async (url: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tiles', 'readonly');
      const request = tx.objectStore('tiles').get(url);
      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get cached tile', err);
    return null;
  }
};

// --- Static Historical Data for Recharts Map Visualizer ---
const ahimsaYatraData = [
  { year: 2015, location: 'Kathmandu', lat: 27.7, lng: 85.3 },
  { year: 2016, location: 'Siliguri', lat: 26.7, lng: 88.4 },
  { year: 2017, location: 'Kolkata', lat: 22.5, lng: 88.3 },
  { year: 2018, location: 'Chennai', lat: 13.0, lng: 80.2 },
  { year: 2019, location: 'Bengaluru', lat: 12.9, lng: 77.5 },
  { year: 2020, location: 'Hyderabad', lat: 17.3, lng: 78.4 },
  { year: 2021, location: 'New Delhi', lat: 28.6, lng: 77.2 },
  { year: 2022, location: 'Jaipur', lat: 26.9, lng: 75.7 },
  { year: 2023, location: 'Mumbai', lat: 19.0, lng: 72.8 },
  { year: 2024, location: 'Surat', lat: 21.1, lng: 72.8 },
  { year: 2025, location: 'Pune', lat: 18.5, lng: 73.8 },
  { year: 2026, location: 'Kelwa', lat: 25.1, lng: 73.8 },
  { year: 2027, location: 'Delhi', lat: 28.6, lng: 77.2 }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-900/30 text-sm">
        <p className="font-bold text-emerald-800">{data.year}</p>
        <p className="text-gray-700">{data.location}</p>
      </div>
    );
  }
  return null;
};

// --- Acharya Vihar Timeline Dataset ---
const acharyaViharTimeline = [
  {
    location: "लाडनूं, राजस्थान (Jain Vishva Bharati)",
    year: "2026 - वर्तमान चतुर्मास (Current Stay)",
    status: "Active",
    event: "धवल सेना सह चातुर्मास प्रवास। युगप्रधान आचार्यश्री के पावन सान्निध्य में संघ की विविध गतिविधियाँ और आध्यात्मिक संगोष्ठियों का आयोजन हो रहा है।",
    coordinates: "27.65° N, 74.39° E"
  },
  {
    location: "केलावा, राजस्थान (Kelwa Base)",
    year: "2026 (विहार प्रवास)",
    status: "Completed",
    event: "तेरापंथ धर्मसंघ के उद्गम स्थल केलवा में मर्यादा पत्र लेखन दिवस के अवसर पर ऐतिहासिक प्रवास एवं मर्यादा महोत्सव की पावन शुरुआत।",
    coordinates: "25.13° N, 73.81° E"
  },
  {
    location: "पुणे, महाराष्ट्र",
    year: "2025 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "पुणे महानगर में ऐतिहासिक चातुर्मास। आईटी प्रोफेशनल्स, युवाओं और व्यावसायिक वर्ग के लिए विशेष अणुव्रत आचार संहिता और नैतिक मूल्य प्रशिक्षण।",
    coordinates: "18.52° N, 73.85° E"
  },
  {
    location: "सूरत, गुजरात (Diamond Hub)",
    year: "2024 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "व्यापारिक नैतिकता और ईमानदारी के संकल्पों पर केंद्रित ऐतिहासिक चातुर्मास। सूरत के हीरा उद्योगपति एवं व्यवसायियों द्वारा व्यसन मुक्ति संकल्प।",
    coordinates: "21.17° N, 72.83° E"
  },
  {
    location: "मुम्बई, महाराष्ट्र (नंदनवन)",
    year: "2023 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "महानगर मुम्बई में विराट चातुर्मास। व्यसन मुक्ति अभियान, पर्यावरण चेतना और अहिंसा यात्रा के विशेष प्रवचनों से लाखों लोगों में वैचारिक शुद्धि का संचार।",
    coordinates: "19.07° N, 72.87° E"
  },
  {
    location: "जयपुर, राजस्थान (Royal City)",
    year: "2022 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "राजस्थान की राजधानी जयपुर में भव्य आध्यात्मिक प्रवास। अहिंसा यात्रा के समापन समारोह के साथ विराट धर्मसभा का भव्य आयोजन।",
    coordinates: "26.91° N, 75.78° E"
  },
  {
    location: "नई दिल्ली (अध्यात्म साधना केंद्र)",
    year: "2021 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "राष्ट्र की राजधानी दिल्ली में अहिंसा यात्रा सह चातुर्मास प्रवास। राष्ट्रपति, प्रधानमंत्री और संसद सदस्यों सहित उच्च गणमान्य जनों से भेंटवार्ता।",
    coordinates: "28.61° N, 77.20° E"
  },
  {
    location: "हैदराबाद, तेलंगाना",
    year: "2020 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "दक्षिण भारत की ऐतिहासिक विरासत वाले शहर हैदराबाद में महामारी काल के नियमों के तहत संयमित, ऑनलाइन एवं डिजिटल संप्रसारित प्रवचन माला।",
    coordinates: "17.38° N, 78.48° E"
  },
  {
    location: "बेंगलुरु, कर्नाटक (IT City)",
    year: "2019 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "आईटी हब बेंगलुरु में भव्य चातुर्मास। 'जीवन विज्ञान' एवं 'नैतिकता' का कॉरपोरेट जगत में समाकलन एवं युवाओं के लिए विशेष साधना शिविर।",
    coordinates: "12.97° N, 77.59° E"
  }
];

export default function ViharTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'monk' | 'nun'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'timeline'>('list');
  const [cachedMapUrl, setCachedMapUrl] = useState<string | null>(null);
  const [mapDomain, setMapDomain] = useState({ x: [70, 90], y: [10, 32] });

  const handleZoomCurrent = () => {
    // Zoom around Kelwa / Delhi (current active region)
    setMapDomain({ x: [71, 78], y: [24, 30] });
  };

  const handleZoomFull = () => {
    // Zoom out to full India path
    setMapDomain({ x: [70, 90], y: [10, 32] });
  };

  const masterPravasInfo = {
    date: "27 जून 2026",
    title: "दिल्ली एन.सी.आर. में विराजित चारित्रात्माएं",
    acharyashriLocation: "परम पूज्य युगप्रधान आचार्यश्री महाश्रमणजी अपनी धवलसेना के साथ जैन विश्व भारती लाडनूं (राजस्थान) में सानन्द सुखसातापूर्वक विराजमान हैं।",
    shivirOfficeContact: {
      name: "हेमन्त बैद",
      phone: "7044448888"
    },
    organization: "जैन श्वेताम्बर तेरापंथी सभा, दिल्ली",
    headquarters: "अणुव्रत भवन, 210 दीनदयाल उपाध्याय मार्ग, नई दिल्ली-110002",
    orgContacts: ["9868206966", "9911716974"]
  };

  useEffect(() => {
    // Fetch and cache a basic India bounds map for offline rendering
    const mapTileUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/India_location_map.svg/500px-India_location_map.svg.png';
    const initMapTile = async () => {
      const cachedBlob = await getCachedTile(mapTileUrl);
      if (cachedBlob) {
        setCachedMapUrl(URL.createObjectURL(cachedBlob));
      } else {
        try {
          const response = await fetch(mapTileUrl);
          const blob = await response.blob();
          await cacheTile(mapTileUrl, blob);
          setCachedMapUrl(URL.createObjectURL(blob));
        } catch (e) {
          console.error("Offline tile fetch failed, using fallback mode");
        }
      }
    };
    initMapTile();
  }, []);

  // 1. Filter and search logic
  const filteredAscetics = chaturmasLocations2026.filter((ascetic) => {
    // Search matching (name, location or address)
    const matchesSearch = 
      ascetic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ascetic.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ascetic.address.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter matching
    if (activeFilter === 'monk') {
      return matchesSearch && (ascetic.name.includes('मुनि') || ascetic.name.includes('मुनिश्री'));
    }
    if (activeFilter === 'nun') {
      return matchesSearch && (ascetic.name.includes('साध्वी') || ascetic.name.includes('साध्वीश्री'));
    }
    return matchesSearch;
  });

  // Open location directly on Google Maps
  const openInGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div id="vihar_tracker_viewport" className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
      
      {/* 1. TOP HEADER INFOBAR */}
      <div id="vihar_header_container" className="bg-white dark:bg-zinc-900 p-4 shadow-sm border-b dark:border-zinc-800 shrink-0">
        <div id="vihar_header_row" className="flex justify-between items-center mb-1">
          <h2 id="vihar_header_title" className="text-lg sm:text-xl font-black text-gray-800 flex items-center gap-2">
            <span>🗺️</span> {masterPravasInfo.title || "दिल्ली-NCR प्रवास बोर्ड"}
          </h2>
          <span id="vihar_update_badge" className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
            {masterPravasInfo.date} अपडेट
          </span>
        </div>
        <p id="vihar_acharyashri_location_text" className="text-xs text-amber-600 font-semibold leading-normal mb-2">
          📢 {masterPravasInfo.acharyashriLocation}
        </p>
        
        {/* 🏢 Organization & Contacts info box */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1 text-[11px] text-gray-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-extrabold text-gray-700">🏛️ {masterPravasInfo.organization}</span>
            <span className="text-gray-400 select-all font-medium sm:text-right">मुख्यालय: {masterPravasInfo.headquarters}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
            <span className="font-bold text-gray-650">📞 सभा संपर्क:</span>
            {masterPravasInfo.orgContacts.map((phone, idx) => (
              <a key={phone} href={`tel:${phone}`} className="text-emerald-600 hover:underline font-mono font-black select-all">
                {phone}{idx < masterPravasInfo.orgContacts.length - 1 ? "," : ""}
              </a>
            ))}
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="font-bold text-gray-650">शिविर प्रभारी:</span>
            <a href={`tel:${masterPravasInfo.shivirOfficeContact.phone}`} className="text-emerald-600 hover:underline font-mono font-black">
              {masterPravasInfo.shivirOfficeContact.name} ({masterPravasInfo.shivirOfficeContact.phone})
            </a>
          </div>
        </div>
      </div>

      {/* 2. LIVE SEARCH & FILTER CONTROLS */}
      <div id="vihar_controls_container" className="bg-white p-3 border-b shrink-0 space-y-3 z-10 shadow-sm">
        {/* Search Bar */}
        <div id="vihar_search_wrapper" className="relative">
          <input
            id="vihar_search_input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="संत का नाम या क्षेत्र खोजें (जैसे: उदित कुमार, रोहिणी)..."
            className="w-full p-3 pl-10 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <span id="vihar_search_icon_marker" className="absolute left-3 top-3.5 text-gray-400 text-sm">🔍</span>
          {searchQuery && (
            <button 
              id="vihar_search_clear_btn"
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div id="vihar_filter_tabs_row" className="flex gap-2">
          <button
            id="vihar_filter_btn_all"
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            सभी ({chaturmasLocations2026.length})
          </button>
          <button
            id="vihar_filter_btn_monks"
            onClick={() => setActiveFilter('monk')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeFilter === 'monk' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            मुनिश्री
          </button>
          <button
            id="vihar_filter_btn_nuns"
            onClick={() => setActiveFilter('nun')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeFilter === 'nun' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            साध्वीश्री
          </button>
        </div>
        {/* View Mode Toggle */}
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
              viewMode === 'list' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📋 दिल्ली सूची
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
              viewMode === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🗺️ यात्रा नक़्शा
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
              viewMode === 'timeline' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📈 आचार्यश्री विहार
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main id="vihar_scroll_list_main" className="flex-1 overflow-y-auto bg-gray-50 relative pb-28">
        {viewMode === 'map' ? (
          <div className="w-full h-full p-4 flex flex-col relative">
            <h3 className="font-bold text-gray-800 mb-2">Ahimsa Yatra Historical Path (2015-2027)</h3>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
              {/* Render Offline Map Background if cached */}
              {cachedMapUrl && (
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `url(${cachedMapUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}
              
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" dataKey="lng" name="Longitude" domain={mapDomain.x} hide />
                  <YAxis type="number" dataKey="lat" name="Latitude" domain={mapDomain.y} hide />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter 
                    name="Path" 
                    data={ahimsaYatraData} 
                    line={{stroke: '#10b981', strokeWidth: 2}} 
                    shape="circle" 
                    fill="#047857"
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  >
                    <LabelList dataKey="location" position="top" style={{fontSize: '11px', fill: '#374151', fontWeight: 'bold'}} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={handleZoomCurrent}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  📍 Zoom to Current
                </button>
                <button
                  onClick={handleZoomFull}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  🗺️ Zoom to Full Path
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Note: Offline map tiles are automatically cached via IndexedDB.
            </p>
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="p-4 space-y-4">
            {/* Acharya Timeline Header Card */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-serif">ॐ</div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md"> Barefoot Journey (अहिंसा यात्रा) </span>
              <h3 className="font-serif text-xl font-extrabold mt-1.5">आचार्यश्री महाश्रमणजी विहार पथ</h3>
              <p className="text-xs opacity-90 mt-1 leading-normal">
                परम पूज्य आचार्यश्री द्वारा अहिंसा, नैतिकता और नशामुक्ति के दिव्य संदेश के साथ की गई 50,000+ कि.मी. की पावन पदयात्रा एवं उसके उपरान्त के प्रवास स्थलों का प्रामाणिक विवरण।
              </p>
            </div>

            {/* Vertical Step Timeline Container */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs relative">
              <div className="absolute left-[29px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-stone-250"></div>

              <div className="space-y-6 relative">
                {acharyaViharTimeline.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start relative">
                    {/* Circle Indicator */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        step.status === 'Active'
                          ? 'bg-orange-500 text-white animate-pulse ring-4 ring-orange-100'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 bg-stone-50/50 hover:bg-stone-50/80 transition-colors p-4 rounded-xl border border-stone-100">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-extrabold text-stone-500 uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded">
                          {step.year}
                        </span>
                        {step.status === 'Active' && (
                          <span className="text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.2 rounded-md uppercase tracking-wider animate-pulse shrink-0">
                            CURRENT STAY
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-stone-900 leading-snug">
                        {step.location}
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed mt-1.5">
                        {step.event}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                        <span>🗺️ Coordinates: {step.coordinates}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredAscetics.length > 0 ? (
              filteredAscetics.map((ascetic) => (
            <div 
              id={`ascetic_card_${ascetic.id}`}
              key={ascetic.id} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Status Ribbon if medically applicable or special */}
              {ascetic.status && ascetic.status.includes('स्वास्थ्य') && (
                <div 
                  id={`ascetic_status_ribbon_${ascetic.id}`}
                  className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-sm"
                >
                  ❤️ {ascetic.status}
                </div>
              )}

              <div>
                <div id={`ascetic_thana_heading_${ascetic.id}`} className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${ascetic.status && ascetic.status.includes('स्वास्थ्य') ? 'bg-amber-550' : 'bg-green-500'}`}></span>
                  <span className="text-xs text-gray-400 font-bold">ठाणा: {ascetic.thana}</span>
                </div>

                <h3 id={`ascetic_name_title_${ascetic.id}`} className="text-lg font-black text-gray-800">
                  {ascetic.title && (
                    <span className="text-emerald-600 text-xs font-bold block mb-0.5">{ascetic.title}</span>
                  )}
                  {ascetic.name}
                </h3>

                <div id={`ascetic_info_grid_${ascetic.id}`} className="mt-3 space-y-2 text-sm text-gray-600">
                  <p className="flex items-start gap-2 font-bold text-gray-800">
                    <span className="shrink-0 text-base">🏢</span>
                    <span>{ascetic.location}</span>
                  </p>
                  <p className="flex items-start gap-2 text-xs text-gray-500 leading-normal">
                    <span className="shrink-0 text-[14px]">📍</span>
                    <span>{ascetic.address}</span>
                  </p>
                  <p className="flex items-start gap-2 text-xs text-gray-500">
                    <span className="shrink-0 text-[14px]">📞</span>
                    <span className="select-all font-mono">सेवादार नंबर: {ascetic.contacts}</span>
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div id={`ascetic_action_buttons_${ascetic.id}`} className="mt-5 pt-3 border-t border-gray-100 flex gap-2">
                <button 
                  id={`ascetic_maps_nav_btn_${ascetic.id}`}
                  onClick={() => openInGoogleMaps(`${ascetic.location}, ${ascetic.address}`)}
                  className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  📍 मैप पर देखें
                </button>
                {ascetic.contacts && (
                  <a 
                    id={`ascetic_call_driver_btn_${ascetic.id}`}
                    href={`tel:${ascetic.contacts.match(/\d+/)?.[0] || ''}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-colors px-4 cursor-pointer"
                  >
                    📞 कॉल संपर्क
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div id="no_ascetic_results_alert" className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
            ☀️ इस खोज के अनुकूल कोई चारित्रात्मा नहीं मिली।
          </div>
        )}
        </div>
        )}
      </main>

    </div>
  );
}
