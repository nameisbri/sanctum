import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Plan } from './Plan';
import { CalendarProjection } from '../services/calendarProjection';

vi.mock('../contexts/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

vi.mock('../hooks/useCalendarProjection', () => ({
  useCalendarProjection: vi.fn(),
}));

vi.mock('../hooks/useUnits', () => ({
  useUnits: () => ({ unit: 'lb' as const, setUnit: vi.fn() }),
  formatWeight: (lbs: number, unit: string) => `${lbs} ${unit}`,
  formatVolumeWithUnit: (vol: number) => `${vol} lb`,
}));

import { useProgress } from '../contexts/ProgressContext';
import { useCalendarProjection } from '../hooks/useCalendarProjection';

const mockUseProgress = useProgress as ReturnType<typeof vi.fn>;
const mockUseCalendarProjection = useCalendarProjection as ReturnType<typeof vi.fn>;

function makeProjection(overrides: Partial<CalendarProjection> = {}): CalendarProjection {
  return {
    frequency: { workoutsPerWeek: 5, avgDaysBetweenWorkouts: 1.4, confidence: 'default' },
    nextWorkout: { dayNumber: 1, dayName: 'Chest/Back', cycle: 1 },
    weeks: [
      {
        weekLabel: 'Jan 26 – Feb 1',
        weekStartDate: '2026-01-26',
        isCurrentWeek: false,
        isDeloadWeek: false,
        cells: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-01-${26 + i}`,
          dayOfWeek: i,
          isToday: false,
          type: 'rest' as const,
        })),
      },
      {
        weekLabel: 'This Week',
        weekStartDate: '2026-02-09',
        isCurrentWeek: true,
        isDeloadWeek: false,
        cells: [
          { date: '2026-02-09', dayOfWeek: 0, isToday: false, type: 'past-missed' as const },
          { date: '2026-02-10', dayOfWeek: 1, isToday: true, type: 'today' as const, workout: { dayNumber: 1, dayName: 'Chest/Back', cycle: 1 } },
          { date: '2026-02-11', dayOfWeek: 2, isToday: false, type: 'projected' as const, workout: { dayNumber: 2, dayName: 'Shoulders/Arms', cycle: 1 } },
          { date: '2026-02-12', dayOfWeek: 3, isToday: false, type: 'projected' as const, workout: { dayNumber: 3, dayName: 'Legs (A)', cycle: 1 } },
          { date: '2026-02-13', dayOfWeek: 4, isToday: false, type: 'rest' as const },
          { date: '2026-02-14', dayOfWeek: 5, isToday: false, type: 'projected' as const, workout: { dayNumber: 4, dayName: 'Pull', cycle: 1 } },
          { date: '2026-02-15', dayOfWeek: 6, isToday: false, type: 'rest' as const },
        ],
      },
      {
        weekLabel: '\u2605 Deload Week',
        weekStartDate: '2026-03-02',
        isCurrentWeek: false,
        isDeloadWeek: true,
        cells: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-03-0${2 + i}`,
          dayOfWeek: i,
          isToday: false,
          type: 'deload' as const,
        })),
      },
    ],
    ...overrides,
  };
}

function createMockProgress(overrides: Record<string, unknown> = {}) {
  return {
    progress: {
      currentCycle: 1,
      cycleStartDate: '2026-01-01',
      deloadIntervalWeeks: 5,
      isDeloadWeek: false,
      workoutLogs: [],
      restDays: [],
      ...overrides,
    },
    shouldSuggestDeload: vi.fn().mockReturnValue(false),
    getLogsForCycle: vi.fn().mockReturnValue([]),
    getCycleNumbers: vi.fn().mockReturnValue([1]),
    startDeload: vi.fn(),
    endDeload: vi.fn(),
    recordDeload: vi.fn(),
    getLastWorkoutForDay: vi.fn().mockReturnValue(null),
    getExerciseHistory: vi.fn().mockReturnValue([]),
    calculateVolume: vi.fn().mockReturnValue(0),
    updateCycle: vi.fn(),
    addWorkoutLog: vi.fn(),
    addRestDay: vi.fn(),
    removeRestDay: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    resetProgress: vi.fn(),
    updateDeloadInterval: vi.fn(),
  };
}

