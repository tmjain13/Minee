import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Plus, Trash2, Calendar, Sparkles, Smile, Info, BookOpen, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
  timestamp: any;
}

const GRATITUDE_PROMPTS = [
  "What spiritual teaching or phrase of the Acharyas inspired you today?",
  "Reflecting on Mudita (appreciation), what virtue in another person did you appreciate today?",
  "What simple, natural element (the sunshine, a moment of silence) are you grateful for today?",
  "How did an experience of patience or self-restraint bring harmony to your day?",
  "Whom would you like to express silent appreciation towars today?"
];

const SadhanaGratitude = memo(() => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/gratitude`;
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GratitudeEntry));
      setEntries(fetched);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputText.trim() || isAdding) return;

    setIsAdding(true);
    const path = `users/${user.uid}/gratitude`;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      await addDoc(collection(db, path), {
        text: inputText.trim(),
        date: todayStr,
        timestamp: serverTimestamp()
      });
      setInputText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/gratitude/${id}`;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/gratitude`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handlePromptClick = (promptText: string) => {
    setInputText((prev) => {
      const suffix = prev.trim() ? `\n\nPrompt Reflection: ${promptText}` : `Reflecting on prompt: "${promptText}"\n`;
      return prev + suffix;
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 text-left" id="gratitude-journal-container">
      {/* Visual Header Bannner */}
      <div className="p-6 bg-gradient-to-br from-spiritual/15 via-spiritual/5 to-transparent rounded-[2rem] border border-spiritual/10 relative overflow-hidden text-left shadow-sm">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 rotate-12 opacity-5 pointer-events-none">
          <Heart size={140} className="text-spiritual fill-current" />
        </div>
        <span className="text-[10px] bg-spiritual/15 text-spiritual px-3 py-1 rounded-full font-black uppercase tracking-widest leading-none inline-block">
          Mudita • Sympathetic Joy
        </span>
        <h3 className="serif-text text-2xl font-bold mt-3 text-spiritual">
          Spiritual Gratitude Journal
        </h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xl">
          The practice of practicing deep gratitude (known as Mudita or clean joy) clears the soul from attachment and negative passions. Use this private space to record positive blessings, acts of kindness, and spiritual insights.
        </p>
      </div>

      {/* Prompts Section */}
      <div className="p-5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-spiritual animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Inspirational Daily Prompts</span>
        </div>
        <div className="min-h-[4.5rem] flex flex-col justify-between">
          <p className="text-xs font-bold text-[var(--text-spiritual)] italic leading-relaxed">
            "{GRATITUDE_PROMPTS[activePromptIndex]}"
          </p>
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => handlePromptClick(GRATITUDE_PROMPTS[activePromptIndex])}
              className="px-3 py-1 bg-spiritual/10 hover:bg-spiritual/20 text-spiritual text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Write about this
            </button>
            <button
              onClick={() => setActivePromptIndex((prev) => (prev + 1) % GRATITUDE_PROMPTS.length)}
              className="text-[9px] text-gray-400 hover:text-spiritual font-black uppercase tracking-widest transition-colors"
            >
              Next Prompt →
            </button>
          </div>
        </div>
      </div>

      {/* Entry Input Form */}
      <form onSubmit={handleAddEntry} className="space-y-3">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-3xl border border-black/5 shadow-sm focus-within:border-spiritual/30 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="I am deeply grateful for..."
            rows={3}
            maxLength={1000}
            className="w-full text-sm bg-transparent border-0 outline-none resize-none text-[var(--text-spiritual)] placeholder-gray-400 font-medium"
            style={{ minHeight: '80px' }}
          />
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            <span>{inputText.length} / 1000 characters</span>
            <button
              type="submit"
              disabled={isAdding || !inputText.trim()}
              className="flex items-center gap-2 bg-spiritual text-white hover:bg-spiritual-dark hover:shadow-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:hover:shadow-none"
            >
              {isAdding ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={12} strokeWidth={3} />
                  <span>Log Gratitude</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Journal entries stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-450">
            Gratitude Stream ({entries.length})
          </h4>
          <span className="flex items-center gap-1 text-[8px] font-black text-green-600 bg-green-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Secure • Firestore Sync
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <div className="w-6 h-6 border-2 border-spiritual border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Loading blessings...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2rem] text-center border border-dashed border-black/10 dark:border-white/10">
            <div className="mx-auto w-12 h-12 rounded-full bg-spiritual/10 text-spiritual flex items-center justify-center mb-3">
              <Smile size={24} className="stroke-[1.5]" />
            </div>
            <h5 className="font-bold text-sm text-[var(--text-spiritual)]">Empty Gratitude Journal</h5>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Start logging your moments of appreciation to develop constant sympathetic joy. Select a prompt or type above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03, type: 'spring', damping: 20 }}
                  className="p-5 bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/5 hover:border-spiritual/20 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <Calendar size={12} className="text-spiritual" />
                        <span>{formatDate(entry.date)}</span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-450 rounded-lg text-gray-300 transition-all duration-150"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-sm font-medium text-gray-800 dark:text-gray-150 leading-relaxed whitespace-pre-wrap">
                      {entry.text}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-spiritual opacity-80">
                      <Heart size={10} className="fill-current animate-pulse text-spiritual" />
                      <span>Virtue of Appreciation</span>
                    </div>
                    {entry.timestamp && (
                      <div className="flex items-center gap-1 text-[8px] text-gray-400 font-mono">
                        <Clock size={10} />
                        <span>{new Date(entry.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
});

SadhanaGratitude.displayName = 'SadhanaGratitude';

export default SadhanaGratitude;
