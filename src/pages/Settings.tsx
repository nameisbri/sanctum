import { useState, useRef } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { useUnits } from '../hooks/useUnits';
import { TutorialSheet } from '../components/TutorialSheet';

export function Settings() {
  const { progress, updateDeloadInterval, exportData, importData, resetProgress } = useProgress();
  const { unit, setUnit } = useUnits();

  const [showTutorial, setShowTutorial] = useState(false);
  const [importConfirm, setImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [importError, setImportError] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPendingImport(text);
      setImportConfirm(true);
      setImportError(false);
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = () => {
    if (!pendingImport) return;
    const success = importData(pendingImport);
    if (!success) {
      setImportError(true);
      return;
    }
    setImportConfirm(false);
    setPendingImport(null);
  };

  const handleImportCancel = () => {
    setImportConfirm(false);
    setPendingImport(null);
    setImportError(false);
  };

  const handleReset = () => {
    if (resetInput !== 'RESET') return;
    resetProgress();
    setResetConfirm(false);
    setResetInput('');
  };

  const deloadOptions = [4, 5, 6] as const;

  return (
    <div className="min-h-screen bg-sanctum-950 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-gothic text-blood-500 mb-6">
          settings
        </h1>

        {/* How to use */}
        <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
          <button
            onClick={() => setShowTutorial(true)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-sanctum-800 text-sanctum-200 border border-sanctum-700 hover:border-sanctum-500 transition-colors duration-200"
          >
            How to use Sanctum
          </button>
        </div>

        <div className="border-t border-sanctum-700 my-4" />

        {/* Units */}
        <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
          <p className="text-sm text-sanctum-200 mb-3">Units</p>
          <div className="flex gap-2">
            {(['lb', 'kg'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  unit === u
                    ? 'bg-blood-500 text-white'
                    : 'bg-sanctum-800 text-sanctum-400 border border-sanctum-700 hover:border-sanctum-500'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-sanctum-700 my-4" />

        {/* Deload interval */}
        <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
          <p className="text-sm text-sanctum-200 mb-3">Deload cycle (weeks)</p>
          <div className="flex gap-2">
            {deloadOptions.map((weeks) => (
              <button
                key={weeks}
                onClick={() => updateDeloadInterval(weeks)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  progress.deloadIntervalWeeks === weeks
                    ? 'bg-blood-500 text-white'
                    : 'bg-sanctum-800 text-sanctum-400 border border-sanctum-700 hover:border-sanctum-500'
                }`}
              >
                {weeks}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-sanctum-700 my-4" />

        {/* Export */}
        <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
          <button
            onClick={exportData}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-sanctum-800 text-sanctum-200 border border-sanctum-700 hover:border-sanctum-500 transition-colors duration-200"
          >
            Export
          </button>
        </div>

        <div className="border-t border-sanctum-700 my-4" />

        {/* Import */}
        <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-sanctum-800 text-sanctum-200 border border-sanctum-700 hover:border-sanctum-500 transition-colors duration-200"
          >
            Import
          </button>
        </div>

        {/* Import confirmation modal */}
        {importConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-sanctum-950/80 backdrop-blur-sm">
            <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-5 max-w-xs w-full animate-fade-in">
              <p className="text-sm text-sanctum-200 mb-4">
                This will replace all existing data. Continue?
              </p>
              {importError && (
                <p className="text-sm text-blood-400 mb-4">
                  Invalid file format.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleImportCancel}
                  className="flex-1 py-2.5 rounded-lg border border-sanctum-700 text-sm text-sanctum-300 hover:bg-sanctum-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportConfirm}
                  className="flex-1 py-2.5 rounded-lg bg-blood-500 text-sm text-white font-medium hover:bg-blood-400 transition-colors"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-sanctum-700 my-4" />

        {/* Reset */}
        <div className="bg-sanctum-900 border border-sanctum-700 rounded-xl p-4">
          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-sanctum-800 text-sanctum-200 border border-sanctum-700 hover:border-sanctum-500 transition-colors duration-200"
            >
              Reset
            </button>
          ) : (
            <div className="animate-fade-in">
              <p className="text-sm text-sanctum-200 mb-3">
                This will permanently delete all workout data. This cannot be undone.
              </p>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="Type RESET to confirm"
                aria-label="Type RESET to confirm data deletion"
                className="w-full bg-sanctum-800 border border-sanctum-700 rounded-lg px-3 py-2.5 text-sm text-sanctum-100 placeholder:text-sanctum-600 focus:outline-none focus:border-blood-500/50 transition-colors mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setResetConfirm(false); setResetInput(''); }}
                  className="flex-1 py-2.5 rounded-lg border border-sanctum-700 text-sm text-sanctum-300 hover:bg-sanctum-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetInput !== 'RESET'}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    resetInput === 'RESET'
                      ? 'bg-blood-500 text-white hover:bg-blood-400'
                      : 'bg-sanctum-800 text-sanctum-600 cursor-not-allowed'
                  }`}
                >
                  Delete Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTutorial && <TutorialSheet onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
