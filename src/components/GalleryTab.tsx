import React, { useState, useMemo, useEffect, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Download, Share2, Check, RefreshCw, 
  User, Image as ImageIcon, Sliders, Info, Sparkles, BookOpen, AlertCircle, Maximize2,
  MapPin, Calendar, Tag, Filter, Globe, Crown, ArrowUpDown, SearchX
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import FullScreenImageViewer from './FullScreenImageViewer';
import { IllustratedEmptyState } from './IllustratedEmptyState';
import { devLog } from '../lib/devLog';

export interface MonasticMember {
  id: string;
  name: string;
  role: string;
  category: 'Acharya' | 'Muni' | 'Sadhvi' | 'Sadhvi Pramukha' | 'Mahashraman' | 'Events' | 'Places' | string;
  imageUrl?: string;
  description?: string;
  location?: string;
  event?: string;
  acharya?: string;
  tags?: string[];
}

interface GalleryTabProps {
  setShareToast?: (toast: { show: boolean; message: string }) => void;
  isDarkMode?: boolean;
}

// 🖼️ LAZY THUMBNAIL COMPONENT WITH INTERSECTION OBSERVER FOR HIGH PERFORMANCE
interface LazyThumbnailProps {
  src?: string;
  alt: string;
  customInitials: string;
  styles: { primary: string; bg: string; text: string };
  onClick?: (e: React.MouseEvent) => void;
}

const LazyThumbnail: React.FC<LazyThumbnailProps> = ({
  src,
  alt,
  customInitials,
  styles,
  onClick
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-3 bg-neutral-100 dark:bg-neutral-800 cursor-pointer group-hover:scale-105 transition-transform duration-300"
      title="टैप करें फुलस्क्रीन व्यू के लिए"
    >
      {isInView && src && !hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      {/* Fallback avatar or loading placeholder when image is missing or loading */}
      {(!src || hasError || !isLoaded) && (
        <div
          className="absolute inset-0 flex items-center justify-center font-extrabold text-sm sm:text-base text-white select-none transition-opacity duration-300"
          style={{ backgroundColor: styles.primary }}
        >
          {customInitials}
        </div>
      )}

      {/* Lightbox hint overlay on hover */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
        <Maximize2 size={16} />
      </div>
    </div>
  );
};

// 📖 STUNNING DEFAULT SCHOLAR ASCETICS & GALLERY DATASET (Terapanth Order Canonical Registry)
const PREPOPULATED_MEMBERS: MonasticMember[] = [
  {
    id: "acharya-mahashraman",
    name: "Acharya Shri Mahashraman Ji",
    role: "11th Spiritual Sovereign (वर्तमान अनुशास्ता)",
    category: "Mahashraman",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=60",
    description: "Born in 1962, Acharya Shri Mahashraman is the current spiritual head of the Jain Swetambar Terapanth sect. Appointed by Acharya Mahapragya, he is renowned for his extraordinary humility, deep penance, and leading the historic Ahimsa Yatra across India, Nepal, and Bhutan promoting non-violence and addiction-free living.",
    location: "New Delhi / NCR",
    event: "Ahimsa Yatra & National Pravachan",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Mahashraman", "Ahimsa Yatra", "New Delhi", "Delhi", "Pravachan", "Peace March", "11th Acharya"]
  },
  {
    id: "acharya-mahapragya",
    name: "Acharya Shri Mahapragya Ji",
    role: "10th Acharya of Terapanth Sect",
    category: "Acharya",
    imageUrl: "", 
    description: "A legendary philosopher, scholar, and meditation expert. He was the propounder of Preksha Meditation (प्रेक्षाध्यान) and Science of Living (जीवन विज्ञान). He authored over 100 books and was respected globally for his scientific synthesis of spiritual wisdom.",
    location: "Ladnun, Rajasthan",
    event: "Preksha Dhyan Camp & Science of Living",
    acharya: "Acharya Shri Mahapragya Ji",
    tags: ["Mahapragya", "Preksha Dhyan", "Ladnun", "Rajasthan", "Science of Living", "10th Acharya", "Meditation"]
  },
  {
    id: "acharya-tulsi",
    name: "Ganadhipati Acharya Tulsi Ji",
    role: "9th Acharya & Anuvrat Founder",
    category: "Acharya",
    imageUrl: "", 
    description: "One of the most visionary and reformist saints of India, who initiated the global Anuvrat Movement (अणुव्रत आंदोलन) in 1949 to nurture individual moral values regardless of caste or creed. He established Jain Vishva Bharati University in Ladnun.",
    location: "Sardarshahar, Rajasthan",
    event: "Anuvrat Movement Launch & Assembly",
    acharya: "Acharya Shri Tulsi Ji",
    tags: ["Tulsi", "Anuvrat", "Anuvrat Movement", "Sardarshahar", "Ladnun", "Rajasthan", "9th Acharya"]
  },
  {
    id: "sadhvi-pramukha-kanakprabha",
    name: "Sadhvi Pramukha Kanakprabha Ji",
    role: "8th Sadhvi Pramukha (Former Head of Nun Order)",
    category: "Sadhvi Pramukha",
    imageUrl: "", 
    description: "Appointed by Acharya Tulsi in 1972, Sadhvi Pramukha Kanakprabha Ji headed the vast order of thousands of Terapanth Sadhvis (nuns) and Samanis for over 49 years. She was a supreme organizer, poetess, and editor of canonical Agamas.",
    location: "New Delhi",
    event: "Agama Canon Editing & Sadhvi Sangha Golden Jubilee",
    acharya: "Acharya Shri Tulsi Ji & Acharya Shri Mahapragya Ji",
    tags: ["Kanakprabha", "Sadhvi Pramukha", "New Delhi", "Delhi", "Agama", "Yashokaya", "Nuns Order"]
  },
  {
    id: "sadhvi-pramukha-vishruta-vibha",
    name: "Sadhvi Pramukha Vishruta Vibha Ji",
    role: "9th Sadhvi Pramukha (वर्तमान साध्वीप्रमुखा)",
    category: "Sadhvi Pramukha",
    imageUrl: "", 
    description: "Selected as the 9th Sadhvi Pramukha of the Terapanth order under the direct supervision of Acharya Mahashraman Ji in 2022. She brings strong intellectual leadership, modern educational expertise, and spiritual discipline to the female monastic order.",
    location: "Ladnun, Rajasthan",
    event: "Sadhvi Educational Conference & Values Assembly",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Vishruta Vibha", "Sadhvi Pramukha", "Ladnun", "Rajasthan", "Education", "Nuns Order", "9th Sadhvi Pramukha"]
  },
  {
    id: "muni-jyotirmay",
    name: "Muni Jyotirmay Kumar Ji",
    role: "Prasang Scholar & Senior Ascetic (Info ID 866)",
    category: "Muni",
    imageUrl: "", 
    description: "A senior vanguard ascetic monk of the Terapanth sect with deep scholarly command of scriptural, historical, and linguistic traditions. He has served the धर्मसंघ through remarkable discipline and literary creations.",
    location: "Kolkata, West Bengal",
    event: "Prasang Scriptural Research & Chaturmas Residence",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Jyotirmay", "Info ID 866", "Kolkata", "West Bengal", "Chaturmas", "Agam", "Muni"]
  },
  {
    id: "muni-udit",
    name: "Muni Udit Kumar Ji",
    role: "Vocal Spiritual Teacher & Guide (Info ID 697)",
    category: "Muni",
    imageUrl: "", 
    description: "A popular, dynamic monk known for his inspiring discourses, spiritual songs (Bhajans), and direct interactive sessions guiding Values Education (Gyan Shala) children and Terapanth youth across India.",
    location: "Bengaluru, Karnataka",
    event: "Gyan Shala Youth Workshop & Discourse",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Udit", "Info ID 697", "Bengaluru", "Karnataka", "Gyan Shala", "Youth", "Bhajans", "Muni"]
  },
  {
    id: "sadhvi-rajimati",
    name: "Sadhvi Rajimati Ji",
    role: "Pioneer Preacher & Educator",
    category: "Sadhvi",
    imageUrl: "", 
    description: "A profound practitioner and spiritual orator within the sisterhood of Terapanth Swetambar nuns, dedicated to promoting Preksha Meditation and moral values across local communities.",
    location: "Jaipur, Rajasthan",
    event: "Preksha Meditation & Women Empowerment Session",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Rajimati", "Jaipur", "Rajasthan", "Preksha Meditation", "Women Empowerment", "Sadhvi"]
  },
  {
    id: "maryada-mahotsav-event",
    name: "162nd Maryada Mahotsav Assembly",
    role: "Annual Canon Convention & Sacred Charter",
    category: "Events",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60",
    description: "The grand annual congregation of Terapanth where monastic rules, Chaturmas assignments, and spiritual progress reports are proclaimed in the presence of Acharya Shri Mahashraman Ji.",
    location: "Sardarshahar, Rajasthan",
    event: "Maryada Mahotsav (मर्यादा महोत्सव)",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Maryada Mahotsav", "Sardarshahar", "Rajasthan", "Maryada Patra", "Convention", "Mahashraman", "Events"]
  },
  {
    id: "chaturmas-2026-event",
    name: "Chaturmas 2026 Holy Residence",
    role: "Sacred Monsoon Stay & Spiritual Discourse Series",
    category: "Events",
    imageUrl: "https://i.postimg.cc/vBQqgYTT/IMG-20260516-WA0007.jpg",
    description: "The 4-month sacred monsoon retreat where Acharya Shri Mahashraman Ji and hundreds of monks/nuns reside for intense spiritual discourses, vows, and daily community samayik.",
    location: "Surat, Gujarat",
    event: "Chaturmas 2026 (चातुर्मास 2026)",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Chaturmas", "Chaturmas 2026", "Surat", "Gujarat", "Holy Residence", "Pravachan", "Mahashraman", "Events"]
  },
  {
    id: "ahimsa-yatra-event",
    name: "Ahimsa Yatra Global Peace March",
    role: "50,000+ KM Foot Journey for Harmony & De-addiction",
    category: "Events",
    imageUrl: "https://i.postimg.cc/gJYSXzjz/IMG-20260516-WA0009.jpg",
    description: "Acharya Shri Mahashraman Ji's historic foot march across 3 nations (India, Nepal, Bhutan) promoting Harmony, Morality, and De-addiction.",
    location: "Kathmandu, Nepal & New Delhi",
    event: "Ahimsa Yatra (अहिंसा यात्रा)",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Ahimsa Yatra", "Kathmandu", "Nepal", "New Delhi", "Delhi", "Peace March", "Mahashraman", "Events"]
  },
  {
    id: "jain-vishva-bharati-place",
    name: "Jain Vishva Bharati Campus",
    role: "Deemed Spiritual University & Canonical Research Center",
    category: "Places",
    imageUrl: "https://i.postimg.cc/KzZqkGjc/IMG-20260516-WA0011.jpg",
    description: "Founded by Acharya Tulsi Ji in Ladnun, JVB is a world-class center for Jainology, Preksha Meditation, Prakrit scriptural studies, and Value Education.",
    location: "Ladnun, Rajasthan",
    event: "Spiritual Higher Education & Research",
    acharya: "Ganadhipati Acharya Tulsi Ji & Acharya Mahapragya Ji",
    tags: ["Ladnun", "Rajasthan", "Jain Vishva Bharati", "University", "Preksha Meditation", "Tulsi", "Places"]
  },
  {
    id: "terapanth-bhawan-delhi-place",
    name: "Terapanth Bhawan New Delhi",
    role: "National Community Headquarters & Ahimsa Center",
    category: "Places",
    imageUrl: "https://i.postimg.cc/CLk7fJVn/20260528-061830.jpg",
    description: "A major pilgrimage and community hub in Chhatarpur, New Delhi hosting spiritual conventions, youth forums, and daily meditation sessions.",
    location: "Chhatarpur, New Delhi",
    event: "National Spiritual Conventions & Sadhana",
    acharya: "Acharya Shri Mahashraman Ji",
    tags: ["Delhi", "New Delhi", "Chhatarpur", "Terapanth Bhawan", "Headquarters", "Places"]
  }
];

// Popular keyword chips for quick one-tap search filtering
const POPULAR_KEYWORDS = [
  { label: 'आचार्य महाश्रमण', query: 'महाश्रमण', icon: '👑' },
  { label: 'अहिंसा यात्रा', query: 'अहिंसा यात्रा', icon: '🚶‍♂️' },
  { label: 'मर्यादा महोत्सव', query: 'मर्यादा महोत्सव', icon: '🎪' },
  { label: 'चातुर्मास 2026', query: 'चातुर्मास', icon: '🌧️' },
  { label: 'प्रेक्षाध्यान', query: 'प्रेक्षाध्यान', icon: '🧘‍♂️' },
  { label: 'लाडनूं', query: 'लाडनूं', icon: '🏛️' },
  { label: 'नई दिल्ली', query: 'दिल्ली', icon: '🏙️' },
  { label: 'सूरत', query: 'सूरत', icon: '🌉' },
  { label: 'कोलकाता', query: 'कोलकाता', icon: '🌆' },
  { label: 'बेंगलुरु', query: 'बेंगलुरु', icon: '🏙️' }
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
    case 'Events':
      return { 
        bg: 'rgba(217, 119, 6, 0.1)', 
        text: '#d97706', 
        primary: '#d97706',
        border: 'rgba(217, 119, 6, 0.2)' 
      };
    case 'Places':
      return { 
        bg: 'rgba(37, 99, 235, 0.1)', 
        text: '#2563eb', 
        primary: '#2563eb',
        border: 'rgba(37, 99, 235, 0.2)' 
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
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const [selectedMember, setSelectedImage] = useState<MonasticMember | null>(null);
  const [fullscreenMember, setFullscreenMember] = useState<MonasticMember | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Firestore specific states
  const [firestoreMembers, setFirestoreMembers] = useState<MonasticMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Categories list per Priority 1, Constraint 1
  const categoriesList = useMemo(() => {
    return ['All', 'Acharya', 'Muni', 'Sadhvi', 'Sadhvi Pramukha', 'Mahashraman', 'Events', 'Places'] as const;
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
          description: data.description || '',
          location: data.location || '',
          event: data.event || '',
          acharya: data.acharya || '',
          tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
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

  // Filter members dynamically across name, role, description, location, event, acharya, category, and tags
  const filteredMembers = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    return allMembers.filter(member => {
      const matchesCategory = activeCategory === 'All' || member.category === activeCategory;
      if (!matchesCategory) return false;

      if (!cleanQuery) return true;

      const nameMatch = (member.name || '').toLowerCase().includes(cleanQuery);
      const roleMatch = (member.role || '').toLowerCase().includes(cleanQuery);
      const descMatch = (member.description || '').toLowerCase().includes(cleanQuery);
      const locationMatch = (member.location || '').toLowerCase().includes(cleanQuery);
      const eventMatch = (member.event || '').toLowerCase().includes(cleanQuery);
      const acharyaMatch = (member.acharya || '').toLowerCase().includes(cleanQuery);
      const categoryMatch = (member.category || '').toLowerCase().includes(cleanQuery);
      const tagsMatch = Array.isArray(member.tags) && member.tags.some(tag => tag.toLowerCase().includes(cleanQuery));

      return nameMatch || roleMatch || descMatch || locationMatch || eventMatch || acharyaMatch || categoryMatch || tagsMatch;
    });
  }, [allMembers, searchQuery, activeCategory]);

  // Sort photos/items based on selected dropdown sorting option
  const sortedAndFilteredMembers = useMemo(() => {
    const list = [...filteredMembers];
    if (sortBy === 'title') {
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'hi'));
    }
    if (sortBy === 'category') {
      return list.sort((a, b) => (a.category || '').localeCompare(b.category || '', 'hi'));
    }
    // Default 'date' (Newest first)
    return list;
  }, [filteredMembers, sortBy]);

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
      }).catch(err => devLog('Share dismissed', err));
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
      
      {/* SELECTION SEARCH & CONTROLS HEADER */}
      <div className="px-4 pt-4 pb-2 space-y-2.5">
        
        {/* Search Input and Sort Dropdown Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search bar */}
          <div className="relative flex items-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex-1 px-4 h-11">
            <Search className="text-gray-400 mr-2 flex-shrink-0 w-4 h-4" />
            <input 
              type="text"
              placeholder="खोजें (आचार्य, कार्यक्रम, स्थान या नाम)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[var(--text-spiritual)] placeholder:text-gray-400 font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer"
                title="खोज साफ़ करें"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Sort Dropdown Menu */}
          <div className="flex items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl px-3 h-11 shadow-sm flex-shrink-0">
            <ArrowUpDown size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hidden sm:inline">क्रम:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'category')}
              className="text-xs font-semibold bg-transparent border-none outline-none text-[var(--text-spiritual)] cursor-pointer pr-1"
            >
              <option value="date" className="bg-[var(--card-bg)]">📅 नवीनतम शामिल (Date Added)</option>
              <option value="title" className="bg-[var(--card-bg)]">🔤 शीर्षक A-Z (Title)</option>
              <option value="category" className="bg-[var(--card-bg)]">🏷️ श्रेणी (Category)</option>
            </select>
          </div>
        </div>

        {/* QUICK CATEGORY FILTER BUTTONS (Acharyas, Events, Locations) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1 flex-shrink-0 mr-0.5">
            <Filter size={11} /> त्वरित फ़िल्टर:
          </span>

          <button
            onClick={() => setActiveCategory('Acharya')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              activeCategory === 'Acharya'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105'
                : 'bg-[var(--card-bg)] text-neutral-700 dark:text-neutral-200 border-[var(--border-color)] hover:border-amber-500'
            }`}
          >
            <span>👑</span>
            <span>Acharyas (आचार्य गण)</span>
          </button>

          <button
            onClick={() => setActiveCategory('Events')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              activeCategory === 'Events'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105'
                : 'bg-[var(--card-bg)] text-neutral-700 dark:text-neutral-200 border-[var(--border-color)] hover:border-amber-500'
            }`}
          >
            <span>🎪</span>
            <span>Events (कार्यक्रम)</span>
          </button>

          <button
            onClick={() => setActiveCategory('Places')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              activeCategory === 'Places'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105'
                : 'bg-[var(--card-bg)] text-neutral-700 dark:text-neutral-200 border-[var(--border-color)] hover:border-amber-500'
            }`}
          >
            <span>📍</span>
            <span>Locations (स्थान व केंद्र)</span>
          </button>

          <button
            onClick={() => setActiveCategory('All')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              activeCategory === 'All'
                ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 border-transparent shadow-md'
                : 'bg-[var(--card-bg)] text-neutral-500 border-[var(--border-color)] hover:text-neutral-800'
            }`}
          >
            <span>✨ सभी देखें</span>
          </button>
        </div>

        {/* POPULAR QUICK KEYWORD FILTER PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 flex-shrink-0 mr-1">
            टैग्स:
          </span>
          {POPULAR_KEYWORDS.map((item) => {
            const isActive = searchQuery.toLowerCase().trim() === item.query.toLowerCase();
            return (
              <button
                key={item.label}
                onClick={() => setSearchQuery(isActive ? '' : item.query)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1 border ${
                  isActive 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                    : 'bg-neutral-100 dark:bg-zinc-800/80 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-zinc-700 hover:bg-neutral-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE SEARCH FEEDBACK BAR */}
        {searchQuery && (
          <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-xl">
            <span className="font-medium flex items-center gap-1.5">
              <Search size={12} />
              खोज परिणाम: "{searchQuery}" ({sortedAndFilteredMembers.length} मिले)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] font-bold underline hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
            >
              खोज साफ़ करें (Clear Search)
            </button>
          </div>
        )}
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

      {/* CORE VIEWGRID WITH LAZY THUMBNAILS & LIGHTBOX INTEGRATION */}
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

        {/* LOADING SKELETONS */}
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
        ) : sortedAndFilteredMembers.length === 0 ? (
          /* FRIENDLY 'NO PHOTOS FOUND' EMPTY STATE WITH CLEAR SEARCH BUTTON */
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] my-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner">
              <SearchX size={32} />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-spiritual)] mb-1">
              कोई चित्र नहीं मिले (No Photos Found)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mb-5 leading-relaxed">
              {searchQuery 
                ? `"${searchQuery}" के लिए कोई परिणाम नहीं मिला। कृपया भिन्न शब्द खोजें या फ़िल्टर साफ़ करें।` 
                : 'चयनित श्रेणी अथवा फ़िल्टर के अनुसार कोई फोटो उपलब्ध नहीं है।'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              Clear Search (खोज साफ़ करें)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {sortedAndFilteredMembers.map((member) => {
              const styles = getCategoryStyles(member.category);
              const customInitials = getInitials(member.name);
              
              return (
                <motion.div
                  key={member.id}
                  layoutId={`member-container-${member.id}`}
                  onClick={() => setSelectedImage(member)}
                  className="group relative bg-[var(--card-bg)] hover:bg-neutral-50/50 dark:hover:bg-zinc-900/60 border border-[var(--border-color)] rounded-[24px] p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Circle Image Thumbnail with Intersection Observer Lazy-Loading & Lightbox Trigger */}
                  <LazyThumbnail 
                    src={member.imageUrl}
                    alt={member.name}
                    customInitials={customInitials}
                    styles={styles}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenMember(member);
                    }}
                  />

                  {/* Name and colored role badge */}
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

                  {/* Location or Event Badge on Card */}
                  {(member.location || member.event) && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap justify-center max-w-full">
                      {member.location && (
                        <span className="text-[9px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate max-w-[120px]">
                          <MapPin size={9} className="flex-shrink-0" />
                          <span className="truncate">{member.location}</span>
                        </span>
                      )}
                      {member.event && (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate max-w-[120px]">
                          <Sparkles size={9} className="flex-shrink-0" />
                          <span className="truncate">{member.event}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Interactive card quick-access download button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => handleShare(member, e)}
                      className="p-1 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-neutral-100 dark:hover:bg-zinc-800 text-gray-500 cursor-pointer"
                      title="साझा करें"
                    >
                      {copiedId === member.id ? <Check size={10} className="text-green-500" /> : <Share2 size={10} />}
                    </button>
                    <button
                      onClick={(e) => handleDownload(member, e)}
                      className="p-1 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-neutral-100 dark:hover:bg-zinc-800 text-gray-500 cursor-pointer"
                      title="डाउनलोड करें"
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
              className="fixed inset-x-0 bottom-0 max-h-[82dvh] bg-[var(--card-bg)] border-t border-[var(--border-color)] rounded-t-[32px] shadow-2xl z-[120] overflow-y-auto pb-28 select-none"
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

                {/* Structured Metadata Highlights (Location, Event, Acharya & Tags) */}
                {(selectedMember.location || selectedMember.event || selectedMember.acharya || (selectedMember.tags && selectedMember.tags.length > 0)) && (
                  <div className="w-full mt-3 bg-neutral-50/70 dark:bg-zinc-900/30 rounded-2xl p-3.5 border border-[var(--border-color)] space-y-2 text-left">
                    {selectedMember.location && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin size={13} className="text-red-500 flex-shrink-0" />
                        <span className="font-bold text-gray-500 dark:text-gray-400">स्थान:</span>
                        <button 
                          onClick={() => { setSearchQuery(selectedMember.location || ''); setSelectedImage(null); }}
                          className="font-medium text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                          {selectedMember.location}
                        </button>
                      </div>
                    )}
                    {selectedMember.event && (
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar size={13} className="text-amber-500 flex-shrink-0" />
                        <span className="font-bold text-gray-500 dark:text-gray-400">कार्यक्रम:</span>
                        <button 
                          onClick={() => { setSearchQuery(selectedMember.event || ''); setSelectedImage(null); }}
                          className="font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          {selectedMember.event}
                        </button>
                      </div>
                    )}
                    {selectedMember.acharya && (
                      <div className="flex items-center gap-2 text-xs">
                        <Crown size={13} className="text-yellow-600 flex-shrink-0" />
                        <span className="font-bold text-gray-500 dark:text-gray-400">संबद्ध आचार्य:</span>
                        <button 
                          onClick={() => { setSearchQuery(selectedMember.acharya || ''); setSelectedImage(null); }}
                          className="font-medium text-yellow-600 dark:text-yellow-400 hover:underline cursor-pointer"
                        >
                          {selectedMember.acharya}
                        </button>
                      </div>
                    )}
                    {selectedMember.tags && selectedMember.tags.length > 0 && (
                      <div className="pt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mr-1">
                          <Tag size={10} /> टैग्स:
                        </span>
                        {selectedMember.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => { setSearchQuery(tag); setSelectedImage(null); }}
                            className="text-[10px] bg-neutral-200/80 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 px-2 py-0.5 rounded-full font-medium transition cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
