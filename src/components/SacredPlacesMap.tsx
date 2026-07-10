import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, ChevronDown, ChevronUp, Map, Award, Compass, CompassIcon } from 'lucide-react';

interface SacredPlace {
  id: number;
  name: string;
  nameEn: string;
  district: string;
  significance: string;
  category: 'founding' | 'mahaprayan' | 'education' | 'birthplace' | 'center' | 'historic';
  importance: number; // 1-5 rating
  facts: string[];
}

const SACRED_PLACES: SacredPlace[] = [
  { id: 1, name: "केलवा", nameEn: "Kelwa", district: "पाली, राजस्थान", significance: "तेरापंथ का जन्मस्थान — यहीं आचार्य भिक्षु ने 1760 में तेरापंथ की स्थापना की।", category: "founding", importance: 5, facts: ["आचार्य भिक्षु ने यहाँ अपना पहला चातुर्मास किया", "1760 CE में आषाढ़ शुक्ला 15 को तेरापंथ का उदय", "यहाँ एक स्मारक उपाश्रय बना हुआ है"] },
  { id: 2, name: "सिरियारी", nameEn: "Siriyari", district: "पाली, राजस्थान", significance: "आचार्य भिक्षु का महाप्रयाण स्थल — यहीं उन्होंने 1803 में देह त्यागी।", category: "mahaprayan", importance: 5, facts: ["आचार्य भिक्षु का अंतिम चातुर्मास यहीं था", "तेरापंथ संघ का सबसे पवित्र स्थलों में से एक", "यहाँ भव्य भिक्षु स्मृति मंदिर है"] },
  { id: 3, name: "लाडनूं", nameEn: "Ladnun", district: "नागौर, राजस्थान", significance: "जैन विश्व भारती विश्वविद्यालय का मुख्यालय — तेरापंथ का शैक्षणिक केंद्र।", category: "education", importance: 5, facts: ["JVB विश्वविद्यालय — 1991 में मान्यता प्राप्त", "अंतर्राष्ट्रीय प्रेक्षाध्यान अनुसंधान केंद्र", "5000 से अधिक विद्यार्थी अध्ययनरत"] },
  { id: 4, name: "सरदारशहर", nameEn: "Sardarshahar", district: "चुरू, राजस्थान", significance: "आचार्य तुलसी और आचार्य महाश्रमण की जन्मभूमि — तेरापंथ का ऐतिहासिक केंद्र।", category: "birthplace", importance: 5, facts: ["आचार्य तुलसी का जन्मस्थान (1914)", "आचार्य महाश्रमण का जन्मस्थान (1962)", "वार्षिक श्रावक सम्मेलन का केंद्र"] },
  { id: 5, name: "गंगाशहर", nameEn: "Gangashahar", district: "बीकानेर, राजस्थान", significance: "तेरापंथ संघ का प्रमुख धार्मिक केंद्र — अनेक आचार्यों का चातुर्मास स्थल।", category: "center", importance: 4, facts: ["आचार्य तुलसी का बहुवर्षीय चातुर्मास स्थल", "विशाल तेरापंथ भवन", "सक्रिय ज्ञानशाला और साधना केंद्र"] },
  { id: 6, name: "नोखा", nameEn: "Nokha", district: "बीकानेर, राजस्थान", significance: "आचार्य भिक्षु की दीक्षा से जुड़ा ऐतिहासिक स्थल।", category: "historic", importance: 3, facts: ["तेरापंथ के प्रारंभिक प्रसार का केंद्र", "ऐतिहासिक उपाश्रय", "वार्षिक आयोजनों का स्थल"] },
  { id: 7, name: "पाली", nameEn: "Pali", district: "पाली, राजस्थान", significance: "आचार्य भिक्षु का बहुवर्षीय चातुर्मास स्थल — प्रारंभिक तेरापंथ का महत्वपूर्ण केंद्र।", category: "historic", importance: 4, facts: ["आचार्य भिक्षु का 7 बार से अधिक चातुर्मास", "वर्तमान में सक्रिय तेरापंथ समाज", "विशाल उपाश्रय भवन"] },
  { id: 8, name: "बीकानेर", nameEn: "Bikaner", district: "बीकानेर, राजस्थान", significance: "तेरापंथ संघ का प्रमुख प्रशासनिक और सांस्कृतिक केंद्र।", category: "center", importance: 4, facts: ["अनेक तेरापंथ संस्थाओं का मुख्यालय", "वार्षिक बड़े आयोजन", "विशाल जैन मंदिर और उपाश्रय"] }
];

type CategoryFilter = 'all' | 'founding' | 'birthplace' | 'education' | 'historic';

