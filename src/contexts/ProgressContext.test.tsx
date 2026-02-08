import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';
import { WorkoutLog } from '../types';
import { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

const mockLog: WorkoutLog = {
  id: 'test-1',
  date: '2025-01-15',
  cycle: 1,
  dayNumber: 1,
  dayName: 'Chest/Back',
  exercises: [
    {
      exerciseName: 'Incline Barbell Press',
      sets: [
        { setNumber: 1, weight: 135, reps: 10, completed: true },
        { setNumber: 2, weight: 135, reps: 8, completed: true },
      ],
      notes: '',
    },
  ],
  completed: true,
  totalVolume: 2430,
};

describe('ProgressContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default progress values', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    expect(result.current.progress.currentCycle).toBe(1);
    expect(result.current.progress.deloadIntervalWeeks).toBe(5);
    expect(result.current.progress.workoutLogs).toEqual([]);
  });

  it('updates cycle', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.updateCycle(3);
    });
    expect(result.current.progress.currentCycle).toBe(3);
  });

  it('adds workout log', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addWorkoutLog(mockLog);
    });
    expect(result.current.progress.workoutLogs).toHaveLength(1);
    expect(result.current.progress.workoutLogs[0].id).toBe('test-1');
  });

  it('gets last workout for day', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addWorkoutLog(mockLog);
      result.current.addWorkoutLog({
        ...mockLog,
        id: 'test-2',
        date: '2025-01-20',
      });
    });
    const last = result.current.getLastWorkoutForDay(1);
    expect(last?.id).toBe('test-2');
  });

  it('returns null for day with no workouts', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    expect(result.current.getLastWorkoutForDay(5)).toBeNull();
  });

  it('gets exercise history', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addWorkoutLog(mockLog);
    });
    const history = result.current.getExerciseHistory('Incline Barbell Press');
    expect(history).toHaveLength(1);
  });

  it('calculates volume', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    const volume = result.current.calculateVolume(mockLog.exercises);
    expect(volume).toBe(135 * 10 + 135 * 8);
  });

  it('records deload', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.recordDeload();
    });
    expect(result.current.progress.lastDeloadDate).toBeDefined();
  });

  it('resets progress', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addWorkoutLog(mockLog);
      result.current.updateCycle(5);
    });
    expect(result.current.progress.workoutLogs).toHaveLength(1);
    act(() => {
      result.current.resetProgress();
    });
    expect(result.current.progress.currentCycle).toBe(1);
    expect(result.current.progress.workoutLogs).toEqual([]);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addWorkoutLog(mockLog);
    });
    const stored = localStorage.getItem('sanctum-progress');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.workoutLogs).toHaveLength(1);
  });

  it('imports data', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    const importPayload = JSON.stringify({
      currentCycle: 3,
      cycleStartDate: '2025-01-01',
      deloadIntervalWeeks: 4,
      workoutLogs: [mockLog],
    });
    act(() => {
      const success = result.current.importData(importPayload);
      expect(success).toBe(true);
    });
    expect(result.current.progress.currentCycle).toBe(3);
    expect(result.current.progress.workoutLogs).toHaveLength(1);
  });

  it('rejects invalid import data', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      const success = result.current.importData('not valid json');
      expect(success).toBe(false);
    });
  });
});
