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
import SidebarPanelManager from './components/layout/SidebarPanelManager';
import ColorPanel from './components/ColorPanel';
import SizePanel from './components/SizePanel';
import ShapePanel from './components/ShapePanel';
import CountPanel from './components/CountPanel';
import LightingPanel from './components/LightingPanel';
import BackgroundPanel from './components/BackgroundPanel';
import PlaylistPanel, { PlaylistTrack } from './components/PlaylistPanel';
import InfoMenu from './components/layout/InfoMenu';
import MainPanel from './components/layout/MainPanel';
import KnobGrid from './components/layout/KnobGrid';
import ControlButtonRow from './components/layout/ControlButtonRow';

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

  // Playlist state
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(-1);

  // Handle upload (add to playlist, max 20)
  const handleUpload = (files: FileList) => {
    const newTracks: PlaylistTrack[] = [];
    for (let i = 0; i < files.length && playlist.length + newTracks.length < 20; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newTracks.push({ name: file.name, file, url });
    }
    setPlaylist(prev => [...prev, ...newTracks]);
    if (currentTrack === -1 && newTracks.length > 0) setCurrentTrack(playlist.length); // auto-select first
  };

  // Select a track
  const handleSelect = (idx: number) => {
    setCurrentTrack(idx);
    setIsPlaying(false); // Pause before switching
    setTimeout(() => setIsPlaying(true), 100); // Play after short delay
  };

  // Next/Prev track
  const handleNext = () => {
    if (playlist.length === 0) return;
    setCurrentTrack(idx => (idx + 1) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };
  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentTrack(idx => (idx - 1 + playlist.length) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  // Set audio src when currentTrack changes
  useEffect(() => {
    if (audioElementRef.current && currentTrack >= 0 && playlist[currentTrack]) {
      audioElementRef.current.src = playlist[currentTrack].url;
      setCanPlay(false);
    }
  }, [currentTrack, playlist]);

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-gradient-to-br from-rc20-navy via-rc20-beige/30 to-rc20-navy/90">
      <InfoMenu modal={modal} setModal={setModal} showInfoRow={showInfoRow} setShowInfoRow={setShowInfoRow} />
      {/* SidebarPanel for editing options (floating console) */}
      <SidebarPanelManager
        editingOption={editingOption}
        setEditingOption={setEditingOption}
            color={color}
            setColor={setColor}
            colorGradient={colorGradient as [string, string]}
            setColorGradient={setColorGradient}
            colorPalette={colorPalette}
            setColorPalette={setColorPalette}
            colorAnimated={colorAnimated}
            setColorAnimated={setColorAnimated}
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
            count={count}
            setCount={setCount}
            countAuto={countAuto}
            setCountAuto={setCountAuto}
            lights={lights.map(l => ({ ...l, position: l.position as [number, number, number] }))}
            setLights={setLights}
            shadows={shadows}
            setShadows={setShadows}
            background={background}
            setBackground={setBackground}
        backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
        backgroundAnimation={backgroundAnimation}
            setBackgroundAnimation={setBackgroundAnimation}
            themeStyles={themeStyles}
      />
      {/* Main visualizer, knobs, and controls area modularized into MainPanel */}
      <MainPanel
        visualizerRef={visualizerRef as React.RefObject<HTMLDivElement>}
        engineRef={engineRef}
        audioElementRef={audioElementRef as React.RefObject<HTMLAudioElement>}
        playlist={playlist}
        currentTrack={currentTrack}
        handleUpload={handleUpload}
        handleSelect={handleSelect}
        handleNext={handleNext}
        handlePrev={handlePrev}
        noise={noise}
        setNoise={setNoise}
        wobble={wobble}
        setWobble={setWobble}
        distort={distort}
        setDistort={setDistort}
        digital={digital}
        setDigital={setDigital}
        space={space}
        setSpace={setSpace}
        magnetic={magnetic}
        setMagnetic={setMagnetic}
        randomizeAll={randomizeAll}
        theme={String(theme)}
        setTheme={setTheme}
        themeStyles={themeStyles}
        panelTextColor={String(panelTextColor)}
        songName={String(songName)}
        artistName={String(artistName)}
        isFullscreen={isFullscreen}
        handleFullscreen={handleFullscreen}
        handleExportClick={handleExportClick}
        setEditingOption={setEditingOption}
      />
    </div>
  );
};

export default App; 