import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseCard } from './ExerciseCard';
import type { Exercise, ExerciseLog } from '../types';

// Mock the program data module to avoid pulling in full program dependencies
vi.mock('../data/program', () => ({
  getRestTimerSeconds: () => 180,
}));

vi.mock('../services/prDetector', () => ({
  isSetPR: () => false,
}));

const mockExercise: Exercise = {
  order: 1,
  name: 'Incline Barbell Press',
  category: 'chest',
  sets: 2,
  reps: '6-12',
  rest: '3 min',
  notes: '',
};

const mockExerciseLog: ExerciseLog = {
  exerciseName: 'Incline Barbell Press',
  sets: [
    { setNumber: 1, weight: null, reps: null, completed: false },
    { setNumber: 2, weight: null, reps: null, completed: false },
  ],
  notes: '',
};

function createDefaultProps(overrides: Partial<Parameters<typeof ExerciseCard>[0]> = {}) {
  return {
    exercise: mockExercise,
    exerciseLog: mockExerciseLog,
    exerciseIndex: 0,
    isExpanded: false,
    onToggle: vi.fn(),
    onUpdateSet: vi.fn(),
    onUpdateNotes: vi.fn(),
    onSetComplete: vi.fn(),
    onSkipExercise: vi.fn(),
    onReplaceExercise: vi.fn(),
    lastExerciseData: null,
    previousWorkout: null,
    ...overrides,
  };
}

