# Phase 4: Workout Logging Screen — Technical Plan

## Overview
The workout screen is the core feature of Sanctum. It allows users to log sets (weight x reps), track session time, auto-save progress, validate completion, and see a ceremonial end-of-workout summary. The logic is ported from ~/DEV/gabi-workouts/ but reskinned to Sanctum's dark "witchy" aesthetic.

## Existing Infrastructure (from Phases 1-3)

### Types (`src/types/index.ts`)
- `Exercise` — program definition (name, category, sets, reps, rest, notes, optional, perSide)
- `ExerciseLog` — runtime log (exerciseName, sets: SetLog[], notes, skipped)
- `SetLog` — per-set data (setNumber, weight, reps, completed, timestamp)
- `WorkoutLog` — completed workout (id, date, cycle, dayNumber, dayName, exercises, completed, totalVolume, duration, sessionNotes)
- `ActiveWorkout` — in-progress persistence (dayNumber, cycle, exercises: ExerciseLog[])
- `ValidationResult` / `IncompleteSetInfo` — completion validation

### Services
- `workoutStateManager.ts` — save/get/clear/has ActiveWorkout in localStorage
- `workoutValidator.ts` — validates all required exercises complete before saving

### Context (`ProgressContext.tsx`)
- `addWorkoutLog(log)` — persists completed workout
- `getLastWorkoutForDay(dayNumber)` — retrieves previous session data
- `calculateVolume(exercises)` — total volume in lbs

### Utils
- `volumeCalculator.ts` — calculateTotalVolume, formatVolume
- `dateFormatter.ts` — relative date formatting

### Program Data (`program.ts`)
- 6 days, 52 exercises, all 2 sets x 6-12 reps
- `getExercisesForDay(dayNumber)`, `getWorkoutDay(dayNumber)`, `getRestTimerSeconds(category)`

## Type Changes Required

### Add to ExerciseLog:
```typescript
export interface ExerciseLog {
  exerciseName: string;
  sets: SetLog[];
  notes: string;
  skipped?: boolean;
  replacedWith?: string;  // NEW: temporary replacement name for this session only
}
```

### Add to ActiveWorkout:
```typescript
export interface ActiveWorkout {
  dayNumber: number;
  cycle: number;
  exercises: ExerciseLog[];
  startTime: number;  // NEW: Date.now() when workout began, for session timer
}
```

## Architecture — Component Tree

```
Workout (page)
├── WorkoutHeader
│   ├── Back button (-> dashboard)
│   ├── Workout name
│   └── Session timer (elapsed)
├── ExerciseCard[] (accordion list)
│   ├── CollapsedView (name, status badge, category badge)
│   └── ExpandedView
│       ├── Exercise name + category badge
│       ├── Previous session data
│       ├── SetRow[] (weight input, reps input, complete circle)
│       ├── RestTimer (per-set, after completion)
│       ├── Notes (collapsible)
│       ├── Replace exercise (text input)
│       └── Skip (optional exercises only)
├── ValidationErrors (floating panel)
├── CompleteWorkoutButton (fixed bottom)
└── WorkoutSummary (full-screen overlay on completion)
```

## Task Breakdown (ordered by dependency)

### Task 1: Type Updates
**File:** `src/types/index.ts`
**Changes:**
- Add `replacedWith?: string` to ExerciseLog
- Add `startTime: number` to ActiveWorkout
- Update `isValidActiveWorkout` in workoutStateManager.ts to validate `startTime`

### Task 2: Session Timer Hook
**File:** `src/hooks/useSessionTimer.ts` (NEW)
**Logic:**
- Takes `startTime: number` (epoch ms)
- Returns `{ elapsed: string, seconds: number }` where elapsed = "MM:SS" or "H:MM:SS"
- Uses `setInterval(1000)` with cleanup
- Format: hours only shown when > 0

### Task 3: Rest Timer Hook
**File:** `src/hooks/useRestTimer.ts` (NEW)
**Logic:**
- Takes `durationSeconds: number`, `isActive: boolean`
- Returns `{ remaining: number, display: string, isRunning: boolean, dismiss: () => void }`
- Countdown from durationSeconds to 0
- Auto-stops at 0
- dismiss() stops early
- display format: "M:SS"

