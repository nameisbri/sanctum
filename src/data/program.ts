import { Program, Exercise, WorkoutDay } from '../types';

export const sanctumProgram: Program = {
  programName: 'Sanctum',
  daysPerCycle: 6,
  deloadIntervalWeeks: 5,
  workoutDays: [
    // Day 1: Pull
    {
      dayNumber: 1,
      name: 'Pull',
      exercises: [
        { order: 1, name: 'ISO High Row', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 2, name: 'Pronated Grip Elbows Flared ISO Lat Row', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 3, name: 'Wide Neutral Grip Lat Pulldown', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 4, name: 'Supinated Grip Cable Row', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 5, name: 'Dual Handle Rope Face Pulls', category: 'shoulders', sets: 2, reps: '6-12', rest: '2 min', notes: '' },
        { order: 6, name: 'Hyperextensions', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 7, name: 'Dual Handle Rope Bicep Curls', category: 'biceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
        { order: 8, name: 'Bayesian Curls', category: 'biceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
      ],
    },
    // Day 2: Push
    {
      dayNumber: 2,
      name: 'Push',
      exercises: [
        { order: 1, name: 'Pec Deck', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 2, name: 'Incline Machine Press (Power Smith)', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 3, name: 'Decline Bench Press', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 4, name: 'Vertical Pec Fly', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 5, name: 'Behind The Neck Press', category: 'shoulders', sets: 2, reps: '6-12', rest: '2 min', notes: '' },
        { order: 6, name: 'Hip High Cable Raises', category: 'shoulders', sets: 2, reps: '6-12', rest: '2 min', notes: '' },
        { order: 7, name: 'Lean Forward Dips', category: 'triceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
        { order: 8, name: 'Overhead Tricep Extensions', category: 'triceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
      ],
    },
    // Day 3: Legs (A)
    {
      dayNumber: 3,
      name: 'Legs (A)',
      exercises: [
        { order: 1, name: 'Calf Raises', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 2, name: 'Leg Curls', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 3, name: 'Leg Extensions', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 4, name: 'Hack Squat', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 5, name: 'Bulgarian Split Squats', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '', perSide: true },
        { order: 6, name: 'DB Romanian Deadlift', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 7, name: 'Abductors', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 8, name: 'Adductors', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 9, name: 'Ab Crunch Machine', category: 'abs', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
        { order: 10, name: 'Roman Chair Leg Raises', category: 'abs', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
      ],
    },
    // Day 4: Chest/Back
    {
      dayNumber: 4,
      name: 'Chest/Back',
      exercises: [
        { order: 1, name: 'Incline Barbell Press', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 2, name: 'Iso Lateral Wide Chest Press', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 3, name: 'Pec Deck', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 4, name: 'High to Low Chest Flies', category: 'chest', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 5, name: 'Single Arm Cable Row', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '', perSide: true },
        { order: 6, name: 'Supinated Close Grip Lat Pulldown', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 7, name: 'Neutral Grip Elbows Flared Cable Row', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 8, name: 'T Bar Upper Back Row into Kelso Shrug', category: 'back', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
      ],
    },
    // Day 5: Shoulders/Arms
    {
      dayNumber: 5,
      name: 'Shoulders/Arms',
      exercises: [
        { order: 1, name: 'Reverse Pec Deck', category: 'shoulders', sets: 2, reps: '6-12', rest: '2 min', notes: '' },
        { order: 2, name: 'DB Y-Raises', category: 'shoulders', sets: 2, reps: '6-12', rest: '2 min', notes: '' },
        { order: 3, name: 'Power Smith Shoulder Press', category: 'shoulders', sets: 2, reps: '6-12', rest: '2 min', notes: '' },
        { order: 4, name: '21s Ez Bar Bicep Curl', category: 'biceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '7 bottom half + 7 top half + 7 full ROM' },
        { order: 5, name: 'DB Hammer Curl', category: 'biceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
        { order: 6, name: 'Preacher Bicep Curl', category: 'biceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
        { order: 7, name: 'DB Skull Crushers', category: 'triceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
        { order: 8, name: 'Single Arm Overhead Extensions', category: 'triceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '', perSide: true },
        { order: 9, name: 'Tricep Pushdown', category: 'triceps', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
      ],
    },
    // Day 6: Legs (B)
    {
      dayNumber: 6,
      name: 'Legs (B)',
      exercises: [
        { order: 1, name: 'Calf Raises', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 2, name: 'Leg Curls', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 3, name: 'Leg Extensions', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 4, name: 'Hip Thrust', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 5, name: 'Leg Press', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 6, name: 'Step-Ups', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '', perSide: true },
        { order: 7, name: 'Stiff Leg Deadlift', category: 'legs', sets: 2, reps: '6-12', rest: '3 min', notes: '' },
        { order: 8, name: 'Ab Crunch Machine', category: 'abs', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
        { order: 9, name: 'Roman Chair Leg Raises', category: 'abs', sets: 2, reps: '6-12', rest: '90 sec', notes: '' },
      ],
    },
  ],
};

export function getExercisesForDay(dayNumber: number): Exercise[] {
  const day = sanctumProgram.workoutDays.find(d => d.dayNumber === dayNumber);
  return day?.exercises ?? [];
}

export function getWorkoutDay(dayNumber: number): WorkoutDay | undefined {
  return sanctumProgram.workoutDays.find(d => d.dayNumber === dayNumber);
}

export function getRestTimerSeconds(category: Exercise['category']): number {
  switch (category) {
    case 'chest':
    case 'back':
    case 'legs':
      return 180;
    case 'shoulders':
      return 120;
    case 'biceps':
    case 'triceps':
    case 'abs':
      return 90;
  }
}
