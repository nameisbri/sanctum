import { useEffect, useRef } from 'react';
import { CalendarProjection, CalendarCell } from '../services/calendarProjection';
import { CalendarDayCell } from './CalendarDayCell';

interface CalendarTimelineProps {
  projection: CalendarProjection;
  onDayTap: (cell: CalendarCell) => void;
}

const DOW_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarTimeline({ projection, onDayTap }: CalendarTimelineProps) {
  const currentWeekRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentWeekRef.current?.scrollIntoView?.({ block: 'center', behavior: 'auto' });
  }, []);

  return (
    <div className="space-y-1">
      {/* Sticky day-of-week header */}
      <div className="sticky top-0 z-10 bg-sanctum-950 pb-2 pt-1">
        <div className="grid grid-cols-7 gap-1">
          {DOW_HEADERS.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-sanctum-600 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Week rows */}
      {projection.weeks.map(week => (
        <div
          key={week.weekStartDate}
          ref={week.isCurrentWeek ? currentWeekRef : undefined}
        >
          {/* Week label */}
          <div className="flex items-center gap-2 mb-1 mt-2">
            <div className={`h-px flex-1 ${week.isDeloadWeek ? 'bg-metal-gold/20' : 'bg-sanctum-800'}`} />
            <span className={`text-[10px] font-medium tracking-wide ${
              week.isCurrentWeek
                ? 'text-blood-400'
                : week.isDeloadWeek
                  ? 'text-metal-gold'
                  : 'text-sanctum-600'
            }`}>
              {week.isDeloadWeek && !week.isCurrentWeek ? '\u2605 ' : ''}
              {week.weekLabel}
            </span>
            <div className={`h-px flex-1 ${week.isDeloadWeek ? 'bg-metal-gold/20' : 'bg-sanctum-800'}`} />
          </div>

          {/* Cells grid */}
          <div className="grid grid-cols-7 gap-1">
            {week.cells.map(cell => (
              <CalendarDayCell key={cell.date} cell={cell} onTap={onDayTap} />
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 pb-1">
        <LegendItem color="bg-blood-900/30 border-blood-800" label="Completed" />
        <LegendItem color="border-sanctum-700 border-dashed" label="Projected" />
        <LegendItem color="bg-metal-gold/10 border-metal-gold/30" label="Deload" />
        <LegendItem color="border-blood-500 ring-1 ring-blood-500/50" label="Today" />
      </div>

      {/* Frequency note */}
      <p className="text-[10px] text-sanctum-600 text-center" data-testid="frequency-note">
        Based on ~{Math.round(projection.frequency.workoutsPerWeek)} workouts/week
      </p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-sm border ${color}`} />
      <span className="text-[10px] text-sanctum-500">{label}</span>
    </div>
  );
}
