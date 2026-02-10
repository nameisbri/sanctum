import { UserProgress, WorkoutLog } from '../types';
import { sanctumProgram } from '../data/program';
import {
  parseLocalDate,
  getMonday,
  addDays,
  toISODateString,
  formatWeekRange,
} from '../utils/dateFormatter';

// --- Types ---

export interface FrequencyEstimate {
  workoutsPerWeek: number;
  avgDaysBetweenWorkouts: number;
  confidence: 'default' | 'low' | 'high';
}

export type CalendarCellType =
  | 'past-completed'
  | 'past-missed'
  | 'today'
  | 'projected'
  | 'rest'
  | 'deload'
  | 'explicit-rest';

export interface CalendarCell {
  date: string; // ISO YYYY-MM-DD
  dayOfWeek: number; // 0=Mon, 6=Sun
  isToday: boolean;
  type: CalendarCellType;
  workout?: {
    dayNumber: number;
    dayName: string;
    cycle: number;
    log?: WorkoutLog;
    isDeload?: boolean;
  };
}

export interface CalendarWeekRow {
  weekLabel: string;
  weekStartDate: string; // Monday ISO
  isCurrentWeek: boolean;
  isDeloadWeek: boolean;
  cells: CalendarCell[];
}

export interface CalendarProjection {
  frequency: FrequencyEstimate;
  weeks: CalendarWeekRow[];
  nextWorkout: { dayNumber: number; dayName: string; cycle: number } | null;
}

// --- Constants ---

const DAYS_PER_CYCLE = sanctumProgram.daysPerCycle; // 6
const DEFAULT_WORKOUTS_PER_WEEK = 5;
const FREQUENCY_WINDOW_DAYS = 28; // 4 weeks
const MIN_LOGS_FOR_ESTIMATE = 2;

// --- Day name abbreviations ---

const DAY_ABBREVS: Record<number, string> = {};
for (const d of sanctumProgram.workoutDays) {
  const parts = d.name.split('/');
  if (parts.length > 1) {
    DAY_ABBREVS[d.dayNumber] = parts.map(p => p.trim()[0]).join('/');
  } else {
    DAY_ABBREVS[d.dayNumber] = d.name.length > 4 ? d.name.slice(0, 4) : d.name;
  }
}

export { DAY_ABBREVS };

// --- Pure functions ---

