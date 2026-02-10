import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProgressProvider } from './contexts/ProgressContext';
import { BottomNav } from './components/BottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Plan = lazy(() => import('./pages/Plan').then(m => ({ default: m.Plan })));
const Workout = lazy(() => import('./pages/Workout').then(m => ({ default: m.Workout })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-sanctum-950 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Title skeleton */}
        <div className="h-7 w-32 bg-sanctum-800 rounded-lg mb-6 animate-pulse" />
        {/* Card skeletons */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-sanctum-800 rounded mb-3" />
              <div className="h-3 w-1/3 bg-sanctum-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/workout');
  const online = useOnlineStatus();

  return (
    <>
      {!online && (
        <div className="bg-sanctum-800 text-sanctum-300 text-xs text-center py-1.5 px-4" role="status">
          You're offline — data is saved locally.
        </div>
      )}
      <main>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/workout/:dayNumber" element={<Workout />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!hideNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <ProgressProvider>
      <AppLayout />
    </ProgressProvider>
  );
}

export default App;
