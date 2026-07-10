import React, { useState, useMemo, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Download, Share2, Check, RefreshCw, 
  User, Image as ImageIcon, Sliders, Info, Sparkles, BookOpen, AlertCircle, Maximize2
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import FullScreenImageViewer from './FullScreenImageViewer';

interface MonasticMember {
  id: string;
  name: string;
  role: string;
  category: 'Acharya' | 'Muni' | 'Sadhvi' | 'Sadhvi Pramukha' | 'Mahashraman';
  imageUrl?: string;
  description?: string;
}

interface GalleryTabProps {
  setShareToast?: (toast: { show: boolean; message: string }) => void;
  isDarkMode?: boolean;
}

// 📖 STUNNING DEFAULT SCHOLAR ASCETICS DATASET (Terapanth Order Canonical Registry)
const PREPOPULATED_MEMBERS: MonasticMember[] = [
  {
    id: "acharya-mahashraman",
    name: "Acharya Shri Mahashraman Ji",
    role: "11th Spiritual Sovereign (वर्तमान अनुशास्ता)",
    category: "Mahashraman",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=60",
    description: "Born in 1962, Acharya Shri Mahashraman is the current spiritual head of the Jain Swetambar Terapanth sect. Appointed by Acharya Mahapragya, he is renowned for his extraordinary humility, deep penance, and leading the historic Ahimsa Yatra across India, Nepal, and Bhutan promoting non-violence and addiction-free living."
  },
  {
    id: "acharya-mahapragya",
    name: "Acharya Shri Mahapragya Ji",
    role: "10th Acharya of Terapanth Sect",
    category: "Acharya",
    imageUrl: "", // Left blank to test requirement 7: colored initials avatar
    description: "A legendary philosopher, scholar, and meditation expert. He was the propounder of Preksha Meditation (प्रेक्षाध्यान) and Science of Living (जीवन विज्ञान). He authored over 100 books and was respected globally for his scientific synthesis of spiritual wisdom."
  },
  {
    id: "acharya-tulsi",
    name: "Ganadhipati Acharya Tulsi Ji",
    role: "9th Acharya & Anuvrat Founder",
    category: "Acharya",
    imageUrl: "", 
    description: "One of the most visionary and reformist saints of India, who initiated the global Anuvrat Movement (अणुव्रत आंदोलन) in 1949 to nurture individual moral values regardless of caste or creed. He established Jain Vishva Bharati University in Ladnun."
  },
  {
    id: "sadhvi-pramukha-kanakprabha",
    name: "Sadhvi Pramukha Kanakprabha Ji",
    role: "8th Sadhvi Pramukha (Former Head of Nun Order)",
    category: "Sadhvi Pramukha",
    imageUrl: "", 
    description: "Appointed by Acharya Tulsi in 1972, Sadhvi Pramukha Kanakprabha Ji headed the vast order of thousands of Terapanth Sadhvis (nuns) and Samanis for over 49 years. She was a supreme organizer, poetess, and editor of canonical Agamas."
  },
  {
    id: "sadhvi-pramukha-vishruta-vibha",
    name: "Sadhvi Pramukha Vishruta Vibha Ji",
    role: "9th Sadhvi Pramukha (वर्तमान साध्वीप्रमुखा)",
    category: "Sadhvi Pramukha",
    imageUrl: "", 
    description: "Selected as the 9th Sadhvi Pramukha of the Terapanth order under the direct supervision of Acharya Mahashraman Ji in 2022. She brings strong intellectual leadership, modern educational expertise, and spiritual discipline to the female monastic order."
  },
  {
    id: "muni-jyotirmay",
    name: "Muni Jyotirmay Kumar Ji",
    role: "Prasang Scholar & Senior Ascetic (Info ID 866)",
    category: "Muni",
    imageUrl: "", 
    description: "A senior vanguard ascetic monk of the Terapanth sect with deep scholarly command of scriptural, historical, and linguistic traditions. He has served the धर्मसंघ through remarkable discipline and literary creations."
  },
  {
    id: "muni-udit",
    name: "Muni Udit Kumar Ji",
    role: "Vocal Spiritual Teacher & Guide (Info ID 697)",
    category: "Muni",
    imageUrl: "", 
    description: "A popular, dynamic monk known for his inspiring discourses, spiritual songs (Bhajans), and direct interactive sessions guiding Values Education (Gyan Shala) children and Terapanth youth across India."
  },
  {
    id: "sadhvi-rajimati",
    name: "Sadhvi Rajimati Ji",
    role: "Pioneer Preacher & Educator",
    category: "Sadhvi",
    imageUrl: "", 
    description: "A profound practitioner and spiritual orator within the sisterhood of Terapanth Swetambar nuns, dedicated to promoting Preksha Meditation and moral values across local communities."
  }
];

// Helper to deduce category badge background and border colors
export const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Acharya':
      return { 
        bg: 'rgba(200, 134, 10, 0.1)', 
        text: '#c8860a', 
        primary: '#c8860a',
        border: 'rgba(200, 134, 10, 0.2)' 
      };
    case 'Muni':
      return { 
        bg: 'rgba(123, 94, 167, 0.1)', 
        text: '#7b5ea7', 
        primary: '#7b5ea7',
        border: 'rgba(123, 94, 167, 0.2)' 
      };
    case 'Sadhvi':
      return { 
        bg: 'rgba(181, 84, 122, 0.1)', 
        text: '#b5547a', 
        primary: '#b5547a',
        border: 'rgba(181, 84, 122, 0.2)' 
      };
    case 'Sadhvi Pramukha':
      return { 
        bg: 'rgba(156, 74, 43, 0.1)', 
        text: '#9c4a2b', 
        primary: '#9c4a2b',
        border: 'rgba(156, 74, 43, 0.2)' 
      };
    case 'Mahashraman':
      return { 
        bg: 'rgba(46, 125, 110, 0.1)', 
        text: '#2e7d6e', 
        primary: '#2e7d6e',
        border: 'rgba(46, 125, 110, 0.2)' 
      };
    default:
      return { 
        bg: 'rgba(100, 116, 139, 0.1)', 
        text: '#64748b', 
        primary: '#64748b',
        border: 'rgba(100, 116, 139, 0.2)' 
      };
  }
};

