import * as React from 'react';

interface KnobSVGProps {
  size?: number;
  className?: string;
  needleAngle?: number; // degrees
}

const KnobSVG: React.FC<KnobSVGProps> = ({ size = 64, className = '', needleAngle = 0 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 484.8 484.8"
      className={className}
      style={{ display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="knob-linear-gradient" x1="165.22" y1="319.47" x2="361.07" y2="123.63" gradientTransform="translate(439.8 -73.62) rotate(80.81)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e6e6e6" />
          <stop offset=".04" stopColor="#eaeaea" />
          <stop offset=".19" stopColor="#f6f6f6" />
          <stop offset=".41" stopColor="#fdfdfd" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <filter id="knob-drop-shadow-1" x="0" y="0" width="484.8" height="484.8" filterUnits="userSpaceOnUse">
          <feOffset dx="-20.76" dy="20.76" />
          <feGaussianBlur result="blur" stdDeviation="34.6" />
          <feFlood floodColor="#231f20" floodOpacity=".3" />
          <feComposite in2="blur" operator="in" />
          <feComposite in="SourceGraphic" />
        </filter>
        <linearGradient id="knob-linear-gradient-2" x1="353.06" y1="131.64" x2="173.24" y2="311.46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2f2f2" />
          <stop offset=".08" stopColor="#f5f5f5" />
          <stop offset=".35" stopColor="#fcfcfc" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        {/* Glass highlight */}
        <radialGradient id="knob-glass-highlight" cx="30%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="80%" stopColor="#fff" stopOpacity="0.0" />
        </radialGradient>
        {/* Inner shadow */}
        <filter id="knob-inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="8" result="offset-blur" />
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
          <feFlood floodColor="#000" floodOpacity="0.15" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="volume">
          <g>
            <circle cx="242.4" cy="242.4" r="242.4" fill="url(#knob-linear-gradient)" />
            <circle cx="242.4" cy="242.4" r="220" fill="url(#knob-linear-gradient-2)" filter="url(#knob-inner-shadow)" />
            {/* Glass highlight */}
            <ellipse cx="180" cy="120" rx="90" ry="45" fill="url(#knob-glass-highlight)" />
          </g>
          {/* Indicator needle group, rotates with needleAngle */}
          <g style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: '242.4px 242.4px', transition: 'transform 0.18s cubic-bezier(.4,1.6,.6,1)' }}>
            <rect x="238.4" y="20" width="8" height="120" rx="4" fill="#231f20" />
            <rect x="238.4" y="20" width="8" height="70" rx="4" fill="#39bb9d" />
          </g>
        </g>
      </g>
    </svg>
  );
};

// New ButtonSVG component for effect buttons
interface ButtonSVGProps {
  src: string; // Path to SVG file
  label: string;
  width?: string;
  height?: string;
  onClick?: () => void;
}

const ButtonSVG: React.FC<ButtonSVGProps> = ({ src, label, width = '180', height = '54', onClick }) => (
  <div
    style={{ position: 'relative', width: `${width}px`, height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : undefined }}
    onClick={onClick}
  >
    <img src={src} width={width} height={height} style={{ display: 'block' }} alt={label + ' button'} />
    <span style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 13,
      color: '#fff',
      letterSpacing: 1.5,
      textShadow: '0 2px 8px #0008',
      pointerEvents: 'none',
      userSelect: 'none',
      textTransform: 'uppercase',
    }}>{label}</span>
  </div>
);

export { ButtonSVG };
export default KnobSVG; 