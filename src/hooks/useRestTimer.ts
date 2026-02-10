import { useState, useEffect, useRef } from 'react';
import { RestTimerState } from '../types';

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function computeRemaining(timerState: RestTimerState | null, now: number): number {
  if (!timerState) return 0;
  const elapsed = (now - timerState.startedAt) / 1000;
  return Math.max(0, Math.ceil(timerState.duration - elapsed));
}

export function useRestTimer(
  timerState: RestTimerState | null,
  onComplete: () => void
) {
  const [remaining, setRemaining] = useState(() =>
    computeRemaining(timerState, Date.now())
  );

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const firedRef = useRef(false);

  // Reset when a new timer starts (new startedAt) or timer is cleared
  useEffect(() => {
    const now = Date.now();
    const r = computeRemaining(timerState, now);
    setRemaining(r);

    if (!timerState) {
      firedRef.current = false;
      return;
    }

    // If already expired on mount, fire onComplete immediately
    if (r <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onCompleteRef.current();
      }
      return;
    }

    firedRef.current = false;

    const interval = setInterval(() => {
      const rem = computeRemaining(timerState, Date.now());
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(interval);
        if (!firedRef.current) {
          firedRef.current = true;
          onCompleteRef.current();
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [timerState?.startedAt, timerState?.duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    remaining,
    display: formatCountdown(remaining),
    isRunning: timerState != null && remaining > 0,
    exerciseIndex: timerState?.exerciseIndex ?? -1,
    setIndex: timerState?.setIndex ?? -1,
  };
}
