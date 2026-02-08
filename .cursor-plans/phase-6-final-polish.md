# Phase 6: Final Polish — Implementation Plan

## Branch
`phase-6-final-polish` (from `main`)

---

## Task 1: PWA Configuration & Icons

### 1a. Wire icon files in manifest (vite.config.ts)
Current state: `vite.config.ts` references `pwa-192x192.png` and `pwa-512x512.png` — these don't exist. User will place icons in `public/` with these filenames:
- `icon-512x512.png`, `icon-192x192.png`, `apple-touch-icon.png`, `favicon.svg`, `favicon-32x32.png`

**Changes to `vite.config.ts`:**
- Update `includeAssets` to: `['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png']`
- Update manifest `description` from `'Personal Workout Tracker'` to `'Private workout log.'`
- Update manifest icons array:
  ```
  { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }
  { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
  ```
- Remove the maskable icon entry (no maskable icon provided)
- Remove `orientation` and `scope` (not in spec, keep it minimal)

### 1b. Update index.html
Current state: Already has most PWA meta tags. Needs:
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` — already present, good
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` — already present, good
- `<meta name="theme-color" content="#0a0a0b" />` — already present, good
- `<meta name="apple-mobile-web-app-capable" content="yes" />` — already present, good
- `<meta name="apple-mobile-web-app-status-bar-style" content="black" />` — current: `black`, matches spec
- `<meta name="apple-mobile-web-app-title" content="Sanctum" />` — already present, good
- Change description to `"Private workout log."` (currently `"Sanctum — Personal Training Log"`)
- Remove `<link rel="manifest" href="/manifest.webmanifest" />` — vite-plugin-pwa injects this automatically
- Remove `vite.svg` from `public/` (leftover Vite scaffold)

### 1c. Service worker (generateSW)
Current state: `main.tsx` manually registers `/sw.js`. With `vite-plugin-pwa` using `registerType: 'autoUpdate'`, the plugin handles registration automatically via virtual module.

**Changes to `main.tsx`:**
- Remove the manual `serviceWorker.register('/sw.js')` block
- Add `import { registerSW } from 'virtual:pwa-register';` and `registerSW();`

**Workbox config (already in vite.config.ts):**
- `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']` — good
- Runtime caching for Google Fonts — good
- No changes needed to workbox config

---

## Task 2: Settings Page

### 2a. Create `src/pages/Settings.tsx`

**Sections:**
1. **Units toggle** — lb / kg. Two buttons side by side, one active. Store in localStorage key `sanctum-units`. Default: `lb`.
2. **Deload interval** — 3 options: 4, 5, 6. Three buttons side by side. Read/write via ProgressContext (`deloadIntervalWeeks`). Need to add `updateDeloadInterval` to ProgressContext.
3. **Export** — Single "Export" button. Uses `exportData()` from ProgressContext. Fix filename: currently `sanctum-data-YYYY-MM-DD.json`, spec says `sanctum-backup-YYYY-MM-DD.json`.
4. **Import** — "Import" button opens file picker. On file load, show confirmation modal: "This will replace all existing data. Continue?" with "Replace" (blood-500) and "Cancel" (ghost). Uses `importData()` from ProgressContext. Need to add validation before import.
5. **Reset** — "Reset" button. Shows confirmation: "This will permanently delete all workout data. This cannot be undone." Text input where user must type "RESET". "Delete Everything" button (blood-500, disabled until RESET typed). Uses `resetProgress()` from ProgressContext. Also clears all `sanctum-active-workout-*` keys.

**Style:** sanctum-900 cards, sanctum-700 borders, 1px dividers between sections. Text-only labels.

### 2b. Update ProgressContext
- Add `updateDeloadInterval(weeks: number)` method
- Fix `exportData()` filename: `sanctum-backup-YYYY-MM-DD.json`
- Improve `importData()` validation: check for required fields (`currentCycle`, `workoutLogs` array, etc.)
- `resetProgress()` should also clear active workout localStorage keys

