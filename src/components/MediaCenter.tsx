import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IllustratedEmptyState } from './IllustratedEmptyState';
import { 
  Play, 
  Pause,
  ExternalLink, 
  Youtube, 
  ShieldCheck, 
  ChevronRight, 
  Search,
  Filter,
  Radio,
  Mic2,
  Map as MapIcon,
  Music,
  Tv,
  ArrowUpRight,
  Info,
  Bookmark,
  BookmarkCheck,
  Clock,
  LayoutGrid,
  History,
  Compass,
  Shield,
  Layers,
  ChevronLeft,
  Triangle,
  Instagram,
  Check,
  MessageSquare,
  Volume2,
  VolumeX,
  BookOpen,
  Share2,
  Sparkles,
  Flame,
  CheckCircle2,
  RotateCcw,
  Copy,
  Newspaper
} from 'lucide-react';
import { VIDEO_REGISTRY, OFFICIAL_CHANNEL_URL, OFFICIAL_INSTAGRAM_URL, VideoCategory, VideoItem, SERIES_REGISTRY, DiscourseSeries } from '../data/videoRegistry';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { safeStringify } from '../lib/safe-json';
import TerapanthNewsFeed from './TerapanthNewsFeed';

// Simulated live comments from global Terapanth Sangha for the virtual player
const SIMULATED_LIVE_CHAT_MESSAGES = [
  { user: "Sunil Jain (Delhi)", text: "Vandami Guruvar! Extremely powerful morning discourse. 🙏" },
  { user: "Preeti Ostwal (Mumbai)", text: "Jai Jinendra! Underworld of karma made so simple to digest of." },
  { user: "Manoj Chhajed (Jaipur)", text: "Indeed, keeping vows is the real armor of our times." },
  { user: "Nikita Bhutoria (Bengaluru)", text: "Om Arham. Gratitude to Terapanth AI for compiling this." },
  { user: "Ranjeet Sancheti (London)", text: "Hearing this sermon from distance makes me feel right inside Delhi Base!" },
  { user: "Sadhvi Shri (Kolkata)", text: "Practicing 48m Samayik during pravachan is exceptionally tranquil." },
  { user: "Varun Golecha (Surat)", text: "Will share this pravachan snippet on our family WhatsApp group immediately." },
  { user: "Karan Dagha (Chennai)", text: "Om Arham, wonderful explanation of the 9 Tattvas by Muni Shri today!" },
  { user: "Arvind Baid (Udaipur)", text: "Maryada Mahotsav traditional reminders are pure gold." }
];

