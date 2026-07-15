import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, Users, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrayerRequest {
  id: string;
  text: string;
  name: string;
  userId?: string;
  likes: number;
  likedBy: string[];
  createdAt: any;
}

const PrayerWallIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
    {/* Soft Pulsing Aura */}
    <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-2xl animate-pulse" />
    <svg width="120" height="120" viewBox="0 0 120 120" className="relative z-10">
      <defs>
        <linearGradient id="handsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FEE2E2" />
        </linearGradient>
      </defs>

      {/* Decorative Outer Mandala circles */}
      <circle cx="60" cy="60" r="54" fill="none" stroke="#FED7AA" strokeWidth="1" strokeDasharray="3 5" className="opacity-30" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="#F97316" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-40 animate-spin" style={{ animationDuration: '30s' }} />

      {/* Soft central sun */}
      <circle cx="60" cy="65" r="32" fill="url(#auraGrad)" className="opacity-40" />

      {/* Stylized Hands joined in Prayer / Namaskar */}
      {/* Left Hand */}
      <path 
        d="M 53 85 C 47 75 42 62 47 48 C 48 45 51 45 52 48 C 55 58 57 72 57 85 Z" 
        fill="url(#handsGrad)" 
        className="origin-bottom-left"
        style={{ transform: 'rotate(-4deg) translate(2px, 0px)' }}
      />
      {/* Right Hand */}
      <path 
        d="M 67 85 C 73 75 78 62 73 48 C 72 45 69 45 68 48 C 65 58 63 72 63 85 Z" 
        fill="url(#handsGrad)" 
        className="origin-bottom-right"
        style={{ transform: 'rotate(4deg) translate(-2px, 0px)' }}
      />

      {/* Glowing Sparks rising up */}
      <g className="animate-pulse">
        {/* Spark 1 */}
        <circle cx="60" cy="30" r="2.5" fill="#F59E0B" />
        <circle cx="48" cy="40" r="1.5" fill="#F97316" opacity="0.8" />
        <circle cx="72" cy="38" r="2" fill="#F59E0B" opacity="0.9" />
        <circle cx="60" cy="45" r="1" fill="#EF4444" opacity="0.7" />
      </g>
    </svg>
  </div>
);

