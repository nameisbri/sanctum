import { ActiveWorkout } from '../types';

const ACTIVE_WORKOUT_KEY_PREFIX = 'sanctum-active-workout';

function getStorageKey(dayNumber: number): string {
  return `${ACTIVE_WORKOUT_KEY_PREFIX}-${dayNumber}`;
}

function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parsing error in workoutStateManager:', error);
    return null;
  }
}

function safeJsonStringify(data: unknown): string | null {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('JSON stringification error in workoutStateManager:', error);
    return null;
  }
}

export function saveActiveWorkout(workout: ActiveWorkout): boolean {
  try {
    const key = getStorageKey(workout.dayNumber);
    const jsonString = safeJsonStringify(workout);

    if (jsonString === null) {
      console.error('Failed to stringify workout data');
      return false;
    }

    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.error('Failed to save active workout to localStorage:', error);
    return false;
  }
}

export function getActiveWorkout(dayNumber: number): ActiveWorkout | null {
  try {
    const key = getStorageKey(dayNumber);
    const jsonString = localStorage.getItem(key);

    if (jsonString === null) {
      return null;
    }

    const workout = safeJsonParse<ActiveWorkout>(jsonString);

    if (!workout || !isValidActiveWorkout(workout)) {
      console.warn('Invalid workout data structure in localStorage');
      return null;
    }

    return workout;
  } catch (error) {
    console.error('Failed to retrieve active workout from localStorage:', error);
    return null;
  }
}

export function clearActiveWorkout(dayNumber: number): boolean {
  try {
    const key = getStorageKey(dayNumber);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear active workout from localStorage:', error);
    return false;
  }
}

export function hasActiveWorkout(dayNumber: number): boolean {
  try {
    const key = getStorageKey(dayNumber);
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('Failed to check active workout existence:', error);
    return false;
  }
}

function isValidActiveWorkout(obj: unknown): obj is ActiveWorkout {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const workout = obj as Record<string, unknown>;

  if (typeof workout.dayNumber !== 'number') {
    return false;
  }

  if (typeof workout.cycle !== 'number') {
    return false;
  }

  if (typeof workout.startTime !== 'number') {
    return false;
  }

  if (!Array.isArray(workout.exercises)) {
    return false;
  }

  for (const exercise of workout.exercises) {
    if (typeof exercise !== 'object' || exercise === null) {
      return false;
    }

    const ex = exercise as Record<string, unknown>;

    if (typeof ex.exerciseName !== 'string') {
      return false;
    }

    if (!Array.isArray(ex.sets)) {
      return false;
    }

    if (typeof ex.notes !== 'string') {
      return false;
    }
  }

  return true;
}

export function getAllActiveWorkoutDays(): number[] {
  try {
    const dayNumbers: number[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(ACTIVE_WORKOUT_KEY_PREFIX)) {
        const dayNumberStr = key.replace(`${ACTIVE_WORKOUT_KEY_PREFIX}-`, '');
        const dayNumber = parseInt(dayNumberStr, 10);

        if (!isNaN(dayNumber)) {
          dayNumbers.push(dayNumber);
        }
      }
    }

    return dayNumbers.sort((a, b) => a - b);
  } catch (error) {
    console.error('Failed to get all active workout days:', error);
    return [];
  }
}
