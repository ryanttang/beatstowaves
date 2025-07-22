import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useAppStore } from '../store';
import Knob from './Knob';

interface PlaylistTrack {
  name: string;
  file: File;
  url: string;
}

interface PlaybackControlsProps {
  playlist: PlaylistTrack[];
  currentIndex: number;
  onUpload: (files: FileList) => void;
  onSelect: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PlaybackControls = forwardRef<HTMLAudioElement, PlaybackControlsProps>(({
  playlist,
  currentIndex,
  onUpload,
  onSelect,
  onNext,
  onPrev
}, ref) => {
  const isPlaying = useAppStore(s => s.isPlaying);
  const setIsPlaying = useAppStore(s => s.setIsPlaying);
  const audioFile = useAppStore(s => s.audioFile);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [muted, setMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement, []);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
      return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setMuted(false);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  // Keyboard accessibility for play/pause (space/enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handlePlayPause();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-5 rounded-2xl bg-white/15 backdrop-blur-xl shadow-2xl flex flex-col gap-4 border border-white/20" style={{boxShadow:'0 8px 32px 0 #23253a55, 0 2px 16px #38bdf822', minWidth: 320}}>
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      {/* Top Row: Playback Controls */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-2">
          {/* Stop Button */}
          <button
            className="rounded-full w-11 h-11 bg-white/10 hover:bg-blue-400/30 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-300 border border-white/30"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.pause();
                setIsPlaying(false);
                setCurrentTime(0);
              }
            }}
            aria-label="Stop"
            disabled={!audioFile}
          >
            <img src="/knobs/stop-button.svg" alt="Stop" className="w-full h-full object-contain" />
          </button>
          {/* Play/Pause Button */}
          <button
            className="rounded-full w-14 h-14 bg-blue-500/80 hover:bg-blue-400/90 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 border-2 border-white/40 flex items-center justify-center"
            onClick={handlePlayPause}
            onKeyDown={handleKeyDown}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={!audioFile}
          >
            <img
              src={isPlaying ? "/knobs/pause-button.svg" : "/knobs/play-button.svg"}
              alt={isPlaying ? "Pause" : "Play"}
              className="w-full h-full object-contain"
            />
          </button>
        </div>
        {/* Progress Bar and Time */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="flex items-center w-full gap-2">
            <span className="text-xs text-gray-200 font-mono min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-blue-400 h-2 rounded-full bg-white/30 transition-all shadow-inner outline-none"
              disabled={!audioFile}
              aria-label="Seek audio"
              style={{ minWidth: 80 }}
            />
            <span className="text-xs text-gray-200 font-mono min-w-[40px] text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
      {/* Playlist Area */}
      <div className="w-full mt-2">
        <div className="w-full bg-white/10 border border-white/20 rounded-2xl shadow-xl backdrop-blur-xl flex flex-col items-center" style={{boxShadow:'0 6px 32px 0 #23253a33, 0 1.5px 8px 0 #38bdf822', minHeight: 120}}>
          <div className="flex items-center gap-2 py-2 px-4 w-full justify-between rounded-t-2xl bg-white/10 border-b border-white/20 shadow" style={{maxWidth:'700px'}}>
            <div className="flex items-center gap-2">
              <button onClick={onPrev} title="Previous" className="p-1 hover:bg-blue-400/20 rounded-full transition-all focus:outline-none">
                <img src="/knobs/previous-button.svg" alt="Previous" className="w-8 h-8" />
              </button>
              <button onClick={onNext} title="Next" className="p-1 hover:bg-blue-400/20 rounded-full transition-all focus:outline-none">
                <img src="/knobs/next-button.svg" alt="Next" className="w-8 h-8" />
              </button>
              {/* Volume Controls moved here */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  className="rounded-full w-9 h-9 bg-white/10 hover:bg-blue-400/30 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-300 border border-white/30"
                  onClick={handleMute}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  disabled={!audioFile}
                >
                  <img
                    src="/knobs/volume-button.svg"
                    alt={muted || volume === 0 ? 'Muted' : 'Volume'}
                    className="w-full h-full object-contain"
                    style={{ opacity: muted || volume === 0 ? 0.5 : 1 }}
                  />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={e => handleVolumeChange(Number(e.target.value))}
                  className="accent-blue-400 h-2 w-20 rounded-full bg-white/30 transition-all shadow-inner outline-none"
                  disabled={!audioFile}
                  aria-label="Volume"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="ml-2 text-xs text-gray-300 font-mono">{playlist.length}/20</span>
            </div>
          </div>
          <div className="w-full max-w-2xl px-2 pb-2">
            <div className="overflow-y-auto h-36 rounded-xl bg-[#23253acc] backdrop-blur-md border border-white/25 shadow-inner flex items-center justify-center" style={{boxShadow:'0 6px 32px 0 #23253a22, 0 1.5px 8px 0 #38bdf822', scrollbarWidth:'thin', scrollbarColor:'#38bdf8 #23253a'}}>
              <ul className="flex flex-col gap-1 py-2 px-2 w-full h-full justify-center items-center">
                {playlist.length === 0 ? (
                  <li className="text-gray-100 text-center select-none text-base font-semibold flex flex-col items-center justify-center gap-2 w-full py-8" style={{fontWeight:600, letterSpacing:'0.01em', textShadow:'0 1px 4px #23253a88'}}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto text-blue-200/90"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6h8m0 0l-4 4m4-4l-4-4" /></svg>
                    <span>No songs uploaded.<br/><span className="font-bold text-blue-100">Load Tracks</span> to add music!</span>
                  </li>
                ) : (
                  playlist.map((track, idx) => (
                    <li
                      key={track.url}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all font-mono text-base ${idx === currentIndex ? 'bg-blue-700/90 text-white shadow-lg ring-2 ring-blue-400' : 'bg-gray-900/60 text-gray-200 hover:bg-blue-400/20 hover:text-blue-700'}`}
                      onClick={() => onSelect(idx)}
                      title={track.name}
                      style={{userSelect:'none', letterSpacing:'0.02em', fontWeight: idx === currentIndex ? 700 : 500}}
                    >
                      <span className="truncate" style={{maxWidth:'320px'}}>{track.name.length > 40 ? track.name.slice(0, 37) + '...' : track.name}</span>
                      {idx === currentIndex && <span className="ml-auto text-xs text-blue-200 animate-pulse">Now Playing</span>}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default PlaybackControls; 