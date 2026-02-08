import { describe, it, expect } from 'vitest';
import {
  calculateSetVolume,
  calculateExerciseVolume,
  calculateTotalVolume,
  calculateWorkoutVolume,
  getCurrentCycleVolume,
  formatVolume,
} from './volumeCalculator';
import { SetLog, ExerciseLog, WorkoutLog } from '../types';

describe('calculateSetVolume', () => {
  it('returns weight * reps for completed set', () => {
    const set: SetLog = { setNumber: 1, weight: 135, reps: 10, completed: true };
    expect(calculateSetVolume(set)).toBe(1350);
  });

  it('returns 0 for incomplete set', () => {
    const set: SetLog = { setNumber: 1, weight: 135, reps: 10, completed: false };
    expect(calculateSetVolume(set)).toBe(0);
  });

  it('returns 0 for null weight', () => {
    const set: SetLog = { setNumber: 1, weight: null, reps: 10, completed: true };
    expect(calculateSetVolume(set)).toBe(0);
  });

  it('returns 0 for null reps', () => {
    const set: SetLog = { setNumber: 1, weight: 135, reps: null, completed: true };
    expect(calculateSetVolume(set)).toBe(0);
  });
});

describe('calculateExerciseVolume', () => {
  it('sums volume across all sets', () => {
    const exercise: ExerciseLog = {
      exerciseName: 'Bench Press',
      sets: [
        { setNumber: 1, weight: 135, reps: 10, completed: true },
        { setNumber: 2, weight: 135, reps: 8, completed: true },
      ],
      notes: '',
    };
    expect(calculateExerciseVolume(exercise)).toBe(135 * 10 + 135 * 8);
  });

  it('returns 0 for skipped exercise', () => {
    const exercise: ExerciseLog = {
      exerciseName: 'Bench Press',
      sets: [{ setNumber: 1, weight: 135, reps: 10, completed: true }],
      notes: '',
      skipped: true,
    };
    expect(calculateExerciseVolume(exercise)).toBe(0);
  });
});

describe('calculateTotalVolume', () => {
  it('sums volume across all exercises', () => {
    const exercises: ExerciseLog[] = [
      {
        exerciseName: 'Bench Press',
        sets: [{ setNumber: 1, weight: 135, reps: 10, completed: true }],
        notes: '',
      },
      {
        exerciseName: 'Row',
        sets: [{ setNumber: 1, weight: 100, reps: 12, completed: true }],
        notes: '',
      },
    ];
    expect(calculateTotalVolume(exercises)).toBe(1350 + 1200);
  });
});

describe('calculateWorkoutVolume', () => {
  it('calculates volume from a WorkoutLog', () => {
    const workout: WorkoutLog = {
      id: '1',
      date: '2025-01-01',
      cycle: 1,
      dayNumber: 1,
      dayName: 'Chest/Back',
      exercises: [
        {
          exerciseName: 'Bench Press',
          sets: [{ setNumber: 1, weight: 200, reps: 5, completed: true }],
          notes: '',
        },
      ],
      completed: true,
    };
    expect(calculateWorkoutVolume(workout)).toBe(1000);
  });
});

describe('getCurrentCycleVolume', () => {
  const workouts: WorkoutLog[] = [
    {
      id: '1',
      date: '2025-01-01',
      cycle: 1,
      dayNumber: 1,
      dayName: 'Chest/Back',
      exercises: [
        {
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, weight: 135, reps: 10, completed: true },
            { setNumber: 2, weight: 135, reps: 8, completed: true },
          ],
          notes: '',
        },
      ],
      completed: true,
    },
    {
      id: '2',
      date: '2025-01-02',
      cycle: 2,
      dayNumber: 1,
      dayName: 'Chest/Back',
      exercises: [
        {
          exerciseName: 'Bench Press',
          sets: [{ setNumber: 1, weight: 200, reps: 5, completed: true }],
          notes: '',
        },
      ],
      completed: true,
    },
  ];

  it('calculates volume for a specific cycle', () => {
    const data = getCurrentCycleVolume(workouts, 1);
    expect(data.totalVolume).toBe(135 * 10 + 135 * 8);
    expect(data.sets).toBe(2);
    expect(data.exercises).toBe(1);
  });

  it('returns zeroes for a cycle with no workouts', () => {
    const data = getCurrentCycleVolume(workouts, 99);
    expect(data.totalVolume).toBe(0);
    expect(data.sets).toBe(0);
    expect(data.exercises).toBe(0);
  });
});

describe('formatVolume', () => {
  it('formats small volumes with commas', () => {
    expect(formatVolume(8450)).toBe('8,450 lb');
  });

  it('formats large volumes with k suffix', () => {
    expect(formatVolume(42500)).toBe('42.5k lb');
  });

  it('formats zero', () => {
    expect(formatVolume(0)).toBe('0 lb');
  });
});
