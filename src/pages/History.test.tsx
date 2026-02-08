import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { History } from './History';
import { WorkoutLog, ExerciseLog, SetLog } from '../types';

vi.mock('../contexts/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

import { useProgress } from '../contexts/ProgressContext';

const mockUseProgress = useProgress as ReturnType<typeof vi.fn>;

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return { setNumber: 1, weight: 100, reps: 10, completed: true, ...overrides };
}

function makeExercise(overrides: Partial<ExerciseLog> = {}): ExerciseLog {
  return {
    exerciseName: 'Incline Barbell Press',
    sets: [makeSet({ setNumber: 1 }), makeSet({ setNumber: 2 })],
    notes: '',
    ...overrides,
  };
}

function makeWorkout(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: 'w1',
    date: '2026-02-08',
    cycle: 1,
    dayNumber: 1,
    dayName: 'Chest/Back',
    exercises: [makeExercise()],
    completed: true,
    totalVolume: 2000,
    duration: 3600,
    ...overrides,
  };
}

function setupMock(workoutLogs: WorkoutLog[] = [], currentCycle = 1) {
  mockUseProgress.mockReturnValue({
    progress: {
      currentCycle,
      cycleStartDate: '2026-01-01',
      deloadIntervalWeeks: 5,
      workoutLogs,
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
  });
}

function renderHistory() {
  return render(
    <MemoryRouter>
      <History />
    </MemoryRouter>
  );
}

describe('History', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading', () => {
    setupMock();
    renderHistory();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('shows empty state when no completed workouts', () => {
    setupMock();
    renderHistory();
    expect(screen.getByText('No sessions recorded yet.')).toBeInTheDocument();
  });

  it('hides empty state when workouts exist', () => {
    setupMock([makeWorkout()]);
    renderHistory();
    expect(screen.queryByText('No sessions recorded yet.')).not.toBeInTheDocument();
  });

  it('does not show incomplete workouts', () => {
    setupMock([makeWorkout({ completed: false, dayName: 'Incomplete Day' })]);
    renderHistory();
    expect(screen.queryByText('Incomplete Day')).not.toBeInTheDocument();
    expect(screen.getByText('No sessions recorded yet.')).toBeInTheDocument();
  });

  it('renders workout card with day name and volume', () => {
    setupMock([makeWorkout({ totalVolume: 5000 })]);
    renderHistory();
    expect(screen.getByText('Chest/Back')).toBeInTheDocument();
    expect(screen.getByText('5,000 lb')).toBeInTheDocument();
  });

  it('renders duration on workout card', () => {
    setupMock([makeWorkout({ duration: 5400 })]);
    renderHistory();
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
  });

  it('renders minutes-only duration', () => {
    setupMock([makeWorkout({ duration: 2700 })]);
    renderHistory();
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('hides duration when not present', () => {
    setupMock([makeWorkout({ duration: undefined })]);
    renderHistory();
    // Should not throw, just omit duration
    expect(screen.getByText('Chest/Back')).toBeInTheDocument();
  });

  it('sorts workouts newest first', () => {
    setupMock([
      makeWorkout({ id: 'w1', date: '2026-02-01', dayName: 'Older Day' }),
      makeWorkout({ id: 'w2', date: '2026-02-08', dayName: 'Newer Day' }),
    ]);
    renderHistory();
    const cards = screen.getAllByRole('button');
    expect(cards[0]).toHaveTextContent('Newer Day');
    expect(cards[1]).toHaveTextContent('Older Day');
  });

  it('calculates volume on-the-fly when totalVolume is missing', () => {
    const exercises = [
      makeExercise({
        exerciseName: 'Bench',
        sets: [
          makeSet({ weight: 100, reps: 10 }), // 1000
          makeSet({ weight: 100, reps: 8 }),   // 800
        ],
      }),
    ];
    setupMock([makeWorkout({ totalVolume: undefined, exercises })]);
    renderHistory();
    // 1,800 lb appears in volume header and on the card — just verify it's present
    const matches = screen.getAllByText('1,800 lb');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  describe('volume stats header', () => {
    it('shows cycle and all-time volume when workouts exist', () => {
      setupMock([
        makeWorkout({ id: 'w1', cycle: 1, totalVolume: 3000 }),
        makeWorkout({ id: 'w2', cycle: 1, totalVolume: 2000 }),
      ]);
      renderHistory();
      expect(screen.getByText('This Cycle')).toBeInTheDocument();
      expect(screen.getByText('All Time')).toBeInTheDocument();
    });

    it('does not show volume stats when no workouts', () => {
      setupMock();
      renderHistory();
      expect(screen.queryByText('This Cycle')).not.toBeInTheDocument();
      expect(screen.queryByText('All Time')).not.toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('expands workout details on click', async () => {
      const user = userEvent.setup();
      setupMock([
        makeWorkout({
          exercises: [
            makeExercise({ exerciseName: 'Incline Barbell Press' }),
          ],
        }),
      ]);
      renderHistory();

      // Exercise detail should not be visible initially
      expect(screen.queryByText(/Incline Barbell Press/)).not.toBeInTheDocument();

      // Click to expand
      await user.click(screen.getByRole('button'));
      expect(await screen.findByText('Incline Barbell Press')).toBeInTheDocument();
    });

    it('collapses on second click', async () => {
      const user = userEvent.setup();
      setupMock([makeWorkout({
        exercises: [makeExercise({ exerciseName: 'Incline Barbell Press' })],
      })]);
      renderHistory();

      const button = screen.getByRole('button');
      await user.click(button);
      expect(await screen.findByText('Incline Barbell Press')).toBeInTheDocument();

      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText('Incline Barbell Press')).not.toBeInTheDocument();
      });
    });

    it('shows session notes when expanded', async () => {
      const user = userEvent.setup();
      setupMock([makeWorkout({ sessionNotes: 'Felt strong today' })]);
      renderHistory();

      await user.click(screen.getByRole('button'));
      expect(await screen.findByText(/"Felt strong today"/)).toBeInTheDocument();
    });

    it('shows skipped exercises', async () => {
      const user = userEvent.setup();
      setupMock([makeWorkout({
        exercises: [makeExercise({ exerciseName: 'Pec Deck', skipped: true, sets: [] })],
      })]);
      renderHistory();

      await user.click(screen.getByRole('button'));
      expect(await screen.findByText('SKIPPED')).toBeInTheDocument();
    });

    it('shows replaced exercise name', async () => {
      const user = userEvent.setup();
      setupMock([makeWorkout({
        exercises: [
          makeExercise({
            exerciseName: 'Pec Deck',
            replacedWith: 'Cable Crossover',
          }),
        ],
      })]);
      renderHistory();

      await user.click(screen.getByRole('button'));
      expect(await screen.findByText(/Pec Deck → Cable Crossover/)).toBeInTheDocument();
    });

    it('shows exercise notes when present', async () => {
      const user = userEvent.setup();
      setupMock([makeWorkout({
        exercises: [makeExercise({ notes: 'Elbow pain on last rep' })],
      })]);
      renderHistory();

      await user.click(screen.getByRole('button'));
      expect(await screen.findByText(/"Elbow pain on last rep"/)).toBeInTheDocument();
    });

    it('shows set data as weight × reps', async () => {
      const user = userEvent.setup();
      setupMock([makeWorkout({
        exercises: [makeExercise({
          sets: [makeSet({ weight: 135, reps: 8 })],
        })],
      })]);
      renderHistory();

      await user.click(screen.getByRole('button'));
      expect(await screen.findByText(/135 lb × 8/)).toBeInTheDocument();
    });
  });

  describe('PR indicators', () => {
    it('shows PR star when set beats previous workout', async () => {
      const user = userEvent.setup();
      const previousWorkout = makeWorkout({
        id: 'w-prev',
        date: '2026-02-01',
        dayNumber: 1,
        exercises: [
          makeExercise({
            exerciseName: 'Incline Barbell Press',
            sets: [
              makeSet({ weight: 100, reps: 10 }), // best = 1000
            ],
          }),
        ],
      });
      const currentWorkout = makeWorkout({
        id: 'w-current',
        date: '2026-02-08',
        dayNumber: 1,
        exercises: [
          makeExercise({
            exerciseName: 'Incline Barbell Press',
            sets: [
              makeSet({ weight: 110, reps: 10 }), // 1100 > 1000 = PR
            ],
          }),
        ],
      });

      setupMock([currentWorkout, previousWorkout]);
      renderHistory();

      // Expand current workout
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(await screen.findByText('★')).toBeInTheDocument();
    });

    it('does not show PR star on first workout', async () => {
      const user = userEvent.setup();
      setupMock([makeWorkout({
        id: 'w1',
        dayNumber: 1,
        exercises: [makeExercise({
          sets: [makeSet({ weight: 200, reps: 10 })],
        })],
      })]);
      renderHistory();

      await user.click(screen.getByRole('button'));
      // Wait for expand to complete, then check no PR star
      await screen.findByText(/200 lb × 10/);
      expect(screen.queryByText('★')).not.toBeInTheDocument();
    });
  });
});
