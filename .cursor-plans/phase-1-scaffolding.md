# Phase 1: Project Scaffolding, Data Model & Services

## Overview
Initialize the Sanctum workout tracking PWA with complete data model, services, and project scaffolding. No UI beyond placeholder pages.

## Reference Architecture
Based on analysis of ~/DEV/gabi-workouts/ — a Vite + React 18 + TypeScript PWA with:
- React Context + localStorage for state
- Service layer pattern for business logic
- Tailwind CSS for styling
- vite-plugin-pwa for offline support
- Vitest + Testing Library for tests

## Key Differences from gabi-workouts

| Feature | gabi-workouts | Sanctum |
|---------|--------------|---------|
| Structure | 8-week, 2 blocks | Repeating cycles, no blocks |
| Days/cycle | 4 days/week | 6 days/cycle |
| Tracking | Week + Block | Cycle number |
| Exercises | Different per block | Same every cycle |
| Categories | olympic/compound/accessory/core/power | chest/back/shoulders/biceps/triceps/legs/abs |
| Special | Intensity techniques, RIR | Deload tracking, total volume |
| WorkoutDay | block1Exercises + block2Exercises | exercises (flat list) |

## Implementation Steps (ordered by dependency)

### Step 1: Initialize Vite Project
- `npm create vite@latest . -- --template react-ts` (in sanctum dir)
- Match package.json dependencies exactly from gabi-workouts
- Install: react-router-dom, lucide-react, recharts
- Install dev: tailwindcss, postcss, autoprefixer, vite-plugin-pwa, vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitest/ui, jsdom
- Configure tsconfig.json (match gabi-workouts with path aliases)

### Step 2: Configuration Files
- **vite.config.ts** — React plugin + PWA plugin (update manifest for Sanctum)
- **tailwind.config.js** — Same theme as gabi-workouts (witchy purple aesthetic)
- **postcss.config.js** — tailwindcss + autoprefixer
- **vitest.config.ts** — jsdom environment, setup file, coverage config
- **src/test/setup.ts** — Testing Library cleanup + jest-dom matchers
- **index.html** — Update title/description for Sanctum, keep fonts & PWA meta tags

### Step 3: Global Styles
- **src/index.css** — Port from gabi-workouts, update category colors for new categories (chest/back/shoulders/biceps/triceps/legs/abs), add day-5 and day-6 gradients

### Step 4: TypeScript Types (src/types/index.ts)
Keep identical from gabi-workouts:
- `SetLog` (setNumber, weight, reps, completed, timestamp?)
- `ExerciseLog` (exerciseName, sets, notes, skipped?)
- `IncompleteSetInfo` (exerciseIndex, exerciseName, setIndex, setNumber, missingFields, isOptional)
- `ValidationResult` (isValid, errors, incompleteSets)

Modified types:
- `Exercise` — category changes to: chest/back/shoulders/biceps/triceps/legs/abs. Remove rir requirement (keep as optional). Keep perSide, optional, substitutions, intensityTechnique
- `WorkoutDay` — flat `exercises[]` instead of block1/block2. Remove targetDuration
- `Program` — programName, daysPerCycle (6), deloadIntervalWeeks (5), workoutDays[]
- `WorkoutLog` — cycle instead of week/block. Add totalVolume?, duration?. Remove rpe
- `UserProgress` — currentCycle, cycleStartDate, deloadIntervalWeeks, lastDeloadDate?, workoutLogs[]
- `ActiveWorkout` — dayNumber, cycle, exercises[] (no week/block)

### Step 5: Workout Program Data (src/data/program.ts)
- Define all 6 workout days with complete exercise data from the brief
- Day 1: Chest/Back (8 exercises)
- Day 2: Shoulders/Arms (9 exercises)
- Day 3: Legs A (10 exercises)
- Day 4: Push (8 exercises)
- Day 5: Pull (8 exercises)
- Day 6: Legs B (9 exercises)
- Total: 52 exercises across 6 days
- All exercises: 2 sets, 6-12 reps
- Rest times: chest/back/legs = "3 min", shoulders = "2 min", biceps/triceps/abs = "90 sec"
- Helper functions: getExercisesForDay, getWorkoutDay, getRestTimerSeconds

### Step 6: Services
**workoutStateManager.ts** — Port from gabi-workouts:
- Same storage key pattern: `active-workout-${dayNumber}`
- Same functions: saveActiveWorkout, getActiveWorkout, clearActiveWorkout, hasActiveWorkout, getAllActiveWorkoutDays
- Update isValidActiveWorkout: check for `cycle` instead of `week`+`block`