export function estimateFrequency(workoutLogs: WorkoutLog[], now: Date = new Date()): FrequencyEstimate {
  const cutoff = addDays(now, -FREQUENCY_WINDOW_DAYS);
  const cutoffStr = toISODateString(cutoff);

  const recentLogs = workoutLogs
    .filter(l => l.completed && l.date >= cutoffStr && !l.isDeload)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (recentLogs.length < MIN_LOGS_FOR_ESTIMATE) {
    return {
      workoutsPerWeek: DEFAULT_WORKOUTS_PER_WEEK,
      avgDaysBetweenWorkouts: 7 / DEFAULT_WORKOUTS_PER_WEEK,
      confidence: 'default',
    };
  }

  // Count unique workout dates
  const uniqueDates = new Set(recentLogs.map(l => l.date));
  const firstDate = parseLocalDate(recentLogs[0].date);
  const daySpan = Math.max(1, Math.round((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
  const weekSpan = daySpan / 7;

  const workoutsPerWeek = Math.round((uniqueDates.size / weekSpan) * 10) / 10;
  const clampedPerWeek = Math.max(1, Math.min(7, workoutsPerWeek));
  const avgDaysBetween = Math.round((7 / clampedPerWeek) * 10) / 10;

  return {
    workoutsPerWeek: clampedPerWeek,
    avgDaysBetweenWorkouts: avgDaysBetween,
    confidence: recentLogs.length >= 6 ? 'high' : 'low',
  };
}

export function getNextWorkoutDay(progress: UserProgress): { dayNumber: number; cycle: number } {
  const { currentCycle, workoutLogs } = progress;

  // Find completed day numbers in the current cycle
  const completedInCycle = new Set(
    workoutLogs
      .filter(l => l.cycle === currentCycle && l.completed)
      .map(l => l.dayNumber)
  );

  // Find first uncompleted day
  for (let d = 1; d <= DAYS_PER_CYCLE; d++) {
    if (!completedInCycle.has(d)) {
      return { dayNumber: d, cycle: currentCycle };
    }
  }

  // All done in current cycle → next cycle, day 1
  return { dayNumber: 1, cycle: currentCycle + 1 };
}

export interface ProjectedDay {
  date: string;
  dayNumber: number;
  cycle: number;
  dayName: string;
}

export function projectFutureDays(
  startDate: Date,
  startCycle: number,
  startDay: number,
  avgDaysBetween: number,
  count: number,
): ProjectedDay[] {
  const result: ProjectedDay[] = [];
  let currentDate = startDate;
  let day = startDay;
  let cycle = startCycle;

  for (let i = 0; i < count; i++) {
    const workoutDay = sanctumProgram.workoutDays.find(d => d.dayNumber === day);
    result.push({
      date: toISODateString(currentDate),
      dayNumber: day,
      cycle,
      dayName: workoutDay?.name ?? `Day ${day}`,
    });

    // Advance day
    day++;
    if (day > DAYS_PER_CYCLE) {
      day = 1;
      cycle++;
    }

    // Advance date by avg gap (round to nearest integer)
    currentDate = addDays(currentDate, Math.round(avgDaysBetween));
  }

  return result;
}

export interface DeloadWeek {
  startDate: string; // Monday ISO
  endDate: string; // Sunday ISO
}

export function calculateDeloadWeeks(
  progress: UserProgress,
  _frequency: FrequencyEstimate,
  count: number = 2,
  now: Date = new Date(),
): DeloadWeek[] {
  const { lastDeloadDate, deloadIntervalWeeks } = progress;

  // Find anchor point: last deload date or cycle start
  const anchorStr = lastDeloadDate || progress.cycleStartDate;
  const anchor = parseLocalDate(anchorStr);

  const deloadWeeks: DeloadWeek[] = [];
  let nextDeloadTarget = addDays(anchor, deloadIntervalWeeks * 7);

  for (let i = 0; i < count; i++) {
    // If the target is in the past, shift forward
    if (i === 0 && nextDeloadTarget.getTime() < now.getTime()) {
      // Deload is overdue — schedule it for this week or next
      const monday = getMonday(now);
      const todayDow = now.getDay() === 0 ? 6 : now.getDay() - 1;
      // If it's early in the week (Mon-Wed), use this week; otherwise next week
      if (todayDow <= 2) {
        nextDeloadTarget = monday;
      } else {
        nextDeloadTarget = addDays(monday, 7);
      }
    }

    const deloadMonday = getMonday(nextDeloadTarget);
    const deloadSunday = addDays(deloadMonday, 6);

    deloadWeeks.push({
      startDate: toISODateString(deloadMonday),
      endDate: toISODateString(deloadSunday),
    });

    // Next deload is interval weeks after this one ends
    nextDeloadTarget = addDays(deloadMonday, (deloadIntervalWeeks + 1) * 7);
  }

  return deloadWeeks;
}

export function buildCalendarProjection(
  progress: UserProgress,
  now: Date = new Date(),
): CalendarProjection {
  const todayStr = toISODateString(now);
  const frequency = estimateFrequency(progress.workoutLogs, now);
  const nextWk = getNextWorkoutDay(progress);
  const nextWorkoutInfo = sanctumProgram.workoutDays.find(d => d.dayNumber === nextWk.dayNumber);

  // Deload weeks
  const deloadWeeks = progress.isDeloadWeek
    ? [] // If currently in deload, no future deloads needed in the short term
    : calculateDeloadWeeks(progress, frequency, 2, now);

  const deloadDateSet = new Set<string>();
  for (const dw of deloadWeeks) {
    const start = parseLocalDate(dw.startDate);
    for (let i = 0; i < 7; i++) {
      deloadDateSet.add(toISODateString(addDays(start, i)));
    }
  }

  // Rest days set
  const restDaySet = new Set(progress.restDays ?? []);

  // Build past log map: date → WorkoutLog (most recent per date)
  const logByDate = new Map<string, WorkoutLog>();
  for (const log of progress.workoutLogs) {
    if (!log.completed) continue;
    const existing = logByDate.get(log.date);
    if (!existing || log.id > existing.id) {
      logByDate.set(log.date, log);
    }
  }

  // Project future workout days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If today is an explicit rest day, start projecting from tomorrow
  const projectionStart = restDaySet.has(todayStr) ? addDays(today, 1) : today;

  // Project enough days to cover ~2 deload cycles ahead (~12 weeks = ~60 workouts)
  const projectedDays = projectFutureDays(
    projectionStart,
    nextWk.cycle,
    nextWk.dayNumber,
    frequency.avgDaysBetweenWorkouts,
    60,
  );

  const projectedByDate = new Map<string, ProjectedDay>();
  for (const pd of projectedDays) {
    // Don't project on dates that fall in deload weeks or explicit rest days
    if (!deloadDateSet.has(pd.date) && !restDaySet.has(pd.date)) {
      if (!projectedByDate.has(pd.date)) {
        projectedByDate.set(pd.date, pd);
      }
    }
  }

  // Determine the date range: ~3 weeks back to end of last deload week
  const rangeStart = getMonday(addDays(now, -21));
  let rangeEnd: Date;
  if (deloadWeeks.length > 0) {
    rangeEnd = parseLocalDate(deloadWeeks[deloadWeeks.length - 1].endDate);
  } else {
    // Currently in deload: show ~4 weeks ahead
    rangeEnd = addDays(now, 28);
  }
  const rangeEndMonday = getMonday(rangeEnd);
  const rangeEndSunday = addDays(rangeEndMonday, 6);

  // Build week rows
  const weeks: CalendarWeekRow[] = [];
  let weekMonday = rangeStart;

  while (weekMonday.getTime() <= rangeEndSunday.getTime()) {
    const mondayStr = toISODateString(weekMonday);
    const todayMonday = getMonday(now);
    const isCurrentWeek = toISODateString(todayMonday) === mondayStr;

    // Check if this week is a deload week
    const isDeloadWeek = progress.isDeloadWeek && isCurrentWeek
      ? true
      : deloadWeeks.some(dw => dw.startDate === mondayStr);

    const cells: CalendarCell[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const cellDate = addDays(weekMonday, dow);
      const cellDateStr = toISODateString(cellDate);
      const isToday = cellDateStr === todayStr;
      const isPast = cellDate.getTime() < today.getTime();
      const log = logByDate.get(cellDateStr);
      const projected = projectedByDate.get(cellDateStr);

      let type: CalendarCellType;
      let workout: CalendarCell['workout'];

      if (log) {
        // Log always wins — past-completed takes priority over everything
        type = 'past-completed';
        workout = {
          dayNumber: log.dayNumber,
          dayName: log.dayName,
          cycle: log.cycle,
          log,
          isDeload: log.isDeload,
        };
      } else if (restDaySet.has(cellDateStr)) {
        type = 'explicit-rest';
      } else if (isToday) {
        type = 'today';
        if (projected) {
          workout = {
            dayNumber: projected.dayNumber,
            dayName: projected.dayName,
            cycle: projected.cycle,
          };
        }
      } else if (isDeloadWeek && !isPast) {
        type = 'deload';
      } else if (projected && !isPast) {
        type = 'projected';
        workout = {
          dayNumber: projected.dayNumber,
          dayName: projected.dayName,
          cycle: projected.cycle,
        };
      } else if (isPast) {
        type = 'past-missed';
      } else {
        type = 'rest';
      }

      cells.push({ date: cellDateStr, dayOfWeek: dow, isToday, type, workout });
    }

    let weekLabel: string;
    if (isCurrentWeek) {
      weekLabel = 'This Week';
    } else if (isDeloadWeek) {
      weekLabel = 'Deload Week';
    } else {
      weekLabel = formatWeekRange(mondayStr);
    }

    weeks.push({ weekLabel, weekStartDate: mondayStr, isCurrentWeek, isDeloadWeek, cells });

    weekMonday = addDays(weekMonday, 7);
  }

  return {
    frequency,
    weeks,
    nextWorkout: nextWorkoutInfo
      ? { dayNumber: nextWk.dayNumber, dayName: nextWorkoutInfo.name, cycle: nextWk.cycle }
      : null,
  };
}
