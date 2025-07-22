import React from 'react';

interface InfoMenuProps {
  modal: null | 'about' | 'howto' | 'faq';
  setModal: (modal: null | 'about' | 'howto' | 'faq') => void;
  showInfoRow: boolean;
  setShowInfoRow: React.Dispatch<React.SetStateAction<boolean>>;
}

const InfoMenu: React.FC<InfoMenuProps> = ({ modal, setModal, showInfoRow, setShowInfoRow }) => (
  <>
    {/* Menu icon for toggling info row */}
    <button
      onClick={() => setShowInfoRow(v => !v)}
      style={{
        position: 'fixed',
        top: '18px',
        left: '18px',
        zIndex: 1010,
        background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)',
        border: '2.5px solid #38bdf8',
        borderRadius: '10px',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '26px',
        color: '#38bdf8',
        fontWeight: '900',
        cursor: 'pointer',
        boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822',
        textShadow: '0 1px 0 #23253a, 0 0px 8px #38bdf888',
        outline: 'none',
        transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
      }}
      aria-label="Toggle info menu"
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
      <span style={{ display: 'block', lineHeight: 1 }}>&#9776;</span>
    </button>
    {/* Info buttons row, toggled by menu icon */}
    {showInfoRow && (
      <div style={{ width: '100%', display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', padding: '0px 0 0 0', position: 'relative', zIndex: 10, marginBottom: 24 }}>
        <button onClick={() => setModal('about')} style={{
          background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)',
          color: '#38bdf8',
          border: '2.5px solid #38bdf8',
          borderRadius: '8px',
          padding: '7px 18px',
          fontSize: '13px',
          fontWeight: '700',
          fontFamily: '"Press Start 2P", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"',
          cursor: 'pointer',
          boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822',
          textShadow: '0 1px 0 #23253a, 0 0px 8px #38bdf888',
          letterSpacing: '1.2px',
          transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
        }}>What is VizWiz?</button>
        <button onClick={() => setModal('howto')} style={{
          background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)',
          color: '#e07a3f',
          border: '2.5px solid #e07a3f',
          borderRadius: '8px',
          padding: '7px 18px',
          fontSize: '13px',
          fontWeight: '700',
          fontFamily: '"Press Start 2P", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"',
          cursor: 'pointer',
          boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #e07a3f, inset 0 2px 8px #e07a3f22',
          textShadow: '0 1px 0 #23253a, 0 0px 8px #e07a3f88',
          letterSpacing: '1.2px',
          transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
        }}>How to Use</button>
        <button onClick={() => setModal('faq')} style={{
          background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)',
          color: '#a46cff',
          border: '2.5px solid #a46cff',
          borderRadius: '8px',
          padding: '7px 18px',
          fontSize: '13px',
          fontWeight: '700',
          fontFamily: '"Press Start 2P", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"',
          cursor: 'pointer',
          boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #a46cff, inset 0 2px 8px #a46cff22',
          textShadow: '0 1px 0 #23253a, 0 0px 8px #a46cff88',
          letterSpacing: '1.2px',
          transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
        }}>FAQ</button>
      </div>
    )}
    {/* Modal overlay */}
    {modal && (
      <div style={{
        position: 'fixed',
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh',
        background: 'rgba(24,26,36,0.88)',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #181a24 80%, #23253a 100%)',
          border: '2.5px solid #38bdf8',
          borderRadius: '18px',
          boxShadow: '0 8px 32px #23253a99, 0 2px 8px #fff2',
          color: '#fff',
          minWidth: '340px',
          maxWidth: '420px',
          padding: '32px 32px 24px 32px',
          fontFamily: '"Press Start 2P", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"',
          position: 'relative',
          textAlign: 'left',
        }}>
          <button onClick={() => setModal(null)} style={{
            position: 'absolute',
            top: '12px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            fontSize: '28px',
            fontWeight: '900',
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
            textShadow: '0 2px 8px #23253a',
          }} aria-label="Close modal">×</button>
          {modal === 'about' && (
            <>
              <h2 style={{ color: '#38bdf8', fontSize: 20, marginBottom: 18, letterSpacing: 2, fontFamily: '"Press Start 2P", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"' }}>What is VizWiz?</h2>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: '#e0e6f0', fontFamily: '"Source Sans Pro", "Inter", "Segoe UI", "Arial", "sans-serif"' }}>
                VizWiz is a next-generation audio visualizer and creative tool. It transforms your music into stunning, interactive 3D graphics using advanced visual modes, customizable effects, and real-time audio analysis. <br /><br />
                Designed for musicians, streamers, and creators, VizWiz lets you tweak every aspect of the visuals—from color and shape to lighting and animation—so you can create unique, mesmerizing experiences for your audience.
              </div>
              <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, opacity: 0.7, fontFamily: '"Source Sans Pro", "Inter", "Segoe UI", "Arial", "sans-serif"' }}>
                Created by <a href="https://ryantang.site" target="_blank" rel="noopener noreferrer" style={{ color: '#4a90e2', textDecoration: 'underline' }}>Ryan Tang</a>
              </div>
            </>
          )}
          {modal === 'howto' && (
            <>
              <h2 style={{ color: '#e07a3f', fontSize: 20, marginBottom: 18, letterSpacing: 2, fontFamily: '"Press Start 2P", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"' }}>How to Use</h2>
              <ol style={{ fontSize: 15, color: '#e0e6f0', marginBottom: 18, paddingLeft: 18, lineHeight: 1.7, fontFamily: '"Source Sans Pro", "Inter", "Segoe UI", "Arial", "sans-serif"' }}>
                <li><b>1.</b> <b>Load a Track:</b> Click the "Load Track" panel or drag an audio file to start.</li>
                <li><b>2.</b> <b>Pick a Visual Mode:</b> Use the dropdown to explore different 3D visualizations.</li>
                <li><b>3.</b> <b>Customize:</b> Adjust knobs and buttons to change color, shape, lighting, and effects in real time.</li>
              </ol>
              <div style={{ fontSize: 14, color: '#38bdf8', marginBottom: 8, fontWeight: 700, letterSpacing: 1, fontFamily: '"Source Sans Pro", "Inter", "Segoe UI", "Arial", "sans-serif"' }}>Knob Quick Reference:</div>
              <ul style={{ fontSize: 13, color: '#e0e6f0', lineHeight: 1.6, paddingLeft: 18, fontFamily: '"Source Sans Pro", "Inter", "Segoe UI", "Arial", "sans-serif"' }}>
                <li><b>NOISE</b>: Adds random jitter and organic movement.</li>
                <li><b>WOBBLE</b>: Adds smooth, wavy oscillation to the visuals.</li>
                <li><b>DISTORT</b>: Warps and exaggerates the shapes for a more intense look.</li>
                <li><b>DIGITAL</b>: Makes the animation more blocky and quantized, for a retro digital feel.</li>
                <li><b>SPACE</b>: Increases the spread and spacing of the visual elements.</li>
                <li><b>MAGNETIC</b>: Pulls elements toward the center, creating a magnetic effect.</li>
              </ul>
            </>
          )}
          {modal === 'faq' && (
            <>
              <h2 style={{ color: '#a46cff', fontSize: 20, marginBottom: 18, letterSpacing: 2, fontFamily: '"Press Start 2P", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"' }}>FAQ</h2>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: '#e0e6f0', fontFamily: '"Source Sans Pro", "Inter", "Segoe UI", "Arial", "sans-serif"' }}>
                <b>Q: How do I export a video?</b><br />A: Use the Export button below the visualizer.<br /><br />
                <b>Q: What file types are supported?</b><br />A: Most common audio formats (mp3, wav, ogg, etc).<br /><br />
                <b>Q: Can I use this for streaming?</b><br />A: Yes! VizWiz is designed for creators and streamers.<br /><br />
                <span style={{ opacity: 0.7, fontSize: 13 }}>(More questions coming soon...)</span>
              </div>
            </>
          )}
        </div>
      </div>
    )}
  </>
);

export default InfoMenu; 