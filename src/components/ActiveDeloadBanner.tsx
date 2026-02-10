import { useProgress } from '../contexts/ProgressContext';

export function ActiveDeloadBanner() {
  const { endDeload } = useProgress();

  return (
    <div className="flex items-center justify-between bg-sanctum-900 border border-metal-gold/30 rounded-xl px-4 py-3 mb-4">
      <p className="text-sm text-metal-gold">
        Deload Week — Use lighter weights, focus on form.
      </p>
      <button
        onClick={endDeload}
        className="text-xs text-sanctum-400 hover:text-sanctum-200 transition-colors ml-3 flex-shrink-0"
      >
        End Deload
      </button>
    </div>
  );
}
