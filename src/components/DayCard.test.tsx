import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DayCard } from './DayCard';

interface DayCardProps {
  dayNumber: number;
  dayName: string;
  exerciseCount: number;
  lastWorkoutDate: string | null;
  hasActiveWorkout: boolean;
}

function renderDayCard(overrides: Partial<DayCardProps> = {}) {
  const defaultProps: DayCardProps = {
    dayNumber: 1,
    dayName: 'Chest/Back',
    exerciseCount: 8,
    lastWorkoutDate: null,
    hasActiveWorkout: false,
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <DayCard {...defaultProps} />
    </MemoryRouter>
  );
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

  it('card links to correct URL', () => {
    renderDayCard({ dayNumber: 1 });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/workout/1');
  });
});
