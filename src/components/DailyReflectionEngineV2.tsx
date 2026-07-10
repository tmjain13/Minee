import React, { useMemo } from 'react';

// 📚 365-DAY COMPLETE DATA MATRIX REFERENCE LINKED TO YOUR PDF
import { rozKiSalahBook } from '../data/rozKiSalahBook';

interface DailyReflectionEngineV2Props {
  isDarkMode?: boolean;
}

export const DailyReflectionEngineV2: React.FC<DailyReflectionEngineV2Props> = ({ isDarkMode = true }) => {
  // 🧠 DETECT CURRENT DAY NUMBER INTERNALLY (1 - 365)
  const currentDayIndex = useMemo(() => {
    try {
      const today = new Date(); // Automatically tracking chronological timelines
      const yearStart = new Date(today.getFullYear(), 0, 0);
      const difference = today.getTime() - yearStart.getTime();
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const rawIndex = Math.floor(difference / millisecondsPerDay);
      
      // Enforce clean bounds safely
      return rawIndex >= 1 && rawIndex <= 365 ? rawIndex : 164;
    } catch (e) {
      return 164; // Fallback directly matching June 13 baseline timeline
    }
  }, []);

  // Safe fallback mechanism if record block is unmapped in some environments
  const activeQuote = useMemo(() => {
    return rozKiSalahBook[currentDayIndex] || rozKiSalahBook[164];
  }, [currentDayIndex]);

  const css = {
    // 🎨 ABSOLUTE CONTRAST MATRIX
    cardBg: isDarkMode ? 'rgba(0, 242, 254, 0.05)' : '#ffffff',
    border: isDarkMode ? 'rgba(0, 242, 254, 0.25)' : 'rgba(15, 23, 42, 0.08)',
    textPrimary: isDarkMode ? '#ffffff' : '#0f172a',
    accentColor: isDarkMode ? '#00f2fe' : '#ffaa00',
    shadow: isDarkMode ? '0 0 15px rgba(0,242,254,0.15)' : '0 4px 20px rgba(15, 23, 42, 0.03)'
  };

  return (
    /* 🛠️ ULTRA-BROAD RECTANGULAR EDGE-TO-EDGE Layout Overrides */
    <div style={{ 
      margin: '0 -16px', // consume the parent side padding bottleneck
      padding: '0 8px', // clean micro-padding safety block
      boxSizing: 'border-box', 
      width: 'calc(100% + 32px)',
      overflowX: 'hidden' // Blocks nasty side scroll leaks on iOS
    }}>
      <div style={{ 
        background: css.cardBg, 
        border: `1px solid ${css.border}`, 
        borderRadius: '24px', 
        padding: '18px 16px', // Broader top/side padding inside card
        boxShadow: css.shadow,
        boxSizing: 'border-box',
        width: '100%',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out'
      }}>
        {/* TOP META HUD */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: css.accentColor, fontWeight: '800', letterSpacing: '0.4px' }}>
            🔔 दैनिक अनुप्रेक्षा • ROZ KI EK SALAH (DAY {currentDayIndex}/365)
          </span>
          <span style={{ 
            fontSize: '9px', 
            background: isDarkMode ? 'rgba(0,242,254,0.1)' : 'rgba(255,170,0,0.1)', 
            color: css.accentColor, 
            padding: '2px 8px', 
            borderRadius: '6px', 
            fontWeight: '800' 
          }}>
            १००% ऑफ़लाइन
          </span>
        </div>

        {/* BROAD HIGH-DEFINITION DEVANAGARI TEXT MATTER */}
        <p style={{ 
          margin: 0, 
          fontSize: '15.5px', 
          color: css.textPrimary, 
          fontStyle: 'italic', 
          fontWeight: '700',
          lineHeight: '1.55',
          textAlign: 'left',
          wordBreak: 'break-word'
        }}>
          "{activeQuote?.text}"
        </p>

        {/* AUTHOR LINE ANCHOR LAYER */}
        <div style={{ 
          textAlign: 'right', 
          marginTop: '10px', 
          fontSize: '12px', 
          fontWeight: '800', 
          color: css.accentColor 
        }}>
          — {activeQuote?.author || "युगप्रधान आचार्य श्री महाश्रमण जी"}
        </div>
      </div>
    </div>
  );
};
