import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Type, Clock, Share2, Check, Download, 
  Trash2, BookOpen, AlertCircle, Sparkles, CheckCircle2 
} from 'lucide-react';
import { OfflineStorage } from '../lib/offline-storage';
import { devLog } from '../lib/devLog';

interface Article {
  id: string;
  title: string;
  category: string;
  details: string;
  description?: string;
  author?: string;
}

interface ArticleReaderProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  onToggleOffline?: (isOffline: boolean) => void;
}

export default function ArticleReader({ isOpen, onClose, article }: ArticleReaderProps) {
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('terapanth_reader_font_size');
    return saved ? parseInt(saved, 10) : 16;
  });

  const [isSavedOffline, setIsSavedOffline] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Persistence of font-size selection
  useEffect(() => {
    localStorage.setItem('terapanth_reader_font_size', fontSize.toString());
  }, [fontSize]);

  // Synchronize 'Save for Offline' status using genuine IndexedDB + local tier cache
  useEffect(() => {
    if (!article) return;
    try {
      const cached = OfflineStorage.getOfflineCache();
      const exists = cached.some(item => item.id === article.id);
      setIsSavedOffline(exists);
    } catch (err) {
      console.warn("Unable to read local offline state cache:", err);
    }
  }, [article]);

  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (!element) return;
    const totalHeight = element.scrollHeight - element.clientHeight;
    if (totalHeight === 0) {
      setScrollProgress(100);
      return;
    }
    const progress = (element.scrollTop / totalHeight) * 100;
    setScrollProgress(progress);
  };

  if (!isOpen || !article) return null;

  // Reading time calculations (~180 WPM baseline for bilingual text)
  const wordCount = article.details ? article.details.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 180));

  const handleToggleOffline = () => {
    try {
      const cached = OfflineStorage.getOfflineCache();
      const exists = cached.some(item => item.id === article.id);

      if (exists) {
        // Remove from offline cache
        const updated = cached.filter(item => item.id !== article.id);
        OfflineStorage.saveToOfflineCache(updated);
        setIsSavedOffline(false);
        devLog(`Article '${article.title}' deleted from IndexedDB cache.`);
      } else {
        // Add to offline cache
        const newItem = {
          id: article.id,
          title: article.title,
          category: article.category as any,
          description: article.description || '',
          details: article.details,
          tags: ['Offline_Saved']
        };
        OfflineStorage.saveToOfflineCache([...cached, newItem]);
        setIsSavedOffline(true);
        devLog(`Article '${article.title}' aggressively persisted to IndexedDB.`);
      }
    } catch (err) {
      console.error("IndexedDB transactional write failure during manual offline toggle:", err);
    }
  };

  const handleShare = async () => {
    const textToShare = `📖 *${article.title}* (${article.category})\n\n"${article.description || ''}"\n\n${article.details}\n\nShared via Terapanth AI Hub 🙏`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: textToShare,
        });
      } catch (err) {
        devLog("Bypassed or cancelled native sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" id="article-reader-modal-overlay">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative flex flex-col w-full h-full sm:max-w-2xl sm:h-[85vh] bg-white dark:bg-zinc-900 sm:rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden text-left"
        >
          {/* Scroll progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-black/[0.03] dark:bg-white/[0.03] z-50">
            <div 
              className="h-full bg-orange-500 transition-all duration-75"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Reader Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 mt-1 shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                <Clock size={12} />
                {estimatedReadingTime} min read
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full transition-colors cursor-pointer"
                title="Close Reader"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Controls Bar (Font Adjustment & Save Offline) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-zinc-50 dark:bg-zinc-800/30 border-b border-black/5 dark:border-white/5 shrink-0 select-none">
            {/* Font Adjuster */}
            <div className="flex items-center gap-2 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-xl border border-black/5 dark:border-white/5">
              <button
                onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                className="p-1.5 px-2.5 hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg transition-all active:scale-90 text-[10px] font-black cursor-pointer"
                title="Decrease Text Size"
              >
                A-
              </button>
              <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-1">
                <Type size={11} />
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
                className="p-1.5 px-2.5 hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg transition-all active:scale-90 text-[10px] font-black cursor-pointer"
                title="Increase Text Size"
              >
                A+
              </button>
            </div>

            {/* Save Offline and Share Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleOffline}
                className={`py-1.5 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all border cursor-pointer active:scale-95 ${
                  isSavedOffline
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.05]"
                }`}
                title={isSavedOffline ? "Saved for offline reading" : "Download to read offline"}
              >
                {isSavedOffline ? (
                  <>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>सहेजा हुआ ✓</span>
                  </>
                ) : (
                  <>
                    <Download size={12} />
                    <span>ऑफलाइन सहेजें</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="py-1.5 px-3.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Share Article"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span>कॉपी हुआ!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={12} />
                    <span>साझा करें</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Article Main Body Content (Scrollable Container) */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 select-text scroll-smooth"
            id="article-reader-body-scroller"
          >
            <div className="space-y-3.5 text-left border-b border-black/[0.03] dark:border-white/[0.03] pb-6">
              <h1 className="serif-text font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white leading-tight">
                {article.title}
              </h1>
              {article.description && (
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed italic border-l-2 border-orange-500/40 pl-3">
                  {article.description}
                </p>
              )}
              {article.author && (
                <div className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest mt-1">
                  लेखक: {article.author}
                </div>
              )}
            </div>

            {/* Core Text Body Matter */}
            <div 
              style={{ fontSize: `${fontSize}px` }}
              className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal space-y-4"
              id="article-rich-text-content"
            >
              {article.details}
            </div>
          </div>

          {/* Article Footer Attribution */}
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/10 border-t border-black/5 dark:border-white/5 shrink-0 text-center select-none">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              आध्यात्मिक स्वाध्याय • तेरापंथ एआई नॉलेज हब • © 2026
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
