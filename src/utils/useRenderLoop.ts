import { useEffect, useRef } from 'react';

export function useRenderLoop(callback: () => void) {
  const frame = useRef<number>();

  useEffect(() => {
    const loop = () => {
      callback();
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [callback]);
} 