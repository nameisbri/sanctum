import { useMemo } from 'react';
import { ExerciseLog, WorkoutLog } from '../types';
import { calculateTotalVolume } from '../utils/volumeCalculator';
import { useUnits, formatVolumeWithUnit } from '../hooks/useUnits';
import { isSetPR } from '../services/prDetector';

interface WorkoutSummaryProps {
  exerciseLogs: ExerciseLog[];
  duration: number;
  sessionNotes: string;
  onSessionNotesChange: (notes: string) => void;
  onSave: () => void;
  previousWorkout: WorkoutLog | null;
}

const closingLines = [
  'The work is done. Return stronger.',
  'Strength recorded.',
  'Discipline compounds.',
  'Another layer of armor built.',
  'The body remembers what the mind commands.',
  'You showed up. That is power.',
  'Progress locked.',
  'This is how legends train \u2014 alone, in silence.',
];

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

export function WorkoutSummary({
  exerciseLogs,
  duration,
  sessionNotes,
  onSessionNotesChange,
  onSave,
  previousWorkout,
}: WorkoutSummaryProps) {
  const { unit } = useUnits();
  const closingLine = useMemo(
    () => closingLines[Math.floor(Math.random() * closingLines.length)],
    []
  );

  const totalVolume = calculateTotalVolume(exerciseLogs);
  const completedExercises = exerciseLogs.filter(
    (log) => !log.skipped && log.sets.some((s) => s.completed)
  ).length;
  const completedSets = exerciseLogs.reduce(
    (acc, log) => acc + (log.skipped ? 0 : log.sets.filter((s) => s.completed).length),
    0
  );

  const prCount = exerciseLogs.reduce((acc, log) => {
    if (log.skipped) return acc;
    const name = log.replacedWith || log.exerciseName;
    return acc + log.sets.filter((s) => isSetPR(s, name, previousWorkout)).length;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-sanctum-950 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="max-w-sm w-full text-center">
        {/* Closing line */}
        <p className="text-sanctum-300 text-lg font-medium italic mb-8 leading-relaxed">
          "{closingLine}"
        </p>

        {/* Stats */}
        <div className="space-y-4 mb-8">
          {/* Volume — hero stat */}
          <div>
            <p className="text-xs text-sanctum-500 uppercase tracking-widest mb-1">
              Volume
            </p>
            <p className="text-3xl font-bold text-metal-gold font-mono">
              {formatVolumeWithUnit(totalVolume, unit)}
            </p>
          </div>

          <div className="flex justify-center gap-8">
            <div>
              <p className="text-xs text-sanctum-500 uppercase tracking-widest mb-1">
                Exercises
              </p>
              <p className="text-xl font-bold text-sanctum-200">
                {completedExercises}
              </p>
            </div>
            <div>
              <p className="text-xs text-sanctum-500 uppercase tracking-widest mb-1">
                Sets
              </p>
              <p className="text-xl font-bold text-sanctum-200">
                {completedSets}
              </p>
            </div>
            <div>
              <p className="text-xs text-sanctum-500 uppercase tracking-widest mb-1">
                Duration
              </p>
              <p className="text-xl font-bold text-sanctum-200">
                {formatDuration(duration)}
              </p>
            </div>
            {prCount > 0 && (
              <div>
                <p className="text-xs text-sanctum-500 uppercase tracking-widest mb-1">
                  PRs
                </p>
                <p className="text-xl font-bold text-metal-gold">
                  {prCount} ★
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Session notes */}
        <textarea
          value={sessionNotes}
          onChange={(e) => onSessionNotesChange(e.target.value)}
          placeholder="Notes"
          className="w-full bg-sanctum-900 border border-sanctum-700 rounded-lg p-3 text-sm text-sanctum-200 placeholder:text-sanctum-600 resize-none focus:outline-none focus:border-blood-500/50 transition-colors mb-6"
          rows={3}
        />

        {/* Save button */}
        <button
          onClick={onSave}
          className="w-full py-4 rounded-xl bg-blood-500 text-white font-bold text-lg hover:bg-blood-400 active:scale-[0.98] transition-all"
        >
          Save
        </button>
      </div>
    </div>
  );
}
