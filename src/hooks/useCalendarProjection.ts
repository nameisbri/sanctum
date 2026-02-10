import { useMemo } from 'react';
import { UserProgress } from '../types';
import { buildCalendarProjection, CalendarProjection } from '../services/calendarProjection';

export function useCalendarProjection(progress: UserProgress): CalendarProjection {
  return useMemo(
    () => buildCalendarProjection(progress),
    [progress.workoutLogs, progress.currentCycle, progress.isDeloadWeek, progress.lastDeloadDate, progress.deloadIntervalWeeks, progress.restDays],
  );
}
