import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, X, Send, Heart, Calendar, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { logPointsActivity } from './PointsActivityModal';

interface AddReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'hi' | 'en';
  onReflectionSaved?: () => void;
}

export default function AddReflectionModal({
  isOpen,
  onClose,
  language = 'hi',
  onReflectionSaved
}: AddReflectionModalProps) {
  const [reflectionText, setReflectionText] = useState<string>('');
  const [category, setCategory] = useState<string>('Sadhana');
  const [mood, setMood] = useState<string>('🧘‍♂️ Peaceful');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const moods = [
    { label: '🧘‍♂️ Peaceful', tag: 'शांति' },
    { label: '🪷 Grateful', tag: 'कृतज्ञता' },
    { label: '📖 Enlightened', tag: 'स्वाध्याय' },
    { label: '🕊️ Ahimsa', tag: 'अहिंसा' }
  ];

  const categories = ['Sadhana', 'Swadhyaya', 'Anuvrat', 'Gratitude', 'Seva'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    setIsSaving(true);

    try {
      const now = new Date();
      const newEntry = {
        id: `refl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        text: reflectionText.trim(),
        category,
        mood,
        date: now.toISOString().split('T')[0],
        timestamp: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        formattedDate: now.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      // Save to profile journal in localStorage
      const existingSaved = localStorage.getItem('terapanth_journal_entries');
      let entries = existingSaved ? JSON.parse(existingSaved) : [];
      entries = [newEntry, ...entries];
      localStorage.setItem('terapanth_journal_entries', JSON.stringify(entries));

      // Also save to daily reflections list
      const existingReflections = localStorage.getItem('terapanth_daily_reflections');
      let reflections = existingReflections ? JSON.parse(existingReflections) : [];
      reflections = [newEntry, ...reflections];
      localStorage.setItem('terapanth_daily_reflections', JSON.stringify(reflections));

      // Award Points
      logPointsActivity(`Daily Spiritual Reflection (${category})`, 20, category);

      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      setTimeout(() => {
        setIsSaving(false);
        setReflectionText('');
        if (onReflectionSaved) onReflectionSaved();
        onClose();
      }, 400);
    } catch (err) {
      console.warn('Failed to save reflection', err);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border-2 border-amber-500/30 shadow-2xl overflow-hidden flex flex-col"
          id="add-reflection-modal-container"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md text-xl">
                ✍️
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'hi' ? 'दैनिक स्वाध्याय एवं चिंतन डायरी' : 'Add Daily Spiritual Reflection'}</span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {language === 'hi' ? 'आज की साधना और आत्म-निरीक्षण को संजोएं (+20 अंक)' : 'Record your inner thoughts & earn +20 Sadhana Points'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                {language === 'hi' ? 'श्रेणी चुनें (Select Category):' : 'Reflection Category:'}
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood / Spiritual State selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                {language === 'hi' ? 'मानसिक एवं मानसिक स्थिति:' : 'Spiritual State:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(m.label)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      mood === m.label
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300'
                        : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Textarea */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                {language === 'hi' ? 'आज का चिंतन / संकल्प विवरण:' : 'Reflection Details:'}
              </label>
              <textarea
                required
                rows={4}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'आज की सामायिक, जप ध्यान या अणुव्रत आचरण के अनुभव लिखें...'
                    : 'Write your thoughts on today’s meditation, chanting, or non-violence practice...'
                }
                className="w-full p-3.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 rounded-2xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSaving || !reflectionText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={14} />
                <span>{isSaving ? (language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...') : (language === 'hi' ? 'डायरी में सहेजें (+20 PTS)' : 'Save to Profile Journal')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
