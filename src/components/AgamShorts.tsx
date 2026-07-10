import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Quote, BookOpen, Sparkles, Heart, Clock, Play, Pause } from 'lucide-react';

interface ShortCard {
  id: string;
  text: string;
  author: string;
  category: string;
  gradient: string;
  accentColor: string;
}

interface HeartParticle {
  id: string;
  x: number;
  y: number;
  scale: number;
}

const shortsData: ShortCard[] = [
  {
    id: 's1',
    text: "“क्रोध को क्षमा से जीतो, अहंकार को नम्रता से, माया को सरलता से और लोभ को संतोष से जीतो।”",
    author: "दसवैकालिक सूत्र (८/३९)",
    category: "Mind-Control",
    gradient: "from-amber-950 via-stone-900 to-orange-950/90",
    accentColor: "text-amber-400"
  },
  {
    id: 's2',
    text: "“जैसे एक सूखी लकड़ी में आग जल्दी पकड़ती है, वैसे ही असंयमी और चंचल चित्त वाले व्यक्ति में प्रमाद और विकार जल्दी प्रवेश करते हैं।”",
    author: "आचार्य भिक्षु — भिक्षु दृष्टान्त",
    category: "Conduct",
    gradient: "from-stone-950 via-neutral-900 to-red-950/80",
    accentColor: "text-red-400"
  },
  {
    id: 's3',
    text: "“अहिंसा ही परम सत्य और धर्म है। किसी भी जीव को कष्ट न देना ही आत्मा की शुद्धता का एकमात्र मार्ग है।”",
    author: "आचार्य तुलसी — अणुव्रत दर्शन",
    category: "Philosophy",
    gradient: "from-emerald-950 via-stone-900 to-teal-950/90",
    accentColor: "text-emerald-400"
  },
  {
    id: 's4',
    text: "“ध्यान का अर्थ सिर्फ आँखें बंद करना नहीं, बल्कि अपने भीतर की चेतना और विकارهای के प्रति पूरी तरह जागरूक होना है।”",
    author: "आचार्य महाप्रज्ञ — प्रेक्षा ध्यान साहित्य",
    category: "Meditation",
    gradient: "from-blue-950 via-slate-900 to-indigo-950/90",
    accentColor: "text-blue-400"
  },
  {
    id: 's5',
    text: "“परिग्रह ही सारे दुखों और बंधनों की जड़ है। इच्छाओं को सीमित करना ही वास्तविक स्वतंत्रता और सुख है।”",
    author: "उत्तराध्ययन सूत्र (१४/१२)",
    category: "Philosophy",
    gradient: "from-stone-950 via-zinc-900 to-yellow-950/70",
    accentColor: "text-yellow-500"
  },
  {
    id: 's6',
    text: "“परिवर्तन बाहर से नहीं, अपने भीतर के विचारों को बदलने से शुरू होता है। खुद को जीतो, वही सबसे बड़ी विजय है।”",
    author: "आचार्य महाश्रमण — प्रवचन पीयूष",
    category: "Mind-Control",
    gradient: "from-purple-950 via-stone-900 to-fuchsia-950/80",
    accentColor: "text-fuchsia-400"
  }
];

