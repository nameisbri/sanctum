# Phase 3: Dashboard, Navigation & Routing — Technical Design

## 1. Architecture Overview

Phase 3 adds three visual components to the app shell: a full Dashboard page, a
reusable DayCard component, and a fixed BottomNav bar. It also introduces a
small `dateFormatter` utility. No new state management or data persistence is
required — every piece of data the Dashboard needs already exists in
`ProgressContext` and `workoutStateManager`.

### Component Hierarchy

```
App (existing — adds BottomNav + layout wrapper)
├── <Suspense>
│   └── <Routes>
│       ├── "/" → Dashboard
│       │        ├── DashboardHeader
│       │        ├── DeloadBanner (conditional)
│       │        ├── DayCard x6
│       │        └── CycleStats
│       ├── "/workout/:dayNumber" → Workout (placeholder)
│       ├── "/history" → History (placeholder)
│       └── "/design" → DesignSystem
└── <BottomNav /> (hidden on /workout/* routes)
```

### Data Flow

```
sanctumProgram.workoutDays ──────────────────────────┐
                                                     │
ProgressContext                                      │
  ├── progress.currentCycle ───────► DashboardHeader  │
  ├── progress.workoutLogs ────────► CycleStats       │
  ├── getLastWorkoutForDay(n) ─────► DayCard ◄────────┘
  └── shouldSuggestDeload() ───────► DeloadBanner
                                                     
workoutStateManager                                  
  ├── hasActiveWorkout(n) ─────────► DayCard (resume badge)
  └── getAllActiveWorkoutDays() ────► (unused on dashboard,
                                      available if needed)

dateFormatter                      
  └── formatRelativeDate(iso) ─────► DayCard ("Last: Feb 6")
                                   ► CycleStats ("Last trained: Feb 6")
```

All data flows top-down. No component lifts state. The Dashboard page
orchestrates reads from context and passes props to pure presentational
children.

---

## 2. Component Specifications

### 2.1 `src/utils/dateFormatter.ts`

**Responsibility:** Pure utility — formats ISO date strings for display.

```typescript
// Public API
export function formatRelativeDate(isoDate: string): string
// Returns "Today", "Yesterday", or "Mon D" (e.g. "Feb 6")
// If the date is in a different year, returns "Mon D, YYYY"

export function formatShortDate(isoDate: string): string
// Always returns "Mon D" (e.g. "Feb 6") regardless of recency
// If the date is in a different year, returns "Mon D, YYYY"
```

**Implementation notes:**
- Compare against `new Date()` for relative logic (Today/Yesterday).
- Use `Intl.DateTimeFormat` or manual month abbreviation array — avoid
  importing a date library for two functions.
- All logic is pure (no side effects), making it trivially testable.
- Accept an optional `now?: Date` parameter for deterministic testing.

---

### 2.2 `src/components/DayCard.tsx`

**Responsibility:** Renders a single workout day as a tappable card.
Links to `/workout/:dayNumber`.

```typescript
interface DayCardProps {
  dayNumber: number;
  dayName: string;            // e.g. "Chest/Back"
  exerciseCount: number;      // e.g. 8
  lastWorkoutDate: string | null; // ISO string or null
  hasActiveWorkout: boolean;  // show "Resume" badge
}
```

**Visual structure:**

```
┌─────────────────────────────────────────────┐
│ Day 1 · Chest/Back          8 exercises     │
│ Last: Feb 6                     [Resume]    │
└─────────────────────────────────────────────┘
```

**Styling rules:**
- Base: `card-hover` class (bg-sanctum-900, border-sanctum-700, hover to 600).
- Tap interaction: `active:scale-[0.97]` + `transition-transform duration-200 ease-out`.
- Day number: `text-sanctum-400 text-sm`.
- Day name: `text-sanctum-100 font-medium`.
- Exercise count: `text-sanctum-500 text-sm`.
- "Last: date" line: `text-sanctum-500 text-xs`.
- "Resume" badge: `text-blood-500 text-xs font-medium` — only visible when
  `hasActiveWorkout` is true.
