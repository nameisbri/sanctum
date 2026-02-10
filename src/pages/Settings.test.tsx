import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from './Settings';

vi.mock('../contexts/ProgressContext', () => ({
  useProgress: () => ({
    progress: { deloadIntervalWeeks: 4 },
    updateDeloadInterval: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    resetProgress: vi.fn(),
  }),
}));

vi.mock('../hooks/useUnits', () => ({
  useUnits: () => ({ unit: 'lb' as const, setUnit: vi.fn() }),
}));

describe('Settings', () => {
  it('renders "How to use Sanctum" button', () => {
    render(<Settings />);
    expect(screen.getByRole('button', { name: 'How to use Sanctum' })).toBeInTheDocument();
  });

  it('opens tutorial sheet when button is clicked', async () => {
    render(<Settings />);
    await userEvent.click(screen.getByRole('button', { name: 'How to use Sanctum' }));
    expect(screen.getByRole('dialog', { name: 'How to use Sanctum' })).toBeInTheDocument();
  });

  it('closes tutorial sheet when close button is clicked', async () => {
    render(<Settings />);
    await userEvent.click(screen.getByRole('button', { name: 'How to use Sanctum' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close tutorial' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
