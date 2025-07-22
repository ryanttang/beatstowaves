import React, { useRef } from 'react';

interface PlaylistTrack {
  name: string;
  file: File;
  url: string;
}

interface PlaylistPanelProps {
  playlist: PlaylistTrack[];
  currentIndex: number;
  onUpload: (files: FileList) => void;
  onSelect: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PlaylistPanel: React.FC<PlaylistPanelProps> = ({
  playlist,
  currentIndex,
  onUpload,
  onSelect,
  onNext,
  onPrev,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
  );
};

export type { PlaylistTrack };
export default PlaylistPanel; 