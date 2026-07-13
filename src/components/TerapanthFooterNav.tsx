import React from 'react';
import { Home, Calendar, MessageSquare, Heart, User } from 'lucide-react';

interface TerapanthFooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string; // भाषा बदलने के लिए नया प्रॉप
}

const TerapanthFooterNav: React.FC<TerapanthFooterNavProps> = ({ activeTab, setActiveTab, language }) => {
  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        
        {/* 1. Home */}
        <button 
          onClick={() => setActiveTab('home')}
          aria-label={language === 'en' ? 'Home Main Dashboard' : 'मुख्य पृष्ठ मुख्य डैशबोर्ड'}
          aria-current={activeTab === 'home' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg ${activeTab === 'home' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">{language === 'en' ? 'Home' : 'होम'}</span>
        </button>
 
        {/* 2. Panchang */}
        <button 
          onClick={() => setActiveTab('panchang')}
          aria-label={language === 'en' ? 'Panchang Calendar and Tithi Timings' : 'पंचांग कैलेंडर और तिथि समय'}
          aria-current={activeTab === 'panchang' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg ${activeTab === 'panchang' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">{language === 'en' ? 'Calendar' : 'पंचांग'}</span>
        </button>
 
        {/* 3. Chat (Center Floating Button) */}
        <button 
          onClick={() => setActiveTab('chat')}
          aria-label={language === 'en' ? 'Terapanth AI Spiritual Chat Companion' : 'तेरापंथ एआई आध्यात्मिक चैट सहायक'}
          aria-current={activeTab === 'chat' ? 'page' : undefined}
          className="flex flex-col items-center justify-center w-full h-full relative -top-3 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-full"
        >
          <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg ${activeTab === 'chat' ? 'bg-brand-600 ring-4 ring-brand-100 dark:ring-brand-900/30' : 'bg-brand-500 hover:bg-brand-600 transition-colors'}`}>
            <MessageSquare className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
        </button>
 
        {/* 4. Sadhana */}
        <button 
          onClick={() => setActiveTab('sadhana')}
          aria-label={language === 'en' ? 'Sadhana Spiritual Tools and Logs' : 'साधना आध्यात्मिक उपकरण और लॉग'}
          aria-current={activeTab === 'sadhana' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg ${activeTab === 'sadhana' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Heart className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">{language === 'en' ? 'Sadhana' : 'साधना'}</span>
        </button>
 
        {/* 5. Profile */}
        <button 
          onClick={() => setActiveTab('profile')}
          aria-label={language === 'en' ? 'User Profile and Settings' : 'उपयोगकर्ता प्रोफ़ाइल और सेटिंग्स'}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg ${activeTab === 'profile' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <User className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">{language === 'en' ? 'Profile' : 'प्रोफ़ाइल'}</span>
        </button>

      </div>
    </nav>
  );
};

export default TerapanthFooterNav;