function renderPlan(mockProgress?: ReturnType<typeof createMockProgress>, projection?: CalendarProjection) {
  const mock = mockProgress ?? createMockProgress();
  mockUseProgress.mockReturnValue(mock);
  mockUseCalendarProjection.mockReturnValue(projection ?? makeProjection());
  return render(
    <MemoryRouter>
      <Plan />
    </MemoryRouter>
  );
}

describe('Plan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Plan heading', () => {
    renderPlan();
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('renders cycle number', () => {
    const mock = createMockProgress({ currentCycle: 3 });
    renderPlan(mock);
    expect(screen.getByText('Cycle 3')).toBeInTheDocument();
  });

  it('renders day-of-week headers', () => {
    renderPlan();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('shows "This Week" label', () => {
    renderPlan();
    expect(screen.getByText('This Week')).toBeInTheDocument();
  });

  it('shows deload weeks with gold star', () => {
    renderPlan();
    expect(screen.getByText(/Deload Week/)).toBeInTheDocument();
  });

  it('shows frequency badge', () => {
    renderPlan();
    expect(screen.getByTestId('frequency-badge')).toHaveTextContent('~5x/wk');
  });

  it('shows empty state note when no history', () => {
    renderPlan();
    expect(screen.getByText('Start training to refine projections.')).toBeInTheDocument();
  });

  it('hides empty state when logs exist', () => {
    const mock = createMockProgress({
      workoutLogs: [{ id: '1', date: '2026-02-01', cycle: 1, dayNumber: 1, dayName: 'Chest/Back', exercises: [], completed: true }],
    });
    renderPlan(mock);
    expect(screen.queryByText('Start training to refine projections.')).not.toBeInTheDocument();
  });

  it('shows DeloadAlert when deload suggested and not in deload week', () => {
    const mock = createMockProgress();
    mock.shouldSuggestDeload.mockReturnValue(true);
    renderPlan(mock);
    expect(screen.getByText('Time for a Deload')).toBeInTheDocument();
  });

  it('hides DeloadAlert when deload not suggested', () => {
    renderPlan();
    expect(screen.queryByText('Time for a Deload')).not.toBeInTheDocument();
  });

  it('shows ActiveDeloadBanner when isDeloadWeek is true', () => {
    const mock = createMockProgress({ isDeloadWeek: true });
    renderPlan(mock);
    // ActiveDeloadBanner shows "Deload Week — Use lighter weights..."
    expect(screen.getByText(/Use lighter weights/)).toBeInTheDocument();
  });

  it('hides DeloadAlert when in deload week even if suggested', () => {
    const mock = createMockProgress({ isDeloadWeek: true });
    mock.shouldSuggestDeload.mockReturnValue(true);
    renderPlan(mock);
    expect(screen.queryByText('Time for a Deload')).not.toBeInTheDocument();
  });

  it('calls startDeload when "Yes, deload" is clicked', async () => {
    const mock = createMockProgress();
    mock.shouldSuggestDeload.mockReturnValue(true);
    renderPlan(mock);
    await userEvent.click(screen.getByText('Yes, deload'));
    expect(mock.startDeload).toHaveBeenCalled();
  });

  it('calls recordDeload when "Continue training" is clicked', async () => {
    const mock = createMockProgress();
    mock.shouldSuggestDeload.mockReturnValue(true);
    renderPlan(mock);
    await userEvent.click(screen.getByText('Continue training'));
    expect(mock.recordDeload).toHaveBeenCalled();
  });

  it('calls endDeload when "End Deload" is clicked', async () => {
    const mock = createMockProgress({ isDeloadWeek: true });
    renderPlan(mock);
    await userEvent.click(screen.getByText('End Deload'));
    expect(mock.endDeload).toHaveBeenCalled();
  });

  it('shows frequency note at bottom', () => {
    renderPlan();
    expect(screen.getByTestId('frequency-note')).toHaveTextContent('Based on ~5 workouts/week');
  });

  it('shows "Rest today" button when today has projected workout', () => {
    renderPlan();
    expect(screen.getByTestId('rest-today-btn')).toHaveTextContent('Rest today');
  });

  it('shows "Undo rest" button when rest is marked for today', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const mock = createMockProgress({ restDays: [todayStr] });
    // When rest is marked, today cell becomes explicit-rest (no workout)
    const projection = makeProjection({
      weeks: [
        {
          weekLabel: 'This Week',
          weekStartDate: '2026-02-09',
          isCurrentWeek: true,
          isDeloadWeek: false,
          cells: [
            { date: '2026-02-09', dayOfWeek: 0, isToday: false, type: 'past-missed' as const },
            { date: todayStr, dayOfWeek: 1, isToday: true, type: 'explicit-rest' as const },
            { date: '2026-02-11', dayOfWeek: 2, isToday: false, type: 'projected' as const, workout: { dayNumber: 1, dayName: 'Chest/Back', cycle: 1 } },
            { date: '2026-02-12', dayOfWeek: 3, isToday: false, type: 'projected' as const, workout: { dayNumber: 2, dayName: 'Shoulders/Arms', cycle: 1 } },
            { date: '2026-02-13', dayOfWeek: 4, isToday: false, type: 'rest' as const },
            { date: '2026-02-14', dayOfWeek: 5, isToday: false, type: 'projected' as const, workout: { dayNumber: 3, dayName: 'Legs (A)', cycle: 1 } },
            { date: '2026-02-15', dayOfWeek: 6, isToday: false, type: 'rest' as const },
          ],
        },
      ],
    });
    renderPlan(mock, projection);
    expect(screen.getByTestId('undo-rest-btn')).toHaveTextContent('Undo rest');
    expect(screen.queryByTestId('rest-today-btn')).not.toBeInTheDocument();
  });

  it('hides rest button during deload week', () => {
    const mock = createMockProgress({ isDeloadWeek: true });
    renderPlan(mock);
    expect(screen.queryByTestId('rest-today-btn')).not.toBeInTheDocument();
  });

  it('clicking "Rest today" calls addRestDay', async () => {
    const mock = createMockProgress();
    renderPlan(mock);
    await userEvent.click(screen.getByTestId('rest-today-btn'));
    expect(mock.addRestDay).toHaveBeenCalled();
  });

  it('clicking "Undo rest" calls removeRestDay', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const mock = createMockProgress({ restDays: [todayStr] });
    const projection = makeProjection({
      weeks: [
        {
          weekLabel: 'This Week',
          weekStartDate: '2026-02-09',
          isCurrentWeek: true,
          isDeloadWeek: false,
          cells: [
            { date: '2026-02-09', dayOfWeek: 0, isToday: false, type: 'past-missed' as const },
            { date: todayStr, dayOfWeek: 1, isToday: true, type: 'explicit-rest' as const },
            { date: '2026-02-11', dayOfWeek: 2, isToday: false, type: 'projected' as const, workout: { dayNumber: 1, dayName: 'Chest/Back', cycle: 1 } },
            { date: '2026-02-12', dayOfWeek: 3, isToday: false, type: 'rest' as const },
            { date: '2026-02-13', dayOfWeek: 4, isToday: false, type: 'rest' as const },
            { date: '2026-02-14', dayOfWeek: 5, isToday: false, type: 'rest' as const },
            { date: '2026-02-15', dayOfWeek: 6, isToday: false, type: 'rest' as const },
          ],
        },
      ],
    });
    renderPlan(mock, projection);
    await userEvent.click(screen.getByTestId('undo-rest-btn'));
    expect(mock.removeRestDay).toHaveBeenCalled();
  });
});
