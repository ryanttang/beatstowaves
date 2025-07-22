import React from 'react';

interface ColorPanelProps {
  color: string;
  setColor: (c: string) => void;
  colorGradient: [string, string];
  setColorGradient: (g: [string, string]) => void;
  colorPalette: string;
  setColorPalette: (p: string) => void;
  colorAnimated: boolean;
  setColorAnimated: (v: boolean) => void;
  themeStyles: any;
  onClose: () => void;
}

const ColorPanel: React.FC<ColorPanelProps> = ({ color, setColor, colorGradient, setColorGradient, colorPalette, setColorPalette, colorAnimated, setColorAnimated, themeStyles, onClose }) => (
  <div style={{ color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
    <label className="block mb-2 text-white">Pick Color</label>
    <input type="color" value={color} onChange={e => setColor(e.target.value)} />
    <div className="mt-4">
      <label className="block text-white mb-1">Gradient</label>
      <input type="color" value={colorGradient[0]} onChange={e => setColorGradient([e.target.value, colorGradient[1]])} />
      <input type="color" value={colorGradient[1]} onChange={e => setColorGradient([colorGradient[0], e.target.value])} className="ml-2" />
    </div>
    <div className="mt-4">
      <label className="block text-white mb-1">Palette</label>
      <select value={colorPalette} onChange={e => setColorPalette(e.target.value)} className="bg-gray-800 text-white rounded p-2">
        <option value="default">Default</option>
        <option value="warm">Warm</option>
        <option value="cool">Cool</option>
        <option value="rainbow">Rainbow</option>
      </select>
    </div>
    <div className="mt-4 flex items-center">
      <input type="checkbox" checked={colorAnimated} onChange={e => setColorAnimated(e.target.checked)} id="color-animated" />
      <label htmlFor="color-animated" className="ml-2 text-white">Animated Color</label>
    </div>
    <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={onClose}>Close</button>
  </div>
);

export default ColorPanel; 