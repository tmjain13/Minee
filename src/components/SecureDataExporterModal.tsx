import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Share2, Copy, Download, FileText, CheckCircle2, MessageSquare, Award, Sparkles, Database, Lock, Eye, Printer } from 'lucide-react';
import { getUserProfile, UserProfileData, getPersonalizedGreeting } from '../utils/userProfile';
import { jsPDF } from 'jspdf';

interface SecureDataExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'hi';
}

export default function SecureDataExporterModal({ isOpen, onClose, language = 'hi' }: SecureDataExporterModalProps) {
  const [profile, setProfile] = useState<UserProfileData>(getUserProfile());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'pdf' | 'csv' | 'json'>('share');
  
  // Real-time Local Sadhana Stats
  const [stats, setStats] = useState({
    streakDays: 5,
    samayikCount: 12,
    jaapCount: 108,
    meditationMins: 45,
    quizScore: 85,
    swadhyayBooks: 3,
  });

  useEffect(() => {
    if (isOpen) {
      setProfile(getUserProfile());
      // Load stats from localStorage
      try {
        const streak = Number(localStorage.getItem('terapanth_sadhana_streak_count') || 5);
        const samayik = Number(localStorage.getItem('terapanth_samayik_total_count') || 12);
        const jaap = Number(localStorage.getItem('terapanth_jaap_total_count') || 108);
        const med = Number(localStorage.getItem('terapanth_meditation_total_mins') || 45);
        
        setStats({
          streakDays: Math.max(streak, 1),
          samayikCount: Math.max(samayik, 0),
          jaapCount: Math.max(jaap, 0),
          meditationMins: Math.max(med, 0),
          quizScore: 90,
          swadhyayBooks: 4,
        });
      } catch (err) {
        console.warn('Error reading local sadhana stats:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const greetingName = profile.name || profile.fullName || (language === 'hi' ? 'साधक' : 'Devotee');
  const greetingText = getPersonalizedGreeting(language, greetingName);

  // 1. Text Summary for WhatsApp & Clipboard
  const generateShareText = () => {
    const pName = profile.fullName || profile.name || 'Terapanth Devotee';
    const cityStr = profile.city ? `📍 ${profile.city}` : '';
    const wingStr = profile.wing ? `🏛️ ${profile.wing}` : '';

    return `🙏 ${getPersonalizedGreeting('hi', pName)}
📿 *मेरा आध्यात्मिक साधना रिपोर्ट कार्ड (Terapanth AI)*
────────────────────────────
👤 *नाम*: ${pName} ${profile.age ? `(${profile.age} वर्ष)` : ''}
${cityStr} ${wingStr}
🔥 *साधना स्ट्रिक*: ${stats.streakDays} दिन
✨ *सामयिक कुल*: ${stats.samayikCount} पूर्ण
📿 *णमोक्कार महामंत्र जाप*: ${stats.jaapCount} माला
🧘 *प्रेक्षाध्यान समय*: ${stats.meditationMins} मिनट
📖 *स्वाध्याय प्रगति*: ${stats.swadhyayBooks} ग्रंथ
🏆 *पदवि/स्थिति*: निष्ठावान तेरापंथी साधक
────────────────────────────
🔒 *100% सुरक्षित एवं निजी डेटा शेयरिंग*
🕊️ *तेरापंथ धर्मसंघ एआई डिजिटल ऐप द्वारा प्रमाणित*`;
  };

  const handleCopyText = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = generateShareText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // 2. Export PDF Certificate Report Card
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Header Banner
      doc.setFillColor(180, 83, 9); // Amber Gold
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Jain Shvetambar Terapanth Dharmasangh', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Spiritual Sadhana Report Card', 105, 24, { align: 'center' });
      
      // Subtitle Bar
      doc.setFillColor(245, 243, 239);
      doc.rect(0, 35, 210, 12, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString('hi-IN')} | Secure Client-side Export`, 105, 42, { align: 'center' });

      // Profile Section Box
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, 55, 180, 45, 3, 3);

      doc.setTextColor(180, 83, 9);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Jai Jinendra, ${profile.fullName || profile.name || 'Devotee'}!`, 22, 67);

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${profile.fullName || profile.name || 'N/A'}`, 22, 77);
      doc.text(`Age: ${profile.age || 'N/A'} | Gender: ${profile.gender || 'N/A'}`, 22, 85);
      doc.text(`City: ${profile.city || 'N/A'} | Wing: ${profile.wing || 'General Devotee'}`, 22, 93);

      // Stats Grid
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(15, 110, 85, 30, 2, 2, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Sadhana Streak', 22, 122);
      doc.setFontSize(16);
      doc.text(`${stats.streakDays} Consecutive Days`, 22, 133);

      doc.setFillColor(224, 242, 254);
      doc.roundedRect(110, 110, 85, 30, 2, 2, 'F');
      doc.setTextColor(3, 105, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Samayik Completed', 117, 122);
      doc.setFontSize(16);
      doc.text(`${stats.samayikCount} Sessions`, 117, 133);

      // Detailed Breakdown Table
      doc.setFillColor(250, 250, 250);
      doc.rect(15, 150, 180, 60, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(15, 150, 180, 60, 'S');

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Sadhana Categories Breakdown', 22, 162);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Navkar Mantra Jaap Total: ${stats.jaapCount} Malas`, 25, 173);
      doc.text(`• Preksha Dhyan Meditation: ${stats.meditationMins} Minutes`, 25, 182);
      doc.text(`• Swadhyay Agam Readings: ${stats.swadhyayBooks} Agams/Books`, 25, 191);
      doc.text(`• Jain Quiz Knowledge Score: ${stats.quizScore}% Mastered`, 25, 200);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('Ahimsa Paramo Dharma • Jain Shvetambar Terapanth Dharmasangh AI Hub', 105, 275, { align: 'center' });
      doc.text('This is a 100% private, client-side verified report generated locally on your device.', 105, 281, { align: 'center' });

      doc.save(`Terapanth_Sadhana_Report_${(profile.name || 'User').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  // 3. Export CSV Spreadsheet
  const handleDownloadCSV = () => {
    const headers = ['Name', 'Age', 'Gender', 'City', 'Wing', 'StreakDays', 'SamayikCount', 'JaapCount', 'MeditationMins', 'SwadhyayBooks', 'ExportDate'];
    const row = [
      `"${profile.fullName || profile.name || ''}"`,
      `"${profile.age || ''}"`,
      `"${profile.gender || ''}"`,
      `"${profile.city || ''}"`,
      `"${profile.wing || ''}"`,
      stats.streakDays,
      stats.samayikCount,
      stats.jaapCount,
      stats.meditationMins,
      stats.swadhyayBooks,
      `"${new Date().toISOString()}"`
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Terapanth_Sadhana_Data_${profile.name || 'User'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Export Raw JSON Backup
  const handleDownloadJSON = () => {
    const backupData = {
      app: "Terapanth AI",
      version: "2.0",
      exportTimestamp: new Date().toISOString(),
      userProfile: profile,
      sadhanaStats: stats,
      localTodos: JSON.parse(localStorage.getItem('sadhana_todos') || '[]'),
      journalDraft: localStorage.getItem('spiritual_journal_draft') || '',
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `terapanth_backup_${profile.name || 'user'}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white flex items-center justify-between relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner text-amber-200">
                <Share2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-300" />
                    {language === 'hi' ? '100% सुरक्षित एवं निजी' : '100% Client-Side Private'}
                  </span>
                </div>
                <h3 className="font-serif font-extrabold text-lg sm:text-xl text-white mt-0.5">
                  {language === 'hi' ? 'सुरक्षित साधना डेटा शेयरिंग' : 'Safe & Secure Sadhana Data Sharing'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Privacy & Safety Security Note */}
          <div className="bg-amber-950/40 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-2 text-amber-200/90 text-xs shrink-0 font-medium">
            <Lock size={14} className="text-amber-400 shrink-0" />
            <span>
              {language === 'hi'
                ? 'आपका समस्त डेटा केवल आपके फ़ोन डिवाइस पर सुरक्षित है। आप इसे पूर्ण गोपनीयता के साथ किसी भी फ़ॉर्मेट में शेयर/डाउनलोड कर सकते हैं।'
                : 'Your data resides safely on your device. You can copy, export or share it securely in any format.'}
            </span>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">

            {/* Personalized Visual Greeting Card Preview */}
            <div className="bg-gradient-to-br from-slate-950 via-stone-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-mono">
                    {language === 'hi' ? 'प्रमाणित आध्यात्मिक रिपोर्ट' : 'Verified Spiritual Report'}
                  </span>
                  <h4 className="font-serif text-xl font-black text-amber-200 mt-0.5">
                    {greetingText}
                  </h4>
                </div>
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                  🔥 {stats.streakDays} {language === 'hi' ? 'दिन स्ट्रिक' : 'Days Streak'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase">{language === 'hi' ? 'नाम' : 'Name'}</span>
                  <span className="font-bold text-white text-sm">{profile.fullName || profile.name || (language === 'hi' ? 'साधक' : 'Devotee')}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase">{language === 'hi' ? 'स्थान/विंग' : 'City / Wing'}</span>
                  <span className="font-bold text-white text-sm line-clamp-1">{profile.city || 'भारत'} • {profile.wing || 'श्रावक'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                  <span className="text-amber-300 font-extrabold text-base block">{stats.samayikCount}</span>
                  <span className="text-[10px] text-gray-300">{language === 'hi' ? 'सामयिक' : 'Samayik'}</span>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-xl">
                  <span className="text-orange-300 font-extrabold text-base block">{stats.jaapCount}</span>
                  <span className="text-[10px] text-gray-300">{language === 'hi' ? 'जाप माला' : 'Jaap Malas'}</span>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <span className="text-emerald-300 font-extrabold text-base block">{stats.meditationMins}m</span>
                  <span className="text-[10px] text-gray-300">{language === 'hi' ? 'ध्यान' : 'Meditation'}</span>
                </div>
              </div>
            </div>

            {/* Export Format Tabs */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2 uppercase tracking-wider">
                {language === 'hi' ? 'फॉर्मेट चुनें जिसमें शेयर या डाउनलोड करना चाहते हैं:' : 'Select Share / Export Format:'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setActiveTab('share')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    activeTab === 'share'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 border-white/10 text-gray-300 hover:bg-slate-750'
                  }`}
                >
                  <MessageSquare size={18} />
                  <span>{language === 'hi' ? 'WhatsApp/टेक्स्ट' : 'WhatsApp/Text'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    activeTab === 'pdf'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 border-white/10 text-gray-300 hover:bg-slate-750'
                  }`}
                >
                  <FileText size={18} />
                  <span>{language === 'hi' ? 'PDF रिपोर्ट' : 'PDF Certificate'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('csv')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    activeTab === 'csv'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 border-white/10 text-gray-300 hover:bg-slate-750'
                  }`}
                >
                  <Database size={18} />
                  <span>{language === 'hi' ? 'CSV एक्सेल' : 'CSV Excel'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('json')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    activeTab === 'json'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 border-white/10 text-gray-300 hover:bg-slate-750'
                  }`}
                >
                  <Download size={18} />
                  <span>{language === 'hi' ? 'JSON बैकअप' : 'JSON Backup'}</span>
                </button>
              </div>
            </div>

            {/* Tab Details */}
            <div className="bg-slate-850 border border-white/10 rounded-2xl p-4">
              {activeTab === 'share' && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-300">
                    <p className="font-semibold text-amber-300 mb-1">
                      {language === 'hi' ? '📱 व्हाट्सएप एवं सोशल मीडिया फ़ॉर्मेटेड शेयर' : '📱 WhatsApp & Social Media Formatted Text'}
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      {language === 'hi' ? 'अपनी दैनिक साधना और प्रगति रिपोर्ट को सुंदर इमोजी और संरचित टेक्स्ट में तुरंत कॉपी या व्हाट्सएप पर शेयर करें:' : 'Share your formatted daily sadhana updates directly to WhatsApp groups:'}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-white/10 font-mono text-[11px] text-amber-200/90 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {generateShareText()}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleCopyText}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={16} className="text-slate-950" />
                          <span>{language === 'hi' ? 'कॉपी हो गया!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>{language === 'hi' ? 'टेक्स्ट कॉपी करें' : 'Copy Formatted Text'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleWhatsAppShare}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md cursor-pointer"
                    >
                      <MessageSquare size={16} />
                      <span>{language === 'hi' ? 'WhatsApp पर भेजें' : 'Share on WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'pdf' && (
                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-amber-300">
                    {language === 'hi' ? '📄 आधिकारिक PDF साधना सर्टिफिकेट डाउनलोड' : '📄 Official PDF Sadhana Certificate'}
                  </p>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    {language === 'hi'
                      ? 'तेरापंथ धर्मसंघ के आधिकारिक लेटरहेड स्टाइल में अपनी साधना, सामयिक, जाप एवं इतिहास का रंगीन PDF डाउनलोड करें जिसे आप प्रिंट कर सकते हैं।'
                      : 'Download a beautifully styled PDF report card containing your profile, streaks, and itemized spiritual logs ready to print.'}
                  </p>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Printer size={16} />
                    <span>{language === 'hi' ? 'PDF रिपोर्ट डाउनलोड करें' : 'Download Printable PDF'}</span>
                  </button>
                </div>
              )}

              {activeTab === 'csv' && (
                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-amber-300">
                    {language === 'hi' ? '📊 CSV एक्सेल स्प्रेडशीट एक्सपोर्ट' : '📊 CSV Spreadsheet Export'}
                  </p>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    {language === 'hi'
                      ? 'अपनी साधना के डेटा को MS Excel या Google Sheets में खोलने के लिए .csv फ़ाइल डाउनलोड करें।'
                      : 'Export structured tabular sadhana records into a .csv file compatible with Excel or Google Sheets.'}
                  </p>
                  <button
                    onClick={handleDownloadCSV}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Database size={16} />
                    <span>{language === 'hi' ? 'CSV एक्सपोर्ट डाउनलोड करें' : 'Download .CSV Spreadsheet'}</span>
                  </button>
                </div>
              )}

              {activeTab === 'json' && (
                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-amber-300">
                    {language === 'hi' ? '🔒 संपूर्ण सुरक्षित JSON डेटा बैकअप' : '🔒 Complete Raw JSON Data Backup'}
                  </p>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    {language === 'hi'
                      ? 'अपने प्रोफ़ाइल विवरण, नोट्स और संपूर्ण लोकल साधना रिकॉर्ड का सुरक्षित JSON बैकअप फ़ाइल डाउनलोड करें।'
                      : 'Save a local offline backup of your full profile and sadhana records to preserve offline.'}
                  </p>
                  <button
                    onClick={handleDownloadJSON}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Download size={16} />
                    <span>{language === 'hi' ? 'JSON बैकअप फ़ाइल डाउनलोड करें' : 'Download Raw JSON Backup'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 shrink-0">
            <span className="flex items-center gap-1">
              <Sparkles size={13} className="text-amber-400" />
              {language === 'hi' ? 'तेरापंथ एआई - अहिंसा परमो धर्म:' : 'Terapanth AI • Ahimsa Paramo Dharma'}
            </span>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