### Task 4: ExerciseCard Component
**File:** `src/components/ExerciseCard.tsx` (NEW)
**Props:**
```typescript
interface ExerciseCardProps {
  exercise: Exercise;
  exerciseLog: ExerciseLog;
  exerciseIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => void;
  onUpdateNotes: (exerciseIndex: number, notes: string) => void;
  onSetComplete: (exerciseIndex: number, setIndex: number) => void;
  onSkipExercise: (exerciseIndex: number, skipped: boolean) => void;
  onReplaceExercise: (exerciseIndex: number, replacementName: string) => void;
  lastExerciseData: ExerciseLog | null;
}
```

**Collapsed state:**
- Exercise name (or "Original -> Replacement" if replaced)
- Completion badge: "X/2 sets" in sanctum-400
- Category badge (color-coded)
- Chevron icon

**Expanded state:**
- Exercise name (sanctum-100, medium weight)
- Category badge (subtle, color-coded by muscle group):
  - chest: blood-800/blood-900 bg
  - back: metal-steel/sanctum-700 bg
  - shoulders: sanctum-600/sanctum-500 bg
  - biceps: blood-700/blood-800 bg
  - triceps: blood-600/blood-700 bg
  - legs: sanctum-700/sanctum-600 bg
  - abs: metal-bronze tones
- "Previous" section: last session weight x reps in sanctum-500 text
- Set rows (see Task 5)
- Notes toggle + textarea (placeholder: "Notes...")
- Replace exercise: small "Replace" link -> text input
- Skip: small "Skip" text in sanctum-500 (optional exercises only)

### Task 5: SetRow Sub-component (inside ExerciseCard)
**Renders per set:**
- Set label: "Set 1", "Set 2"
- Weight input: `inputMode="decimal"`, placeholder = last session weight or "lb"
- Reps input: `inputMode="numeric"`, placeholder = last session reps or target reps
- Complete circle: empty circle -> fills blood-500 on check
- After completion: rest timer below (subtle countdown)

**Styling:**
- Inputs: bg-sanctum-800, border-sanctum-700, text-sanctum-100, font-mono
- Completed set: border-blood-900/30 bg highlight
- Incomplete: default dark styling

### Task 6: Rest Timer Display
**Integrated into SetRow after set completion**
- Uses useRestTimer hook
- Shows countdown: "Rest: 2:45" in sanctum-400, text-sm, font-mono
- Dismiss with tap
- Duration based on exercise category via getRestTimerSeconds()

### Task 7: Workout Page — Core State & Layout
**File:** `src/pages/Workout.tsx` (REPLACE placeholder)
**State:**
- `exerciseLogs: ExerciseLog[]` — lazy init from localStorage or fresh
- `expandedExercise: number` — accordion index (-1 = none)
- `showValidationErrors: boolean`
- `showSummary: boolean`
- `sessionNotes: string`
- `startTime: number` — stored in ActiveWorkout for persistence

**Initialization logic (same pattern as gabi-workouts):**
1. Parse dayNumber from URL params
2. Get exercises via `getExercisesForDay(dayNum)`
3. Get last workout via `getLastWorkoutForDay(dayNum)`
4. Check localStorage for active workout
5. If saved workout exists AND cycle matches -> restore exerciseLogs + startTime
6. Else -> create fresh exerciseLogs, set startTime = Date.now()

**Auto-save (useEffect on exerciseLogs):**
- Save to localStorage via `saveActiveWorkout({ dayNumber, cycle, exercises: exerciseLogs, startTime })`

**Handler functions (port from gabi-workouts):**
- `updateSet(exerciseIndex, setIndex, updates)`
- `updateNotes(exerciseIndex, notes)`
- `handleSetToggle(exerciseIndex, setIndex)` — toggle completed, set timestamp
- `handleSkipExercise(exerciseIndex, skipped)`
- `handleReplaceExercise(exerciseIndex, replacementName)`
- `handleCompleteWorkout()` — validate -> show errors or show summary
- `handleFinalSave()` — build WorkoutLog, addWorkoutLog, clearActiveWorkout, navigate

