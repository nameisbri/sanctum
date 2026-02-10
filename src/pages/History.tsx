import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { WorkoutLog, ExerciseLog } from '../types';
import { calculateWorkoutVolume, getCurrentCycleVolume } from '../utils/volumeCalculator';
import { useUnits, formatVolumeWithUnit, formatWeight } from '../hooks/useUnits';
import { formatRelativeDate } from '../utils/dateFormatter';
import { formatDuration } from '../utils/timeFormatter';
import { findPreviousWorkout, isSetPR } from '../services/prDetector';
import { sanctumProgram } from '../data/program';
import { CATEGORY_BADGE_COLORS } from '../constants/categoryColors';

export function History() {
  const { progress } = useProgress();
  const { unit } = useUnits();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Escape key collapses expanded card
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedId !== null) {
        setExpandedId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expandedId]);

  const sortedLogs = useMemo(() => {
    return [...progress.workoutLogs]
      .filter(log => log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [progress.workoutLogs]);

  const cycleVolume = useMemo(() => {
    return getCurrentCycleVolume(progress.workoutLogs, progress.currentCycle);
  }, [progress.workoutLogs, progress.currentCycle]);

  const allTimeVolume = useMemo(() => {
    return progress.workoutLogs
      .filter(w => w.completed)
      .reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
  }, [progress.workoutLogs]);

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-gothic text-blood-500">history</h1>
      </header>

      {/* Volume stats */}
      {sortedLogs.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
            <p className="text-xs text-sanctum-400 uppercase tracking-widest mb-1">This Cycle</p>
            <p className="text-xl font-bold text-metal-gold font-mono">
              {formatVolumeWithUnit(cycleVolume.totalVolume, unit)}
            </p>
          </div>
          <div className="flex-1 bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
            <p className="text-xs text-sanctum-400 uppercase tracking-widest mb-1">All Time</p>
            <p className="text-xl font-bold text-metal-gold font-mono">
              {formatVolumeWithUnit(allTimeVolume, unit)}
            </p>
          </div>
        </div>
      )}

      {/* Workout list */}
      {sortedLogs.length === 0 ? (
        <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-8 text-center">
          <p className="text-sanctum-400">No sessions recorded yet.</p>
          <p className="text-sanctum-500 text-sm mt-1">Complete your first workout to see history here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLogs.map(log => {
            const isExpanded = expandedId === log.id;
            const volume = log.totalVolume ?? calculateWorkoutVolume(log);
            const previousWorkout = isExpanded
              ? findPreviousWorkout(log.dayNumber, log.id, progress.workoutLogs)
              : null;

            return (
              <div key={log.id} className="bg-sanctum-900 border border-sanctum-700 rounded-xl overflow-hidden">
                {/* Card header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-sanctum-400">
                        {formatRelativeDate(log.date)}
                      </span>
                      <span className="text-sanctum-600">·</span>
                      <span className="text-sm font-medium text-sanctum-200 truncate" title={log.dayName}>
                        {log.dayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-metal-gold font-mono">
                        {formatVolumeWithUnit(volume, unit)}
                      </span>
                      {log.duration != null && log.duration > 0 && (
                        <span className="text-sm text-sanctum-400">
                          {formatDuration(log.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-sanctum-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-sanctum-500 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 animate-fade-in">
                    {log.sessionNotes && (
                      <p className="text-sm text-sanctum-400 italic mb-3 px-1">
                        "{log.sessionNotes}"
                      </p>
                    )}
                    {log.exercises.map((exercise, i) => (
                      <ExerciseHistoryItem
                        key={i}
                        exercise={exercise}
                        previousWorkout={previousWorkout}
                        unit={unit}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- ExerciseHistoryItem ---

interface ExerciseHistoryItemProps {
  exercise: ExerciseLog;
  previousWorkout: WorkoutLog | null;
  unit: import('../hooks/useUnits').WeightUnit;
}

function ExerciseHistoryItem({ exercise, previousWorkout, unit }: ExerciseHistoryItemProps) {
  const displayName = exercise.replacedWith
    ? `${exercise.exerciseName} → ${exercise.replacedWith}`
    : exercise.exerciseName;

  if (exercise.skipped) {
    return (
      <div className="bg-sanctum-850 border border-sanctum-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-sanctum-500">{displayName}</span>
          <span className="text-xs text-sanctum-600 bg-sanctum-800 px-1.5 py-0.5 rounded">
            SKIPPED
          </span>
        </div>
      </div>
    );
  }

  const completedSets = exercise.sets.filter(s => s.completed && s.weight && s.reps);
  if (completedSets.length === 0) return null;

  // Determine category from program data or fall back
  const category = getCategoryFromExerciseName(exercise.exerciseName);
  const badgeColor = CATEGORY_BADGE_COLORS[category] || 'bg-sanctum-800 text-sanctum-400 border-sanctum-700';

  return (
    <div className="bg-sanctum-850 border border-sanctum-700/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-sanctum-200 truncate" title={displayName}>{displayName}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${badgeColor}`}>
          {category}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {completedSets.map((set, i) => {
          const pr = isSetPR(set, exercise.exerciseName, previousWorkout);
          return (
            <span
              key={i}
              className={`text-sm font-mono px-2.5 py-1 rounded-lg border ${
                pr
                  ? 'text-metal-gold bg-sanctum-800 border-metal-gold/30'
                  : 'text-sanctum-300 bg-sanctum-800 border-sanctum-700'
              }`}
            >
              {formatWeight(set.weight ?? 0, unit)} × {set.reps}
              {pr && <span className="ml-1 text-metal-gold">★</span>}
            </span>
          );
        })}
      </div>
      {exercise.notes && (
        <p className="text-xs text-sanctum-500 mt-2 italic">"{exercise.notes}"</p>
      )}
    </div>
  );
}

// --- Category lookup ---

const exerciseCategoryMap: Record<string, string> = {};
for (const day of sanctumProgram.workoutDays) {
  for (const ex of day.exercises) {
    exerciseCategoryMap[ex.name] = ex.category;
  }
}

function getCategoryFromExerciseName(name: string): string {
  return exerciseCategoryMap[name] || 'other';
}
