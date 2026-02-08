import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { UserProgress, WorkoutLog, ExerciseLog } from '../types';
import { calculateTotalVolume } from '../utils/volumeCalculator';
import { clearAllActiveWorkouts } from '../services/workoutStateManager';

const STORAGE_KEY = 'sanctum-progress';

const DEFAULT_PROGRESS: UserProgress = {
  currentCycle: 1,
  cycleStartDate: new Date().toISOString().split('T')[0],
  deloadIntervalWeeks: 5,
  workoutLogs: [],
};

function loadProgress(): UserProgress {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

interface ProgressContextType {
  progress: UserProgress;
  updateCycle: (cycle: number) => void;
  updateDeloadInterval: (weeks: number) => void;
  addWorkoutLog: (log: WorkoutLog) => void;
  getLastWorkoutForDay: (dayNumber: number) => WorkoutLog | null;
  getExerciseHistory: (exerciseName: string) => WorkoutLog[];
  calculateVolume: (exercises: ExerciseLog[]) => number;
  shouldSuggestDeload: () => boolean;
  recordDeload: () => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const updateCycle = useCallback((cycle: number) => {
    setProgress(prev => ({
      ...prev,
      currentCycle: cycle,
    }));
  }, []);

  const updateDeloadInterval = useCallback((weeks: number) => {
    setProgress(prev => ({
      ...prev,
      deloadIntervalWeeks: weeks,
    }));
  }, []);

  const addWorkoutLog = useCallback((log: WorkoutLog) => {
    setProgress(prev => ({
      ...prev,
      workoutLogs: [...prev.workoutLogs, log],
    }));
  }, []);

  const getLastWorkoutForDay = useCallback((dayNumber: number): WorkoutLog | null => {
    const dayLogs = progress.workoutLogs
      .filter(log => log.dayNumber === dayNumber && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return dayLogs[0] || null;
  }, [progress.workoutLogs]);

  const getExerciseHistory = useCallback((exerciseName: string): WorkoutLog[] => {
    return progress.workoutLogs
      .filter(log => log.exercises.some(ex => ex.exerciseName === exerciseName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [progress.workoutLogs]);

  const calculateVolume = useCallback((exercises: ExerciseLog[]): number => {
    return calculateTotalVolume(exercises);
  }, []);

  const shouldSuggestDeload = useCallback((): boolean => {
    const { lastDeloadDate, deloadIntervalWeeks, cycleStartDate } = progress;
    const referenceDate = lastDeloadDate || cycleStartDate;
    const refTime = new Date(referenceDate).getTime();
    const now = Date.now();
    const weeksSince = (now - refTime) / (1000 * 60 * 60 * 24 * 7);
    return weeksSince >= deloadIntervalWeeks;
  }, [progress]);

  const recordDeload = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      lastDeloadDate: new Date().toISOString().split('T')[0],
    }));
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(progress, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sanctum-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [progress]);

  const importData = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData) as UserProgress;
      if (
        typeof parsed.currentCycle !== 'number' ||
        typeof parsed.cycleStartDate !== 'string' ||
        typeof parsed.deloadIntervalWeeks !== 'number' ||
        !Array.isArray(parsed.workoutLogs)
      ) {
        return false;
      }
      setProgress(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetProgress = useCallback(() => {
    clearAllActiveWorkouts();
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return (
    <ProgressContext.Provider value={{
      progress,
      updateCycle,
      updateDeloadInterval,
      addWorkoutLog,
      getLastWorkoutForDay,
      getExerciseHistory,
      calculateVolume,
      shouldSuggestDeload,
      recordDeload,
      exportData,
      importData,
      resetProgress,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
