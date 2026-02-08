import { Link } from 'react-router-dom';
import { formatRelativeDate } from '../utils/dateFormatter';

interface DayCardProps {
  dayNumber: number;
  dayName: string;
  exerciseCount: number;
  lastWorkoutDate: string | null;
  hasActiveWorkout: boolean;
}

function shouldShowBottomRow(lastWorkoutDate: string | null, hasActiveWorkout: boolean): boolean {
  return lastWorkoutDate !== null || hasActiveWorkout;
}

export function DayCard({
  dayNumber,
  dayName,
  exerciseCount,
  lastWorkoutDate,
  hasActiveWorkout,
}: DayCardProps) {
  return (
    <Link
      to={`/workout/${dayNumber}`}
      className="card-hover block p-4 active:scale-[0.98] transition-transform duration-200 ease-out"
    >
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-0">
          <span className="text-sanctum-400 text-sm">Day {dayNumber}</span>
          <span className="text-sanctum-600 mx-2">&middot;</span>
          <span className="text-sanctum-100 font-medium truncate" title={dayName}>{dayName}</span>
        </div>
        <span className="text-sanctum-500 text-sm">{exerciseCount} exercises</span>
      </div>

      {shouldShowBottomRow(lastWorkoutDate, hasActiveWorkout) && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sanctum-500 text-xs">
            {lastWorkoutDate !== null && `Last: ${formatRelativeDate(lastWorkoutDate)}`}
          </span>
          {hasActiveWorkout && (
            <span className="text-xs font-medium text-blood-400 bg-blood-900/30 border border-blood-800/30 px-2.5 py-0.5 rounded-full">
              Resume
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
