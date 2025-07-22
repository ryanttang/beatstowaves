import React from 'react';
import { useAppStore, VisualMode } from '../store';

const modes: { label: string; value: VisualMode }[] = [
  { label: 'Classic', value: 'classic' },
  { label: 'Bars', value: 'bars' },
  { label: 'Waves', value: 'waves' },
  { label: 'Particles', value: 'particles' },
];

function randomSeed() {
  return Math.random().toString(36).slice(2, 18);
}

export const RandomizeSeedButton: React.FC = () => {
  const setSeed = useAppStore(s => s.setSeed);
  return (
    <button
      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 w-full md:w-auto"
      onClick={() => setSeed(randomSeed())}
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