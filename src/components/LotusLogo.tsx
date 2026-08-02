import React, { useId } from 'react';
import { motion } from 'motion/react';

export interface LotusLogoProps {
  size?: number;
  active?: boolean;
  animateBreathing?: boolean;
  showGlow?: boolean;
  className?: string;
  variant?: 'nav' | 'hero' | 'badge';
  ariaLabel?: string;
  altText?: string;
}

export const LotusLogo: React.FC<LotusLogoProps> = ({
  size = 32,
  active = true,
  animateBreathing = true,
  showGlow = true,
  className = '',
  variant = 'hero',
  ariaLabel = 'Sadhana Sacred Lotus Emblem - Jain Spiritual Lotus Logo',
  altText = 'Sadhana Sacred Lotus Logo'
}) => {
  const rawId = useId();
  const filterId = `lotus-glow-${rawId.replace(/:/g, '')}`;
  const centerGradId = `lotus-center-grad-${rawId.replace(/:/g, '')}`;
  const innerGradId = `lotus-inner-grad-${rawId.replace(/:/g, '')}`;
  const outerGradId = `lotus-outer-grad-${rawId.replace(/:/g, '')}`;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      {...(animateBreathing ? {
        animate: {
          scale: [1, 1.06, 1],
          opacity: [0.92, 1, 0.92],
        },
        transition: {
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      } : {})}
      whileHover={{ scale: 1.12, rotate: [0, -2, 2, 0] }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background soft glow aura if enabled */}
      {showGlow && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/25 via-amber-500/25 to-rose-400/20 blur-md pointer-events-none transition-opacity duration-300 dark:from-amber-400/30 dark:via-rose-500/30 dark:to-orange-400/25" 
          aria-hidden="true"
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label={ariaLabel}
        className={`relative z-10 transition-colors duration-300 drop-shadow-sm ${
          variant === 'nav'
            ? active 
              ? 'text-rose-800 dark:text-amber-300' 
              : 'text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-amber-200'
            : 'text-rose-800 dark:text-amber-300'
        }`}
      >
        <title>{altText}</title>

        <defs>
          {/* Subtle Glow Filter */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Central Petal Gradient */}
          <linearGradient id={centerGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={active ? "0.9" : "0.5"} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={active ? "0.4" : "0.15"} />
          </linearGradient>

          {/* Inner Petal Gradient */}
          <linearGradient id={innerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={active ? "0.75" : "0.4"} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={active ? "0.2" : "0.08"} />
          </linearGradient>

          {/* Outer Petal Gradient */}
          <linearGradient id={outerGradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={active ? "0.6" : "0.3"} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={active ? "0.1" : "0.05"} />
          </linearGradient>
        </defs>

        <g filter={showGlow ? `url(#${filterId})` : undefined}>
          {/* Central Blooming Lotus Petal */}
          <path
            d="M12 2.5C9.8 7 9.2 12.8 12 20.5C14.8 12.8 14.2 7 12 2.5Z"
            fill={`url(#${centerGradId})`}
            stroke="currentColor"
            strokeWidth={active ? "1.4" : "1.2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left Inner Blooming Petal */}
          <path
            d="M12 20.5C9.5 16.5 6.2 12 6.8 5.8C8.8 10.2 11 15.2 12 20.5Z"
            fill={`url(#${innerGradId})`}
            stroke="currentColor"
            strokeWidth={active ? "1.3" : "1.1"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Inner Blooming Petal */}
          <path
            d="M12 20.5C14.5 16.5 17.8 12 17.2 5.8C15.2 10.2 13 15.2 12 20.5Z"
            fill={`url(#${innerGradId})`}
            stroke="currentColor"
            strokeWidth={active ? "1.3" : "1.1"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left Outer Broad Petal */}
          <path
            d="M12 20.5C7.5 19 2.2 15.5 2.8 10.5C5.8 12.5 8.8 16 12 20.5Z"
            fill={`url(#${outerGradId})`}
            stroke="currentColor"
            strokeWidth={active ? "1.2" : "1"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Outer Broad Petal */}
          <path
            d="M12 20.5C16.5 19 21.8 15.5 21.2 10.5C18.2 12.5 15.2 16 12 20.5Z"
            fill={`url(#${outerGradId})`}
            stroke="currentColor"
            strokeWidth={active ? "1.2" : "1"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Spiritual Bindu / Central Light Point */}
          <circle 
            cx="12" 
            cy="11" 
            r="0.9" 
            fill="currentColor" 
            className="animate-pulse opacity-90"
          />

          {/* Sacred Water Cradle / Base Stem Lines */}
          <path
            d="M2.5 18C5.5 21 10.2 21.5 12 19.2C13.8 21.5 18.5 21 21.5 18"
            stroke="currentColor"
            strokeWidth={active ? "1.3" : "1.1"}
            strokeLinecap="round"
          />
          
          <path
            d="M12 19.2V22"
            stroke="currentColor"
            strokeWidth={active ? "1.4" : "1.2"}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </motion.div>
  );
};

export default LotusLogo;
