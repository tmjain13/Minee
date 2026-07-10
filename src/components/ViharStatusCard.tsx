import React from 'react';
import { MapPin } from 'lucide-react';

const ViharStatusCard = () => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
          <MapPin size={20} />
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Vihar Status</h4>
          <p className="text-[10px] text-zinc-500">Acharya Shri Mahashraman Ji is currently in Jain Vishva Bharati, Ladnun, Rajasthan.</p>
        </div>
      </div>
      <a href="#" className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Track</a>
    </div>
  );
};

export default ViharStatusCard;
