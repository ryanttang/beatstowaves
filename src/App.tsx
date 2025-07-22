import React, { useEffect, useRef, useState, useCallback } from 'react';
import UploadPanel from './components/UploadPanel';
import VisualizerControls, { RandomizeSeedButton } from './components/VisualizerControls';
import ExportPanel from './components/ExportPanel';
import PlaybackControls from './components/PlaybackControls';
import { useAppStore } from './store';
import { VisualizerEngine } from './engine/VisualizerEngine';
import { AudioAnalyzer } from './audio/AudioAnalyzer';
import Knob from './components/Knob';
import { ButtonSVG } from './components/KnobSVG';
import SongInfoConsoleOverlay from './components/SongInfoConsoleOverlay';
import SidebarPanel from './components/SidebarPanel';
import ColorPanel from './components/ColorPanel';
import SizePanel from './components/SizePanel';
import ShapePanel from './components/ShapePanel';
import CountPanel from './components/CountPanel';
import LightingPanel from './components/LightingPanel';
import BackgroundPanel from './components/BackgroundPanel';

const DEFAULT_SEED = 'default-seed-visualizer';

const THEME_PRESETS: {
  [key: string]: {
    color: string;
    colorGradient: string[];
    colorPalette: string;
    background: string;
    backgroundAnimation: string;
  }
} = {
  Default: {
    color: '#4a90e2',
    colorGradient: ['#4a90e2', '#e07a3f'],
    colorPalette: 'default',
    background: '#23253a',
    backgroundAnimation: 'none',
  },
  'OP-1': {
    color: '#3a3a3a', // dark gray for main accent
    colorGradient: ['#425b8c', '#e6b85c', '#bfc0c2', '#e25c3f'], // blue, yellow/orange, gray, red (knob colors)
    colorPalette: 'default',
    background: '#f3f3f3', // light gray/white
    backgroundAnimation: 'none',
  },
  'RC-20': {
    color: '#e07a3f', // warm orange accent
    colorGradient: ['#e07a3f', '#e6c15c'], // orange to yellow (main panel colors)
    colorPalette: 'warm',
    background: '#e6dcc3', // cream/beige background
    backgroundAnimation: 'none',
  },
  'Serum': {
    color: '#3cf2ff', // neon cyan accent
    colorGradient: ['#1a2633', '#3cf2ff'], // deep blue to neon cyan
    colorPalette: 'cool',
    background: '#1a2633', // deep blue background
    backgroundAnimation: 'none',
  },
  'Valhalla': {
    color: '#a46cff', // bright purple accent
    colorGradient: ['#4be1f6', '#a46cff'], // blue to purple
    colorPalette: 'cool',
    background: '#10102a', // deep blue/black background
    backgroundAnimation: 'none',
  },
};

const SeedDisplay = () => {
  const seed = useAppStore(s => s.seed);
  return (
    <div className="mt-2 text-xs text-gray-400">Seed: {seed || '\u2014'}</div>
  );
};

const DebugPanel: React.FC<{ engineRef: React.MutableRefObject<VisualizerEngine | null>, visualizerRef: React.RefObject<HTMLDivElement> }>
  = ({ engineRef, visualizerRef }) => {
  const [canvasSize, setCanvasSize] = useState<{w: number, h: number}>({w: 0, h: 0});
  useEffect(() => {
    if (visualizerRef.current) {
      const canvas = visualizerRef.current.querySelector('canvas');
      if (canvas) {
        setCanvasSize({ w: canvas.width, h: canvas.height });
      }
    }
    // Log refs for inspection
    console.log('[DebugPanel] engineRef:', engineRef.current);
    console.log('[DebugPanel] visualizerRef:', visualizerRef.current);
  }, []);
  return (
    <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-400">
      <div>Debug Info:</div>
      <div>Canvas: {canvasSize.w} x {canvasSize.h}</div>
      <div>Engine: {engineRef.current ? 'Mounted' : 'Not mounted'}</div>
      <div>Div: {visualizerRef.current ? 'Present' : 'Missing'}</div>
    </div>
  );
};

