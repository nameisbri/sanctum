import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveActiveWorkout,
  getActiveWorkout,
  clearActiveWorkout,
  hasActiveWorkout,
  getAllActiveWorkoutDays,
} from './workoutStateManager';
import { ActiveWorkout } from '../types';

const mockWorkout: ActiveWorkout = {
  dayNumber: 1,
  cycle: 1,
  startTime: 1700000000000,
  exercises: [
    {
      exerciseName: 'Incline Barbell Press',
      sets: [
        { setNumber: 1, weight: 135, reps: 10, completed: true },
        { setNumber: 2, weight: 135, reps: 8, completed: false },
      ],
      notes: '',
    },
  ],
};

describe('workoutStateManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveActiveWorkout', () => {
    it('saves a workout to localStorage', () => {
      const result = saveActiveWorkout(mockWorkout);
      expect(result).toBe(true);
      expect(localStorage.getItem('sanctum-active-workout-1')).not.toBeNull();
    });
  });

  describe('getActiveWorkout', () => {
    it('retrieves a saved workout', () => {
      saveActiveWorkout(mockWorkout);
      const retrieved = getActiveWorkout(1);
      expect(retrieved).toEqual(mockWorkout);
    });

    it('returns null for non-existent workout', () => {
      expect(getActiveWorkout(99)).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      localStorage.setItem('sanctum-active-workout-1', 'not-json');
      expect(getActiveWorkout(1)).toBeNull();
    });

    it('returns null for invalid workout structure', () => {
      localStorage.setItem('sanctum-active-workout-1', JSON.stringify({ foo: 'bar' }));
      expect(getActiveWorkout(1)).toBeNull();
    });
  });

  describe('clearActiveWorkout', () => {
    it('removes a workout from localStorage', () => {
      saveActiveWorkout(mockWorkout);
      expect(hasActiveWorkout(1)).toBe(true);
      clearActiveWorkout(1);
      expect(hasActiveWorkout(1)).toBe(false);
    });

    it('returns true even if no workout exists', () => {
      expect(clearActiveWorkout(99)).toBe(true);
    });
  });

  describe('hasActiveWorkout', () => {
    it('returns true when workout exists', () => {
      saveActiveWorkout(mockWorkout);
      expect(hasActiveWorkout(1)).toBe(true);
    });

    it('returns false when workout does not exist', () => {
      expect(hasActiveWorkout(1)).toBe(false);
    });
  });

  describe('getAllActiveWorkoutDays', () => {
    it('returns empty array when no workouts exist', () => {
      expect(getAllActiveWorkoutDays()).toEqual([]);
    });

    it('returns sorted day numbers', () => {
      saveActiveWorkout({ ...mockWorkout, dayNumber: 3 });
      saveActiveWorkout({ ...mockWorkout, dayNumber: 1 });
      saveActiveWorkout({ ...mockWorkout, dayNumber: 5 });
      expect(getAllActiveWorkoutDays()).toEqual([1, 3, 5]);
    });
  });
});
