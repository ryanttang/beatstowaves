import React from 'react';

interface ShapePanelProps {
  shape: string;
  setShape: (v: string) => void;
  shapeMorph: number;
  setShapeMorph: (v: number) => void;
  audioReactiveMorph: boolean;
  setAudioReactiveMorph: (v: boolean) => void;
  audioReactiveColor: boolean;
  setAudioReactiveColor: (v: boolean) => void;
  audioReactiveSize: boolean;
  setAudioReactiveSize: (v: boolean) => void;
  audioBand: 'bass' | 'mid' | 'treble';
  setAudioBand: (v: 'bass' | 'mid' | 'treble') => void;
  themeStyles: any;
  onClose: () => void;
}

const ShapePanel: React.FC<ShapePanelProps> = ({ shape, setShape, shapeMorph, setShapeMorph, audioReactiveMorph, setAudioReactiveMorph, audioReactiveColor, setAudioReactiveColor, audioReactiveSize, setAudioReactiveSize, audioBand, setAudioBand, themeStyles }) => (
  <div style={{ color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
    <label className="block mb-2 text-white">Shape</label>
    <select value={String(shape)} onChange={e => setShape(e.target.value)} className="bg-gray-800 text-white rounded p-2">
      <option value="box">Box</option>
      <option value="cylinder">Cylinder</option>
      <option value="sphere">Sphere</option>
      <option value="torus">Torus</option>
      <option value="cone">Cone</option>
      <option value="morph">Morph (multi-shape)</option>
    </select>
    <div className="mt-4">
      <label className="block text-white mb-1">Morph</label>
      <input type="range" min={0} max={1} step={0.01} value={Number(shapeMorph)} onChange={e => setShapeMorph(Number(e.target.value))} />
      <span className="ml-2 text-white">{shapeMorph.toFixed(2)}</span>
    </div>
    <div className="mt-4 flex items-center">
      <input type="checkbox" checked={audioReactiveMorph} onChange={e => setAudioReactiveMorph(e.target.checked)} id="audio-morph" />
      <label htmlFor="audio-morph" className="ml-2 text-white">Audio-Reactive Morphing</label>
    </div>
    <div className="mt-2 flex items-center">
      <input type="checkbox" checked={audioReactiveColor} onChange={e => setAudioReactiveColor(e.target.checked)} id="audio-color" />
      <label htmlFor="audio-color" className="ml-2 text-white">Audio-Reactive Color</label>
    </div>
    <div className="mt-2 flex items-center">
      <input type="checkbox" checked={audioReactiveSize} onChange={e => setAudioReactiveSize(e.target.checked)} id="audio-size" />
      <label htmlFor="audio-size" className="ml-2 text-white">Audio-Reactive Size</label>
    </div>
    <div className="mt-4">
      <label className="block text-white mb-1">Audio Band</label>
      <select value={String(audioBand)} onChange={e => setAudioBand(e.target.value as 'bass' | 'mid' | 'treble')} className="bg-gray-800 text-white rounded p-2">
        <option value="bass">Bass</option>
        <option value="mid">Mid</option>
        <option value="treble">Treble</option>
      </select>
    </div>
  </div>
);

export default ShapePanel; 