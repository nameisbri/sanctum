import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProgressProvider } from './contexts/ProgressContext';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Workout = lazy(() => import('./pages/Workout').then(m => ({ default: m.Workout })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
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
        </Routes>
      </Suspense>
    </ProgressProvider>
  );
}

export default App;
