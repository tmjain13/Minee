import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ChevronRight, ChevronLeft, Award, BookOpen, Star, Sparkles } from 'lucide-react';

export interface TimelineMilestone {
  yearCE: number;
  yearVS: number;
  location: string;
  title: string;
  category: 'diksha' | 'gurukul' | 'metropolitan' | 'leadership' | 'active';
  description: string;
  significance: string;
}

export const UDIT_KUMAR_CHRONOLOGY: TimelineMilestone[] = [
  {
    yearCE: 1974,
    yearVS: 2031,
    location: "Sardarshahar (सरदारशहर)",
    title: "Sacred Diksha (दीक्षा संस्कार)",
    category: "diksha",
    description: "Co-initiated with His Holiness 11th Acharya Mahashraman Ji (then Muni Mudit Kumar). Pre-initiation name was Muni Hemantkumar Ji.",
    significance: "Initiated by Mantri Muni Sri Sumermal Ji Swami under the spiritual command of 9th Acharya Shri Tulsi. Acts as elder/senior in monastic ordination seniority."
  },
  {
    yearCE: 1975,
    yearVS: 2032,
    location: "Sridungargarh (श्रीडूंगरगढ़)",
    title: "First Chaturmas (प्रथम चातुर्मास)",
    category: "diksha",
    description: "The name was formally changed to Muni Uditkumar Ji. First spiritual monsoon stay with Mantri Muni Sumermal Ji.",
    significance: "Established early grounding in classical Agamic theories and core behavior principles."
  },
  {
    yearCE: 1978,
    yearVS: 2035,
    location: "Mumbai Marine Drive (मुंबई)",
    title: "Metropolitan Expansion",
    category: "metropolitan",
    description: "Monsoon stay on Marine Drive alongside Mantri Muni Sumermal Ji.",
    significance: "Introduced advanced spiritual retreats to elite professional circles in the financial capital."
  },
  {
    yearCE: 1980,
    yearVS: 2037,
    location: "Madras Sowcarpet (मद्रास)",
    title: "Southern India Vihar",
    category: "metropolitan",
    description: "Paavan Pravas in historic Sowcarpet, trialling long barefoot walks across Tamil Nadu and Andhra.",
    significance: "Strengthened southern Indian centers and developed regional moral education chapters."
  },
  {
    yearCE: 1984,
    yearVS: 2041,
    location: "Gurukulvas (गुरुकुलवास)",
    title: "Pinnacle Gurukul Period (संवत् २०४१-२०४६)",
    category: "gurukul",
    description: "A 6-year period of intense direct guru-service alongside Muni Vijaykumar Ji, staying in the direct proximity of Acharya Tulsi.",
    significance: "Served as a direct administrative scribe and researcher of the canonical Terapanth secretariat."
  },
  {
    yearCE: 1990,
    yearVS: 2047,
    location: "Calcutta Mahasabha (कलकत्ता)",
    title: "Eastern Region Stays (संवत् २०४७-२०५१)",
    category: "metropolitan",
    description: "The first of five consecutive historic chaturmas stays at Kolkata Mahasabha Bhavan & Jorasanko blocks.",
    significance: "Laid the foundation for modern publications, youth moral camps, and Eastern zone networks."
  },
  {
    yearCE: 1995,
    yearVS: 2052,
    location: "Delhi Anuvrat Bhavan (दिल्ली)",
    title: "National Capital Movement",
    category: "metropolitan",
    description: "Historic stay in the center of New Delhi directing public health, value awareness, and interfaith harmony.",
    significance: "Successfully coordinated moral value programs targeting state leaders and university youths."
  },
  {
    yearCE: 2003,
    yearVS: 2060,
    location: "Jalgaon (जलगांव)",
    title: "Khandesh Integration",
    category: "metropolitan",
    description: "Monsoon stay in Jalgaon, spreading De-addiction and Anuvrat principles across Maharashtra.",
    significance: "Mobilized massive regional volunteer ranks for moral education and value camps."
  },
  {
    yearCE: 2004,
    yearVS: 2061,
    location: "Hyderabad D.V. Colony (हैदराबाद)",
    title: "Deccan Technical Reach (संवत् २०६१-२०६२)",
    category: "metropolitan",
    description: "Two successive monsoon stays in Hyderabad engaging corporate professionals and tech leaders.",
    significance: "Pioneered Preksha Meditation courses on executive stress-relief and neural focus models."
  },
  {
    yearCE: 2008,
    yearVS: 2065,
    location: "Delhi Pitampura (दिल्ली)",
    title: "Elevation to 'Agrani' (अग्रणी)",
    category: "leadership",
    description: "Formally assigned independent group leadership (Agrani state) to direct region-wide spiritual campaigns.",
    significance: "Began supervising high-level study cohorts and regional monk groups under direct Acharya command."
  },
  {
    yearCE: 2015,
    yearVS: 2072,
    location: "Delhi Shahdara (दिल्ली)",
    title: "Monastic Mentorship",
    category: "leadership",
    description: "Monsoon stay with Mantri Muni Sumermal Ji. Assisted in guiding several fresh ordinations.",
    significance: "Facilitated the historic Diksha of Muni Jyotirmay Kumar Ji. Strengthened their shared lineage."
  },
  {
    yearCE: 2018,
    yearVS: 2075,
    location: "Jaipur Shyam Nagar (जयपुर)",
    title: "Historic Tribute & Last Stay",
    category: "leadership",
    description: "Served as primary monastic companion during late Mantri Muni Sumermal Ji's 77th and final Chaturmas.",
    significance: "Documented historical details for 'Punyaatma', conserving the legacy of the late Guru of the order."
  },
  {
    yearCE: 2021,
    yearVS: 2078,
    location: "Bhilwara (भीलवाड़ा)",
    title: "Mewar Spiritual Wave",
    category: "leadership",
    description: "Grand stay in Bhilwara (Terapanth Nagar) motivating rural educational cells.",
    significance: "Delivered standard spiritual training manuals to thousands of Gyanshala teachers."
  },
  {
    yearCE: 2024,
    yearVS: 2081,
    location: "Surat (सूरत)",
    title: "Three-Year Gujarat Campaign",
    category: "leadership",
    description: "Completed three continuous years in metropolitan Surat, specializing in industrial moral discourses.",
    significance: "Inaugurated values education portals at Bhagwan Mahaveer College hubs."
  },
  {
    yearCE: 2026,
    yearVS: 2083,
    location: "Delhi Pitampura (दिल्ली)",
    title: "Current Active Base (गतिमान चातुर्मास)",
    category: "active",
    description: "Actively serving as the Agraganya (Group Leader) of Delhi and regional supervisor of scriptural affairs.",
    significance: "Directing the global Gyanshala value education system and supreme Bahushrut Parishad scholars panel."
  }
];

