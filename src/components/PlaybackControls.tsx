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
    <div className="mt-4 w-full max-w-2xl mx-auto px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md shadow-lg flex flex-col gap-2">
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div className="flex items-center gap-4 w-full">
        {/* Stop Button */}
        <button
          className="rounded-full w-9 h-9 bg-rc20-navy hover:bg-rc20-beige transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-rc20-orange"
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
          className="rounded-full w-9 h-9 bg-rc20-navy hover:bg-rc20-beige transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-rc20-orange"
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
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-rc20-orange h-2 rounded-lg bg-gray-300/30 transition-all"
            disabled={!audioFile}
            aria-label="Seek audio"
          />
          <span className="text-xs text-gray-300 font-mono min-w-[70px] text-right">
            {formatTime(Math.max(0, duration - currentTime))}
          </span>
        </div>
        {/* Volume Button */}
        <button
          className="rounded-full w-9 h-9 bg-rc20-navy hover:bg-rc20-beige transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-rc20-orange"
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
      </div>
      {/* Playlist Area - integrated below controls */}
      <div className="w-full mt-2">
        <div className="w-full bg-gray-900/90 border-t border-gray-700 p-0 flex flex-col items-center shadow-2xl backdrop-blur-md" style={{boxShadow:'0 0 32px #23253a99, 0 2px 16px #38bdf822', borderTopLeftRadius: '18px', borderTopRightRadius: '18px'}}>
          <div className="flex items-center gap-2 py-2 px-4 w-full justify-between" style={{maxWidth:'700px'}}>
            <div className="flex items-center gap-2">
              <button onClick={onPrev} title="Previous" className="p-1 hover:bg-gray-800 rounded-full transition-all">
                <img src="/knobs/previous-button.svg" alt="Previous" className="w-8 h-8" />
              </button>
              <button onClick={onNext} title="Next" className="p-1 hover:bg-gray-800 rounded-full transition-all">
                <img src="/knobs/next-button.svg" alt="Next" className="w-8 h-8" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition-all font-semibold text-sm"
              >
                Upload Songs
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files) onUpload(e.target.files);
                  e.target.value = '';
                }}
                disabled={playlist.length >= 20}
              />
              <span className="ml-2 text-xs text-gray-400 font-mono">{playlist.length}/20</span>
            </div>
          </div>
          <div className="w-full max-w-2xl px-2 pb-2">
            <div className="overflow-y-auto h-36 rounded-lg bg-gray-800/80 shadow-inner border border-gray-700" style={{scrollbarWidth:'thin', scrollbarColor:'#38bdf8 #23253a'}}>
              <ul className="flex flex-col gap-1 py-2 px-2">
                {playlist.length === 0 && (
                  <li className="text-gray-500 text-center py-8 select-none">No songs uploaded. Click Upload Songs to add music!</li>
                )}
                {playlist.map((track, idx) => (
                  <li
                    key={track.url}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all font-mono text-base ${idx === currentIndex ? 'bg-blue-700/90 text-white shadow-lg ring-2 ring-blue-400' : 'bg-gray-900/60 text-gray-200 hover:bg-gray-700/80 hover:text-blue-300'}`}
                    onClick={() => onSelect(idx)}
                    title={track.name}
                    style={{userSelect:'none', letterSpacing:'0.02em', fontWeight: idx === currentIndex ? 700 : 500}}
                  >
                    <span className="truncate" style={{maxWidth:'320px'}}>{track.name.length > 40 ? track.name.slice(0, 37) + '...' : track.name}</span>
                    {idx === currentIndex && <span className="ml-auto text-xs text-blue-200 animate-pulse">Now Playing</span>}
                  </li>
                ))}
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