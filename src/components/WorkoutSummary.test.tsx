import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutSummary } from './WorkoutSummary';
import { ExerciseLog } from '../types';
import { calculateTotalVolume } from '../utils/volumeCalculator';
import { formatVolumeWithUnit } from '../hooks/useUnits';

const mockExerciseLogs: ExerciseLog[] = [
  {
    exerciseName: 'Bench Press',
    sets: [
      { setNumber: 1, weight: 135, reps: 10, completed: true },
      { setNumber: 2, weight: 135, reps: 8, completed: true },
    ],
    notes: '',
  },
  {
    exerciseName: 'Squats',
    sets: [
      { setNumber: 1, weight: 225, reps: 6, completed: true },
      { setNumber: 2, weight: 225, reps: 6, completed: false },
    ],
    notes: '',
  },
];

const closingLines = [
  'The work is done. Return stronger.',
  'Strength recorded.',
  'Discipline compounds.',
  'Another layer of armor built.',
  'The body remembers what the mind commands.',
  'You showed up. That is power.',
  'Progress locked.',
  'This is how legends train \u2014 alone, in silence.',
];

function renderSummary(overrides: Partial<Parameters<typeof WorkoutSummary>[0]> = {}) {
  const defaultProps = {
    exerciseLogs: mockExerciseLogs,
    duration: 2700, // 45 minutes
    sessionNotes: '',
    onSessionNotesChange: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };
  return {
    ...render(<WorkoutSummary {...defaultProps} />),
    props: defaultProps,
  };
}

describe('WorkoutSummary', () => {
  it('displays total volume formatted with formatVolume', () => {
    renderSummary();

    const expectedVolume = calculateTotalVolume(mockExerciseLogs);
    const expectedText = formatVolumeWithUnit(expectedVolume, 'lb');

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it('displays completed exercises count', () => {
    renderSummary();

    // Both exercises have at least one completed set and are not skipped, so count = 2
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays completed sets count', () => {
    renderSummary();

    // Bench Press: 2 completed, Squats: 1 completed (second is false) = 3 total
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays a closing line from the known list', () => {
    renderSummary();

    const foundLine = closingLines.some((line) =>
      screen.queryByText(line)
    );

    expect(foundLine).toBe(true);
  });

  it('renders session notes textarea with provided value', () => {
    renderSummary({ sessionNotes: 'Felt strong today' });

    const textarea = screen.getByPlaceholderText('Notes');
    expect(textarea).toHaveValue('Felt strong today');
  });

  it('calls onSessionNotesChange when typing in textarea', () => {
    const onSessionNotesChange = vi.fn();
    renderSummary({ onSessionNotesChange });

    const textarea = screen.getByPlaceholderText('Notes');
    fireEvent.change(textarea, { target: { value: 'Great workout' } });

    expect(onSessionNotesChange).toHaveBeenCalledWith('Great workout');
  });

  it('calls onSave when Save button is clicked', () => {
    const onSave = vi.fn();
    renderSummary({ onSave });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledOnce();
  });

  it('displays formatted duration', () => {
    renderSummary({ duration: 2700 });

    // 2700 seconds = 45 minutes
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('displays duration with hours when over 3600 seconds', () => {
    renderSummary({ duration: 4500 });

    // 4500 seconds = 1h 15m
    expect(screen.getByText('1h 15m')).toBeInTheDocument();
  });
});
