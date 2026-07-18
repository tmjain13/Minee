import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellRing, Settings, ShieldCheck, Play, Sparkles, 
  Trash2, HelpCircle, Check, Info, Lock, MapPin, Calendar, Clock
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'Panchang' | 'Vihar' | 'Festival' | 'Sadhana';
  title: string;
  body: string;
  time: string;
  urgent: boolean;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    category: 'Panchang',
    title: 'अष्टमी व्रत तिथि स्मरण (Ashtami Fasting)',
    body: 'कल आषाढ़ कृष्ण अष्टमी तिथि है। आज सूर्यास्त से पूर्व कषाय विसर्जन और कल हरि-सब्जी त्याग का संकल्प सहेजें।',
    time: '2 hours ago',
    urgent: true,
    read: false
  },
  {
    id: 'notif-02',
    category: 'Vihar',
    title: 'मुनि उदित कुमार जी दिल्ली मंगल प्रवेश 📍',
    body: 'परम पूज्य मुनि उदित कुमार जी ठाना २ का पीतमपुरा जैन भवन, दिल्ली में मंगल पर्दापण हुआ है। सांध्य प्रतिक्रमण आज ६:२८ पर शुरू होगा।',
    time: '4 hours ago',
    urgent: false,
    read: false
  },
  {
    id: 'notif-03',
    category: 'Festival',
    title: 'पर्युषण महापर्व आराधना उल्टी गिनती',
    body: 'पर्युषण महापर्व २०२६ प्रारंभ होने में केवल ८ दिन शेष हैं। तप संकल्प गणना और साधना डायरी का उपयोग कर व्रत योजना सहेजें।',
    time: 'Yesterday',
    urgent: true,
    read: true
  },
  {
    id: 'notif-04',
    category: 'Sadhana',
    title: 'दैनिक सुविचार और ज्ञानशाला अध्ययन',
    body: '“क्रोध अग्नि के समान है, जो अंततः स्वयं के विवेक को ही भस्म करता है।” - आज का अणुव्रत पाठ पढ़ें।',
    time: 'Yesterday',
    urgent: false,
    read: true
  }
];

