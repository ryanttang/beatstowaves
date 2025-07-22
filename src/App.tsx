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

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-rc20-navy via-rc20-beige/30 to-rc20-navy/90">
      <div
        className="rc20-panel max-w-4xl p-4 flex flex-col gap-4 items-center justify-center rounded-2xl border-4 border-rc20-beige shadow-2xl relative"
        style={{
          background: themeStyles.background,
          borderColor: themeStyles.color,
          color: themeStyles.color,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {/* Theme Switcher Dropdown - upper right */}
        <div style={{ position: 'absolute', top: 20, right: 28, zIndex: 20 }}>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value as keyof typeof THEME_PRESETS)}
            className="bg-gray-800 text-white rounded px-3 py-1 border border-gray-600 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ minWidth: 120, color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}
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
        <div style={{ position: 'absolute', top: 20, left: 28, fontFamily: '"Press Start 2P", ui-sans-serif, system-ui, sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: 4, color: themeStyles.color, textShadow: '0 2px 8px #23253a88', padding: '4px 12px' }}>
          VizWiz
        </div>
        <div className="text-xs opacity-60" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', color: themeStyles.color, marginTop: 4 }}>
          Created by <a href="https://ryantang.site" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: themeStyles.color }}>Ryan Tang</a>
        </div>
        {/* UploadPanel - now above visualizer */}
        <div className="w-full max-w-[400px] mb-1 flex justify-center">
          <UploadPanel />
        </div>
        {/* Visualizer screen with knobs right, buttons left */}
        <div className="w-full flex justify-center items-center mb-1 gap-4 max-w-[900px]">
          {/* Editing option buttons left */}
          <div className="flex flex-col gap-2 items-center justify-center w-[160px] pt-1" style={{ maxHeight: '1350px' }}>
            <ButtonSVG src="/knobs/button-orange.svg" label="COLOR" width={140} height={48} onClick={() => setEditingOption('color')} />
            <ButtonSVG src="/knobs/button-yellow.svg" label="SIZE" width={140} height={48} onClick={() => setEditingOption('size')} />
            <ButtonSVG src="/knobs/button-lime.svg" label="SHAPE" width={140} height={48} onClick={() => setEditingOption('shape')} />
            <ButtonSVG src="/knobs/button-lightblue.svg" label="COUNT" width={140} height={48} onClick={() => setEditingOption('count')} />
            <ButtonSVG src="/knobs/button-blue.svg" label="LIGHTING" width={140} height={48} onClick={() => setEditingOption('lighting')} />
            <ButtonSVG src="/knobs/button-purple.svg" label="BACKGROUND" width={140} height={48} onClick={() => setEditingOption('background')} />
          </div>
          {/* Editing option popovers */}
          {editingOption === 'color' && (
            <div className="fixed top-1/2 left-1/2 z-50 bg-gray-900 p-4 rounded shadow-xl" style={{ transform: 'translate(-50%, -50%)', minWidth: 320, color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
              <label className="block mb-2 text-white">Pick Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} />
              <div className="mt-4">
                <label className="block text-white mb-1">Gradient</label>
                <input type="color" value={colorGradient[0]} onChange={e => setColorGradient([e.target.value, colorGradient[1]])} />
                <input type="color" value={colorGradient[1]} onChange={e => setColorGradient([colorGradient[0], e.target.value])} className="ml-2" />
              </div>
              <div className="mt-4">
                <label className="block text-white mb-1">Palette</label>
                <select value={colorPalette} onChange={e => setColorPalette(e.target.value)} className="bg-gray-800 text-white rounded p-2">
                  <option value="default">Default</option>
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                  <option value="rainbow">Rainbow</option>
                </select>
              </div>
              <div className="mt-4 flex items-center">
                <input type="checkbox" checked={colorAnimated} onChange={e => setColorAnimated(e.target.checked)} id="color-animated" />
                <label htmlFor="color-animated" className="ml-2 text-white">Animated Color</label>
              </div>
              <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setEditingOption(null)}>Close</button>
            </div>
          )}
          {editingOption === 'size' && (
            <div className="fixed top-1/2 left-1/2 z-50 bg-gray-900 p-4 rounded shadow-xl" style={{ transform: 'translate(-50%, -50%)', minWidth: 320, color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
              <label className="block mb-2 text-white">Master Size</label>
              <input type="range" min={0.2} max={3} step={0.01} value={size} onChange={e => setSize(Number(e.target.value))} />
              <span className="ml-2 text-white">{size.toFixed(2)}</span>
              <div className="mt-4">
                <label className="block text-white mb-1">X/Y/Z Scaling</label>
                <input type="range" min={0.2} max={3} step={0.01} value={sizeX} onChange={e => setSizeX(Number(e.target.value))} />
                <span className="ml-2 text-white">X: {sizeX.toFixed(2)}</span>
                <input type="range" min={0.2} max={3} step={0.01} value={sizeY} onChange={e => setSizeY(Number(e.target.value))} className="ml-2" />
                <span className="ml-2 text-white">Y: {sizeY.toFixed(2)}</span>
                <input type="range" min={0.2} max={3} step={0.01} value={sizeZ} onChange={e => setSizeZ(Number(e.target.value))} className="ml-2" />
                <span className="ml-2 text-white">Z: {sizeZ.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex items-center">
                <input type="checkbox" checked={sizeAudioReactive} onChange={e => setSizeAudioReactive(e.target.checked)} id="size-audio-reactive" />
                <label htmlFor="size-audio-reactive" className="ml-2 text-white">Audio-Reactive Size</label>
              </div>
              <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setEditingOption(null)}>Close</button>
            </div>
          )}
          {editingOption === 'shape' && (
            <div className="fixed top-1/2 left-1/2 z-50 bg-gray-900 p-4 rounded shadow-xl" style={{ transform: 'translate(-50%, -50%)', minWidth: 320, color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
              <label className="block mb-2 text-white">Shape</label>
              <select value={shape} onChange={e => setShape(e.target.value)} className="bg-gray-800 text-white rounded p-2">
                <option value="box">Box</option>
                <option value="cylinder">Cylinder</option>
                <option value="sphere">Sphere</option>
                <option value="torus">Torus</option>
                <option value="cone">Cone</option>
                <option value="morph">Morph (multi-shape)</option>
              </select>
              <div className="mt-4">
                <label className="block text-white mb-1">Morph</label>
                <input type="range" min={0} max={1} step={0.01} value={shapeMorph} onChange={e => setShapeMorph(Number(e.target.value))} />
                <span className="ml-2 text-white">{shapeMorph.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex items-center">
                <input type="checkbox" checked={audioReactiveMorph} onChange={e => setAudioReactiveMorph(e.target.checked)} id="audio-morph" />
                <label htmlFor="audio-morph" className="ml-2 text-white">Audio-Reactive Morphing</label>
              </div>
              <div className="mt-2 flex items-center">
                <input type="checkbox" checked={audioReactiveColor} onChange={e => setAudioReactiveColor(e.target.checked)} id="audio-color" />
                <label htmlFor="audio-color" className="ml-2 text-white">Audio-Reactive Color</label>
              </div>
              <div className="mt-2 flex items-center">
                <input type="checkbox" checked={audioReactiveSize} onChange={e => setAudioReactiveSize(e.target.checked)} id="audio-size" />
                <label htmlFor="audio-size" className="ml-2 text-white">Audio-Reactive Size</label>
              </div>
              <div className="mt-4">
                <label className="block text-white mb-1">Audio Band</label>
                <select value={audioBand} onChange={e => setAudioBand(e.target.value as 'bass' | 'mid' | 'treble')} className="bg-gray-800 text-white rounded p-2">
                  <option value="bass">Bass</option>
                  <option value="mid">Mid</option>
                  <option value="treble">Treble</option>
                </select>
              </div>
              <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setEditingOption(null)}>Close</button>
            </div>
          )}
          {editingOption === 'count' && (
            <div className="fixed top-1/2 left-1/2 z-50 bg-gray-900 p-4 rounded shadow-xl" style={{ transform: 'translate(-50%, -50%)', minWidth: 320, color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
              <label className="block mb-2 text-white">Count</label>
              <input type="range" min={4} max={128} step={1} value={count} onChange={e => setCount(Number(e.target.value))} />
              <span className="ml-2 text-white">{count}</span>
              <div className="mt-4 flex items-center">
                <input type="checkbox" checked={countAuto} onChange={e => setCountAuto(e.target.checked)} id="count-auto" />
                <label htmlFor="count-auto" className="ml-2 text-white">Auto Count (audio complexity/BPM)</label>
                <button className="ml-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setCount(Math.floor(Math.random() * 125) + 4)}>Randomize</button>
              </div>
              <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setEditingOption(null)}>Close</button>
            </div>
          )}
          {editingOption === 'lighting' && (
            <div className="fixed top-1/2 left-1/2 z-50 bg-gray-900 p-4 rounded shadow-xl" style={{ transform: 'translate(-50%, -50%)', minWidth: 320, color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
              <label className="block mb-2 text-white">Lights</label>
              {lights.map((light, idx) => (
                <div key={idx} className="mb-2 flex items-center">
                  <input type="color" value={light.color} onChange={e => {
                    const newLights = [...lights];
                    newLights[idx].color = e.target.value;
                    setLights(newLights);
                  }} />
                  <input type="range" min={0.1} max={2} step={0.01} value={light.intensity} onChange={e => {
                    const newLights = [...lights];
                    newLights[idx].intensity = Number(e.target.value);
                    setLights(newLights);
                  }} className="ml-2" />
                  <span className="ml-2 text-white">{light.intensity.toFixed(2)}</span>
                  <button className="ml-2 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setLights(lights.filter((_, i) => i !== idx))}>Remove</button>
                </div>
              ))}
              <button className="px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setLights([...lights, { color: '#ffffff', intensity: 1, position: [0, 20, 20] }])}>Add Light</button>
              <div className="mt-4 flex items-center">
                <input type="checkbox" checked={shadows} onChange={e => setShadows(e.target.checked)} id="shadows" />
                <label htmlFor="shadows" className="ml-2 text-white">Enable Shadows</label>
              </div>
              <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setEditingOption(null)}>Close</button>
            </div>
          )}
          {editingOption === 'background' && (
            <div className="fixed top-1/2 left-1/2 z-50 bg-gray-900 p-4 rounded shadow-xl" style={{ transform: 'translate(-50%, -50%)', minWidth: 320, color: themeStyles.color, background: themeStyles.background, borderColor: themeStyles.color }}>
              <label className="block mb-2 text-white">Background Color</label>
              <input type="color" value={typeof background === 'string' ? background : '#23253a'} onChange={e => setBackground(e.target.value)} />
              <div className="mt-4">
                <label className="block text-white mb-1">Background Image</label>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setBackgroundImage(ev.target?.result ? String(ev.target.result) : '');
                    reader.readAsDataURL(file);
                  }
                }} />
                {backgroundImage && <img src={typeof backgroundImage === 'string' ? backgroundImage : ''} alt="bg" className="mt-2 max-w-xs max-h-32 rounded" />}
              </div>
              <div className="mt-4">
                <label className="block text-white mb-1">Background Animation</label>
                <select value={typeof backgroundAnimation === 'string' ? backgroundAnimation : 'none'} onChange={e => setBackgroundAnimation(e.target.value)} className="bg-gray-800 text-white rounded p-2">
                  <option value="none">None</option>
                  <option value="gradient">Animated Gradient</option>
                  <option value="video">Video Background</option>
                </select>
              </div>
              <button className="mt-4 px-2 py-1 bg-gray-700 rounded text-white" onClick={() => setEditingOption(null)}>Close</button>
            </div>
          )}
          {/* Visualizer center */}
          <div className="flex flex-col items-center w-full justify-center" style={{maxWidth: '400px'}}>
            <div
              ref={visualizerRef}
              id="visualizer-canvas"
              className="bg-rc20-navy/80 rounded-xl border-4 shadow-2xl flex items-center justify-center"
              style={{ aspectRatio: '1080 / 1350', width: '100%', maxWidth: '400px', height: 'auto', borderColor: themeStyles.color }}
              aria-label="Visualizer display"
              role="region"
            ></div>
            {/* Playback controls directly below visualizer */}
            <div className="w-full flex justify-center items-center mt-1">
              <div className="w-full max-w-[400px] mx-auto">
                <PlaybackControls ref={audioElementRef} />
              </div>
            </div>
            {/* Footer controls (SVG black buttons) in a single row, minimal gap */}
            <div className="w-full flex justify-center items-center mt-2">
              <div className="flex flex-row gap-2 w-full max-w-[400px] justify-center mx-auto">
                <ButtonSVG src="/knobs/black-button.svg" label="LOAD" width={90} height={36} />
                <ButtonSVG src="/knobs/black-button.svg" label="SAVE" width={90} height={36} />
                <ButtonSVG src="/knobs/black-button.svg" label="PRESET" width={90} height={36} />
                <ButtonSVG src="/knobs/black-button.svg" label="EXPORT" width={90} height={36} onClick={handleExportClick} />
              </div>
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
              <section className="flex flex-col gap-3 p-2 px-4 py-4 rounded-lg border text-base shadow-lg items-stretch"
                style={{ minWidth: 0, background: themeStyles.background, color: panelTextColor, borderColor: themeStyles.color }}>
                <VisualizerControls />
                <div className="flex flex-row gap-1 w-full justify-end">
                  <div style={{ width: '100%' }}>
                    <RandomizeSeedButton onRandomize={randomizeAll} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 