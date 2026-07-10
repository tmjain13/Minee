import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Tag, MapPin, Clock, Search, ChevronDown, Award } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  tithi: string;
  gregorianDate: string;
  dayOfWeek: string;
  category: 'festival' | 'anniversary' | 'maryada';
  description: string;
  sadhanaTip: string;
  location?: string;
}

const verifiedEvents: CalendarEvent[] = [
  {
    id: 'paryushan_start',
    title: 'पर्युषण पर्व आरम्भ (Paryushan Parva Aarambh)',
    tithi: 'भाद्रपद कृष्ण द्वादशी',
    gregorianDate: 'September 7, 2026',
    dayOfWeek: 'Monday',
    category: 'festival',
    description: 'आध्यात्मिक साधना, तप, स्वाध्याय और आत्म-शुद्धि का सर्वश्रेष्ठ महापर्व। इन ८ दिनों में पूर्ण संयम और कल्पसूत्र वाचन होता है।',
    sadhanaTip: 'संवत्सरी प्रतिक्रमण, स्वाध्याय और उपवास/एकासन का प्रयास करें।'
  },
  {
    id: 'maryada_lekhan',
    title: 'मर्यादा पत्र लेखन दिवस (Maryada Patra Lekhan Divas)',
    tithi: 'भाद्रपद शुक्ल तृतीया',
    gregorianDate: 'September 14, 2026',
    dayOfWeek: 'Monday',
    category: 'maryada',
    description: 'आचार्य भिक्षु द्वारा केलवा में लिखे गए ऐतिहासिक मर्यादा पत्र के उपलक्ष्य में, जो संघ की सुदृढ़ मर्यादा और अनुशासन का आधार स्तंभ है।',
    sadhanaTip: 'गुरु आज्ञा अनुवर्तन तथा मर्यादा गीतों का पाठ करें।'
  },
  {
    id: 'samvatsari',
    title: 'संवत्सरी पर्व (Samvatsari Parva)',
    tithi: 'भाद्रपद शुक्ल चतुर्थी',
    gregorianDate: 'September 15, 2026',
    dayOfWeek: 'Tuesday',
    category: 'festival',
    description: 'तेरापंथ पंथ का सर्वोच्च वार्षिक क्षमापना दिवस। इस दिन सभी श्रावक वार्षिक सामूहिक प्रतिक्रमण करते हैं तथा अनजाने में हुई भूलों के लिए क्षमा मांगते हैं।',
    sadhanaTip: '२४ घंटे का उपवास (पच्चक्खाण) तथा आलोयणा पूर्वक संवत्सरी प्रतिक्रमण करें।'
  },
  {
    id: 'kshamapana',
    title: 'क्षमापना दिवस (Kshamapana Divas - Forgiveness)',
    tithi: 'भाद्रपद शुक्ल पंचमी',
    gregorianDate: 'September 16, 2026',
    dayOfWeek: 'Wednesday',
    category: 'festival',
    description: 'पूर्ण मैत्री भाव (मैत्री दिवस) स्थापित करने हेतु "मिच्छामि दुक्कड़म" का भावपूर्ण आदान-प्रदान कर आपसी वैमनस्य मिटाने का महापर्व।',
    sadhanaTip: 'सभी जीवों से मन, वचन, काया से क्षमा याचना करें (मिच्छामि दुक्कड़म)।'
  },
  {
    id: 'bhikshu_nirvan',
    title: 'आचार्य भिक्षु निर्वाण दिवस (Acharya Bhikshu Nirvan Divas)',
    tithi: 'भाद्रपद शुक्ल एकादशी',
    gregorianDate: 'September 21, 2026',
    dayOfWeek: 'Monday',
    category: 'anniversary',
    description: 'तेरापंथ के प्रथम आचार्य स्वामी भिक्षु का सिरियारी, राजस्थान में निर्वाण हुआ था। उनकी स्मृति में यह श्रद्धा दिवस मनाया जाता है।',
    sadhanaTip: 'सिरियारी तीर्थ का ध्यान, भिक्षु अष्टकम का १०८ बार जाप करें।'
  },
  {
    id: 'anuvrat_sthapan',
    title: 'अणुव्रत स्थापना दिवस (Anuvrat Sthapana Divas)',
    tithi: 'कार्तिक कृष्ण द्वितीया',
    gregorianDate: 'October 27, 2026',
    dayOfWeek: 'Tuesday',
    category: 'maryada',
    description: 'आचार्य तुलसी द्वारा मानवता के कल्याण हेतु अणुव्रत आंदोलन (लघु व्रतों का आचार) की आधारशिला रखने का ऐतिहासिक दिवस।',
    sadhanaTip: 'आज के दिन कोई नया अणुव्रत (जैसे असत्य का त्याग या व्यसन मुक्ति) ग्रहण करें।'
  },
  {
    id: 'maryada_mahotsav',
    title: 'मर्यादा महोत्सव (Maryada Mahotsav)',
    tithi: 'माघ शुक्ल सप्तमी',
    gregorianDate: 'February 13, 2027',
    dayOfWeek: 'Saturday',
    category: 'maryada',
    description: 'तेरापंथ का सर्वाधिक भव्य एवं विशाल त्रिदिवसीय उत्सव, जहां समस्त साधु-साध्वी और श्रावक आचार्यश्री के सान्निध्य में एकत्रित होकर मर्यादा पत्रों का वाचन करते हैं।',
    sadhanaTip: 'एकता गीत का गान करें तथा संघ के नियमों के प्रति दृढ़ आस्था व्यक्त करें।'
  },
  {
    id: 'ahimsa_anniversary',
    title: 'अहिंसा यात्रा वार्षिकोत्सव (Ahimsa Yatra Anniversary)',
    tithi: 'चैत्र कृष्ण नवमी',
    gregorianDate: 'March 31, 2027',
    dayOfWeek: 'Wednesday',
    category: 'anniversary',
    description: 'आचार्य महाश्रमण जी द्वारा सद्भावना, नैतिकता और नशामुक्ति के दिव्य संदेश के साथ प्रारम्भ की गई ऐतिहासिक ५०,००० किमी की नग्न पैर यात्रा की वर्षगांठ।',
    sadhanaTip: 'कम से कम एक व्यक्ति को व्यसन मुक्ति का संकल्प दिलाएं।'
  },
  {
    id: 'mahavir_jayanti',
    title: 'महावीर जयंती (Mahavir Jayanti)',
    tithi: 'चैत्र शुक्ल त्रयोदशी',
    gregorianDate: 'April 19, 2027',
    dayOfWeek: 'Monday',
    category: 'festival',
    description: 'जैन धर्म के २४वें तीर्थंकर भगवान महावीर स्वामी का जन्म कल्याणक महोत्सव। उनके सत्य, अहिंसा और अनेकांत के सिद्धांतों का स्मरण पर्व।',
    sadhanaTip: 'नवकार महामंत्र का जाप करें तथा दया-दान के कार्यों में भाग लें।'
  }
];

