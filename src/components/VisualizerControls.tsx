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

export const RandomizeSeedButton: React.FC<{ onRandomize?: () => void }> = ({ onRandomize }) => {
  return (
    <button
      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 w-full md:w-auto"
      onClick={onRandomize}
      style={{ color: '#fff' }}
    >
      Randomize Seed
    </button>
  );
};

const VisualizerControls: React.FC = () => {
  const visualMode = useAppStore(s => s.visualMode);
  const setVisualMode = useAppStore(s => s.setVisualMode);
  const intensity = useAppStore(s => s.intensity);
  const setIntensity = useAppStore(s => s.setIntensity);

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="block text-sm mb-1">Visual Mode</label>
        <select
          className="w-full bg-gray-800 border border-gray-600 rounded p-2"
          value={visualMode}
          onChange={e => setVisualMode(e.target.value as VisualMode)}
          style={{ color: '#fff' }}
        >
          {modes.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Intensity</label>
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.01}
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-400">{intensity.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default VisualizerControls; 