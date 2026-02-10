import { describe, it, expect } from 'vitest';
import { sanctumProgram, getExercisesForDay, getWorkoutDay, getRestTimerSeconds } from './program';

describe('sanctumProgram', () => {
  it('has 6 workout days', () => {
    expect(sanctumProgram.workoutDays).toHaveLength(6);
  });

  it('has daysPerCycle set to 6', () => {
    expect(sanctumProgram.daysPerCycle).toBe(6);
  });

  it('has default deloadIntervalWeeks of 5', () => {
    expect(sanctumProgram.deloadIntervalWeeks).toBe(5);
  });

  it('has correct day names', () => {
    const names = sanctumProgram.workoutDays.map(d => d.name);
    expect(names).toEqual([
      'Chest/Back',
      'Shoulders/Arms',
      'Legs (A)',
      'Pull',
      'Push',
      'Legs (B)',
    ]);
  });

  it('has correct exercise counts per day', () => {
    const counts = sanctumProgram.workoutDays.map(d => d.exercises.length);
    expect(counts).toEqual([8, 9, 10, 8, 8, 9]);
  });

  it('has 52 total exercises across all days', () => {
    const total = sanctumProgram.workoutDays.reduce((sum, d) => sum + d.exercises.length, 0);
    expect(total).toBe(52);
  });

  it('all exercises have 2 sets', () => {
    sanctumProgram.workoutDays.forEach(day => {
      day.exercises.forEach(exercise => {
        expect(exercise.sets).toBe(2);
      });
    });
  });

  it('all exercises have 6-12 reps', () => {
    sanctumProgram.workoutDays.forEach(day => {
      day.exercises.forEach(exercise => {
        expect(exercise.reps).toBe('6-12');
      });
    });
  });

  it('has correct perSide exercises', () => {
    const perSideExercises: string[] = [];
    sanctumProgram.workoutDays.forEach(day => {
      day.exercises.forEach(ex => {
        if (ex.perSide) perSideExercises.push(ex.name);
      });
    });
    expect(perSideExercises).toEqual([
      'Single Arm Cable Row',
      'Single Arm Overhead Extensions',
      'Bulgarian Split Squats',
      'Step-Ups',
    ]);
  });

  it('21s Ez Bar Bicep Curl has special notes', () => {
    const day2 = sanctumProgram.workoutDays.find(d => d.dayNumber === 2)!;
    const curl = day2.exercises.find(e => e.name === '21s Ez Bar Bicep Curl')!;
    expect(curl.notes).toBe('7 bottom half + 7 top half + 7 full ROM');
  });
});

describe('getExercisesForDay', () => {
  it('returns exercises for a valid day', () => {
    const exercises = getExercisesForDay(1);
    expect(exercises).toHaveLength(8);
    expect(exercises[0].name).toBe('Incline Barbell Press');
  });

  it('returns empty array for invalid day', () => {
    expect(getExercisesForDay(7)).toEqual([]);
    expect(getExercisesForDay(0)).toEqual([]);
  });
});

describe('getWorkoutDay', () => {
  it('returns workout day for valid day number', () => {
    const day = getWorkoutDay(3);
    expect(day).toBeDefined();
    expect(day!.name).toBe('Legs (A)');
    expect(day!.exercises).toHaveLength(10);
  });

  it('returns undefined for invalid day number', () => {
    expect(getWorkoutDay(7)).toBeUndefined();
  });
});

describe('getRestTimerSeconds', () => {
  it('returns 180 for chest', () => {
    expect(getRestTimerSeconds('chest')).toBe(180);
  });

  it('returns 180 for back', () => {
    expect(getRestTimerSeconds('back')).toBe(180);
  });

  it('returns 180 for legs', () => {
    expect(getRestTimerSeconds('legs')).toBe(180);
  });

  it('returns 120 for shoulders', () => {
    expect(getRestTimerSeconds('shoulders')).toBe(120);
  });

  it('returns 90 for biceps', () => {
    expect(getRestTimerSeconds('biceps')).toBe(90);
  });

  it('returns 90 for triceps', () => {
    expect(getRestTimerSeconds('triceps')).toBe(90);
  });

  it('returns 90 for abs', () => {
    expect(getRestTimerSeconds('abs')).toBe(90);
  });
});
