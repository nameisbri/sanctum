import { useEffect } from 'react';
import { X } from 'lucide-react';
import { WorkoutLog } from '../types';
import { useUnits, formatWeight, formatVolumeWithUnit } from '../hooks/useUnits';

interface WorkoutLogPreviewProps {
  log: WorkoutLog;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function WorkoutLogPreview({ log, onClose }: WorkoutLogPreviewProps) {
  const { unit } = useUnits();

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${log.dayName} session log`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-sanctum-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        data-testid="log-preview-backdrop"
      />

      {/* Panel */}
      <div className="relative w-full bg-sanctum-900 border-t border-sanctum-700 rounded-t-2xl animate-slide-up-sheet max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-sanctum-50">
              Day {log.dayNumber} — {log.dayName}
            </h2>
            <p className="text-xs text-sanctum-500 mt-0.5">{formatDate(log.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-sanctum-400 hover:text-sanctum-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close log preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 px-5 pb-3 text-xs text-sanctum-400">
          {log.totalVolume != null && log.totalVolume > 0 && (
            <span>Vol: <span className="text-sanctum-300">{formatVolumeWithUnit(log.totalVolume, unit)}</span></span>
          )}
          {log.duration != null && log.duration > 0 && (
            <span>Duration: <span className="text-sanctum-300">{formatDuration(log.duration)}</span></span>
          )}
          {log.isDeload && (
            <span className="text-metal-gold">Deload</span>
          )}
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-5 pb-5 max-h-[60vh]">
          <ul className="space-y-3">
            {log.exercises.map((ex, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-sanctum-500 text-sm w-5 text-right flex-shrink-0 pt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sanctum-100 text-sm">
                    {ex.replacedWith || ex.exerciseName}
                  </span>
                  {ex.skipped ? (
                    <p className="text-sanctum-600 text-xs italic">Skipped</p>
                  ) : (
                    <div className="flex flex-wrap gap-x-3 mt-0.5">
                      {ex.sets.filter(s => s.completed).map((set, si) => (
                        <span key={si} className="text-sanctum-400 text-xs">
                          {set.weight != null ? formatWeight(set.weight, unit) : '—'} × {set.reps ?? '—'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