**workoutValidator.ts** — Direct port, no changes needed:
- Same logic: getIncompleteSets, validateWorkoutCompletion
- Types are compatible (Exercise category change doesn't affect validation)

### Step 7: Volume Calculator (src/utils/volumeCalculator.ts)
Simplified from gabi-workouts (no muscle group mapping needed in v1):
- `calculateSetVolume(set: SetLog): number`
- `calculateExerciseVolume(exercise: ExerciseLog): number`
- `calculateWorkoutVolume(exercises: ExerciseLog[]): number` — sum of weight * reps for completed sets
- `calculateTotalVolume(exercises: ExerciseLog[]): number` — alias/same as above
- `formatVolume(volume: number): string` — "42.5k lb" or "8,450 lb"
- `getCurrentCycleVolume(workouts: WorkoutLog[], cycle: number): VolumeData`

### Step 8: Progress Context (src/contexts/ProgressContext.tsx)
Port from gabi-workouts with changes:
- Replace `currentWeek`/`currentBlock` with `currentCycle`
- Add `deloadIntervalWeeks` (default 5) and `lastDeloadDate` to state
- `updateCycle(cycle: number)` — replaces updateWeek
- `addWorkoutLog(log: WorkoutLog)` — same pattern
- `getLastWorkoutForDay(dayNumber: number)` — same pattern
- `getExerciseHistory(exerciseName: string)` — same pattern
- `calculateTotalVolume(exercises: ExerciseLog[])` — new, uses volumeCalculator
- `shouldSuggestDeload(): boolean` — check weeks since lastDeloadDate vs deloadIntervalWeeks
- `recordDeload()` — set lastDeloadDate to today
- `exportData()` / `importData()` / `resetProgress()` — same pattern
- Storage key: `sanctum-progress`

### Step 9: App Shell & Routing
**src/App.tsx** — Same pattern as gabi-workouts:
- Lazy load Dashboard, Workout, History
- ProgressProvider wrapping Routes
- Suspense with loading fallback
- Routes: /, /workout/:dayNumber, /history

**src/main.tsx** — Same pattern:
- BrowserRouter wrapping App
- Service worker registration

### Step 10: Placeholder Pages
**src/pages/Dashboard.tsx** — Export named `Dashboard`, render "Sanctum — Dashboard"
**src/pages/Workout.tsx** — Export named `Workout`, render "Workout — Day {dayNumber}"
**src/pages/History.tsx** — Export named `History`, render "History"

### Step 11: Tests
- **src/types/index.test.ts** — Type compilation check
- **src/data/program.test.ts** — All helpers, exercise counts per day, rest timer logic
- **src/services/workoutStateManager.test.ts** — Save/load/clear/has/getAllDays
- **src/services/workoutValidator.test.ts** — Complete/incomplete/optional exercise validation
- **src/utils/volumeCalculator.test.ts** — Set/exercise/workout volume, formatting
- **src/contexts/ProgressContext.test.tsx** — Add log, update cycle, deload logic

### Step 12: Git Init
- Create .gitignore (node_modules, dist, coverage, .env)
- `git init && git add . && git commit -m "Initial scaffolding: data model, services, context"`

## Deliverables Checklist
- [ ] Clean Vite + React + TS project with all dependencies installed
- [ ] Complete type definitions in src/types/index.ts
- [ ] Full workout program data in src/data/program.ts with 52 exercises
- [ ] ProgressContext with localStorage persistence + deload tracking
- [ ] workoutStateManager service (active workout save/restore)
- [ ] workoutValidator service
- [ ] Volume calculator utility
- [ ] Basic routing setup (/, /workout/:dayNumber, /history)
- [ ] Placeholder pages that render without errors
- [ ] PWA manifest and service worker config
- [ ] All tests passing
- [ ] Git initialized with first commit

## File Manifest
```
sanctum/
├── .cursor-plans/
│   └── phase-1-scaffolding.md
├── public/
│   └── favicon.svg
├── src/
│   ├── components/            (empty for now)
│   ├── contexts/
│   │   └── ProgressContext.tsx
│   ├── data/
│   │   └── program.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Workout.tsx
│   │   └── History.tsx
│   ├── services/
│   │   ├── workoutStateManager.ts
│   │   └── workoutValidator.ts
│   ├── test/
│   │   └── setup.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── volumeCalculator.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```
