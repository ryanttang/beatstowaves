import React from 'react';

interface CountPanelProps {
  count: number;
  setCount: (v: number) => void;
  countAuto: boolean;
  setCountAuto: (v: boolean) => void;
  themeStyles: any;
  onClose: () => void;
}

const CountPanel: React.FC<CountPanelProps> = ({ count, setCount, countAuto, setCountAuto, themeStyles }) => (
  <div style={{ color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
    <label className="block mb-2 text-white">Count</label>
    <input type="range" min={4} max={128} step={1} value={Number(count)} onChange={e => setCount(Number(e.target.value))} />
    <span className="ml-2 text-white">{count}</span>
    <div className="mt-4 flex items-center">
      <input type="checkbox" checked={countAuto} onChange={e => setCountAuto(e.target.checked)} id="count-auto" />
      <label htmlFor="count-auto" className="ml-2 text-white">Auto Count (audio complexity/BPM)</label>
      <button className="ml-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setCount(Math.floor(Math.random() * 125) + 4)}>Randomize</button>
    </div>
  </div>
);

export default CountPanel; 