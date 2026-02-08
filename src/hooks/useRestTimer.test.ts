import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRestTimer } from './useRestTimer';

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the given duration when active', () => {
    const { result } = renderHook(() => useRestTimer(90, true));

    expect(result.current.remaining).toBe(90);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.display).toBe('1:30');
  });

  it('counts down every second', () => {
    const { result } = renderHook(() => useRestTimer(5, true));

    expect(result.current.remaining).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(4);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(2);
  });

  it('stops at 0 and sets isRunning to false', () => {
    const { result } = renderHook(() => useRestTimer(3, true));

    expect(result.current.remaining).toBe(3);
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);

    // Should not go below 0
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('dismiss() stops the timer immediately', () => {
    const { result } = renderHook(() => useRestTimer(90, true));

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remaining).toBe(90);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.remaining).toBe(0);
    expect(result.current.display).toBe('0:00');
  });

  it('does not start when isActive is false', () => {
    const { result } = renderHook(() => useRestTimer(90, false));

    expect(result.current.isRunning).toBe(false);

    // Timer should not count down even after time passes
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('formats countdown display correctly', () => {
    const { result } = renderHook(() => useRestTimer(185, true));

    // 185 seconds = 3:05
    expect(result.current.display).toBe('3:05');
  });
});
