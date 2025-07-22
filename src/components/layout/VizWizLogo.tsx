import React from 'react';

interface VizWizLogoProps {
  theme: string;
}

const VizWizLogo: React.FC<VizWizLogoProps> = ({ theme }) => (
  <div
    style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      fontFamily: '"Press Start 2P", ui-sans-serif, system-ui, sans-serif',
      fontSize: '28px',
      fontWeight: '700',
      letterSpacing: '4px',
      color: (theme === 'Default' || theme === 'Serum' || theme === 'Valhalla') ? '#fff' : '#23253a',
      padding: '2px 12px',
      textShadow:
        (theme === 'Default' || theme === 'Serum' || theme === 'Valhalla')
          ? '0 2px 0 #23253a66, 0 1px 0 #b8b2a3, 0 -2px 2px #fff5'
          : '0 2px 0 #fff6, 0 1px 0 #e6dcc3, 0 -2px 2px #0005',
      filter: 'contrast(1.1)',
      opacity: 0.92,
    }}
  >
    VizWiz
  </div>
);

export default VizWizLogo; 