- Uses `<Link>` from react-router-dom (not `<a>` or `onClick` + navigate).
- Entire card is the link target (block-level `<Link>`).

**Data sources (resolved by Dashboard, passed as props):**
- `dayName`, `dayNumber`, `exerciseCount` from `sanctumProgram.workoutDays`.
- `lastWorkoutDate` from `getLastWorkoutForDay(dayNumber)?.date ?? null`.
- `hasActiveWorkout` from `hasActiveWorkout(dayNumber)`.

---

### 2.3 `src/components/BottomNav.tsx`

**Responsibility:** Fixed bottom navigation bar. Three icon-only tabs:
Home, History, Settings.

```typescript
// No props — reads current route from useLocation()
```

**Visual structure:**

```
──────────────────────────────────────
  [Home]       [History]     [Settings]
──────────────────────────────────────
```

**Styling rules:**
- Container: `fixed bottom-0 left-0 right-0 z-50`.
- Inner: `max-w-lg mx-auto` to match page width centering.
- Background: `bg-sanctum-950/95 backdrop-blur-sm border-t border-sanctum-700`.
- Three equal-width flex children, each centered vertically and horizontally.
- Icons: Lucide icons — `Home`, `History` (Clock), `Settings`.
- Icon size: `w-5 h-5`.
- Default: `text-sanctum-500`.
- Active: `text-blood-500`.
- Label text: `text-[10px] mt-1` below each icon.
- Default label: `text-sanctum-500`. Active label: `text-blood-500`.
- Active detection: compare `location.pathname` against each route.
  - Home: active when `pathname === "/"`.
  - History: active when `pathname === "/history"` or starts with `/history`.
  - Settings: active when `pathname === "/settings"`.
- Safe area padding: `pb-[env(safe-area-inset-bottom)]` for notched devices.

**Icons from `lucide-react`:**
- `Home` for dashboard.
- `Clock` for history.
- `Settings` for settings.

---

### 2.4 `src/pages/Dashboard.tsx` (rewrite)

**Responsibility:** Full dashboard page. Orchestrates data reads and
renders child components.

**State:** None (all data comes from context/services, no local state needed).

**Sections rendered in order:**

1. **Header row** — "Sanctum" title left-aligned, "Cycle N" right-aligned.
2. **Deload banner** — conditional, shown when `shouldSuggestDeload()` returns true.
3. **Day cards** — map over `sanctumProgram.workoutDays`, render a `<DayCard>` for each.
4. **Cycle stats footer** — summary line below the cards.

**Detailed layout:**

```
<div class="min-h-screen bg-sanctum-950 pb-24">
  <div class="max-w-lg mx-auto px-4 pt-6">

    <!-- Header -->
    <div class="flex items-baseline justify-between mb-6">
      <h1 class="text-2xl font-bold text-sanctum-50 tracking-tight">
        Sanctum
      </h1>
      <span class="text-sanctum-400 text-sm font-medium">
        Cycle {currentCycle}
      </span>
    </div>

    <!-- Deload Banner (conditional) -->
    {shouldDeload && (
      <div class="card p-3 mb-6 border-metal-gold/30">
        <p class="text-metal-gold text-sm">
          Consider a deload. The body rebuilds in rest.
        </p>
      </div>
    )}

    <!-- Day Cards -->
    <div class="space-y-3 mb-8">
      {workoutDays.map(day => <DayCard ... />)}
    </div>

    <!-- Cycle Stats -->
    <div class="text-center text-sanctum-500 text-xs space-x-2">
      <span>{totalSessions} total sessions</span>
      <span>·</span>
      <span>{completedThisCycle} of 6 this cycle</span>
      <span>·</span>
      <span>Last trained: {lastTrainedDate}</span>
    </div>

  </div>
</div>
```

