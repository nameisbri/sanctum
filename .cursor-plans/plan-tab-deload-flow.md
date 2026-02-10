# Plan Tab + Deload Flow

## Context

The app currently has no way to see a cycle overview, preview upcoming deloads, or browse past workout sessions from a calendar-like view. The deload system is a simple banner on the Dashboard with "Not now" — no acceptance flow, no deload mode, no reduced-weight guidance. The user wants a dedicated **Plan tab** with a cycle-based calendar and a proper deload acceptance flow.

---

## Data Model Changes

### `src/types/index.ts`

**UserProgress** — add `isDeloadWeek: boolean`:
```ts
export interface UserProgress {
  // ... existing fields
  isDeloadWeek: boolean;  // NEW — true when user has accepted a deload week
}
```

**WorkoutLog** — add `isDeload?: boolean`:
```ts
export interface WorkoutLog {
  // ... existing fields
  isDeload?: boolean;  // NEW — true if logged during a deload week
}
```

### `src/contexts/ProgressContext.tsx`

1. Update `DEFAULT_PROGRESS` — add `isDeloadWeek: false`
2. Update `loadProgress()` — spread `DEFAULT_PROGRESS` first for backward compat: `return item ? { ...DEFAULT_PROGRESS, ...JSON.parse(item) } : DEFAULT_PROGRESS`
3. Add `startDeload()` — sets `isDeloadWeek: true`
4. Add `endDeload()` — sets `isDeloadWeek: false` + `lastDeloadDate` to today
5. Add `getLogsForCycle(cycle: number): WorkoutLog[]` — returns completed logs for a cycle, sorted by dayNumber
6. Add `getCycleNumbers(): number[]` — returns distinct cycle numbers (descending), always includes currentCycle
7. Update `importData` — handle missing `isDeloadWeek` gracefully (default `false`)
8. Expose new functions on `ProgressContextType`

---

## Navigation + Routing

### `src/components/BottomNav.tsx`
- Import `CalendarDays` from lucide-react
- Add Plan tab between Home and History:
  ```ts
  { to: '/plan', label: 'Plan', icon: CalendarDays, matchExact: true }
  ```

### `src/App.tsx`
- Add lazy import: `const Plan = lazy(() => import('./pages/Plan').then(m => ({ default: m.Plan })))`
- Add route: `<Route path="/plan" element={<Plan />} />`

---

## New Components

### `src/components/DeloadAlert.tsx`
Card shown on Plan page when `shouldSuggestDeload() && !isDeloadWeek`:
- Title: "Time for a Deload"
- Subtitle: "Your body rebuilds in rest. A lighter week helps you come back stronger."
- Two buttons: "Yes, deload" (primary/blood) → `startDeload()`, "Continue training" (secondary) → `recordDeload()` (resets timer, no deload mode)

### `src/components/ActiveDeloadBanner.tsx`
Persistent banner shown on Plan page when `isDeloadWeek`:
- Text: "Deload Week — Use lighter weights, focus on form."
- "End Deload" button → `endDeload()`
- Styled with `border-metal-gold/30` accent

### `src/components/CycleGrid.tsx`
The core calendar component. Renders one cycle as a labeled grid:
```
Cycle 3 (current)
[1] [2] [3] [4] [5] [6]
C/B  S/A  L(A) Push Pull L(B)
```

Props: `{ cycle, isCurrent, logs, onDayTap }`

Cell states:
- **Completed**: `bg-blood-900/30 border-blood-800` — tappable, shows checkmark
- **Completed (deload)**: `bg-metal-gold/10 border-metal-gold/30` — gold accent
- **Pending (current cycle)**: `bg-sanctum-900 border-sanctum-700` — tappable, navigates to `/workout/{day}`
- **Not done (past cycle)**: dimmed `text-sanctum-600`

Day name abbreviations shown below cells for current cycle only.

