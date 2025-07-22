import React from 'react';

interface SidebarPanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  topOffset?: number;
}

const SidebarPanel: React.FC<SidebarPanelProps> = ({ visible, onClose, children, style, topOffset = 100 }) => {
  return (
    <aside
      className={`fixed z-50 transition-transform duration-300 ease-in-out shadow-2xl border border-gray-700 flex flex-col synth-console-panel`}
      style={{
        left: 32, // visually attached to button column
        top: topOffset,
        minWidth: 340,
        maxWidth: 380,
        minHeight: 320,
        maxHeight: '80vh',
        borderRadius: 22,
        background: 'linear-gradient(135deg, #23253a 80%, #3a3a4a 100%)',
        color: '#fff',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.35), 0 1.5px 8px 0 rgba(80,80,120,0.18), inset 0 1.5px 8px 0 rgba(255,255,255,0.10)',
        transform: visible ? 'translateY(0)' : 'translateY(-40px) scale(0.98)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.25s cubic-bezier(.4,2,.3,1)',
        ...style,
      }}
      aria-label="Floating synth/VST console panel"
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-gray-900/90 to-gray-800/80 rounded-t-2xl">
        <span className="font-bold text-lg tracking-wide" style={{letterSpacing: 2}}>Console</span>
        <button
          className="text-white hover:text-rc20-orange text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close console"
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