import { useState, useEffect, useCallback } from 'react';

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function useRestTimer(durationSeconds: number, isActive: boolean) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isActive) {
      setRemaining(durationSeconds);
      setIsRunning(true);
    }
  }, [isActive, durationSeconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      if (remaining <= 0) setIsRunning(false);
      return;
    }

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const dismiss = useCallback(() => {
    setIsRunning(false);
    setRemaining(0);
  }, []);

  return {
    remaining,
    display: formatCountdown(remaining),
    isRunning,
    dismiss,
  };
}
