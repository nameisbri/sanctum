import { useState } from 'react';

const sanctumColors = [
  { name: '950', hex: '#0a0a0b', label: 'Body bg' },
  { name: '900', hex: '#111114', label: 'Card bg' },
  { name: '850', hex: '#18181c', label: 'Elevated' },
  { name: '800', hex: '#1f1f24', label: 'Input bg' },
  { name: '700', hex: '#2a2a30', label: 'Borders' },
  { name: '600', hex: '#3a3a42', label: 'Subtle border' },
  { name: '500', hex: '#52525e', label: 'Muted text' },
  { name: '400', hex: '#7a7a88', label: 'Secondary' },
  { name: '300', hex: '#a1a1ad', label: 'Body text' },
  { name: '200', hex: '#d4d4dc', label: 'Primary text' },
  { name: '100', hex: '#ededf0', label: 'Bright text' },
  { name: '50', hex: '#fafafe', label: 'White (rare)' },
];

const bloodColors = [
  { name: '900', hex: '#3b0a0a', label: 'Darkest' },
  { name: '800', hex: '#5c1010', label: 'Deep' },
  { name: '700', hex: '#7f1d1d', label: 'Dark' },
  { name: '600', hex: '#991b1b', label: 'Medium' },
  { name: '500', hex: '#b91c1c', label: 'Primary' },
  { name: '400', hex: '#dc2626', label: 'CTAs/PRs' },
  { name: '300', hex: '#ef4444', label: 'Hover' },
];

const metalColors = [
  { name: 'gold', hex: '#c9a84c', label: 'Achievements' },
  { name: 'silver', hex: '#94a3b8', label: 'Secondary' },
  { name: 'bronze', hex: '#a67c52', label: 'Tertiary' },
  { name: 'steel', hex: '#64748b', label: 'Steel grey' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-sanctum-100 mb-6 pb-2 border-b border-sanctum-700">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorSwatch({ name, hex, label, prefix }: { name: string; hex: string; label: string; prefix: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg border border-sanctum-700 flex-shrink-0"
        style={{ backgroundColor: hex }}
      />
      <div className="min-w-0">
        <p className="text-sanctum-200 text-sm font-medium font-mono">{prefix}-{name}</p>
        <p className="text-sanctum-500 text-xs font-mono">{hex}</p>
        <p className="text-sanctum-400 text-xs">{label}</p>
      </div>
    </div>
  );
}

