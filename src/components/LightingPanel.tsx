import React from 'react';

interface LightingPanelProps {
  lights: { color: string; intensity: number; position: [number, number, number] }[];
  setLights: (v: { color: string; intensity: number; position: [number, number, number] }[]) => void;
  shadows: boolean;
  setShadows: (v: boolean) => void;
  themeStyles: any;
  onClose: () => void;
}

const LightingPanel: React.FC<LightingPanelProps> = ({ lights, setLights, shadows, setShadows, themeStyles, onClose }) => (
  <div style={{ color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
    <label className="block mb-2 text-white">Lights</label>
    {lights.map((light, idx) => (
      <div key={idx} className="mb-2 flex items-center">
        <input type="color" value={light.color} onChange={e => {
          const newLights = [...lights];
          newLights[idx].color = e.target.value;
          setLights(newLights);
        }} />
        <input type="range" min={0.1} max={2} step={0.01} value={light.intensity} onChange={e => {
          const newLights = [...lights];
          newLights[idx].intensity = Number(e.target.value);
          setLights(newLights);
        }} className="ml-2" />
        <span className="ml-2 text-white">{light.intensity.toFixed(2)}</span>
        <button className="ml-2 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setLights(lights.filter((_, i) => i !== idx))}>Remove</button>
      </div>
    ))}
    <button className="px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setLights([...lights, { color: '#ffffff', intensity: 1, position: [0, 20, 20] }])}>Add Light</button>
    <div className="mt-4 flex items-center">
      <input type="checkbox" checked={shadows} onChange={e => setShadows(e.target.checked)} id="shadows" />
      <label htmlFor="shadows" className="ml-2 text-white">Enable Shadows</label>
    </div>
    <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={onClose}>Close</button>
  </div>
);

export default LightingPanel; 