**Computed values:**
- `totalSessions`: `progress.workoutLogs.filter(l => l.completed).length`.
- `completedThisCycle`: count of completed logs where `log.cycle === progress.currentCycle`.
- `lastTrainedDate`: most recent `date` from completed workout logs, formatted
  with `formatRelativeDate()`. Falls back to "Never" if no logs exist.

---

### 2.5 `src/App.tsx` (update)

**Changes:**
- Import `BottomNav` component.
- Import `useLocation` from react-router-dom.
- Extract a layout wrapper component (`AppLayout`) that conditionally renders
  `<BottomNav />` based on the current route.
- Hide BottomNav when the route matches `/workout/*`.

```typescript
// Pseudocode for the conditional logic
function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/workout');

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>...</Routes>
      </Suspense>
      {!hideNav && <BottomNav />}
    </>
  );
}
```

**Why a wrapper component?** `useLocation()` must be called inside a
`<BrowserRouter>`. The `<BrowserRouter>` lives in `main.tsx`, so any component
rendered within `<App>` can call `useLocation()`. We create a small `AppLayout`
inside `App.tsx` to keep things co-located rather than adding a new file.

---

## 3. File Structure

```
src/
├── components/
│   ├── BottomNav.tsx              ← NEW (Task 3)
│   ├── BottomNav.test.tsx         ← NEW (Task 3)
│   ├── DayCard.tsx                ← NEW (Task 2)
│   └── DayCard.test.tsx           ← NEW (Task 2)
├── utils/
│   ├── dateFormatter.ts           ← NEW (Task 1)
│   ├── dateFormatter.test.ts      ← NEW (Task 1)
│   └── volumeCalculator.ts        (existing)
├── pages/
│   ├── Dashboard.tsx              ← REWRITE (Task 4)
│   └── Dashboard.test.tsx         ← NEW (Task 4)
├── App.tsx                        ← UPDATE (Task 5)
├── App.test.tsx                   ← NEW (Task 5)
└── ... (everything else unchanged)
```

---

## 4. Task Breakdown

### Task 1: Date Formatter Utility

**Description:** Create `src/utils/dateFormatter.ts` with two pure functions:
`formatRelativeDate` and `formatShortDate`. These format ISO date strings
("2025-02-06") into human-readable text for the dashboard.

**Files to create:**
- `src/utils/dateFormatter.ts`
- `src/utils/dateFormatter.test.ts`

**Dependencies:** None. This task has zero dependencies on other tasks.

**Complexity:** Simple

**Acceptance criteria:**
- `formatRelativeDate("2025-02-08")` returns `"Today"` when called on Feb 8, 2025.
- `formatRelativeDate("2025-02-07")` returns `"Yesterday"` when called on Feb 8, 2025.
- `formatRelativeDate("2025-02-06")` returns `"Feb 6"` when called on Feb 8, 2025.
- `formatRelativeDate("2024-12-25")` returns `"Dec 25, 2024"` when called in 2025.
- `formatShortDate("2025-02-08")` returns `"Feb 8"` (never "Today").
- `formatShortDate("2024-12-25")` returns `"Dec 25, 2024"`.
- Both functions accept an optional `now?: Date` parameter for deterministic tests.
- All tests pass.
- No external dependencies added.

**Implementation hints:**
- Use a month abbreviation array: `['Jan', 'Feb', 'Mar', ...]`.
- Parse the ISO string by splitting on `-` and constructing a `Date` to avoid
  timezone issues from `new Date("2025-02-06")` (which parses as UTC).
  Specifically: `const [y, m, d] = iso.split('-').map(Number); new Date(y, m-1, d);`
- For "Today"/"Yesterday", compare year + month + day integers, not timestamps.
- Keep the `now` parameter defaulting to `new Date()`.

