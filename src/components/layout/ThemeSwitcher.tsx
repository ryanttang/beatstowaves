import React from 'react';

interface ThemeSwitcherProps {
  theme: string;
  setTheme: (theme: string) => void;
  themeStyles: any;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme, themeStyles }) => (
  <div style={{ position: 'absolute', top: '20px', right: '28px', zIndex: 20 }}>
    <select
      value={theme}
      onChange={e => setTheme(e.target.value)}
      className="bg-gray-800 text-white rounded px-3 py-1 border border-gray-600 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ minWidth: '120px', color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}
      aria-label="Theme Switcher"
    >
      <option value="Default">Default Theme</option>
      <option value="OP-1">OP-1 Theme</option>
      <option value="RC-20">RC-20 Theme</option>
      <option value="Serum">Serum Theme</option>
      <option value="Valhalla">Valhalla Theme</option>
    </select>
  </div>
);

export default ThemeSwitcher; 