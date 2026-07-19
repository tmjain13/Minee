import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';

interface SakuraWatermarkProps {
  className?: string;
  showCenterLogo?: boolean;
}

interface DriftingPetal {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
}

export default function SakuraWatermark({ className = "", showCenterLogo = true }: SakuraWatermarkProps) {
  // Parallax spring coordinates
  const parallaxX = useSpring(0, { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(0, { stiffness: 60, damping: 20 });

  // Season state detection
  const [season, setSeason] = useState({
    name: "General",
    colorClass: "text-orange-600/10 dark:text-amber-500/5",
    accentColor: "rgba(249, 115, 22, 0.08)",
    activeFlowerColor: "#f97316",
    gradientStart: "from-orange-500/5",
  });

  // Tapped state of various Sakura flowers for tactile engagement
  const [flowerStates, setFlowerStates] = useState<Record<string, { rotate: number; clicked: boolean }>>({
    tl1: { rotate: 0, clicked: false },
    tl2: { rotate: 0, clicked: false },
    tr1: { rotate: 0, clicked: false },
    tr2: { rotate: 0, clicked: false },
    bl1: { rotate: 0, clicked: false },
    bl2: { rotate: 0, clicked: false },
    br1: { rotate: 0, clicked: false },
    br2: { rotate: 0, clicked: false },
    lm: { rotate: 0, clicked: false },
    rm: { rotate: 0, clicked: false },
  });

  // Season / month programmatic color change
  useEffect(() => {
    const month = new Date().getMonth(); // 0 (Jan) - 11 (Dec)
    
    if (month === 6 || month === 7 || month === 8 || month === 9 || month === 10) {
      // July to Nov: Chaturmas (Spiritual Retreat / Monsoon) -> Emerald/Teal tones
      setSeason({
        name: "Chaturmas (Spiritual Retreat)",
        colorClass: "text-emerald-600/10 dark:text-emerald-500/5",
        accentColor: "rgba(16, 185, 129, 0.08)",
        activeFlowerColor: "#10b981",
        gradientStart: "from-emerald-500/5",
      });
    } else if (month === 0 || month === 1) {
      // Jan, Feb: Maryada Mahotsav Season -> Gold/Amber/Bronze tones
      setSeason({
        name: "Maryada Mahotsav Season",
        colorClass: "text-amber-600/10 dark:text-amber-500/5",
        accentColor: "rgba(245, 158, 11, 0.08)",
        activeFlowerColor: "#f59e0b",
        gradientStart: "from-amber-500/5",
      });
    } else if (month === 2 || month === 3) {
      // March, April: Ahimsa Yatra & Mahavir Jayanti (Spring) -> Cherry Blossom Pink/Rose tones
      setSeason({
        name: "Ahimsa Yatra Season",
        colorClass: "text-rose-500/10 dark:text-rose-400/5",
        accentColor: "rgba(244, 63, 94, 0.08)",
        activeFlowerColor: "#f43f5e",
        gradientStart: "from-rose-500/5",
      });
    } else if (month === 11) {
      // Dec: Winter Sadhana -> Serene Indigo/Blue
      setSeason({
        name: "Winter Sadhana Season",
        colorClass: "text-blue-500/10 dark:text-blue-400/5",
        accentColor: "rgba(59, 130, 246, 0.08)",
        activeFlowerColor: "#3b82f6",
        gradientStart: "from-blue-500/5",
      });
    } else {
      // May, June: Summer Tapasya -> Warm Orange/Amber
      setSeason({
        name: "Sadhana & Tapasya Season",
        colorClass: "text-orange-600/10 dark:text-amber-500/5",
        accentColor: "rgba(249, 115, 22, 0.08)",
        activeFlowerColor: "#f97316",
        gradientStart: "from-orange-500/5",
      });
    }
  }, []);

  // Parallax Event Handlers
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // beta: front-to-back tilt (-180 to 180)
      // gamma: left-to-right tilt (-90 to 90)
      const tiltX = e.gamma ? Math.max(-30, Math.min(30, e.gamma)) : 0;
      const tiltY = e.beta ? Math.max(-30, Math.min(30, e.beta - 45)) : 0; // standard reading posture offset
      
      parallaxX.set((tiltX / 30) * 18);
      parallaxY.set((tiltY / 30) * 18);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const offsetX = ((e.clientX - innerWidth / 2) / (innerWidth / 2)) * 12;
      const offsetY = ((e.clientY - innerHeight / 2) / (innerHeight / 2)) * 12;
      parallaxX.set(offsetX);
      parallaxY.set(offsetY);
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [parallaxX, parallaxY]);

  // Click on a specific sakura flower rotates it and toggles color active state
  const handleFlowerClick = (id: string) => {
    setFlowerStates(prev => ({
      ...prev,
      [id]: {
        rotate: prev[id].rotate + 180,
        clicked: !prev[id].clicked,
      }
    }));
  };

  // Define drifting petals coordinates and attributes
  const driftingPetals: DriftingPetal[] = [
    { id: 1, startX: 100, startY: -50, endX: 250, endY: 1050, duration: 18, delay: 0 },
    { id: 2, startX: 300, startY: -50, endX: 520, endY: 1050, duration: 22, delay: 3 },
    { id: 3, startX: 600, startY: -50, endX: 800, endY: 1050, duration: 16, delay: 1.5 },
    { id: 4, startX: 800, startY: -50, endX: 950, endY: 1050, duration: 20, delay: 5 },
    { id: 5, startX: 200, startY: -50, endX: 450, endY: 1050, duration: 24, delay: 7 },
    { id: 6, startX: 500, startY: -50, endX: 720, endY: 1050, duration: 19, delay: 4 },
    { id: 7, startX: 700, startY: -50, endX: 900, endY: 1050, duration: 21, delay: 9 },
    { id: 8, startX: 900, startY: -50, endX: 980, endY: 1050, duration: 23, delay: 11 },
  ];

  // Helper to render a rotating, color-changing Sakura flower
  const renderSakuraFlower = (id: string, x: number, y: number, scale: number) => {
    const state = flowerStates[id] || { rotate: 0, clicked: false };
    return (
      <motion.g
        key={id}
        x={x}
        y={y}
        animate={{
          rotate: state.rotate,
          scale: scale,
        }}
        whileHover={{ scale: scale * 1.15 }}
        whileTap={{ scale: scale * 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          handleFlowerClick(id);
        }}
        className="pointer-events-auto cursor-pointer"
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        style={{ transformOrigin: "center" }}
      >
        {/* Five Petals radiating outwards */}
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d="M 0 0 C -8 -20, 8 -20, 0 0"
            transform={`rotate(${angle})`}
            strokeWidth="1.2"
            stroke={state.clicked ? "none" : "currentColor"}
            fill={state.clicked ? season.activeFlowerColor : "none"}
            className="transition-all duration-300"
            style={{ fillOpacity: state.clicked ? 0.35 : 0 }}
          />
        ))}
        {/* Core center ring / dot */}
        <circle
          cx="0"
          cy="0"
          r="2.5"
          fill={state.clicked ? season.activeFlowerColor : "currentColor"}
          className="transition-all duration-300"
        />
      </motion.g>
    );
  };

  return (
    <div className={`absolute inset-0 select-none z-0 overflow-hidden pointer-events-none ${className}`} id="sakura-dynamic-watermark">
      {/* Dynamic atmospheric color gradient based on season */}
      <div className={`absolute top-0 left-0 right-0 h-96 bg-gradient-to-b ${season.gradientStart} to-transparent pointer-events-none z-0`} />

      <motion.svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className={`w-full h-full ${season.colorClass} fill-none stroke-current z-0`}
        strokeWidth="1.5"
        style={{ x: parallaxX, y: parallaxY }}
      >
        {/* Concentric outer geometric flower/mandala circles extending across full screen */}
        <circle cx="500" cy="500" r="480" strokeDasharray="5 10" />
        <circle cx="500" cy="500" r="420" />
        <circle cx="500" cy="500" r="350" strokeDasharray="3 6" />
        <circle cx="500" cy="500" r="280" />
        <circle cx="500" cy="500" r="220" strokeDasharray="2 4" />
        <circle cx="500" cy="500" r="160" />

        {/* Floral/Sakura Petals radiating out (representing traditional sakura flower pattern / flower mandala) */}
        <g transform="translate(500, 500)">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <path
              key={angle}
              d="M 0 0 C -25 -60, 25 -60, 0 0"
              transform={`rotate(${angle}) translate(0, -160)`}
              className="opacity-70"
            />
          ))}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <circle
              key={angle}
              cx="0"
              cy="-210"
              r="4.5"
              transform={`rotate(${angle})`}
              className="fill-current opacity-50"
            />
          ))}
        </g>

        {/* Majestic Mountain Fuji Peak Silhouette in background */}
        <g transform="translate(250, 320) scale(1.8)" className="opacity-30">
          <path
            d="M 10 180 Q 90 150, 110 50 Q 115 35, 120 35 L 130 35 Q 135 35, 140 50 Q 160 150, 240 180 Z"
            strokeWidth="2"
          />
          {/* Fuji Snow Cap */}
          <path
            d="M 94 95 Q 110 108, 120 98 Q 128 112, 138 102 Q 148 110, 153 95 L 130 35 L 120 35 Z"
            className="fill-current opacity-20"
            strokeWidth="1.5"
          />
        </g>

        {/* Central Elegant Terapanth Emblem/Logo Layer (optional) */}
        {showCenterLogo && (
          <g transform="translate(500, 500)">
            {/* Center medallion circles */}
            <circle cx="0" cy="0" r="110" strokeWidth="2" />
            <circle cx="0" cy="0" r="102" strokeDasharray="4 2" strokeWidth="1" />
            <circle cx="0" cy="0" r="82" strokeWidth="1" />

            {/* Radiant Sun Rays/Aura from center */}
            <g className="opacity-40">
              {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle) => (
                <line
                  key={angle}
                  x1="0" y1="0"
                  x2="0" y2="-96"
                  transform={`rotate(${angle})`}
                  strokeWidth="1"
                  strokeDasharray="5 5"
                />
              ))}
            </g>

            {/* Sacred Lotus Flower at base of center */}
            <g transform="translate(0, 52) scale(1.1)" className="opacity-80">
              <path d="M 0,-15 C -8,-35 8,-35 0,-15 Z" className="fill-current" />
              <path d="M 0,-15 C -20,-28 -5,-5 0,-15 Z" className="fill-current" />
              <path d="M 0,-15 C 20,-28 5,-5 0,-15 Z" className="fill-current" />
              <path d="M 0,-15 C -28,-14 -12,2 0,-15 Z" className="fill-current" />
              <path d="M 0,-15 C 28,-14 12,2 0,-15 Z" className="fill-current" />
            </g>

            {/* Large Calligraphic Devanagari "तेरापंथ" text in center */}
            <text
              x="0"
              y="12"
              textAnchor="middle"
              className="fill-current font-bold text-[22px]"
              style={{ fontFamily: 'Inter, "Noto Sans Devanagari", sans-serif', letterSpacing: '1px' }}
              stroke="none"
            >
              तेरापंथ
            </text>

            {/* Secondary text curved or simple below the main text */}
            <text
              x="0"
              y="34"
              textAnchor="middle"
              className="fill-current font-medium text-[11px] uppercase tracking-[2px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
              stroke="none"
            >
              WEETRAGI
            </text>

            {/* Three Dots (Ratnatraya) above text */}
            <g transform="translate(0, -32)">
              <circle cx="-16" cy="0" r="4.5" className="fill-current" />
              <circle cx="0" cy="0" r="4.5" className="fill-current" />
              <circle cx="16" cy="0" r="4.5" className="fill-current" />
            </g>

            {/* Crescent Moon (Siddhashila) & Single Dot (Siddha) on top */}
            <g transform="translate(0, -58)">
              <path d="M -22,-6 Q 0,14 22,-6 Q 0,0 -22,-6" className="fill-current" stroke="none" />
              <circle cx="0" cy="-10" r="5" className="fill-current" />
            </g>
          </g>
        )}

        {/* Elegant 5-Petal Sakura Flowers distributed dynamically across the background */}
        {renderSakuraFlower("tl1", 150, 150, 1.8)}
        {renderSakuraFlower("tl2", 280, 200, 1.2)}
        {renderSakuraFlower("tr1", 850, 150, 1.8)}
        {renderSakuraFlower("tr2", 720, 220, 1.3)}
        {renderSakuraFlower("bl1", 150, 850, 1.8)}
        {renderSakuraFlower("bl2", 250, 750, 1.2)}
        {renderSakuraFlower("br1", 850, 850, 1.9)}
        {renderSakuraFlower("br2", 730, 780, 1.4)}
        {renderSakuraFlower("lm", 100, 500, 1.5)}
        {renderSakuraFlower("rm", 900, 500, 1.5)}

        {/* Continuous slow-drifting falling petals animating inside the full-screen overlay */}
        {driftingPetals.map((petal) => (
          <motion.g
            key={petal.id}
            initial={{ x: petal.startX, y: petal.startY, rotate: 0, opacity: 0 }}
            animate={{
              x: [
                petal.startX,
                petal.startX + 60,
                petal.startX - 60,
                petal.startX + (petal.endX - petal.startX)
              ],
              y: [petal.startY, petal.startY + 300, petal.startY + 600, petal.endY],
              rotate: [0, 120, 240, 360],
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: petal.duration,
              repeat: Infinity,
              ease: "linear",
              delay: petal.delay,
            }}
          >
            {/* Sakura petal vector drawing */}
            <path
              d="M 10,15 C 5,5 15,0 20,10 C 25,20 15,25 10,15 Z"
              fill="currentColor"
              className="opacity-40 transition-colors duration-500"
            />
          </motion.g>
        ))}

        {/* Soft floating drifting background petals (semi-static with atmospheric sway) */}
        <motion.path
          d="M 200,320 C 195,310 205,305 210,315 C 215,325 205,330 200,320 Z"
          className="fill-current opacity-40"
          animate={{
            x: [0, 15, -15, 0],
            y: [0, 20, -10, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 350,150 C 345,140 355,135 360,145 C 365,155 355,160 350,150 Z"
          className="fill-current opacity-30"
          animate={{
            x: [0, -20, 10, 0],
            y: [0, 15, -20, 0],
            rotate: [0, -25, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.path
          d="M 650,120 C 645,110 655,105 660,115 C 665,125 655,130 660,120 Z"
          className="fill-current opacity-35"
          animate={{
            x: [0, 25, -25, 0],
            y: [0, -10, 25, 0],
            rotate: [0, 30, -30, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.path
          d="M 800,280 C 795,270 805,265 810,275 C 815,285 805,290 800,280 Z"
          className="fill-current opacity-45"
          animate={{
            x: [0, -15, 15, 0],
            y: [0, -25, 15, 0],
            rotate: [0, -20, 25, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.path
          d="M 120,680 C 115,670 125,665 130,675 C 135,685 125,690 120,680 Z"
          className="fill-current opacity-35"
          animate={{
            x: [0, 20, -15, 0],
            y: [0, 15, -15, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        <motion.path
          d="M 300,880 C 295,870 305,865 310,875 C 315,885 305,890 300,880 Z"
          className="fill-current opacity-40"
          animate={{
            x: [0, -10, 20, 0],
            y: [0, -20, 10, 0],
            rotate: [0, -15, 15, 0]
          }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </motion.svg>
    </div>
  );
}