**What to test:**
- "Today" case.
- "Yesterday" case.
- Same-year past date (short format: "Feb 6").
- Cross-year date (includes year: "Dec 25, 2024").
- January 1 edge case (yesterday is previous year).
- `formatShortDate` never returns "Today" or "Yesterday".

---

### Task 2: DayCard Component

**Description:** Create a reusable `DayCard` component that renders a single
workout day as a tappable card linking to `/workout/:dayNumber`. The card
displays the day number, name, exercise count, last workout date, and an
optional "Resume" badge.

**Files to create:**
- `src/components/DayCard.tsx`
- `src/components/DayCard.test.tsx`

**Dependencies:** Task 1 (uses `formatRelativeDate` for the "Last: ..." line).

**Complexity:** Medium

**Acceptance criteria:**
- Renders day number, day name, and exercise count.
- Shows "Last: Feb 6" when `lastWorkoutDate` is provided.
- Shows nothing for the last-workout line when `lastWorkoutDate` is null.
- Shows "Resume" badge in `text-blood-500` when `hasActiveWorkout` is true.
- Hides "Resume" badge when `hasActiveWorkout` is false.
- Entire card is wrapped in a `<Link to="/workout/{dayNumber}">`.
- Has `card-hover` styling plus `active:scale-[0.97]`.
- Component is a named export: `export function DayCard(...)`.
- All tests pass.

**Implementation hints:**
- Use the existing `card-hover` CSS class for the base card styling.
- The card should be a `<Link>` component with `className` containing
  `card-hover block p-4 active:scale-[0.97] transition-transform duration-200 ease-out`.
- Layout: use flexbox. Top row has day number + name on the left, exercise count
  on the right. Bottom row has last-workout date on the left, resume badge on the right.
- Use `formatRelativeDate(lastWorkoutDate)` to format the date.
- Exercise count text: `"{count} exercises"`.

**Props interface:**
```typescript
interface DayCardProps {
  dayNumber: number;
  dayName: string;
  exerciseCount: number;
  lastWorkoutDate: string | null;
  hasActiveWorkout: boolean;
}
```

**What to test (use `@testing-library/react` + `MemoryRouter`):**
- Renders the day number text ("Day 1").
- Renders the day name text ("Chest/Back").
- Renders exercise count text ("8 exercises").
- Renders formatted last workout date when provided.
- Does not render a "Last:" line when `lastWorkoutDate` is null.
- Renders "Resume" text when `hasActiveWorkout` is true.
- Does not render "Resume" text when `hasActiveWorkout` is false.
- Card links to correct URL (`/workout/1`).

**Test setup note:** Wrap renders with `<MemoryRouter>` since `<Link>` requires
a router context.

---

### Task 3: BottomNav Component

**Description:** Create a fixed bottom navigation bar with three tabs
(Home, History, Settings). Highlights the active tab based on the current route.

**Files to create:**
- `src/components/BottomNav.tsx`
- `src/components/BottomNav.test.tsx`

**Dependencies:** None. This task is independent of Tasks 1 and 2.

**Complexity:** Medium

**Acceptance criteria:**
- Renders three navigation items: Home, History, Settings.
- Each item has a Lucide icon and a text label beneath it.
- Uses `<Link>` components (not `<a>` tags or `navigate()`).
- Home links to `/`, History links to `/history`, Settings links to `/settings`.
- Active tab has `text-blood-500` on both icon and label.
- Inactive tabs have `text-sanctum-500` on both icon and label.
- Active detection uses `useLocation().pathname`.
- Container is fixed to the bottom of the viewport with `z-50`.
- Has a top border: `border-t border-sanctum-700`.
- Background: `bg-sanctum-950/95 backdrop-blur-sm`.
- Inner content is constrained: `max-w-lg mx-auto`.
- Component is a named export: `export function BottomNav()`.
- All tests pass.

**Implementation hints:**
- Define a `navItems` array:
  ```typescript
  const navItems = [
    { to: '/', label: 'Home', icon: Home, matchExact: true },
    { to: '/history', label: 'History', icon: Clock, matchExact: false },
    { to: '/settings', label: 'Settings', icon: Settings, matchExact: true },
  ];
  ```
