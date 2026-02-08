import { WorkoutLog, SetLog } from '../types';

/**
 * Find the most recent previous completed workout for the same day number,
 * excluding the current workout.
 */
export function findPreviousWorkout(
  dayNumber: number,
  currentId: string,
  allLogs: WorkoutLog[]
): WorkoutLog | null {
  const candidates = allLogs
    .filter(log => log.dayNumber === dayNumber && log.completed && log.id !== currentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return candidates[0] || null;
}

/**
 * Get the best set volume (weight × reps) for a given exercise in a workout.
 * Returns 0 if the exercise was skipped or has no completed sets with data.
 */
function getBestSetVolume(exerciseName: string, workout: WorkoutLog): number {
  const exercise = workout.exercises.find(e => e.exerciseName === exerciseName);
  if (!exercise || exercise.skipped) return 0;

  let best = 0;
  for (const set of exercise.sets) {
    if (set.completed && set.weight && set.reps) {
      const vol = set.weight * set.reps;
      if (vol > best) best = vol;
    }
  }
  return best;
}

/**
 * Check if a specific set is a PR compared to the previous workout.
 * A set is a PR if its volume (weight × reps) is strictly greater than
 * the best set volume for the same exercise in the previous workout.
 *
 * Returns false if there's no previous workout (first time = no PR).
 */
export function isSetPR(
  set: SetLog,
  exerciseName: string,
  previousWorkout: WorkoutLog | null
): boolean {
  if (!previousWorkout) return false;
  if (!set.completed || !set.weight || !set.reps) return false;

  const currentVolume = set.weight * set.reps;
  const previousBest = getBestSetVolume(exerciseName, previousWorkout);

  // No PR if previous had no data for this exercise
  if (previousBest === 0) return false;

  return currentVolume > previousBest;
}
