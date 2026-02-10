import { useProgress } from '../contexts/ProgressContext';

export function DeloadAlert() {
  const { startDeload, recordDeload } = useProgress();

  return (
    <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-5 mb-4">
      <h3 className="text-base font-semibold text-sanctum-50 mb-1">
        Time for a Deload
      </h3>
      <p className="text-sm text-sanctum-400 mb-4">
        Your body rebuilds in rest. A lighter week helps you come back stronger.
      </p>
      <div className="flex gap-3">
        <button
          onClick={startDeload}
          className="flex-1 py-2.5 rounded-lg bg-blood-700 hover:bg-blood-600 text-sm text-white font-medium transition-colors"
        >
          Yes, deload
        </button>
        <button
          onClick={recordDeload}
          className="flex-1 py-2.5 rounded-lg border border-sanctum-700 text-sm text-sanctum-300 hover:bg-sanctum-800 transition-colors"
        >
          Continue training
        </button>
      </div>
    </div>
  );
}
