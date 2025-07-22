import React, { useEffect, useRef, useState, useCallback } from 'react';
import UploadPanel from './components/UploadPanel';
import VisualizerControls from './components/VisualizerControls';
import ExportPanel from './components/ExportPanel';
import PlaybackControls from './components/PlaybackControls';
import { useAppStore } from './store';
import { VisualizerEngine } from './engine/VisualizerEngine';
import { AudioAnalyzer } from './audio/AudioAnalyzer';
import Knob from './components/Knob';
import { ButtonSVG } from './components/KnobSVG';

const DEFAULT_SEED = 'default-seed-visualizer';

const SeedDisplay = () => {
  const seed = useAppStore(s => s.seed);
  return (
    <div className="mt-2 text-xs text-gray-400">Seed: {seed || '—'}</div>
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

  // Set a default seed on first mount if none is set
  useEffect(() => {
    if (!seed) setSeed(DEFAULT_SEED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rc20-navy">
      <div className="rc20-panel w-full max-w-4xl p-6 flex flex-col gap-4 items-center">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2 w-full">
          <div className="text-2xl font-bold tracking-widest text-rc20-navy">RC-20 AUDIO VISUALIZER</div>
          <div className="text-xs text-rc20-navy opacity-60">Inspired by XLN Audio</div>
        </div>
        {/* Visualizer screen */}
        <div className="flex justify-center w-full mb-4">
          <div
            ref={visualizerRef}
            id="visualizer-canvas"
            className="w-full max-w-2xl h-56 bg-rc20-navy rounded-xl border-4 border-rc20-beige shadow-lg flex items-center justify-center"
            style={{ minHeight: '220px' }}
          ></div>
        </div>
        {/* Effect modules row (SVG buttons, updated to new assets) */}
        <div className="flex flex-row gap-3 justify-between mb-2 w-full">
          <ButtonSVG src="/knobs/button-orange.svg" label="NOISE" />
          <ButtonSVG src="/knobs/button-yellow.svg" label="WOBBLE" />
          <ButtonSVG src="/knobs/button-lime.svg" label="DISTORT" />
          <ButtonSVG src="/knobs/button-lightblue.svg" label="DIGITAL" />
          <ButtonSVG src="/knobs/button-blue.svg" label="SPACE" />
          <ButtonSVG src="/knobs/button-purple.svg" label="MAGNETIC" />
        </div>
        {/* Knobs row (integrated) */}
        <div className="flex flex-row gap-8 justify-between items-end py-6">
          <Knob value={noise} onChange={setNoise} label="NOISE" color="#e07a3f" />
          <Knob value={wobble} onChange={setWobble} label="WOBBLE" color="#e6c15c" />
          <Knob value={distort} onChange={setDistort} label="DISTORT" color="#4bbf8b" />
          <Knob value={digital} onChange={setDigital} label="DIGITAL" color="#3bb6b0" />
          <Knob value={space} onChange={setSpace} label="SPACE" color="#4a90e2" />
          <Knob value={magnetic} onChange={setMagnetic} label="MAGNETIC" color="#23253a" />
        </div>
        {/* Footer controls (SVG black buttons) */}
        <div className="flex flex-row gap-4 items-center justify-between mt-2">
          <div className="flex gap-2 items-center">
            <ButtonSVG src="/knobs/black-button.svg" label="LOAD" width={120} height={48} />
            <ButtonSVG src="/knobs/black-button.svg" label="SAVE" width={120} height={48} />
          </div>
          <div className="flex-1 text-center text-rc20-navy text-xs opacity-60">Magnitude</div>
          <div className="flex gap-2 items-center">
            <ButtonSVG src="/knobs/black-button.svg" label="PRESET" width={120} height={48} />
            <ButtonSVG src="/knobs/black-button.svg" label="SETTINGS" width={120} height={48} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 