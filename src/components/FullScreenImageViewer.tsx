import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Sparkles, Check, Share2, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getCategoryStyles } from './GalleryTab';
import { devLog } from '../lib/devLog';

interface MonasticMember {
  id: string;
  name: string;
  role: string;
  category: 'Acharya' | 'Muni' | 'Sadhvi' | 'Sadhvi Pramukha' | 'Mahashraman';
  imageUrl?: string;
  description?: string;
}

interface FullScreenImageViewerProps {
  member: MonasticMember;
  onClose: () => void;
  isDarkMode?: boolean;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ 
  member, 
  onClose, 
  isDarkMode = false 
}) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Gesture Tracking Refs
  const imageRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isPinching = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTranslateX = useRef(0);
  const startTranslateY = useRef(0);
  const touchStartDistance = useRef(0);
  const touchStartScale = useRef(1);

  // Reset parameters when member changes or on manual reset
  const handleReset = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setTranslateX(0);
        setTranslateY(0);
      }
      return next;
    });
  };

  // Double Click / Double Tap toggle zoom
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.2);
    }
  };

  // --- TOUCH EVENT HANDLERS FOR PINCH-TO-ZOOM & PANNING ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch: panning / dragging
      isDragging.current = true;
      isPinching.current = false;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startTranslateX.current = translateX;
      startTranslateY.current = translateY;
    } else if (e.touches.length === 2) {
      // Double touch: pinch zoom
      isPinching.current = true;
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistance.current = Math.hypot(dx, dy);
      touchStartScale.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinching.current && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      
      if (touchStartDistance.current > 0) {
        const factor = currentDistance / touchStartDistance.current;
        const newScale = Math.min(Math.max(touchStartScale.current * factor, 1), 4);
        setScale(newScale);
        if (newScale === 1) {
          setTranslateX(0);
          setTranslateY(0);
        }
      }
    } else if (isDragging.current && e.touches.length === 1 && scale > 1) {
      const deltaX = e.touches[0].clientX - startX.current;
      const deltaY = e.touches[0].clientY - startY.current;
      setTranslateX(startTranslateX.current + deltaX);
      setTranslateY(startTranslateY.current + deltaY);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    isPinching.current = false;
  };

  // --- MOUSE EVENT HANDLERS FOR DRAGGING ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      isDragging.current = true;
      startX.current = e.clientX;
      startY.current = e.clientY;
      startTranslateX.current = translateX;
      startTranslateY.current = translateY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && scale > 1) {
      const deltaX = e.clientX - startX.current;
      const deltaY = e.clientY - startY.current;
      setTranslateX(startTranslateX.current + deltaX);
      setTranslateY(startTranslateY.current + deltaY);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Keyboard controls & Wheel zoom listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Dynamic High-Resolution Custom Monogram Canvas Exporter
  const handleDownloadCard = () => {
    setIsDownloading(true);
    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not acquire canvas 2D context");

        const styles = getCategoryStyles(member.category);

        // Gradient Canvas Background (Celestial theme)
        const gradient = ctx.createRadialGradient(540, 540, 50, 540, 540, 760);
        gradient.addColorStop(0, '#121422');
        gradient.addColorStop(1, '#06070a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);

        // Thin golden outline borders
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, 1020, 1020);

        ctx.strokeStyle = styles.primary;
        ctx.lineWidth = 3;
        ctx.strokeRect(48, 48, 984, 984);

        // Radial golden glowing circular aura
        const aura = ctx.createRadialGradient(540, 380, 20, 540, 380, 230);
        aura.addColorStop(0, `${styles.primary}44`);
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(540, 380, 230, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid badge background
        ctx.fillStyle = styles.primary;
        ctx.beginPath();
        ctx.arc(540, 380, 160, 0, Math.PI * 2);
        ctx.fill();

        // High gloss gold circular rim
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(540, 380, 160, 0, Math.PI * 2);
        ctx.stroke();

        // Compute Name initials (e.g. Acharya Shri Mahashraman Ji -> AM)
        const getInitials = (name: string) => {
          const clean = name.replace(/^(Acharya|Sadhvi|Muni|Ganadhipati|Pramukha|Shri)\s+/gi, '').replace(/Ji$/i, '').trim();
          const parts = clean.split(/\s+/);
          if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
          }
          return clean.slice(0, 2).toUpperCase();
        };

        const initialsText = getInitials(member.name);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 110px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initialsText, 540, 380);

        // Sacred Text Header
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 30px "Inter", sans-serif';
        ctx.fillText('🙏 जय जिनेन्द्र 🙏', 540, 620);

        // Acharya Name in bold Display script
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
        ctx.fillText(member.name, 540, 690);

        // Draw category pill badge (with safe fallback for older browsers)
        const catLabel = member.category.toUpperCase();
        ctx.font = '900 22px Inter, sans-serif';
        const textWidth = ctx.measureText(catLabel).width;
        const badgeW = textWidth + 44;
        const badgeH = 46;
        const badgeX = 540 - badgeW / 2;
        const badgeY = 746;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23);
        } else {
          ctx.rect(badgeX, badgeY, badgeW, badgeH);
        }
        ctx.fillStyle = styles.bg;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = styles.border;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(catLabel, 540, badgeY + badgeH / 2 + 1);

        // Monastic Role caption description
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.font = 'italic 26px sans-serif';
        ctx.fillText(member.role, 540, 842);

        // Footer credentials
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('TERAPANTH AI DHARMASANGH HUB', 540, 955);

        // Export and Trigger download
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${member.id}-canonical-image.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Canvas card generation failed:", err);
      } finally {
        setIsDownloading(false);
      }
    }, 400);
  };

  const handleDownloadOriginal = async () => {
    if (!member.imageUrl) {
      handleDownloadCard();
      return;
    }

    setIsDownloading(true);
    try {
      // Fetch high resolution image and trigger standard download dialog
      const response = await fetch(member.imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error("Network response error during download");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${member.id}-high-res.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("Direct download failed, falling back to opening source in new tab:", error);
      window.open(member.imageUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareCaption = () => {
    const shareText = `🙏 जय जिनेंद्र! तेरापंथ धर्मसंघ के महान साधक:\n📌 ${member.name} (${member.role})\n✨ श्रेणी: ${member.category}\n▫️ ${member.description || ''}\n\nसाझाकर्ता: तेरापंथ एआई ऐप।`;
    
    if (navigator.share) {
      navigator.share({
        title: member.name,
        text: shareText
      }).catch(err => devLog('Share dismissed', err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(null as any), 2000);
      });
    }
  };

  const styles = getCategoryStyles(member.category);

  return (
    <div 
      className="fixed inset-0 bg-black z-[200] flex flex-col justify-between select-none touch-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* HEADER CONTROLS (Top Floating Bar) */}
      <div className="w-full flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent z-[210] absolute top-0 inset-x-0">
        <button 
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-white font-black text-sm tracking-wide">{member.name}</span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{member.category}</span>
        </div>

        <button 
          onClick={handleDownloadOriginal}
          disabled={isDownloading}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download size={20} />
          )}
        </button>
      </div>

      {/* MAIN IMAGING STAGE WITH PINCH & PAN GESTURES */}
      <div 
        className="flex-1 flex items-center justify-center relative w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleTap}
      >
        <div 
          ref={imageRef}
          className="transition-transform duration-100 ease-out select-none will-change-transform flex items-center justify-center"
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          }}
        >
          {member.imageUrl ? (
            <img 
              src={member.imageUrl} 
              alt={member.name} 
              draggable={false}
              className="max-w-[92vw] max-h-[72dvh] object-contain pointer-events-none rounded-xl shadow-2xl border border-white/5"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}

          {/* Fallback Gorgeous stylized Digital Emblem Monogram */}
          <div 
            className="w-72 h-72 sm:w-80 sm:h-80 rounded-full flex flex-col items-center justify-center font-extrabold text-white relative shadow-2xl select-none"
            style={{ 
              backgroundColor: styles.primary, 
              display: member.imageUrl ? 'none' : 'flex',
              border: `6px solid #D4AF37`,
              boxShadow: `0 20px 50px ${styles.primary}55`
            }}
          >
            <span className="text-7xl mb-1">{member.name.replace(/^(Acharya|Sadhvi|Muni|Ganadhipati|Pramukha|Shri)\s+/gi, '').slice(0, 2).toUpperCase()}</span>
            <span className="text-[10px] tracking-widest font-black text-yellow-300 uppercase">Canonical Emblem</span>
          </div>
        </div>

        {/* Floating Zoom Indicator */}
        {scale > 1 && (
          <div className="absolute bottom-24 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold border border-white/10">
            Zoom: {scale.toFixed(1)}x
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS & CAPTIONS */}
      <div className="w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 pb-8 px-5 z-[210] absolute bottom-0 inset-x-0 flex flex-col gap-4">
        {/* Short Biography Context */}
        <p className="text-xs text-zinc-300 text-center max-w-md mx-auto line-clamp-3 leading-relaxed">
          {member.description || "श्रमण संघ के नियमों का पालन करते हुए आत्म-कल्याण की राह पर अग्रसर तपस्वी साधक।"}
        </p>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between max-w-sm w-full mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-2">
          {/* Zoom Out Button */}
          <button 
            onClick={handleZoomOut}
            disabled={scale === 1}
            className={`p-3 rounded-xl transition ${scale === 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-white hover:bg-white/10 active:scale-95'}`}
          >
            <ZoomOut size={18} />
          </button>

          {/* Reset Zoom */}
          <button 
            onClick={handleReset}
            disabled={scale === 1}
            className={`px-4 py-2.5 rounded-xl transition text-[10px] font-bold flex items-center gap-1.5 ${scale === 1 ? 'text-zinc-500 cursor-not-allowed' : 'text-white bg-white/10 hover:bg-white/20 active:scale-95'}`}
          >
            <RotateCcw size={13} />
            Reset (1:1)
          </button>

          {/* Share Option */}
          <button 
            onClick={handleShareCaption}
            className="p-3 rounded-xl text-white hover:bg-white/10 active:scale-95"
          >
            {isCopied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
          </button>

          {/* Zoom In Button */}
          <button 
            onClick={handleZoomIn}
            disabled={scale === 4}
            className={`p-3 rounded-xl transition ${scale === 4 ? 'text-zinc-600 cursor-not-allowed' : 'text-white hover:bg-white/10 active:scale-95'}`}
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenImageViewer;
