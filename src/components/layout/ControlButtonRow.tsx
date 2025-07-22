import React, { RefObject } from 'react';

interface ControlButtonRowProps {
  visualizerRef: RefObject<HTMLDivElement>;
  isFullscreen: boolean;
  handleFullscreen: () => void;
  handleExportClick: () => void;
  randomizeAll: () => void;
}

const ControlButtonRow: React.FC<ControlButtonRowProps> = ({
  visualizerRef,
  isFullscreen,
  handleFullscreen,
  handleExportClick,
  randomizeAll
}) => (
  <div className="w-full flex justify-center items-center mb-4">
    <div className="grid grid-cols-2 gap-4" style={{ maxWidth: '180px' }}>
      {/* Screenshot Button */}
      <button
        onClick={() => {
          const canvas = visualizerRef.current?.querySelector('canvas');
          if (canvas) {
            const link = document.createElement('a');
            link.download = 'visualizer.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          }
        }}
        style={{
          width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
        }}
        aria-label="Screenshot (PNG)"
        title="Screenshot (PNG)"
        onMouseOver={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #38bdf8 60%, #23253a 100%)';
          (e.currentTarget as HTMLButtonElement).style.color = '#23253a';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 0 #10121a, 0 4px 16px #38bdf866, 0 2px 0 #fff, 0 1px 0 #38bdf8, inset 0 2px 12px #38bdf822';
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #23253a 70%, #181a24 100%)';
          (e.currentTarget as HTMLButtonElement).style.color = '#38bdf8';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822';
        }}
      >
        <span style={{ display: 'block', lineHeight: 1 }}>📸</span>
      </button>
      {/* Export Video Button (placeholder) */}
      <button
        onClick={handleExportClick}
        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s', }}
        aria-label="Export Video (WebM)"
        title="Export Video (WebM)"
      >
        <span style={{ display: 'block', lineHeight: 1 }}>🎥</span>
      </button>
      {/* Reset Button (placeholder) */}
      <button
        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s', }}
        aria-label="Reset Visualizer"
        title="Reset Visualizer"
      >
        <span style={{ display: 'block', lineHeight: 1 }}>♻️</span>
      </button>
      {/* Randomize Button (placeholder) */}
      <button
        onClick={randomizeAll}
        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s', }}
        aria-label="Randomize Visualizer"
        title="Randomize Visualizer"
      >
        <span style={{ display: 'block', lineHeight: 1 }}>🎲</span>
      </button>
      {/* Download Preset Button (placeholder) */}
      <button
        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s', }}
        aria-label="Download Preset"
        title="Download Preset"
      >
        <span style={{ display: 'block', lineHeight: 1 }}>💾</span>
      </button>
      {/* Upload Preset Button (placeholder) */}
      <button
        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s', }}
        aria-label="Upload Preset"
        title="Upload Preset"
      >
        <span style={{ display: 'block', lineHeight: 1 }}>📂</span>
      </button>
      {/* Fullscreen Button - moved here as last button */}
      <button
        onClick={handleFullscreen}
        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s', }}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        onMouseOver={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #38bdf8 60%, #23253a 100%)';
          (e.currentTarget as HTMLButtonElement).style.color = '#23253a';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 0 #10121a, 0 4px 16px #38bdf866, 0 2px 0 #fff, 0 1px 0 #38bdf8, inset 0 2px 12px #38bdf822';
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #23253a 70%, #181a24 100%)';
          (e.currentTarget as HTMLButtonElement).style.color = '#38bdf8';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822';
        }}
      >
        {isFullscreen ? (
          <span style={{ display: 'block', lineHeight: 1 }}>&#10006;</span>
        ) : (
          <span style={{ display: 'block', lineHeight: 1 }}>&#11036;</span>
        )}
      </button>
    </div>
  </div>
);

export default ControlButtonRow; 