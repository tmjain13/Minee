import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Calendar, Heart, Shield, Plus, Clock, Share2, 
  Trash2, Sparkles, CheckCircle2, FileText, ChevronRight,
  TrendingUp, Users, Compass, BookOpen, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore';

export interface SevaRecord {
  id: string;
  type: 'ShramDaan' | 'GyanDaan' | 'ViharSeva' | 'Dravyadaana';
  hours: number;
  date: string;
  description: string;
  location: string;
  sealCode: string;
}

const CATEGORY_META = {
  ShramDaan: {
    label: 'श्रमदान (Shram Daan)',
    desc: 'Physical volunteering at Bhawans, kitchen seva, event support.',
    color: 'emerald',
    icon: Users
  },
  GyanDaan: {
    label: 'ज्ञानदान (Gyan Daan)',
    desc: 'Teaching at Gyanshala, writing dharma blogs, scripting materials.',
    color: 'blue',
    icon: BookOpen
  },
  ViharSeva: {
    label: 'विहार सेवा (Monastic Vihar Seva)',
    desc: 'Walking with monks, carrying luggage, arranging security logs.',
    color: 'amber',
    icon: Compass
  },
  Dravyadaana: {
    label: 'द्रव्यदान (Donation Ledger)',
    desc: 'Sponsoring books, pathshala meals, or bhawan maintenance.',
    color: 'purple',
    icon: Heart
  }
};

