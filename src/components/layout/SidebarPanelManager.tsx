import React from 'react';
import SidebarPanel from '../SidebarPanel';
import ColorPanel from '../ColorPanel';
import SizePanel from '../SizePanel';
import ShapePanel from '../ShapePanel';
import CountPanel from '../CountPanel';
import LightingPanel from '../LightingPanel';
import BackgroundPanel from '../BackgroundPanel';

interface SidebarPanelManagerProps {
  editingOption: string | null;
  setEditingOption: (option: string | null) => void;
  // Color
  color: string;
  setColor: (c: string) => void;
  colorGradient: [string, string];
  setColorGradient: (g: [string, string]) => void;
  colorPalette: string;
  setColorPalette: (p: string) => void;
  colorAnimated: boolean;
  setColorAnimated: (a: boolean) => void;
  // Size
  size: number;
  setSize: (n: number) => void;
  sizeX: number;
  setSizeX: (n: number) => void;
  sizeY: number;
  setSizeY: (n: number) => void;
  sizeZ: number;
  setSizeZ: (n: number) => void;
  sizeAudioReactive: boolean;
  setSizeAudioReactive: (a: boolean) => void;
  // Shape
  shape: string;
  setShape: (s: string) => void;
  shapeMorph: number;
  setShapeMorph: (n: number) => void;
  audioReactiveMorph: boolean;
  setAudioReactiveMorph: (a: boolean) => void;
  audioReactiveColor: boolean;
  setAudioReactiveColor: (a: boolean) => void;
  audioReactiveSize: boolean;
  setAudioReactiveSize: (a: boolean) => void;
  audioBand: 'bass' | 'mid' | 'treble';
  setAudioBand: (b: 'bass' | 'mid' | 'treble') => void;
  // Count
  count: number;
  setCount: (n: number) => void;
  countAuto: boolean;
  setCountAuto: (a: boolean) => void;
  // Lighting
  lights: { color: string; intensity: number; position: [number, number, number] }[];
  setLights: (l: { color: string; intensity: number; position: [number, number, number] }[]) => void;
  shadows: boolean;
  setShadows: (s: boolean) => void;
  // Background
  background: string;
  setBackground: (b: string) => void;
  backgroundImage: string | null;
  setBackgroundImage: (img: string | null) => void;
  backgroundAnimation: string;
  setBackgroundAnimation: (a: string) => void;
  // Theme
  themeStyles: any;
}

const SidebarPanelManager: React.FC<SidebarPanelManagerProps> = ({
  editingOption, setEditingOption,
  color, setColor, colorGradient, setColorGradient, colorPalette, setColorPalette, colorAnimated, setColorAnimated,
  size, setSize, sizeX, setSizeX, sizeY, setSizeY, sizeZ, setSizeZ, sizeAudioReactive, setSizeAudioReactive,
  shape, setShape, shapeMorph, setShapeMorph, audioReactiveMorph, setAudioReactiveMorph, audioReactiveColor, setAudioReactiveColor, audioReactiveSize, setAudioReactiveSize, audioBand, setAudioBand,
  count, setCount, countAuto, setCountAuto,
  lights, setLights, shadows, setShadows,
  background, setBackground, backgroundImage, setBackgroundImage, backgroundAnimation, setBackgroundAnimation,
  themeStyles
}) => (
  <SidebarPanel
    visible={!!editingOption}
    onClose={() => setEditingOption(null)}
    topOffset={180}
    themeStyles={themeStyles}
  >
    {editingOption === 'color' && (
      <ColorPanel
        color={color}
        setColor={setColor}
        colorGradient={colorGradient}
        setColorGradient={setColorGradient}
        colorPalette={colorPalette}
        setColorPalette={setColorPalette}
        colorAnimated={colorAnimated}
        setColorAnimated={setColorAnimated}
        themeStyles={themeStyles}
        onClose={() => setEditingOption(null)}
      />
    )}
    {editingOption === 'size' && (
      <SizePanel
        size={size}
        setSize={setSize}
        sizeX={sizeX}
        setSizeX={setSizeX}
        sizeY={sizeY}
        setSizeY={setSizeY}
        sizeZ={sizeZ}
        setSizeZ={setSizeZ}
        sizeAudioReactive={sizeAudioReactive}
        setSizeAudioReactive={setSizeAudioReactive}
        themeStyles={themeStyles}
        onClose={() => setEditingOption(null)}
      />
    )}
    {editingOption === 'shape' && (
      <ShapePanel
        shape={shape}
        setShape={setShape}
        shapeMorph={shapeMorph}
        setShapeMorph={setShapeMorph}
        audioReactiveMorph={audioReactiveMorph}
        setAudioReactiveMorph={setAudioReactiveMorph}
        audioReactiveColor={audioReactiveColor}
        setAudioReactiveColor={setAudioReactiveColor}
        audioReactiveSize={audioReactiveSize}
        setAudioReactiveSize={setAudioReactiveSize}
        audioBand={audioBand}
        setAudioBand={setAudioBand}
        themeStyles={themeStyles}
        onClose={() => setEditingOption(null)}
      />
    )}
    {editingOption === 'count' && (
      <CountPanel
        count={count}
        setCount={setCount}
        countAuto={countAuto}
        setCountAuto={setCountAuto}
        themeStyles={themeStyles}
        onClose={() => setEditingOption(null)}
      />
    )}
    {editingOption === 'lighting' && (
      <LightingPanel
        lights={lights.map(l => ({ ...l, position: l.position as [number, number, number] }))}
        setLights={setLights}
        shadows={shadows}
        setShadows={setShadows}
        themeStyles={themeStyles}
        onClose={() => setEditingOption(null)}
      />
    )}
    {editingOption === 'background' && (
      <BackgroundPanel
        background={background}
        setBackground={setBackground}
        backgroundImage={typeof backgroundImage === 'string' ? backgroundImage : null}
        setBackgroundImage={setBackgroundImage}
        backgroundAnimation={typeof backgroundAnimation === 'string' ? backgroundAnimation : 'none'}
        setBackgroundAnimation={setBackgroundAnimation}
        themeStyles={themeStyles}
        onClose={() => setEditingOption(null)}
      />
    )}
  </SidebarPanel>
);

export default SidebarPanelManager; 