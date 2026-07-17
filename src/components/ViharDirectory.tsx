import React, { useState } from 'react';
import { Search, MapPin, Phone, Users, ExternalLink, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { VIHAR_DATA, PravasData } from '../data/viharData';
import { useLocation } from '../context/LocationContext';

interface ViharDirectoryProps {
  onBack?: () => void;
}

export default function ViharDirectory({ onBack }: ViharDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Acharya' | 'Muni' | 'Sadhvi'>('All');
  const { activeCity } = useLocation();

  // 🔍 Search & Filter Logic: Name, Region, Location, and Type
  const filteredData = VIHAR_DATA.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(query) ||
      item.region.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);

    const matchesType = selectedType === 'All' || item.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-zinc-950 p-4 font-sans text-stone-800 dark:text-zinc-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-full text-stone-600 dark:text-zinc-300 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <span>विहार - प्रवास</span>
              <span className="text-orange-500 animate-pulse text-base">🙏</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">चारित्रात्माओं की अद्यतन जानकारी (जुलाई 2026)</p>
          </div>
        </div>
      </div>

      {/* Active City Toast */}
      {activeCity && (
        <div className="mb-4 p-3 bg-orange-50/60 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-900/20 rounded-2xl flex items-center gap-2.5">
          <MapPin size={14} className="text-orange-500 shrink-0" />
          <p className="text-[11px] text-stone-600 dark:text-zinc-300">
            आपका वर्तमान शहर <span className="font-bold text-orange-600 dark:text-orange-400">{activeCity.name}</span> है। विहार प्रवास की दूरियाँ एवं लोकल अपडेट्स इसी के अनुसार संयोजित हैं।
          </p>
        </div>
      )}

      {/* Type Filter Buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {(['All', 'Acharya', 'Muni', 'Sadhvi'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedType === type
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border border-stone-200/60 dark:border-zinc-800 hover:bg-stone-50'
            }`}
          >
            {type === 'All' && 'सभी (All)'}
            {type === 'Acharya' && 'आचार्य श्री (Acharya)'}
            {type === 'Muni' && 'मुनि वृन्द (Munis)'}
            {type === 'Sadhvi' && 'साध्वी वृन्द (Sadhvis)'}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3.5 text-stone-400" size={18} />
        <input
          type="text"
          placeholder="नाम, राज्य या शहर से खोजें..."
          className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-xs text-stone-800 dark:text-zinc-100 transition-all duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List of Charitratmas */}
      <div className="space-y-4 pb-24">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <PravasCard key={item.id} data={item} />
          ))
        ) : (
          <div className="text-center py-12 text-stone-400 dark:text-zinc-500 text-sm bg-white dark:bg-zinc-900 rounded-2xl border border-stone-100 dark:border-zinc-800/80 p-6">
            <span className="text-xl block mb-2">🔍</span>
            कोई अद्यतन जानकारी नहीं मिली। कृपया भिन्न खोज शब्दों का प्रयास करें।
          </div>
        )}
      </div>
    </div>
  );
}

// 🃏 Card Component for individual entry
function PravasCard({ data }: { data: PravasData }) {
  const isAcharya = data.type === 'Acharya';

  return (
    <div className={`rounded-[24px] p-5 shadow-sm border transition-all duration-200 hover:shadow-md ${
      isAcharya 
        ? 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-900/30' 
        : 'bg-white dark:bg-zinc-900 border-stone-200/40 dark:border-zinc-800'
    }`}>
      
      {/* Name & Thana */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {isAcharya && (
            <span className="p-1 bg-orange-100 dark:bg-orange-950/40 text-orange-600 rounded-lg text-xs font-bold">
              परमपूज्य
            </span>
          )}
          <h3 className={`font-black text-base md:text-lg leading-tight ${isAcharya ? 'text-orange-700 dark:text-orange-400' : 'text-stone-850 dark:text-zinc-100'}`}>
            {data.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 uppercase tracking-wider">
          <Users size={11} />
          <span>ठाणा {data.thana}</span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2.5 text-xs md:text-sm text-stone-600 dark:text-zinc-300 mb-3.5 bg-stone-50 dark:bg-zinc-950 p-3 rounded-xl border border-stone-100 dark:border-zinc-800/60">
        <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
        <span className="leading-relaxed font-medium">{data.location}</span>
      </div>

      {/* Contact & Map Action */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 border-t border-stone-100 dark:border-zinc-850/80">
        <div className="flex items-center gap-2 text-xs md:text-sm text-stone-700 dark:text-zinc-300">
          <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-zinc-950 border border-stone-200/60 dark:border-zinc-800/80 px-3 py-1.5 rounded-lg font-bold">
            <Phone size={13} className="text-green-600 dark:text-green-500" />
            <span className="font-mono">{data.contact}</span>
          </div>
          {data.contactPerson && (
            <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">({data.contactPerson})</span>
          )}
        </div>

        {/* Map Link Button (If available) */}
        {data.mapLink && (
          <a 
            href={data.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-[11px] bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-xl font-extrabold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <ExternalLink size={12} />
            <span>लोकेशन मैप (Map)</span>
          </a>
        )}
      </div>

      {/* Date Tag */}
      <div className="mt-3 text-[9px] text-stone-400 dark:text-zinc-500 text-right font-medium">
        अद्यतन (Updated): {data.date}
      </div>
    </div>
  );
}