const App: React.FC = () => {
  const visualizerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VisualizerEngine | null>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const { audioFile, seed, visualMode, intensity, isFullscreen, isPlaying, setIsPlaying, setSeed } = useAppStore();
  const [canPlay, setCanPlay] = useState(false);

  // Knob state for each effect
  const [noise, setNoise] = useState(0.5);
  const [wobble, setWobble] = useState(0.5);
  const [distort, setDistort] = useState(0.5);
  const [digital, setDigital] = useState(0.5);
  const [space, setSpace] = useState(0.5);
  const [magnetic, setMagnetic] = useState(0.5);
  // Advanced Color state
  const [color, setColor] = useState('#4a90e2');
  const [colorGradient, setColorGradient] = useState(['#4a90e2', '#e07a3f']);
  const [colorPalette, setColorPalette] = useState('default');
  const [colorAnimated, setColorAnimated] = useState(false);
  // Advanced Size state
  const [size, setSize] = useState(1);
  const [sizeX, setSizeX] = useState(1);
  const [sizeY, setSizeY] = useState(1);
  const [sizeZ, setSizeZ] = useState(1);
  const [sizeAudioReactive, setSizeAudioReactive] = useState(false);
  // Advanced Shape state
  const [shape, setShape] = useState('box');
  const [shapeMorph, setShapeMorph] = useState(0);
  // Advanced Count state
  const [count, setCount] = useState(16);
  const [countAuto, setCountAuto] = useState(false);
  // Advanced Lighting state
  const [lights, setLights] = useState([
    { color: '#ffffff', intensity: 1, position: [0, 20, 20] }
  ]);
  const [shadows, setShadows] = useState(false);
  // Advanced Background state
  const [background, setBackground] = useState('#23253a');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundAnimation, setBackgroundAnimation] = useState('none');
  // Editing option UI state
  const [editingOption, setEditingOption] = useState<string | null>(null);
  // Remove theme effect on visualizer state
  // Only use theme for panel UI
  const [theme, setTheme] = useState<keyof typeof THEME_PRESETS>('Default');
  const themeStyles = THEME_PRESETS[theme];

  // Audio-reactive controls
  const [audioReactiveMorph, setAudioReactiveMorph] = useState(false);
  const [audioReactiveColor, setAudioReactiveColor] = useState(false);
  const [audioReactiveSize, setAudioReactiveSize] = useState(false);
  const [audioBand, setAudioBand] = useState<'bass' | 'mid' | 'treble'>('bass'); // 'bass', 'mid', 'treble'

  // Best defaults for each visual mode
  const MODE_DEFAULTS: Record<string, Partial<{
    noise: number;
    wobble: number;
    distort: number;
    digital: number;
    space: number;
    magnetic: number;
    color: string;
    colorGradient: string[];
    colorPalette: string;
    colorAnimated: boolean;
    size: number;
    sizeX: number;
    sizeY: number;
    sizeZ: number;
    sizeAudioReactive: boolean;
    shape: string;
    shapeMorph: number;
    count: number;
    countAuto: boolean;
    lights: any[];
    shadows: boolean;
    background: string;
    backgroundAnimation: string;
  }> > = {
    classic:    { noise: 0.05, wobble: 0.05, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#4a90e2', count: 32, size: 1, shape: 'box', colorPalette: 'default', colorGradient: ['#4a90e2', '#e07a3f'] },
    bars:       { noise: 0.05, wobble: 0.05, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#e07a3f', count: 32, size: 1, shape: 'box', colorPalette: 'warm', colorGradient: ['#e07a3f', '#e6c15c'] },
    spiral:     { noise: 0.1, wobble: 0.1, distort: 0.05, digital: 0, space: 0.1, magnetic: 0, color: '#e07a3f', count: 32, size: 1, shape: 'box', colorPalette: 'warm', colorGradient: ['#e07a3f', '#e6c15c'] },
    waves:      { noise: 0.05, wobble: 0.15, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#4a90e2', count: 32, size: 1, shape: 'box', colorPalette: 'default', colorGradient: ['#4a90e2', '#e07a3f'] },
    particles:  { noise: 0.15, wobble: 0.1, distort: 0.05, digital: 0, space: 0.2, magnetic: 0, color: '#3bb6b0', count: 24, size: 1, shape: 'box', colorPalette: 'cool', colorGradient: ['#4a90e2', '#3bb6b0'] },
    radial:     { noise: 0.05, wobble: 0.05, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#e07a3f', count: 32, size: 1, shape: 'box', colorPalette: 'warm', colorGradient: ['#e07a3f', '#e6c15c'] },
    sphere:     { noise: 0.05, wobble: 0.05, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#4a90e2', count: 16, size: 1, shape: 'box', colorPalette: 'default', colorGradient: ['#4a90e2', '#e07a3f'] },
    tunnel:     { noise: 0.05, wobble: 0.1, distort: 0.05, digital: 0, space: 0.1, magnetic: 0, color: '#3cf2ff', count: 16, size: 1, shape: 'box', colorPalette: 'cool', colorGradient: ['#1a2633', '#3cf2ff'] },
    grid:       { noise: 0.05, wobble: 0.05, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#4a90e2', count: 27, size: 0.8, shape: 'box', colorPalette: 'default', colorGradient: ['#4a90e2', '#e07a3f'] },
    ribbon:     { noise: 0.05, wobble: 0.15, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#e07a3f', count: 32, size: 1, shape: 'box', colorPalette: 'warm', colorGradient: ['#e07a3f', '#e6c15c'] },
    galaxy:     { noise: 0.2, wobble: 0.1, distort: 0.05, digital: 0, space: 0.2, magnetic: 0, color: '#3cf2ff', count: 16, size: 1, shape: 'box', colorPalette: 'cool', colorGradient: ['#1a2633', '#3cf2ff'] },
    blob:       { noise: 0.05, wobble: 0.05, distort: 0.1, digital: 0, space: 0, magnetic: 0, color: '#a46cff', count: 16, size: 1, shape: 'sphere', colorPalette: 'cool', colorGradient: ['#4be1f6', '#a46cff'] },
    dna:        { noise: 0.05, wobble: 0.1, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#e07a3f', count: 16, size: 1, shape: 'sphere', colorPalette: 'warm', colorGradient: ['#e07a3f', '#e6c15c'] },
    liquid:     { noise: 0.1, wobble: 0.1, distort: 0.05, digital: 0, space: 0.1, magnetic: 0, color: '#3bb6b0', count: 8, size: 1, shape: 'sphere', colorPalette: 'cool', colorGradient: ['#4a90e2', '#3bb6b0'] },
    orbitals:   { noise: 0.05, wobble: 0.1, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#e07a3f', count: 8, size: 1, shape: 'sphere', colorPalette: 'warm', colorGradient: ['#e07a3f', '#e6c15c'] },
    fractal:    { noise: 0.05, wobble: 0.1, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#4a90e2', count: 8, size: 1, shape: 'box', colorPalette: 'default', colorGradient: ['#4a90e2', '#e07a3f'] },
    polygon:    { noise: 0.05, wobble: 0.1, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#e07a3f', count: 6, size: 1, shape: 'box', colorPalette: 'warm', colorGradient: ['#e07a3f', '#e6c15c'] },
    wavegrid:   { noise: 0.05, wobble: 0.1, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#3cf2ff', count: 24, size: 1, shape: 'box', colorPalette: 'cool', colorGradient: ['#1a2633', '#3cf2ff'] },
    textdeform: { noise: 0.05, wobble: 0.1, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#4a90e2', count: 8, size: 1, shape: 'box', colorPalette: 'default', colorGradient: ['#4a90e2', '#e07a3f'] },
    aurora:     { noise: 0.05, wobble: 0.15, distort: 0.05, digital: 0, space: 0, magnetic: 0, color: '#a46cff', count: 8, size: 1, shape: 'box', colorPalette: 'cool', colorGradient: ['#4be1f6', '#a46cff'] },
  };

  // Propagate knob values to VisualizerEngine
  useEffect(() => {
    if (engineRef.current && typeof engineRef.current.setEffects === 'function') {
      engineRef.current.setEffects({ noise, wobble, distort, digital, space, magnetic });
    }
  }, [noise, wobble, distort, digital, space, magnetic]);

  // Propagate advanced editing options to VisualizerEngine
  useEffect(() => {
    if (engineRef.current && typeof engineRef.current.setVisualOptions === 'function') {
      engineRef.current.setVisualOptions({
        color, colorGradient, colorPalette, colorAnimated,
        size, sizeX, sizeY, sizeZ, sizeAudioReactive,
        shape, shapeMorph,
        count, countAuto,
        lights, shadows,
        background, backgroundImage: backgroundImage || undefined, backgroundAnimation,
        audioReactiveMorph, audioReactiveColor, audioReactiveSize, audioBand
      });
    }
  }, [color, colorGradient, colorPalette, colorAnimated, size, sizeX, sizeY, sizeZ, sizeAudioReactive, shape, shapeMorph, count, countAuto, lights, shadows, background, backgroundImage, backgroundAnimation, audioReactiveMorph, audioReactiveColor, audioReactiveSize, audioBand]);

  // Set a default seed on first mount if none is set
  useEffect(() => {
    if (!seed) setSeed(DEFAULT_SEED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme switcher effect
  useEffect(() => {
    const preset = THEME_PRESETS[theme];
    if (preset) {
      setColor(preset.color);
      setColorGradient(preset.colorGradient);
      setColorPalette(preset.colorPalette);
      setBackground(preset.background);
      setBackgroundAnimation(preset.backgroundAnimation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Set best defaults for each mode when mode changes
  useEffect(() => {
    const defaults = MODE_DEFAULTS[visualMode];
    if (defaults) {
      if (typeof defaults.noise === 'number') setNoise(defaults.noise);
      if (typeof defaults.wobble === 'number') setWobble(defaults.wobble);
      if (typeof defaults.distort === 'number') setDistort(defaults.distort);
      if (typeof defaults.digital === 'number') setDigital(defaults.digital);
      if (typeof defaults.space === 'number') setSpace(defaults.space);
      if (typeof defaults.magnetic === 'number') setMagnetic(defaults.magnetic);
      if (typeof defaults.color === 'string') setColor(defaults.color);
      if (Array.isArray(defaults.colorGradient)) setColorGradient(defaults.colorGradient);
      if (typeof defaults.colorPalette === 'string') setColorPalette(defaults.colorPalette);
      if (typeof defaults.size === 'number') setSize(defaults.size);
      if (typeof defaults.count === 'number') setCount(defaults.count);
      if (typeof defaults.shape === 'string') setShape(defaults.shape);
      // Add more as needed
    }
  }, [visualMode]);

  // Helper to check if the visualizer div has a non-zero size
  const isVisualizerReady = useCallback(() => {
    if (!visualizerRef.current) return false;
    return visualizerRef.current.clientWidth > 0 && visualizerRef.current.clientHeight > 0;
  }, []);

  // Mount/unmount Three.js engine only when container is ready
  useEffect(() => {
    if (!isVisualizerReady()) return;
    const currentSeed = seed || DEFAULT_SEED;
    if (visualizerRef.current) {
      if (engineRef.current) engineRef.current.dispose();
      engineRef.current = new VisualizerEngine(visualizerRef.current!, currentSeed, visualMode, intensity);
    }
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, visualMode, intensity, isVisualizerReady]);

  // Use ResizeObserver to trigger engine creation when div is resized from 0 to non-zero
  useEffect(() => {
    if (!visualizerRef.current) return;
    const handleResize = () => {
      if (engineRef.current && visualizerRef.current) {
        const { clientWidth, clientHeight } = visualizerRef.current;
        engineRef.current.renderer.setSize(clientWidth, clientHeight);
        engineRef.current.camera.aspect = clientWidth / clientHeight;
        engineRef.current.camera.updateProjectionMatrix();
      }
      // If engine is not created and div is now non-zero, create it
      if (!engineRef.current && isVisualizerReady()) {
        const currentSeed = seed || DEFAULT_SEED;
        engineRef.current = new VisualizerEngine(visualizerRef.current!, currentSeed, visualMode, intensity);
      }
    };
    const observer = new window.ResizeObserver(handleResize);
    if (visualizerRef.current) {
      observer.observe(visualizerRef.current!);
    }
    // Initial check
    handleResize();
    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizerRef, seed, visualMode, intensity, isVisualizerReady]);

  // Handle audio analysis using <audio> element
  useEffect(() => {
    if (audioFile && audioElementRef.current) {
      analyzerRef.current = new AudioAnalyzer();
      analyzerRef.current.init(audioElementRef.current);
      setCanPlay(true);
      analyzerRef.current.subscribe((data) => {
        engineRef.current?.updateAudioData(data);
      });
      analyzerRef.current.start();
    } else {
      setCanPlay(false);
    }
    return () => {
      analyzerRef.current?.stop();
      analyzerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFile]);

  // Fullscreen toggle (placeholder)
  const handleFullscreen = () => {
    if (visualizerRef.current) {
      if (!document.fullscreenElement) {
        visualizerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Add export handler
  const handleExportClick = () => {
    // Simulate click on hidden export button or trigger export logic
    const event = new CustomEvent('trigger-export');
    window.dispatchEvent(event);
  };

  // Add a helper to determine if a color is light
  function isColorLight(hex: string) {
    // Remove hash if present
    hex = hex.replace('#', '');
    // Convert 3-digit to 6-digit
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    // Perceived brightness
    return (r*0.299 + g*0.587 + b*0.114) > 186;
  }
  const panelTextColor = isColorLight(themeStyles.background) ? '#23253a' : '#fff';

  // Randomize seed and all knob values
  function randomizeAll() {
    // Helper for random float in [0, 1]
    const rand = () => Math.random();
    setSeed(Math.random().toString(36).slice(2, 18));
    setNoise(rand());
    setWobble(rand());
    setDistort(rand());
    setDigital(rand());
    setSpace(rand());
    setMagnetic(rand());
  }

  // Song/artist info for overlay
  const songName = audioFile ? audioFile.name.replace(/\.[^/.]+$/, '') : 'Song Title';
  const artistName = audioFile ? 'Unknown Artist' : 'Artist Name';

  // Modal state
  const [modal, setModal] = useState<null | 'about' | 'howto' | 'faq'>(null);
  // Info row visibility state
  const [showInfoRow, setShowInfoRow] = useState(true);

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-gradient-to-br from-rc20-navy via-rc20-beige/30 to-rc20-navy/90">
      {/* Menu icon for toggling info row */}
      <button
        onClick={() => setShowInfoRow(v => !v)}
        style={{
          position: 'fixed',
          top: '18px',
          left: '18px',
          zIndex: '1010',
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
      {/* Top buttons row, centered above the main panel */}
      {/* Remove any duplicate or persistent info button row rendering. Only keep the one inside {showInfoRow && (...)} after the menu icon. */}
      {/* SidebarPanel for editing options (floating console) */}
      <SidebarPanel
        visible={!!editingOption}
        onClose={() => setEditingOption(null)}
        topOffset={180} // aligns with button column
        themeStyles={themeStyles}
      >
        {editingOption === 'color' && (
          <ColorPanel
            color={color}
            setColor={setColor}
            colorGradient={colorGradient as [string, string]}
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
      <div
        className="rc20-panel max-w-4xl p-4 flex flex-col gap-4 items-center justify-center rounded-2xl shadow-2xl relative"
        style={{
          background: themeStyles.background,
          color: themeStyles.color,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          // marginLeft removed for floating console
          transition: 'margin-left 0.3s',
        }}
      >
        {/* Theme Switcher Dropdown - upper right */}
        <div style={{ position: 'absolute', top: '20px', right: '28px', zIndex: 20 }}>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value as keyof typeof THEME_PRESETS)}
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
        {/* VizWiz logo in top-left corner */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', fontFamily: '"Press Start 2P", ui-sans-serif, system-ui, sans-serif', fontSize: '28px', fontWeight: '700', letterSpacing: '4px', color: themeStyles.color, textShadow: '0 2px 8px #23253a88', padding: '2px 12px' }}>
          VizWiz
        </div>
        {/* Visualizer screen with knobs right, buttons left */}
        <div className="w-full flex justify-center items-center mb-1 gap-4 max-w-[900px]" style={{ marginTop: '72px' }}>
          {/* Left column: UploadPanel above editing option buttons, bottom button aligned with visualizer bottom */}
          <div className="flex flex-col justify-between items-center w-[160px] h-full" style={{ maxHeight: '1350px' }}>
            {/* Top: UploadPanel */}
            <div className="flex justify-center self-center mx-auto" style={{ width: '140px' }}>
              <UploadPanel />
            </div>
            {/* Spacer to push buttons to bottom */}
            <div className="flex-1" />
            {/* Bottom: Editing option buttons */}
            <div className="flex flex-col gap-4 items-center justify-end w-full mb-2">
              <ButtonSVG src="/knobs/button-orange.svg" label="COLOR" width="140" height="48" onClick={() => setEditingOption('color')} />
              <ButtonSVG src="/knobs/button-yellow.svg" label="SIZE" width="140" height="48" onClick={() => setEditingOption('size')} />
              <ButtonSVG src="/knobs/button-lime.svg" label="SHAPE" width="140" height="48" onClick={() => setEditingOption('shape')} />
              <ButtonSVG src="/knobs/button-lightblue.svg" label="COUNT" width="140" height="48" onClick={() => setEditingOption('count')} />
              <ButtonSVG src="/knobs/button-blue.svg" label="LIGHTING" width="140" height="48" onClick={() => setEditingOption('lighting')} />
              <ButtonSVG src="/knobs/button-purple.svg" label="BACKGROUND" width="140" height="48" onClick={() => setEditingOption('background')} />
            </div>
          </div>
          {/* Editing option popovers */}
          {/* Remove old editing option popovers here, as they are now in SidebarPanel */}
          {/* Visualizer center */}
          <div className="flex flex-col items-center w-full justify-center" style={{maxWidth: '400px', aspectRatio: '1080/1350', height: 'auto'}}>
            <div
              ref={visualizerRef}
              id="visualizer-canvas"
              className="bg-rc20-navy/80 rounded-xl border-4 shadow-2xl flex items-center justify-center"
              style={{ aspectRatio: '1080 / 1350', width: '100%', maxWidth: '400px', height: 'auto', borderColor: themeStyles.color, position: 'relative' }}
              aria-label="Visualizer display"
              role="region"
            >
              {/* Song info overlay (console style) INSIDE visualizer */}
              <SongInfoConsoleOverlay songName={songName} artistName={artistName} />
            </div>
            {/* Playback controls directly below visualizer */}
            <div className="w-full flex justify-center items-center mt-3">
              <div className="w-full max-w-[400px] mx-auto">
                <PlaybackControls ref={audioElementRef} />
              </div>
            </div>
            {/* Footer controls (SVG black buttons) in a single row, with more vertical margin */}
            <div className="w-full flex justify-center items-center mt-4 mb-2">
              <div className="flex flex-row gap-3 w-full max-w-[400px] justify-center mx-auto">
                <ButtonSVG src="/knobs/black-button.svg" label="LOAD" width="90" height="36" />
                <ButtonSVG src="/knobs/black-button.svg" label="SAVE" width="90" height="36" />
                <ButtonSVG src="/knobs/black-button.svg" label="PRESET" width="90" height="36" />
                <ButtonSVG src="/knobs/black-button.svg" label="EXPORT" width="90" height="36" onClick={handleExportClick} />
              </div>
            </div>
            {/* Control Button Row - below visualizer, icon buttons, with more vertical margin and centered */}
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '18px', marginBottom: '2px' }}>
              {/* Screenshot Button */}
              <button
                onClick={() => {
                  const canvas = visualizerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = 'visualizer.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  }
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)',
                  border: '2.5px solid #38bdf8',
                  borderRadius: '10px',
                  boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822',
                  color: '#38bdf8',
                  fontSize: '22px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
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
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                }}
                aria-label="Export Video (WebM)"
                title="Export Video (WebM)"
              >
                <span style={{ display: 'block', lineHeight: 1 }}>🎥</span>
              </button>
              {/* Reset Button (placeholder) */}
              <button
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                }}
                aria-label="Reset Visualizer"
                title="Reset Visualizer"
              >
                <span style={{ display: 'block', lineHeight: 1 }}>♻️</span>
              </button>
              {/* Randomize Button (placeholder) */}
              <button
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                }}
                aria-label="Randomize Visualizer"
                title="Randomize Visualizer"
              >
                <span style={{ display: 'block', lineHeight: 1 }}>🎲</span>
              </button>
              {/* Download Preset Button (placeholder) */}
              <button
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                }}
                aria-label="Download Preset"
                title="Download Preset"
              >
                <span style={{ display: 'block', lineHeight: 1 }}>💾</span>
              </button>
              {/* Upload Preset Button (placeholder) */}
              <button
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)', border: '2.5px solid #38bdf8', borderRadius: '10px', boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822', color: '#38bdf8', fontSize: '22px', fontWeight: '900', cursor: 'pointer', outline: 'none', transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                }}
                aria-label="Upload Preset"
                title="Upload Preset"
              >
                <span style={{ display: 'block', lineHeight: 1 }}>📂</span>
              </button>
              {/* Fullscreen Button - moved here as last button */}
              <button
                onClick={handleFullscreen}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(180deg, #23253a 70%, #181a24 100%)',
                  border: '2.5px solid #38bdf8',
                  borderRadius: '10px',
                  boxShadow: '0 4px 0 #10121a, 0 2px 12px #23253a66, 0 1.5px 0 #fff, 0 0.5px 0 #38bdf8, inset 0 2px 8px #38bdf822',
                  color: '#38bdf8',
                  fontSize: '22px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                }}
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
          {/* Right column: Knobs grid and VisualizerControls stacked */}
          <div className="flex flex-col items-center justify-start gap-4" style={{ maxHeight: '1350px' }}>
            <div
              className="grid grid-cols-2 gap-y-6 gap-x-6 items-center mt-0"
              style={{ maxHeight: '1350px' }}
            >
              <Knob value={typeof noise === 'number' ? noise : 0.5} onChange={setNoise} label="NOISE" color="#e07a3f" theme={theme} />
              <Knob value={typeof wobble === 'number' ? wobble : 0.5} onChange={setWobble} label="WOBBLE" color="#e6c15c" theme={theme} />
              <Knob value={typeof distort === 'number' ? distort : 0.5} onChange={setDistort} label="DISTORT" color="#4bbf8b" theme={theme} />
              <Knob value={typeof digital === 'number' ? digital : 0.5} onChange={setDigital} label="DIGITAL" color="#3bb6b0" theme={theme} />
              <Knob value={typeof space === 'number' ? space : 0.5} onChange={setSpace} label="SPACE" color="#4a90e2" theme={theme} />
              <Knob value={typeof magnetic === 'number' ? magnetic : 0.5} onChange={setMagnetic} label="MAGNETIC" color="#23253a" theme={theme} />
            </div>
            <div className="w-full max-w-[280px] min-w-[220px] flex justify-center">
              <section className="flex flex-col gap-3 p-2 px-4 py-4 rounded-lg text-base shadow-lg items-stretch"
                style={{ minWidth: '0', background: themeStyles.background, color: panelTextColor }}>
                <VisualizerControls background={themeStyles.background} color={panelTextColor} theme={theme} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 