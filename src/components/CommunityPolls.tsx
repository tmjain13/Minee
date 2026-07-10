import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment, 
  setDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { Sparkles, CheckCircle2, Users, Clock, ChevronRight } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  totalVotes: number;
  expiresAt?: any;
}

interface CommunityPollsProps {
  user: any;
  setIsLoginModalOpen: (open: boolean) => void;
}

const CommunityPolls = memo(({ user, setIsLoginModalOpen }: CommunityPollsProps) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(
      collection(db, 'polls'), 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pollData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll));
      setPolls(pollData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserVotes({});
      return;
    }

    // Check for user's votes in each active poll
    const unsubscribes = polls.map(poll => {
      return onSnapshot(doc(db, `polls/${poll.id}/votes/${user.uid}`), (docSnap) => {
        if (docSnap.exists()) {
          setUserVotes(prev => ({ ...prev, [poll.id]: docSnap.data().optionId }));
        }
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, polls]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (userVotes[pollId]) return;

    try {
      const pollRef = doc(db, 'polls', pollId);
      const voteRef = doc(db, `polls/${pollId}/votes/${user.uid}`);

      await setDoc(voteRef, {
        optionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (polls.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-spiritual" />
          <h3 className="serif-text text-2xl font-bold text-spiritual">Community Voice</h3>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-spiritual bg-spiritual/5 px-3 py-1.5 rounded-full border border-spiritual/10">Active Polls</div>
      </div>

      {polls.map(poll => {
        const hasVoted = !!userVotes[poll.id];
        
        return (
          <motion.div 
            key={poll.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-black/5 dark:border-white/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-orange-500" />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Live Community Poll</span>
            </div>

            <h4 className="serif-text text-xl font-bold text-spiritual mb-6">{poll.question}</h4>

            <div className="space-y-3">
              {poll.options.map(option => {
                const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                const isSelected = userVotes[poll.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(poll.id, option.id)}
                    disabled={hasVoted}
                    className={`w-full relative overflow-hidden rounded-2xl border transition-all duration-500 ${hasVoted ? 'cursor-default border-black/5' : 'hover:border-spiritual border-black/10'}`}
                  >
                    <div className="relative z-10 flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-spiritual bg-spiritual' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-spiritual' : 'text-gray-600 dark:text-gray-300'}`}>{option.text}</span>
                      </div>
                      {hasVoted && (
                        <span className="text-[10px] font-black text-spiritual font-mono">{percentage}%</span>
                      )}
                    </div>
                    
                    {hasVoted && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`absolute inset-0 opacity-10 ${isSelected ? 'bg-spiritual' : 'bg-gray-400'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  <Users size={12} /> {poll.totalVotes} votes cast
                </div>
                {poll.expiresAt && (
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Clock size={12} /> Active
                  </div>
                )}
              </div>
              {hasVoted && (
                <div className="text-[10px] font-black text-spiritual uppercase tracking-widest flex items-center gap-1">
                  Thank you for voting <CheckCircle2 size={10} />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default CommunityPolls;
