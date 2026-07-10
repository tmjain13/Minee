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
          <div className="text-center py-8 border border-dashed border-black/10 dark:border-zinc-800 rounded-2xl text-zinc-400">
            <p className="text-xs font-semibold">No prayer requests posted yet.</p>
            <p className="text-[10px] mt-0.5">Be the first to post a pure spiritual intention.</p>
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
