import { Check } from 'lucide-react';
import { CalendarCell, DAY_ABBREVS } from '../services/calendarProjection';

interface CalendarDayCellProps {
  cell: CalendarCell;
  onTap: (cell: CalendarCell) => void;
}

export function CalendarDayCell({ cell, onTap }: CalendarDayCellProps) {
  const dayNum = parseInt(cell.date.split('-')[2], 10);
  const isInteractive = cell.type === 'past-completed' || (cell.type === 'today' && !!cell.workout);
  const isDeloadCompleted = cell.type === 'past-completed' && cell.workout?.isDeload;

  let cellClass: string;
  switch (cell.type) {
    case 'past-completed':
      cellClass = isDeloadCompleted
        ? 'bg-metal-gold/10 border-metal-gold/30'
        : 'bg-blood-900/30 border-blood-800';
      break;
    case 'today':
      cellClass = 'border-blood-500 ring-1 ring-blood-500/50 bg-sanctum-900';
      break;
    case 'projected':
      cellClass = 'border-sanctum-700 border-dashed';
      break;
    case 'deload':
      cellClass = 'bg-metal-gold/5 border-metal-gold/20 border-dashed';
      break;
    default: // rest, past-missed
      cellClass = 'border-transparent';
      break;
  }

  const textClass = cell.type === 'past-missed' || cell.type === 'rest'
    ? 'text-sanctum-700'
    : cell.isToday
      ? 'text-sanctum-50 font-bold'
      : 'text-sanctum-300';

  return (
    <button
      onClick={() => isInteractive && onTap(cell)}
      disabled={!isInteractive}
      className={`flex flex-col items-center justify-center rounded-md border min-h-[44px] min-w-[44px] transition-colors ${cellClass} ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
      aria-label={`${cell.date}${cell.workout ? ` — ${cell.workout.dayName}` : ''}${cell.type === 'past-completed' ? ' completed' : ''}`}
    >
      <span className={`text-xs leading-none ${textClass}`}>
        {dayNum}
      </span>

      {cell.type === 'past-completed' && (
        <Check
          size={10}
          className={isDeloadCompleted ? 'text-metal-gold mt-0.5' : 'text-blood-500 mt-0.5'}
        />
      )}

      {cell.type === 'projected' && cell.workout && (
        <span className="text-[8px] text-sanctum-600 leading-none mt-0.5">
          {DAY_ABBREVS[cell.workout.dayNumber]}
        </span>
      )}

      {cell.type === 'today' && cell.workout && (
        <span className="text-[8px] text-blood-400 leading-none mt-0.5">
          {DAY_ABBREVS[cell.workout.dayNumber]}
        </span>
      )}
    </button>
  );
}