export default function MuniUditChronology() {
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone>(UDIT_KUMAR_CHRONOLOGY[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll selected milestone card into view
  useEffect(() => {
    const activeBtn = document.getElementById(`milestone-btn-${activeIndex}`);
    if (activeBtn && containerRef.current) {
      containerRef.current.scrollTo({
        left: activeBtn.offsetLeft - containerRef.current.offsetWidth / 2 + activeBtn.offsetWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  const handleNext = () => {
    if (activeIndex < UDIT_KUMAR_CHRONOLOGY.length - 1) {
      setActiveIndex(activeIndex + 1);
      setSelectedMilestone(UDIT_KUMAR_CHRONOLOGY[activeIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setSelectedMilestone(UDIT_KUMAR_CHRONOLOGY[activeIndex - 1]);
    }
  };

  const currentCategoryColors = {
    diksha: 'bg-red-500 text-white border-red-500',
    gurukul: 'bg-purple-500 text-white border-purple-500',
    metropolitan: 'bg-blue-500 text-white border-blue-500',
    leadership: 'bg-amber-600 text-white border-amber-600',
    active: 'bg-emerald-600 text-white border-emerald-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="serif-text text-xl font-bold text-spiritual flex items-center gap-2">
            <span className="p-1.5 bg-spiritual/10 rounded-lg"><Star size={18} /></span>
            Muni Udit Kumar Ji Chronology
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Historic Chaturmas Ledger (1974 - 2026)</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5">
          <button 
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={`p-2 rounded-full transition-all ${activeIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-700'}`}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-black px-2">{activeIndex + 1} / {UDIT_KUMAR_CHRONOLOGY.length}</span>
          <button 
            onClick={handleNext}
            disabled={activeIndex === UDIT_KUMAR_CHRONOLOGY.length - 1}
            className={`p-2 rounded-full transition-all ${activeIndex === UDIT_KUMAR_CHRONOLOGY.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-700'}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Ropes */}
      <div className="relative pt-6 pb-2 border-b border-black/5 dark:border-white/5">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-150 dark:bg-gray-700 -translate-y-1 z-0" />
        
        <div 
          ref={containerRef}
          className="flex overflow-x-auto gap-8 pb-4 scroll-smooth no-scrollbar relative z-10 px-4"
        >
          {UDIT_KUMAR_CHRONOLOGY.map((ms, index) => {
            const isSelected = activeIndex === index;
            let themeColorClass = 'text-spiritual border-spiritual bg-white dark:bg-gray-800';
            let dotColorClass = 'bg-spiritual';

            if (ms.category === 'diksha') {
              themeColorClass = isSelected ? 'bg-red-500 text-white border-red-500' : 'text-red-500 border-red-200';
              dotColorClass = 'bg-red-500';
            } else if (ms.category === 'gurukul') {
              themeColorClass = isSelected ? 'bg-purple-500 text-white border-purple-500' : 'text-purple-500 border-purple-200';
              dotColorClass = 'bg-purple-500';
            } else if (ms.category === 'active') {
              themeColorClass = isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'text-emerald-600 border-emerald-200';
              dotColorClass = 'bg-emerald-600';
            } else if (ms.category === 'leadership') {
              themeColorClass = isSelected ? 'bg-amber-600 text-white border-amber-600' : 'text-amber-600 border-amber-200';
              dotColorClass = 'bg-amber-600';
            } else if (isSelected) {
              themeColorClass = 'bg-spiritual text-white border-spiritual';
            }

            return (
              <button 
                id={`milestone-btn-${index}`}
                key={`${ms.yearCE}-${index}`}
                onClick={() => {
                  setActiveIndex(index);
                  setSelectedMilestone(ms);
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-2 group transition-all duration-300 relative focus:outline-none`}
              >
                {/* Connector Dot */}
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 shadow-md ${dotColorClass} group-hover:scale-125 transition-transform relative z-20 ${isSelected ? 'scale-125 ring-4 ring-spiritual/25' : ''}`} />
                
                {/* Year Label */}
                <div className={`px-4 py-2 rounded-2xl border-2 font-black text-xs transition-all flex flex-col items-center ${themeColorClass} shadow-sm group-hover:shadow`}>
                  <span>सन् {ms.yearCE}</span>
                  <span className="text-[9px] opacity-75 font-bold">VS {ms.yearVS}</span>
                </div>
                
                {/* Small City Name */}
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-black dark:group-hover:text-white max-w-[80px] text-center truncate">{ms.location.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Milestone Highlights */}
      <motion.div 
        key={activeIndex}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 space-y-4"
      >
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${currentCategoryColors[selectedMilestone.category]}`}>
                {selectedMilestone.category === 'diksha' ? 'Ordination / दीक्षा' : selectedMilestone.category === 'gurukul' ? 'Gurukul / गुरुकुल' : selectedMilestone.category === 'leadership' ? 'Leadership / नेतृत्व' : selectedMilestone.category === 'active' ? 'Active / वर्तमान' : 'Metropolitan Stay'}
              </span>
              <span className="text-[10px] font-black text-gray-400">संवत् {selectedMilestone.yearVS} • CE {selectedMilestone.yearCE}</span>
            </div>
            <h4 className="serif-text font-black text-lg text-gray-900 dark:text-white mt-1">{selectedMilestone.title}</h4>
          </div>
          
          <div className="flex items-center gap-1.5 text-spiritual font-bold text-sm bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-black/5">
            <MapPin size={14} className="animate-bounce" />
            <span className="serif-text font-black">{selectedMilestone.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/5 dark:border-white/5 pt-4">
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><BookOpen size={10} /> Experience / विवरण</span>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-sans leading-relaxed font-semibold">
              {selectedMilestone.description}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Award size={10} /> Significance / महत्व</span>
            <p className="text-xs text-spiritual dark:text-spiritual-lighter italic leading-relaxed font-semibold">
              {selectedMilestone.significance}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
