import React from 'react';
import { Clock, Headphones, Edit3, BookOpen, Bookmark, Lightbulb } from 'lucide-react';

interface QuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export default function QuickActions({ isOpen, onClose, setActiveTab }: QuickActionsProps) {
  if (!isOpen) return null;

  const actions = [
    { id: 'samayik', label: 'Samayik Sadhana', icon: <Clock size={16} />, tab: 'sadhana' },
    { id: 'audio', label: 'Mantra & Audio', icon: <Headphones size={16} />, tab: 'audio' },
    { id: 'suvichar', label: 'Daily Suvichar', icon: <Lightbulb size={16} />, tab: 'suvichar' },
    { id: 'journal', label: 'Spiritual Journal', icon: <Edit3 size={16} />, tab: 'journal' },
    { id: 'karma', label: 'Karma Theory', icon: <BookOpen size={16} />, tab: 'karma' },
    { id: 'anuvrat', label: 'Anuvrat Pledge', icon: <Bookmark size={16} />, tab: 'anuvrat' },
  ];

  const handleAction = (tabName: string) => {
    setActiveTab(tabName);
    onClose();
  };

  return (
    <>
      {/* Invisible backdrop to close menu when clicking outside */}
      <div 
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" 
        onClick={onClose} 
      />
      
      {/* Centered Action Menu Items */}
      <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-50">
        {[...actions].reverse().map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.tab)}
            style={{ 
              animationDelay: `${index * 40}ms`,
              animationFillMode: 'both'
            }}
            className="flex items-center gap-3 bg-[#1e1e1e] text-stone-100 px-5 py-3 rounded-full shadow-lg border border-stone-700/50 hover:bg-[#2a2a2a] active:scale-95 transition-all w-max transform hover:scale-[1.02]"
          >
            <span className="text-stone-400">{action.icon}</span>
            <span className="text-sm font-semibold tracking-wide">{action.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
