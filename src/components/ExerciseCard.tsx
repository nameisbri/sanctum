import { useState, memo } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Exercise, ExerciseLog, SetLog, WorkoutLog } from '../types';
import { useUnits, convertWeight } from '../hooks/useUnits';
import { isSetPR } from '../services/prDetector';
import { CATEGORY_BADGE_COLORS } from '../constants/categoryColors';

interface RestTimerDisplay {
  exerciseIndex: number;
  setIndex: number;
  remaining: number;
  display: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseLog: ExerciseLog;
  exerciseIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => void;
  onUpdateNotes: (exerciseIndex: number, notes: string) => void;
  onSetComplete: (exerciseIndex: number, setIndex: number) => void;
  onSkipExercise: (exerciseIndex: number, skipped: boolean) => void;
  onReplaceExercise: (exerciseIndex: number, replacementName: string) => void;
  lastExerciseData: ExerciseLog | null;
  previousWorkout: WorkoutLog | null;
  restTimer: RestTimerDisplay | null;
  onRestDismiss: () => void;
}

export const ExerciseCard = memo(function ExerciseCard({
  exercise,
  exerciseLog,
  exerciseIndex,
  isExpanded,
  onToggle,
  onUpdateSet,
  onUpdateNotes,
  onSetComplete,
  onSkipExercise,
  onReplaceExercise,
  lastExerciseData,
  previousWorkout,
  restTimer,
  onRestDismiss,
}: ExerciseCardProps) {
  const { unit } = useUnits();
  const [showNotes, setShowNotes] = useState(!!exerciseLog.notes);
  const [showReplace, setShowReplace] = useState(false);
  const [replaceName, setReplaceName] = useState('');
  const completedSets = exerciseLog.sets.filter(s => s.completed).length;
  const allComplete = completedSets === exercise.sets;
  const isSkipped = exerciseLog.skipped || false;
  const isReplaced = !!exerciseLog.replacedWith;

  const displayName = isReplaced
    ? `${exercise.name} → ${exerciseLog.replacedWith}`
    : exercise.name;

  const badgeColor = CATEGORY_BADGE_COLORS[exercise.category] || CATEGORY_BADGE_COLORS.back;

  const handleReplace = () => {
    if (replaceName.trim()) {
      onReplaceExercise(exerciseIndex, replaceName.trim());
      setShowReplace(false);
      setReplaceName('');
    }
  };

  return (
    <div
      data-exercise-index={exerciseIndex}
      className={`rounded-xl border transition-all duration-200 ${
        allComplete
          ? 'border-blood-800/30 bg-blood-900/10'
          : isSkipped
          ? 'border-sanctum-700 bg-sanctum-900/50 opacity-50'
          : 'border-sanctum-700 bg-sanctum-900'
      }`}
    >
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left"
        aria-expanded={isExpanded}
        aria-label={`${displayName} — ${isExpanded ? 'collapse' : 'expand'}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sanctum-100 truncate text-sm" title={displayName}>
              {displayName}
            </h3>
            {isSkipped && (
              <span className="text-xs text-sanctum-500 bg-sanctum-800 px-1.5 py-0.5 rounded">
                SKIPPED
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded border ${badgeColor}`}>
              {exercise.category}
            </span>
            <span className="text-xs text-sanctum-400">
              {exercise.sets} × {exercise.reps}
              {exercise.perSide ? ' /side' : ''}
            </span>
            {!isExpanded && lastExerciseData && !lastExerciseData.skipped && lastExerciseData.sets[0]?.weight != null && (
              <span className="text-xs text-sanctum-400 font-mono">
                Last: {convertWeight(lastExerciseData.sets[0].weight, unit)}{unit} × {lastExerciseData.sets[0].reps ?? '—'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-sanctum-400 font-mono">
            {completedSets}/{exercise.sets}
          </span>
          {isExpanded ? (
            <ChevronUp size={18} className="text-sanctum-500" />
          ) : (
            <ChevronDown size={18} className="text-sanctum-500" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in">
          {/* Previous session data */}
          {lastExerciseData && !lastExerciseData.skipped && (
            <div className="mb-4">
              <p className="text-xs text-sanctum-400 mb-1.5">Previous</p>
              <div className="flex flex-wrap gap-2">
                {lastExerciseData.sets.map((set, i) => (
                  <span
                    key={i}
                    className="text-xs text-sanctum-400 font-mono bg-sanctum-850 px-2 py-1 rounded border border-sanctum-700"
                  >
                    {set.weight != null ? convertWeight(set.weight, unit) : '—'} {unit} × {set.reps ?? '—'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Set rows */}
          <div className="space-y-2">
            {exerciseLog.sets.map((set, setIndex) => (
              <SetRow
                key={setIndex}
                set={set}
                setIndex={setIndex}
                exerciseIndex={exerciseIndex}
                exercise={exercise}
                exerciseName={exerciseLog.replacedWith || exercise.name}
                lastSetData={lastExerciseData?.sets[setIndex]}
                previousWorkout={previousWorkout}
                onUpdateSet={onUpdateSet}
                onSetComplete={onSetComplete}
                restDisplay={restTimer?.setIndex === setIndex ? restTimer.display : null}
                onRestDismiss={onRestDismiss}
              />
            ))}
          </div>

          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="mt-3 flex items-center gap-1.5 text-xs text-sanctum-400 hover:text-sanctum-300 transition-colors min-h-[44px] py-2"
          >
            <MessageSquare size={12} />
            Notes
          </button>

          {showNotes && (
            <textarea
              value={exerciseLog.notes}
              onChange={(e) => onUpdateNotes(exerciseIndex, e.target.value)}
              placeholder="Notes"
              aria-label={`Notes for ${displayName}`}
              className="mt-2 w-full bg-sanctum-800 border border-sanctum-700 rounded-lg p-3 text-sm text-sanctum-200 placeholder:text-sanctum-600 resize-none focus:outline-none focus:border-blood-500/50 transition-colors"
              rows={2}
            />
          )}

          {/* Actions row */}
          {!showReplace ? (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setShowReplace(true)}
                className="text-xs text-sanctum-400 border border-sanctum-700 rounded-lg px-3 py-2.5 min-h-[44px] hover:border-sanctum-500 hover:text-sanctum-300 transition-colors"
              >
                Replace
              </button>
              <button
                onClick={() => onSkipExercise(exerciseIndex, !isSkipped)}
                className="text-xs text-sanctum-400 border border-sanctum-700 rounded-lg px-3 py-2.5 min-h-[44px] hover:border-sanctum-500 hover:text-sanctum-300 transition-colors"
              >
                {isSkipped ? 'Unskip' : 'Skip'}
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={replaceName}
                onChange={(e) => setReplaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReplace()}
                placeholder="Replace with"
                aria-label={`Replacement exercise for ${displayName}`}
                className="flex-1 bg-sanctum-800 border border-sanctum-700 rounded-lg px-3 py-2.5 text-sm text-sanctum-200 placeholder:text-sanctum-600 focus:outline-none focus:border-blood-500/50"
                autoFocus
              />
              <button
                onClick={handleReplace}
                className="text-xs text-blood-400 border border-blood-800/30 rounded-lg px-3 py-2.5 min-h-[44px] hover:bg-blood-900/20 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setShowReplace(false); setReplaceName(''); }}
                className="text-xs text-sanctum-400 border border-sanctum-700 rounded-lg px-3 py-2.5 min-h-[44px] hover:border-sanctum-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// --- SetRow sub-component ---

interface SetRowProps {
  set: SetLog;
  setIndex: number;
  exerciseIndex: number;
  exercise: Exercise;
  exerciseName: string;
  lastSetData?: SetLog;
  previousWorkout: WorkoutLog | null;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => void;
  onSetComplete: (exerciseIndex: number, setIndex: number) => void;
  restDisplay: string | null;
  onRestDismiss: () => void;
}

function SetRow({
  set,
  setIndex,
  exerciseIndex,
  exercise,
  exerciseName,
  lastSetData,
  previousWorkout,
  onUpdateSet,
  onSetComplete,
  restDisplay,
  onRestDismiss,
}: SetRowProps) {
  const { unit } = useUnits();
  const isPR = isSetPR(set, exerciseName, previousWorkout);

  return (
    <div>
      <div className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
        set.completed
          ? 'bg-blood-900/15 border border-blood-800/20'
          : 'bg-sanctum-850 border border-sanctum-700/50'
      }`}>
        {/* Set label */}
        <span className="text-xs text-sanctum-400 w-10 text-center font-medium">
          Set {set.setNumber}
        </span>

        {/* Weight input */}
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          value={set.weight ?? ''}
          onChange={(e) => onUpdateSet(exerciseIndex, setIndex, {
            weight: e.target.value ? parseFloat(e.target.value) : null,
          })}
          placeholder={lastSetData?.weight ? `${convertWeight(lastSetData.weight, unit)}` : unit}
          aria-label={`Set ${set.setNumber} weight in ${unit}`}
          className="flex-1 bg-sanctum-800 border border-sanctum-700 rounded-lg px-3 py-2.5 text-center text-sanctum-100 font-mono text-sm placeholder:text-sanctum-600 focus:outline-none focus:border-blood-500/50 transition-colors min-w-0"
        />

        <span className="text-sanctum-600 text-xs">×</span>

        {/* Reps input */}
        <input
          type="number"
          inputMode="numeric"
          value={set.reps ?? ''}
          onChange={(e) => onUpdateSet(exerciseIndex, setIndex, {
            reps: e.target.value ? parseInt(e.target.value, 10) : null,
          })}
          placeholder={lastSetData?.reps ? `${lastSetData.reps}` : exercise.reps.split('-')[0]}
          aria-label={`Set ${set.setNumber} reps`}
          className="flex-1 bg-sanctum-800 border border-sanctum-700 rounded-lg px-3 py-2.5 text-center text-sanctum-100 font-mono text-sm placeholder:text-sanctum-600 focus:outline-none focus:border-blood-500/50 transition-colors min-w-0"
        />

        {/* Complete circle */}
        <button
          onClick={() => onSetComplete(exerciseIndex, setIndex)}
          className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            set.completed
              ? 'bg-blood-500 border-blood-500'
              : 'border-sanctum-600 hover:border-sanctum-400'
          }`}
          aria-label={set.completed ? 'Mark set incomplete' : 'Mark set complete'}
        >
          {set.completed && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {isPR && (
          <span className="text-metal-gold text-sm flex-shrink-0" title="Personal record">★</span>
        )}
      </div>

      {/* Rest timer */}
      {restDisplay && (
        <button
          onClick={onRestDismiss}
          className="mt-1 ml-10 text-xs text-sanctum-400 font-mono hover:text-sanctum-300 transition-colors min-h-[44px] py-2"
          aria-label="Skip rest timer"
        >
          Rest: {restDisplay}
        </button>
      )}
    </div>
  );
}
