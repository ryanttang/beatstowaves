import React from 'react';

interface BackgroundPanelProps {
  background: string;
  setBackground: (v: string) => void;
  backgroundImage: string | null;
  setBackgroundImage: (v: string | null) => void;
  backgroundAnimation: string;
  setBackgroundAnimation: (v: string) => void;
  themeStyles: any;
  onClose: () => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ background, setBackground, backgroundImage, setBackgroundImage, backgroundAnimation, setBackgroundAnimation, themeStyles, onClose }) => {
  const colorValue = typeof background === 'string' ? background : '#23253a';
  return (
    <div style={{ color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
      <label className="block mb-2 text-white">Background Color</label>
      <input type="color" value={colorValue} onChange={e => setBackground(e.target.value)} />
      <div className="mt-4">
        <label className="block text-white mb-1">Background Image</label>
        <input type="file" accept="image/*" onChange={e => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = ev => setBackgroundImage(ev.target?.result ? String(ev.target.result) : '');
            reader.readAsDataURL(file);
          }
        }} />
        {backgroundImage && typeof backgroundImage === 'string' && (
          <img src={backgroundImage} alt="bg" className="mt-2 max-w-xs max-h-32 rounded" />
        )}
      </div>
      <div className="mt-4">
        <label className="block text-white mb-1">Background Animation</label>
        <select value={typeof backgroundAnimation === 'string' ? backgroundAnimation : 'none'} onChange={e => setBackgroundAnimation(e.target.value)} className="bg-gray-800 text-white rounded p-2">
          <option value="none">None</option>
          <option value="gradient">Animated Gradient</option>
          <option value="video">Video Background</option>
        </select>
      </div>
      <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={onClose}>Close</button>
    </div>
  );
};

export default BackgroundPanel; 