export default function SacredPlacesMap({ onBack }: { onBack?: () => void }) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'founding': return 'स्थापना';
      case 'mahaprayan': return 'महाप्रयाण';
      case 'education': return 'शिक्षा';
      case 'birthplace': return 'जन्मस्थान';
      case 'center': return 'केंद्र';
      case 'historic': return 'ऐतिहासिक';
      default: return cat;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'founding': return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
      case 'mahaprayan': return 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400';
      case 'education': return 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400';
      case 'birthplace': return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'center': return 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400';
      case 'historic': return 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
      default: return 'bg-gray-550/10 text-gray-550';
    }
  };

  // Filtering implementation:
  // - "सभी" (all) -> matches everything
  // - "स्थापना" (founding) -> matches 'founding' or 'mahaprayan'
  // - "जन्मस्थान" (birthplace) -> matches 'birthplace'
  // - "शिक्षा" (education) -> matches 'education'
  // - "ऐतिहासिक" (historic) -> matches 'historic' or 'center'
  const filteredPlaces = SACRED_PLACES.filter(place => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'founding') return place.category === 'founding' || place.category === 'mahaprayan';
    if (activeCategory === 'birthplace') return place.category === 'birthplace';
    if (activeCategory === 'education') return place.category === 'education';
    if (activeCategory === 'historic') return place.category === 'historic' || place.category === 'center';
    return true;
  });

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleOpenMap = (place: SacredPlace, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://maps.google.com/?q=' + encodeURIComponent(place.nameEn + ' Rajasthan'), '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-black/5 dark:border-white/5 space-y-6 shadow-sm overflow-hidden text-left" id="sacred-places-container">
      
      {/* Header section with icons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
            <Compass className="animate-spin-slow" size={24} />
          </div>
          <div>
            <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl">तेरापंथ के पवित्र स्थल</h3>
            <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Sacred Footprints Across Rajasthan</p>
          </div>
        </div>
      </div>

      {/* Structured Stats Bar */}
      <div className="grid grid-cols-3 gap-2 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-3xl border border-indigo-500/5 text-center">
        <div className="border-r border-black/5 dark:border-white/5">
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">8</p>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">पवित्र स्थल</span>
        </div>
        <div className="border-r border-black/5 dark:border-white/5">
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">4</p>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">जिले</span>
        </div>
        <div>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">265+</p>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">वर्षों का इतिहास</span>
        </div>
      </div>

      {/* Category filters */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 block">श्रेणी से खोजें (Filter by Category):</span>
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'all', label: 'सभी' },
            { key: 'founding', label: 'स्थापना' },
            { key: 'birthplace', label: 'जन्मस्थान' },
            { key: 'education', label: 'शिक्षा' },
            { key: 'historic', label: 'ऐतिहासिक' }
          ] as const).map(tab => (
            <button
              key={tab.key}
              id={`filter-sacred-${tab.key}`}
              onClick={() => {
                setActiveCategory(tab.key);
                setExpandedCardId(null);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border ${
                activeCategory === tab.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPlaces.map(place => {
            const isExpanded = expandedCardId === place.id;
            return (
              <motion.div
                key={place.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-50/50 dark:bg-gray-800/40 rounded-3xl p-5 border border-black/5 dark:border-white/5 space-y-4 hover:shadow-md transition-all self-start"
              >
                {/* Visual Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="serif-text font-black text-gray-900 dark:text-white text-base flex items-center gap-1.5">
                      <MapPin size={16} className="text-rose-500" />
                      {place.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{place.nameEn} • {place.district}</p>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= place.importance ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-700"}
                      />
                    ))}
                  </div>
                </div>

                {/* Sub-badge indicating detail category */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${getCategoryBadgeClass(place.category)}`}>
                    {getCategoryLabel(place.category)}
                  </span>
                </div>

                {/* Main Significance Statement */}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                  {place.significance}
                </p>

                {/* Know More Expandable details panel */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-dashed border-black/10 dark:border-white/10 pt-3 mt-1 space-y-2"
                  >
                    <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">रोचक ऐतिहासिक तथ्य (Historical Facts):</p>
                    <ul className="space-y-1.5">
                      {place.facts.map((fact, index) => (
                        <li key={index} className="text-xs text-gray-550 dark:text-gray-450 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Interactive Bar */}
                <div className="flex gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => toggleExpand(place.id)}
                    className="flex-1 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>{isExpanded ? "कम जानें" : "और जानें"}</span>
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>

                  <button
                    onClick={(e) => handleOpenMap(place, e)}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Map size={11} strokeWidth={3} />
                    <span>नक्शे में देखें</span>
                  </button>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
