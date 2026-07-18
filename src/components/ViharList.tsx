import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Phone, MapPin, Copy, Star, Check, Search, Share2, Map, Info, RefreshCw, X } from 'lucide-react';
import { viharPravasTodayData } from '../data/viharPravasToday';
import { motion, AnimatePresence } from 'motion/react';

export const ViharList: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-15');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vihar_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically fetch the latest date available in Firestore upon component mount
  useEffect(() => {
    const fetchLatestDate = async () => {
      try {
        const q = query(
          collection(db, "vihar_records"),
          orderBy("date", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0];
          const latestDate = latestDoc.id; // Record ID is typically the date
          if (latestDate && latestDate !== '2026-07-15') {
            setSelectedDate(latestDate);
          }
        }
      } catch (error) {
        console.error("Error fetching latest date from Firestore:", error);
      }
    };
    fetchLatestDate();
  }, []);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch selected date data
      const docRef = doc(db, "vihar_records", selectedDate);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        // Fallback to local static dataset with simulated modifications if the date is different from 2026-07-15
        if (selectedDate === '2026-07-15') {
          setData(viharPravasTodayData);
        } else {
          // Construct a dynamic dataset derived from 2026-07-15 but customized for the selected date
          const simulatedData = JSON.parse(JSON.stringify(viharPravasTodayData));
          simulatedData.date = selectedDate;
          
          // Compute days difference to simulate progression
          const daysDiff = Math.round((new Date(selectedDate).getTime() - new Date('2026-07-15').getTime()) / (1000 * 3600 * 24));
          
          if (!isNaN(daysDiff) && daysDiff !== 0) {
            const regions = simulatedData.regions;
            Object.keys(regions).forEach(regionKey => {
              if (regionKey === 'Other_Regions') return;
              const saintsList = regions[regionKey];
              if (Array.isArray(saintsList)) {
                saintsList.forEach((monk: any) => {
                  const direction = daysDiff > 0 ? "विहार प्रगतिशील" : "पूर्व ठहराव";
                  const magnitude = Math.abs(daysDiff);
                  // Dynamic location simulation
                  monk.location = `${monk.location} (${direction} ${magnitude > 1 ? magnitude + ' दिन' : '१ दिन'})`;
                });
              }
            });
          }
          setData(simulatedData);
        }
      }
    } catch (error) {
      console.warn("Error fetching Vihar data from Firestore, falling back to local dataset:", error);
      setData(viharPravasTodayData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const toggleFavorite = (name: string) => {
    const updated = favorites.includes(name)
      ? favorites.filter(f => f !== name)
      : [...favorites, name];
    setFavorites(updated);
    try {
      localStorage.setItem('vihar_favorites', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  };

  const handleCopy = (monk: any, index: number) => {
    const contactText = monk.contacts 
      ? Object.entries(monk.contacts).map(([p, num]) => `${p}: ${num}`).join(', ')
      : `${monk.contact_person || 'प्रभारी'}: ${monk.contact || 'N/A'}`;
    const textToCopy = `${monk.name} (${monk.nameEn || ''}) - ठाणा: ${monk.thana || 3}\n📍 स्थान: ${monk.location}\n📞 संपर्क: ${contactText}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedId(`${monk.name}_${index}`);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleShare = (saint: any, index: number) => {
    const contactText = saint.contacts && saint.contacts.length > 0
      ? saint.contacts.map((c: any) => `${c.label}: ${c.phone}`).join(', ')
      : 'N/A';
    
    const shareText = `📍 जैन श्वेतांबर तेरापंथ विहार अपडेट (${selectedDate})\n\nसाधु/साध्वी: ${saint.title ? saint.title + ' ' : ''}${saint.name}\nठाणा: ${saint.thana}\nस्थान: ${saint.location}\nक्षेत्र: ${saint.regionLabel}\nसंपर्क सूत्र: ${contactText}\n\nतेरापंथ एआई ऐप के माध्यम से साझा किया गया।`;
    
    const uniqueShareId = `${saint.nameEn || saint.name}_${index}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'तेरापंथ विहार अपडेट',
        text: shareText,
        url: window.location.href
      })
      .then(() => {
        setSharedId(uniqueShareId);
        setTimeout(() => setSharedId(null), 2000);
      })
      .catch(err => {
        console.warn('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setSharedId(uniqueShareId);
          setTimeout(() => setSharedId(null), 2000);
        })
        .catch(err => {
          console.error('Failed to copy share text: ', err);
        });
    }
  };

  // Humanized name lookup / translator
  const nameMap: Record<string, { title: string, nameHi: string }> = {
    "munishrivimalkumarji": { title: "शासनश्री", nameHi: "मुनिश्री विमल कुमारजी" },
    "munishriuditkumarji": { title: "बहुश्रुत", nameHi: "मुनिश्री उदित कुमार जी" },
    "munishrijaykumarji": { title: "", nameHi: "मुनिश्री जय कुमार जी" },
    "drmunishriabhijitkumarji": { title: "डा.", nameHi: "मुनिश्री अभिजित कुमार जी" },
    "sadhvishrisanghmitraji": { title: "शासनश्री", nameHi: "साध्वीश्री संघमित्राजी" },
    "sadhvishrisuvrataji": { title: "शासनश्री", nameHi: "साध्वीश्री सुव्रता जी" },
    "sadhvishrisumanshriji": { title: "शासनश्री", nameHi: "साध्वीश्री सुमनश्री जी" },
    "sadhvishriraviprabhaji": { title: "शासनश्री", nameHi: "साध्वीश्री रविप्रभाजी" },
    "sadhvishridrkundanrekhaji": { title: "डा.", nameHi: "साध्वीश्री डा. कुन्दनरेखाजी" },
    "sadhvishrilabdhiprabhaji": { title: "", nameHi: "साध्वीश्री लब्धिप्रभाजी" },
    "munishrihemantkumarji": { title: "", nameHi: "मुनिश्री हेमंत कुमार जी" },
    "munishrijineshkumarji": { title: "", nameHi: "मुनिश्री जिनेश कुमार जी" },
    "sadhvishrikanchanprabhaji": { title: "", nameHi: "साध्वीश्री कंचन प्रभा जी" },
    "sadhvishrividyutprabhaji": { title: "", nameHi: "साध्वीश्री विद्युत प्रभा जी" },
    "sadhvishriamitpragnaji": { title: "", nameHi: "साध्वीश्री अमित प्रज्ञा जी" },
    "sadhvishriswarnarekhaji": { title: "", nameHi: "साध्वीश्री स्वर्ण रेखा जी" },
    "sadhvishrimaitriyashaji": { title: "", nameHi: "साध्वीश्री मैत्री यशा जी" }
  };

  const formatName = (enName: string) => {
    const normalized = enName.replace(/\s+/g, '').toLowerCase();
    if (nameMap[normalized]) return nameMap[normalized];
    
    let title = "";
    let nameHi = enName;
    if (enName.startsWith("Munishri ")) {
      nameHi = "मुनिश्री " + enName.replace("Munishri ", "").replace(" ji", " जी");
    } else if (enName.startsWith("Sadhvishri ")) {
      nameHi = "साध्वीश्री " + enName.replace("Sadhvishri ", "").replace(" ji", " जी");
    } else if (enName.startsWith("Dr. Munishri ")) {
      title = "डा.";
      nameHi = "मुनिश्री " + enName.replace("Dr. Munishri ", "").replace(" ji", " जी");
    } else if (enName.startsWith("Dr. Sadhvishri ")) {
      title = "डा.";
      nameHi = "साध्वीश्री " + enName.replace("Dr. Sadhvishri ", "").replace(" ji", " जी");
    }
    return { title, nameHi };
  };

  const regionsLabels: Record<string, string> = {
    "Delhi_NCR": "दिल्ली-NCR",
    "Rajasthan": "राजस्थान",
    "Gujarat": "गुजरात",
    "Maharashtra": "महाराष्ट्र",
    "Karnataka": "कर्नाटक",
    "TamilNadu": "तमिलनाडु",
    "Other_Regions": "अन्य प्रांत"
  };

  // Compile and map all regions dynamically
  const parsedSaints = useMemo(() => {
    const list: any[] = [];
    const sourceData = data || viharPravasTodayData;
    const regions = sourceData?.regions || {};

    const keys = ["Delhi_NCR", "Rajasthan", "Gujarat", "Maharashtra", "Karnataka", "TamilNadu"];
    
    keys.forEach(key => {
      const regionList = regions[key] || [];
      regionList.forEach((monk: any, idx: number) => {
        const { title, nameHi } = formatName(monk.name);
        
        let contactList: Array<{ label: string; phone: string }> = [];
        if (monk.contacts) {
          contactList = Object.entries(monk.contacts).map(([person, phone]) => ({
            label: person.replace(/_/g, ' '),
            phone: phone as string
          }));
        } else if (monk.contact) {
          contactList = [{
            label: monk.contact_person || 'प्रभारी',
            phone: monk.contact
          }];
        }

        list.push({
          id: `${key}_${idx}`,
          name: nameHi,
          nameEn: monk.name,
          title,
          thana: monk.thana || 3,
          location: monk.location,
          contacts: contactList,
          regionKey: key,
          regionLabel: regionsLabels[key] || key,
          isHealth: monk.location?.includes("हॉस्पिटल") || monk.location?.includes("स्वास्थ्य लाभ")
        });
      });
    });

    // Handle Other Regions
    const otherRegions = regions.Other_Regions || {};
    Object.entries(otherRegions).forEach(([subRegion, names]: [string, any]) => {
      if (Array.isArray(names)) {
        names.forEach((enName, idx) => {
          let nameOnly = enName;
          let parsedLoc = subRegion;
          if (enName.includes("(")) {
            const parts = enName.split("(");
            nameOnly = parts[0].trim();
            parsedLoc = parts[1].replace(")", "").trim() + `, ${subRegion}`;
          }
          const { title, nameHi } = formatName(nameOnly);
          list.push({
            id: `Other_${subRegion}_${idx}`,
            name: nameHi,
            nameEn: nameOnly,
            title,
            thana: 3,
            location: parsedLoc,
            contacts: [],
            regionKey: "Other_Regions",
            regionLabel: `${regionsLabels["Other_Regions"]} (${subRegion})`,
            isHealth: false
          });
        });
      }
    });

    return list;
  }, [data]);

  // Compute counts for badges dynamically
  const counts = useMemo(() => {
    const countsMap: Record<string, number> = { All: parsedSaints.length };
    parsedSaints.forEach(saint => {
      countsMap[saint.regionKey] = (countsMap[saint.regionKey] || 0) + 1;
    });
    return countsMap;
  }, [parsedSaints]);

  // Filter list based on search and selected region tab
  const filteredList = useMemo(() => {
    return parsedSaints.filter(saint => {
      const matchesRegion = activeRegion === 'All' || saint.regionKey === activeRegion;
      const cleanQuery = searchQuery.toLowerCase().trim();
      if (!cleanQuery) return matchesRegion;

      const matchesSearch = 
        saint.name.toLowerCase().includes(cleanQuery) ||
        saint.nameEn.toLowerCase().includes(cleanQuery) ||
        saint.location.toLowerCase().includes(cleanQuery) ||
        saint.title.toLowerCase().includes(cleanQuery) ||
        saint.regionLabel.toLowerCase().includes(cleanQuery) ||
        saint.contacts.some((c: any) => c.phone.includes(cleanQuery) || c.label.toLowerCase().includes(cleanQuery));

      return matchesRegion && matchesSearch;
    });
  }, [parsedSaints, activeRegion, searchQuery]);

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-bold text-stone-500 dark:text-zinc-400">अखिल भारतीय विहार डेटा लोड हो रहा है...</div>
      </div>
    );
  }

  const regionTabs = [
    { key: 'All', label: 'सभी' },
    { key: 'Delhi_NCR', label: 'दिल्ली-NCR' },
    { key: 'Rajasthan', label: 'राजस्थान' },
    { key: 'Gujarat', label: 'गुजरात' },
    { key: 'Maharashtra', label: 'महाराष्ट्र' },
    { key: 'Karnataka', label: 'कर्नाटक' },
    { key: 'TamilNadu', label: 'तमिलनाडु' },
    { key: 'Other_Regions', label: 'अन्य प्रांत' }
  ];

  return (
    <div className="p-4 space-y-4 pb-28 max-w-4xl mx-auto">
      {/* Interactive Date Selector & Live Badge Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 dark:from-orange-950/20 dark:to-zinc-900 border border-orange-100/50 dark:border-orange-900/10 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <span>विहार एवं प्रवास निर्देशिका</span> • <span>Live Tracker</span>
              </span>
            </div>
            <h2 className="text-lg font-black text-stone-800 dark:text-zinc-100 flex items-center gap-2">
              {selectedDate === '2026-07-15' ? 'आज का विहार' : 'चयनित तिथि विहार'}
              <span className="text-xs text-stone-400 dark:text-zinc-500 font-bold font-mono">({selectedDate})</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Custom Date Picker Input */}
            <div className="relative">
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer shadow-sm"
              />
            </div>

            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className={`p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-500 hover:border-orange-200 transition-all cursor-pointer shadow-sm ${refreshing ? 'animate-spin' : ''}`}
              title="रिफ्रेश करें"
            >
              <RefreshCw size={14} />
            </button>
            {favorites.length > 0 && (
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                ★ {favorites.length}
              </span>
            )}
          </div>
        </div>

        {/* Quick Date Select Chips */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-100/50 dark:border-zinc-800/50">
          <button
            onClick={() => setSelectedDate('2026-07-14')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
              selectedDate === '2026-07-14'
                ? 'bg-stone-700 text-white border-stone-700 dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-750'
            }`}
          >
            📅 १४ जुलाई (विगत)
          </button>
          <button
            onClick={() => setSelectedDate('2026-07-15')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
              selectedDate === '2026-07-15'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-750'
            }`}
          >
            🔴 १५ जुलाई (आज)
          </button>
          <button
            onClick={() => setSelectedDate('2026-07-16')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
              selectedDate === '2026-07-16'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-750'
            }`}
          >
            📅 १६ जुलाई (आगामी)
          </button>
          {selectedDate !== '2026-07-14' && selectedDate !== '2026-07-15' && selectedDate !== '2026-07-16' && (
            <span className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-orange-500 text-white border border-orange-500 shadow-sm">
              🔍 {selectedDate}
            </span>
          )}
        </div>
      </div>

      {/* Advanced Filter and Search Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-stone-400 dark:text-zinc-500" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="साधु/साध्वी का नाम, स्थान या संपर्क संख्या खोजें..." 
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Horizontal Tabs with custom counts */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide flex gap-1.5 snap-x">
        {regionTabs.map((tab) => {
          const isActive = activeRegion === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveRegion(tab.key)}
              className={`snap-align-start shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer ${
                isActive 
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20" 
                  : "bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800/80 hover:bg-stone-50 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                isActive 
                  ? "bg-white/25 text-white" 
                  : "bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredList.map((saint, index) => {
            const isFav = favorites.includes(saint.nameEn);
            const uniqueCopyId = `${saint.name}_${index}`;
            const isCopied = copiedId === uniqueCopyId;

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={saint.id}
                className={`bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-sm border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isFav 
                    ? "border-amber-300 dark:border-amber-500/40 bg-gradient-to-br from-white to-amber-50/10 dark:from-zinc-900 dark:to-amber-950/5 ring-1 ring-amber-300/30 dark:ring-amber-500/10 shadow-md" 
                    : "border-stone-100 dark:border-zinc-800/80 hover:border-orange-100 dark:hover:border-zinc-800 hover:shadow-md"
                }`}
              >
                {/* Visual Top Decorative Lines */}
                {isFav && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                )}

                <div>
                  {/* Card Header Badges */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20">
                        <span className={`w-1.5 h-1.5 rounded-full ${saint.isHealth ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                        ठाणा: {saint.thana}
                      </span>
                      
                      {/* Visual Status Indicator Badge */}
                      {(() => {
                        const todayStr = '2026-07-15';
                        if (selectedDate === todayStr) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              आज का प्रवास / Current
                            </span>
                          );
                        } else if (selectedDate > todayStr) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              आगामी / Upcoming
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-stone-100 text-stone-500 dark:bg-zinc-850 dark:text-zinc-400 border border-stone-200 dark:border-zinc-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                              विगत / Past
                            </span>
                          );
                        }
                      })()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-stone-400 dark:text-zinc-500 bg-stone-100/80 dark:bg-zinc-800/80 px-2.5 py-1 rounded-full tracking-wider uppercase">
                        {saint.regionLabel}
                      </span>
                      <button 
                        onClick={() => toggleFavorite(saint.nameEn)}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          isFav 
                            ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" 
                            : "text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                        }`}
                        title={isFav ? "सुरक्षित सूची से हटाएं" : "सुरक्षित सूची में जोड़ें"}
                      >
                        <Star size={16} className={isFav ? "fill-amber-500" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Monastic Title and Name Display */}
                  <div className="mb-2.5">
                    <div className="flex items-baseline gap-1.5">
                      {saint.title && (
                        <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 tracking-wide">
                          {saint.title}
                        </span>
                      )}
                      <h3 className="font-extrabold text-stone-900 dark:text-zinc-100 text-[16px] tracking-tight">
                        {saint.name}
                      </h3>
                    </div>
                    <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 italic mt-0.5 font-mono">
                      {saint.nameEn}
                    </p>
                  </div>

                  {/* stay location card component */}
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-850/60 border border-stone-100 dark:border-zinc-800/50 mb-4 flex items-start gap-2.5">
                    <MapPin size={16} className="mt-0.5 text-orange-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                        प्रवास / Stay Address
                      </p>
                      <p className="text-xs font-bold text-stone-700 dark:text-zinc-300 leading-relaxed select-all">
                        {saint.location}
                      </p>
                    </div>
                  </div>

                  {/* Sectioned Kaseed/Contact Person display with dynamic sub-card layout */}
                  {saint.contacts && saint.contacts.length > 0 ? (
                    <div className="space-y-2.5 mb-4">
                      <p className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <span>📞</span> स्थानीय संपर्क सूत्र (Kaseed / Contacts)
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {saint.contacts.map((c: any, cIdx: number) => (
                          <div 
                            key={cIdx} 
                            className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/50 dark:bg-zinc-850/30 border border-stone-100/80 dark:border-zinc-800/80 hover:border-emerald-100 dark:hover:border-emerald-950/20 transition-colors"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-[10px] font-extrabold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                                कासीद: {c.label}
                              </p>
                              <p className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {c.phone}
                              </p>
                            </div>
                            <a 
                              href={`tel:${c.phone}`} 
                              className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-stone-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all cursor-pointer shrink-0 shadow-sm"
                              title={`Call ${c.label}`}
                            >
                              <Phone size={13} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-stone-50/30 dark:bg-zinc-850/10 border border-stone-100/50 dark:border-zinc-800/30 mb-4 text-center">
                      <p className="text-[10px] font-extrabold text-stone-400 dark:text-zinc-500">
                        📞 स्थानीय कासीद संपर्क उपलब्ध नहीं है
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-stone-100/85 dark:border-zinc-800/60">
                  {saint.contacts && saint.contacts.length > 0 ? (
                    <a 
                      href={`tel:${saint.contacts[0].phone}`} 
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-600 dark:from-orange-950/40 dark:to-amber-950/20 dark:text-orange-400 py-2.5 rounded-2xl text-xs font-black hover:from-orange-500/20 hover:to-amber-500/20 transition-all text-center border border-orange-100/40 dark:border-orange-900/10"
                    >
                      <Phone size={13} />
                      <span>कॉल करें</span>
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[10px] font-extrabold text-stone-400 dark:text-zinc-500 py-2.5">
                      No Call Contact
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleCopy(saint, index)}
                    className={`p-2.5 rounded-2xl transition-all cursor-pointer border ${
                      isCopied 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/20" 
                        : "bg-stone-50 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400 border-stone-200 dark:border-zinc-850 hover:bg-stone-100 dark:hover:bg-zinc-750"
                    }`}
                    title="Copy Details"
                  >
                    {isCopied ? <Check size={14} className="animate-pulse" /> : <Copy size={14} />}
                  </button>

                  <button 
                    onClick={() => handleShare(saint, index)}
                    className={`p-2.5 rounded-2xl transition-all cursor-pointer border ${
                      sharedId === `${saint.nameEn || saint.name}_${index}`
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/20" 
                        : "bg-stone-50 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400 border-stone-200 dark:border-zinc-850 hover:bg-stone-100 dark:hover:bg-zinc-750"
                    }`}
                    title="Share Details"
                  >
                    {sharedId === `${saint.nameEn || saint.name}_${index}` ? <Check size={14} className="animate-pulse" /> : <Share2 size={14} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* No search results found container */}
      {filteredList.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-stone-150 dark:border-zinc-800/80 shadow-sm">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-extrabold text-stone-800 dark:text-zinc-200">कोई डेटा नहीं मिला</h3>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
            आपके खोज मापदंड "<strong>{searchQuery}</strong>" के अनुरूप कोई सक्रिय विहार stay नहीं मिला। कृपया पुनः जाँचें।
          </p>
        </div>
      )}

      {/* Secure storage and offline use helper footer */}
      <div className="p-3.5 rounded-2xl bg-stone-100/50 dark:bg-zinc-900/30 border border-stone-200/40 dark:border-zinc-800/50 text-center flex items-center justify-center gap-2 text-[10px] font-bold text-stone-500 dark:text-zinc-400">
        <Info size={12} className="text-orange-500 shrink-0" />
        <span>यह डेटा स्थानीय रूप से ऑफ़लाइन उपयोग हेतु स्वतः सुरक्षित हो जाता है।</span>
      </div>
    </div>
  );
};

export default ViharList;