export function DesignSystem() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-sanctum-950 px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-sanctum-50 tracking-tight">Sanctum</h1>
        <p className="text-sanctum-400 mt-1">Design System Preview</p>
        <p className="text-sanctum-500 text-sm mt-3">
          Dark, elegant, minimal. This page confirms all design tokens render correctly.
          Temporary — remove after Phase 2.
        </p>
      </div>

      {/* Color Palette: Sanctum */}
      <Section title="Colors / Sanctum">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sanctumColors.map(c => (
            <ColorSwatch key={c.name} {...c} prefix="sanctum" />
          ))}
        </div>
      </Section>

      {/* Color Palette: Blood */}
      <Section title="Colors / Blood">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {bloodColors.map(c => (
            <ColorSwatch key={c.name} {...c} prefix="blood" />
          ))}
        </div>
      </Section>

      {/* Color Palette: Metal */}
      <Section title="Colors / Metal">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metalColors.map(c => (
            <ColorSwatch key={c.name} {...c} prefix="metal" />
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-6">
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-1">font-sans (Inter) — Display</p>
            <h1 className="text-4xl font-bold text-sanctum-50 tracking-tight">The quick brown fox</h1>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-1">font-sans (Inter) — Heading</p>
            <h2 className="text-2xl font-semibold text-sanctum-100">The quick brown fox jumps over</h2>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-1">font-sans (Inter) — Subheading</p>
            <h3 className="text-lg font-medium text-sanctum-200">The quick brown fox jumps over the lazy dog</h3>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-1">font-sans (Inter) — Body</p>
            <p className="text-base text-sanctum-300">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-1">font-sans (Inter) — Small/Caption</p>
            <p className="text-sm text-sanctum-400">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-1">font-mono (JetBrains Mono) — Data</p>
            <p className="text-lg font-mono text-sanctum-100">135 lbs &times; 8 reps &mdash; 1,080 vol</p>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-1">font-mono (JetBrains Mono) — Small data</p>
            <p className="text-sm font-mono text-sanctum-300">Set 1: 185 &times; 6 &nbsp;|&nbsp; Set 2: 185 &times; 5</p>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <div className="space-y-6">
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-3">Primary — bg-blood-500, CTAs</p>
            <div className="flex gap-3 flex-wrap">
              <button className="btn-primary">Start Workout</button>
              <button className="btn-primary opacity-50 cursor-not-allowed">Disabled</button>
            </div>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-3">Secondary — border, ghost actions</p>
            <div className="flex gap-3 flex-wrap">
              <button className="btn-secondary">View History</button>
              <button className="btn-secondary opacity-50 cursor-not-allowed">Disabled</button>
            </div>
          </div>
          <div>
            <p className="text-sanctum-500 text-xs font-mono mb-3">Ghost — minimal, tertiary</p>
            <div className="flex gap-3 flex-wrap">
              <button className="btn-ghost">Cancel</button>
              <button className="btn-ghost opacity-50 cursor-not-allowed">Disabled</button>
            </div>
          </div>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sanctum-100 font-medium mb-1">Default Card</h3>
            <p className="text-sanctum-400 text-sm">bg-sanctum-900 / border-sanctum-700 / rounded-lg</p>
          </div>
          <div className="card-hover p-4 cursor-pointer">
            <h3 className="text-sanctum-100 font-medium mb-1">Hover Card</h3>
            <p className="text-sanctum-400 text-sm">Hover to see border lighten to sanctum-600</p>
          </div>
          <div className="bg-sanctum-900 border border-blood-500/50 bg-blood-500/5 rounded-lg p-4">
            <h3 className="text-sanctum-100 font-medium mb-1">Completed State</h3>
            <p className="text-sanctum-400 text-sm">border-blood-500/50 + bg-blood-500/5</p>
          </div>
          <div className="bg-sanctum-900 border border-metal-gold/50 rounded-lg p-4" style={{ backgroundColor: 'rgba(201, 168, 76, 0.05)' }}>
            <h3 className="text-metal-gold font-medium mb-1">PR / Record State</h3>
            <p className="text-sanctum-400 text-sm">border-metal-gold/50 + bg-metal-gold/5</p>
          </div>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sanctum-400 text-xs font-medium mb-1.5">Default</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Enter weight..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sanctum-400 text-xs font-medium mb-1.5">With value</label>
            <input
              type="text"
              className="input w-full"
              value="185"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sanctum-400 text-xs font-medium mb-1.5">Number (mono font)</label>
            <input
              type="number"
              className="input w-full font-mono"
              placeholder="0"
              defaultValue={135}
            />
          </div>
          <div>
            <label className="block text-sanctum-400 text-xs font-medium mb-1.5">Disabled</label>
            <input
              type="text"
              className="input w-full opacity-50 cursor-not-allowed"
              value="Locked"
              disabled
            />
          </div>
        </div>
      </Section>

      {/* Set States */}
      <Section title="Set States">
        <div className="space-y-3 max-w-md">
          <div className="card p-3 flex items-center justify-between">
            <span className="text-sanctum-400 text-sm">Incomplete</span>
            <span className="text-sanctum-500 text-xs font-mono">border-sanctum-700</span>
          </div>
          <div className="bg-sanctum-900 border border-sanctum-500 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sanctum-300 text-sm">In Progress (has data)</span>
            <span className="text-sanctum-500 text-xs font-mono">border-sanctum-500</span>
          </div>
          <div className="bg-sanctum-900 border border-blood-500/50 rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(185, 28, 28, 0.05)' }}>
            <span className="text-sanctum-200 text-sm">Completed</span>
            <span className="text-sanctum-500 text-xs font-mono">blood-500/50 + bg/5</span>
          </div>
          <div className="bg-sanctum-900 border border-metal-gold/50 rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(201, 168, 76, 0.05)' }}>
            <span className="text-metal-gold text-sm font-medium">Personal Record</span>
            <span className="text-sanctum-500 text-xs font-mono">gold/50 + bg/5</span>
          </div>
        </div>
      </Section>

      {/* Progress Bar */}
      <Section title="Progress Indicators">
        <div className="space-y-4 max-w-md">
          <div>
            <p className="text-sanctum-400 text-xs font-medium mb-2">Workout progress (blood-500)</p>
            <div className="h-2 bg-sanctum-800 rounded-full overflow-hidden">
              <div className="h-full bg-blood-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
          <div>
            <p className="text-sanctum-400 text-xs font-medium mb-2">Volume record (metal-gold)</p>
            <div className="h-2 bg-sanctum-800 rounded-full overflow-hidden">
              <div className="h-full bg-metal-gold rounded-full" style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </Section>

      {/* Category Colors */}
      <Section title="Category Colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'Chest', cls: 'category-chest' },
            { name: 'Back', cls: 'category-back' },
            { name: 'Shoulders', cls: 'category-shoulders' },
            { name: 'Biceps', cls: 'category-biceps' },
            { name: 'Triceps', cls: 'category-triceps' },
            { name: 'Legs', cls: 'category-legs' },
            { name: 'Abs', cls: 'category-abs' },
          ].map(cat => (
            <div key={cat.name} className="card p-3">
              <span className={`${cat.cls} text-sm font-medium`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="border-t border-sanctum-700 pt-6 mt-12 text-center">
        <p className="text-sanctum-500 text-xs">
          Sanctum Design System v2.0 — Temporary preview page
        </p>
      </div>
    </div>
  );
}
