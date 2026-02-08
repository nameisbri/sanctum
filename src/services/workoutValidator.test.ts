import { describe, it, expect } from 'vitest';
import { getIncompleteSets, validateWorkoutCompletion } from './workoutValidator';
import { Exercise, ExerciseLog } from '../types';

const mockExercises: Exercise[] = [
  { order: 1, name: 'Incline Barbell Press', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
  { order: 2, name: 'Pec Deck', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '', optional: true },
];

function makeCompletedLog(name: string): ExerciseLog {
  return {
    exerciseName: name,
    sets: [
      { setNumber: 1, weight: 135, reps: 10, completed: true },
      { setNumber: 2, weight: 135, reps: 8, completed: true },
    ],
    notes: '',
  };
}

function makeIncompleteLog(name: string): ExerciseLog {
  return {
    exerciseName: name,
    sets: [
      { setNumber: 1, weight: 135, reps: 10, completed: true },
      { setNumber: 2, weight: null, reps: null, completed: false },
    ],
    notes: '',
  };
}

describe('getIncompleteSets', () => {
  it('returns empty array when all sets complete', () => {
    const logs = [makeCompletedLog('Incline Barbell Press'), makeCompletedLog('Pec Deck')];
    expect(getIncompleteSets(logs, mockExercises)).toEqual([]);
  });

  it('identifies incomplete sets', () => {
    const logs = [makeIncompleteLog('Incline Barbell Press'), makeCompletedLog('Pec Deck')];
    const incomplete = getIncompleteSets(logs, mockExercises);
    expect(incomplete).toHaveLength(1);
    expect(incomplete[0].exerciseName).toBe('Incline Barbell Press');
    expect(incomplete[0].setNumber).toBe(2);
    expect(incomplete[0].isOptional).toBe(false);
  });

  it('marks optional exercises', () => {
    const logs = [makeCompletedLog('Incline Barbell Press'), makeIncompleteLog('Pec Deck')];
    const incomplete = getIncompleteSets(logs, mockExercises);
    expect(incomplete).toHaveLength(1);
    expect(incomplete[0].isOptional).toBe(true);
  });

  it('skips skipped exercises', () => {
    const logs: ExerciseLog[] = [
      makeCompletedLog('Incline Barbell Press'),
      { ...makeIncompleteLog('Pec Deck'), skipped: true },
    ];
    expect(getIncompleteSets(logs, mockExercises)).toEqual([]);
  });

  it('detects completed set with missing weight', () => {
    const logs: ExerciseLog[] = [{
      exerciseName: 'Incline Barbell Press',
      sets: [
        { setNumber: 1, weight: null, reps: 10, completed: true },
        { setNumber: 2, weight: 135, reps: 8, completed: true },
      ],
      notes: '',
    }, makeCompletedLog('Pec Deck')];
    const incomplete = getIncompleteSets(logs, mockExercises);
    expect(incomplete).toHaveLength(1);
    expect(incomplete[0].missingFields).toContain('weight');
  });
});

describe('validateWorkoutCompletion', () => {
  it('returns valid when all required sets are complete', () => {
    const logs = [makeCompletedLog('Incline Barbell Press'), makeCompletedLog('Pec Deck')];
    const result = validateWorkoutCompletion(logs, mockExercises);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns invalid when required sets are incomplete', () => {
    const logs = [makeIncompleteLog('Incline Barbell Press'), makeCompletedLog('Pec Deck')];
    const result = validateWorkoutCompletion(logs, mockExercises);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns valid when only optional sets are incomplete', () => {
    const logs = [makeCompletedLog('Incline Barbell Press'), makeIncompleteLog('Pec Deck')];
    const result = validateWorkoutCompletion(logs, mockExercises);
    expect(result.isValid).toBe(true);
  });

  it('includes all incomplete sets in result', () => {
    const logs = [makeIncompleteLog('Incline Barbell Press'), makeIncompleteLog('Pec Deck')];
    const result = validateWorkoutCompletion(logs, mockExercises);
    expect(result.incompleteSets).toHaveLength(2);
  });
});
