import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarTimeline } from './CalendarTimeline';
import { CalendarProjection, CalendarCell } from '../services/calendarProjection';

function makeProjection(overrides: Partial<CalendarProjection> = {}): CalendarProjection {
  return {
    frequency: { workoutsPerWeek: 5, avgDaysBetweenWorkouts: 1.4, confidence: 'default' },
    nextWorkout: { dayNumber: 1, dayName: 'Pull', cycle: 1 },
    weeks: [
      {
        weekLabel: 'This Week',
        weekStartDate: '2026-02-09',
        isCurrentWeek: true,
        isDeloadWeek: false,
        cells: [
          { date: '2026-02-09', dayOfWeek: 0, isToday: false, type: 'rest' as const },
          { date: '2026-02-10', dayOfWeek: 1, isToday: true, type: 'today' as const, workout: { dayNumber: 1, dayName: 'Pull', cycle: 1 } },
          { date: '2026-02-11', dayOfWeek: 2, isToday: false, type: 'projected' as const, workout: { dayNumber: 2, dayName: 'Push', cycle: 1 } },
          { date: '2026-02-12', dayOfWeek: 3, isToday: false, type: 'rest' as const },
          { date: '2026-02-13', dayOfWeek: 4, isToday: false, type: 'rest' as const },
          { date: '2026-02-14', dayOfWeek: 5, isToday: false, type: 'rest' as const },
          { date: '2026-02-15', dayOfWeek: 6, isToday: false, type: 'rest' as const },
        ],
      },
      {
        weekLabel: 'Feb 16 – 22',
        weekStartDate: '2026-02-16',
        isCurrentWeek: false,
        isDeloadWeek: false,
        cells: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-02-${16 + i}`,
          dayOfWeek: i,
          isToday: false,
          type: 'rest' as const,
        })),
      },
    ],
    ...overrides,
  };
}

describe('CalendarTimeline', () => {
  it('renders day-of-week headers', () => {
    render(<CalendarTimeline projection={makeProjection()} onDayTap={vi.fn()} />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders week labels', () => {
    render(<CalendarTimeline projection={makeProjection()} onDayTap={vi.fn()} />);
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Feb 16 – 22')).toBeInTheDocument();
  });

  it('highlights current week label', () => {
    render(<CalendarTimeline projection={makeProjection()} onDayTap={vi.fn()} />);
    const thisWeek = screen.getByText('This Week');
    expect(thisWeek.className).toContain('text-blood-400');
  });

  it('renders cells for each day', () => {
    render(<CalendarTimeline projection={makeProjection()} onDayTap={vi.fn()} />);
    // 2 weeks × 7 days = 14 buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(14);
  });

  it('calls onDayTap when a cell is tapped', async () => {
    const onDayTap = vi.fn();
    const projection = makeProjection();
    // Make the today cell interactive (it has a workout)
    render(<CalendarTimeline projection={projection} onDayTap={onDayTap} />);

    // Click the "today" cell (date 10)
    await userEvent.click(screen.getByText('10'));
    expect(onDayTap).toHaveBeenCalled();
    const calledCell = onDayTap.mock.calls[0][0] as CalendarCell;
    expect(calledCell.date).toBe('2026-02-10');
  });

  it('shows legend items', () => {
    render(<CalendarTimeline projection={makeProjection()} onDayTap={vi.fn()} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Projected')).toBeInTheDocument();
    expect(screen.getByText('Deload')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows frequency note', () => {
    render(<CalendarTimeline projection={makeProjection()} onDayTap={vi.fn()} />);
    expect(screen.getByTestId('frequency-note')).toHaveTextContent('Based on ~5 workouts/week');
  });
});