export default function TerapanthCalendar() {
  const [filter, setFilter] = useState<'all' | 'festival' | 'anniversary' | 'maryada'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEvents = verifiedEvents.filter(event => {
    const matchesFilter = filter === 'all' || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.tithi.includes(searchQuery) ||
                          event.gregorianDate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div id="terapanth_calendar_root" className="bg-[var(--card-bg)] rounded-3xl p-5 border border-[var(--border-color)] shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-orange-500" size={22} />
          <div>
            <h3 className="serif-text text-base font-black text-[var(--text-spiritual)]">तेरापंथ मुख्य पंचांग कैलेंडर २०२६-२०२७</h3>
            <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-0.5">Community Festivals & Tithis</p>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="उत्सव, तिथि या तारीख खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl py-2 pl-9 pr-4 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', title: 'सभी (All)' },
            { id: 'festival', title: 'महापर्व (Festivals)' },
            { id: 'maryada', title: 'मर्यादा दिवस' },
            { id: 'anniversary', title: 'स्मृति वर्षगांठ' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-xl text-2xs font-extrabold whitespace-nowrap tracking-wider uppercase transition-all cursor-pointer ${
                filter === btn.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-gray-400 hover:text-orange-500'
              }`}
            >
              {btn.title}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">कोई इवेंट नहीं मिला।</p>
        ) : (
          filteredEvents.map((event) => {
            const isExpanded = expandedId === event.id;
            return (
              <div
                key={event.id}
                className={`border border-[var(--border-color)] rounded-2xl p-3.5 transition-all duration-300 ${
                  isExpanded ? 'bg-orange-500/5 border-orange-500/20' : 'bg-black/[0.01] hover:bg-black/[0.03]'
                }`}
              >
                <div onClick={() => toggleExpand(event.id)} className="flex items-start justify-between gap-3 cursor-pointer select-none">
                  <div className="space-y-1">
                    <span className={`inline-block text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${
                      event.category === 'festival' 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                        : event.category === 'maryada' 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                      {event.category === 'festival' ? 'पर्व / Festival' : event.category === 'maryada' ? 'मर्यादा' : 'स्मृति दिवस'}
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[var(--text-spiritual)] leading-snug">
                      {event.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-orange-500" />
                        {event.gregorianDate} ({event.dayOfWeek})
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>{event.tithi}</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 shrink-0 mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-[var(--border-color)] text-xs text-gray-600 dark:text-gray-400 space-y-2.5 leading-relaxed"
                    >
                      <p>{event.description}</p>
                      
                      <div className="bg-orange-500/5 p-3 rounded-xl border border-orange-500/10 flex gap-2 items-start">
                        <Award size={14} className="text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black text-[10px] text-orange-600 dark:text-orange-400 uppercase tracking-widest">आज की विशेष साधना सलाह:</p>
                          <p className="text-[11px] mt-0.5">{event.sadhanaTip}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
