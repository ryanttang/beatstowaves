import React from 'react';
import { MutableRefObject, RefObject } from 'react';
import { PlaylistTrack } from '../PlaylistPanel';
import KnobGrid from './KnobGrid';
import ControlButtonRow from './ControlButtonRow';
import { VisualizerEngine } from '../../engine/VisualizerEngine';
import { AudioAnalyzer } from '../../audio/AudioAnalyzer';
import SongInfoConsoleOverlay from '../SongInfoConsoleOverlay';
import PlaybackControls from '../PlaybackControls';
import VisualizerControls from '../VisualizerControls';
import ThemeSwitcher from './ThemeSwitcher';
import VizWizLogo from './VizWizLogo';
import LeftPanel from './LeftPanel';

interface MainPanelProps {
  visualizerRef: RefObject<HTMLDivElement>;
  engineRef: MutableRefObject<VisualizerEngine | null>;
  audioElementRef: RefObject<HTMLAudioElement>;
  playlist: PlaylistTrack[];
  currentTrack: number;
  handleUpload: (files: FileList) => void;
  handleSelect: (idx: number) => void;
  handleNext: () => void;
  handlePrev: () => void;
  noise: number;
  setNoise: (n: number) => void;
  wobble: number;
  setWobble: (n: number) => void;
  distort: number;
  setDistort: (n: number) => void;
  digital: number;
  setDigital: (n: number) => void;
  space: number;
  setSpace: (n: number) => void;
  magnetic: number;
  setMagnetic: (n: number) => void;
  randomizeAll: () => void;
  theme: string;
  themeStyles: any;
  panelTextColor: string;
  songName: string;
  artistName: string;
  isFullscreen: boolean;
  handleFullscreen: () => void;
  handleExportClick: () => void;
  setEditingOption: (option: string | null) => void;
  setTheme: (theme: string) => void;
}

const MainPanel: React.FC<MainPanelProps> = ({
  visualizerRef,
  engineRef,
  audioElementRef,
  playlist,
  currentTrack,
  handleUpload,
  handleSelect,
  handleNext,
  handlePrev,
  noise,
  setNoise,
  wobble,
  setWobble,
  distort,
  setDistort,
  digital,
  setDigital,
  space,
  setSpace,
  magnetic,
  setMagnetic,
  randomizeAll,
  theme,
  themeStyles,
  panelTextColor,
  songName,
  artistName,
  isFullscreen,
  handleFullscreen,
  handleExportClick,
  setEditingOption,
  setTheme
}) => (
  <div
    className="rc20-panel max-w-4xl p-4 flex flex-col gap-4 items-center justify-center rounded-2xl shadow-2xl relative"
    style={{
      background: themeStyles.background,
      color: themeStyles.color,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      transition: 'margin-left 0.3s',
    }}
  >
    <ThemeSwitcher theme={theme} setTheme={setTheme} themeStyles={themeStyles} />
    <VizWizLogo theme={theme} />
    <div className="w-full flex justify-center items-center mb-1 gap-4 max-w-[900px]" style={{ marginTop: '72px' }}>
      <LeftPanel setEditingOption={setEditingOption} handleExportClick={handleExportClick} />
      {/* Visualizer center */}
      <div className="flex flex-col items-center w-full justify-center" style={{maxWidth: '400px', aspectRatio: '1080/1350', height: 'auto'}}>
        <div
          ref={visualizerRef}
          id="visualizer-canvas"
          className="bg-rc20-navy/80 rounded-xl border-4 shadow-2xl flex items-center justify-center"
          style={{ aspectRatio: '1080/1350', width: '100%', maxWidth: '400px', height: 'auto', borderColor: themeStyles.color, position: 'relative' }}
          aria-label="Visualizer display"
          role="region"
        >
          {/* Song info overlay (console style) INSIDE visualizer */}
          <SongInfoConsoleOverlay songName={songName} artistName={artistName} />
        </div>
        {/* Playback controls directly below visualizer */}
        <div className="w-full flex justify-center items-center mt-3">
          <div className="w-full" style={{ maxWidth: '400px', aspectRatio: '1080/1350', height: 'auto' }}>
            <PlaybackControls
              ref={audioElementRef}
              playlist={playlist}
              currentIndex={currentTrack}
              onUpload={handleUpload}
              onSelect={handleSelect}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          </div>
        </div>
      </div>
      {/* Right column: Knobs grid and VisualizerControls stacked */}
      <div className="flex flex-col items-center justify-start gap-4" style={{ maxHeight: '1350px' }}>
        <ControlButtonRow
          visualizerRef={visualizerRef}
          isFullscreen={isFullscreen}
          handleFullscreen={handleFullscreen}
          handleExportClick={handleExportClick}
          randomizeAll={randomizeAll}
        />
        <KnobGrid
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
          theme={theme}
        />
        <div className="w-full" style={{ maxWidth: '280px', minWidth: '220px' }}>
          <section className="flex flex-col gap-3 p-2 px-4 py-4 rounded-lg text-base shadow-lg items-stretch"
            style={{ minWidth: '0', background: String(themeStyles.background), color: String(panelTextColor) }}>
            <VisualizerControls background={String(themeStyles.background)} color={String(panelTextColor)} theme={theme} />
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default MainPanel; 