import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { WorkoutLog } from '../types';
import { sanctumProgram } from '../data/program';

interface CycleGridProps {
  cycle: number;
  isCurrent: boolean;
  logs: WorkoutLog[];
  onDayTap: (log: WorkoutLog) => void;
}

const DAY_ABBREVS = sanctumProgram.workoutDays.map(d => {
  const parts = d.name.split('/');
  if (parts.length > 1) {
    return parts.map(p => p.trim()[0]).join('/');
  }
  return d.name.length > 4 ? d.name.slice(0, 4) : d.name;
});

export function CycleGrid({ cycle, isCurrent, logs, onDayTap }: CycleGridProps) {
  const navigate = useNavigate();

  const logByDay = new Map<number, WorkoutLog>();
  for (const log of logs) {
    const existing = logByDay.get(log.dayNumber);
    if (!existing || new Date(log.date) > new Date(existing.date)) {
      logByDay.set(log.dayNumber, log);
    }
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-sanctum-300 mb-2">
        Cycle {cycle}
        {isCurrent && (
          <span className="ml-2 text-xs text-blood-400">(current)</span>
        )}
      </h3>
      <div className="grid grid-cols-6 gap-2">
        {sanctumProgram.workoutDays.map((day, i) => {
          const log = logByDay.get(day.dayNumber);
          const completed = !!log?.completed;
          const isDeload = !!log?.isDeload;

          let cellClass: string;
          let onClick: (() => void) | undefined;

          if (completed && isDeload) {
            cellClass = 'bg-metal-gold/10 border-metal-gold/30 cursor-pointer';
            onClick = () => onDayTap(log!);
          } else if (completed) {
            cellClass = 'bg-blood-900/30 border-blood-800 cursor-pointer';
            onClick = () => onDayTap(log!);
          } else if (isCurrent) {
            cellClass = 'bg-sanctum-900 border-sanctum-700 cursor-pointer';
            onClick = () => navigate(`/workout/${day.dayNumber}`);
          } else {
            cellClass = 'bg-sanctum-900/50 border-sanctum-800 text-sanctum-600';
          }

          return (
            <button
              key={day.dayNumber}
              onClick={onClick}
              disabled={!onClick}
              className={`relative flex flex-col items-center justify-center rounded-lg border p-2.5 min-h-[52px] transition-colors ${cellClass}`}
              aria-label={`Day ${day.dayNumber} ${day.name}${completed ? ' — completed' : ''}`}
            >
              <span className={`text-sm font-medium ${completed ? 'text-sanctum-100' : isCurrent ? 'text-sanctum-300' : 'text-sanctum-600'}`}>
                {day.dayNumber}
              </span>
              {completed && (
                <Check size={12} className={isDeload ? 'text-metal-gold' : 'text-blood-500'} />
              )}
              {isCurrent && (
                <span className="text-[10px] text-sanctum-500 mt-0.5 leading-none">
                  {DAY_ABBREVS[i]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
