import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Save, Loader2, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface ViharUpdateFormProps {
  onBack: () => void;
}

export default function ViharUpdateForm({ onBack }: ViharUpdateFormProps) {
  const { user } = useAuth();
  const [currentStay, setCurrentStay] = useState('');
  const [upcomingStay, setUpcomingStay] = useState('');
  const [currentStayEn, setCurrentStayEn] = useState('');
  const [upcomingStayEn, setUpcomingStayEn] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing stay info on mount
  useEffect(() => {
    async function loadCurrentStay() {
      try {
        const docRef = doc(db, 'vihar_updates', 'acharya_shri');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentStay(data.currentStay || '');
          setUpcomingStay(data.upcomingStay || '');
          setCurrentStayEn(data.currentStayEn || '');
          setUpcomingStayEn(data.upcomingStayEn || '');
          if (data.date) {
            setUpdateDate(data.date);
          }
        }
      } catch (err: any) {
        if (err?.message?.includes('offline') || err?.code === 'unavailable' || !navigator.onLine) {
          console.warn('Vihar stay info offline/unavailable fallback:', err.message || err);
        } else {
          console.error('Error fetching Vihar stay info:', err);
        }
      } finally {
        setFetching(false);
      }
    }
    loadCurrentStay();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStay.trim()) {
      setError('कृपया वर्तमान प्रवास दर्ज करें।');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const docRef = doc(db, 'vihar_updates', 'acharya_shri');
      await setDoc(docRef, {
        currentStay: currentStay.trim(),
        upcomingStay: upcomingStay.trim(),
        currentStayEn: currentStayEn.trim(),
        upcomingStayEn: upcomingStayEn.trim(),
        date: updateDate,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'admin',
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating Vihar location:', err);
      setError('विहार अपडेट सहेजने में विफल: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-safe pt-6 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            id="vihar_form_back_btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">विहार प्रवास अपडेट</h1>
            <p className="text-xs text-brand-600 font-medium">आचार्य श्री महाश्रमण जी स्थान ट्रैकर</p>
          </div>
        </div>

        {fetching ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
            <span className="text-xs text-slate-500">डेटा लोड हो रहा है...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center space-x-3"
              >
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                <span className="text-xs font-bold">विहार प्रवास सफलतापूर्वक अपडेट कर दिया गया है!</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-300 rounded-2xl flex items-center space-x-3"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                <span className="text-xs font-bold">{error}</span>
              </motion.div>
            )}

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-brand-600 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-bold">प्रवास विवरण दर्ज करें</span>
              </div>

              {/* Current Stay Hindi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  वर्तमान प्रवास (Current Location - हिंदी) *
                </label>
                <input
                  type="text"
                  value={currentStay}
                  onChange={(e) => setCurrentStay(e.target.value)}
                  placeholder="उदा. जैन विश्व भारती, लाडनूं, राजस्थान"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
                  required
                />
              </div>

              {/* Current Stay English */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  वर्तमान प्रवास (Current Location - English)
                </label>
                <input
                  type="text"
                  value={currentStayEn}
                  onChange={(e) => setCurrentStayEn(e.target.value)}
                  placeholder="e.g. Jain Vishva Bharati, Ladnun, Rajasthan"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
                />
              </div>

              {/* Upcoming Stay Hindi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  आगामी प्रवास (Upcoming Location - हिंदी)
                </label>
                <input
                  type="text"
                  value={upcomingStay}
                  onChange={(e) => setUpcomingStay(e.target.value)}
                  placeholder="उदा. जयपुर, राजस्थान"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
                />
              </div>

              {/* Upcoming Stay English */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  आगामी प्रवास (Upcoming Location - English)
                </label>
                <input
                  type="text"
                  value={upcomingStayEn}
                  onChange={(e) => setUpcomingStayEn(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  अपडेट दिनांक (Update Date)
                </label>
                <input
                  type="date"
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>सुरक्षित किया जा रहा है...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save / Update (सुरक्षित करें)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
