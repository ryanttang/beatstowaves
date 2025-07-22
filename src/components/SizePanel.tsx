import React from 'react';

interface SizePanelProps {
  size: number;
  setSize: (v: number) => void;
  sizeX: number;
  setSizeX: (v: number) => void;
  sizeY: number;
  setSizeY: (v: number) => void;
  sizeZ: number;
  setSizeZ: (v: number) => void;
  sizeAudioReactive: boolean;
  setSizeAudioReactive: (v: boolean) => void;
  themeStyles: any;
  onClose: () => void;
}

const SizePanel: React.FC<SizePanelProps> = ({ size, setSize, sizeX, setSizeX, sizeY, setSizeY, sizeZ, setSizeZ, sizeAudioReactive, setSizeAudioReactive, themeStyles }) => (
  <div style={{ color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
    <label className="block mb-2 text-white">Master Size</label>
    <input type="range" min={0.2} max={3} step={0.01} value={Number(size)} onChange={e => setSize(Number(e.target.value))} />
    <span className="ml-2 text-white">{size.toFixed(2)}</span>
    <div className="mt-4">
      <label className="block text-white mb-1">X/Y/Z Scaling</label>
      <input type="range" min={0.2} max={3} step={0.01} value={Number(sizeX)} onChange={e => setSizeX(Number(e.target.value))} />
      <span className="ml-2 text-white">X: {sizeX.toFixed(2)}</span>
      <input type="range" min={0.2} max={3} step={0.01} value={Number(sizeY)} onChange={e => setSizeY(Number(e.target.value))} className="ml-2" />
      <span className="ml-2 text-white">Y: {sizeY.toFixed(2)}</span>
      <input type="range" min={0.2} max={3} step={0.01} value={Number(sizeZ)} onChange={e => setSizeZ(Number(e.target.value))} className="ml-2" />
      <span className="ml-2 text-white">Z: {sizeZ.toFixed(2)}</span>
    </div>
    <div className="mt-4 flex items-center">
      <input type="checkbox" checked={sizeAudioReactive} onChange={e => setSizeAudioReactive(e.target.checked)} id="size-audio-reactive" />
      <label htmlFor="size-audio-reactive" className="ml-2 text-white">Audio-Reactive Size</label>
    </div>
  </div>
);

export default SizePanel; 