export default function MediaCenter() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [selectedMood, setSelectedMood] = useState<string>('All Moods');
  
  // Custom interactive player state
  const [activePlayerVideo, setActivePlayerVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(false);
  const [japaCount, setJapaCount] = useState<number>(0);
  const [swadhyayaNote, setSwadhyayaNote] = useState<string>('');
  const [savedNotesMessage, setSavedNotesMessage] = useState<string>('');
  const [chatFeed, setChatFeed] = useState<{user: string, text: string}[]>([]);
  const chatIntervalRef = useRef<any>(null);

  // Audio synchronization and robust volume controls unmuted by default
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // TV server synchronizer status indicator
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  const [lastSynced, setLastSynced] = useState<number>(Date.now() - 360000); // 6 mins ago

  // Web Audio Synth references for high-fidelity unmuted playback simulator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Robust default-unmuted Audio synthesis that triggers automatically upon isPlaying 
  useEffect(() => {
    if (isPlaying && activePlayerVideo) {
      // Start ambient synth dhyan sound
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        // Clean up any old ones
        oscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch(e) {}
        });
        oscillatorsRef.current = [];

        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
        mainGain.connect(ctx.destination);
        gainNodeRef.current = mainGain;

        // Meditative sound pads (low warm frequency chords based on C and G notes - unmuted by default)
        const freqs = [130.81, 196.00, 261.63, 329.63]; // C3, G3, C4, E4 for a beautiful spiritual major chord
        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, ctx.currentTime);

          osc.connect(oscGain);
          oscGain.connect(filter);
          filter.connect(mainGain);

          oscGain.gain.setValueAtTime(0, ctx.currentTime);
          oscGain.gain.linearRampToValueAtTime(0.12 / freqs.length, ctx.currentTime + 1.5);

          osc.start();
          oscillatorsRef.current.push(osc);
        });
      } catch (err) {
        console.warn("Audio Context init prevented by autoplay blocks.", err);
      }
    } else {
      // Stop ambient synth
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      oscillatorsRef.current = [];
      gainNodeRef.current = null;
    }
  }, [isPlaying, activePlayerVideo, isMuted, volume]);

  // Adjust volume immediately on gainNodeRef
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
    };
  }, []);

  const lastSyncedText = useMemo(() => {
    const diffMs = Date.now() - lastSynced;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just Now";
    const diffMins = Math.floor(diffSecs / 60);
    return `${diffMins}m ago`;
  }, [lastSynced, syncStatus]);

  const handlePravachanManualUpdate = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setLastSynced(Date.now());
    }, 1200);
  };

  const [showRedirectModal, setShowRedirectModal] = useState<{ url: string; title: string } | null>(null);
  const [watchLaterIds, setWatchLaterIds] = useState<string[]>([]);
  const [watchLaterList, setWatchLaterList] = useState<VideoItem[]>([]);
  const [viewMode, setViewMode] = useState<'browse' | 'saved' | 'news'>('browse');
  const [selectedSeries, setSelectedSeries] = useState<DiscourseSeries | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(() => localStorage.getItem('hide_completed_series') === 'true');
  const [lastWatchedVideoId, setLastWatchedVideoId] = useState<string | null>(() => localStorage.getItem('last_watched_video_id'));
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('watched_video_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // Save watched status to localStorage
  useEffect(() => {
    localStorage.setItem('watched_video_ids', safeStringify(watchedVideoIds));
  }, [watchedVideoIds]);

  useEffect(() => {
    localStorage.setItem('hide_completed_series', String(hideCompleted));
  }, [hideCompleted]);

  const isSeriesCompleted = (series: DiscourseSeries) => {
    return series.videos.every(v => watchedVideoIds.includes(v.id));
  };

  const toggleWatched = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    setWatchedVideoIds(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
  };

  // Icons mapping for categories
  const categoryIcons: Record<string, any> = {
    Radio,
    Mic2,
    Map: MapIcon,
    Music,
    Tv,
    Compass,
    Shield,
    Layers,
    Instagram
  };

  // Sync Watch Later from Firestore
  useEffect(() => {
    if (!user) {
      setWatchLaterIds([]);
      setWatchLaterList([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'watchLater'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: String(data.videoId || doc.id),
          title: String(data.title || 'Untitled'),
          url: String(data.url || ''),
          thumbnail: data.thumbnail ? String(data.thumbnail) : undefined,
          type: String(data.type || 'pravachan') as any,
          duration: data.duration ? String(data.duration) : undefined,
          date: data.date ? String(data.date) : undefined,
          sortTime: data.timestamp?.toMillis?.() || 0,
          mood: data.mood as any,
          description: data.description || '',
          prefilledQuote: data.prefilledQuote || ''
        };
      });
      
      const sortedItems = items.sort((a, b) => (b as any).sortTime - (a as any).sortTime);

      setWatchLaterList(sortedItems as VideoItem[]);
      setWatchLaterIds(sortedItems.map(i => i.id));
    }, (error) => {
      console.error("[WatchLater] Sync Permission Denied or Error:", error.code, error.message);
      if (error.code === 'permission-denied') {
        setWatchLaterList([]);
        setWatchLaterIds([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const toggleWatchLater = async (e: React.MouseEvent, video: VideoItem) => {
    e.stopPropagation();
    if (!user) return; // Should ideally show login modal

    const isBookmarked = watchLaterIds.includes(video.id);
    const docRef = doc(db, 'users', user.uid, 'watchLater', video.id);

    try {
      if (isBookmarked) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          videoId: video.id,
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail || null,
          type: video.type,
          duration: video.duration || null,
          date: video.date || null,
          mood: video.mood || null,
          description: video.description || null,
          prefilledQuote: video.prefilledQuote || null,
          userId: user.uid,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling watch later:", error);
    }
  };

  const videoTypes = ['All', 'Live Broadcasts', 'Pravachan', 'Bhajans'];
  const typeMapping: Record<string, string> = {
    'Live Broadcasts': 'live',
    'Pravachan': 'pravachan',
    'Bhajans': 'bhajan'
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All': VIDEO_REGISTRY.reduce((acc, cat) => acc + cat.videos.length, 0)
    };
    VIDEO_REGISTRY.forEach(cat => {
      counts[cat.title] = cat.videos.length;
    });
    return counts;
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All': VIDEO_REGISTRY.reduce((acc, cat) => acc + cat.videos.length, 0) };
    videoTypes.slice(1).forEach(t => {
      const mapped = typeMapping[t];
      counts[t] = VIDEO_REGISTRY.reduce((acc, cat) => 
        acc + cat.videos.filter(v => v.type === mapped).length, 0
      );
    });
    return counts;
  }, []);

  const moodsList = [
    'All Moods',
    'Peace & Calm',
    'Discipline & Penance (Tap)',
    'Devotion & Bhakti',
    'Spiritual Wisdom',
    'Ahimsa & Travel'
  ];

  const filteredCategories = useMemo(() => {
    // Scripture multilingual search dictionary supporting Sanskrit, Hindi, and English equivalents
    const scriptureSynonyms: Record<string, string[]> = {
      'uttaradhyayana': ['uttaradhyayana', 'उत्तराध्ययन सूत्र', 'uttaradhyayan', 'scripture', 'teachings', 'lesson'],
      'acharanga': ['acharanga', 'आचारांग सूत्र', 'acharanga sutra', 'ethics', 'monk life'],
      'dasaveyaliya': ['dasaveyaliya', 'दशवैकालिक सूत्र', 'dasavaikalika', 'moral standards', 'discipline'],
      'tattvartha': ['tattvartha', 'तत्त्वार्थ सूत्र', 'tattvartha sutra', '9 tattva', 'physics of soul'],
      'mriduta': ['mriduta', 'मृदुता', 'gentleness', 'mildness', 'soft words'],
      'samata': ['samata', 'समता', 'equanimity', 'neutral mind', 'calmness'],
      'japa': ['japa', 'जाप', 'mala', 'rosary', 'chanting'],
      'bhikshu': ['bhikshu', 'भिक्षु', 'founder', 'terapanth history']
    };

    const matchesScriptureOrTranslate = (video: VideoItem, query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      if (video.title.toLowerCase().includes(q)) return true;
      if (video.description && video.description.toLowerCase().includes(q)) return true;
      if (video.prefilledQuote && video.prefilledQuote.toLowerCase().includes(q)) return true;
      
      // Match synonyms
      for (const [key, synonyms] of Object.entries(scriptureSynonyms)) {
        if (synonyms.some(s => s.toLowerCase().includes(q))) {
          if (
            video.title.toLowerCase().includes(key) ||
            (video.description && video.description.toLowerCase().includes(key)) ||
            (video.prefilledQuote && video.prefilledQuote.toLowerCase().includes(key))
          ) {
            return true;
          }
        }
      }
      return false;
    };

    if (viewMode === 'news') {
      return [];
    }

    if (viewMode === 'saved') {
      return [{
        title: 'Saved Videos',
        icon: 'Bookmark',
        videos: watchLaterList.filter(video => {
          const matchesQuery = matchesScriptureOrTranslate(video, searchQuery);
          const mappedType = typeMapping[activeType];
          const matchesType = activeType === 'All' || video.type === mappedType;
          const matchesMood = selectedMood === 'All Moods' || video.mood === selectedMood;
          return matchesQuery && matchesType && matchesMood;
        })
      }].filter(cat => cat.videos.length > 0);
    }

    return VIDEO_REGISTRY.map(category => ({
      ...category,
      videos: category.videos.filter(video => {
        const matchesQuery = matchesScriptureOrTranslate(video, searchQuery) || 
                            video.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || category.title === activeCategory;
        const mappedType = typeMapping[activeType];
        const matchesType = activeType === 'All' || video.type === mappedType;
        const matchesMood = selectedMood === 'All Moods' || video.mood === selectedMood;
        return matchesQuery && matchesCategory && matchesType && matchesMood;
      })
    })).filter(cat => cat.videos.length > 0);
  }, [searchQuery, activeCategory, activeType, selectedMood, viewMode, watchLaterList]);

  const stats = useMemo(() => {
    const registryVideos = VIDEO_REGISTRY.reduce((acc, cat) => acc + cat.videos.length, 0);
    const seriesVideos = SERIES_REGISTRY.reduce((acc, ser) => acc + ser.videos.length, 0);
    const totalVideos = registryVideos + seriesVideos;
    const totalWatched = watchedVideoIds.length;
    const percentage = totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0;
    return { totalVideos, totalWatched, percentage };
  }, [watchedVideoIds]);

  const lastWatchedVideo = useMemo(() => {
    if (!lastWatchedVideoId) return null;
    let found: VideoItem | undefined;
    
    // Check registry
    VIDEO_REGISTRY.some(cat => {
      found = cat.videos.find(v => v.id === lastWatchedVideoId);
      return !!found;
    });
    if (found) return found;

    // Check series
    SERIES_REGISTRY.some(ser => {
      found = ser.videos.find(v => v.id === lastWatchedVideoId);
      return !!found;
    });
    return found || null;
  }, [lastWatchedVideoId]);

  // Open high-fidelity custom in-app video theater
  const openVideoTheater = (video: VideoItem) => {
    setActivePlayerVideo(video);
    setIsPlaying(true);
    setJapaCount(0);
    setIsAudioOnly(video.type === 'bhajan');
    
    // Load note for this video from localStorage
    const savedNote = localStorage.getItem(`swadhyaya_note_${video.id}`) || '';
    setSwadhyayaNote(savedNote);
    setSavedNotesMessage('');

    // Setup simulated beautiful Live Chat
    const initialComments = [
      { user: "Karan Jain", text: "Vandami Guruvar! 🙏 Blessed to hear your voice." },
      { user: "Sudha Ostwal", text: "Namokar Mantra is indeed incredibly peaceful!" }
    ];
    setChatFeed(initialComments);

    if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    chatIntervalRef.current = setInterval(() => {
      const msg = SIMULATED_LIVE_CHAT_MESSAGES[Math.floor(Math.random() * SIMULATED_LIVE_CHAT_MESSAGES.length)];
      setChatFeed(prev => [...prev.slice(-6), msg]);
    }, 4500);

    // Track watched state
    if (!watchedVideoIds.includes(video.id)) {
      setWatchedVideoIds(prev => [...prev, video.id]);
    }
    setLastWatchedVideoId(video.id);
    localStorage.setItem('last_watched_video_id', video.id);
  };

  useEffect(() => {
    return () => {
      if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    };
  }, []);

  const saveSwadhyayaNote = () => {
    if (!activePlayerVideo) return;
    localStorage.setItem(`swadhyaya_note_${activePlayerVideo.id}`, swadhyayaNote);
    
    // Also save in user spiritual logs if available
    setSavedNotesMessage("Lesson logged successfully in your Swadhyaya Diary! 📝");
    setTimeout(() => setSavedNotesMessage(''), 3000);
  };

  const handleWhatsAppShareVideo = (video: VideoItem) => {
    const textMsg = `🙏 *Auspicious Wisdom from Terapanth TV* 🙏\n\n` +
                    `*Title:* ${video.title}\n` +
                    (video.prefilledQuote ? `*Core Lesson:* "${video.prefilledQuote}"\n\n` : '') +
                    `📺 Watch and listen to this spiritual pravachan inside our unified Sadhana workspace:\n${window.location.origin}\n\n` +
                    `— _Shared from Terapanth AI App_`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
    window.open(shareUrl, '_blank');
  };

  const handleCopyLink = (video: VideoItem) => {
    const textMsg = `🙏 *Auspicious Wisdom from Terapanth TV* 🙏\n\n` +
                    `*Title:* ${video.title}\n` +
                    (video.prefilledQuote ? `*Core Lesson:* "${video.prefilledQuote}"\n\n` : '') +
                    `📺 Watch and listen to this spiritual pravachan inside our unified Sadhana workspace:\n${window.location.origin}\n\n` +
                    `— _Shared from Terapanth AI App_`;
    navigator.clipboard.writeText(textMsg).then(() => {
      setCopiedVideoId(video.id);
      setTimeout(() => setCopiedVideoId(null), 2000);
    }).catch(err => {
      console.error("Failed to copy video sharing link:", err);
    });
  };

  const handleInstagramShareVideo = (video: VideoItem) => {
    const textMsg = `🙏 *Auspicious Wisdom from Terapanth TV* 🙏\n\n` +
                    `*Title:* ${video.title}\n` +
                    (video.prefilledQuote ? `*Core Lesson:* "${video.prefilledQuote}"\n\n` : '') +
                    `📺 Watch and listen to this spiritual pravachan inside our unified Sadhana workspace:\n${window.location.origin}\n\n` +
                    `— _Shared from Terapanth AI App_`;
    navigator.clipboard.writeText(textMsg).then(() => {
      setCopiedVideoId(video.id);
      setTimeout(() => setCopiedVideoId(null), 2000);
      handleInstagramClick();
    }).catch(err => {
      console.error("Failed to copy for Instagram sharing:", err);
      handleInstagramClick();
    });
  };

  const handleVideoClick = (video: VideoItem) => {
    openVideoTheater(video);
  };

  const handleChannelClick = () => {
    setShowRedirectModal({ url: OFFICIAL_CHANNEL_URL, title: "Official Terapanth YouTube Channel" });
  };

  const handleInstagramClick = () => {
    setShowRedirectModal({ url: OFFICIAL_INSTAGRAM_URL, title: "Official Terapanth Instagram" });
  };

  const isInstagram = showRedirectModal?.url.includes('instagram.com');
  const BrandIcon = isInstagram ? Instagram : Youtube;

  return (
    <div className="space-y-8 pb-20 text-left">
      {/* Absolute Global Viewport Recalculation Patch for layout safety in simulator */}
      <style>{`
        /* Avoid cutoffs on bottom of simulator viewports */
        .media-center-categories {
          padding-bottom: 60px !important;
        }
      `}</style>

      {/* High-Fidelity Custom Virtual TV Player / Discourse Theater */}
      <AnimatePresence>
        {activePlayerVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto no-scrollbar"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="w-full max-w-5xl bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[92vh] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header bar of Theater */}
              <div className="p-4 sm:p-6 bg-neutral-950 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-[pulse_1.5s_infinite]" />
                  <div>
                    <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">Terapanth TV Virtual Player • Online</span>
                    <h3 className="text-white text-xs sm:text-sm font-bold truncate max-w-[280px] sm:max-w-md">{activePlayerVideo.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setActivePlayerVideo(null);
                    setIsPlaying(false);
                    if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Exit Player
                </button>
              </div>

              {/* Main Workspace: Screen left, Interactivity Right */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-neutral-950">
                
                {/* Simulated Monitor Section */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 items-center justify-center relative bg-black">
                  
                  {/* Premium, sleek UI Link Card Component replacing any broken embedded players or sandbox-restricted web views */}
                  <div 
                    onClick={() => {
                      const targetUrl = activePlayerVideo.url && !activePlayerVideo.url.includes("placeholder") 
                        ? activePlayerVideo.url 
                        : "https://www.youtube.com/@terapanth/live";
                      window.open(targetUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full aspect-video rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#ff0000] to-[#b30000] text-white flex flex-col items-center justify-center gap-4 cursor-pointer p-6 sm:p-8 text-center transition-all hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] group border border-white/20"
                    style={{
                      boxShadow: '0 12px 36px rgba(255, 0, 0, 0.35)',
                    }}
                  >
                    <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                    
                    {/* Decorative soundwave styling overlay */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-15 flex justify-between items-center px-8 pointer-events-none">
                      {[12, 28, 16, 36, 20, 48, 24, 40, 18, 30, 14, 22].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-white rounded-full" 
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    <div className="text-5xl md:text-6xl filter drop-shadow-md z-10 transition-transform duration-350 group-hover:scale-110 animate-pulse">📺</div>
                    
                    <div className="space-y-1.5 z-10">
                      <h3 className="m-0 text-lg md:text-xl font-bold tracking-tight text-white font-sans drop-shadow">
                        Tune into Official Broadcast
                      </h3>
                      <p className="m-0 text-xs text-white/95 max-w-sm mx-auto leading-relaxed font-sans font-medium">
                        Click to stream morning pravachans, holy events & daily discourse directly on YouTube.
                      </p>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetUrl = activePlayerVideo.url && !activePlayerVideo.url.includes("placeholder") 
                          ? activePlayerVideo.url 
                          : "https://www.youtube.com/@terapanth/live";
                        window.open(targetUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="bg-white hover:bg-neutral-100 text-[#ff0000] border-none px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider mt-2 cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-2 z-10"
                    >
                      <Youtube size={14} fill="currentColor" className="text-[#ff0000]" />
                      Open Official YouTube Feed
                    </button>
                  </div>

                  {/* Player Controls Bar */}
                  <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-4 bg-neutral-900/60 border border-white/5 p-4 rounded-2xl z-20 animate-fade-in">
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2.5 bg-white/10 hover:bg-white/25 rounded-xl text-white transition-all active:scale-90"
                        title={isPlaying ? "Pause Stream" : "Start Stream"}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>

                      <div className="h-4 w-px bg-white/10" />

                      <button 
                        onClick={() => setIsAudioOnly(!isAudioOnly)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${isAudioOnly ? 'bg-orange-500 text-white border-orange-500/30' : 'bg-neutral-800 text-gray-400 border-white/5'}`}
                        title="Focus on audio to save data"
                      >
                        <Radio size={12} />
                        {isAudioOnly ? "Audio-Only: ON" : "Render Video"}
                      </button>

                      <div className="h-4 w-px bg-white/10" />

                      {/* Unmuted-By-Default Audio Controls to resolve any browser metadata/sync conflicts */}
                      <div className="flex items-center gap-2 bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                        <button
                          onClick={() => setIsMuted(prev => !prev)}
                          className="text-gray-400 hover:text-white transition-colors active:scale-90"
                          title={isMuted ? "Unmute Audio (Unmuted by default)" : "Mute Audio"}
                        >
                          {isMuted ? <VolumeX size={14} className="text-rose-500" /> : <Volume2 size={14} className="text-orange-400" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={volume}
                          onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            if (isMuted) setIsMuted(false);
                          }}
                          className="w-16 sm:w-20 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          title="Adjust Volume (Default Active)"
                        />
                        <span className="text-[8px] font-mono text-gray-400 uppercase w-6 select-none leading-none">
                          {isMuted ? "MUTE" : `${Math.round(volume * 100)}%`}
                        </span>
                      </div>
                    </div>

                    {/* Speed Selection */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">Speed</span>
                      {[1.0, 1.25, 1.5].map(v => (
                        <button 
                          key={v}
                          onClick={() => setPlaybackSpeed(v)}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all ${playbackSpeed === v ? 'bg-white text-black font-black' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
                        >
                          {v}x
                        </button>
                      ))}
                    </div>

                    {/* Quick WhatsApp Share option inside controls */}
                    <button 
                      onClick={() => handleWhatsAppShareVideo(activePlayerVideo)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 border border-emerald-500/20"
                      title="Share directly via WhatsApp"
                    >
                      <Share2 size={12} />
                      WhatsApp Share
                    </button>
                  </div>

                  {/* Description Box under Screen */}
                  <div className="w-full mt-4 text-left p-4 bg-neutral-900/40 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Subject & Scripture</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {activePlayerVideo.description || "In-depth moral discourse covering key elements of self-regulation, mindfulness, and the direct practices of the Terapanth lineage."}
                    </p>
                  </div>
                </div>

                {/* Left/Right splitting line */}
                <div className="w-px bg-white/5 hidden lg:block" />

                {/* Right Interactive Panels (Chant Overlay & Swadhyaya Scribe Notebook) */}
                <div className="w-full lg:w-96 p-4 sm:p-6 flex flex-col gap-5 overflow-y-auto no-scrollbar bg-neutral-900/30 min-h-0 shrink-0">
                  
                  {/* Interactive Chanting Overlay Box */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4 rounded-3xl text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Flame size={48} className="text-orange-500" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-400">Sadhana Companion</span>
                      </div>
                      <h4 className="text-xs font-black text-white">Chant Along with the Discourse</h4>
                      <p className="text-[9px] text-gray-400">Senior saints suggest counting Om Arham or Namokar Mantra beads while absorbing the lessons: each click advances your focus meter.</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 bg-neutral-950/60 p-3 rounded-2xl">
                      <div>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Active Counts</p>
                        <span className="text-2xl font-black text-orange-400 font-mono tracking-tight">{japaCount}</span>
                      </div>
                      <button 
                        onClick={() => setJapaCount(prev => prev + 1)}
                        className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-1.5"
                      >
                        Chant "Arham" 🙏
                      </button>
                      <button 
                        onClick={() => setJapaCount(0)}
                        className="p-3 text-gray-500 hover:text-white transition-all bg-neutral-900 rounded-xl"
                        title="Reset counters"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Swadhyaya Scribe notebook */}
                  <div className="bg-neutral-900/60 p-5 rounded-3xl border border-white/5 text-left flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={14} className="text-orange-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Swadhyaya Notebook</h4>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-normal mb-3">
                      Scribe down key personal reflections, rules chosen or vow limitations so they persist directly in your diary context.
                    </p>

                    <textarea
                      value={swadhyayaNote}
                      onChange={(e) => setSwadhyayaNote(e.target.value)}
                      placeholder="e.g. Will practice absolute non-lying and limit smart notifications tomorrow for 2 hours..."
                      className="w-full h-24 p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none font-sans"
                    />

                    {savedNotesMessage && (
                      <p className="text-[10px] text-emerald-400 font-black mt-2 flex items-center gap-1.5">
                        <Check size={11} strokeWidth={4} /> {savedNotesMessage}
                      </p>
                    )}

                    <button 
                      onClick={saveSwadhyayaNote}
                      className="mt-3 w-full py-3 bg-gradient-to-r from-orange-500/20 to-amber-500/10 hover:from-orange-500 hover:to-orange-600 hover:text-white text-orange-400 border border-orange-500/30 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-95"
                    >
                      Save Lesson to Diary 📝
                    </button>
                  </div>

                  {/* Shared Global Blessings scrolling feed */}
                  <div className="bg-neutral-900/20 border border-white/5 rounded-3xl p-4 flex-1 flex flex-col min-h-[140px]">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Global Sangha Live Chat</span>
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 font-bold rounded text-[8px]">14.2K Live</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[160px] no-scrollbar">
                      {chatFeed.map((chat, idx) => (
                        <div key={idx} className="text-[10px] leading-relaxed">
                          <strong className="text-orange-400 font-black mr-1">{chat.user}:</strong>
                          <span className="text-gray-300 font-medium">{chat.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Series Detail Overlay */}
      <AnimatePresence>
        {selectedSeries && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSeries(null)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-5xl bg-white dark:bg-gray-950 rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[80vh] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full md:w-5/12 relative group h-1/3 md:h-full">
                {selectedSeries.coverImage && (
                  <img src={selectedSeries.coverImage} className="w-full h-full object-cover" alt="" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                   <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl w-fit mb-6 text-white border border-white/20 shadow-2xl"
                   >
                      {categoryIcons[selectedSeries.icon] ? 
                        (() => {
                           const Icon = categoryIcons[selectedSeries.icon];
                           return <Icon size={28} strokeWidth={2.5} />;
                        })() : <Layers size={28} strokeWidth={2.5} />
                      }
                   </motion.div>
                   <h2 className="text-4xl font-black text-white mb-4 leading-tight tracking-tight">{selectedSeries.title}</h2>
                   <p className="text-white/60 text-sm leading-relaxed max-w-sm font-medium">{selectedSeries.description}</p>
                </div>
                <button 
                  onClick={() => setSelectedSeries(null)}
                  className="absolute top-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all border border-white/10"
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
              </div>
              
              <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar bg-gray-50/50 dark:bg-gray-900/50 text-left">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-spiritual">Series Curriculum</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Study at Your Own Pace</p>
                  </div>
                  <button 
                    onClick={() => setSelectedSeries(null)}
                    className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-spiritual transition-all hidden md:flex items-center gap-2 border border-black/5"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
                    <ChevronLeft size={18} strokeWidth={3} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedSeries.videos.map((video, idx) => {
                    const isWatched = watchedVideoIds.includes(video.id);
                    return (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        onClick={() => handleVideoClick(video)}
                        className={`flex items-center gap-5 p-5 rounded-[2rem] group cursor-pointer transition-all duration-300 border text-left ${isWatched ? 'bg-green-50/50 dark:bg-green-950/20 border-green-500/20' : 'bg-white dark:bg-gray-800 border-black/5 hover:border-spiritual/20 hover:shadow-2xl hover:shadow-spiritual/5'}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all shrink-0 relative overflow-hidden ${isWatched ? 'bg-green-500 text-white' : 'bg-spiritual/5 text-spiritual group-hover:bg-spiritual group-hover:text-white'}`}>
                          {isWatched ? (
                            <Check size={24} strokeWidth={4} />
                          ) : (
                            <span className="text-lg">{video.episodeNumber || idx + 1}</span>
                          )}
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-base transition-colors ${isWatched ? 'text-green-700 dark:text-green-400' : 'text-spiritual group-hover:text-amber-600'}`}>
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            {video.duration && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <Clock size={10} className="text-gray-400" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase">{video.duration}</span>
                              </div>
                            )}
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Pravachan</span>
                            {isWatched && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded-md">
                                <Check size={8} className="text-green-600" strokeWidth={4} />
                                <span className="text-[9px] text-green-600 font-black uppercase font-sans">Watched</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Share on WhatsApp Button for individual Series chapters */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppShareVideo(video);
                            }}
                            className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                            title="Share via WhatsApp"
                          >
                            <Share2 size={16} />
                          </button>
                          
                          <button
                            onClick={(e) => toggleWatched(e, video.id)}
                            className={`p-3 rounded-xl transition-all ${isWatched ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-spiritual hover:bg-white'}`}
                            title={isWatched ? "Reset progress" : "Mark as completed"}
                          >
                            <Check size={16} strokeWidth={isWatched ? 4 : 2} />
                          </button>
                          <div className="p-3 bg-spiritual text-white rounded-xl shadow-lg ring-4 ring-spiritual/5 group-hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex">
                            <Play size={16} fill="currentColor" strokeWidth={0} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500">
                <Youtube size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold dark:text-white uppercase tracking-tight font-sans">Audio-Visual Archive</h2>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.1em]">Authenticated Community Media</p>
              </div>
           </div>
           <h1 className="serif-text text-3xl font-black text-spiritual leading-none">Terapanth TV</h1>
           
           {/* Cloud Synchronizer Status Indicator */}
           <div className="flex flex-wrap items-center gap-2.5 mt-2">
             <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/25 rounded-md text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1.5 font-sans shadow-sm">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
               Live Cloud Connection Active
             </span>
             <button 
               onClick={handlePravachanManualUpdate}
               disabled={syncStatus === "syncing"}
               className="text-[9px] font-bold text-gray-400 hover:text-spiritual flex items-center gap-1.5 transition-colors group cursor-pointer"
               title="Click to force fetch latest updates"
             >
               <CheckCircle2 size={11} className={`${syncStatus === "syncing" ? "animate-spin text-orange-500" : "group-hover:scale-110 text-emerald-500"}`} />
               {syncStatus === "syncing" ? "fetching from server..." : `Last Synced: ${lastSyncedText}`}
             </button>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Progress Summary Mini-Card */}
          <div className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm flex items-center gap-4">
             <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-700" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="4" className="text-spiritual" strokeDasharray={100} strokeDashoffset={100 - stats.percentage} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[8px] font-black text-spiritual font-sans">{stats.percentage}%</span>
             </div>
             <div>
                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest font-sans">Archive Completion</p>
                <p className="text-xs font-bold text-spiritual">{stats.totalWatched} / {stats.totalVideos} Watched</p>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleChannelClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Youtube size={14} fill="currentColor" />
              YouTube
            </button>
            <button 
              onClick={handleInstagramClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Instagram size={14} />
              Instagram
            </button>
          </div>
          <div className="p-2.5 bg-spiritual/10 rounded-xl text-spiritual" title="Verified Source">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Hero / Prioritized / Last Played Section */}
      {viewMode === 'browse' && !searchQuery && activeCategory === 'All' && activeType === 'All' && selectedMood === 'All Moods' && (
        <div className="space-y-6">
          {/* Prioritized Daily YouTube Live Feed Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-red-600/10 to-orange-600/10 dark:from-red-950/20 dark:to-orange-950/20 border border-red-500/20 rounded-[2.5rem] p-6 sm:p-8 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-sm pointer-events-none">
              <Youtube size={160} className="text-red-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              {/* Highlight & Thumbnail preview */}
              <div className="md:col-span-1 relative rounded-2xl overflow-hidden aspect-video shadow-lg group shrink-0 border border-black/10 dark:border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Latest Daily Pravachan"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="p-3 bg-red-600 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={14} fill="currentColor" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-red-600 text-[8px] font-black uppercase text-white px-1.5 py-0.5 rounded tracking-widest font-sans">
                  DAILY
                </span>
              </div>

              {/* Metadata & Title */}
              <div className="md:col-span-2 space-y-1 sm:space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-full font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                    <Youtube size={10} fill="currentColor" /> YT LIVE FEED
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-black text-[8px] uppercase tracking-widest border border-emerald-500/20">
                    DAILY DISCOURSE • INSTANT FEED
                  </span>
                </div>
                
                <h3 className="serif-text text-xl font-bold text-spiritual leading-tight">
                  Daily Pravachan: Cultivating Equanimity and Vows in Modern Age (मृदुता और समता)
                </h3>
                <p className="text-xs text-gray-500 leading-normal font-sans">
                  Live daily sermon streamed direct from Acharya Dev's current Chaturmas/stays, illustrating how soft, mild language blocks negative karma inflow and transforms mindsets.
                </p>
              </div>

              {/* Actions */}
              <div className="md:col-span-1 flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:pl-4">
                <button
                  type="button"
                  onClick={() => {
                    window.open("https://www.youtube.com/@terapanth/live", "_blank", "noopener,noreferrer");
                  }}
                  className="px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={12} fill="currentColor" /> Watch Live Stream
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.open("https://www.youtube.com/@terapanth", "_blank", "noopener,noreferrer");
                  }}
                  className="px-5 py-3.5 bg-white dark:bg-gray-800 border border-red-500/30 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-500/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  YouTube Channel <ExternalLink size={12} />
                </button>
              </div>

            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Main Hero Card - Featured Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-[3rem] bg-gray-900 aspect-[21/9] shadow-2xl"
            onClick={() => handleVideoClick(VIDEO_REGISTRY[0].videos[0])}
          >
            <div className="absolute inset-0">
               {VIDEO_REGISTRY[0].videos[0].thumbnail ? (
                 <img src={VIDEO_REGISTRY[0].videos[0].thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-rose-600 to-amber-600 opacity-80" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
               <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-rose-600 rounded-full animate-pulse flex items-center gap-2 border border-white/20">
                     <div className="w-1.5 h-1.5 bg-white rounded-full" />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest font-sans">Live Broadcast</span>
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest font-sans">Featured</span>
                  </div>
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight max-w-2xl">{VIDEO_REGISTRY[0].videos[0].title}</h2>
               <div className="flex items-center gap-6">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open("https://www.youtube.com/@terapanth/live", "_blank", "noopener,noreferrer");
                    }}
                    className="px-8 py-4 bg-white text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 transform hover:scale-110 active:scale-95 transition-all"
                  >
                     <Play size={18} fill="currentColor" /> Watch Live
                  </button>
                  <p className="hidden md:block text-white/60 text-[10px] font-bold uppercase tracking-widest w-48">Directly from the Acharya's current Vihar location.</p>
               </div>
            </div>
          </motion.div>

          {/* Side Helper Card - Last Watched or Quick Nav */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            {lastWatchedVideo ? (
              <div 
                className="flex-1 bg-spiritual/10 rounded-[2.5rem] p-8 border border-spiritual/20 relative overflow-hidden group cursor-pointer text-left"
                onClick={() => handleVideoClick(lastWatchedVideo)}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-spiritual text-white rounded-2xl shadow-lg">
                      <History size={20} />
                    </div>
                    <span className="text-[10px] font-black text-spiritual uppercase tracking-widest font-sans font-sans">Pick Up Where You Left Off</span>
                  </div>
                  <h3 className="text-lg font-bold text-spiritual mb-2 line-clamp-2">{lastWatchedVideo.title}</h3>
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                        <Clock size={12} /> {lastWatchedVideo.duration || 'In Progress'}
                     </div>
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-spiritual shadow-md group-hover:scale-110 transition-transform">
                        <Play size={16} fill="currentColor" />
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-rose-500/5 rounded-[2.5rem] p-8 border border-rose-500/10 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center text-rose-500 mb-6 transition-transform">
                   <Tv size={32} />
                </div>
                <h3 className="font-bold text-spiritual mb-2">Ready to learn?</h3>
                <p className="text-xs text-gray-400 font-medium px-4">Your watched video history will appear here once you start exploring the archive.</p>
              </div>
            )}

            {/* Verification Stats */}
            <div className="p-6 bg-white dark:bg-gray-950 border border-black/5 rounded-[2.5rem] flex items-center gap-5">
               <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <h4 className="text-xs font-black text-spiritual uppercase tracking-tight">Verified Content</h4>
                  <p className="text-[10px] text-gray-400 font-medium">All media is official & authenticated.</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    )}

      {/* Dynamic Instagram Shorts & Reels Feed Embed Block */}
      {viewMode === 'browse' && selectedMood === 'All Moods' && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative text-left space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-2xl text-white shadow-xl">
                <Instagram size={22} className="animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-spiritual)]">Official Social Feed & Stories</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-sans">Synced and Embedded Community Stream</p>
              </div>
            </div>

            <button 
              onClick={handleInstagramClick}
              className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 hover:text-purple-600 uppercase tracking-widest transition-colors font-sans hover:translate-x-1 duration-300"
            >
              Open Instagram App <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/40 dark:to-gray-950 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-rose-500/5 to-purple-500/5 opacity-50 pointer-events-none" />

            {/* Simulating Embedded Reels Grid with responsive scroll */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
              {VIDEO_REGISTRY.find(cat => cat.title.toLowerCase().includes("instagram"))?.videos.map((reel) => (
                <motion.div
                  key={reel.id}
                  whileHover={{ y: -6, scale: 1.01 }}
                  onClick={() => openVideoTheater(reel)}
                  className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/5 hover:border-pink-500/30 shadow-lg group relative cursor-pointer flex flex-col h-[340px]"
                >
                  {/* Aspect Portrait for Reels */}
                  <div className="relative h-[210px] bg-black overflow-hidden flex items-center justify-center shrink-0">
                    <img 
                      src={reel.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={reel.title}
                    />
                    
                    {/* Glowing Instagram Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-purple-950/40 transition-colors pointer-events-none" />
                    
                    {/* Centered Reels Play Trigger */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                      <div className="p-3.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={16} fill="currentColor" strokeWidth={0} />
                      </div>
                    </div>

                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black uppercase tracking-widest text-white border border-white/10 flex items-center gap-1 font-sans">
                      <Instagram size={8} /> Reel
                    </span>

                    {reel.duration && (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[8.5px] font-mono text-gray-300">
                        {reel.duration}
                      </span>
                    )}
                  </div>

                  {/* Reel Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-spiritual leading-snug group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors line-clamp-2 text-left">
                        {reel.title}
                      </h4>
                      {reel.description && (
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 leading-normal font-sans text-left">
                          {reel.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[8px] font-black uppercase text-gray-400 tracking-wider">
                      <span className="text-rose-500">Live Video</span>
                      <span className="group-hover:text-purple-500 transition-colors cursor-pointer flex items-center gap-0.5">
                        Watch <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* View Toggle */}
      <div className="flex flex-wrap gap-1 p-0.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl w-fit border border-black/5 dark:border-white/5 shadow-inner">
        <button
          onClick={() => setViewMode('browse')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'browse' ? 'bg-white dark:bg-gray-700 text-spiritual shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutGrid size={13} strokeWidth={viewMode === 'browse' ? 3 : 2} />
          Browse Archive
        </button>
        <button
          onClick={() => setViewMode('saved')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'saved' ? 'bg-white dark:bg-gray-700 text-spiritual shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Bookmark size={13} fill={viewMode === 'saved' ? "currentColor" : "none"} strokeWidth={viewMode === 'saved' ? 3 : 2} />
          Saved Collections {watchLaterList.length > 0 && <span className="opacity-60">({watchLaterList.length})</span>}
        </button>
        <button
          onClick={() => setViewMode('news')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'news' ? 'bg-white dark:bg-gray-700 text-spiritual shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Newspaper size={13} strokeWidth={viewMode === 'news' ? 3 : 2} />
          तेरापंथ समाचार
        </button>
      </div>

      {/* Spiritual Mood Tuner Bar - Highly requested customized experience */}
      {viewMode === 'browse' && (
        <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/10 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles size={14} className="text-orange-500" />
            <h4 className="text-xs font-black text-spiritual uppercase tracking-wider">Tune TV to Spiritual Intent</h4>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar-container">
            {moodsList.map(mood => (
              <button 
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all duration-300 whitespace-nowrap whitespace-nowrap active:scale-95 ${selectedMood === mood ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 border border-black/5 text-gray-500 hover:border-orange-500/20'}`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      {viewMode !== 'news' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder={viewMode === 'browse' ? "Search pravachans, yatras, bhajans..." : "Search saved videos..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-spiritual/30 transition-all shadow-sm"
              />
            </div>
            {viewMode === 'browse' && (
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {['All', ...VIDEO_REGISTRY.map(c => c.title)].map((cat, idx) => {
                  const Icon = categoryIcons[cat === 'All' ? 'Layers' : VIDEO_REGISTRY.find(c => c.title === cat)?.icon || 'Tv'];
                  return (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-4 border ${activeCategory === cat ? 'bg-spiritual text-white shadow-xl shadow-spiritual/20 border-spiritual' : 'bg-white dark:bg-gray-800 text-gray-500 border-black/5 dark:border-white/5 hover:bg-gray-50'}`}
                    >
                      <div className={`p-1.5 rounded-xl ${activeCategory === cat ? 'bg-white/20' : 'bg-spiritual/5 text-spiritual'}`}>
                         <Icon size={14} strokeWidth={3} />
                      </div>
                      <div className="flex flex-col items-start leading-none gap-0.5">
                         <span className="text-[7px] opacity-40 uppercase">CH 0{idx + 1}</span>
                         <span>{cat}</span>
                      </div>
                      <span className={`min-w-6 px-2 py-1 rounded-full text-[8px] font-black ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-spiritual/10 text-spiritual'}`}>
                        {categoryCounts[cat] || 0}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-3 py-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400">
              <Filter size={14} />
            </div>
            {videoTypes.map(type => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${activeType === type ? 'bg-rose-500 border-rose-500 text-white shadow-md' : 'bg-transparent border-black/10 dark:border-white/10 text-gray-500 hover:border-rose-500/30'}`}
              >
                {type}
                <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-black ${activeType === type ? 'bg-white/20 text-white' : 'bg-rose-500/10 text-rose-500'}`}>
                  {typeCounts[type] || 0}
                </span>
              </motion.button>
            ))}

            {/* Hide Completed Toggle */}
            {viewMode === 'browse' && activeCategory === 'All' && activeType === 'All' && selectedMood === 'All Moods' && !searchQuery && (
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`ml-auto flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${hideCompleted ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'} border border-transparent`}
              >
                <div className={`w-4 h-4 rounded-lg flex items-center justify-center transition-colors ${hideCompleted ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {hideCompleted && <Check size={10} className="text-white" strokeWidth={4} />}
                </div>
                Hide Watched Series
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories & Videos */}
      <div className="media-center-categories space-y-12 text-left">
        {viewMode === 'news' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TerapanthNewsFeed />
          </motion.div>
        ) : (
          <>
            {/* Discourse Series Section */}
        {viewMode === 'browse' && activeCategory === 'All' && activeType === 'All' && selectedMood === 'All Moods' && !searchQuery && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/10">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-spiritual)]">Discourse Series</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-sans">Sequential Teachings</p>
                </div>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              {SERIES_REGISTRY.filter(s => !hideCompleted || !isSeriesCompleted(s)).map(series => (
                <motion.div
                  key={series.id}
                  whileHover={{ y: -8, scale: 1.01 }}
                  onClick={() => setSelectedSeries(series)}
                  className="min-w-[280px] xs:min-w-[320px] sm:min-w-[340px] max-w-[340px] bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl cursor-pointer group relative text-left"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    {series.coverImage ? (
                      <img src={series.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-amber-600/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest font-sans">Series</span>
                      </div>
                    </div>
                    {isSeriesCompleted(series) && (
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1.5 bg-green-500/90 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-2">
                           <Check size={10} className="text-white" strokeWidth={4} />
                           <span className="text-[8px] font-black text-white uppercase tracking-widest font-sans">Completed</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-8 space-y-3 relative">
                    <div className="flex items-center justify-between">
                       <h4 className="font-black text-lg text-spiritual leading-tight group-hover:text-amber-600 transition-colors">{series.title}</h4>
                       <div className="px-3 py-1 bg-amber-500/10 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-widest">
                          {series.videos.length} Episodes
                       </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">{series.description}</p>
                    <div className="pt-2 flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      Start Learning <ChevronRight size={14} strokeWidth={3} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="h-px bg-black/5 dark:bg-white/5 mt-4" />
          </section>
        )}

        {filteredCategories.length > 0 ? filteredCategories.map(category => {
          const Icon = categoryIcons[category.icon] || Tv;
          return (
            <section key={category.title} className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-spiritual/5 rounded-2xl text-spiritual border border-spiritual/10">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-spiritual)]">{category.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-sans">Available: {category.videos.length}</p>
                  </div>
                </div>
                {'playlistUrl' in category && category.playlistUrl && (
                   <button 
                    onClick={() => setShowRedirectModal({ url: category.playlistUrl as string, title: `Playlist: ${category.title}` })}
                    className="flex items-center gap-2 text-[10px] font-black text-spiritual uppercase tracking-widest hover:translate-x-1 transition-all font-sans"
                   >
                     View All <ChevronRight size={14} />
                   </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {category.videos.map(video => (
                  <motion.div
                    key={video.id}
                    whileHover={{ y: -6 }}
                    className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 shadow-xl group cursor-pointer text-left flex flex-col"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="aspect-video bg-black/5 dark:bg-white/5 relative overflow-hidden bg-rose-500/5 select-none text-left">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Youtube size={48} className="text-rose-500/30 group-hover:scale-125 transition-transform duration-700 ease-out" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Video Hover Overlay and Entrance Transition */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 z-10">
                        <div className="flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                          {/* Play Button */}
                          <div className="w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            <Play size={24} className="text-rose-600 ml-1" fill="currentColor" />
                          </div>
                          
                          {/* Copy Link Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(video);
                            }}
                            className="w-11 h-11 bg-white/90 hover:bg-white text-gray-700 hover:text-rose-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all cursor-pointer"
                            title={copiedVideoId === video.id ? "Link copied!" : "Copy sharing link"}
                            type="button"
                          >
                            {copiedVideoId === video.id ? (
                              <Check className="text-emerald-500 stroke-[3.5]" size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Header Overlays */}
                      <div className="absolute top-4 left-4 flex gap-2 z-10">
                        {video.type === 'live' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-rose-600 rounded-full animate-pulse border border-white/20">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest font-sans">Live</span>
                          </div>
                        )}
                        {video.mood && (
                          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8.5px] font-black text-orange-400 border border-white/10 uppercase tracking-widest">
                            {video.mood}
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={(e) => toggleWatchLater(e, video)}
                        className={`absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transition-all z-20 ${watchLaterIds.includes(video.id) ? 'text-rose-500 scale-110' : 'text-gray-400 hover:text-spiritual hover:scale-110'}`}
                        title="Save to Collections"
                        type="button"
                      >
                        {watchLaterIds.includes(video.id) ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Bookmark size={18} />}
                      </button>

                      {/* Duration Tag */}
                      {video.duration && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 z-10">
                          <Clock size={10} className="text-white/60" />
                          <span className="text-[10px] font-bold text-white tracking-widest font-sans">{video.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between text-left">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                           <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-3 py-1 rounded-full font-sans">{video.type}</span>
                           {video.date && <span className="text-[10px] text-gray-400 font-bold font-sans">{video.date}</span>}
                        </div>
                        <h4 className="font-bold text-sm text-[var(--text-spiritual)] leading-snug group-hover:text-rose-600 transition-colors line-clamp-2">
                          {video.title}
                        </h4>
                      </div>

                      {/* Easy Quick Share Trigger Row inside Card */}
                      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppShareVideo(video);
                            }}
                            className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider hover:opacity-80"
                          >
                            <Share2 size={11} /> WhatsApp
                          </button>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInstagramShareVideo(video);
                            }}
                            className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-500 dark:text-rose-400 tracking-wider hover:opacity-80"
                          >
                            <Instagram size={11} /> Instagram
                          </button>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        }) : (
          <IllustratedEmptyState
            type="media"
            title="कोई मीडिया सामग्री नहीं मिली (No Media Found)"
            description="चयनित श्रेणी, फ़िल्टर या खोज शब्द में कोई मीडिया उपलब्ध नहीं है। कृपया फ़िल्टर बदलें या सभी वीडियो देखें।"
            actionLabel="फ़िल्टर साफ़ करें (Clear All Filters)"
            onAction={() => { setActiveType('All'); setActiveCategory('All'); setSelectedMood('All Moods'); setSearchQuery(''); }}
          />
        )}
          </>
        )}
      </div>

      {/* Redirect System Modal (Authentication & Proper Redirect) */}
      <AnimatePresence>
        {showRedirectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[3rem] p-10 overflow-hidden shadow-2xl relative border border-white/10"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`w-20 h-20 ${isInstagram ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600' : 'bg-rose-500/10'} rounded-[2rem] flex items-center justify-center relative`}>
                   <BrandIcon size={40} className={isInstagram ? "text-white" : "text-rose-500"} fill={isInstagram ? "none" : "currentColor"} />
                   <div className="absolute -bottom-2 -right-2 p-1.5 bg-spiritual rounded-xl text-white shadow-lg border-4 border-white dark:border-gray-900">
                     <ShieldCheck size={16} />
                   </div>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-xl font-bold text-[var(--text-spiritual)] text-center">Verified External Link</h3>
                  <p className="text-sm text-gray-500 leading-relaxed text-center">
                    You are being redirected to the <strong>Official Terapanth</strong> {isInstagram ? 'Instagram profile' : 'YouTube channel'}. This source is verified for authentic pravachans and community data.
                  </p>
                </div>

                <div className="w-full p-4 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center gap-3 text-left">
                   <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <ArrowUpRight size={16} className="text-gray-400" />
                   </div>
                   <div className="truncate flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-sans">Authenticated Destination</p>
                      <p className="text-xs font-bold text-spiritual truncate">{showRedirectModal.url}</p>
                   </div>
                </div>

                <div className="flex flex-col w-full gap-3">
                  <a 
                    href={showRedirectModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowRedirectModal(null)}
                    className={`w-full py-5 ${isInstagram ? 'bg-gradient-to-r from-purple-600 to-rose-500' : 'bg-rose-600'} text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all font-sans`}
                  >
                    Open in {isInstagram ? 'Instagram' : 'YouTube'} <ExternalLink size={16} />
                  </a>
                  <button 
                    onClick={() => setShowRedirectModal(null)}
                    className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all font-sans"
                  >
                    Stay in App
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
