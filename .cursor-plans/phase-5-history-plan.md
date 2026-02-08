# Phase 5: History Screen — Technical Plan

## Overview

Replace the placeholder `History.tsx` with a full workout history page showing completed workouts in reverse chronological order, volume aggregates, expandable workout details, and PR indicators.

## Architecture

### New Files
| File | Purpose |
|------|---------|
| `src/services/prDetector.ts` | Pure functions for PR detection |
| `src/services/prDetector.test.ts` | Tests for PR detector |
| `src/pages/History.test.tsx` | Tests for History page |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/History.tsx` | Replace placeholder with full page |

### No Changes Needed
- Routing already wired (`/history` in App.tsx)
- BottomNav already links to `/history`
- All utility functions already exist (`formatRelativeDate`, `formatVolume`, `calculateTotalVolume`, `getCurrentCycleVolume`, `calculateWorkoutVolume`)

## Task Breakdown

### Task 1: PR Detector Service
Create `src/services/prDetector.ts` with pure functions:

```typescript
interface PRResult {
  isPR: boolean;         // true if this set beat previous best for the exercise
  previousBest: number;  // previous best set volume (weight × reps)
}

// Given a workout log, find the most recent previous workout for the same dayNumber
function findPreviousWorkout(dayNumber: number, currentId: string, allLogs: WorkoutLog[]): WorkoutLog | null

// For a specific set in a specific exercise, check if it's a PR vs previous workout
function isSetPR(set: SetLog, exerciseName: string, previousWorkout: WorkoutLog | null): PRResult
```

**PR logic**: A set is a PR if its volume (weight × reps) is strictly greater than the best set volume for the same exercise in the most recent previous completed workout of the same day.

Tests:
- Returns no PR when no previous workout exists
- Detects PR when set volume beats previous best
- No PR when set volume equals previous best (strict >)
- No PR when set volume is less
- Handles skipped exercises in previous workout
- Handles null weight/reps gracefully

### Task 2: History Page — Volume Header + Workout List
Replace `History.tsx` with:

**Volume Header:**
- "This Cycle" — uses `getCurrentCycleVolume(workoutLogs, currentCycle)`
- "All Time" — sums all completed workout volumes
- Both displayed in `text-metal-gold font-mono`

**Workout List (collapsed):**
- Filter `workoutLogs` to `completed === true`, sort by date descending
- Each card shows: date (formatRelativeDate), day name, total volume (metal-gold), duration
- Style: `bg-sanctum-900 border border-sanctum-700 rounded-xl`
- Chevron icon (ChevronDown/ChevronUp from lucide-react)

**Empty State:**
- When no completed workouts: "No workouts logged yet" message

### Task 3: Expandable Workout Details + PR Indicators
On tap/click, expand card to show:

**Per-Exercise Section:**
- Exercise name + category badge (reuse `categoryBadgeColors` pattern from ExerciseCard)
- If skipped: show "SKIPPED" badge, muted
- If replaced: show "→ replacement name"
- Each completed set: `{weight} lb × {reps}`
- If set is a PR: small `★` in `text-metal-gold` after the set
- Exercise notes if present

**Duration formatting:**
- Reuse the `formatDuration` pattern from WorkoutSummary (hrs + mins)

### Task 4: History Page Tests
Test with React Testing Library:
- Renders empty state when no workouts
- Renders workout cards with correct data
- Volume header shows correct cycle/all-time totals
- Expand/collapse toggles exercise details
- PR indicators render on qualifying sets
- Handles workouts with missing totalVolume (calculate on the fly)
- Handles zero-volume workouts

## Styling Guidelines

Following existing patterns:
- Page container: `px-4 py-6 pb-24 max-w-lg mx-auto bg-sanctum-950 min-h-screen`
- Cards: `bg-sanctum-900 border border-sanctum-700 rounded-xl`
- Volume numbers: `text-metal-gold font-mono font-bold`
- Labels: `text-xs text-sanctum-500 uppercase tracking-widest`
- Expand animation: `animate-fade-in` (already in tailwind config)
- Category badges: same colors as ExerciseCard (`categoryBadgeColors`)

## Component Structure (all in History.tsx)

```
History (page)
├── VolumeHeader (inline — cycle + all-time stats)
├── Empty state (conditional)
└── WorkoutCard[] (map over sorted logs)
    ├── Collapsed: date, name, volume, duration, chevron
    └── Expanded: ExerciseHistoryItem[] (conditional)
        ├── Exercise name + category badge
        ├── SetDisplay[] with optional PR star
        └── Notes (conditional)
```

Keeping everything in one file (like the reference app does with `ExerciseHistoryItem`) — no need for separate component files since these are only used here.

## Implementation Order

1. **prDetector.ts + tests** — pure logic, no UI dependencies
2. **History.tsx** — full page (volume header → workout list → expand → PR indicators)
3. **History.test.tsx** — page-level tests
4. **Verify** — TypeScript clean, all tests pass, build succeeds
5. **Git commit** on feature branch

## Branch Strategy
- Create branch: `phase-5-history-screen`
- Single commit at end: "Phase 5: History screen with volume tracking and PR indicators"
