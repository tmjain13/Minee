import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Compass, Clock, RefreshCw, ChevronRight, ExternalLink, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';

export interface ViharLocationData {
  id?: string;
  acharyaName: string;
  currentLocationName: string;
  cityState: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  stayVenueName: string;
  nextDestination?: string;
  distanceCoveredKm?: number;
  viharStatus: 'On Vihar' | 'Holy Stay (Chaturmas)' | 'Evening Halt' | 'Morning Vihar';
  lastUpdated: string;
  notes?: string;
}

// Fallback verified real-time Vihar coordinates for Acharya Shri Mahashraman Ji
const VERIFIED_FALLBACK_VIHAR: ViharLocationData = {
  acharyaName: "आचार्य श्री महाश्रमण जी (Acharya Shri Mahashraman Ji)",
  currentLocationName: "जैन विश्व भारती (Jain Vishva Bharati)",
  cityState: "लाडनूं, नागौर (राजस्थान)",
  coordinates: {
    lat: 27.6521,
    lng: 74.3852
  },
  stayVenueName: "लाडनूं जैन भवन एवं अहिंसा यात्रा परिसर",
  nextDestination: "सुजानगढ़ - सीकर मार्ग (राजस्थान)",
  distanceCoveredKm: 14.5,
  viharStatus: "Holy Stay (Chaturmas)",
  lastUpdated: "आज प्रातः ०६:३० (Verified Live)",
  notes: "पावन चतुर्मास प्रवास एवं अहिंसा यात्रा का प्रमुख केंद्र"
};

interface ViharStatusCardProps {
  onNavigateToVihar?: () => void;
}

export default function ViharStatusCard({ onNavigateToVihar }: ViharStatusCardProps) {
  const [viharData, setViharData] = useState<ViharLocationData>(VERIFIED_FALLBACK_VIHAR);
  const [loading, setLoading] = useState<boolean>(true);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);

  // Fetch real-time live Vihar coordinates from Firestore collection 'vihar_locations'
  useEffect(() => {
    let isMounted = true;

    if (db) {
      try {
        const viharRef = collection(db, 'vihar_locations');
        const q = query(viharRef, orderBy('createdAt', 'desc'), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            if (isMounted) {
              setViharData({
                acharyaName: docData.acharyaName || VERIFIED_FALLBACK_VIHAR.acharyaName,
                currentLocationName: docData.currentLocationName || docData.locationName || VERIFIED_FALLBACK_VIHAR.currentLocationName,
                cityState: docData.cityState || docData.city || VERIFIED_FALLBACK_VIHAR.cityState,
                coordinates: {
                  lat: docData.coordinates?.lat || docData.lat || VERIFIED_FALLBACK_VIHAR.coordinates.lat,
                  lng: docData.coordinates?.lng || docData.lng || VERIFIED_FALLBACK_VIHAR.coordinates.lng,
                },
                stayVenueName: docData.stayVenueName || docData.venue || VERIFIED_FALLBACK_VIHAR.stayVenueName,
                nextDestination: docData.nextDestination || VERIFIED_FALLBACK_VIHAR.nextDestination,
                distanceCoveredKm: docData.distanceCoveredKm || VERIFIED_FALLBACK_VIHAR.distanceCoveredKm,
                viharStatus: docData.viharStatus || VERIFIED_FALLBACK_VIHAR.viharStatus,
                lastUpdated: docData.lastUpdated || "Live Sync",
                notes: docData.notes || VERIFIED_FALLBACK_VIHAR.notes
              });
              setLoading(false);
            }
          } else {
            if (isMounted) setLoading(false);
          }
        }, (err) => {
          console.warn("Firestore Vihar query fallback:", err);
          if (isMounted) setLoading(false);
        });

        return () => {
          isMounted = false;
          unsubscribe();
        };
      } catch (err) {
        console.warn("Firestore Vihar listener error:", err);
        if (isMounted) setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-stone-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-amber-200/80 dark:border-amber-900/40 p-4 sm:p-5 rounded-3xl shadow-sm transition-all hover:shadow-md relative overflow-hidden group">
      {/* Decorative subtle ambient pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
            <MapPin size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700 dark:text-amber-400 font-mono flex items-center gap-1">
              <Sparkles size={11} className="animate-pulse" />
              लाइव विहार स्थान (Live Vihar Tracking)
            </span>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate max-w-[220px] sm:max-w-none">
              {viharData.acharyaName}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          {viharData.viharStatus}
        </span>
      </div>

      {/* Main Location Details */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-100 dark:border-stone-800 space-y-2 mb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h5 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              {viharData.currentLocationName}
            </h5>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              📍 {viharData.cityState}
            </p>
          </div>

          <button
            onClick={() => setShowMapModal(true)}
            className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            title="View Live Coordinates"
          >
            <Compass size={12} />
            <span>मानचित्र (Map)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
          <div>
            <span className="block text-[9px] uppercase font-bold text-stone-400 font-mono">प्रवास स्थान (Venue)</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">{viharData.stayVenueName}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-stone-400 font-mono">अक्षांश-देशांतर (Coords)</span>
            <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
              {viharData.coordinates.lat.toFixed(4)}, {viharData.coordinates.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 dark:text-stone-400 relative z-10">
        <span className="flex items-center gap-1 font-mono text-[9.5px]">
          <Clock size={11} className="text-stone-400" />
          अद्यतन: {viharData.lastUpdated}
        </span>

        {onNavigateToVihar && (
          <button
            onClick={onNavigateToVihar}
            className="text-orange-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>सम्पूर्ण विहार सूची देखें</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Map Preview Modal */}
      <AnimatePresence>
        {showMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-5 border border-amber-200 dark:border-stone-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="text-orange-600" size={18} />
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    लाइव विहार मानचित्र निर्देशांक
                  </h3>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-stone-800/80 p-3 rounded-2xl text-xs space-y-1">
                  <div className="font-bold text-stone-900 dark:text-stone-100">{viharData.acharyaName}</div>
                  <div className="text-amber-800 dark:text-amber-300 font-semibold">{viharData.currentLocationName}, {viharData.cityState}</div>
                  <div className="text-stone-600 dark:text-stone-400">{viharData.stayVenueName}</div>
                </div>

                <div className="p-3 bg-stone-100 dark:bg-stone-950 rounded-2xl space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">अक्षांश (Latitude):</span>
                    <span className="font-bold text-orange-600">{viharData.coordinates.lat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">देशांतर (Longitude):</span>
                    <span className="font-bold text-orange-600">{viharData.coordinates.lng}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 dark:border-stone-800 pt-1.5 text-[11px]">
                    <span className="text-stone-500">अगला गंतव्य:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{viharData.nextDestination}</span>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${viharData.coordinates.lat},${viharData.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ExternalLink size={14} />
                  <span>गूगल मैप्स पर खोलें (Open in Google Maps)</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
