import React, { useRef, useState } from 'react';
import KnobSVG from './KnobSVG';

interface KnobProps {
  value: number; // 0 to 1
  onChange: (v: number) => void;
  label?: string;
  color?: string; // CSS color (not used in SVG, but kept for API)
  size?: number; // px (scales SVG)
}

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

const Knob: React.FC<KnobProps> = ({ value, onChange, label, color, size = 64 }) => {
  const [dragging, setDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(false);

  // Angle for indicator: RC-20 style, e.g. -135deg (min) to +135deg (max)
  const minAngle = -135;
  const maxAngle = 135;
  const angle = minAngle + (maxAngle - minAngle) * clamp(value);

  // Mouse/touch drag logic
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    const move = (clientY: number) => {
      if (!knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const delta = centerY - clientY;
      let newValue = clamp(value + delta / 100);
      onChange(newValue);
    };
    const onMove = (ev: MouseEvent | TouchEvent) => {
      if ('touches' in ev) move(ev.touches[0].clientY);
      else move(ev.clientY);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  };

  // Keyboard accessibility: left/right arrows
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      onChange(clamp(value - 0.05));
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      onChange(clamp(value + 0.05));
      e.preventDefault();
    }
  };

  return (
    <div
      className="flex flex-col items-center select-none justify-center"
      style={{ width: size }}
    >
      <div
        ref={knobRef}
        className={`relative flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-rc20-orange ${dragging ? 'ring-4 ring-rc20-orange/40' : ''}`}
        style={{
          width: size,
          height: size,
          cursor: 'pointer',
          boxShadow: dragging || focus ? `0 0 0 6px #39bb9d33, 0 2px 16px #0005` : '0 2px 8px #0004',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          transition: 'box-shadow 0.2s, background 0.2s',
        }}
        tabIndex={0}
        role="slider"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Knob'}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        <KnobSVG size={size} needleAngle={angle} />
        {/* Knob shadow ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: dragging || focus ? `0 0 0 8px #39bb9d44, 0 2px 16px #0005` : '0 2px 8px #0004',
            transition: 'box-shadow 0.2s',
          }}
        />
      </div>
      {label && (
        <div className="text-base tracking-widest mt-0.5 select-none font-semibold" style={{ color: '#23253a', letterSpacing: 2 }}>{label}</div>
      )}
    </div>
  );
};

export default Knob; 