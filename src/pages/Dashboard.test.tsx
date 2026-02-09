import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';

vi.mock('../contexts/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

vi.mock('../services/workoutStateManager', () => ({
  hasActiveWorkout: vi.fn().mockReturnValue(false),
}));

vi.mock('../hooks/useUnits', () => ({
  useUnits: () => ({ unit: 'lb' as const, setUnit: vi.fn() }),
  formatWeight: (lbs: number, unit: string) => `${lbs} ${unit}`,
}));

import { useProgress } from '../contexts/ProgressContext';
import { hasActiveWorkout } from '../services/workoutStateManager';

const mockUseProgress = useProgress as ReturnType<typeof vi.fn>;
const mockHasActiveWorkout = hasActiveWorkout as ReturnType<typeof vi.fn>;

function createMockProgress(overrides: Record<string, unknown> = {}) {
  return {
    progress: {
      currentCycle: 1,
      cycleStartDate: '2026-01-01',
      deloadIntervalWeeks: 5,
      workoutLogs: [],
      ...overrides,
    },
    getLastWorkoutForDay: vi.fn().mockReturnValue(null),
    shouldSuggestDeload: vi.fn().mockReturnValue(false),
    getExerciseHistory: vi.fn().mockReturnValue([]),
    calculateVolume: vi.fn().mockReturnValue(0),
    updateCycle: vi.fn(),
    addWorkoutLog: vi.fn(),
    recordDeload: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    resetProgress: vi.fn(),
  };
}

function renderDashboard(progressOverrides: Record<string, unknown> = {}, mockProgress?: ReturnType<typeof createMockProgress>) {
  const mock = mockProgress ?? createMockProgress(progressOverrides);
  mockUseProgress.mockReturnValue(mock);
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasActiveWorkout.mockReturnValue(false);
  });

  it('renders Sanctum heading', () => {
    renderDashboard();
    expect(screen.getByText('Sanctum')).toBeInTheDocument();
  });

  it('renders cycle number from context', () => {
    renderDashboard({ currentCycle: 3 });
    expect(screen.getByText('Cycle 3')).toBeInTheDocument();
  });

  it('shows deload banner when shouldSuggestDeload returns true', () => {
    const mock = createMockProgress();
    mock.shouldSuggestDeload.mockReturnValue(true);
    renderDashboard({}, mock);
    expect(screen.getByText('Consider a deload. The body rebuilds in rest.')).toBeInTheDocument();
  });

  it('hides deload banner when shouldSuggestDeload returns false', () => {
    renderDashboard();
    expect(screen.queryByText('Consider a deload. The body rebuilds in rest.')).not.toBeInTheDocument();
  });

  it('renders 6 day cards', () => {
    renderDashboard();
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 2')).toBeInTheDocument();
    expect(screen.getByText('Day 3')).toBeInTheDocument();
    expect(screen.getByText('Day 4')).toBeInTheDocument();
    expect(screen.getByText('Day 5')).toBeInTheDocument();
    expect(screen.getByText('Day 6')).toBeInTheDocument();
  });

  it('shows correct total sessions count', () => {
    renderDashboard({
      workoutLogs: [
        { id: '1', date: '2026-02-01', cycle: 1, dayNumber: 1, dayName: 'Chest/Back', exercises: [], completed: true },
        { id: '2', date: '2026-02-02', cycle: 1, dayNumber: 2, dayName: 'Shoulders/Arms', exercises: [], completed: true },
        { id: '3', date: '2026-02-03', cycle: 1, dayNumber: 3, dayName: 'Legs (A)', exercises: [], completed: false },
      ],
    });
    const totalEl = screen.getByText(/total sessions/);
    expect(totalEl.textContent).toContain('2');
  });

  it('shows 0 of 6 this cycle when no workouts completed for current cycle', () => {
    renderDashboard();
    const cycleEl = screen.getByText(/of 6 this cycle/);
    expect(cycleEl.textContent).toContain('0');
  });

  it('shows "Last trained: Never" when no workouts exist', () => {
    renderDashboard();
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(screen.getByText(/Last trained:/)).toBeInTheDocument();
  });

  it('shows last trained date when workouts exist', () => {
    renderDashboard({
      workoutLogs: [
        { id: '1', date: '2026-02-06', cycle: 1, dayNumber: 1, dayName: 'Chest/Back', exercises: [], completed: true },
      ],
    });
    expect(screen.getByText(/Last trained:/)).toBeInTheDocument();
    expect(screen.getByText('Feb 6')).toBeInTheDocument();
  });

  it('does not show workout preview on initial render', () => {
    renderDashboard();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens workout preview when a DayCard is clicked', async () => {
    renderDashboard();
    const buttons = screen.getAllByRole('button');
    // First button is Day 1 card (deload button not rendered by default)
    await userEvent.click(buttons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Day 1 — Chest\/Back/)).toBeInTheDocument();
  });
});
