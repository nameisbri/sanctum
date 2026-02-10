import { useEffect } from 'react';
import { X } from 'lucide-react';

interface TutorialSheetProps {
  onClose: () => void;
}

const sections = [
  {
    title: 'Starting a workout',
    body: 'Tap a day card on the Dashboard to preview exercises, then hit "Start Workout" to begin.',
  },
  {
    title: 'Logging sets',
    body: 'Enter weight and reps for each set, then tap the checkmark to complete it. Use the menu buttons to skip or replace an exercise.',
  },
  {
    title: 'Rest timer',
    body: 'A rest timer starts automatically after you complete a set. Duration is based on muscle group — longer for chest, back, and legs.',
  },
  {
    title: 'Plan tab',
    body: 'Shows your projected schedule based on training frequency. Tap today\'s cell to start a workout, or tap a completed day to review the log.',
  },
  {
    title: 'Rest days',
    body: 'Tap "Rest today" on the Plan tab to skip today and shift your projections forward.',
  },
  {
    title: 'Deload weeks',
    body: 'You\'ll be prompted automatically based on your deload interval. Use lighter weights during deload week to recover.',
  },
];

export function TutorialSheet({ onClose }: TutorialSheetProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="How to use Sanctum"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-sanctum-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        data-testid="tutorial-backdrop"
      />

      {/* Panel */}
      <div className="relative w-full bg-sanctum-900 border-t border-sanctum-700 rounded-t-2xl animate-slide-up-sheet max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-sanctum-50">
            How to use Sanctum
          </h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-sanctum-400 hover:text-sanctum-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 pb-20 max-h-[60vh]">
          <ul className="space-y-4">
            {sections.map((section) => (
              <li key={section.title}>
                <h3 className="text-sm font-medium text-sanctum-100">
                  {section.title}
                </h3>
                <p className="text-xs text-sanctum-400 mt-1 leading-relaxed">
                  {section.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