- For active detection:
  - `matchExact: true` means `pathname === item.to`.
  - `matchExact: false` means `pathname.startsWith(item.to)`.
  - This prevents `/history/detail` from highlighting Home.
- Icon size: pass `size={20}` to Lucide components (equivalent to `w-5 h-5`).
- Use `<nav>` as the outer element for semantic HTML, with `aria-label="Main navigation"`.
- For safe area inset: add `pb-safe` or use
  `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}` on the outer container.

**What to test (use `<MemoryRouter initialEntries={['/']}>`):**
- Renders all three labels: "Home", "History", "Settings".
- Home is active (has blood color class) when on `/`.
- History is active when on `/history`.
- Settings is active when on `/settings`.
- Only one tab is active at a time.
- All links have correct `href` attributes.
- Renders as a `<nav>` element.

---

### Task 4: Dashboard Page (Full Implementation)

**Description:** Rewrite the placeholder `Dashboard.tsx` to render the full
dashboard layout: header with cycle number, conditional deload banner,
six DayCards, and a cycle stats footer.

**Files to modify:**
- `src/pages/Dashboard.tsx` (rewrite)

**Files to create:**
- `src/pages/Dashboard.test.tsx`

**Dependencies:** Task 1 (dateFormatter), Task 2 (DayCard).

**Complexity:** Medium

**Acceptance criteria:**
- Displays "Sanctum" as the page title (`text-2xl font-bold text-sanctum-50`).
- Displays "Cycle N" aligned right of the title, pulling from `progress.currentCycle`.
- Shows deload banner with gold border when `shouldSuggestDeload()` is true.
- Hides deload banner when `shouldSuggestDeload()` is false.
- Renders exactly 6 DayCard components, one for each workout day.
- Each DayCard receives the correct props from program data and progress context.
- Displays total sessions count (completed workouts only).
- Displays "N of 6 this cycle" count for the current cycle.
- Displays "Last trained: {date}" using the most recent completed workout date.
- Shows "Last trained: Never" when there are no completed workouts.
- Page has `pb-24` to clear the bottom nav.
- Page uses `max-w-lg mx-auto` for centering.
- Component is a named export: `export function Dashboard()`.
- All tests pass.

**Implementation hints:**
- Import `useProgress` from context, `sanctumProgram` from data,
  `hasActiveWorkout` from workoutStateManager, and `formatRelativeDate` from
  dateFormatter.
- Compute stats at the top of the component body (no `useMemo` needed for
  these small calculations):
  ```typescript
  const { progress, getLastWorkoutForDay, shouldSuggestDeload } = useProgress();
  const showDeload = shouldSuggestDeload();
  const totalSessions = progress.workoutLogs.filter(l => l.completed).length;
  const completedThisCycle = progress.workoutLogs.filter(
    l => l.completed && l.cycle === progress.currentCycle
  ).length;
  const lastLog = progress.workoutLogs
    .filter(l => l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastTrainedText = lastLog
    ? formatRelativeDate(lastLog.date)
    : 'Never';
  ```
- The deload banner text is exactly: "Consider a deload. The body rebuilds in rest."
- The stats footer uses centered text with middle dots as separators.

**What to test:**
- Renders "Sanctum" heading.
- Renders cycle number from context.
- Shows deload banner when `shouldSuggestDeload` returns true.
- Hides deload banner when `shouldSuggestDeload` returns false.
- Renders 6 day cards (check for "Day 1" through "Day 6" text).
- Shows correct total sessions count.
- Shows "0 of 6 this cycle" when no workouts completed for current cycle.
- Shows "Last trained: Never" when no workouts exist.
- Shows "Last trained: {date}" when workouts exist.

