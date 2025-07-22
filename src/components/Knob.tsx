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

  return (
    <div className="flex flex-col items-center select-none justify-center" style={{ width: size }}>
      <div
        ref={knobRef}
        className="relative flex items-center justify-center"
        style={{ width: size, height: size, cursor: 'pointer' }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <KnobSVG size={size} needleAngle={angle} />
        {/* Knob shadow ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: dragging ? `0 0 0 4px #39bb9d44` : '0 2px 8px #0004' }}
        />
      </div>
      {label && (
        <div className="mt-1 text-xs font-bold tracking-widest text-rc20-navy text-center" style={{ textShadow: '0 1px 0 #fff8' }}>
          {label}
        </div>
      )}
    </div>
  );
};

export default Knob; 