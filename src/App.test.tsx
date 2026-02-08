import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock ProgressContext so Dashboard doesn't need real localStorage
vi.mock('./contexts/ProgressContext', async () => {
  const React = await import('react');
  return {
    ProgressProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useProgress: vi.fn().mockReturnValue({
      progress: {
        currentCycle: 1,
        cycleStartDate: '2026-01-01',
        deloadIntervalWeeks: 5,
        workoutLogs: [],
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
    }),
  };
});

vi.mock('./services/workoutStateManager', () => ({
  hasActiveWorkout: vi.fn().mockReturnValue(false),
  getAllActiveWorkoutDays: vi.fn().mockReturnValue([]),
  getActiveWorkout: vi.fn().mockReturnValue(null),
  saveActiveWorkout: vi.fn().mockReturnValue(true),
  clearActiveWorkout: vi.fn().mockReturnValue(true),
}));

function renderApp(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  it('renders BottomNav on dashboard route', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });
  });

  it('renders BottomNav on history route', async () => {
    renderApp('/history');
    await waitFor(() => {
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });
  });

  it('hides BottomNav on workout routes', async () => {
    renderApp('/workout/1');
    await waitFor(() => {
      expect(screen.getByText('Chest/Back')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText('Main navigation')).not.toBeInTheDocument();
  });

  it('renders Dashboard on root route', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByText('Sanctum')).toBeInTheDocument();
    });
  });
});
