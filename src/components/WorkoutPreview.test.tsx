import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { WorkoutPreview } from './WorkoutPreview';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

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

function renderPreview(dayNumber = 1, onClose = vi.fn()) {
  mockUseProgress.mockReturnValue({
    getLastWorkoutForDay: vi.fn().mockReturnValue(null),
  });
  return {
    onClose,
    ...render(
      <MemoryRouter>
        <WorkoutPreview dayNumber={dayNumber} onClose={onClose} />
      </MemoryRouter>
    ),
  };
}

describe('WorkoutPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasActiveWorkout.mockReturnValue(false);
  });

  it('renders day name and exercises for Day 1', () => {
    renderPreview(1);
    expect(screen.getByText(/Chest\/Back/)).toBeInTheDocument();
    expect(screen.getByText('Incline Barbell Press')).toBeInTheDocument();
    expect(screen.getByText('T Bar Upper Back Row into Kelso Shrug')).toBeInTheDocument();
  });

  it('renders all exercises for the day', () => {
    renderPreview(1);
    // Day 1 has 8 exercises
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(8);
  });

  it('shows category badges', () => {
    renderPreview(1);
    const chestBadges = screen.getAllByText('chest');
    expect(chestBadges.length).toBeGreaterThan(0);
    const backBadges = screen.getAllByText('back');
    expect(backBadges.length).toBeGreaterThan(0);
  });

  it('shows sets and reps', () => {
    renderPreview(1);
    const setsReps = screen.getAllByText(/2 × 6-12/);
    expect(setsReps.length).toBeGreaterThan(0);
  });

  it('shows /side indicator for perSide exercises', () => {
    renderPreview(1); // Day 1 has Single Arm Cable Row with perSide
    expect(screen.getByText(/\/side/)).toBeInTheDocument();
  });

  it('shows exercise notes when present', () => {
    renderPreview(2); // Day 2 has 21s Ez Bar Bicep Curl with notes
    expect(screen.getByText('7 bottom half + 7 top half + 7 full ROM')).toBeInTheDocument();
  });

  it('shows "Start Workout" by default', () => {
    renderPreview(1);
    expect(screen.getByRole('button', { name: 'Start Workout' })).toBeInTheDocument();
  });

  it('shows "Resume Workout" when active workout exists', () => {
    mockHasActiveWorkout.mockReturnValue(true);
    renderPreview(1);
    expect(screen.getByRole('button', { name: 'Resume Workout' })).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    renderPreview(1);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Chest/Back preview');
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    renderPreview(1, onClose);
    await userEvent.click(screen.getByTestId('preview-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    renderPreview(1, onClose);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when X button is clicked', async () => {
    const onClose = vi.fn();
    renderPreview(1, onClose);
    await userEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('navigates to workout page when CTA is clicked', async () => {
    renderPreview(3);
    await userEvent.click(screen.getByRole('button', { name: 'Start Workout' }));
    expect(mockNavigate).toHaveBeenCalledWith('/workout/3');
  });

  it('shows last session data when available', () => {
    mockUseProgress.mockReturnValue({
      getLastWorkoutForDay: vi.fn().mockReturnValue({
        id: '1',
        date: '2026-02-06',
        cycle: 1,
        dayNumber: 1,
        dayName: 'Chest/Back',
        completed: true,
        exercises: [
          {
            exerciseName: 'Incline Barbell Press',
            sets: [
              { setNumber: 1, weight: 135, reps: 10, completed: true },
              { setNumber: 2, weight: 135, reps: 8, completed: true },
            ],
            notes: '',
          },
        ],
      }),
    });
    render(
      <MemoryRouter>
        <WorkoutPreview dayNumber={1} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('Last: 135 lb × 8')).toBeInTheDocument();
  });
});
