import { create } from 'zustand';

export type VisualMode = 'classic' | 'bars' | 'waves' | 'particles' | 'spiral' | 'radial' | 'sphere' | 'tunnel' | 'grid' | 'ribbon' | 'blob' | 'galaxy' | 'dna' | 'liquid' | 'orbitals' | 'fractal' | 'polygon' | 'wavegrid' | 'textdeform' | 'aurora'

interface AppState {
  audioFile: File | null;
  seed: string | null;
  visualMode: VisualMode;
  intensity: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  isExporting: boolean;
  setAudioFile: (file: File) => void;
  setSeed: (seed: string) => void;
  setVisualMode: (mode: VisualMode) => void;
  setIntensity: (intensity: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setIsExporting: (exporting: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  audioFile: null,
  seed: null,
  visualMode: 'classic',
  intensity: 1,
  isPlaying: false,
  isFullscreen: false,
  isExporting: false,
  setAudioFile: (file) => set({ audioFile: file }),
  setSeed: (seed) => set({ seed }),
  setVisualMode: (visualMode) => set({ visualMode }),
  setIntensity: (intensity) => set({ intensity }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setIsExporting: (isExporting) => set({ isExporting }),
  reset: () => set({
    audioFile: null,
    seed: null,
    visualMode: 'classic',
    intensity: 1,
    isPlaying: false,
    isFullscreen: false,
    isExporting: false,
  }),
})); 