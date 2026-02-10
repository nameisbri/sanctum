import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarCell } from '../services/calendarProjection';

function makeCell(overrides: Partial<CalendarCell> = {}): CalendarCell {
  return {
    date: '2026-02-10',
    dayOfWeek: 1,
    isToday: false,
    type: 'rest',
    ...overrides,
  };
}

describe('CalendarDayCell', () => {
  it('renders the date number', () => {
    const cell = makeCell({ date: '2026-02-15' });
    render(<CalendarDayCell cell={cell} onTap={vi.fn()} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders check for past-completed', () => {
    const cell = makeCell({
      type: 'past-completed',
      workout: { dayNumber: 1, dayName: 'Chest/Back', cycle: 1, log: {} as any },
    });
    const { container } = render(<CalendarDayCell cell={cell} onTap={vi.fn()} />);
    // Check icon renders as SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders day abbreviation for projected cell', () => {
    const cell = makeCell({
      type: 'projected',
      workout: { dayNumber: 4, dayName: 'Pull', cycle: 1 },
    });
    render(<CalendarDayCell cell={cell} onTap={vi.fn()} />);
    expect(screen.getByText('Pull')).toBeInTheDocument();
  });

  it('calls onTap for past-completed cells', async () => {
    const onTap = vi.fn();
    const cell = makeCell({
      type: 'past-completed',
      workout: { dayNumber: 1, dayName: 'Chest/Back', cycle: 1, log: {} as any },
    });
    render(<CalendarDayCell cell={cell} onTap={onTap} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onTap).toHaveBeenCalledWith(cell);
  });

  it('calls onTap for today cell with workout', async () => {
    const onTap = vi.fn();
    const cell = makeCell({
      type: 'today',
      isToday: true,
      workout: { dayNumber: 1, dayName: 'Chest/Back', cycle: 1 },
    });
    render(<CalendarDayCell cell={cell} onTap={onTap} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onTap).toHaveBeenCalledWith(cell);
  });

  it('does not call onTap for rest cells', async () => {
    const onTap = vi.fn();
    const cell = makeCell({ type: 'rest' });
    render(<CalendarDayCell cell={cell} onTap={onTap} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onTap).not.toHaveBeenCalled();
  });

  it('applies bold text for today', () => {
    const cell = makeCell({ isToday: true, type: 'today' });
    render(<CalendarDayCell cell={cell} onTap={vi.fn()} />);
    const dateEl = screen.getByText('10');
    expect(dateEl.className).toContain('font-bold');
  });

  it('renders moon icon for explicit-rest cell', () => {
    const cell = makeCell({ type: 'explicit-rest' });
    const { container } = render(<CalendarDayCell cell={cell} onTap={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('today explicit-rest cell is tappable', async () => {
    const onTap = vi.fn();
    const cell = makeCell({ type: 'explicit-rest', isToday: true });
    render(<CalendarDayCell cell={cell} onTap={onTap} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onTap).toHaveBeenCalledWith(cell);
  });

  it('past explicit-rest cell is not tappable', async () => {
    const onTap = vi.fn();
    const cell = makeCell({ type: 'explicit-rest', isToday: false, date: '2026-02-05' });
    render(<CalendarDayCell cell={cell} onTap={onTap} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onTap).not.toHaveBeenCalled();
  });
});
