import { describe, it, expect } from 'vitest';
import { findPreviousWorkout, isSetPR } from './prDetector';
import { WorkoutLog, SetLog } from '../types';

function makeWorkout(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: 'w1',
    date: '2026-02-08',
    cycle: 1,
    dayNumber: 1,
    dayName: 'Chest/Back',
    exercises: [],
    completed: true,
    ...overrides,
  };
}

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    setNumber: 1,
    weight: 100,
    reps: 10,
    completed: true,
    ...overrides,
  };
}

describe('findPreviousWorkout', () => {
  it('returns null when no other workouts exist', () => {
    const current = makeWorkout({ id: 'w1', dayNumber: 1 });
    expect(findPreviousWorkout(1, 'w1', [current])).toBeNull();
  });

  it('returns null when no matching dayNumber exists', () => {
    const logs = [
      makeWorkout({ id: 'w1', dayNumber: 1 }),
      makeWorkout({ id: 'w2', dayNumber: 2, date: '2026-02-07' }),
    ];
    expect(findPreviousWorkout(1, 'w1', logs)).toBeNull();
  });

  it('returns most recent previous workout for same day', () => {
    const logs = [
      makeWorkout({ id: 'w1', dayNumber: 1, date: '2026-02-08' }),
      makeWorkout({ id: 'w2', dayNumber: 1, date: '2026-02-02' }),
      makeWorkout({ id: 'w3', dayNumber: 1, date: '2026-01-27' }),
    ];
    const result = findPreviousWorkout(1, 'w1', logs);
    expect(result?.id).toBe('w2');
  });

  it('excludes incomplete workouts', () => {
    const logs = [
      makeWorkout({ id: 'w1', dayNumber: 1, date: '2026-02-08' }),
      makeWorkout({ id: 'w2', dayNumber: 1, date: '2026-02-02', completed: false }),
      makeWorkout({ id: 'w3', dayNumber: 1, date: '2026-01-27' }),
    ];
    const result = findPreviousWorkout(1, 'w1', logs);
    expect(result?.id).toBe('w3');
  });
});

describe('isSetPR', () => {
  it('returns false when no previous workout exists', () => {
    const set = makeSet({ weight: 100, reps: 10 });
    expect(isSetPR(set, 'Bench Press', null)).toBe(false);
  });

  it('returns false when set is not completed', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [makeSet({ weight: 100, reps: 10 })],
        notes: '',
      }],
    });
    const set = makeSet({ weight: 200, reps: 10, completed: false });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });

  it('returns false when weight is null', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [makeSet({ weight: 100, reps: 10 })],
        notes: '',
      }],
    });
    const set = makeSet({ weight: null, reps: 10 });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });

  it('returns false when reps is null', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [makeSet({ weight: 100, reps: 10 })],
        notes: '',
      }],
    });
    const set = makeSet({ weight: 100, reps: null });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });

  it('detects PR when set volume beats previous best', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [
          makeSet({ weight: 100, reps: 10 }),  // 1000
          makeSet({ weight: 110, reps: 8 }),   // 880
        ],
        notes: '',
      }],
    });
    // 1001 > 1000 = PR
    const set = makeSet({ weight: 143, reps: 7 });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(true);
  });

  it('returns false when set volume equals previous best (strict >)', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [makeSet({ weight: 100, reps: 10 })],
        notes: '',
      }],
    });
    // 1000 === 1000 — not a PR
    const set = makeSet({ weight: 100, reps: 10 });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });

  it('returns false when set volume is less than previous best', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [makeSet({ weight: 100, reps: 10 })],
        notes: '',
      }],
    });
    const set = makeSet({ weight: 90, reps: 10 });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });

  it('handles exercise skipped in previous workout', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [makeSet({ weight: 100, reps: 10 })],
        notes: '',
        skipped: true,
      }],
    });
    const set = makeSet({ weight: 50, reps: 5 });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });

  it('handles exercise not present in previous workout', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Squat',
        sets: [makeSet({ weight: 200, reps: 5 })],
        notes: '',
      }],
    });
    const set = makeSet({ weight: 100, reps: 10 });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });

  it('compares against best set in previous workout, not just first', () => {
    const prev = makeWorkout({
      exercises: [{
        exerciseName: 'Bench Press',
        sets: [
          makeSet({ weight: 80, reps: 10 }),   // 800
          makeSet({ weight: 100, reps: 10 }),  // 1000 (best)
        ],
        notes: '',
      }],
    });
    // 900 < 1000 — not a PR even though it beats set 1
    const set = makeSet({ weight: 90, reps: 10 });
    expect(isSetPR(set, 'Bench Press', prev)).toBe(false);
  });
});
