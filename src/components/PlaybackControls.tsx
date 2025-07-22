import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useAppStore } from '../store';
import Knob from './Knob';

// Remove PlayIcon, PauseIcon, VolumeIcon, MuteIcon components

const PlaybackControls = forwardRef<HTMLAudioElement, {}>((props, ref) => {
  const isPlaying = useAppStore(s => s.isPlaying);
  const setIsPlaying = useAppStore(s => s.setIsPlaying);
  const audioFile = useAppStore(s => s.audioFile);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [muted, setMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
            {formatTime(currentTime)} / {formatTime(duration)}
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
    </div>
  );
});

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default PlaybackControls; 