**Test setup notes:**
- Mock `useProgress` to control context values (use `vi.mock`).
- Mock `hasActiveWorkout` from workoutStateManager.
- Wrap with `<MemoryRouter>` since DayCard uses `<Link>`.
- Create a helper to render with controlled progress state.

---

### Task 5: App Layout Update (BottomNav Integration)

**Description:** Update `App.tsx` to include the `BottomNav` component,
conditionally hidden on workout routes. Add a layout wrapper that reads
the current route.

**Files to modify:**
- `src/App.tsx`

**Files to create:**
- `src/App.test.tsx`

**Dependencies:** Task 3 (BottomNav). Tasks 1-4 are not strictly required
since Dashboard/DayCard can be tested independently, but logically this is
the final integration task.

**Complexity:** Simple

**Acceptance criteria:**
- `BottomNav` is visible on `/` (dashboard).
- `BottomNav` is visible on `/history`.
- `BottomNav` is hidden on `/workout/1` (and any `/workout/*` route).
- `BottomNav` is visible on `/design`.
- Existing lazy loading and `PageLoader` still work.
- `ProgressProvider` still wraps all routes.
- All existing routes still render.
- All tests pass.

**Implementation hints:**
- Create an `AppLayout` component inside `App.tsx` (not exported) that uses
  `useLocation()`:
  ```typescript
  function AppLayout() {
    const location = useLocation();
    const hideNav = location.pathname.startsWith('/workout');

    return (
      <>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout/:dayNumber" element={<Workout />} />
            <Route path="/history" element={<History />} />
            <Route path="/design" element={<DesignSystem />} />
          </Routes>
        </Suspense>
        {!hideNav && <BottomNav />}
      </>
    );
  }

  function App() {
    return (
      <ProgressProvider>
        <AppLayout />
      </ProgressProvider>
    );
  }
  ```
- `BottomNav` is not lazy loaded — it is small and should render instantly.

**What to test:**
- BottomNav renders on the dashboard route.
- BottomNav renders on the history route.
- BottomNav does not render on workout routes.
- Routes render correct page components (spot check one or two).

**Test setup notes:**
- Use `<MemoryRouter initialEntries={[route]}>` instead of `<BrowserRouter>`.
- Must wrap with `<ProgressProvider>` since pages consume context.
- For lazy components: either use `act` + `waitFor` or mock the lazy imports
  to return synchronously. Simpler approach: just `await screen.findByText(...)`.

---

## 5. Testing Strategy

### Test Environment
- **Runner:** Vitest with jsdom environment (already configured).
- **Libraries:** `@testing-library/react`, `@testing-library/jest-dom/vitest`, `@testing-library/user-event`.
- **Setup:** `src/test/setup.ts` runs `cleanup()` after each test.
- **Globals:** `true` in vitest config (no need to import `describe`/`it`/`expect`
  unless preferred for clarity — existing tests do import them explicitly, so
  follow that convention).

### Testing Conventions (follow existing patterns)
- Import `{ describe, it, expect, beforeEach }` from `vitest` explicitly.
- Use `localStorage.clear()` in `beforeEach` for tests touching storage.
- Co-locate test files next to source: `Component.test.tsx` beside `Component.tsx`.
- Use `vi.mock()` for module-level mocks.
- Use `vi.fn()` for individual function mocks.

### Per-Task Test Summary

| Task | File                           | Tests | What is Covered                                  |
|------|--------------------------------|-------|--------------------------------------------------|
| 1    | `dateFormatter.test.ts`        | ~8    | Today, yesterday, same-year, cross-year, edge cases |
| 2    | `DayCard.test.tsx`             | ~8    | Rendering, resume badge, link target, no-date    |
| 3    | `BottomNav.test.tsx`           | ~7    | Active states, links, semantic HTML              |
| 4    | `Dashboard.test.tsx`           | ~9    | Header, deload, day cards, stats, empty state    |
| 5    | `App.test.tsx`                 | ~4    | Nav visibility per route, route rendering        |

