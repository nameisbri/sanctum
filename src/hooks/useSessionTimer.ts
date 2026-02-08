import { useState, useEffect, useCallback } from 'react';

function formatElapsed(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function useSessionTimer(startTime: number) {
  const [seconds, setSeconds] = useState(() =>
    Math.floor((Date.now() - startTime) / 1000)
  );
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, paused]);

  const pause = useCallback(() => {
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    setPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    if (paused) {
      resume();
    } else {
      pause();
    }
  }, [paused, pause, resume]);

  return {
    elapsed: formatElapsed(seconds),
    seconds,
    paused,
    togglePause,
  };
}
