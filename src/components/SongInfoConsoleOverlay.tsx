import React from 'react';

interface SongInfoConsoleOverlayProps {
  songName: string;
  artistName: string;
}

const SongInfoConsoleOverlay: React.FC<SongInfoConsoleOverlayProps> = ({ songName, artistName }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 18,
      right: 24,
      background: 'rgba(30, 41, 59, 0.35)', // glassy navy
      color: '#fff',
      fontFamily: 'Inter, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '0.95rem',
      lineHeight: 1.35,
      padding: '12px 22px',
      zIndex: 20,
      pointerEvents: 'none',
      boxShadow: '0 6px 32px 0 rgba(0,0,0,0.35), 0 1.5px 8px 0 rgba(80,80,120,0.18), inset 0 1.5px 8px 0 rgba(255,255,255,0.10)',
      whiteSpace: 'pre-line',
      letterSpacing: '0.01em',
      minWidth: 140,
      textAlign: 'left',
      userSelect: 'none',
      borderRadius: '18px',
      border: '2px solid rgba(255,255,255,0.35)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      boxSizing: 'border-box',
      transition: 'box-shadow 0.2s',
    }}
  >
    <div>{songName}</div>
    {artistName && artistName !== 'Unknown Artist' && (
      <div style={{ opacity: 0.7 }}>{artistName}</div>
    )}
  </div>
);

export default SongInfoConsoleOverlay; 