export const AgamShorts: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Reading Mode State
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoScrollDuration = 12000; // 12 seconds per slide
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveTime = useRef<number>(Date.now());

  // Heart Likes and Particle Effects State
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({
    s1: 108, s2: 72, s3: 154, s4: 93, s5: 64, s6: 210
  });
  const [particles, setParticles] = useState<Record<string, HeartParticle[]>>({});

  // WhatsApp Share function
  const shareOnWhatsApp = (card: ShortCard) => {
    const shareText = `✨ *तेरापंथ आगम वाणी* ✨\n\n${card.text}\n\n✍️ *स्रोत्र:* ${card.author}\n🏷️ *श्रेणी:* ${card.category}\n\n📱 *Terapanth AI Hub* एप्प डाउनलोड करें और अपनी आध्यात्मिक यात्रा शुरू करें।`;
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  // Handle Scroll to sync active index and reset progress on manual activity
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight === 0) return;
    const index = Math.round(scrollTop / clientHeight);
    
    if (index !== activeIndex && index >= 0 && index < shortsData.length) {
      setActiveIndex(index);
      setProgress(0);
      lastActiveTime.current = Date.now();
    }
  };

  // Autoplay / Reading Mode progress loop
  useEffect(() => {
    if (!isReadingMode) {
      setProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 100; // Update progress every 100ms
    const step = (intervalTime / autoScrollDuration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Time's up! Scroll to next card
          if (containerRef.current) {
            const nextIndex = (activeIndex + 1) % shortsData.length;
            containerRef.current.scrollTo({
              top: nextIndex * containerRef.current.clientHeight,
              behavior: 'smooth'
            });
            setActiveIndex(nextIndex);
          }
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReadingMode, activeIndex]);

  // Handle Heart Interaction
  const handleLikeClick = (cardId: string, event: React.MouseEvent) => {
    const isCurrentlyLiked = !!likes[cardId];
    
    // Toggle like
    setLikes(prev => ({ ...prev, [cardId]: !isCurrentlyLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [cardId]: isCurrentlyLiked ? Math.max(0, prev[cardId] - 1) : prev[cardId] + 1
    }));

    // Trigger floating heart particles
    if (!isCurrentlyLiked) {
      const rect = event.currentTarget.getBoundingClientRect();
      // Generate unique IDs for particles
      const newParticles: HeartParticle[] = Array.from({ length: 6 }).map((_, i) => ({
        id: `${cardId}-${Date.now()}-${i}`,
        x: (Math.random() - 0.5) * 60, // scatter horizontally
        y: -10 - Math.random() * 20,    // primary upward force
        scale: 0.6 + Math.random() * 0.8
      }));

      setParticles(prev => ({
        ...prev,
        [cardId]: [...(prev[cardId] || []), ...newParticles]
      }));

      // Cleanup particles after 1.2s
      setTimeout(() => {
        setParticles(prev => ({
          ...prev,
          [cardId]: (prev[cardId] || []).filter(p => !newParticles.find(np => np.id === p.id))
        }));
      }, 1200);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-stone-950 text-stone-100 font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Top Floating Utility & Reading Mode controller bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-2">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-stone-800/40 shadow-lg">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-xs font-serif font-bold text-stone-100">आगम Shorts</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Reading Mode Auto-Scroll toggle switch */}
            <button
              onClick={() => setIsReadingMode(!isReadingMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                isReadingMode 
                  ? 'bg-orange-950/60 text-orange-400 border border-orange-500/30' 
                  : 'bg-stone-800/60 text-stone-400 border border-transparent'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isReadingMode ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <span>{isReadingMode ? 'स्वाध्याय मोड चालू' : 'स्वाध्याय मोड'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic linear progress tracking indicator for active Reading Mode */}
        {isReadingMode && (
          <div className="w-full h-[3px] bg-stone-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        )}
      </div>

      {/* Hardware-Accelerated Vertical Scroll Snap Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {shortsData.map((card, idx) => (
          <div 
            key={card.id}
            className={`w-full h-full snap-start relative flex flex-col justify-center px-6 bg-gradient-to-br ${card.gradient}`}
          >
            {/* Absolute Background Ambient Blur Layers */}
            <div className="absolute top-1/4 left-1/4 w-56 h-56 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Accent colored stylized quote graphic */}
            <Quote className={`w-12 h-12 ${card.accentColor} opacity-20 mb-4`} />

            {/* Beautiful display text & citation container */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: false }}
              className="space-y-6 max-w-md mx-auto w-full relative z-10"
            >
              <p className="text-2xl font-serif font-medium text-stone-100 leading-relaxed tracking-wide">
                {card.text}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <div className="w-6 h-[1px] bg-stone-700" />
                <span className={`text-xs font-bold tracking-wider ${card.accentColor} font-serif`}>
                  {card.author}
                </span>
              </div>
            </motion.div>

            {/* Bottom Floating Control Panel & Interaction metrics */}
            <div className="absolute bottom-24 left-6 right-6 flex items-center justify-between border-t border-stone-800/40 pt-4 bg-transparent z-20">
              <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 bg-stone-900/60 px-2.5 py-1 rounded-md">
                {card.category}
              </span>
              
              <div className="flex items-center gap-4">
                {/* Heart Button with Framer Motion Pulse Animation and Floating Particle effect */}
                <div className="relative">
                  <AnimatePresence>
                    {particles[card.id]?.map((particle) => (
                      <motion.div
                        key={particle.id}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 0, 
                          x: particle.x, 
                          y: particle.y - 120, 
                          scale: particle.scale * 1.5 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute text-rose-500 pointer-events-none z-30"
                        style={{ left: '50%', top: '50%', marginLeft: '-8px', marginTop: '-8px' }}
                      >
                        <Heart className="w-4 h-4 fill-current text-rose-500" />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <motion.button 
                    onClick={(e) => handleLikeClick(card.id, e)}
                    whileTap={{ scale: 1.3 }}
                    className={`flex items-center gap-1.5 p-2.5 rounded-full border transition-all ${
                      likes[card.id]
                        ? 'bg-rose-950/50 border-rose-500/40 text-rose-400 font-bold'
                        : 'bg-stone-900/60 border-stone-800/40 text-stone-400 hover:text-rose-400'
                    }`}
                  >
                    <motion.div
                      animate={likes[card.id] ? { scale: [1, 1.4, 0.9, 1.1, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Heart className={`w-4 h-4 ${likes[card.id] ? 'fill-current text-rose-500' : ''}`} />
                    </motion.div>
                    <span className="text-[11px] font-mono select-none">{likeCounts[card.id]}</span>
                  </motion.button>
                </div>
                
                {/* Quick share action link */}
                <button 
                  onClick={() => shareOnWhatsApp(card)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-full font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>शेयर करें</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AgamShorts;