export default function CommunityPrayerWall() {
  const { user, signInWithGoogle } = useAuth();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [newPrayerText, setNewPrayerText] = useState('');
  const [posterName, setPosterName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Sync real-time prayer requests
  useEffect(() => {
    const q = query(
      collection(db, 'communityPrayers'),
      orderBy('createdAt', 'desc'),
      limit(25)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PrayerRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          text: data.text || '',
          name: data.name || 'Anonymous',
          userId: data.userId || '',
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          createdAt: data.createdAt
        });
      });
      setPrayers(items);
    }, (error) => {
      console.warn("Prayer wall loading skipped or pending permissions:", error);
    });

    return () => unsubscribe();
  }, []);

  // Handle post submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerText.trim()) return;

    if (!user) {
      if (signInWithGoogle) {
        signInWithGoogle().catch(err => console.error(err));
      } else {
        alert("Please sign in to post prayer requests.");
      }
      return;
    }

    setIsSubmitting(true);
    const finalName = isAnonymous ? 'Anonymous / गुप्त' : (posterName.trim() || user.displayName || 'Sadhak');

    try {
      await addDoc(collection(db, 'communityPrayers'), {
        text: newPrayerText.substring(0, 300),
        name: finalName.substring(0, 100),
        userId: user.uid,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp()
      });

      setNewPrayerText('');
      setPosterName('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving prayer request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Prayer Reaction (toggle 🙏)
  const handleAcknowledge = async (prayer: PrayerRequest) => {
    if (!user) {
      if (signInWithGoogle) {
        signInWithGoogle().catch(err => console.error(err));
      } else {
        alert("Please sign in to acknowledge prayers.");
      }
      return;
    }

    const prayerDocRef = doc(db, 'communityPrayers', prayer.id);
    const hasLiked = prayer.likedBy.includes(user.uid);

    try {
      if (hasLiked) {
        // Remove like
        await updateDoc(prayerDocRef, {
          likedBy: arrayRemove(user.uid),
          likes: Math.max(0, prayer.likes - 1)
        });
      } else {
        // Add like
        await updateDoc(prayerDocRef, {
          likedBy: arrayUnion(user.uid),
          likes: prayer.likes + 1
        });
      }
    } catch (err) {
      console.error("Error toggling prayer reaction:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-zinc-800 shadow-sm p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.04] dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Community Prayer Wall</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Post short prayer requests & support others</p>
          </div>
        </div>
      </div>

      {/* Post Prayer Form */}
      <form onSubmit={handleSubmit} className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-2xl p-4 space-y-3.5">
        <div>
          <textarea
            value={newPrayerText}
            onChange={(e) => setNewPrayerText(e.target.value)}
            placeholder={user ? "Write your spiritual request, gratitude, or prayer here..." : "Please sign in to post on the community prayer wall..."}
            disabled={!user || isSubmitting}
            maxLength={300}
            rows={3}
            className="w-full bg-white dark:bg-zinc-800/50 border border-black/5 dark:border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl p-3 text-xs focus:outline-none transition-all placeholder:text-gray-400"
          />
          <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-400 font-medium px-1">
            <span>{300 - newPrayerText.length} characters left</span>
            <span>Reflect purity & ahimsa</span>
          </div>
        </div>

        {user && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 h-3.5 w-3.5"
                />
                Post Anonymously
              </label>

              {!isAnonymous && (
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={posterName}
                  onChange={(e) => setPosterName(e.target.value)}
                  maxLength={50}
                  className="bg-white dark:bg-zinc-800/50 border border-black/5 dark:border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-2.5 py-1 text-xs focus:outline-none transition-all"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newPrayerText.trim()}
              className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 border border-orange-400/25 shrink-0 self-end sm:self-auto disabled:opacity-50"
            >
              {postSuccess ? (
                <>
                  <Check size={14} /> Posted!
                </>
              ) : (
                <>
                  <Send size={12} /> Post Request
                </>
              )}
            </button>
          </div>
        )}

        {!user && (
          <button
            type="button"
            onClick={() => signInWithGoogle && signInWithGoogle().catch(err => console.error(err))}
            className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
          >
            Sign In to Post
          </button>
        )}
      </form>

      {/* Prayers List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
        {prayers.length === 0 ? (
          <div className="text-center py-10 px-6 border-2 border-dashed border-orange-500/15 dark:border-zinc-800 rounded-3xl bg-gradient-to-b from-orange-500/[0.02] to-transparent text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            <PrayerWallIllustration />
            <h4 className="serif-text text-sm font-bold text-orange-700 dark:text-orange-400 mb-1.5">प्रार्थना पट्ट रिक्त है</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              अभी तक कोई प्रार्थना या मंगलभावना संदेश साझा नहीं किया गया है। समस्त जीवों के कल्याण व मंगलभावना हेतु पहली प्रविष्टि लिखकर इस शुद्ध भाव यात्रा की शुरुआत करें।
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {prayers.map((prayer) => {
              const hasLiked = user && prayer.likedBy.includes(user.uid);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={prayer.id}
                  className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-zinc-800/60 rounded-2xl p-4 flex justify-between items-start gap-4 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                      "{prayer.text}"
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400">
                        {prayer.name}
                      </span>
                      {prayer.createdAt && (
                        <span className="text-[8px] text-zinc-400 font-medium">
                          • {new Date(prayer.createdAt.toDate ? prayer.createdAt.toDate() : prayer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleAcknowledge(prayer)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                      hasLiked
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400'
                        : 'bg-white dark:bg-zinc-800 border-black/5 dark:border-zinc-800 text-zinc-400 hover:text-orange-500'
                    }`}
                  >
                    <span className={`text-base leading-none transition-transform ${hasLiked ? 'scale-110' : ''}`}>🙏</span>
                    <span className="font-mono text-[10px]">{prayer.likes}</span>
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
