import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayCard } from './DayCard';

interface DayCardProps {
  dayNumber: number;
  dayName: string;
  exerciseCount: number;
  lastWorkoutDate: string | null;
  hasActiveWorkout: boolean;
  onClick: () => void;
}

function renderDayCard(overrides: Partial<DayCardProps> = {}) {
  const defaultProps: DayCardProps = {
    dayNumber: 1,
    dayName: 'Chest/Back',
    exerciseCount: 8,
    lastWorkoutDate: null,
    hasActiveWorkout: false,
    onClick: vi.fn(),
    ...overrides,
  };
  return { ...render(<DayCard {...defaultProps} />), props: defaultProps };
}

describe('DayCard', () => {
  it('renders day number text', () => {
    renderDayCard();
    expect(screen.getByText('Day 1')).toBeInTheDocument();
  });

  it('renders day name', () => {
    renderDayCard();
    expect(screen.getByText('Chest/Back')).toBeInTheDocument();
  });

  it('renders exercise count', () => {
    renderDayCard({ exerciseCount: 8 });
    expect(screen.getByText('8 exercises')).toBeInTheDocument();
  });

  it('renders formatted last workout date when provided', () => {
    renderDayCard({ lastWorkoutDate: '2026-02-06' });
    expect(screen.getByText(/Feb 6/)).toBeInTheDocument();
  });

  it('does not render "Last:" text when lastWorkoutDate is null', () => {
    renderDayCard({ lastWorkoutDate: null });
    expect(screen.queryByText(/Last:/)).not.toBeInTheDocument();
  });

  it('renders "Resume" text when hasActiveWorkout is true', () => {
    renderDayCard({ hasActiveWorkout: true });
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('does not render "Resume" text when hasActiveWorkout is false', () => {
    renderDayCard({ hasActiveWorkout: false });
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
  });

  it('renders as a button', () => {
    renderDayCard();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    renderDayCard({ onClick });
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
