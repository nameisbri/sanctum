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

  it('defaults isDeloadWeek to false', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    expect(result.current.progress.isDeloadWeek).toBe(false);
  });

  it('startDeload sets isDeloadWeek to true', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.startDeload();
    });
    expect(result.current.progress.isDeloadWeek).toBe(true);
  });

  it('endDeload sets isDeloadWeek to false and updates lastDeloadDate', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.startDeload();
    });
    expect(result.current.progress.isDeloadWeek).toBe(true);
    act(() => {
      result.current.endDeload();
    });
    expect(result.current.progress.isDeloadWeek).toBe(false);
    expect(result.current.progress.lastDeloadDate).toBeDefined();
  });

  it('getLogsForCycle returns logs filtered by cycle and sorted by dayNumber', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    const log2: WorkoutLog = { ...mockLog, id: 'test-c1d3', dayNumber: 3, dayName: 'Legs (A)', cycle: 1 };
    const log3: WorkoutLog = { ...mockLog, id: 'test-c2d1', cycle: 2 };
    act(() => {
      result.current.addWorkoutLog(mockLog);
      result.current.addWorkoutLog(log2);
      result.current.addWorkoutLog(log3);
    });
    const cycle1Logs = result.current.getLogsForCycle(1);
    expect(cycle1Logs).toHaveLength(2);
    expect(cycle1Logs[0].dayNumber).toBe(1);
    expect(cycle1Logs[1].dayNumber).toBe(3);
  });

  it('getCycleNumbers returns distinct cycles descending, always includes currentCycle', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    const log2: WorkoutLog = { ...mockLog, id: 'test-c2', cycle: 2 };
    act(() => {
      result.current.addWorkoutLog(mockLog);
      result.current.addWorkoutLog(log2);
    });
    const cycles = result.current.getCycleNumbers();
    expect(cycles[0]).toBeGreaterThanOrEqual(cycles[cycles.length - 1]);
    expect(cycles).toContain(1);
    expect(cycles).toContain(2);
    expect(cycles).toContain(result.current.progress.currentCycle);
  });

  it('loadProgress handles missing isDeloadWeek from localStorage gracefully', () => {
    const oldData = {
      currentCycle: 2,
      cycleStartDate: '2025-06-01',
      deloadIntervalWeeks: 4,
      workoutLogs: [],
    };
    localStorage.setItem('sanctum-progress', JSON.stringify(oldData));
    const { result } = renderHook(() => useProgress(), { wrapper });
    expect(result.current.progress.isDeloadWeek).toBe(false);
    expect(result.current.progress.currentCycle).toBe(2);
  });

  it('importData handles missing isDeloadWeek gracefully', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    const importPayload = JSON.stringify({
      currentCycle: 3,
      cycleStartDate: '2025-01-01',
      deloadIntervalWeeks: 4,
      workoutLogs: [],
    });
    act(() => {
      const success = result.current.importData(importPayload);
      expect(success).toBe(true);
    });
    expect(result.current.progress.isDeloadWeek).toBe(false);
  });

  it('addRestDay appends date to restDays', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addRestDay('2026-02-10');
    });
    expect(result.current.progress.restDays).toEqual(['2026-02-10']);
  });

  it('addRestDay does not duplicate existing date', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addRestDay('2026-02-10');
      result.current.addRestDay('2026-02-10');
    });
    expect(result.current.progress.restDays).toEqual(['2026-02-10']);
  });

  it('removeRestDay filters date from restDays', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => {
      result.current.addRestDay('2026-02-10');
      result.current.addRestDay('2026-02-11');
    });
    expect(result.current.progress.restDays).toHaveLength(2);
    act(() => {
      result.current.removeRestDay('2026-02-10');
    });
    expect(result.current.progress.restDays).toEqual(['2026-02-11']);
  });

  it('loadProgress handles missing restDays from localStorage gracefully', () => {
    const oldData = {
      currentCycle: 2,
      cycleStartDate: '2025-06-01',
      deloadIntervalWeeks: 4,
      workoutLogs: [],
    };
    localStorage.setItem('sanctum-progress', JSON.stringify(oldData));
    const { result } = renderHook(() => useProgress(), { wrapper });
    expect(result.current.progress.restDays).toEqual([]);
  });
});
