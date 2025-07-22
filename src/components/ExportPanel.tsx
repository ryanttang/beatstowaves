import React, { useRef, useState } from 'react';
import { useAppStore } from '../store';

function isSafariOrIOS() {
  const ua = navigator.userAgent;
  return /iP(ad|hone|od)/.test(ua) || (/Safari/.test(ua) && !/Chrome/.test(ua));
}

function isExportSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    HTMLCanvasElement.prototype.captureStream
  );
}

const ExportPanel: React.FC<{ canvasId?: string }> = ({ canvasId = 'visualizer-canvas' }) => {
  const isExporting = useAppStore(s => s.isExporting);
  const setIsExporting = useAppStore(s => s.setIsExporting);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleExport = async () => {
    setError(null);
    setDownloadUrl(null);
    const canvas = document.getElementById(canvasId)?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      setError('Visualizer canvas not found.');
      return;
    }
    if (isSafariOrIOS()) {
      setError('Export is not supported on Safari or iOS browsers.');
      return;
    }
    if (!isExportSupported()) {
      setError('Export is not supported in this browser.');
      return;
    }
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setDownloadUrl(URL.createObjectURL(blob));
      setIsExporting(false);
    };
    setIsExporting(true);
    recorder.start();
    setTimeout(() => {
      recorder.stop();
    }, 10000); // Record 10 seconds
  };

  return (
    <div className="mt-4">
      <button
        className="w-full px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 disabled:opacity-50"
        onClick={handleExport}
        disabled={isExporting || isSafariOrIOS() || !isExportSupported()}
      >
        {isExporting ? 'Exporting...' : 'Export to Video'}
      </button>
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="visualizer.webm"
          className="block mt-2 text-green-400 underline"
        >
          Download Video
        </a>
      )}
      {error && <div className="mt-2 text-red-400 text-xs">{error}</div>}
      {isSafariOrIOS() && (
        <div className="mt-2 text-yellow-400 text-xs">Export is not supported on Safari or iOS.</div>
      )}
      {!isExportSupported() && (
        <div className="mt-2 text-yellow-400 text-xs">Export is not supported in this browser.</div>
      )}
    </div>
  );
};

export default ExportPanel; 