describe('ExerciseCard', () => {
  // 1. Collapsed state
  describe('collapsed state', () => {
    it('renders exercise name, category badge, and completion status "0/2"', () => {
      render(<ExerciseCard {...createDefaultProps()} />);

      expect(screen.getByText('Incline Barbell Press')).toBeInTheDocument();
      expect(screen.getByText('chest')).toBeInTheDocument();
      expect(screen.getByText('0/2')).toBeInTheDocument();
    });
  });

  // 2. Expanded state
  describe('expanded state', () => {
    it('shows set inputs when isExpanded is true', () => {
      render(<ExerciseCard {...createDefaultProps({ isExpanded: true })} />);

      expect(screen.getByText('Set 1')).toBeInTheDocument();
      expect(screen.getByText('Set 2')).toBeInTheDocument();
      // Two weight inputs + two reps inputs = 4 number inputs
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBe(4);
    });
  });

  // 3. Set completion
  describe('set completion', () => {
    it('clicking the complete button calls onSetComplete', async () => {
      const onSetComplete = vi.fn();
      render(
        <ExerciseCard
          {...createDefaultProps({ isExpanded: true, onSetComplete })}
        />
      );

      const completeButtons = screen.getAllByRole('button', { name: /mark set complete/i });
      await userEvent.click(completeButtons[0]);

      expect(onSetComplete).toHaveBeenCalledWith(0, 0);
    });
  });

  // 4. Weight input
  describe('weight input', () => {
    it('typing in weight input calls onUpdateSet with weight', async () => {
      const onUpdateSet = vi.fn();
      render(
        <ExerciseCard
          {...createDefaultProps({ isExpanded: true, onUpdateSet })}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      // First input is the weight input for set 1
      fireEvent.change(inputs[0], { target: { value: '135' } });

      expect(onUpdateSet).toHaveBeenCalledWith(0, 0, { weight: 135 });
    });
  });

  // 5. Reps input
  describe('reps input', () => {
    it('typing in reps input calls onUpdateSet with reps', async () => {
      const onUpdateSet = vi.fn();
      render(
        <ExerciseCard
          {...createDefaultProps({ isExpanded: true, onUpdateSet })}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      // Second input is the reps input for set 1
      fireEvent.change(inputs[1], { target: { value: '10' } });

      expect(onUpdateSet).toHaveBeenCalledWith(0, 0, { reps: 10 });
    });
  });

  // 6. Notes toggle
  describe('notes toggle', () => {
    it('clicking Notes shows textarea, typing calls onUpdateNotes', async () => {
      const user = userEvent.setup();
      const onUpdateNotes = vi.fn();
      render(
        <ExerciseCard
          {...createDefaultProps({ isExpanded: true, onUpdateNotes })}
        />
      );

      // Click the "Notes" button to reveal the textarea
      const notesButton = screen.getByText('Notes');
      await user.click(notesButton);

      const textarea = await screen.findByPlaceholderText('Notes');
      expect(textarea).toBeInTheDocument();

      await user.type(textarea, 'Felt strong');

      // onUpdateNotes is called for each character typed
      await waitFor(() => {
        expect(onUpdateNotes).toHaveBeenCalled();
      });
      // The last call should include the final character
      const lastCall = onUpdateNotes.mock.calls[onUpdateNotes.mock.calls.length - 1];
      expect(lastCall[0]).toBe(0);
    });
  });

  // 7. Skip button for optional exercises
  describe('skip button', () => {
    it('shows Skip for optional exercises and calls onSkipExercise', async () => {
      const onSkipExercise = vi.fn();
      const optionalExercise: Exercise = {
        ...mockExercise,
        optional: true,
      };
      render(
        <ExerciseCard
          {...createDefaultProps({
            isExpanded: true,
            exercise: optionalExercise,
            onSkipExercise,
          })}
        />
      );

      const skipButton = screen.getByText('Skip');
      expect(skipButton).toBeInTheDocument();

      await userEvent.click(skipButton);

      expect(onSkipExercise).toHaveBeenCalledWith(0, true);
    });
  });

  // 8. Skip button available for all exercises
  describe('skip button', () => {
    it('shows Skip for all exercises regardless of optional flag', () => {
      render(
        <ExerciseCard {...createDefaultProps({ isExpanded: true })} />
      );

      expect(screen.getByText('Skip')).toBeInTheDocument();
    });
  });

  // 9. Replace exercise
  describe('replace exercise', () => {
    it('clicking Replace shows input, entering name calls onReplaceExercise', async () => {
      const user = userEvent.setup();
      const onReplaceExercise = vi.fn();
      render(
        <ExerciseCard
          {...createDefaultProps({
            isExpanded: true,
            onReplaceExercise,
          })}
        />
      );

      // Click the Replace button
      const replaceButton = screen.getByText('Replace');
      await user.click(replaceButton);

      // Type a replacement name
      const replaceInput = await screen.findByPlaceholderText('Replace with');
      expect(replaceInput).toBeInTheDocument();

      await user.type(replaceInput, 'Dumbbell Press');

      // Click Save
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(onReplaceExercise).toHaveBeenCalledWith(0, 'Dumbbell Press');
      });
    });
  });

  // 10. Previous data display
  describe('previous data display', () => {
    it('when lastExerciseData is provided, shows "Previous" section with weight x reps', () => {
      const lastExerciseData: ExerciseLog = {
        exerciseName: 'Incline Barbell Press',
        sets: [
          { setNumber: 1, weight: 135, reps: 10, completed: true },
          { setNumber: 2, weight: 135, reps: 8, completed: true },
        ],
        notes: '',
      };

      render(
        <ExerciseCard
          {...createDefaultProps({
            isExpanded: true,
            lastExerciseData,
          })}
        />
      );

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('135 lb × 10')).toBeInTheDocument();
      expect(screen.getByText('135 lb × 8')).toBeInTheDocument();
    });
  });

  // 11. Replaced exercise name display
  describe('replaced exercise name', () => {
    it('when exerciseLog has replacedWith, shows "Original → Replacement"', () => {
      const replacedLog: ExerciseLog = {
        ...mockExerciseLog,
        replacedWith: 'Dumbbell Press',
      };

      render(
        <ExerciseCard
          {...createDefaultProps({ exerciseLog: replacedLog })}
        />
      );

      expect(
        screen.getByText('Incline Barbell Press → Dumbbell Press')
      ).toBeInTheDocument();
    });
  });
});