### `src/components/WorkoutLogPreview.tsx`
Bottom sheet (same pattern as `WorkoutPreview.tsx`) for viewing a past session:
- Header: "Day {N} — {name}" + formatted date
- Stats: volume, duration, deload badge if applicable
- Exercise list with logged weight × reps per set
- Read-only — no "Start Workout" CTA

### `src/pages/Plan.tsx`
Main page composing all above:
```
Header: "Plan" + "Cycle N" badge
DeloadAlert (conditional)
ActiveDeloadBanner (conditional)
CycleGrid (current cycle — highlighted)
CycleGrid (past cycles — scrollable)
WorkoutLogPreview bottom sheet (on tap)
Empty state if no history
```

---

## Modifications to Existing Files

### `src/pages/Dashboard.tsx`
- **Remove** the deload suggestion banner (lines 42-57). Deload prompt now lives on Plan page.
- **Add** small deload indicator next to "Cycle N" when `isDeloadWeek` is true: `<span className="text-metal-gold text-xs ml-2">Deload</span>`
- Keep the `!showDeload && <div className="mb-6" />` spacer as-is (just `mb-6` spacer always)

### `src/pages/Workout.tsx`
- When `progress.isDeloadWeek` is true, add a deload guidance banner below the sticky header:
  ```
  "Deload week — lighter weights, focus on form & recovery."
  ```
- In `handleFinalSave`, if `progress.isDeloadWeek`, set `isDeload: true` on the WorkoutLog

---

## Deload User Journey

1. Time passes → `shouldSuggestDeload()` returns true
2. User opens **Plan** tab → sees `DeloadAlert` card
3. **Accept**: taps "Yes, deload" → `startDeload()` → `isDeloadWeek: true`
   - `ActiveDeloadBanner` appears on Plan page
   - Dashboard shows "Deload" badge next to cycle number
   - Workout pages show deload guidance banner
   - All workouts logged with `isDeload: true`
   - User does as many/few of the 6 days as they want (all optional)
   - Taps "End Deload" on Plan page → `endDeload()` → resets state
4. **Dismiss**: taps "Continue training" → `recordDeload()` → timer resets, no deload mode

---

## Implementation Order

| Step | What | Files |
|------|------|-------|
| 1 | Data model: add `isDeloadWeek` + `isDeload` | `types/index.ts` |
| 2 | Context: new functions + backward compat | `ProgressContext.tsx` |
| 3 | Context tests | `ProgressContext.test.tsx` |
| 4 | Navigation: add Plan tab | `BottomNav.tsx` |
| 5 | Nav tests | `BottomNav.test.tsx` |
| 6 | Router: add Plan route | `App.tsx` |
| 7 | CycleGrid component | `components/CycleGrid.tsx` |
| 8 | DeloadAlert component | `components/DeloadAlert.tsx` |
| 9 | ActiveDeloadBanner component | `components/ActiveDeloadBanner.tsx` |
| 10 | WorkoutLogPreview component | `components/WorkoutLogPreview.tsx` |
| 11 | Plan page (composes 7-10) | `pages/Plan.tsx` |
| 12 | Plan page tests | `pages/Plan.test.tsx` |
| 13 | Dashboard: remove old banner, add deload badge | `Dashboard.tsx` |
| 14 | Workout: deload banner + isDeload on log | `Workout.tsx` |
| 15 | Update Dashboard tests | `Dashboard.test.tsx` |
| 16 | Full test run + verify | all |

---

## Edge Cases
- **Backward compat**: spread `DEFAULT_PROGRESS` in `loadProgress()` so missing `isDeloadWeek` defaults to `false`
- **Empty state**: no logs yet → show current cycle grid (all pending) + "Complete workouts to see history"
- **Multiple logs same day/cycle**: CycleGrid shows most recent log for that day
- **Import data**: `importData` tolerates missing `isDeloadWeek`

## Verification
1. `npm run typecheck` — no TS errors
2. `npm test` — all tests pass (including new ones)
3. `npm run build` — clean build
4. Manual: navigate all 4 tabs, tap cycle cells, accept/dismiss deload, log a workout during deload, verify `isDeload` flag saved
