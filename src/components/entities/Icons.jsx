/* Iconos ilustrados (SVG propio, sin emojis). */
const Svg = ({ size = 20, className = '', children, viewBox = '0 0 24 24' }) => (
  <svg viewBox={viewBox} width={size} height={size} className={className} aria-hidden="true">{children}</svg>
);

export const StarIcon = (p) => (
  <Svg {...p}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
      fill="#ffc928" stroke="#e08a00" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9.2 8.6l2.8-4.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".8" />
  </Svg>
);

export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12.5" r="9" fill="#fff8e1" stroke="#f2a31b" strokeWidth="2.4" />
    <path d="M12 7v5.5l3.5 2" stroke="#7a3fd0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="9.5" y="1" width="5" height="2.6" rx="1.2" fill="#f2a31b" />
  </Svg>
);

export const PlayIcon = (p) => (
  <Svg {...p}><path d="M7 4.5v15l13-7.5z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></Svg>
);

export const PauseIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="4" width="5" height="16" rx="2" fill="#fff" />
    <rect x="14" y="4" width="5" height="16" rx="2" fill="#fff" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}><path d="M4.5 12.5l5 5 10-11" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
);

export const CrossIcon = (p) => (
  <Svg {...p}><path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></Svg>
);

export const ArrowIcon = (p) => (
  <Svg {...p}><path d="M4 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
);

export const SnowIcon = (p) => (
  <Svg {...p}>
    <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none">
      <path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17" />
      <path d="M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />
    </g>
  </Svg>
);

export const FlameIcon = (p) => (
  <Svg {...p}>
    <path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-4.5 3-7 1 1 1.5 2 2 3 1-2 1-5 1-8z" fill="#ff7a1a" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M12 21a3 3 0 01-3-3c0-2 2-3 3-5 1 2 3 3 3 5a3 3 0 01-3 3z" fill="#ffd23f" />
  </Svg>
);

export const SpinIcon = (p) => (
  <Svg {...p}>
    <g stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3" />
      <path d="M18 2.5v4.5h-4.5M6 21.5V17h4.5" />
    </g>
  </Svg>
);

export const GearIcon = (p) => (
  <Svg {...p}>
    <path d="M12 2l1.8 2.6 3.1-.6.6 3.1 2.9 1.4-1.2 2.9 1.2 2.9-2.9 1.4-.6 3.1-3.1-.6L12 22l-1.8-2.6-3.1.6-.6-3.1-2.9-1.4 1.2-2.9-1.2-2.9 2.9-1.4.6-3.1 3.1.6z" fill="#8b5cf6" stroke="#fff" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="3.4" fill="#fff" />
  </Svg>
);
