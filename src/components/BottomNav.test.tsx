import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>
  );
}

describe('BottomNav', () => {
  it('renders as a nav element with aria-label', () => {
    renderWithRouter('/');
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('renders 4 navigation links', () => {
    renderWithRouter('/');
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
  });

  it('marks Home link as active when on "/"', () => {
    renderWithRouter('/');
    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toHaveClass('text-blood-500');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('marks History link as active when on "/history"', () => {
    renderWithRouter('/history');
    const historyLink = screen.getByLabelText('History');
    expect(historyLink).toHaveClass('text-blood-500');
    expect(historyLink).toHaveAttribute('aria-current', 'page');
  });

  it('marks Settings link as active when on "/settings"', () => {
    renderWithRouter('/settings');
    const settingsLink = screen.getByLabelText('Settings');
    expect(settingsLink).toHaveClass('text-blood-500');
    expect(settingsLink).toHaveAttribute('aria-current', 'page');
  });

  it('marks Plan link as active when on "/plan"', () => {
    renderWithRouter('/plan');
    const planLink = screen.getByLabelText('Plan');
    expect(planLink).toHaveClass('text-blood-500');
    expect(planLink).toHaveAttribute('aria-current', 'page');
  });

  it('only marks one link as active at a time', () => {
    renderWithRouter('/');
    const homeLink = screen.getByLabelText('Home');
    const planLink = screen.getByLabelText('Plan');
    const historyLink = screen.getByLabelText('History');
    const settingsLink = screen.getByLabelText('Settings');

    expect(homeLink).toHaveClass('text-blood-500');
    expect(planLink).not.toHaveClass('text-blood-500');
    expect(historyLink).not.toHaveClass('text-blood-500');
    expect(settingsLink).not.toHaveClass('text-blood-500');
  });

  it('all links point to correct hrefs', () => {
    renderWithRouter('/');
    expect(screen.getByLabelText('Home')).toHaveAttribute('href', '/');
    expect(screen.getByLabelText('Plan')).toHaveAttribute('href', '/plan');
    expect(screen.getByLabelText('History')).toHaveAttribute('href', '/history');
    expect(screen.getByLabelText('Settings')).toHaveAttribute('href', '/settings');
  });
});
