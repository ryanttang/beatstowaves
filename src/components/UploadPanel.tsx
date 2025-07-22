import React, { useRef, useState } from 'react';
import { useAppStore } from '../store';
import { hashAudioFile, getSeedFromHash } from '../utils/SeedGenerator';

const MAX_FILE_SIZE_MB = 20;

const UploadPanel: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const setAudioFile = useAppStore(s => s.setAudioFile);
  const setSeed = useAppStore(s => s.setSeed);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large (max ${MAX_FILE_SIZE_MB}MB).`);
      return;
    }
    setError(null);
    setFileName(file.name);
    setAudioFile(file);
    const hash = await hashAudioFile(file);
    setSeed(getSeedFromHash(hash));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="border-2 border-dashed border-gray-500 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-800 transition mb-4"
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="text-lg">Click or drag audio file here</div>
      {fileName && <div className="mt-2 text-green-400">{fileName}</div>}
      {error && <div className="mt-2 text-red-400">{error}</div>}
    </div>
  );
};

export default UploadPanel; 