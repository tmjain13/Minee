import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, RefreshCw, PenTool, Award, PlayCircle, Filter } from 'lucide-react';

export interface IllustratedEmptyStateProps {
  type: 'journal' | 'quiz' | 'media';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const IllustratedEmptyState: React.FC<IllustratedEmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  // Config per type
  const config = {
    journal: {
      defaultTitle: 'कोई प्रविष्टि नहीं मिली (No Entries Found)',
      defaultDesc: 'अपनी दैनंदिन आत्म-साधना, विचार एवं भावनाओं को यहाँ दर्ज करें। आपकी आध्यात्मिक यात्रा यहाँ सुरक्षित रहेगी।',
      defaultAction: 'आज का विचार लिखें (Write Entry)',
      actionIcon: PenTool,
      accentColor: '#7A1F2B', // Deep Maroon
      bgGradient: 'from-[#FAF4F5] via-[#FFF9FA] to-[#F5EBEB] dark:from-[#2A0E12] dark:via-[#1F0A0D] dark:to-[#170709]',
      borderColor: 'border-[#7A1F2B]/15 dark:border-[#7A1F2B]/30',
      badge: 'आत्म-चिंतन डायरी',
    },
    quiz: {
      defaultTitle: 'ज्ञान-परीक्षण उपलब्ध नहीं (No Quiz Available)',
      defaultDesc: 'आपने आज का क्विज़ पूर्ण कर लिया है या चयनित श्रेणी में प्रश्न उपलब्ध नहीं हैं। स्वाध्याय निरंतर जारी रखें।',
      defaultAction: 'पुनः प्रयास करें (Retake Quiz)',
      actionIcon: RefreshCw,
      accentColor: '#B45309', // Amber / Gold
      bgGradient: 'from-[#FCF8F2] via-[#FFFDF9] to-[#F8F2E8] dark:from-[#271E11] dark:via-[#1D160C] dark:to-[#151008]',
      borderColor: 'border-amber-600/15 dark:border-amber-500/30',
      badge: 'आगम स्वाध्याय क्विज़',
    },
    media: {
      defaultTitle: 'कोई मीडिया सामग्री नहीं (No Media Content)',
      defaultDesc: 'चयनित श्रेणी या फ़िल्टर में ऑडियो, वीडियो अथवा तस्वीरें उपलब्ध नहीं हैं। कृपया फ़िल्टर बदलें।',
      defaultAction: 'सभी फ़िल्टर साफ़ करें (Clear Filters)',
      actionIcon: Filter,
      accentColor: '#7A1F2B',
      bgGradient: 'from-[#FAF8F5] via-[#FCFAFAF] to-[#F3EEEA] dark:from-[#21181A] dark:via-[#1A1214] dark:to-[#120B0D]',
      borderColor: 'border-stone-300/40 dark:border-stone-700/40',
      badge: 'प्रवचन एवं मीडिया',
    }
  }[type];

  const displayTitle = title || config.defaultTitle;
  const displayDesc = description || config.defaultDesc;
  const displayAction = actionLabel || config.defaultAction;
  const ActionIcon = config.actionIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative w-full rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col items-center text-center overflow-hidden bg-gradient-to-b ${config.bgGradient} ${config.borderColor} ${className}`}
    >
      {/* Background Decorative Glow */}
      <div 
        className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: config.accentColor }}
      />
      <div 
        className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: config.accentColor }}
      />

      {/* Badge Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-stone-200/50 dark:border-stone-700/50 shadow-2xs mb-5">
        <Sparkles size={12} className="text-[#7A1F2B] dark:text-[#D3A2A9]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">
          {config.badge}
        </span>
      </div>

      {/* Minimalist Vector Illustration */}
      <div className="relative mb-5 flex items-center justify-center">
        {type === 'journal' && (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 relative flex items-center justify-center"
          >
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <circle cx="60" cy="60" r="50" fill="#7A1F2B" fillOpacity="0.06" stroke="#7A1F2B" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Journal Book */}
              <rect x="35" y="30" width="46" height="60" rx="6" fill="#FAF4F5" stroke="#7A1F2B" strokeWidth="2.5" />
              <path d="M42 30 V 90" stroke="#7A1F2B" strokeWidth="2" strokeDasharray="2 2" />
              <line x1="48" y1="42" x2="72" y2="42" stroke="#7A1F2B" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
              <line x1="48" y1="52" x2="68" y2="52" stroke="#7A1F2B" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
              <line x1="48" y1="62" x2="64" y2="62" stroke="#7A1F2B" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.3" />
              {/* Feather Quill */}
              <path d="M82 25 Q 75 50 62 68" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M82 25 Q 88 35 80 45 Q 75 48 70 54" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              {/* Sparkle Dot */}
              <circle cx="85" cy="22" r="2.5" fill="#B45309" />
            </svg>
          </motion.div>
        )}

        {type === 'quiz' && (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 relative flex items-center justify-center"
          >
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <circle cx="60" cy="60" r="50" fill="#B45309" fillOpacity="0.06" stroke="#B45309" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Traditional Diya / Lamp Body */}
              <path d="M35 68 Q 60 88 85 68 Q 80 62 60 62 Q 40 62 35 68 Z" fill="#FCF8F2" stroke="#B45309" strokeWidth="2.5" />
              <path d="M50 80 Q 60 86 70 80" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
              {/* Flame */}
              <path d="M60 38 Q 68 50 60 60 Q 52 50 60 38 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              <path d="M60 44 Q 64 52 60 58 Q 56 52 60 44 Z" fill="#FDE68A" />
              {/* Question mark halo */}
              <text x="60" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#B45309" fontFamily="serif">?</text>
            </svg>
          </motion.div>
        )}

        {type === 'media' && (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 relative flex items-center justify-center"
          >
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <circle cx="60" cy="60" r="50" fill="#7A1F2B" fillOpacity="0.05" stroke="#7A1F2B" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Media Frame */}
              <rect x="32" y="36" width="56" height="48" rx="8" fill="#FAF8F5" stroke="#7A1F2B" strokeWidth="2.5" />
              {/* Sound waves arcs */}
              <path d="M22 60 Q 16 50 22 40" fill="none" stroke="#7A1F2B" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
              <path d="M98 60 Q 104 50 98 40" fill="none" stroke="#7A1F2B" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
              {/* Play symbol */}
              <polygon points="54,50 72,60 54,70" fill="#7A1F2B" stroke="#7A1F2B" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Typography */}
      <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 max-w-md leading-snug">
        {displayTitle}
      </h3>
      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-sm leading-relaxed font-medium">
        {displayDesc}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full max-w-xs">
        {onAction && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAction}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: config.accentColor }}
          >
            <ActionIcon size={14} />
            <span>{displayAction}</span>
          </motion.button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default IllustratedEmptyState;