export const SevaLedger = memo(() => {
  const { user } = useAuth();
  const [records, setRecords] = useState<SevaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [type, setType] = useState<keyof typeof CATEGORY_META>('ShramDaan');
  const [hours, setHours] = useState<number>(2);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Firestore path: users/{userId}/sevaLedger
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const path = `users/${user.uid}/sevaLedger`;
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SevaRecord[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          type: data.type,
          hours: data.hours || 0,
          date: data.date || '',
          description: data.description || '',
          location: data.location || '',
          sealCode: data.sealCode || 'TP-0000'
        });
      });
      setRecords(list);
      setLoading(false);
    }, (err) => {
      console.warn("Firestore error in SevaLedger: ", err);
      // Fallback
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    let totalHours = 0;
    let counts = { ShramDaan: 0, GyanDaan: 0, ViharSeva: 0, Dravyadaana: 0 };
    
    records.forEach(r => {
      totalHours += r.hours;
      if (counts[r.type] !== undefined) {
        counts[r.type]++;
      }
    });

    return { totalHours, counts };
  }, [records]);

  // Goal level
  const sevaBadge = useMemo(() => {
    const total = aggregateStats.totalHours;
    if (total >= 100) return { title: 'सेवा रत्न (Seva Ratna)', subtitle: 'Sovereign Patron Seva Seal', bg: 'bg-amber-500/10 border-amber-500 text-amber-500' };
    if (total >= 50) return { title: 'सेवा विभूषण (Seva Vibhushan)', subtitle: 'Honorable Contributor Level', bg: 'bg-emerald-500/10 border-emerald-500 text-emerald-500' };
    if (total >= 20) return { title: 'सेवा भूषण (Seva Bhushan)', subtitle: 'Dharma Guardian Level', bg: 'bg-purple-500/10 border-purple-500 text-purple-500' };
    return { title: 'साधना स्वयंसेवक (Sadhana Volunteer)', subtitle: 'Initial Devotee Path', bg: 'bg-zinc-500/10 border-zinc-500 text-gray-500 dark:text-gray-400' };
  }, [aggregateStats]);

  // Submit record
  const handleSaveSeva = async () => {
    if (!user) {
      setAlertMsg("Please log in to save your Seva accomplishments safely!");
      return;
    }
    if (!description.trim()) {
      setAlertMsg("कृपया संक्षेप में सेवा विवरण या लाभान्वित क्षेत्र दर्ज करें।");
      return;
    }
    if (hours <= 0) {
      setAlertMsg("त्रुटि: सेवा अवधि सकारात्मक और शून्य से अधिक होनी चाहिए।");
      return;
    }

    setSubmitting(true);
    const code = `TP-${Math.floor(1000 + Math.random() * 9000)}-${aggregateStats.totalHours + hours}H`;

    try {
      const path = `users/${user.uid}/sevaLedger`;
      await addDoc(collection(db, path), {
        type,
        hours: Number(hours),
        date,
        description: description.trim(),
        location: location.trim() || 'Central Branch',
        sealCode: code,
        timestamp: serverTimestamp()
      });

      // Simple voice feedback & haptic tactile tick on complete
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      setDescription('');
      setLocation('');
      setAlertMsg('सेवा प्रविष्टि सफलतापूर्वक दर्ज की गई! 🙏');
      setTimeout(() => setAlertMsg(''), 4000);
    } catch (e) {
      console.error(e);
      setAlertMsg('डेटा सुरक्षित करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    if (!confirm("क्या आप वाकई इस सेवा प्रविष्टि को हटाना चाहते हैं?")) return;

    try {
      const path = `users/${user.uid}/sevaLedger`;
      await deleteDoc(doc(db, path, id));
      if ('vibrate' in navigator) {
        navigator.vibrate(40);
      }
    } catch (e) {
      console.error("Error deleting entry:", e);
    }
  };

  const copyCertLink = () => {
    const text = `🏆 जय जिनेन्द्र! "सेवा परमो धर्मः"\n\nप्रमाणित किया जाता है कि मैंने 'तेरापंथ AI' सेवा बहीखाता के तहत कुल ${aggregateStats.totalHours} घंटे दान सेवा देकर गरिमा पूर्ण '${sevaBadge.title}' सम्मान अर्जित किया है।\n\n- कुल श्रमदान: ${aggregateStats.counts.ShramDaan} सत्र\n- कुल ज्ञानदान: ${aggregateStats.counts.GyanDaan} कक्षाएं-सत्र\n- विहार सेवा: ${aggregateStats.counts.ViharSeva} बार\n\nआओ मिलकर संघ की शक्ति बढ़ाएं! 🤝🌸`;
    navigator.clipboard.writeText(text);
    setAlertMsg('प्रशंसा पत्र विवरण कॉपी हो गया है! व्हाट्सएप पर शेयर करें।');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden text-left space-y-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500 shrink-0">
            <Award size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="serif-text text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight">संस्कृति सेवा एवं योगदान बहीखाता</h3>
            <p className="text-[9px] text-[#A1A1AA] uppercase tracking-widest font-black">Spiritual Seva & Volunteer Hour Ledger</p>
          </div>
        </div>

        {/* Dynamic Badge Button */}
        <button
          onClick={() => setIsCertificateModalOpen(true)}
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-[9px] font-extrabold uppercase tracking-widest rounded-xl hover:shadow shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          🎓 प्रशंसा पत्र Certificate
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-emerald-500/20 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">कुल सेवा घंटे</div>
          <span className="text-xl sm:text-2xl font-black text-[var(--text-spiritual)] mt-1.5">{aggregateStats.totalHours} Hrs</span>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/20 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">ज्ञानदान सत्र</div>
          <span className="text-xl sm:text-2xl font-black text-[var(--text-spiritual)] mt-1.5">{aggregateStats.counts.GyanDaan} Sessions</span>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/20 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-orange-450 font-bold">विहार सेवा</div>
          <span className="text-xl sm:text-2xl font-black text-[var(--text-spiritual)] mt-1.5">{aggregateStats.counts.ViharSeva} Times</span>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/20 transition-all">
          <div className="text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">श्रमदान / दान</div>
          <span className="text-xl sm:text-2xl font-black text-[var(--text-spiritual)] mt-1.5">{aggregateStats.counts.ShramDaan + aggregateStats.counts.Dravyadaana} entries</span>
        </div>
      </div>

      {/* Level Milestone Block */}
      <div className={`border p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${sevaBadge.bg}`}>
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 block">संघ गौरव सम्मान स्तर (Your Earned Title)</span>
          <h4 className="serif-text text-base font-black tracking-wide">{sevaBadge.title}</h4>
          <p className="text-[10px] font-bold text-gray-450 dark:text-zinc-400">{sevaBadge.subtitle}</p>
        </div>

        {/* Progress ring to next title level */}
        <div className="flex items-center gap-3">
          <div className="h-2 w-36 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (aggregateStats.totalHours / 100) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-black text-gray-500">{aggregateStats.totalHours}/100 Hr</span>
        </div>
      </div>

      {/* Grid: 1 Form, 2 List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Save Form Column */}
        <div className="lg:col-span-5 bg-black/5 dark:bg-white/[0.02] border border-[var(--border-color)] rounded-3xl p-5 space-y-4">
          <h4 className="serif-text text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">नया सेवा दान दर्ज करें</h4>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">सेवा श्रेणी (Seva Type)</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] focus:border-emerald-500/40 rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all text-gray-800 dark:text-gray-200"
              >
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">सेवा अवधि (Hours)</label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] focus:border-emerald-500/40 rounded-2xl px-4 py-3 text-xs font-bold outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">सेवा दिनांक (Date)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] focus:border-emerald-500/40 rounded-2xl px-4 py-3 text-xs font-bold font-mono outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">सेवा स्थान / क्षेत्र (Location)</label>
              <input
                type="text"
                placeholder="उदा. अणुव्रत भवन दिल्ली, Pitampura Sabha"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] focus:border-emerald-500/40 rounded-2xl px-4 py-3 text-xs font-semibold outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">सेवा का संक्षिप्त विवरण (Volunteering Notes)</label>
              <textarea
                rows={3}
                placeholder="उदा. वृद्ध जनों को चौविहार आहार परोसा, या ज्ञानाशाला बच्चों की परीक्षा ड्यूटी सम्भाली।"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] focus:border-emerald-500/40 rounded-2xl px-4 py-3 text-xs font-semibold outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSaveSeva}
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-45 cursor-pointer block"
            >
              {submitting ? "जोड़ रहा है..." : "सुरक्षित दान बही में दर्ज करें →"}
            </button>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-7 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between pl-1 border-b border-[var(--border-color)] pb-2 mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">हालिया प्रविष्टियाँ (Historical List: {records.length})</span>
              <span className="text-[9px] text-[#22C55E] font-extrabold flex items-center gap-1">🟢 Cloud Sync Live</span>
            </div>

            {loading ? (
              <div className="p-8 text-xs text-center text-gray-400 animate-pulse">
                प्रविष्टियाँ लोड हो रही हैं...
              </div>
            ) : records.length === 0 ? (
              <div className="p-8 bg-zinc-50 dark:bg-zinc-800/10 border border-transparent rounded-2xl text-center flex flex-col items-center gap-2">
                <AlertCircle size={22} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 mt-1">अभी तक कोई सेवा रिकॉर्ड दर्ज नहीं है।</p>
                <p className="text-[10px] text-gray-400">आपकी निस्वार्थ सेवा संघ को मजबूती प्रदान करती है। आज ही पहली सेवा दर्ज करें।</p>
              </div>
            ) : (
              records.map((item) => {
                const Meta = CATEGORY_META[item.type] || CATEGORY_META.ShramDaan;
                const Icon = Meta.icon;
                return (
                  <motion.div
                    key={item.id}
                    layoutId={`seva-card-${item.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-emerald-500/30 rounded-2xl flex items-start justify-between gap-3 shadow-sm hover:shadow group transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-emerald-500 shrink-0 mt-0.5">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500">
                            {new Date(item.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className={`text-[8.5px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                            item.type === 'ShramDaan' ? 'bg-emerald-500/10 text-emerald-600' :
                            item.type === 'GyanDaan' ? 'bg-blue-500/10 text-blue-600' :
                            item.type === 'ViharSeva' ? 'bg-amber-500/10 text-amber-600' : 'bg-purple-500/10 text-purple-600'
                          }`}>
                            {Meta.label.split(' ')[0]}
                          </span>
                          <span className="text-[8px] font-mono text-gray-400 font-bold bg-black/[0.04] py-0.5 px-2 rounded-md">
                            {item.sealCode}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm mt-1.5 text-[var(--text-spiritual)] leading-snug">
                          {item.hours} Hrs सेवा • {item.location}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(item.id)}
                      className="p-2 border border-transparent rounded-xl text-gray-300 hover:text-red-500 hover:border-red-500/10 active:scale-90 transition-all cursor-pointer group-hover:opacity-100"
                      title="प्रविष्टि हटाएँ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-black/5 dark:bg-white/[0.02] border border-[var(--border-color)] rounded-2xl text-[10px] text-gray-400 font-semibold leading-relaxed">
            🌿 <b>सेवा परमो धर्मः</b> — तेरापंथ संघ के स्वयंसेवक बनकर हम समाज के उत्थान, श्रमदान, ज्ञान प्रचार व मुनिश्री के विहार व्यवस्था में अग्रणी भूमिका निभाते हैं। आपकी सेवा सुरक्षित सहेजी गई है।
          </div>
        </div>

      </div>

      {/* Local Alert Display Banner */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{alertMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Gratitude Certificate Overlay Modal --- */}
      <AnimatePresence>
        {isCertificateModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-50 dark:bg-zinc-950 border-4 border-amber-500/50 rounded-[3rem] w-full max-w-lg p-6 text-center space-y-6 relative shadow-2xl overflow-hidden self-center"
            >
              {/* Outer classic certificate border lines */}
              <div className="absolute inset-2 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] pointer-events-none" />
              
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-black dark:hover:text-white transition-all cursor-pointer z-10"
              >
                ✕
              </button>

              <div className="space-y-2 pt-2">
                <span className="text-3xl text-amber-500 filter drop-shadow block">🏆</span>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 block">तेरापंथ जैन परिषद्</span>
                <h4 className="serif-text text-xl font-black text-amber-600 dark:text-amber-500 tracking-wide mt-1">निस्वार्थ सेवा सम्मान पत्र</h4>
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-450 uppercase tracking-widest font-black">CERTIFICATE OF SPIRTUAL APPRECIATION</p>
                
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-semibold leading-relaxed px-4">
                  प्रमाणित किया जाता है कि 'तेरापंथ AI' डिजिटल बहीखाता के अनुसार, उपासक ने संघ व्यवस्था में निस्वार्थ सहयोग, स्वाध्याय प्रेरणा तथा विहार प्रबंधन हेतु अपना अमूल्य समय दान किया है।
                </p>

                {/* Main Recipient Details */}
                <div className="p-5.5 bg-amber-500/[0.04] border border-amber-500/25 rounded-2xl space-y-1.5 mx-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#B45309] block font-black">उपासक का सम्मान स्तर (Vows Level Badge)</span>
                  <p className="serif-text text-base sm:text-lg font-black text-zinc-950 dark:text-amber-300 leading-tight">
                    {user?.displayName || user?.email?.split('@')[0] || 'सादर जैन श्रावक'}
                  </p>
                  <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={copyCertLink}>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                      🏅 {sevaBadge.title}
                    </span>
                  </div>
                </div>

                {/* Badge specifications */}
                <div className="grid grid-cols-2 gap-3 mx-4 py-1 text-left">
                  <div className="bg-black/5 dark:bg-white/[0.02] p-2.5 rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] text-gray-450 block uppercase tracking-wider font-bold">कुल समर्पित समय</span>
                    <span className="text-xs font-black text-[var(--text-spiritual)] mt-0.5 block">{aggregateStats.totalHours} Hours Logged</span>
                  </div>
                  <div className="bg-black/5 dark:bg-white/[0.02] p-2.5 rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] text-gray-450 block uppercase tracking-wider font-bold">डिजिटल सुरक्षा सील</span>
                    <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                      TP-{aggregateStats.totalHours > 0 ? aggregateStats.totalHours * 10 : 108}S
                    </span>
                  </div>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={copyCertLink}
                  className="flex-1 py-3 bg-[var(--card-bg)] border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 size={12} />
                  <span>साझा करें SHARE</span>
                </button>

                <button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer block"
                >
                  धन्यवाद (Close)
                </button>
              </div>

              <span className="text-[8.5px] uppercase text-gray-400 tracking-widest font-bold block pt-2">
                ✨ अहिंसा परमो धर्मः • तेरापंथ AI सुविचार 🌺
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
});

SevaLedger.displayName = 'SevaLedger';