### 2c. Wire into App.tsx
- Add lazy import for Settings page
- Add route: `<Route path="/settings" element={<Settings />} />`
- BottomNav already has `/settings` link — good

### 2d. Unit conversion system
- Create `src/contexts/UnitsContext.tsx` (or simpler: just a hook)
- Actually simpler: create `src/hooks/useUnits.ts` that reads/writes `sanctum-units` localStorage key
- `convertWeight(lbs: number, unit: 'lb' | 'kg'): number` — if kg, multiply by 0.453592, round to 1 decimal
- `formatWeight(lbs: number, unit: 'lb' | 'kg'): string` — returns `"185 lb"` or `"83.9 kg"`
- Update `formatVolume()` in volumeCalculator.ts to accept unit param
- Update History page volume displays
- Update ExerciseCard weight placeholders/displays
- Update WorkoutSummary volume display

---

## Task 3: Voice & Tone Audit

### Violations found during codebase review:

**History.tsx (line 76-77):**
- `"No workouts logged yet"` → `"No sessions recorded."`
- `"Complete your first workout to see history here"` → Remove entirely
- Dumbbell icon in empty state → Remove

**History.tsx (line 202):**
- `{set.weight} lb × {set.reps}` — hardcoded `lb`, needs unit support

**ExerciseCard.tsx (line 163):**
- `'Hide notes'` → Just toggle to `'Notes'` in both states (or keep as is — this is factual)
- `'Notes...'` placeholder (line 171) → `'Notes'`

**ExerciseCard.tsx (line 199):**
- `'Replace with:'` placeholder → `'Replace with'`

**Workout.tsx (line 397):**
- `'Complete Workout'` button → This text should stay factual. Keep as is.
- Actually per spec, completion button isn't mentioned. The save button on summary should be `"Save"` — already correct (line 116 of WorkoutSummary.tsx).

**WorkoutSummary.tsx (line 68):**
- `'Total Volume'` → `'Volume'` (spec says just "Volume")

**WorkoutSummary.tsx (line 108):**
- `'Session notes...'` placeholder → `'Notes'`

**Dashboard.tsx:**
- Clean. "Sanctum" header, "Cycle N", deload text, stats strip — all good.

**DayCard.tsx:**
- Clean. No violations.

**BottomNav.tsx:**
- Icons only, no text labels visible — already correct. `aria-label` text is fine (accessibility only).

**workoutValidator.ts (line 82):**
- Error messages are: `"[Exercise]: set(s) N incomplete"` — factual, good.

**Workout.tsx (line 364-365):**
- `"Complete all required exercises:"` — close to spec `"Complete all sets for [Exercise Name]"`. The current grouped format is fine, actually more concise.

**PageLoader (App.tsx line 16):**
- `"Loading"` — fine, factual.

---

## Task 4: Final Polish Checklist

### 4a. Transitions
- Already using `duration-200 ease-out` throughout (verified in index.css component tokens). Good.

### 4b. Layout shifts
- Exercise cards use `animate-fade-in` on expand. No height transitions that would cause CLS. Good.

### 4c. Touch targets (44x44px minimum)
- **Pause/Reset buttons in Workout header** (lines 274-287): `p-1` on 14px icons = ~22px touch target. **NEEDS FIX** → increase to `p-3` or `min-h-[44px] min-w-[44px]` with flex centering
- **Set complete circle** (line 342): `w-10 h-10` = 40px. **NEEDS FIX** → `w-11 h-11` (44px)
- **Rest timer dismiss** (line 360): text button, no min size. **NEEDS FIX** → add `min-h-[44px]`
- **Notes toggle** (ExerciseCard line 158): small text button. **NEEDS FIX** → add `min-h-[44px] py-2`
- **Replace/Skip buttons** (lines 179-191): `px-3 py-1.5` ≈ 30px height. **NEEDS FIX** → increase to `py-2.5`
- **Back arrow** (Workout line 261): icon in button, no explicit size. **NEEDS FIX** → add `min-h-[44px] min-w-[44px]` with flex centering
- **BottomNav links**: `py-3` with 20px icon ≈ 44px. Good.
- **Day cards**: full card is link, plenty of size. Good.
- **History expand buttons**: full-width button with p-4. Good.

