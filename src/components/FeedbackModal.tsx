import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => Promise<void>;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      setFeedback('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[var(--bg-cream)] rounded-[2rem] overflow-hidden shadow-2xl border border-[var(--border-color)]"
          >
            <div className="p-6 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-spiritual">
                  <div className="w-10 h-10 rounded-xl bg-spiritual/10 flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <h2 className="serif-text font-bold text-xl dark:text-white">App Feedback</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                We value your input. Help us improve Terapanth AI by sharing your thoughts or reporting any issues you've encountered.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white/50 dark:bg-black/10">
              <div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe your feedback or feature request here..."
                  className="w-full h-32 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-spiritual transition-all resize-none shadow-inner"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Send size={16} />
                    </motion.div>
                  ) : (
                    <Send size={16} />
                  )}
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