**Estimated total: ~36 new tests.**

### Mocking Strategy

**ProgressContext (Tasks 4, 5):**
Mock at module level:
```typescript
vi.mock('../contexts/ProgressContext', () => ({
  useProgress: vi.fn(),
  ProgressProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
```
Then in each test, configure the return value:
```typescript
(useProgress as ReturnType<typeof vi.fn>).mockReturnValue({
  progress: { currentCycle: 3, workoutLogs: [], ... },
  getLastWorkoutForDay: vi.fn().mockReturnValue(null),
  shouldSuggestDeload: vi.fn().mockReturnValue(false),
  ...
});
```

**workoutStateManager (Tasks 2 indirectly via 4, Task 4):**
```typescript
vi.mock('../services/workoutStateManager', () => ({
  hasActiveWorkout: vi.fn().mockReturnValue(false),
  getAllActiveWorkoutDays: vi.fn().mockReturnValue([]),
}));
```

**Router context (Tasks 2, 3, 4, 5):**
Use `<MemoryRouter>` from `react-router-dom`:
```typescript
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter initialEntries={['/']}>
    <ComponentUnderTest />
  </MemoryRouter>
);
```

---

## 6. Key Design Decisions

### 6.1 DayCard is a pure presentational component
DayCard receives all data as props. It does not call `useProgress()` or
`hasActiveWorkout()` directly. This keeps it testable without mocking context,
makes it reusable if the same card style is needed elsewhere, and follows the
container/presentational separation pattern.

### 6.2 Dashboard is the data orchestrator
Dashboard is the only component that reads from `ProgressContext` and
`workoutStateManager`. It computes derived values and passes them down as props.
This creates a single source of truth for what data the page needs, making it
straightforward to understand the data flow by reading one file.

### 6.3 BottomNav hides on workout routes via pathname check
Rather than adding a `hideNav` prop threaded through context or a layout route,
the `AppLayout` wrapper reads `useLocation().pathname` directly. This is the
simplest approach for a single conditional rule. If more route-based layout
logic is needed later, this can be refactored into a layout route
(`<Route element={<Layout />}>`) without changing any child components.

### 6.4 No new state management
The Dashboard is read-only — it displays data that already exists. No new
React state, no new context, no new localStorage keys. This keeps Phase 3
focused purely on presentation.

### 6.5 BottomNav is not lazy loaded
The BottomNav is ~50 lines of JSX with three Lucide icons. Lazy loading it
would add a flash of missing navigation on every page load. It is imported
statically in `App.tsx`.

### 6.6 dateFormatter uses injection for testability
Both functions accept an optional `now` parameter. This avoids the need to mock
`Date` globally in tests, keeps the utility pure, and prevents flaky
midnight-crossing test failures.

### 6.7 Settings route is a link target but not implemented
The BottomNav includes a Settings tab linking to `/settings`. This route does
not exist yet — clicking it will show the Suspense fallback or a 404. This is
intentional: the nav is designed for the final navigation set, and Settings
will be implemented in a future phase. No placeholder page is needed in Phase 3
unless desired.

---

## 7. Dependency Graph (Task Order)

```
Task 1 (dateFormatter)     Task 3 (BottomNav)
       │                          │
       ▼                          │
Task 2 (DayCard)                  │
       │                          │
       ▼                          │
Task 4 (Dashboard) ◄─────────────┘
       │
       ▼
Task 5 (App layout update)
```

- Tasks 1 and 3 can be done in parallel (no shared dependencies).
- Task 2 depends on Task 1 (uses `formatRelativeDate`).
- Task 4 depends on Tasks 1, 2, and 3 (uses all three).
- Task 5 depends on Task 3 (integrates BottomNav) and implicitly on Task 4
  (Dashboard should be done before final integration).

**Recommended implementation order:** 1 → 2 → 3 → 4 → 5
(or 1+3 in parallel → 2 → 4 → 5)
