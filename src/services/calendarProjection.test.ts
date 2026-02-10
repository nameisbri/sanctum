import { describe, it, expect } from 'vitest';
import { WorkoutLog, UserProgress } from '../types';
import {
  estimateFrequency,
  getNextWorkoutDay,
  projectFutureDays,
  calculateDeloadWeeks,
  buildCalendarProjection,
} from './calendarProjection';
import { toISODateString, addDays } from '../utils/dateFormatter';

function makeLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: '1',
    date: '2026-02-01',
    cycle: 1,
    dayNumber: 1,
    dayName: 'Chest/Back',
    exercises: [],
    completed: true,
    ...overrides,
  };
}

function makeProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    currentCycle: 1,
    cycleStartDate: '2026-01-01',
    deloadIntervalWeeks: 5,
    isDeloadWeek: false,
    workoutLogs: [],
    restDays: [],
    ...overrides,
  };
}

// --- estimateFrequency ---

describe('estimateFrequency', () => {
  const now = new Date(2026, 1, 10); // Feb 10, 2026

  it('returns default 5/wk when no logs', () => {
    const result = estimateFrequency([], now);
    expect(result.workoutsPerWeek).toBe(5);
    expect(result.confidence).toBe('default');
  });

  it('returns default when fewer than 2 logs in window', () => {
    const logs = [makeLog({ date: '2026-02-09' })];
    const result = estimateFrequency(logs, now);
    expect(result.workoutsPerWeek).toBe(5);
    expect(result.confidence).toBe('default');
  });

  it('calculates correct frequency with regular history', () => {
    // 10 workouts over ~2 weeks → ~5/wk
    const logs: WorkoutLog[] = [];
    for (let i = 0; i < 10; i++) {
      const date = addDays(now, -14 + i * 1.4);
      logs.push(makeLog({ id: String(i), date: toISODateString(date) }));
    }
    const result = estimateFrequency(logs, now);
    expect(result.workoutsPerWeek).toBeGreaterThanOrEqual(3);
    expect(result.workoutsPerWeek).toBeLessThanOrEqual(7);
    expect(result.confidence).toBe('high');
  });

  it('uses only last 4-week window', () => {
    // Logs from 5 weeks ago should be excluded
    const oldLog = makeLog({ id: '0', date: '2026-01-05' });
    const recentLogs = [
      makeLog({ id: '1', date: '2026-02-03' }),
      makeLog({ id: '2', date: '2026-02-05' }),
      makeLog({ id: '3', date: '2026-02-07' }),
    ];
    const result = estimateFrequency([oldLog, ...recentLogs], now);
    expect(result.confidence).toBe('low');
    // Should only count the 3 recent logs
    expect(result.workoutsPerWeek).toBeGreaterThan(0);
  });

  it('excludes deload logs from frequency', () => {
    const logs = [
      makeLog({ id: '1', date: '2026-02-03', isDeload: true }),
      makeLog({ id: '2', date: '2026-02-05', isDeload: true }),
    ];
    const result = estimateFrequency(logs, now);
    expect(result.confidence).toBe('default');
  });
});

// --- getNextWorkoutDay ---

describe('getNextWorkoutDay', () => {
  it('returns day 1 when none completed', () => {
    const progress = makeProgress();
    expect(getNextWorkoutDay(progress)).toEqual({ dayNumber: 1, cycle: 1 });
  });

  it('returns first gap in completed days', () => {
    const progress = makeProgress({
      workoutLogs: [
        makeLog({ dayNumber: 1, cycle: 1 }),
        makeLog({ dayNumber: 2, cycle: 1 }),
        // Day 3 missing
        makeLog({ dayNumber: 4, cycle: 1 }),
      ],
    });
    expect(getNextWorkoutDay(progress)).toEqual({ dayNumber: 3, cycle: 1 });
  });

  it('returns next cycle day 1 when all done', () => {
    const progress = makeProgress({
      currentCycle: 2,
      workoutLogs: [
        makeLog({ dayNumber: 1, cycle: 2 }),
        makeLog({ dayNumber: 2, cycle: 2 }),
        makeLog({ dayNumber: 3, cycle: 2 }),
        makeLog({ dayNumber: 4, cycle: 2 }),
        makeLog({ dayNumber: 5, cycle: 2 }),
        makeLog({ dayNumber: 6, cycle: 2 }),
      ],
    });
    expect(getNextWorkoutDay(progress)).toEqual({ dayNumber: 1, cycle: 3 });
  });
});

