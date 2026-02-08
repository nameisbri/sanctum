import { SetLog, ExerciseLog, WorkoutLog } from '../types';

export interface VolumeData {
  totalVolume: number;
  sets: number;
  exercises: number;
}

export function calculateSetVolume(set: SetLog): number {
  if (!set.weight || !set.reps || !set.completed) {
    return 0;
  }
  return set.weight * set.reps;
}

export function calculateExerciseVolume(exercise: ExerciseLog): number {
  if (exercise.skipped) {
    return 0;
  }

  return exercise.sets.reduce((total, set) => {
    return total + calculateSetVolume(set);
  }, 0);
}

export function calculateTotalVolume(exercises: ExerciseLog[]): number {
  return exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise);
  }, 0);
}

export function calculateWorkoutVolume(workout: WorkoutLog): number {
  return calculateTotalVolume(workout.exercises);
}

export function getCurrentCycleVolume(workouts: WorkoutLog[], cycle: number): VolumeData {
  const cycleWorkouts = workouts.filter(w => w.cycle === cycle && w.completed);

  const totalVolume = cycleWorkouts.reduce((sum, workout) => {
    return sum + calculateWorkoutVolume(workout);
  }, 0);

  const totalSets = cycleWorkouts.reduce((sum, workout) => {
    return sum + workout.exercises.reduce((exSum, ex) => {
      return exSum + ex.sets.filter(s => s.completed).length;
    }, 0);
  }, 0);

  const uniqueExercises = new Set<string>();
  cycleWorkouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      if (!ex.skipped) {
        uniqueExercises.add(ex.exerciseName);
      }
    });
  });

  return {
    totalVolume,
    sets: totalSets,
    exercises: uniqueExercises.size,
  };
}

export function formatVolume(volume: number): string {
  if (volume >= 10000) {
    return `${(volume / 1000).toFixed(1)}k lb`;
  }
  return `${volume.toLocaleString()} lb`;
}
