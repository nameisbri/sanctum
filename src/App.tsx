import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProgressProvider } from './contexts/ProgressContext';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Workout = lazy(() => import('./pages/Workout').then(m => ({ default: m.Workout })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const DesignSystem = lazy(() => import('./pages/DesignSystem').then(m => ({ default: m.DesignSystem })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-sanctum-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-sanctum-700 border-t-blood-500"></div>
        <p className="mt-4 text-sanctum-500 text-sm font-medium tracking-wide">Loading</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ProgressProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout/:dayNumber" element={<Workout />} />
          <Route path="/history" element={<History />} />
          <Route path="/design" element={<DesignSystem />} />
        </Routes>
      </Suspense>
    </ProgressProvider>
  );
}

export default App;
