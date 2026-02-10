import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../contexts/ProgressContext';
import { WorkoutLog } from '../types';
import { useCalendarProjection } from '../hooks/useCalendarProjection';
import { CalendarCell } from '../services/calendarProjection';
import { CalendarTimeline } from '../components/CalendarTimeline';
import { DeloadAlert } from '../components/DeloadAlert';
import { ActiveDeloadBanner } from '../components/ActiveDeloadBanner';
import { WorkoutLogPreview } from '../components/WorkoutLogPreview';
import { toISODateString } from '../utils/dateFormatter';

export function Plan() {
  const { progress, shouldSuggestDeload, addRestDay, removeRestDay } = useProgress();
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const navigate = useNavigate();

  const projection = useCalendarProjection(progress);
  const showDeloadAlert = shouldSuggestDeload() && !progress.isDeloadWeek;
  const hasHistory = progress.workoutLogs.length > 0;

  const todayStr = toISODateString(new Date());
  const isRestToday = progress.restDays.includes(todayStr);

  // Can mark rest if today has a projected workout and we're not in deload week
  const todayCell = projection.weeks
    .flatMap(w => w.cells)
    .find(c => c.isToday);
  const canMarkRest = !progress.isDeloadWeek && todayCell?.type === 'today' && !!todayCell.workout;

  function handleDayTap(cell: CalendarCell) {
    if (cell.type === 'past-completed' && cell.workout?.log) {
      setSelectedLog(cell.workout.log);
    } else if (cell.type === 'today' && cell.workout) {
      navigate(`/workout/${cell.workout.dayNumber}`);
    } else if (cell.type === 'explicit-rest' && cell.isToday) {
      removeRestDay(cell.date);
    }
  }

  return (
    <div className="min-h-screen bg-sanctum-950 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-sanctum-50 tracking-tight">
            Plan
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-sanctum-500 bg-sanctum-900 px-2 py-0.5 rounded-full" data-testid="frequency-badge">
              ~{Math.round(projection.frequency.workoutsPerWeek)}x/wk
            </span>
            {canMarkRest && !isRestToday && (
              <button
                onClick={() => addRestDay(todayStr)}
                className="text-[11px] font-medium text-sanctum-400 bg-sanctum-800/50 hover:bg-sanctum-800 px-2 py-0.5 rounded-full transition-colors"
                data-testid="rest-today-btn"
              >
                Rest today
              </button>
            )}
            {isRestToday && (
              <button
                onClick={() => removeRestDay(todayStr)}
                className="text-[11px] font-medium text-sanctum-400 bg-sanctum-800/50 hover:bg-sanctum-800 px-2 py-0.5 rounded-full transition-colors"
                data-testid="undo-rest-btn"
              >
                Undo rest
              </button>
            )}
            <span className="text-metal-silver text-sm font-medium">
              Cycle {progress.currentCycle}
            </span>
          </div>
        </div>

        {/* Deload states */}
        {showDeloadAlert && <DeloadAlert />}
        {progress.isDeloadWeek && <ActiveDeloadBanner />}

        {/* Calendar timeline */}
        <CalendarTimeline projection={projection} onDayTap={handleDayTap} />

        {/* Empty state note */}
        {!hasHistory && (
          <p className="text-center text-sanctum-500 text-sm mt-4">
            Start training to refine projections.
          </p>
        )}
      </div>

      {/* Log preview bottom sheet */}
      {selectedLog && (
        <WorkoutLogPreview
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