### Task 8: Workout Header
**Inline in Workout page (not separate component — keep simple)**
- Back arrow (ArrowLeft icon) -> navigate('/')
- Workout name from getWorkoutDay()
- Session timer from useSessionTimer hook
- Progress bar (completed sets / total sets)

### Task 9: Validation Error Display
**Inline in Workout page**
- Floating panel at bottom when showValidationErrors=true
- Lists incomplete required exercises
- sanctum-300 text, blood-500 accent
- Dismiss button

### Task 10: Workout Summary Screen
**File:** `src/components/WorkoutSummary.tsx` (NEW)
**Props:**
```typescript
interface WorkoutSummaryProps {
  exerciseLogs: ExerciseLog[];
  exercises: Exercise[];
  duration: number; // seconds
  sessionNotes: string;
  onSessionNotesChange: (notes: string) => void;
  onSave: () => void;
}
```

**Display:**
- Full-screen overlay (fixed inset-0, bg-sanctum-950)
- Total exercises completed
- Total sets completed
- Total volume in lbs (large, metal-gold text)
- Session duration (formatted)
- Random closing line from the pool (8 options)
- Session notes textarea
- "Save" button (blood-500 primary)

**Closing lines pool:**
```
"The work is done. Return stronger."
"Strength recorded."
"Discipline compounds."
"Another layer of armor built."
"The body remembers what the mind commands."
"You showed up. That is power."
"Progress locked."
"This is how legends train — alone, in silence."
```

### Task 11: Integration & Polish
- Wire everything together in Workout.tsx
- Test mobile touch targets (min 44px)
- Ensure numeric keypads on mobile
- Test auto-save/restore cycle
- Test validation flow end-to-end

### Task 12: Tests
- Unit tests for useSessionTimer
- Unit tests for useRestTimer
- Component tests for ExerciseCard (expand/collapse, set input, skip, replace)
- Component tests for WorkoutSummary
- Integration tests for Workout page (initialization, auto-save, validation, completion)

### Task 13: Git Branch & Commit
- Create branch `phase-4-workout-screen`
- Commit all changes

## Implementation Order

1. Task 1 (types) — 0 dependencies
2. Task 2 (session timer hook) — 0 dependencies
3. Task 3 (rest timer hook) — 0 dependencies
4. Task 4+5+6 (ExerciseCard + SetRow + RestTimer) — depends on 1, 3
5. Task 7+8+9 (Workout page + header + validation) — depends on 1, 2, 4
6. Task 10 (WorkoutSummary) — depends on 1
7. Task 11 (integration) — depends on all above
8. Task 12 (tests) — depends on all above
9. Task 13 (git) — final

## Styling Notes

### Category Badge Colors
```typescript
const categoryBadgeColors: Record<string, string> = {
  chest: 'bg-blood-900/40 text-blood-400 border-blood-800/30',
  back: 'bg-sanctum-800 text-metal-silver border-sanctum-700',
  shoulders: 'bg-sanctum-800 text-sanctum-300 border-sanctum-700',
  biceps: 'bg-blood-900/30 text-blood-400 border-blood-800/20',
  triceps: 'bg-blood-900/20 text-blood-300 border-blood-800/20',
  legs: 'bg-sanctum-800 text-sanctum-200 border-sanctum-600',
  abs: 'bg-sanctum-800 text-metal-bronze border-sanctum-700',
};
```

### Input Styling
```
bg-sanctum-800 border border-sanctum-700 rounded-lg px-3 py-2.5
text-sanctum-100 font-mono text-sm text-center
placeholder:text-sanctum-600
focus:outline-none focus:border-blood-500/50
```

### Complete Circle
```
Unchecked: w-10 h-10 rounded-full border-2 border-sanctum-600
Checked: w-10 h-10 rounded-full bg-blood-500 border-2 border-blood-500
```

## No Changes Needed To
- `workoutValidator.ts` — already handles ExerciseLog[] validation correctly
- `volumeCalculator.ts` — already calculates from ExerciseLog[]
- `ProgressContext.tsx` — already has addWorkoutLog, getLastWorkoutForDay
- `App.tsx` — route already exists at /workout/:dayNumber
- `BottomNav` — already hidden on /workout routes