export const PushNotificationSimulator = memo(() => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('sadhana-simulated-notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<'board' | 'settings'>('board');
  const [showToast, setShowToast] = useState<{ title: string; body: string } | null>(null);
  
  // Settings values
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sadhana-notification-settings');
    return saved ? JSON.parse(saved) : {
      tithiChanges: true,
      monkArrivals: true,
      festivalCountdown: true,
      audioMilestones: true,
      soundChime: true
    };
  });

  // Save state on change
  useEffect(() => {
    localStorage.setItem('sadhana-simulated-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sadhana-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Synthesize a beautiful zen notice ring tone
  const playBellChime = () => {
    if (!settings.soundChime) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playFreq = (freq: number, startTime: number, length: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + length);
        
        osc.start(startTime);
        osc.stop(startTime + length);
      };

      const now = audioCtx.currentTime;
      playFreq(523.25, now, 0.4);       // C5
      playFreq(659.25, now + 0.12, 0.4);  // E5
      playFreq(783.99, now + 0.24, 0.5);  // G5
      setTimeout(() => audioCtx.close(), 1000);
    } catch (e) {
      console.warn("Audio bell sound block/unsupported", e);
    }
  };

  // Trigger a simulated notification test
  const triggerSelfTestNotification = () => {
    const alertsPool = [
      {
        category: 'Panchang' as const,
        title: '🔔 चौविहार समय पूर्व चेतावनी',
        body: 'पीतमपुरा, दिल्ली में सूर्यास्त का समय ६:२४ होने जा रहा है। स्वाध्याय और पचक्खान मर्यादा पूर्ण रखें।',
        urgent: true
      },
      {
        category: 'Vihar' as const,
        title: '📍 मंगल विहार सूचना',
        body: 'मुनि अमर कीर्ति जी ठाना ३ का कल प्रातः ५:३० पर अनवरत विहार रोहिणी से पीरागढ़ी की तरफ निर्धारित हुआ है।',
        urgent: false
      },
      {
        category: 'Festival' as const,
        title: '📆 मर्यादा महोत्सव २०२२ स्मृतियाँ',
        body: 'आचार्य श्री महाश्रमण जी द्वारा मर्यादा महोत्सव की घोषणा। परंपरा और नियमों का पालन परम ध्येय है।',
        urgent: true
      },
      {
        category: 'Sadhana' as const,
        title: '🔥 साधना सातत्य (Streak Milestone)',
        body: 'बधाई हो! आपने लगातार ३ दिन सामायिक एवं पचक्खान दर्ज़ कर आध्यात्मिक सातत्य पूर्ण किया है।',
        urgent: false
      }
    ];

    const pick = alertsPool[Math.floor(Math.random() * alertsPool.length)];
    const newAlert: NotificationItem = {
      id: `notif-${Date.now()}`,
      category: pick.category,
      title: pick.title,
      body: pick.body,
      time: 'Just now',
      urgent: pick.urgent,
      read: false
    };

    setNotifications(prev => [newAlert, ...prev]);
    setShowToast({ title: pick.title, body: pick.body });
    playBellChime();

    if ('vibrate' in navigator) {
      navigator.vibrate([80, 50, 80]); // Tactile milestone vibration
    }

    setTimeout(() => {
      setShowToast(null);
    }, 4500);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteOne = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden text-left space-y-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
            {unreadCount > 0 ? (
              <BellRing size={20} className="animate-bounce text-amber-500" />
            ) : (
              <Bell size={20} />
            )}
          </div>
          <div>
            <h3 className="serif-text text-sm sm:text-base font-black text-amber-600 dark:text-amber-500 leading-tight">संघात्मक आध्यात्मिक सूचना पट्ट</h3>
            <p className="text-[9px] text-[#A1A1AA] uppercase tracking-widest font-black">Spiritual Notifications & Panchang Bulletin</p>
          </div>
        </div>

        {/* Unread badge or settings switch */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-[9.5px] font-black text-white bg-amber-500 px-2 py-0.5 rounded-full select-none" style={{ animation: 'pulse 1.5s infinite' }}>
              {unreadCount} अनरीड
            </span>
          )}

          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setActiveTab('board')}
              className={`p-2 rounded-lg text-xs font-bold transition-all shrink-0 ${activeTab === 'board' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Notify logs"
            >
              सूचना पट्ट
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg text-xs font-bold transition-all shrink-0 ${activeTab === 'settings' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Alert Preferences"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'board' ? (
        <div className="space-y-4">
          
          {/* Action buttons bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-xs text-gray-500 font-semibold">
              संघ विहार और पंचांग परिवर्तन सूचनाएं यहाँ प्राप्त होंगी।
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerSelfTestNotification}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Play size={10} fill="currentColor" /> परीक्षण सूचना भेजें Test Alert
              </button>

              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="px-2.5 py-1.5 text-gray-450 hover:text-amber-500 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    सभी पढ़े मार्क करें
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-2 border border-transparent rounded-xl text-gray-450 hover:text-red-500 transition-all cursor-pointer"
                    title="Logs clear"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="p-8 bg-zinc-50 dark:bg-zinc-800/10 rounded-2xl text-center flex flex-col items-center gap-2">
                <Bell size={24} className="text-zinc-300" />
                <p className="text-xs text-gray-500 font-semibold">आज कोई नई सूचना या पंचांग अलर्ट नहीं है।</p>
                <p className="text-[10px] text-gray-400">“परीक्षण सूचना भेजें” पर क्लिक करके सूचना प्राप्ति की जाँच कर सकते हैं।</p>
              </div>
            ) : (
              notifications.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`notif-card-${item.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    item.read 
                      ? 'bg-[var(--card-bg)] border-[var(--border-color)] opacity-60' 
                      : item.urgent 
                        ? 'bg-amber-500/[0.04] border-amber-500/40 shadow-sm border-l-4 border-l-amber-500' 
                        : 'bg-zinc-500/[0.02] border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        item.category === 'Panchang' ? 'bg-orange-500/10 text-orange-500' :
                        item.category === 'Vihar' ? 'bg-emerald-500/10 text-emerald-500' :
                        item.category === 'Festival' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.category === 'Panchang' && <Calendar size={13} />}
                        {item.category === 'Vihar' && <MapPin size={13} />}
                        {item.category === 'Festival' && <Sparkles size={13} />}
                        {item.category === 'Sadhana' && <Clock size={13} />}
                      </div>
                      <span className="text-[8px] font-bold text-gray-400 mt-1">{item.time}</span>
                    </div>

                    <div className="min-w-0 text-left space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="serif-text font-black text-xs sm:text-sm text-[var(--text-spiritual)]">
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-[11.5px] text-zinc-550 dark:text-zinc-400 font-semibold leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => toggleRead(item.id)}
                      className="p-1.5 border border-transparent rounded-lg text-gray-400 hover:text-[var(--text-spiritual)] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                      title={item.read ? 'मार्क अनरीड' : 'मार्क रीड'}
                    >
                      <Check size={12} className={item.read ? "text-gray-400" : "text-amber-500 stroke-[3]"} />
                    </button>
                    <button
                      onClick={() => deleteOne(item.id)}
                      className="p-1.5 border border-transparent rounded-lg text-gray-450 hover:text-red-500 hover:bg-red-500/5 active:scale-95 transition-all cursor-pointer"
                      title="हटाएँ"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="pl-1 pb-1 border-b border-[var(--border-color)]">
            <h4 className="serif-text text-xs sm:text-sm font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">आध्यात्मिक पुश अलर्ट प्राथमिकताएं</h4>
            <span className="text-[10px] text-gray-500 font-medium">Configure simulated local background services notifications</span>
          </div>

          <div className="space-y-3.5">
            {[
              { key: 'tithiChanges', label: '🌖 तिथि परिवर्तन रिमाइंडर (Panchang Tithi alerts)', desc: 'Ashtami, Chaturdashi and special fasting tithis notifications.' },
              { key: 'monkArrivals', label: '📍 मुनि मंगल आगमन एवं विहार समाचार (Muni Stays)', desc: 'Alerts when a Monastic team enters your region or within 10km radius.' },
              { key: 'festivalCountdown', label: '📆 महापर्व उल्टी गिनती (Paryushana & Maryada)', desc: 'Daily tracking alerts for impending spiritual festivals and events.' },
              { key: 'audioMilestones', label: '⏳ सामायिक/जाप अंतराल कम्पन (Milestone haptic chimes)', desc: 'Tactile vibrating ticks at 11, 27 beads and remaining timer goals.' },
              { key: 'soundChime', label: '🔔 संगीतमय मंत्र स्वर (Acoustic alert sound check)', desc: 'Trigger a pleasant temple bell chime when an alert slides in.' }
            ].map(item => (
              <div 
                key={item.key}
                onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                className="flex items-center justify-between p-3.5 bg-black/5 dark:bg-white/[0.02] border border-[var(--border-color)] rounded-2xl cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-98"
              >
                <div className="text-left space-y-0.5 pr-4">
                  <span className="text-xs sm:text-sm font-black text-[var(--text-spiritual)] block">{item.label}</span>
                  <span className="text-[10px] text-gray-400 block font-semibold leading-normal">{item.desc}</span>
                </div>

                <div className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 flex items-center shrink-0 ${settings[item.key as keyof typeof settings] ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-750'}`}>
                  <div className={`w-5 h-5 bg-white dark:bg-zinc-950 rounded-full shadow-md transform transition-transform duration-300 ${settings[item.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-amber-550 shrink-0" />
            <p className="text-[10px] leading-relaxed text-gray-500 font-semibold uppercase tracking-wider">
              सुरक्षा सुनिश्चित: सूचना प्राथमिकताएं स्थानीय डिवाइस पर सहेजी जाती हैं और कोई भी व्यक्तिगत जानकारी लीक नहीं की जाती। 🔒
            </p>
          </div>
        </div>
      )}

      {/* Slide-In Simulated Push Notification Overlay Pop-up */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -50, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.85, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 px-5 py-4 rounded-[2rem] shadow-[0_15px_60px_rgba(245,158,11,0.25)] border-2 border-amber-600 font-black z-[100000] flex items-start gap-3 w-80 sm:w-96 text-left"
          >
            <div className="p-2 bg-zinc-950/20 rounded-xl mt-0.5 text-zinc-950">
              <BellRing size={16} className="animate-swing" style={{ transformOrigin: 'top center' }} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-80 text-orange-950 block">New Spiritual Alert</span>
                <span className="text-[9px] font-bold text-orange-950 block">Now</span>
              </div>
              <h4 className="serif-text text-sm font-black text-zinc-950 leading-snug">
                {showToast.title}
              </h4>
              <p className="text-[11px] font-bold leading-relaxed text-zinc-900 mt-1 opacity-90">
                {showToast.body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
});

PushNotificationSimulator.displayName = 'PushNotificationSimulator';
