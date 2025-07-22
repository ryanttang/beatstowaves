import React from 'react';
import { useAppStore, VisualMode } from '../store';

const modes: { label: string; value: VisualMode }[] = [
  { label: 'Classic', value: 'classic' },
  { label: 'Bars', value: 'bars' },
  { label: 'Waves', value: 'waves' },
  { label: 'Particles', value: 'particles' },
  { label: 'Spiral', value: 'spiral' },
  { label: 'Radial', value: 'radial' },
  { label: 'Sphere/Globe', value: 'sphere' },
  { label: 'Tunnel/Wormhole', value: 'tunnel' },
  { label: 'Grid/Matrix', value: 'grid' },
  { label: 'Waveform Ribbon', value: 'ribbon' },
  { label: 'Galaxy/Starfield', value: 'galaxy' },
  { label: 'Blob', value: 'blob' },
  { label: 'DNA/Double Helix', value: 'dna' },
  { label: 'Liquid Drops', value: 'liquid' },
  { label: 'Orbitals/Atomic', value: 'orbitals' },
  { label: 'Fractal Tree', value: 'fractal' },
  { label: 'Polygon Morph', value: 'polygon' },
  { label: 'Wave Grid', value: 'wavegrid' },
  { label: 'Text/Logo Deform', value: 'textdeform' },
  { label: 'Aurora', value: 'aurora' },
];

function randomSeed() {
  return Math.random().toString(36).slice(2, 18);
}

export const RandomizeSeedButton: React.FC<{ onRandomize?: () => void; theme?: string }> = ({ onRandomize, theme }) => {
  // Invert for Default, Serum, Valhalla
  const invert = theme === 'Default' || theme === 'Serum' || theme === 'Valhalla';
  const bg = invert ? '#fff' : '#23253a';
  const fg = invert ? '#23253a' : '#fff';
  return (
    <button
      className="px-4 py-2 rounded-xl w-full md:w-auto font-semibold focus:outline-none transition-shadow"
      onClick={onRandomize}
      style={{
        background: bg,
        color: fg,
        boxShadow: `
          4px 4px 12px 0 rgba(30, 41, 59, 0.18),
          -4px -4px 12px 0 rgba(255,255,255,0.08),
          0 1.5px 8px 0 rgba(0,0,0,0.10),
          inset 0 2px 8px 0 rgba(255,255,255,0.02)
        `,
        transition: 'box-shadow 0.2s',
      }}
    >
      Randomize Seed
    </button>
  );
};

interface VisualizerControlsProps {
  background?: string;
  color?: string;
  theme?: string;
}

const VisualizerControls: React.FC<VisualizerControlsProps> = ({ background = '#f3f4f6', color = '#23253a', theme }) => {
  const visualMode = useAppStore(s => s.visualMode);
  const setVisualMode = useAppStore(s => s.setVisualMode);
  const intensity = useAppStore(s => s.intensity);
  const setIntensity = useAppStore(s => s.setIntensity);

  return (
    <div
      className="space-y-4 mt-4 p-4 rounded-2xl"
      style={{
        background,
        color,
        boxShadow: `
           4px 4px 12px 0 rgba(180, 190, 200, 0.10),
           -4px -4px 12px 0 rgba(255,255,255,0.12),
           0 1.5px 4px 0 rgba(80,80,120,0.04),
           inset 0 2px 4px 0 rgba(0,0,0,0.01)
         `,
        transition: 'box-shadow 0.2s',
        outline: 'none',
        border: 'none',
      }}
    >
      <div>
        <label className="block text-sm mb-1" style={{ color }}>Visual Mode</label>
        <select
          className="w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={theme === 'Default' ? { background: '#23253a', color: '#fff' } : { background: '#e5e7eb', color }}
          value={visualMode}
          onChange={e => setVisualMode(e.target.value as VisualMode)}
        >
          {modes.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1" style={{ color }}>Intensity</label>
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.01}
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          className="w-full accent-blue-400"
        />
        <div className="text-xs" style={{ color: '#888' }}>{intensity.toFixed(2)}</div>
      </div>
      <div className="flex justify-center mt-4">
        <div className="w-full md:w-auto">
          <RandomizeSeedButton theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default VisualizerControls; 