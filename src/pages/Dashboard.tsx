import { useState } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { sanctumProgram } from '../data/program';
import { hasActiveWorkout } from '../services/workoutStateManager';
import { formatRelativeDate } from '../utils/dateFormatter';
import { DayCard } from '../components/DayCard';
import { WorkoutPreview } from '../components/WorkoutPreview';

export function Dashboard() {
  const { progress, getLastWorkoutForDay } = useProgress();
  const [previewDay, setPreviewDay] = useState<number | null>(null);

  const totalSessions = progress.workoutLogs.filter(l => l.completed).length;

  const completedThisCycle = progress.workoutLogs.filter(
    l => l.completed && l.cycle === progress.currentCycle
  ).length;

  const lastLog = progress.workoutLogs
    .filter(l => l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const lastTrainedText = lastLog
    ? formatRelativeDate(lastLog.date)
    : 'Never';

  return (
    <div className="min-h-screen bg-sanctum-950 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl font-gothic text-blood-500">
            Sanctum
          </h1>
          <span className="text-metal-silver text-sm font-medium">
            Cycle {progress.currentCycle}
            {progress.isDeloadWeek && (
              <span className="text-metal-gold text-xs ml-2">Deload</span>
            )}
          </span>
        </div>

        <div className="mb-6" />

        {/* Day Cards */}
        <div className="space-y-3 mb-8">
          {sanctumProgram.workoutDays.map(day => (
            <DayCard
              key={day.dayNumber}
              dayNumber={day.dayNumber}
              dayName={day.name}
              exerciseCount={day.exercises.length}
              lastWorkoutDate={getLastWorkoutForDay(day.dayNumber)?.date ?? null}
              hasActiveWorkout={hasActiveWorkout(day.dayNumber)}
              onClick={() => setPreviewDay(day.dayNumber)}
            />
          ))}
        </div>

        {/* Stats Strip */}
        <div className="border-t border-sanctum-700 pt-6 flex justify-center gap-4 text-xs flex-wrap">
          <span className="text-sanctum-400">
            <span className="text-sanctum-300 font-medium">{totalSessions}</span> total sessions
          </span>
          <span className="text-sanctum-600">&middot;</span>
          <span className="text-sanctum-400">
            <span className="text-sanctum-300 font-medium">{completedThisCycle}</span> of 6 this cycle
          </span>
          <span className="text-sanctum-600">&middot;</span>
          <span className="text-sanctum-400">
            Last trained: <span className="text-sanctum-300 font-medium">{lastTrainedText}</span>
          </span>
        </div>
      </div>

      {previewDay !== null && (
        <WorkoutPreview
          dayNumber={previewDay}
          onClose={() => setPreviewDay(null)}
        />
      )}
    </div>
  );
}
