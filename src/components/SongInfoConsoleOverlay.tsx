import React from 'react';

interface SongInfoConsoleOverlayProps {
  songName: string;
  artistName: string;
}

const SongInfoConsoleOverlay: React.FC<SongInfoConsoleOverlayProps> = ({ songName, artistName }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 12,
      right: 18,
      background: '#000',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      lineHeight: 1.3,
      padding: '8px 14px',
      zIndex: 20,
      pointerEvents: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      whiteSpace: 'pre-line',
      letterSpacing: '0.01em',
      minWidth: 120,
      textAlign: 'left',
      userSelect: 'none',
    }}
  >
    <div>{songName}</div>
    {artistName && artistName !== 'Unknown Artist' && (
      <div style={{ opacity: 0.7 }}>{artistName}</div>
    )}
  </div>
);

export default SongInfoConsoleOverlay; 