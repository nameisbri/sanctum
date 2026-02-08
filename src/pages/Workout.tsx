import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { getExercisesForDay, getWorkoutDay } from '../data/program';
import { ExerciseLog, SetLog, WorkoutLog } from '../types';
import { ExerciseCard } from '../components/ExerciseCard';
import { WorkoutSummary } from '../components/WorkoutSummary';
import {
  saveActiveWorkout,
  getActiveWorkout,
  clearActiveWorkout,
} from '../services/workoutStateManager';
import { validateWorkoutCompletion } from '../services/workoutValidator';
import { calculateTotalVolume } from '../utils/volumeCalculator';
import { useSessionTimer } from '../hooks/useSessionTimer';

export function Workout() {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const { progress, addWorkoutLog, getLastWorkoutForDay } = useProgress();
  const { currentCycle } = progress;

  const dayNum = parseInt(dayNumber || '1', 10);
  const workoutDay = getWorkoutDay(dayNum);
  const exercises = getExercisesForDay(dayNum);
  const lastWorkout = getLastWorkoutForDay(dayNum);

  // Initialize startTime and exerciseLogs from localStorage or create new
  const [startTime] = useState<number>(() => {
    const savedWorkout = getActiveWorkout(dayNum);
    if (savedWorkout && savedWorkout.cycle === currentCycle) {
      return savedWorkout.startTime;
    }
    return Date.now();
  });

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    const savedWorkout = getActiveWorkout(dayNum);
    if (savedWorkout && savedWorkout.cycle === currentCycle) {
      return savedWorkout.exercises;
    }
    return exercises.map((ex) => ({
      exerciseName: ex.name,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: null,
        reps: null,
        completed: false,
      })),
      notes: '',
    }));
  });

  const [expandedExercise, setExpandedExercise] = useState<number>(() => {
    const firstIncomplete = exerciseLogs.findIndex(
      (log) => !log.skipped && !log.sets.every((s) => s.completed)
    );
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const { elapsed, seconds: elapsedSeconds, paused, togglePause } = useSessionTimer(startTime);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Auto-scroll to expanded exercise on mount
  useEffect(() => {
    if (expandedExercise >= 0) {
      const el = document.querySelector(
        `[data-exercise-index="${expandedExercise}"]`
      );
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save workout state on every change
  useEffect(() => {
    saveActiveWorkout({
      dayNumber: dayNum,
      cycle: currentCycle,
      exercises: exerciseLogs,
      startTime,
    });
  }, [exerciseLogs, dayNum, currentCycle, startTime]);

  // Completion progress
  const completionProgress = useMemo(() => {
    const totalSets = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = exerciseLogs.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  }, [exerciseLogs]);

  // Validation
  const validationResult = useMemo(() => {
    return validateWorkoutCompletion(exerciseLogs, exercises);
  }, [exerciseLogs, exercises]);

  // --- Handlers ---

  const saveWorkoutState = (logs: ExerciseLog[]) => {
    saveActiveWorkout({
      dayNumber: dayNum,
      cycle: currentCycle,
      exercises: logs,
      startTime,
    });
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<SetLog>
  ) => {
    setExerciseLogs((prev) => {
      const newLogs = [...prev];
      newLogs[exerciseIndex] = {
        ...newLogs[exerciseIndex],
        sets: newLogs[exerciseIndex].sets.map((set, i) =>
          i === setIndex ? { ...set, ...updates } : set
        ),
      };
      saveWorkoutState(newLogs);
      return newLogs;
    });
  };

  const updateNotes = (exerciseIndex: number, notes: string) => {
    setExerciseLogs((prev) => {
      const newLogs = [...prev];
      newLogs[exerciseIndex] = { ...newLogs[exerciseIndex], notes };
      saveWorkoutState(newLogs);
      return newLogs;
    });
  };

  const handleSetToggle = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const currentSet = prev[exerciseIndex]?.sets[setIndex];
      if (!currentSet) return prev;

      const newLogs = [...prev];
      newLogs[exerciseIndex] = {
        ...newLogs[exerciseIndex],
        sets: newLogs[exerciseIndex].sets.map((set, i) =>
          i === setIndex
            ? {
                ...set,
                completed: !currentSet.completed,
                timestamp: !currentSet.completed ? Date.now() : undefined,
              }
            : set
        ),
      };
      saveWorkoutState(newLogs);
      return newLogs;
    });
  };

  const handleSkipExercise = (exerciseIndex: number, skipped: boolean) => {
    setExerciseLogs((prev) => {
      const newLogs = [...prev];
      newLogs[exerciseIndex] = { ...newLogs[exerciseIndex], skipped };
      saveWorkoutState(newLogs);
      return newLogs;
    });
  };

  const handleReplaceExercise = (
    exerciseIndex: number,
    replacementName: string
  ) => {
    setExerciseLogs((prev) => {
      const newLogs = [...prev];
      newLogs[exerciseIndex] = {
        ...newLogs[exerciseIndex],
        replacedWith: replacementName,
      };
      saveWorkoutState(newLogs);
      return newLogs;
    });
  };

  const handleResetWorkout = () => {
    clearActiveWorkout(dayNum);
    navigate('/');
  };

  const handleCompleteWorkout = () => {
    if (!validationResult.isValid) {
      setShowValidationErrors(true);
      return;
    }
    setShowSummary(true);
  };

  const handleFinalSave = () => {
    const totalVolume = calculateTotalVolume(exerciseLogs);
    const workoutLog: WorkoutLog = {
      id: `${Date.now()}-${dayNum}`,
      date: new Date().toISOString().split('T')[0],
      cycle: currentCycle,
      dayNumber: dayNum,
      dayName: workoutDay?.name || '',
      exercises: exerciseLogs,
      completed: true,
      totalVolume,
      duration: elapsedSeconds,
      sessionNotes: sessionNotes.trim() || undefined,
    };
    addWorkoutLog(workoutLog);
    clearActiveWorkout(dayNum);
    navigate('/');
  };

  // Get last session data for a specific exercise
  const getLastExerciseData = (exerciseName: string): ExerciseLog | null => {
    if (!lastWorkout) return null;
    return (
      lastWorkout.exercises.find((ex) => ex.exerciseName === exerciseName) ??
      null
    );
  };

  if (!workoutDay) {
    return (
      <div className="min-h-screen bg-sanctum-950 flex items-center justify-center">
        <p className="text-sanctum-500">Workout not found</p>
      </div>
    );
  }

  if (showSummary) {
    return (
      <WorkoutSummary
        exerciseLogs={exerciseLogs}
        duration={elapsedSeconds}
        sessionNotes={sessionNotes}
        onSessionNotesChange={setSessionNotes}
        onSave={handleFinalSave}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sanctum-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sanctum-950/95 backdrop-blur-sm border-b border-sanctum-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] text-sanctum-400 hover:text-sanctum-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-base font-medium text-sanctum-100">
                {workoutDay.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePause}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] text-sanctum-500 hover:text-sanctum-300 transition-colors"
                aria-label={paused ? 'Resume timer' : 'Pause timer'}
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] text-sanctum-500 hover:text-sanctum-300 transition-colors"
                aria-label="Reset workout"
              >
                <RotateCcw size={16} />
              </button>
              <span className={`text-sm font-mono tabular-nums ${paused ? 'text-blood-400' : 'text-sanctum-400'}`}>
                {elapsed}
                {paused && <span className="text-xs ml-1">||</span>}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-sanctum-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blood-500 rounded-full transition-all duration-500"
              style={{ width: `${completionProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-sanctum-950/80 backdrop-blur-sm">
          <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-5 max-w-xs w-full animate-fade-in">
            <p className="text-sm text-sanctum-200 mb-4">
              Reset this workout? All logged sets will be cleared.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-sanctum-700 text-sm text-sanctum-300 hover:bg-sanctum-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetWorkout}
                className="flex-1 py-2.5 rounded-lg bg-blood-500 text-sm text-white font-medium hover:bg-blood-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="p-4 space-y-3">
        {exercises.map((exercise, exerciseIndex) => {
          const isExpanded = expandedExercise === exerciseIndex;
          const exerciseLog = exerciseLogs[exerciseIndex];
          const lastExerciseData = getLastExerciseData(exercise.name);

          return (
            <ExerciseCard
              key={`${exercise.name}-${exerciseIndex}`}
              exercise={exercise}
              exerciseLog={exerciseLog}
              exerciseIndex={exerciseIndex}
              isExpanded={isExpanded}
              onToggle={() =>
                setExpandedExercise(isExpanded ? -1 : exerciseIndex)
              }
              onUpdateSet={updateSet}
              onUpdateNotes={updateNotes}
              onSetComplete={handleSetToggle}
              onSkipExercise={handleSkipExercise}
              onReplaceExercise={handleReplaceExercise}
              lastExerciseData={lastExerciseData}
            />
          );
        })}
      </div>

      {/* Validation Error Messages */}
      {showValidationErrors && !validationResult.isValid && (
        <div className="fixed bottom-24 left-0 right-0 p-4 z-50">
          <div className="bg-sanctum-900 border border-blood-800/40 rounded-xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-sanctum-300 mb-2">
                  Complete all required exercises:
                </p>
                <ul className="text-sm space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blood-500 mt-0.5">·</span>
                      <span className="text-sanctum-300">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowValidationErrors(false)}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] text-sanctum-500 hover:text-sanctum-300 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Workout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-sanctum-950 via-sanctum-950 to-transparent">
        <button
          onClick={handleCompleteWorkout}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            validationResult.isValid
              ? 'bg-blood-500 text-white hover:bg-blood-400 active:scale-[0.98]'
              : 'bg-sanctum-800 text-sanctum-500 cursor-not-allowed'
          }`}
        >
          Complete Workout
          {completionProgress > 0 && completionProgress < 100 && (
            <span className="ml-2 text-sm opacity-70">
              ({Math.round(completionProgress)}%)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
