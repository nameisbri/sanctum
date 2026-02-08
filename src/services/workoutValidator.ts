import { Exercise, ExerciseLog, SetLog, ValidationResult, IncompleteSetInfo } from '../types';

function getMissingSetFields(set: SetLog): ('weight' | 'reps' | 'completed')[] {
  const missing: ('weight' | 'reps' | 'completed')[] = [];

  if (!set.completed) {
    missing.push('completed');
  }

  if (set.completed) {
    if (set.weight === null) {
      missing.push('weight');
    }
    if (set.reps === null) {
      missing.push('reps');
    }
  }

  return missing;
}

function isSetIncomplete(set: SetLog): boolean {
  if (!set.completed) {
    return true;
  }

  return set.weight === null || set.reps === null;
}

export function getIncompleteSets(
  exerciseLogs: ExerciseLog[],
  exercises: Exercise[]
): IncompleteSetInfo[] {
  const incompleteSets: IncompleteSetInfo[] = [];

  exerciseLogs.forEach((exerciseLog, exerciseIndex) => {
    if (exerciseLog.skipped) {
      return;
    }

    const exerciseDefinition = exercises[exerciseIndex];
    const isOptional = exerciseDefinition?.optional ?? false;

    exerciseLog.sets.forEach((set, setIndex) => {
      if (isSetIncomplete(set)) {
        incompleteSets.push({
          exerciseIndex,
          exerciseName: exerciseLog.exerciseName,
          setIndex,
          setNumber: set.setNumber,
          missingFields: getMissingSetFields(set),
          isOptional,
        });
      }
    });
  });

  return incompleteSets;
}

function generateErrorMessages(incompleteSets: IncompleteSetInfo[]): string[] {
  const requiredIncompleteSets = incompleteSets.filter(set => !set.isOptional);

  if (requiredIncompleteSets.length === 0) {
    return [];
  }

  const byExercise = new Map<string, IncompleteSetInfo[]>();

  requiredIncompleteSets.forEach(set => {
    if (!byExercise.has(set.exerciseName)) {
      byExercise.set(set.exerciseName, []);
    }
    byExercise.get(set.exerciseName)!.push(set);
  });

  const errors: string[] = [];

  byExercise.forEach((sets, exerciseName) => {
    const setNumbers = sets.map(s => s.setNumber).join(', ');
    const setWord = sets.length === 1 ? 'set' : 'sets';
    errors.push(`${exerciseName}: ${setWord} ${setNumbers} incomplete`);
  });

  return errors;
}

export function validateWorkoutCompletion(
  exerciseLogs: ExerciseLog[],
  exercises: Exercise[]
): ValidationResult {
  const incompleteSets = getIncompleteSets(exerciseLogs, exercises);
  const requiredIncompleteSets = incompleteSets.filter(set => !set.isOptional);
  const errors = generateErrorMessages(incompleteSets);
  const isValid = requiredIncompleteSets.length === 0;

  return {
    isValid,
    errors,
    incompleteSets,
  };
}