### 4d. inputMode
- Weight inputs: `inputMode="decimal"` — already correct (ExerciseCard line 313)
- Reps inputs: `inputMode="numeric"` — already correct (ExerciseCard line 329)

### 4e. iOS safe area
- Bottom nav: `pb-[env(safe-area-inset-bottom)]` — already correct (BottomNav line 20)
- Top: CSS handles `@media (display-mode: standalone)` with padding-top — already correct (index.css line 148-152)
- Body also has `padding-top: var(--safe-area-inset-top)` and `padding-bottom: var(--safe-area-inset-bottom)` — good

### 4f. No console.log
- Verified: zero `console.log` in src/. Only `console.error` in ProgressContext for actual errors. Good.

### 4g. localStorage cleanup
- `clearActiveWorkout(dayNum)` called on save and reset. Need to verify it also works in Settings reset.

### 4h. TypeScript strict mode
- Need to verify tsconfig has `strict: true` and no `any` types. Quick grep needed.

### 4i. Build verification
- Run `npm run build` at end to verify clean build.

---

## Task 5: README.md

Create minimal README per spec. Exact content provided.

---

## Task 6: Cleanup

- Remove `DesignSystem.tsx` page and its route (development tool, not production)
- Remove `vite.svg` from public/
- Remove `src/App.css` (unused scaffold file)
- Remove `src/assets/` directory (unused scaffold)

---

## Implementation Order

1. Create branch `phase-6-final-polish`
2. **Task 2b**: Update ProgressContext (add `updateDeloadInterval`, fix export filename, improve import validation, fix reset to clear active workouts)
3. **Task 2d**: Create `src/hooks/useUnits.ts` unit system
4. **Task 2a**: Create Settings page
5. **Task 2c**: Wire Settings into App.tsx routes
6. **Task 1a**: Fix vite.config.ts manifest icons
7. **Task 1b**: Update index.html meta tags
8. **Task 1c**: Fix service worker registration in main.tsx
9. **Task 3**: Voice & tone audit (all string fixes)
10. **Task 4**: Polish fixes (touch targets, unit integration in displays)
11. **Task 5**: Create README.md
12. **Task 6**: Cleanup unused files
13. Run `npm run build` to verify
14. Run tests to verify
15. Commit

---

## Files to Create
- `src/pages/Settings.tsx`
- `src/hooks/useUnits.ts`
- `README.md` (overwrite existing scaffold)

## Files to Modify
- `vite.config.ts` — icon paths, manifest description
- `index.html` — description meta, remove manual manifest link
- `src/main.tsx` — replace manual SW registration with vite-plugin-pwa
- `src/App.tsx` — add Settings route, remove DesignSystem route
- `src/contexts/ProgressContext.tsx` — add updateDeloadInterval, fix export/import/reset
- `src/pages/History.tsx` — empty state text, unit support
- `src/pages/Workout.tsx` — touch targets
- `src/components/ExerciseCard.tsx` — placeholder text, touch targets, unit display
- `src/components/WorkoutSummary.tsx` — "Volume" label, placeholder text, unit display
- `src/utils/volumeCalculator.ts` — add unit-aware formatVolume

## Files to Delete
- `src/pages/DesignSystem.tsx`
- `public/vite.svg`
- `src/App.css` (if exists and unused)
- `src/assets/` (if exists and unused)

## Note on Icon Files
User said they've added icon files to `public/` but currently only `vite.svg` exists. The plan proceeds assuming files will be present before build. If not, build will succeed but icons won't show.
