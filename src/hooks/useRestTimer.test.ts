import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRestTimer } from './useRestTimer';
import { RestTimerState } from '../types';

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns inactive state when timerState is null', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRestTimer(null, onComplete));

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.display).toBe('0:00');
    expect(result.current.exerciseIndex).toBe(-1);
    expect(result.current.setIndex).toBe(-1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('computes remaining from startedAt + duration', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 1,
      startedAt: now,
      duration: 90,
    };

    const { result } = renderHook(() => useRestTimer(timer, onComplete));

    expect(result.current.remaining).toBe(90);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.display).toBe('1:30');
    expect(result.current.exerciseIndex).toBe(0);
    expect(result.current.setIndex).toBe(1);
  });

  it('counts down accurately using timestamp math', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 0,
      startedAt: now,
      duration: 5,
    };

    const { result } = renderHook(() => useRestTimer(timer, onComplete));
    expect(result.current.remaining).toBe(5);

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining).toBe(3);

    // Advance 2 more seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining).toBe(1);
  });

  it('fires onComplete when timer reaches 0', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 0,
      startedAt: now,
      duration: 3,
    };

    const { result } = renderHook(() => useRestTimer(timer, onComplete));
    expect(result.current.remaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows 0 immediately for an expired timer (startedAt far in the past)', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 0,
      startedAt: now - 200_000, // 200 seconds ago
      duration: 90,
    };

    const { result } = renderHook(() => useRestTimer(timer, onComplete));

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not go below 0', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 0,
      startedAt: now,
      duration: 2,
    };

    const { result } = renderHook(() => useRestTimer(timer, onComplete));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remaining).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('formats countdown display correctly', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 0,
      startedAt: now,
      duration: 185,
    };

    const { result } = renderHook(() => useRestTimer(timer, onComplete));
    // 185 seconds = 3:05
    expect(result.current.display).toBe('3:05');
  });

  it('resets when timerState changes to a new timer', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer1: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 0,
      startedAt: now,
      duration: 90,
    };

    const { result, rerender } = renderHook(
      ({ timer, cb }) => useRestTimer(timer, cb),
      { initialProps: { timer: timer1 as RestTimerState | null, cb: onComplete } }
    );

    // Advance 30 seconds
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.remaining).toBe(60);

    // Start a new timer
    const newNow = Date.now();
    const timer2: RestTimerState = {
      exerciseIndex: 1,
      setIndex: 0,
      startedAt: newNow,
      duration: 120,
    };

    rerender({ timer: timer2, cb: onComplete });

    // Should reset to the new timer's duration
    expect(result.current.remaining).toBe(120);
    expect(result.current.exerciseIndex).toBe(1);
  });

  it('clears when timerState becomes null', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const onComplete = vi.fn();
    const timer: RestTimerState = {
      exerciseIndex: 0,
      setIndex: 0,
      startedAt: now,
      duration: 90,
    };

    const { result, rerender } = renderHook(
      ({ timer, cb }) => useRestTimer(timer, cb),
      { initialProps: { timer: timer as RestTimerState | null, cb: onComplete } }
    );

    expect(result.current.isRunning).toBe(true);

    rerender({ timer: null, cb: onComplete });

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });
});