const GalleryTab = memo(({ setShareToast, isDarkMode = false }: GalleryTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Acharya' | 'Muni' | 'Sadhvi' | 'Sadhvi Pramukha' | 'Mahashraman'>('All');
  const [selectedMember, setSelectedImage] = useState<MonasticMember | null>(null);
  const [fullscreenMember, setFullscreenMember] = useState<MonasticMember | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Firestore specific states
  const [firestoreMembers, setFirestoreMembers] = useState<MonasticMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Categories list per Priority 1, Constraint 1
  const categoriesList = useMemo(() => {
    return ['All', 'Acharya', 'Muni', 'Sadhvi', 'Sadhvi Pramukha', 'Mahashraman'] as const;
  }, []);

  // Fetch live members from Firestore collection 'gallery_members'
  const fetchFirestoreMembers = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'gallery_members');
      const querySnapshot = await getDocs(colRef);
      const list: MonasticMember[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          role: data.role || '',
          category: data.category || 'Muni',
          imageUrl: data.imageUrl || '',
          description: data.description || ''
        });
      });
      setFirestoreMembers(list);
    } catch (e) {
      console.warn("Firestore access failed or restricted, using offline fallback:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirestoreMembers();
  }, []);

  // Merged Monastic Dataset (Prepopulated + Real Firestore docs)
  const allMembers = useMemo(() => {
    // Avoid duplicating keys if documents in firestore are identical to prepopulated
    const firestoreIds = new Set(firestoreMembers.map(item => item.id));
    const uniquePrepopulated = PREPOPULATED_MEMBERS.filter(member => !firestoreIds.has(member.id));
    return [...uniquePrepopulated, ...firestoreMembers];
  }, [firestoreMembers]);

  // Compute live counter statistics for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allMembers.length };
    categoriesList.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = allMembers.filter(member => member.category === cat).length;
      }
    });
    return counts;
  }, [allMembers, categoriesList]);

  // Filter members dynamically by name (searchQuery) and category
  const filteredMembers = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    return allMembers.filter(member => {
      const matchesCategory = activeCategory === 'All' || member.category === activeCategory;
      const matchesName = member.name.toLowerCase().includes(cleanQuery) || 
                          (member.role || '').toLowerCase().includes(cleanQuery);
      return matchesCategory && matchesName;
    });
  }, [allMembers, searchQuery, activeCategory]);

  // Generate gorgeous colored initial fallbacks (first 2 letters: Acharya Shri Mahashraman -> AM)
  const getInitials = (name: string) => {
    const clean = name.replace(/^(Acharya|Sadhvi|Muni|Ganadhipati|Pramukha|Shri)\s+/gi, '').replace(/Ji$/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const handleShare = (member: MonasticMember, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🙏 जय जिनेंद्र! तेरापंथ धर्मसंघ के महान साधक:\n📌 ${member.name} (${member.role})\n✨ श्रेणी: ${member.category}\n▫️ ${member.description || ''}\n\nसाझाकर्ता: तेरापंथ एआई ऐप।`;
    
    if (navigator.share) {
      navigator.share({
        title: member.name,
        text: shareText
      }).catch(err => console.log('Share dismissed', err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedId(member.id);
        if (setShareToast) {
          setShareToast({ show: true, message: `${member.name} की जानकारी कॉपी हो गई!` });
        }
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const handleDownload = (member: MonasticMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (member.imageUrl) {
      // Open real photo link for download
      window.open(member.imageUrl, '_blank');
    } else {
      // Copy biographical caption as shareable card
      const bioText = `🏆 ${member.name}\n🌟 {${member.role}}\n📖 ${member.description || 'साधना एवं त्याग की जीवंत मिसाल।'}`;
      navigator.clipboard.writeText(bioText).then(() => {
        if (setShareToast) {
          setShareToast({ 
            show: true, 
            message: "तस्वीर अनुपलब्ध है। जीवनी विवरणी क्लिपबोर्ड में कॉपी कर दी गई है!" 
          });
        }
      });
    }
  };

  // Helper utility to seed mock prepopulated registry directly into live Firestore for validation
  const handleSeedCollection = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      const colRef = collection(db, 'gallery_members');
      let successCount = 0;
      for (const m of PREPOPULATED_MEMBERS) {
        // Skip those already in firestore to avoid duplication
        if (!firestoreMembers.some(fm => fm.name === m.name)) {
          await addDoc(colRef, {
            name: m.name,
            role: m.role,
            category: m.category,
            imageUrl: m.imageUrl || '',
            description: m.description || '',
            createdAt: serverTimestamp()
          });
          successCount++;
        }
      }
      if (setShareToast) {
        setShareToast({ 
          show: true, 
          message: successCount > 0 ? `सफलतापूर्वक ${successCount} नए सदस्यों को लाइव डेटाबेस में सिंक किया गया!` : 'लाइव डेटाबेस पहले से अपडेटेड है!' 
        });
      }
      fetchFirestoreMembers();
    } catch (e) {
      console.error(e);
      if (setShareToast) {
        setShareToast({ show: true, message: 'डेटाबेस सिंक विफल! सुरक्षा नियमों की जांच करें।' });
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div 
      className="w-full text-[var(--text-spiritual)] transition-all duration-700 pb-20 select-none"
      style={{
        background: isDarkMode 
          ? 'radial-gradient(circle at top, #141724 0%, #0d0f17 100%)' 
          : 'radial-gradient(circle at top, #FFFDFB 0%, #F5EFEB 100%)'
      }}
    >
      
      {/* SELECTION SEARCH HEADER */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative flex items-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 w-full px-4 h-12">
          <Search className="text-gray-400 mr-2 flex-shrink-0 w-4 h-4" />
          <input 
            type="text"
            placeholder="साधकों के नाम या पदवी से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-spiritual)] placeholder:text-gray-400 font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* HORIZONTAL CATEGORY SCROLL PILLS (Requirement 1 & 12) */}
      <div className="overflow-x-auto scrollbar-none flex gap-2.5 px-4 py-2 border-b border-[var(--border-color)]">
        {categoriesList.map((cat) => {
          const isSelected = activeCategory === cat;
          const styles = getCategoryStyles(cat);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-sm relative flex items-center gap-1.5"
              style={{
                backgroundColor: isSelected ? styles.primary : 'var(--card-bg)',
                color: isSelected ? '#ffffff' : 'var(--text-spiritual)',
                border: isSelected ? '1px solid transparent' : `1px solid ${styles.text || 'var(--border-color)'}`,
                boxShadow: isSelected ? `0 4px 10px ${styles.primary}33` : 'none'
              }}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              {cat}
              <span 
                className="text-[9px] px-1.5 py-0.5 rounded-full ml-1"
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : styles.bg,
                  color: isSelected ? '#ffffff' : styles.text
                }}
              >
                {categoryCounts[cat] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* CORE 2-COLUMN VIEWGRID WITH AVATARS (Requirement 2, 3 & 7) */}
      <div className="px-4 py-4 max-w-5xl mx-auto">
        
        {/* Sync/Seed Button Trigger for Firestore verification */}
        {auth.currentUser && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleSeedCollection}
              disabled={seeding}
              className="text-[10px] bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-500 border border-cyan-500/20 font-extrabold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 transition-all active:scale-95"
            >
              <RefreshCw size={10} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'सिंक हो रहा है...' : 'लाइव फायरस्टोर सिंक (LIVE DATA SYNCHRONIZER)'}
            </button>
          </div>
        )}

        {/* LOADING SKELETONS (Requirement 11) */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-4 flex flex-col items-center animate-pulse gap-3">
              <div className="w-20 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-2/3 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-1/2 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-4 flex flex-col items-center animate-pulse gap-3">
              <div className="w-18 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-2/3 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-1/2 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-color)] p-6">
            <AlertCircle className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
            <p className="text-sm font-semibold">कोई साधक नहीं मिले</p>
            <p className="text-xs text-gray-400 mt-1">कृपया कोई अन्य नाम या श्रेणी चुनें।</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="mt-3 px-4 py-1.5 bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-bold rounded-lg"
            >
              फ़िल्टर रीसेट करें
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredMembers.map((member) => {
              const styles = getCategoryStyles(member.category);
              const customInitials = getInitials(member.name);
              
              return (
                <motion.div
                  key={member.id}
                  layoutId={`member-container-${member.id}`}
                  onClick={() => setSelectedImage(member)}
                  className="group relative bg-[var(--card-bg)] hover:bg-neutral-50/50 dark:hover:bg-zinc-900/60 border border-[var(--border-color)] rounded-[24px] p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Circle Image or Styled Initiated Initial Avatar (Requirement 3 & 7) */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-3 bg-neutral-100 dark:bg-neutral-800">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show fallback node instead
                          const fallbackNode = target.nextSibling as HTMLElement;
                          if (fallbackNode) fallbackNode.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Circle initials fallback (Requirement 7) */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center font-extrabold text-sm sm:text-base text-white select-none"
                      style={{ 
                        backgroundColor: styles.primary, 
                        display: member.imageUrl ? 'none' : 'flex' 
                      }}
                    >
                      {customInitials}
                    </div>
                  </div>

                  {/* Name and colored role badge (Requirement 3) */}
                  <h3 className="text-xs sm:text-sm font-bold leading-tight truncate w-full text-[var(--text-spiritual)] mb-1 px-1">
                    {member.name}
                  </h3>
                  
                  <span 
                    className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase mt-1 inline-block truncate max-w-full"
                    style={{ backgroundColor: styles.bg, color: styles.text }}
                  >
                    {member.category}
                  </span>

                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1 truncate w-full px-1">
                    {member.role}
                  </p>

                  {/* Interactive card quick-access download button (Requirement 6) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => handleShare(member, e)}
                      className="p-1 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-neutral-100 dark:hover:bg-zinc-800 text-gray-500"
                    >
                      {copiedId === member.id ? <Check size={10} className="text-green-500" /> : <Share2 size={10} />}
                    </button>
                    <button
                      onClick={(e) => handleDownload(member, e)}
                      className="p-1 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-neutral-100 dark:hover:bg-zinc-800 text-gray-500"
                    >
                      <Download size={10} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* PREMIUM SLIDE UP BOTTOM SHEET DETAIL MODAL (Requirement 4 & 8) */}
      <AnimatePresence>
        {selectedMember && (
          <>
            {/* Dynamic Backdrop Detail Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[110] cursor-pointer"
              style={{
                background: isDarkMode 
                  ? 'radial-gradient(circle, rgba(15, 20, 40, 0.82) 0%, rgba(7, 9, 19, 0.96) 100%)' 
                  : 'radial-gradient(circle, rgba(253, 251, 247, 0.75) 0%, rgba(225, 215, 195, 0.92) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            />

            {/* Bottom Sheet wrapper */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 max-h-[82dvh] bg-[var(--card-bg)] border-t border-[var(--border-color)] rounded-t-[32px] shadow-2xl z-[120] overflow-y-auto pb-8 select-none"
              style={{ color: 'var(--text-spiritual)' }}
            >
              {/* Grab Drag Bar */}
              <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-full mx-auto my-3" />

              <div className="px-5 pt-2 max-w-2xl mx-auto flex flex-col items-center pr-12 relative">
                
                {/* Independent Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
                >
                  <X size={18} />
                </button>

                {/* Main avatar display node */}
                <div 
                  onClick={() => setFullscreenMember(selectedMember)}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 shadow-xl border-4 border-white dark:border-neutral-900 group cursor-pointer relative"
                  title="टैप करें ज़ूम के लिए"
                >
                  {selectedMember.imageUrl ? (
                    <img
                      src={selectedMember.imageUrl}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackContainer = target.nextSibling as HTMLElement;
                        if (fallbackContainer) fallbackContainer.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="absolute inset-0 flex items-center justify-center font-extrabold text-2xl text-white select-none"
                    style={{ 
                      backgroundColor: getCategoryStyles(selectedMember.category).primary,
                      display: selectedMember.imageUrl ? 'none' : 'flex'
                    }}
                  >
                    {getInitials(selectedMember.name)}
                  </div>
                  {/* Hover visual cue overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-300 rounded-full">
                    <Maximize2 size={24} className="animate-pulse" />
                  </div>
                </div>

                <button 
                  onClick={() => setFullscreenMember(selectedMember)}
                  className="mt-2 text-[10px] font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <Maximize2 size={11} /> ज़ूम एवं फुलस्क्रीन व्यू
                </button>

                {/* Member Identity Context */}
                <h2 className="text-lg sm:text-xl font-extrabold text-center serif-text mt-4">
                  {selectedMember.name}
                </h2>

                <div className="flex gap-2 items-center mt-2 flex-wrap justify-center">
                  <span 
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold tracking-wider uppercase"
                    style={{
                      backgroundColor: getCategoryStyles(selectedMember.category).bg,
                      color: getCategoryStyles(selectedMember.category).text
                    }}
                  >
                    {selectedMember.category}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    {selectedMember.role}
                  </span>
                </div>

                {/* Biography Statement (Requirement 4) */}
                <div className="w-full mt-5 bg-neutral-50 dark:bg-zinc-900/40 rounded-2xl p-4 border border-[var(--border-color)]">
                  <p className="text-xs leading-relaxed text-left text-neutral-700 dark:text-neutral-300 font-medium">
                    {selectedMember.description || "श्रमण संघ के आदर्श नियमों का पालन करते हुए आत्म-कल्याण की राह पर अग्रसर तपस्वी साधक।"}
                  </p>
                </div>

                {/* Interactive Tool Actions */}
                <div className="flex gap-3 mt-6 w-full max-w-sm justify-center">
                  <button
                    onClick={(e) => handleShare(selectedMember, e)}
                    className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 h-11"
                  >
                    <Share2 size={14} />
                    {copiedId === selectedMember.id ? 'लिंक कॉपी हो गया' : 'wisdom साझा करें'}
                  </button>
                  <button
                    onClick={(e) => handleDownload(selectedMember, e)}
                    className="py-3 px-4 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 h-11"
                    style={{ color: 'var(--text-spiritual)' }}
                  >
                    <Download size={14} />
                    {selectedMember.imageUrl ? 'तस्वीर सहेजें' : 'जीवनी कॉपी करें'}
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN GESTURE IMAGE VIEWER */}
      <AnimatePresence>
        {fullscreenMember && (
          <FullScreenImageViewer 
            member={fullscreenMember}
            onClose={() => setFullscreenMember(null)}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

    </div>
  );
});

GalleryTab.displayName = "GalleryTab";
export default GalleryTab;
