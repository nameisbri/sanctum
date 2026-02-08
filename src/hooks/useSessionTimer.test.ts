import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionTimer } from './useSessionTimer';

describe('useSessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns formatted elapsed time from a known start time', () => {
    const now = 1700000000000;
    const startTime = now - 125000; // 125 seconds ago = 2:05
    vi.setSystemTime(new Date(now));

    const { result } = renderHook(() => useSessionTimer(startTime));

    expect(result.current.seconds).toBe(125);
    expect(result.current.elapsed).toBe('02:05');
  });

  it('returns 00:00 when start time equals current time', () => {
    const now = 1700000000000;
    vi.setSystemTime(new Date(now));

    const { result } = renderHook(() => useSessionTimer(now));

    expect(result.current.seconds).toBe(0);
    expect(result.current.elapsed).toBe('00:00');
  });

  it('formats hours correctly when elapsed exceeds 3600 seconds', () => {
    const now = 1700000000000;
    const startTime = now - 3661000; // 3661 seconds = 1h 1m 1s
    vi.setSystemTime(new Date(now));

    const { result } = renderHook(() => useSessionTimer(startTime));

    expect(result.current.seconds).toBe(3661);
    expect(result.current.elapsed).toBe('1:01:01');
  });

  it('formats multi-hour sessions correctly', () => {
    const now = 1700000000000;
    const startTime = now - 7384000; // 7384 seconds = 2h 3m 4s
    vi.setSystemTime(new Date(now));

    const { result } = renderHook(() => useSessionTimer(startTime));

    expect(result.current.seconds).toBe(7384);
    expect(result.current.elapsed).toBe('2:03:04');
  });

  it('updates every second as time advances', () => {
    const startTime = 1700000000000;
    vi.setSystemTime(new Date(startTime));

    const { result } = renderHook(() => useSessionTimer(startTime));

    expect(result.current.elapsed).toBe('00:00');

    // Advance by 1 second — interval fires and reads Date.now()
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.seconds).toBe(1);
    expect(result.current.elapsed).toBe('00:01');

    // Advance by another 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.seconds).toBe(3);
    expect(result.current.elapsed).toBe('00:03');
  });

  it('pads minutes and seconds with leading zeros', () => {
    const now = 1700000000000;
    const startTime = now - 62000; // 62 seconds = 1m 2s
    vi.setSystemTime(new Date(now));

    const { result } = renderHook(() => useSessionTimer(startTime));

    expect(result.current.elapsed).toBe('01:02');
  });
});
