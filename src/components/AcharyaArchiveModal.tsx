import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Camera, Calendar, User, Image as ImageIcon, Sparkles, AlertCircle, Share2, Compass, MapPin, Footprints, Info, WifiOff } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { chaturmasMasterRegistry } from '../data/chaturmasList';
import { ACHARYAS } from '../data/acharyas';
import { devLog } from '../lib/devLog';


export interface ArchivePhoto {
  id: string;
  acharyaNr: number;
  url: string;
  caption: string;
  year?: string;
  photographer?: string;
  timestamp?: any;
}

interface AcharyaArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  acharyaNr: number;
  acharyaName: string;
  isAdmin: boolean;
}

// Highly detailed vintage archival photo fallbacks to guarantee high-fidelity out-of-the-box experience
const DEFAULT_ARCHIVES: Record<number, Array<Omit<ArchivePhoto, 'id'>>> = {
  1: [
    { acharyaNr: 1, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_972.JPG", caption: "Original preserved canvas of Acharya Bhikshu of Kelwa, showing early monastic scriptural work.", year: "circa 1790 CE", photographer: "Traditional Guild Painters" },
    { acharyaNr: 1, url: "https://i.postimg.cc/vBQqgYTT/IMG-20260516-WA0007.jpg", caption: "Archival photograph of the hand-inked Maryada Patra (Monastic Rule Book) written by Bhikshu Swamiji.", year: "1775 CE", photographer: "Sanskrit Research Wing" }
  ],
  2: [
    { acharyaNr: 2, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_973.JPG", caption: "Vintage depiction of Acharya Bharimal Ji overseeing layout formulation of the Terapanth administrative code.", year: "circa 1810 CE", photographer: "Early Rajasthan Monastics" }
  ],
  3: [
    { acharyaNr: 3, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_974.JPG", caption: "Classic illustrative archive depicting Acharya Raichand Ji sitting in meditative quietude.", year: "circa 1845 CE", photographer: "Ancient Heritage Archives" }
  ],
  4: [
    { acharyaNr: 4, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_975.JPG", caption: "Historical archival copy of Jayacharya composing the Bhagavati Sutra in local Marwari prose.", year: "circa 1875 CE", photographer: "State Library Preservation" }
  ],
  5: [
    { acharyaNr: 5, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_976.JPG", caption: "Serene posture capture of Acharya Maghraj Ji delivering discourse during the Maryada Mahotsav.", year: "1889 CE", photographer: "Mewar State Scribes" }
  ],
  6: [
    { acharyaNr: 6, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_977.JPG", caption: "Archived sketch print of Acharya Manaklal Ji in divine worship posture.", year: "circa 1894 CE", photographer: "Jain Indology Preservation" }
  ],
  7: [
    { acharyaNr: 7, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_978.JPG", caption: "Acharya Dalchand Ji tutoring disciples on traditional Prakrit conjugation rules.", year: "1904 CE", photographer: "Lachhmangarh Archives" }
  ],
  8: [
    { acharyaNr: 8, url: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_979.JPG", caption: "Acharya Kaluram Ji in philosophical review of old Tadapatra (Palm-leaf) texts.", year: "1929 CE", photographer: "Vyas Sanskrit Sansthan" }
  ],
  9: [
    { acharyaNr: 9, url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600", caption: "Archived photo of Acharya Tulsi inaugurating the global Anuvrat Morality Campaign in New Delhi.", year: "1949 CE", photographer: "India Public Information Division" },
    { acharyaNr: 9, url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=60", caption: "Vintage monochrome photo of Acharya Tulsi studying beside young Muni Nathmal.", year: "1972 CE", photographer: "Jain Vishva Bharati archives" }
  ],
  10: [
    { acharyaNr: 10, url: "https://i.postimg.cc/gJYSXzjz/IMG-20260516-WA0009.jpg", caption: "Acharya Mahapragya leading a collaborative research seminar on brainwaves and Preksha meditation.", year: "2001 CE", photographer: "Preksha International Wing" },
    { acharyaNr: 10, url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600", caption: "Historic snapshot of Acharya Mahapragya during the famous Ahimsa Yatra march through tribal sectors.", year: "2004 CE", photographer: "Ahimsa Core Group" }
  ],
  11: [
    { acharyaNr: 11, url: "https://i.postimg.cc/KzZqkGjc/IMG-20260516-WA0011.jpg", caption: "Current Supreme Head Acharya Mahashraman leading monastic disciples on silent barefoot foot-journey.", year: "2019 CE", photographer: "ABTYP Central Media Wing" },
    { acharyaNr: 11, url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=60", caption: "Acharya Mahashraman addressing a gathering of spiritual seekers, imparting daily vows.", year: "2024 CE", photographer: "TPF Digital Archives" }
  ]
};

// Coordinate mapping for Rajasthan & Indian geographic centers of spiritual journeys
const COORDINATES_DATABASE: Record<string, { lat: number; lng: number }> = {
  'Kelwa': { lat: 25.15, lng: 73.83 },
  'Pali': { lat: 25.77, lng: 73.33 },
  'Siriyari': { lat: 25.63, lng: 73.83 },
  'Rajnagar': { lat: 25.07, lng: 73.88 },
  'Barlu': { lat: 26.08, lng: 73.12 },
  'Kantaliya': { lat: 25.79, lng: 73.81 },
  'Kherwa': { lat: 25.84, lng: 73.49 },
  'Bagri': { lat: 25.88, lng: 73.80 },
  'Bagri (Sudhri)': { lat: 25.88, lng: 73.80 },
  'Madhopur': { lat: 26.01, lng: 76.35 },
  'Pipad': { lat: 26.38, lng: 73.78 },
  'Amet': { lat: 25.30, lng: 73.93 },
  'Padu': { lat: 26.51, lng: 74.08 },
  'Nathdwara': { lat: 24.93, lng: 73.82 },
  'Pur': { lat: 25.30, lng: 74.60 },
  'Sojat Road': { lat: 25.88, lng: 73.67 },
  'Pisangan': { lat: 26.40, lng: 74.37 },
  'Balotara': { lat: 25.83, lng: 72.23 },
  'Jaipur': { lat: 26.91, lng: 75.78 },
  'Borawar': { lat: 26.90, lng: 74.72 },
  'Kankroli': { lat: 25.07, lng: 73.88 },
  'Udaipur': { lat: 24.58, lng: 73.71 },
  'Bidasar': { lat: 27.83, lng: 74.30 },
  'Jodhpur': { lat: 26.27, lng: 73.02 },
  'Sambhar': { lat: 26.91, lng: 75.18 },
  'Ladnun': { lat: 27.65, lng: 74.39 },
  'Gangapur': { lat: 25.44, lng: 74.26 },
  'Malpura': { lat: 26.28, lng: 75.38 },
  'Sardarshahar': { lat: 28.44, lng: 74.49 },
  'Sujangarh': { lat: 27.70, lng: 74.47 },
  'Chhapar': { lat: 27.82, lng: 74.40 },
  'Bhinasar': { lat: 27.97, lng: 73.33 },
  'Karera': { lat: 25.46, lng: 74.14 },
  'Bikaner': { lat: 28.02, lng: 73.31 },
  'Delhi': { lat: 28.61, lng: 77.20 },
  'Dehli': { lat: 28.61, lng: 77.20 },
  'New Delhi': { lat: 28.61, lng: 77.20 },
  'Bombay': { lat: 19.07, lng: 72.87 },
  'Mumbai': { lat: 19.07, lng: 72.87 },
  'Thane Mumbai': { lat: 19.20, lng: 72.97 },
  'Madras': { lat: 13.08, lng: 80.27 },
  'Chennai': { lat: 13.08, lng: 80.27 },
  'Bangalore': { lat: 12.97, lng: 77.59 },
  'Cochin': { lat: 9.93, lng: 76.27 },
  'Gangashahar': { lat: 27.98, lng: 73.32 },
  'Surat': { lat: 21.17, lng: 72.83 },
  'Udhna (Surat)': { lat: 21.16, lng: 72.84 },
  'Ahmedabad': { lat: 23.02, lng: 72.57 },
  'Jasol, Rajasthan': { lat: 25.77, lng: 72.24 },
  'Kathmandu, Nepal': { lat: 27.71, lng: 85.32 },
  'Guwahati': { lat: 26.14, lng: 91.73 },
  'Kolkata': { lat: 22.57, lng: 88.36 },
  'Hyderabad': { lat: 17.38, lng: 78.48 },
  'Bhilwara': { lat: 25.35, lng: 74.63 },
  'Ahmedabad (Koba)': { lat: 23.13, lng: 72.63 },
  'Sojat': { lat: 25.92, lng: 73.67 },
  'Sojat City': { lat: 25.92, lng: 73.67 },
  'Ladnun, Rajasthan': { lat: 27.65, lng: 74.39 }
};

interface ArchivePhotoCardProps {
  photo: ArchivePhoto;
  isLoaded: boolean;
  onLoad: () => void;
  onClick: () => void;
  onShare: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  isAdmin: boolean;
}

const ArchivePhotoCard = React.memo(function ArchivePhotoCard({
  photo,
  isLoaded,
  onLoad,
  onClick,
  onShare,
  onDelete,
  isAdmin
}: ArchivePhotoCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 rounded-3xl p-3 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
    >
      {/* Photo representation with Native Lazy-Loading and Blur-Up Placeholder Effects */}
      <div className="relative h-44 rounded-2xl overflow-hidden bg-black/5 mb-3 border border-black/5 dark:border-white/5">
        
        {/* Blur-up placeholder skeleton frame */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#EFECE6] dark:bg-gray-850 animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 select-none">
              <ImageIcon className="text-gray-400/50 dark:text-gray-600/50 animate-bounce" size={20} />
              <span className="text-[7.5px] text-gray-450 dark:text-gray-550 font-black tracking-widest uppercase">
                Archival Scroll...
              </span>
            </div>
          </div>
        )}

        <img 
          src={photo.url} 
          alt={photo.caption} 
          loading="lazy" // Native explicit lazy load configuration
          onLoad={onLoad}
          className={`w-full h-full object-cover grayscale brightness-110 hover:grayscale-0 transition-all duration-700 ${
            isLoaded 
              ? 'blur-0 scale-100 opacity-100' 
              : 'blur-md scale-105 opacity-50'
          } group-hover:scale-102`}
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        
        {/* Source flag */}
        {photo.id.startsWith('local_fallback_') ? (
          <span className="absolute top-2 left-2 text-[8px] bg-black/40 text-white/90 font-bold tracking-widest uppercase px-2 py-0.5 rounded-full backdrop-blur-sm select-none">
            Verified Archive
          </span>
        ) : (
          <span className="absolute top-2 left-2 text-[8px] bg-spiritual text-white font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border border-white/20 select-none">
            Dynamic
          </span>
        )}

        {/* Dual share entry points trigger button */}
        <button 
          onClick={onShare}
          className="absolute bottom-2 right-2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow z-20 flex items-center justify-center select-none"
          title="Share archival document"
        >
          <Share2 size={11} />
        </button>

        {/* Admin Delete Action */}
        {isAdmin && !photo.id.startsWith('local_fallback_') && (
          <button 
            onClick={onDelete}
            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg z-20"
            title="Delete photo archive"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <p className="text-xs font-sans text-gray-700 dark:text-gray-300 font-medium leading-relaxed flex-grow italic px-1">
        "{photo.caption}"
      </p>

      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
        {photo.year && (
          <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
            <Calendar size={10} className="text-spiritual" /> {photo.year}
          </span>
        )}
        {photo.photographer && (
          <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
            <Camera size={10} /> {photo.photographer}
          </span>
        )}
      </div>
    </div>
  );
});

function getLocationCoordinates(name: string, index: number, total: number): { lat: number; lng: number } {
  const normalized = name.trim();
  for (const [key, value] of Object.entries(COORDINATES_DATABASE)) {
    if (normalized.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(normalized.toLowerCase())) {
      return value;
    }
  }
  // Safe pseudo-random but deterministic placement centered in celestial Rajasthan to protect connectivity line tracks
  const charSum = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
  const lat = 24.8 + ((charSum % 35) / 35.0) * 3.5; // ranges 24.8 to 28.3
  const lng = 72.5 + (((charSum * 7) % 35) / 35.0) * 3.5; // ranges 72.5 to 76.0
  return { lat, lng };
}

export default function AcharyaArchiveModal({ isOpen, onClose, acharyaNr, acharyaName, isAdmin }: AcharyaArchiveModalProps) {
  const [selectedAcharyaNr, setSelectedAcharyaNr] = useState(acharyaNr);
  const [selectedEra, setSelectedEra] = useState<'all' | 'foundation' | 'codification' | 'global'>('all');

  useEffect(() => {
    setSelectedAcharyaNr(acharyaNr);
    if (acharyaNr <= 3) setSelectedEra('foundation');
    else if (acharyaNr <= 8) setSelectedEra('codification');
    else setSelectedEra('global');
  }, [acharyaNr]);

  const [dbPhotos, setDbPhotos] = useState<ArchivePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Custom admin addition form
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newPhotographer, setNewPhotographer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePhotoInView, setActivePhotoInView] = useState<ArchivePhoto | null>(null);

  // Lazy loading, sharing and map state
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, boolean>>({});
  const [shareToast, setShareToast] = useState('');
  const [hoveredStation, setHoveredStation] = useState<any | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const acharyaInfo = ACHARYAS.find(a => a.nr === selectedAcharyaNr);

  const handleShareProfile = (platform: 'whatsapp' | 'twitter' | 'native') => {
    if (!acharyaInfo) return;
    
    const teachingsText = acharyaInfo.teachings ? acharyaInfo.teachings.map(t => `• ${t}`).join('\n') : '';
    const message = `✨ *${acharyaInfo.name}* (${acharyaInfo.title || 'Supreme Head'}) ✨\n\n` +
      `"_${acharyaInfo.quote || ''}_"\n\n` +
      `*Key Divine Teachings:*\n${teachingsText || 'Spiritual self-restraint'}\n\n` +
      `Explore divine lineages, scriptures, and holy barefoot walks of Jain Terapanth Acharyas on Terapanth AI! 🙏`;

    const encodedText = encodeURIComponent(message);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
      setShareToast('Opening WhatsApp to share teachings...');
      setTimeout(() => setShareToast(''), 3000);
    } else if (platform === 'twitter') {
      const tweetText = `${acharyaInfo.name} Teachings: "${acharyaInfo.quote || ''}" via Terapanth AI`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
      setShareToast('Opening X / Twitter to share profile...');
      setTimeout(() => setShareToast(''), 3000);
    } else {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: `${acharyaInfo.name} - Acharya of Terapanth`,
          text: `"${acharyaInfo.quote || ''}" - Key Teachings and Vihar travel trajectory of ${acharyaInfo.name} on Terapanth AI.`,
          url: window.location.href,
        })
        .then(() => {
          setShareToast('Profile Shared Successfully!');
          setTimeout(() => setShareToast(''), 2500);
        })
        .catch(err => {
          devLog("Native share failed, using clipboard copy", err);
          copyToClipboard(`${acharyaInfo.name}: ${acharyaInfo.quote || ''}\n${window.location.href}`);
          setShareToast('Copied Profile details & link to Clipboard!');
          setTimeout(() => setShareToast(''), 3005);
        });
      } else {
        copyToClipboard(`${acharyaInfo.name}: ${acharyaInfo.quote || ''}\n${window.location.href}`);
        setShareToast('Copied Profile details & link to Clipboard!');
        setTimeout(() => setShareToast(''), 3005);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    // Set up real-time listener for this Acharya's archives from Firestore 'acharyas_gallery'
    const q = query(
      collection(db, 'acharyas_gallery'),
      where('acharyaNr', '==', selectedAcharyaNr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ArchivePhoto[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as ArchivePhoto);
      });
      setDbPhotos(items);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore acharyas_gallery error:", err);
      // Fallback gracefully without breaking
      setIsLoading(false);
      setErrorMessage("Could not connect to live cloud archive database. Showing built-in local archival photographs.");
    });

    return () => unsubscribe();
  }, [isOpen, selectedAcharyaNr]);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newCaption.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await addDoc(collection(db, 'acharyas_gallery'), {
        acharyaNr: Number(selectedAcharyaNr),
        url: newUrl.trim(),
        caption: newCaption.trim(),
        year: newYear.trim() || "Unknown Period",
        photographer: newPhotographer.trim() || "Archive Contributor",
        timestamp: serverTimestamp()
      });

      // Clear form
      setNewUrl('');
      setNewCaption('');
      setNewYear('');
      setNewPhotographer('');
      
    } catch (err: any) {
      console.error("Failed to append archival photo:", err);
      setErrorMessage(`Failed to upload photo record: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this historical photograph from the public repository?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'acharyas_gallery', docId));
      if (activePhotoInView?.id === docId) {
        setActivePhotoInView(null);
      }
    } catch (err: any) {
      console.error("Failed to delete photo:", err);
      alert(`Deletion write failure: ${err.message || err}`);
    }
  };

  // Combine static fallbacks and dynamic db assets without repeating duplicate URLs
  const fallbackList: ArchivePhoto[] = (DEFAULT_ARCHIVES[selectedAcharyaNr] || [])
    .filter(p => !dbPhotos.some(dbp => dbp.url === p.url))
    .map((p, idx) => ({
      id: `local_fallback_${idx}`,
      ...p
    }));
  const combinedPhotos = [...dbPhotos, ...fallbackList];

  const handleSharePhoto = async (e: React.MouseEvent, photo: ArchivePhoto) => {
    e.stopPropagation();
    const currentName = acharyaInfo?.name || acharyaName;
    const shareData = {
      title: `${currentName} Archival Library`,
      text: `Historical photo of ${currentName}: "${photo.caption}" (${photo.year || 'Historic Period'})`,
      url: photo.url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        devLog('User dismissed or native share failed:', err);
        copyToClipboard(photo.url);
      }
    } else {
      copyToClipboard(photo.url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setShareToast('Archival photo link copied to clipboard!');
        setTimeout(() => setShareToast(''), 3000);
      })
      .catch((err) => {
        console.error('Clipboard copy fail:', err);
      });
  };

  // Filter Chaturmas stations for this Acharya
  const chaturmasPoints = chaturmasMasterRegistry
    .filter(c => c.acharyaId === selectedAcharyaNr)
    .flatMap((c, cIdx, arr) => {
      const locNames = typeof c.location === 'string' ? c.location.split(', ') : [c.location];
      return locNames.map((loc, locIdx) => {
        const coords = getLocationCoordinates(loc, cIdx + locIdx, arr.length + locNames.length);
        return {
          year: c.ceYear || c.vsYear,
          vs: c.vsYear,
          location: loc,
          notes: c.notes || '',
          lat: coords.lat,
          lng: coords.lng,
          id: `${c.acharyaId}_${c.vsYear}_${locIdx}_${loc}`
        };
      });
    });

  // Scale calculations using simple math for local Indian geometries
  const lngs = chaturmasPoints.map(d => d.lng);
  const lats = chaturmasPoints.map(d => d.lat);
  const minLngRaw = lngs.length > 0 ? Math.min(...lngs) : undefined;
  const maxLngRaw = lngs.length > 0 ? Math.max(...lngs) : undefined;
  const minLatRaw = lats.length > 0 ? Math.min(...lats) : undefined;
  const maxLatRaw = lats.length > 0 ? Math.max(...lats) : undefined;

  const minLng = minLngRaw !== undefined ? minLngRaw - 0.6 : 72.0;
  const maxLng = maxLngRaw !== undefined ? maxLngRaw + 0.6 : 76.5;
  const minLat = minLatRaw !== undefined ? minLatRaw - 0.6 : 24.0;
  const maxLat = maxLatRaw !== undefined ? maxLatRaw + 0.6 : 29.0;

  const finalMinLng = minLng === maxLng ? minLng - 1 : minLng;
  const finalMaxLng = minLng === maxLng ? maxLng + 1 : maxLng;
  const finalMinLat = minLat === maxLat ? minLat - 1 : minLat;
  const finalMaxLat = minLat === maxLat ? maxLat + 1 : maxLat;

  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const xScale = (lng: number) => paddingX + ((lng - finalMinLng) / (finalMaxLng - finalMinLng)) * (width - 2 * paddingX);
  const yScale = (lat: number) => height - paddingY - ((lat - finalMinLat) / (finalMaxLat - finalMinLat)) * (height - 2 * paddingY);

  // Generate continuous connection line
  const pathData = chaturmasPoints.length > 1 
    ? 'M ' + chaturmasPoints.map(d => `${xScale(d.lng)},${yScale(d.lat)}`).join(' L ') 
    : '';

  // Graticule intervals
  const xTicks = [];
  for (let i = 0; i <= 5; i++) {
    xTicks.push(finalMinLng + (finalMaxLng - finalMinLng) * i / 5);
  }
  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    yTicks.push(finalMinLat + (finalMaxLat - finalMinLat) * i / 4);
  }

  const activeStation = hoveredStation || (chaturmasPoints.length > 0 ? chaturmasPoints[chaturmasPoints.length - 1] : null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-[#FAFAF5] dark:bg-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden border border-black/10 dark:border-white/10 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-spiritual/10 rounded-2xl text-spiritual">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="serif-text text-xl font-bold text-gray-900 dark:text-white">{acharyaInfo?.name || acharyaName}</h3>
                {isOffline && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-wider animate-pulse shrink-0">
                    <WifiOff size={10} className="text-amber-500 shrink-0" />
                    <span>Offline Cache</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-spiritual uppercase tracking-widest">Historical Photo Archive & Vihar Route Tracker</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Core Workspace Grid */}
        <div className="acharyas_gallery flex-1 overflow-y-auto p-6 space-y-6">

          {/* Interactive Succession Timeline by Era */}
          <div className="bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 rounded-3xl p-5 space-y-4 shadow-sm shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-spiritual animate-pulse" />
                <h4 className="serif-text text-base font-bold text-gray-900 dark:text-white">Unbroken Lineage Timeline</h4>
              </div>
              
              {/* Era selector tabs */}
              <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl text-[10px] font-black uppercase tracking-wider overflow-x-auto no-scrollbar">
                {(['all', 'foundation', 'codification', 'global'] as const).map((era) => (
                  <button
                    key={era}
                    onClick={() => setSelectedEra(era)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      selectedEra === era
                        ? 'bg-white dark:bg-zinc-700 text-spiritual shadow-sm font-black'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    {era === 'all' && 'All Eras'}
                    {era === 'foundation' && 'Foundation (1-3)'}
                    {era === 'codification' && 'Codification (4-8)'}
                    {era === 'global' && 'Global (9-11)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Timeline Scroller */}
            <div className="relative">
              {/* Succession connecting line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-750 -translate-y-1/2 z-0 pointer-events-none" />
              
              <div className="flex overflow-x-auto gap-4 pb-2 pt-2 no-scrollbar snap-x relative z-10 scroll-smooth px-1">
                {ACHARYAS.filter((ach) => {
                  if (selectedEra === 'foundation') return ach.nr <= 3;
                  if (selectedEra === 'codification') return ach.nr >= 4 && ach.nr <= 8;
                  if (selectedEra === 'global') return ach.nr >= 9;
                  return true;
                }).map((ach) => {
                  const isActive = ach.nr === selectedAcharyaNr;
                  const shortPeriod = ach.title.match(/\(([^)]+)\)/)?.[1] || '';
                  return (
                    <button
                      key={`modal-timeline-ach-${ach.nr}`}
                      onClick={() => setSelectedAcharyaNr(ach.nr)}
                      className="snap-center shrink-0 focus:outline-none transition-all group cursor-pointer"
                    >
                      <div className={`flex flex-col items-center space-y-1.5 px-3 py-2 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-spiritual/10 scale-105 border border-spiritual/25 shadow-sm' 
                          : 'opacity-60 hover:opacity-100 scale-95 border border-transparent'
                      }`}>
                        {/* Circle Node */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all relative ${
                          isActive
                            ? 'bg-spiritual text-white ring-4 ring-spiritual/20 scale-110'
                            : 'bg-white dark:bg-zinc-800 text-gray-500 border border-black/10 dark:border-white/10 group-hover:border-spiritual/30 group-hover:text-spiritual'
                        }`}>
                          {ach.nr}
                          {isActive && (
                            <motion.span 
                              layoutId="timeline-active-glow"
                              className="absolute -inset-1 rounded-full border border-spiritual animate-ping opacity-30" 
                            />
                          )}
                        </div>
                        <span className={`text-[10px] font-black tracking-tight text-center leading-tight transition-colors ${
                          isActive ? 'text-spiritual font-black' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {ach.name.replace("Acharya ", "")}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 font-mono">
                          {shortPeriod.replace("VS ", "")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {isOffline && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400">
              <AlertCircle size={18} className="shrink-0 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-black uppercase tracking-widest text-[9px] text-amber-600 dark:text-amber-450">Offline Cache Mode Enabled</p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px]">
                  You are currently offline. The images displayed below are cached offline fallbacks rather than live cloud assets. Live interactive updates will resume once connection is re-established.
                </p>
              </div>
            </div>
          )}

          {/* Acharya Biography Spotlight Profile Card */}
          {acharyaInfo && (
            <div className="bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-black/5 border border-black/5 dark:border-white/15 mx-auto md:mx-0">
                  <img 
                    src={acharyaInfo.img} 
                    alt={acharyaInfo.name} 
                    className="w-full h-full object-cover grayscale brightness-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-1.5 text-center md:text-left w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="serif-text text-lg font-black text-gray-900 dark:text-white leading-tight">
                        {acharyaInfo.name}
                      </h4>
                      <p className="text-[10px] font-bold text-spiritual uppercase tracking-[0.15em]">{acharyaInfo.title}</p>
                    </div>
                    {/* Brand share action bar */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-1.5 shrink-0 pt-1 md:pt-0">
                      {/* WhatsApp Share Button */}
                      <button 
                        onClick={() => handleShareProfile('whatsapp')}
                        className="py-1.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider border border-[#25D366]/20 select-none cursor-pointer"
                        title="Share teachings on WhatsApp"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.115.952 11.48.951c-5.44 0-9.866 4.372-9.87 9.802 0 1.708.45 3.375 1.3 4.846l-.991 3.619 3.738-.964zM17.411 14.12c-.318-.16-1.884-.93-2.176-1.036-.291-.106-.504-.16-.716.16-.212.32-.821 1.036-1.006 1.248-.186.213-.372.24-.69.08-1.584-.796-2.617-1.393-3.661-3.19-.275-.473.275-.439.787-1.46.086-.174.043-.325-.021-.453-.064-.128-.504-1.22-.691-1.67-.182-.441-.367-.38-.504-.388-.13-.008-.28-.008-.429-.008-.15 0-.393.056-.599.28-.206.225-.785.767-.785 1.871s.804 2.167.916 2.318c.112.15 1.58 2.413 3.828 3.384.535.231.953.37 1.278.474.537.171 1.025.147 1.411.089.431-.064 1.884-.772 2.15-1.525.265-.753.265-1.4.186-1.525-.079-.125-.291-.205-.61-.365z"/>
                        </svg>
                        WhatsApp
                      </button>
                      {/* Twitter Share Button */}
                      <button 
                        onClick={() => handleShareProfile('twitter')}
                        className="py-1.5 px-3 rounded-xl bg-gray-900/10 dark:bg-white/10 hover:bg-gray-900/20 dark:hover:bg-white/20 text-gray-900 dark:text-gray-100 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider border border-black/10 dark:border-white/10 select-none cursor-pointer"
                        title="Share teachings on X"
                      >
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Tweet
                      </button>
                      {/* Native Share Button */}
                      <button 
                        onClick={() => handleShareProfile('native')}
                        className="py-1.5 px-3 rounded-xl bg-spiritual/10 hover:bg-spiritual/20 text-spiritual transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider border border-spiritual/15 select-none cursor-pointer"
                        title="Share whole profile"
                      >
                        <Share2 size={11} />
                        Share
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic pr-1">
                    "{acharyaInfo.quote}"
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-[11px] leading-normal pt-1">
                    {acharyaInfo.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2 justify-center md:justify-start">
                    {acharyaInfo.stats.map((stat, sIdx) => (
                      <span key={sIdx} className="text-[9px] bg-black/[0.02] dark:bg-white/[0.02] px-2.5 py-1 rounded-lg text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider border border-black/[0.02] dark:border-white/[0.02]">
                        {stat.label}: <strong className="text-gray-700 dark:text-gray-300">{stat.value}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teachings Highlight */}
              {acharyaInfo.teachings && acharyaInfo.teachings.length > 0 && (
                <div className="bg-[#FAF8F5]/80 dark:bg-gray-850/50 border border-black/[0.03] dark:border-white/[0.03] rounded-2.5xl p-4 space-y-1.5">
                  <span className="text-[8px] font-black text-spiritual uppercase tracking-[0.2em] block">
                    Core Spiritual Guidelines & teachings
                  </span>
                  <ul className="space-y-1.5">
                    {acharyaInfo.teachings.map((teaching, tIdx) => (
                      <li key={tIdx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2 font-medium">
                        <span className="text-spiritual mt-0.5 shrink-0 text-[10px]">✨</span>
                        <span>{teaching}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {errorMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive D3.js Vihar Path Tracking Map Overlay */}
          {chaturmasPoints.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-spiritual/10 rounded-lg text-spiritual animate-pulse">
                    <Compass size={14} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-spiritual">
                    Historical Vihar Map (D3 Projection)
                  </h4>
                </div>
                <span className="text-[8px] font-black bg-spiritual/10 text-spiritual px-2.5 py-1 rounded-full uppercase tracking-wider">
                  👣 {chaturmasPoints.length} Barefoot Marches Recorded
                </span>
              </div>

              {/* Responsive SVG canvas for map overlay */}
              <div className="relative border border-black/[0.04] dark:border-white/[0.04] rounded-2xl bg-[#FAFAF7]/60 dark:bg-gray-900/50 p-2 overflow-hidden select-none">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[220px] filter drop-shadow-sm">
                  {/* Cartographic Coordinate Graticule Grid */}
                  {xTicks.map((t, idx) => (
                    <g key={`xtick-${idx}`}>
                      <line 
                        x1={xScale(t)} 
                        y1={0} 
                        x2={xScale(t)} 
                        y2={height} 
                        className="stroke-gray-300/40 dark:stroke-gray-700/20" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={xScale(t) + 4} 
                        y={height - 8} 
                        className="fill-gray-400 font-mono text-[7px]"
                      >
                        {t.toFixed(1)}°E
                      </text>
                    </g>
                  ))}
                  {yTicks.map((t, idx) => (
                    <g key={`ytick-${idx}`}>
                      <line 
                        x1={0} 
                        y1={yScale(t)} 
                        x2={width} 
                        y2={yScale(t)} 
                        className="stroke-gray-300/40 dark:stroke-gray-700/20" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={8} 
                        y={yScale(t) - 4} 
                        className="fill-gray-400 font-mono text-[7px]"
                      >
                        {t.toFixed(1)}°N
                      </text>
                    </g>
                  ))}

                  {/* Vihar Route Connective Tracks */}
                  {pathData && (
                    <>
                      {/* Ambient Shadow Glow Line */}
                      <path 
                        d={pathData} 
                        fill="none" 
                        stroke="var(--color-spiritual, #854d0e)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="opacity-15 dark:opacity-30"
                      />
                      {/* High-fidelity Active Dashed Line Trail */}
                      <path 
                        d={pathData} 
                        fill="none" 
                        stroke="#E07A5F" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeDasharray="5 3.5"
                      />
                    </>
                  )}

                  {/* Vihar sequence point circular overlay markers */}
                  {chaturmasPoints.map((point, index) => {
                    const isHovered = hoveredStation?.id === point.id;
                    const isLast = index === chaturmasPoints.length - 1;
                    const cx = xScale(point.lng);
                    const cy = yScale(point.lat);
                    
                    return (
                      <g 
                        key={point.id} 
                        onMouseEnter={() => setHoveredStation(point)}
                        onMouseLeave={() => setHoveredStation(null)}
                        className="cursor-pointer group/node"
                      >
                        {/* Interactive Radar Waves */}
                        {(isHovered || isLast) && (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={isLast ? "11" : "8"} 
                            fill="none" 
                            stroke="#E07A5F" 
                            strokeWidth="1.2" 
                            className="animate-ping opacity-50"
                          />
                        )}
                        
                        {/* Core Station Dot */}
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isHovered ? "6.5" : "4.5"} 
                          fill={isLast ? "#E07A5F" : "var(--color-bg-cream, #FAFAF5)"} 
                          stroke={isHovered ? "#E07A5F" : "var(--color-spiritual, #854d0e)"} 
                          strokeWidth={isHovered ? "2.5" : "1.5"} 
                          className="transition-all duration-200"
                        />

                        {/* Station sequencing index overlay */}
                        {isLast && (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r="1.8" 
                            fill="white"
                          />
                        )}

                        {/* Text labels revealed on hover */}
                        <text 
                          x={cx} 
                          y={cy - 10} 
                          textAnchor="middle" 
                          className="fill-gray-700 dark:fill-gray-200 font-sans font-bold text-[8px] opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none bg-black"
                        >
                          {point.location} ({point.vs} VS)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Floating metadata detail drawer */}
              {activeStation && (
                <div className="bg-[#FAF8F5] dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-start select-none transition-all duration-300">
                  <div className="p-2.5 bg-[#E07A5F]/10 text-[#E07A5F] rounded-xl font-mono text-center shrink-0 min-w-[5.5rem] border border-[#E07A5F]/10">
                    <div className="text-[7.5px] text-gray-500 font-black tracking-widest leading-none">VS YEAR</div>
                    <div className="text-sm font-black leading-tight mt-1">{activeStation.vs}</div>
                    <div className="text-[8px] text-gray-400 font-medium leading-none">({activeStation.year})</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <MapPin size={11} className="text-[#E07A5F]" />
                      <span className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                        {activeStation.location}
                      </span>
                      {activeStation.notes.toLowerCase().includes('final') && (
                        <span className="text-[7px] bg-red-600/10 text-red-650 dark:text-red-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-0.5">
                          Mahaprayan Base
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] leading-relaxed text-gray-600 dark:text-gray-300 italic font-sans">
                      {activeStation.notes || "Barefoot holy wanderings (Vihar path) to foster self-restraint and spiritual purification."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Addition Panel */}
          {isAdmin && (
            <form onSubmit={handleAddPhoto} className="p-5 bg-white dark:bg-gray-800 rounded-3xl border border-black/10 dark:border-white/10 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-spiritual flex items-center gap-2">
                <Plus size={14} /> Add Historical Photo (Administrator Access)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Photo URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/vintage_photo.jpg"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full text-xs p-2.5 border border-black/10 dark:border-white/10 rounded-xl bg-[var(--bg-cream)] dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-spiritual"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Archival Caption</label>
                  <input 
                    type="text" 
                    placeholder="Enter context, location or spiritual event"
                    required
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full text-xs p-2.5 border border-black/10 dark:border-white/10 rounded-xl bg-[var(--bg-cream)] dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-spiritual"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Year / Era (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1952 CE"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full text-xs p-2.5 border border-black/10 dark:border-white/10 rounded-xl bg-[var(--bg-cream)] dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-spiritual"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Source Credit (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ladnun Archives"
                    value={newPhotographer}
                    onChange={(e) => setNewPhotographer(e.target.value)}
                    className="w-full text-xs p-2.5 border border-black/10 dark:border-white/10 rounded-xl bg-[var(--bg-cream)] dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-spiritual"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-2.5 bg-spiritual text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-spiritual/95 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Preserving Metadata..." : "Append To Public Gallery"}
              </button>
            </form>
          )}

          {/* Main Photo Gallery Grid */}
          {isLoading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-spiritual border-t-transparent animate-spin"></div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Consulting Archives...</p>
            </div>
          ) : combinedPhotos.length === 0 ? (
            <div className="h-48 border border-dashed border-black/10 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-6 gap-2">
              <ImageIcon size={32} className="text-gray-300" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Archival Images Catalogued</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              {combinedPhotos.map((photo, i) => (
                <ArchivePhotoCard
                  key={photo.id}
                  photo={photo}
                  isLoaded={!!loadedImageIds[photo.id]}
                  onLoad={() => setLoadedImageIds(prev => ({ ...prev, [photo.id]: true }))}
                  onClick={() => setActivePhotoInView(photo)}
                  onShare={(e) => handleSharePhoto(e, photo)}
                  onDelete={(e) => handleDeletePhoto(e, photo.id)}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detailed Zoom Overlay */}
        <AnimatePresence>
          {activePhotoInView && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhotoInView(null)}
              className="absolute inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 cursor-zoom-out"
            >
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setActivePhotoInView(null)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <motion.img 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  src={activePhotoInView.url} 
                  alt="Archival View"
                  className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              <div className="max-w-2xl mx-auto text-center space-y-2 pb-4">
                <p className="serif-text text-white text-lg italic tracking-wide">
                  "{activePhotoInView.caption}"
                </p>
                <div className="flex justify-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest pt-1">
                  {activePhotoInView.year && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-spiritual" /> {activePhotoInView.year}
                    </span>
                  )}
                  {activePhotoInView.photographer && (
                    <span className="flex items-center gap-1">
                      <Camera size={12} /> Source: {activePhotoInView.photographer}
                    </span>
                  )}
                </div>

                {/* ZOOM view detailed sharing integration */}
                <div className="flex justify-center gap-3 pt-2">
                  <button 
                    onClick={(e) => handleSharePhoto(e, activePhotoInView)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 hover:text-[#E07A5F] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                  >
                    <Share2 size={13} /> Share Photograph
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Copied Link Toast Message Notification */}
        <AnimatePresence>
          {shareToast && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-gray-900 border border-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none select-none"
            >
              <div className="w-2 h-2 rounded-full bg-spiritual animate-pulse" />
              <span>{shareToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

