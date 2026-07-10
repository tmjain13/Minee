import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Bell, Clock, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface ScheduledTapa {
  id: string;
  type: string;
  date: string;
  recurring: boolean;
  frequency?: 'weekly' | 'monthly';
  notified: boolean;
}

const FAST_TYPES = [
  { id: 'chauvihar', name: 'Chauvihar' },
  { id: 'ekasana', name: 'Ekasana' },
  { id: 'upvas', name: 'Upvas' },
  { id: 'biyasana', name: 'Biyasana' },
  { id: 'ayambil', name: 'Ayambil' },
];

export default function TapaScheduler() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduledTapa[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTapa, setNewTapa] = useState({ type: 'upvas', date: '', recurring: false, frequency: 'weekly' });
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/tapaSchedules`),
      orderBy('date', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduledTapa));
      setSchedules(data);
      checkAlerts(data);
    });
    return () => unsub();
  }, [user]);

  const checkAlerts = (data: ScheduledTapa[]) => {
    const now = new Date();
    const newAlerts: string[] = [];
    data.forEach(s => {
      const tapaDate = new Date(s.date);
      const diff = tapaDate.getTime() - now.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      // If within 12-24 hours and not notified
      if (hours > 0 && hours <= 12) {
        newAlerts.push(`Reminder: Your ${s.type} fast starts in ${Math.round(hours)} hours.`);
      }
    });
    setAlerts(newAlerts);
  };

  const handleAddSchedule = async () => {
    if (!user || !newTapa.date) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/tapaSchedules`), {
        ...newTapa,
        notified: false,
        timestamp: serverTimestamp()
      });
      setShowAdd(false);
      setNewTapa({ type: 'upvas', date: '', recurring: false, frequency: 'weekly' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/tapaSchedules`, id));
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-6 border border-black/5 dark:border-white/5 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
            <Bell size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold dark:text-white uppercase tracking-tight">Tapa Discipline Scheduler</h4>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.1em]">Set goals & receive spiritual alerts</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 bg-spiritual text-white rounded-full hover:scale-110 transition-all shadow-lg active:scale-95"
        >
          {showAdd ? <Trash2 size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((alert, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3"
            >
              <AlertCircle size={14} className="text-orange-500" />
              <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">{alert}</p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1">Fast Type</label>
                <select 
                  value={newTapa.type}
                  onChange={(e) => setNewTapa(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-spiritual/30 rounded-xl p-3 text-xs outline-none transition-all"
                >
                  {FAST_TYPES.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1">Start Date</label>
                <input 
                  type="date"
                  value={newTapa.date}
                  onChange={(e) => setNewTapa(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-spiritual/30 rounded-xl p-3 text-xs outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Recurring Goal</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newTapa.recurring}
                  onChange={(e) => setNewTapa(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-spiritual"></div>
              </label>
            </div>

            <button 
              onClick={handleAddSchedule}
              className="w-full py-4 bg-spiritual text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
            >
              Add to Spiritual Schedule
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="p-10 text-center bg-black/5 dark:bg-white/5 rounded-3xl border-2 border-dashed border-black/5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No fasting goals scheduled yet.</p>
          </div>
        ) : (
          schedules.map(s => (
            <div key={s.id} className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-spiritual/20 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-spiritual/10 rounded-xl text-spiritual">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest">{s.type} Fast</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={10} className="text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{s.date}</span>
                    {s.recurring && (
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-md uppercase font-black">Recurring</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(s.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
