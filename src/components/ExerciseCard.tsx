import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Exercise, ExerciseLog, SetLog } from '../types';
import { getRestTimerSeconds } from '../data/program';
import { useUnits, convertWeight } from '../hooks/useUnits';

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
}

const categoryBadgeColors: Record<string, string> = {
  chest: 'bg-blood-900/40 text-blood-400 border-blood-800/30',
  back: 'bg-sanctum-800 text-metal-silver border-sanctum-700',
  shoulders: 'bg-sanctum-800 text-sanctum-300 border-sanctum-700',
  biceps: 'bg-blood-900/30 text-blood-400 border-blood-800/20',
  triceps: 'bg-blood-900/20 text-blood-300 border-blood-800/20',
  legs: 'bg-sanctum-800 text-sanctum-200 border-sanctum-600',
  abs: 'bg-sanctum-800 text-metal-bronze border-sanctum-700',
};

export function ExerciseCard({
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
}: ExerciseCardProps) {
  const { unit } = useUnits();
  const [showNotes, setShowNotes] = useState(!!exerciseLog.notes);
  const [showReplace, setShowReplace] = useState(false);
  const [replaceName, setReplaceName] = useState('');
  // Track which set has an active rest timer (-1 = none)
  const [restingSetIndex, setRestingSetIndex] = useState(-1);
  const completedSets = exerciseLog.sets.filter(s => s.completed).length;
  const allComplete = completedSets === exercise.sets;
  const isSkipped = exerciseLog.skipped || false;
  const isReplaced = !!exerciseLog.replacedWith;

  const displayName = isReplaced
    ? `${exercise.name} → ${exerciseLog.replacedWith}`
    : exercise.name;

  const badgeColor = categoryBadgeColors[exercise.category] || categoryBadgeColors.back;

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
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sanctum-100 truncate text-sm">
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
            <span className="text-xs text-sanctum-500">
              {exercise.sets} × {exercise.reps}
              {exercise.perSide ? ' /side' : ''}
            </span>
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
              <p className="text-xs text-sanctum-500 mb-1.5">Previous</p>
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
                lastSetData={lastExerciseData?.sets[setIndex]}
                onUpdateSet={onUpdateSet}
                onSetComplete={onSetComplete}
                isResting={restingSetIndex === setIndex}
                onRestStart={() => setRestingSetIndex(setIndex)}
                onRestEnd={() => setRestingSetIndex(-1)}
                onInputFocus={() => { if (restingSetIndex !== setIndex) setRestingSetIndex(-1); }}
              />
            ))}
          </div>

          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="mt-3 flex items-center gap-1.5 text-xs text-sanctum-500 hover:text-sanctum-300 transition-colors min-h-[44px] py-2"
          >
            <MessageSquare size={12} />
            Notes
          </button>

          {showNotes && (
            <textarea
              value={exerciseLog.notes}
              onChange={(e) => onUpdateNotes(exerciseIndex, e.target.value)}
              placeholder="Notes"
              className="mt-2 w-full bg-sanctum-800 border border-sanctum-700 rounded-lg p-3 text-sm text-sanctum-200 placeholder:text-sanctum-600 resize-none focus:outline-none focus:border-blood-500/50 transition-colors"
              rows={2}
            />
          )}

          {/* Actions row */}
          {!showReplace ? (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setShowReplace(true)}
                className="text-xs text-sanctum-400 border border-sanctum-700 rounded-lg px-3 py-2.5 hover:border-sanctum-500 hover:text-sanctum-300 transition-colors"
              >
                Replace
              </button>
              <button
                onClick={() => onSkipExercise(exerciseIndex, !isSkipped)}
                className="text-xs text-sanctum-400 border border-sanctum-700 rounded-lg px-3 py-2.5 hover:border-sanctum-500 hover:text-sanctum-300 transition-colors"
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
                className="flex-1 bg-sanctum-800 border border-sanctum-700 rounded-lg px-3 py-2.5 text-sm text-sanctum-200 placeholder:text-sanctum-600 focus:outline-none focus:border-blood-500/50"
                autoFocus
              />
              <button
                onClick={handleReplace}
                className="text-xs text-blood-400 border border-blood-800/30 rounded-lg px-3 py-2.5 hover:bg-blood-900/20 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setShowReplace(false); setReplaceName(''); }}
                className="text-xs text-sanctum-400 border border-sanctum-700 rounded-lg px-3 py-2.5 hover:border-sanctum-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- SetRow sub-component ---

interface SetRowProps {
  set: SetLog;
  setIndex: number;
  exerciseIndex: number;
  exercise: Exercise;
  lastSetData?: SetLog;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => void;
  onSetComplete: (exerciseIndex: number, setIndex: number) => void;
  isResting: boolean;
  onRestStart: () => void;
  onRestEnd: () => void;
  onInputFocus: () => void;
}

function SetRow({
  set,
  setIndex,
  exerciseIndex,
  exercise,
  lastSetData,
  onUpdateSet,
  onSetComplete,
  isResting,
  onRestStart,
  onRestEnd,
  onInputFocus,
}: SetRowProps) {
  const { unit } = useUnits();
  const restDuration = getRestTimerSeconds(exercise.category);
  const [restRemaining, setRestRemaining] = useState(0);

  // Start rest timer when set is newly completed
  const wasCompleted = usePrevious(set.completed);

  useEffect(() => {
    if (set.completed && !wasCompleted) {
      setRestRemaining(restDuration);
      onRestStart();
    }
  }, [set.completed, wasCompleted, restDuration, onRestStart]);

  // Kill timer when parent says we're no longer resting
  useEffect(() => {
    if (!isResting && restRemaining > 0) {
      setRestRemaining(0);
    }
  }, [isResting, restRemaining]);

  // Countdown
  useEffect(() => {
    if (!isResting || restRemaining <= 0) {
      if (restRemaining <= 0 && isResting) onRestEnd();
      return;
    }

    const interval = setInterval(() => {
      setRestRemaining(prev => {
        if (prev <= 1) {
          onRestEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, restRemaining, onRestEnd]);

  const formatRest = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
        set.completed
          ? 'bg-blood-900/15 border border-blood-800/20'
          : 'bg-sanctum-850 border border-sanctum-700/50'
      }`}>
        {/* Set label */}
        <span className="text-xs text-sanctum-500 w-10 text-center font-medium">
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
          onFocus={onInputFocus}
          placeholder={lastSetData?.weight ? `${convertWeight(lastSetData.weight, unit)}` : unit}
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
          onFocus={onInputFocus}
          placeholder={lastSetData?.reps ? `${lastSetData.reps}` : exercise.reps.split('-')[0]}
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
      </div>

      {/* Rest timer */}
      {isResting && restRemaining > 0 && (
        <button
          onClick={onRestEnd}
          className="mt-1 ml-10 text-xs text-sanctum-400 font-mono hover:text-sanctum-300 transition-colors min-h-[44px] py-2"
        >
          Rest: {formatRest(restRemaining)}
        </button>
      )}
    </div>
  );
}

// --- usePrevious helper ---

function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<{ current: T | undefined }>({ current: undefined });

  useEffect(() => {
    setPrev({ current: value });
  }, [value]);

  return prev.current;
}
