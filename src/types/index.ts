// Program structure types

export interface Exercise {
  order: number;
  name: string;
  category: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'abs';
  sets: number;
  reps: string;
  rest: string;
  notes: string;
  substitutions?: string[];
  optional?: boolean;
  rir?: string | null;
  intensityTechnique?: string;
  perSide?: boolean;
}

export interface WorkoutDay {
  dayNumber: number;
  name: string;
  exercises: Exercise[];
}

export interface Program {
  programName: string;
  daysPerCycle: number;
  deloadIntervalWeeks: number;
  workoutDays: WorkoutDay[];
}

// User data types

export interface SetLog {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  timestamp?: number;
}

export interface ExerciseLog {
  exerciseName: string;
  sets: SetLog[];
  notes: string;
  skipped?: boolean;
  replacedWith?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  cycle: number;
  dayNumber: number;
  dayName: string;
  exercises: ExerciseLog[];
  completed: boolean;
  totalVolume?: number;
  duration?: number;
  sessionNotes?: string;
  isDeload?: boolean;
}

export interface UserProgress {
  currentCycle: number;
  cycleStartDate: string;
  deloadIntervalWeeks: number;
  lastDeloadDate?: string;
  isDeloadWeek: boolean;
  workoutLogs: WorkoutLog[];
  restDays: string[];
}

// UI State types

export interface RestTimerState {
  exerciseIndex: number;
  setIndex: number;
  startedAt: number;  // Date.now() epoch ms
  duration: number;   // seconds
}

export interface ActiveWorkout {
  dayNumber: number;
  cycle: number;
  exercises: ExerciseLog[];
  startTime: number;
  restTimer?: RestTimerState | null;
}

// Validation types

export interface IncompleteSetInfo {
  exerciseIndex: number;
  exerciseName: string;
  setIndex: number;
  setNumber: number;
  missingFields: ('weight' | 'reps' | 'completed')[];
  isOptional: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  incompleteSets: IncompleteSetInfo[];
}
