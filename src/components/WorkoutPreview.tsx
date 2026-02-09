import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { getWorkoutDay } from '../data/program';
import { hasActiveWorkout } from '../services/workoutStateManager';
import { useProgress } from '../contexts/ProgressContext';
import { useUnits, formatWeight } from '../hooks/useUnits';
import { CATEGORY_BADGE_COLORS } from '../constants/categoryColors';

interface WorkoutPreviewProps {
  dayNumber: number;
  onClose: () => void;
}

export function WorkoutPreview({ dayNumber, onClose }: WorkoutPreviewProps) {
  const navigate = useNavigate();
  const { getLastWorkoutForDay } = useProgress();
  const { unit } = useUnits();

  const day = getWorkoutDay(dayNumber);
  const isResume = hasActiveWorkout(dayNumber);
  const lastWorkout = getLastWorkoutForDay(dayNumber);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!day) return null;

  function getLastSetData(exerciseName: string): string | null {
    if (!lastWorkout) return null;
    const exerciseLog = lastWorkout.exercises.find(
      ex => ex.exerciseName === exerciseName
    );
    if (!exerciseLog || exerciseLog.skipped) return null;
    const completedSets = exerciseLog.sets.filter(s => s.completed && s.weight !== null && s.reps !== null);
    if (completedSets.length === 0) return null;
    const last = completedSets[completedSets.length - 1];
    return `${formatWeight(last.weight!, unit)} × ${last.reps}`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${day.name} preview`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-sanctum-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        data-testid="preview-backdrop"
      />

      {/* Panel */}
      <div className="relative w-full bg-sanctum-900 border-t border-sanctum-700 rounded-t-2xl animate-slide-up-sheet max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-sanctum-50">
            Day {dayNumber} — {day.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-sanctum-400 hover:text-sanctum-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-5 pb-3 max-h-[60vh]">
          <ul className="space-y-3">
            {day.exercises.map(exercise => {
              const lastData = getLastSetData(exercise.name);
              return (
                <li key={exercise.order} className="flex items-start gap-3">
                  <span className="text-sanctum-500 text-sm w-5 text-right flex-shrink-0 pt-0.5">
                    {exercise.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sanctum-100 text-sm">
                        {exercise.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${CATEGORY_BADGE_COLORS[exercise.category]}`}>
                        {exercise.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sanctum-400 text-xs">
                        {exercise.sets} × {exercise.reps}{exercise.perSide ? ' /side' : ''}
                      </span>
                      {lastData && (
                        <>
                          <span className="text-sanctum-600 text-xs">·</span>
                          <span className="text-sanctum-500 text-xs">
                            Last: {lastData}
                          </span>
                        </>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-sanctum-500 text-xs italic mt-0.5">{exercise.notes}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom)+4rem)] border-t border-sanctum-700">
          <button
            onClick={() => navigate(`/workout/${dayNumber}`)}
            className="w-full py-3 rounded-lg font-medium text-sm bg-blood-700 hover:bg-blood-600 text-sanctum-50 transition-colors min-h-[44px]"
          >
            {isResume ? 'Resume Workout' : 'Start Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