// --- projectFutureDays ---

describe('projectFutureDays', () => {
  it('projects correct cycle/day sequencing', () => {
    const start = new Date(2026, 1, 10); // Feb 10
    const result = projectFutureDays(start, 1, 4, 1.4, 8);

    expect(result.length).toBe(8);
    // Should cycle through days 4,5,6,1,2,3,4,5
    expect(result.map(r => r.dayNumber)).toEqual([4, 5, 6, 1, 2, 3, 4, 5]);
    // Cycle should increment after day 6
    expect(result[0].cycle).toBe(1);
    expect(result[3].cycle).toBe(2); // After day 6 → cycle 2
  });

  it('spaces dates by avgDaysBetween', () => {
    const start = new Date(2026, 1, 10);
    const result = projectFutureDays(start, 1, 1, 2, 3);

    expect(result[0].date).toBe('2026-02-10');
    expect(result[1].date).toBe('2026-02-12');
    expect(result[2].date).toBe('2026-02-14');
  });
});

// --- calculateDeloadWeeks ---

describe('calculateDeloadWeeks', () => {
  const now = new Date(2026, 1, 10); // Tuesday Feb 10

  it('places first deload at correct interval from lastDeloadDate', () => {
    const progress = makeProgress({
      lastDeloadDate: '2026-02-01',
      deloadIntervalWeeks: 4,
    });
    const result = calculateDeloadWeeks(progress, { workoutsPerWeek: 5, avgDaysBetweenWorkouts: 1.4, confidence: 'high' }, 2, now);

    expect(result.length).toBe(2);
    // First deload: 4 weeks after Feb 1 = Mar 1 → getMonday gives Feb 23
    expect(result[0].startDate).toBe('2026-02-23');
  });

  it('handles overdue deload — schedules near this week', () => {
    const progress = makeProgress({
      lastDeloadDate: '2025-12-01', // Over 2 months ago
      deloadIntervalWeeks: 4,
    });
    const result = calculateDeloadWeeks(progress, { workoutsPerWeek: 5, avgDaysBetweenWorkouts: 1.4, confidence: 'high' }, 1, now);

    // Should be this week or next since it's overdue
    const deloadStart = new Date(result[0].startDate + 'T12:00:00');
    const diffDays = (deloadStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeLessThanOrEqual(7);
  });

  it('returns 2 deload weeks by default', () => {
    const progress = makeProgress({ deloadIntervalWeeks: 3 });
    const result = calculateDeloadWeeks(progress, { workoutsPerWeek: 5, avgDaysBetweenWorkouts: 1.4, confidence: 'high' }, 2, now);
    expect(result.length).toBe(2);
  });
});

// --- buildCalendarProjection ---

describe('buildCalendarProjection', () => {
  const now = new Date(2026, 1, 10); // Tuesday Feb 10

  it('returns weeks array with cells', () => {
    const progress = makeProgress();
    const result = buildCalendarProjection(progress, now);

    expect(result.weeks.length).toBeGreaterThan(0);
    for (const week of result.weeks) {
      expect(week.cells.length).toBe(7);
    }
  });

  it('marks today correctly', () => {
    const progress = makeProgress();
    const result = buildCalendarProjection(progress, now);

    const todayCells = result.weeks.flatMap(w => w.cells).filter(c => c.isToday);
    expect(todayCells.length).toBe(1);
    expect(todayCells[0].date).toBe('2026-02-10');
    expect(todayCells[0].type).toBe('today');
  });

  it('includes current week row', () => {
    const progress = makeProgress();
    const result = buildCalendarProjection(progress, now);

    const currentWeek = result.weeks.find(w => w.isCurrentWeek);
    expect(currentWeek).toBeDefined();
    expect(currentWeek!.weekLabel).toBe('This Week');
  });

  it('includes past completed workouts', () => {
    const progress = makeProgress({
      workoutLogs: [
        makeLog({ id: '1', date: '2026-02-03', dayNumber: 1, cycle: 1 }),
        makeLog({ id: '2', date: '2026-02-05', dayNumber: 2, cycle: 1 }),
      ],
    });
    const result = buildCalendarProjection(progress, now);

    const completedCells = result.weeks.flatMap(w => w.cells).filter(c => c.type === 'past-completed');
    expect(completedCells.length).toBe(2);
    expect(completedCells[0].workout?.log).toBeDefined();
  });

  it('shows projected future workout days', () => {
    const progress = makeProgress();
    const result = buildCalendarProjection(progress, now);

    const projectedCells = result.weeks.flatMap(w => w.cells).filter(c => c.type === 'projected');
    expect(projectedCells.length).toBeGreaterThan(0);
    // Projected cells should have workout info
    for (const cell of projectedCells) {
      expect(cell.workout).toBeDefined();
    }
  });

  it('includes deload weeks', () => {
    const progress = makeProgress({ deloadIntervalWeeks: 3 });
    const result = buildCalendarProjection(progress, now);

    const deloadWeeks = result.weeks.filter(w => w.isDeloadWeek);
    expect(deloadWeeks.length).toBeGreaterThan(0);
  });

  it('returns frequency estimate', () => {
    const progress = makeProgress();
    const result = buildCalendarProjection(progress, now);

    expect(result.frequency).toBeDefined();
    expect(result.frequency.workoutsPerWeek).toBe(5); // Default
  });

  it('returns nextWorkout info', () => {
    const progress = makeProgress();
    const result = buildCalendarProjection(progress, now);

    expect(result.nextWorkout).toBeDefined();
    expect(result.nextWorkout!.dayNumber).toBe(1);
    expect(result.nextWorkout!.dayName).toBe('Chest/Back');
  });

  it('handles currently in deload week', () => {
    const progress = makeProgress({ isDeloadWeek: true });
    const result = buildCalendarProjection(progress, now);

    const currentWeek = result.weeks.find(w => w.isCurrentWeek);
    expect(currentWeek).toBeDefined();
    expect(currentWeek!.isDeloadWeek).toBe(true);
  });

  it('handles brand-new user (no logs)', () => {
    const progress = makeProgress();
    const result = buildCalendarProjection(progress, now);

    expect(result.frequency.confidence).toBe('default');
    expect(result.weeks.length).toBeGreaterThan(0);
    expect(result.nextWorkout).toBeDefined();
  });

  it('rest day today shifts projection to tomorrow — today cell is explicit-rest', () => {
    const progress = makeProgress({ restDays: ['2026-02-10'] });
    const result = buildCalendarProjection(progress, now);

    const todayCell = result.weeks.flatMap(w => w.cells).find(c => c.date === '2026-02-10');
    expect(todayCell?.type).toBe('explicit-rest');

    // No projected workout should be on today
    expect(todayCell?.workout).toBeUndefined();

    // Tomorrow or later should have projected workouts
    const projectedCells = result.weeks.flatMap(w => w.cells).filter(c => c.type === 'projected');
    expect(projectedCells.length).toBeGreaterThan(0);
    expect(projectedCells.every(c => c.date > '2026-02-10')).toBe(true);
  });

  it('past rest day shows as explicit-rest, not past-missed', () => {
    const progress = makeProgress({ restDays: ['2026-02-05'] });
    const result = buildCalendarProjection(progress, now);

    const restCell = result.weeks.flatMap(w => w.cells).find(c => c.date === '2026-02-05');
    expect(restCell?.type).toBe('explicit-rest');
  });

  it('rest day + completed log same date: log wins (past-completed)', () => {
    const progress = makeProgress({
      restDays: ['2026-02-05'],
      workoutLogs: [
        makeLog({ id: '1', date: '2026-02-05', dayNumber: 1, cycle: 1 }),
      ],
    });
    const result = buildCalendarProjection(progress, now);

    const cell = result.weeks.flatMap(w => w.cells).find(c => c.date === '2026-02-05');
    expect(cell?.type).toBe('past-completed');
  });
});
