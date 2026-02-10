import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TutorialSheet } from './TutorialSheet';

describe('TutorialSheet', () => {
  it('renders all section headings', () => {
    render(<TutorialSheet onClose={vi.fn()} />);
    expect(screen.getByText('Starting a workout')).toBeInTheDocument();
    expect(screen.getByText('Logging sets')).toBeInTheDocument();
    expect(screen.getByText('Rest timer')).toBeInTheDocument();
    expect(screen.getByText('Plan tab')).toBeInTheDocument();
    expect(screen.getByText('Rest days')).toBeInTheDocument();
    expect(screen.getByText('Deload weeks')).toBeInTheDocument();
  });

  it('calls onClose when X button is clicked', async () => {
    const onClose = vi.fn();
    render(<TutorialSheet onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close tutorial' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn();
    render(<TutorialSheet onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<TutorialSheet onClose={onClose} />);
    await userEvent.click(screen.getByTestId('tutorial-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has correct ARIA attributes', () => {
    render(<TutorialSheet onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'How to use Sanctum');
  });
});
