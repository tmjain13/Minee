import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Building2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chaturmasMasterRegistry } from '../data/chaturmasList';
import { MANTRI_MUNI_DATABASE } from '../data/mantriMuniDatabase';

interface ChaturmasRegistryProps {
  onClose: () => void;
}

const ChaturmasRegistry: React.FC<ChaturmasRegistryProps> = ({ onClose }) => {
  const [registryMode, setRegistryMode] = useState<'acharyas' | 'sumermal'>('acharyas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAcharya, setSelectedAcharya] = useState<number | 'all'>('all');
  const [selectedEra, setSelectedEra] = useState<string | 'all'>('all');
  const [startYear, setStartYear] = useState<number>(1760);
  const [endYear, setEndYear] = useState<number>(2026);

  const handleModeChange = (mode: 'acharyas' | 'sumermal') => {
    setRegistryMode(mode);
    setSearchQuery('');
    setSelectedEra('all');
    setSelectedAcharya('all');
    if (mode === 'sumermal') {
      setStartYear(1942);
      setEndYear(2018);
    } else {
      setStartYear(1760);
      setEndYear(2026);
    }
  };

  const filteredData = useMemo(() => {
    if (registryMode !== 'acharyas') return [];
    return chaturmasMasterRegistry.filter(entry => {
      const year = typeof entry.ceYear === 'string' ? parseInt(entry.ceYear.split('-')[0]) : entry.ceYear;
      const matchesYearRange = year >= startYear && year <= endYear;
      const matchesSearch = entry.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            entry.ceYear.toString().includes(searchQuery.toLowerCase()) || 
                            entry.acharyaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAcharya = selectedAcharya === 'all' || entry.acharyaId === selectedAcharya;
      return matchesSearch && matchesAcharya && matchesYearRange;
    });
  }, [registryMode, searchQuery, selectedAcharya, startYear, endYear]);

  const filteredSumermalData = useMemo(() => {
    if (registryMode !== 'sumermal') return [];
    return MANTRI_MUNI_DATABASE.filter(entry => {
      const year = parseInt(entry.year);
      const matchesYearRange = year >= startYear && year <= endYear;
      const matchesSearch = entry.chaturmas_kshetra.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            entry.year.toString().includes(searchQuery.toLowerCase()) || 
                            entry.samvat.toString().includes(searchQuery.toLowerCase()) ||
                            entry.companions_and_sanidhya.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            entry.historical_significance.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            entry.era_status.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEra = selectedEra === 'all' || entry.era_status === selectedEra;
      return matchesSearch && matchesEra && matchesYearRange;
    });
  }, [registryMode, searchQuery, selectedEra, startYear, endYear]);

  const uniqueAcharyas = useMemo(() => {
    const list = Array.from(new Set(chaturmasMasterRegistry.map(item => item.acharyaName)));
    return list.map(name => chaturmasMasterRegistry.find(item => item.acharyaName === name)!).filter(Boolean);
  }, []);

  const minVal = registryMode === 'sumermal' ? 1942 : 1760;
  const maxVal = registryMode === 'sumermal' ? 2018 : 2030;

  const ERAS = [
    { id: 'all', label: 'All Eras (77)' },
    { id: 'सामान्य मुनि अवस्था', label: 'सामान्य मुनि (11)' },
    { id: 'अग्रणी अवस्था', label: 'अग्रणी अवस्था (58)' },
    { id: 'मंत्रीमुनि के रूप में', label: 'मंत्रीमुनि पद (8)' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[10000] flex flex-col bg-[var(--bg-cream)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[var(--bg-cream)] border-b border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col">
          <h2 className="serif-text font-bold text-lg text-spiritual">Chaturmas Timeline Registry</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {registryMode === 'acharyas' ? '266 Years of Migration (1760-2026+)' : 'Verified Chronicle of Late Mantri Muni Sri Sumermal Ji'}
          </span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Mode Selector Tab */}
      <div className="flex bg-[var(--bg-cream)] p-1.5 border-b border-black/5 dark:border-white/5 gap-1.5 shrink-0">
        <button
          onClick={() => handleModeChange('acharyas')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest text-center transition-all ${
            registryMode === 'acharyas' 
              ? 'bg-spiritual text-[var(--bg-cream)] shadow-md rounded-2xl' 
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/5'
          }`}
        >
          📿 Acharyas (1760-2026+)
        </button>
        <button
          onClick={() => handleModeChange('sumermal')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest text-center transition-all ${
            registryMode === 'sumermal' 
              ? 'bg-spiritual text-[var(--bg-cream)] shadow-md rounded-2xl' 
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/5'
          }`}
        >
          📜 Mantri Muni Sumermal Ji (77)
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3 bg-[var(--bg-cream)] border-b border-black/5 dark:border-white/5 shadow-sm relative z-10 shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={registryMode === 'acharyas' ? "Search by city, state or year (e.g., Ladnun, 2026)..." : "Search Ladnun, Gangashahar, or companions..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-spiritual transition-colors shadow-inner"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Timeline Filter</span>
              <span className="text-[14px] font-black text-spiritual">{startYear} — {endYear}</span>
            </div>
            <div className="flex gap-2">
               <button 
                 onClick={() => { setStartYear(minVal); setEndYear(maxVal); }}
                 className="text-[8px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
               >
                 Reset
               </button>
               {registryMode === 'acharyas' && (
                 <button 
                  onClick={() => { setStartYear(1936); setEndYear(2010); }}
                  className="text-[8px] font-bold uppercase tracking-widest bg-spiritual/10 text-spiritual px-2 py-1 rounded-md hover:bg-spiritual/20 transition-colors"
                 >
                   Modern Era (9-10)
                 </button>
               )}
            </div>
          </div>
          <div className="space-y-6 px-1 py-2">
            <div className="relative h-2 bg-gray-100 dark:bg-white/5 rounded-full">
              <div 
                className="absolute h-full bg-spiritual rounded-full"
                style={{ 
                  left: `${((startYear - minVal) / (maxVal - minVal)) * 100}%`,
                  right: `${100 - ((endYear - minVal) / (maxVal - minVal)) * 100}%`
                }}
              />
              <input 
                type="range" 
                min={minVal} 
                max={maxVal} 
                value={startYear}
                onChange={(e) => setStartYear(Math.min(parseInt(e.target.value), endYear - 1))}
                className="absolute w-full -top-1 appearance-none bg-transparent pointer-events-auto h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-spiritual [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
              />
              <input 
                type="range" 
                min={minVal} 
                max={maxVal} 
                value={endYear}
                onChange={(e) => setEndYear(Math.max(parseInt(e.target.value), startYear + 1))}
                className="absolute w-full -top-1 appearance-none bg-transparent pointer-events-auto h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-spiritual [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
               {registryMode === 'sumermal' ? (
                 <>
                   <span>1942 (दीक्षा)</span>
                   <span>1965</span>
                   <span>1990</span>
                   <span>2018 (अंतिम)</span>
                 </>
               ) : (
                 <>
                   <span>1760 (Foundation)</span>
                   <span>1850</span>
                   <span>1950</span>
                   <span>Current (2026)</span>
                 </>
               )}
            </div>
          </div>
        </div>
        
        {registryMode === 'sumermal' ? (
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {ERAS.map(era => (
              <button 
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-sm ${selectedEra === era.id ? 'bg-spiritual text-[var(--bg-cream)]' : 'bg-white dark:bg-gray-800 text-gray-500 border border-black/5 dark:border-white/5'}`}
              >
                {era.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            <button 
              onClick={() => setSelectedAcharya('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-sm ${selectedAcharya === 'all' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-gray-800 text-gray-500 border border-black/5 dark:border-white/5'}`}
            >
              All Acharyas
            </button>
            {uniqueAcharyas.map(ach => (
              <button 
                key={ach.acharyaId}
                onClick={() => setSelectedAcharya(ach.acharyaId)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-sm ${selectedAcharya === ach.acharyaId ? 'bg-spiritual text-[var(--bg-cream)]' : 'bg-white dark:bg-gray-800 text-gray-500 border border-black/5 dark:border-white/5'}`}
              >
                {ach.acharyaName.replace('Acharya ', '')} <span className="opacity-50 ml-1">({chaturmasMasterRegistry.filter(a => a.acharyaId === ach.acharyaId).length})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/5 dark:bg-black/40 shadow-inner">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
            {registryMode === 'acharyas' ? `${filteredData.length} Records Found` : `${filteredSumermalData.length} Records Found`}
          </span>
        </div>

        <div className="pb-8 space-y-6">
          <AnimatePresence>
            {registryMode === 'sumermal' ? (
              <div className="space-y-4">
                <div className="bg-[#fcf5eb] dark:bg-amber-950/10 border border-spiritual/15 p-5 rounded-[2rem] flex flex-col gap-2">
                  <span className="text-[9px] font-black text-spiritual uppercase tracking-widest">Historical Monastic Tribute</span>
                  <h4 className="serif-text font-black text-spiritual text-lg leading-snug">शासन स्तंभ मंत्रीमुनि श्री सुमेरमल जी स्वामी (लाडनूं)</h4>
                  <p className="text-[11px] leading-relaxed opacity-80 italic">
                    पूज्य मंत्रीमुनि श्री सुमेरमल जी का ७७ वर्षों का सुदीर्घ संयमकाल जैन इतिहास का एक प्रदीप्त नक्षत्र है। वे वर्तमान ११वें अधिनायक आचार्यश्री महाश्रमण जी के दीक्षागुरु एवं अध्यात्म मार्गदर्शक रहे हैं।
                  </p>
                  <div className="flex gap-4 mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <span>✨ कुल चातुर्मास: ७७</span>
                    <span>🌠 अंतिम महाप्रयाण: मई २०१९ (अक्षय तृतीया)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredSumermalData.map((entry, index) => {
                    const isHeavenlyYear = entry.samvat === "2075";
                    const isDeekshaYear = entry.samvat === "1999";
                    return (
                      <motion.div 
                        key={`sumermal-${entry.samvat}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-5 rounded-[2rem] border transition-all ${
                          isHeavenlyYear 
                            ? 'bg-[#fffbeb] dark:bg-amber-900/20 border-amber-350 dark:border-amber-700/50 shadow-md ring-1 ring-amber-500/20' 
                            : isDeekshaYear 
                            ? 'bg-[#ebf8ff] dark:bg-blue-900/10 border-blue-300 dark:border-blue-700/50 shadow-md ring-1 ring-blue-500/20' 
                            : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 shadow-sm shadow-black/5'
                        }`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-1 rounded-md font-black italic bg-spiritual/10 text-spiritual shadow-inner">
                              सन् {entry.year}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              संवत् {entry.samvat}
                            </span>
                          </div>
                          <span className="text-[9px] bg-black/5 dark:bg-white/5 dark:text-gray-300 text-gray-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                            {entry.era_status}
                          </span>
                        </div>
                        
                        <h3 className="serif-text font-black text-lg flex items-center gap-2 text-black dark:text-white mt-1">
                          <MapPin size={16} className="text-spiritual shrink-0" />
                          {entry.chaturmas_kshetra}
                        </h3>

                        {entry.companions_and_sanidhya && (
                          <div className="mt-2.5 text-xs text-gray-600 dark:text-gray-300 font-bold flex items-start gap-1.5 opacity-90 leading-tight">
                            <Users size={12} className="text-spiritual shrink-0 mt-0.5" />
                            <span>सहगामी/सान्निध्य: {entry.companions_and_sanidhya}</span>
                          </div>
                        )}
                        
                        {entry.historical_significance && (
                          <div className="mt-3 border-t border-black/5 dark:border-white/5 pt-3">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-semibold italic">
                              {entry.historical_significance}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              uniqueAcharyas.filter(ach => filteredData.some(d => d.acharyaId === ach.acharyaId)).map(ach => {
                const achEntries = filteredData
                  .filter(d => d.acharyaId === ach.acharyaId)
                  .sort((a, b) => {
                    const aYear = typeof a.ceYear === 'string' ? parseInt(a.ceYear.split('-')[0]) : a.ceYear;
                    const bYear = typeof b.ceYear === 'string' ? parseInt(b.ceYear.split('-')[0]) : b.ceYear;
                    return aYear - bYear;
                  });
                  
                if (achEntries.length === 0) return null;
                
                return (
                  <div key={ach.acharyaId} className="space-y-3">
                    <h3 className="serif-text text-xl font-bold text-spiritual px-2 border-b border-black/10 dark:border-white/10 pb-2 mb-3">
                      {ach.acharyaName}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {achEntries.map((entry, index) => (
                        <motion.div 
                          key={`${entry.acharyaId}-${entry.ceYear}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-2xl border transition-all ${entry.isProjected ? 'bg-[#fffbeb] dark:bg-amber-900/20 border-amber-300 dark:border-amber-700/50 shadow-md' : entry.ceYear === 2026 ? 'bg-[#f0fdf4] dark:bg-green-900/20 border-green-300 dark:border-green-700/50 shadow-lg' : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 shadow-sm shadow-black/5'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-1 rounded-md font-black italic shadow-inner ${entry.ceYear === 2026 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-black/5 dark:bg-white/5'}`}>{entry.ceYear}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">VS {entry.vsYear}</span>
                            </div>
                            {entry.ceYear === 2026 && (
                              <span className="text-[9px] bg-green-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse shadow-md">Active Base</span>
                            )}
                            {entry.isProjected && (
                              <span className="text-[9px] bg-amber-500 text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-md">Projected</span>
                            )}
                          </div>
                          
                          <h3 className={`serif-text font-bold text-lg flex items-center gap-2 mt-1 ${entry.ceYear === 2026 ? 'text-green-800 dark:text-green-400' : 'text-black dark:text-white'}`}>
                            <MapPin size={16} className={entry.ceYear === 2026 ? 'text-green-600' : entry.isProjected ? 'text-amber-500' : 'text-spiritual'} />
                            {entry.location}
                          </h3>
                          
                          {entry.notes && (
                            <div className="mt-3 flex flex-col gap-2 border-t border-black/5 dark:border-white/5 pt-3">
                              <div className={`flex items-start gap-2 text-[11px] font-medium italic p-2.5 rounded-lg border shadow-inner ${entry.ceYear === 2026 ? 'bg-green-500/10 text-green-800 dark:text-green-300 border-green-500/20' : 'bg-spiritual/5 text-spiritual border-spiritual/10'}`}>
                                <Building2 size={12} className="shrink-0 mt-0.5 opacity-70" />
                                {entry.notes}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </AnimatePresence>
          
          {((registryMode === 'acharyas' && filteredData.length === 0) || 
            (registryMode === 'sumermal' && filteredSumermalData.length === 0)) && (
            <div className="text-center py-10 opacity-50 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-black/20 m-4">
              <MapPin size={32} className="mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">No matching locations found.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChaturmasRegistry;
