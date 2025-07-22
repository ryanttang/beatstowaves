import React from 'react';

interface SidebarPanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  topOffset?: number;
  themeStyles: {
    color: string;
    background: string;
    colorGradient?: string[];
    colorPalette?: string;
    backgroundAnimation?: string;
  };
}

const SidebarPanel: React.FC<SidebarPanelProps> = ({ visible, onClose, children, style, topOffset = 100, themeStyles }) => {
  // Neumorphic shadow colors
  const shadowLight = 'rgba(255,255,255,0.10)'; // reduced
  const shadowDark = 'rgba(30,41,59,0.16)';    // reduced
  const accent = themeStyles.color;
  // Use a dark gradient for the background
  const bgGradient = 'linear-gradient(135deg, #181a24 80%, #23253a 100%)';

  return (
    <aside
      className={`fixed z-50 transition-transform duration-300 ease-in-out flex flex-col synth-console-panel`}
      style={{
        left: 32,
        top: topOffset,
        minWidth: 340,
        maxWidth: 380,
        minHeight: 320,
        maxHeight: '80vh',
        borderRadius: 18,
        background: bgGradient,
        color: accent,
        boxShadow: `
          2px 2px 10px 0 ${shadowDark},
          -2px -2px 10px 0 ${shadowLight},
          0 1.5px 4px 0 ${shadowDark},
          inset 0 1px 4px 0 ${shadowLight},
          inset 0 -1px 4px 0 ${shadowDark}
        `,
        border: `2.5px solid ${accent}33`,
        outline: `1.5px solid ${accent}22`,
        transform: visible ? 'translateY(0)' : 'translateY(-40px) scale(0.98)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.25s cubic-bezier(.4,2,.3,1)',
        ...style,
      }}
      aria-label="Floating synth/VST console panel"
    >
      <div
        className="flex justify-between items-center px-3 py-2 border-b"
        style={{
          borderColor: `${accent}44`,
          background: 'rgba(255,255,255,0.03)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: `0 1px 4px 0 ${shadowDark}22, 0 1px 4px 0 ${shadowLight}11`,
        }}
      >
        <span className="font-bold text-base tracking-wide" style={{ letterSpacing: 2, color: accent, textShadow: `0 1px 4px ${shadowDark}33` }}>Console</span>
        <button
          className="text-2xl font-bold focus:outline-none transition-colors"
          style={{ color: accent, borderRadius: 8, padding: '0 8px', background: 'none', border: 'none' }}
          onClick={onClose}
          aria-label="Close console"
          onMouseOver={e => (e.currentTarget.style.color = themeStyles.colorGradient ? themeStyles.colorGradient[1] : accent)}
          onMouseOut={e => (e.currentTarget.style.color = accent)}
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </aside>
  );
};

export default SidebarPanel; 