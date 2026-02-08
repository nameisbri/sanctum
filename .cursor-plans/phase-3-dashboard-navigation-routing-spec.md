# Sanctum Phase 3: Dashboard, Navigation & Routing

## Product Specification Document

**Version**: 1.0
**Date**: 2026-02-08
**Status**: Ready for Implementation

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Success Metrics](#success-metrics)
3. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [UI/UX Specifications](#uiux-specifications)
7. [Edge Cases & Error Scenarios](#edge-cases--error-scenarios)
8. [Scope Boundaries](#scope-boundaries)
9. [Technical Implementation Notes](#technical-implementation-notes)
10. [Dependencies & Risks](#dependencies--risks)

---

## Product Vision

Phase 3 transforms Sanctum into a functional workout tracking PWA by implementing the home dashboard as a command center for the 6-day workout cycle. The dashboard provides immediate visibility into workout status, cycle progression, and deload timing—all presented with a dark, minimal, ritualistic aesthetic that prioritizes data over encouragement.

This phase establishes the navigation foundation and creates the primary user entry point, enabling users to resume in-progress workouts or begin new sessions with minimal friction.

**Core Philosophy**: Command center, not cheerful greeting. Facts, not fanfare.

---

## Success Metrics

### Primary KPIs

1. **Navigation Efficiency**: Time to workout start <3 seconds from app open
2. **Resume Rate**: 90%+ of in-progress workouts resumed (not restarted)
3. **Cycle Awareness**: Users can identify current cycle and session progress without hesitation
4. **Mobile Performance**: Dashboard loads in <500ms on mobile devices

### Secondary KPIs

5. **Deload Recognition**: Users notice deload suggestion within 2 seconds of viewing dashboard
6. **Navigation Clarity**: Zero user confusion between Dashboard/History/Settings icons
7. **Visual Consistency**: All design tokens applied correctly, 0 style regressions
8. **Touch Targets**: All interactive elements meet 44x44px minimum size for mobile

---

## User Stories & Acceptance Criteria

### Epic 1: Dashboard Home Screen

#### Story 1.1: Cycle Tracking Display

**As a user, I want to see my current cycle number immediately, so that I know where I am in my training progression.**

**Acceptance Criteria**:
- Current cycle number displays in header area as "Cycle {N}"
- Text uses `text-metal-silver text-sm` styling
- Positioned near app name, subtle and non-intrusive
- Cycle number updates when user completes a full 6-session cycle
- Cycle number persists across sessions (reads from ProgressContext)

---

#### Story 1.2: Workout Day Cards

**As a user, I want to see all 6 workout days in a clear list, so that I can quickly select which workout to perform.**

**Acceptance Criteria**:
- All 6 workout day cards display in single-column layout
- Each card shows:
  - Day number (e.g., "Day 1")
  - Workout name (e.g., "Chest/Back")
  - Exercise count (e.g., "8 exercises")
- Last workout date displays if workout has been completed before (format: "Last trained: Feb 6", `text-sanctum-500 text-xs`)
- Cards use `card-hover` class for hover feedback
- Cards are sorted Day 1-6 in order
- No previews, no eye icons, no exercise lists
- Mobile-optimized: full width on small screens, max-w-lg on larger

**Design Specifications**:
- Card spacing: `space-y-3` between cards
- Padding: `p-4` inside each card
- Typography:
  - Day number: `text-sanctum-200 text-sm font-medium`
  - Workout name: `text-sanctum-100 text-lg font-semibold`
  - Exercise count: `text-sanctum-400 text-sm`
  - Last workout date: `text-sanctum-500 text-xs`

---

#### Story 1.3: Active Workout Resume Detection

**As a user, I want to see if I have an in-progress workout, so that I can resume it instead of starting over.**

**Acceptance Criteria**:
- If `hasActiveWorkout(dayNumber)` returns true, card displays "Resume" indicator
- "Resume" indicator uses `text-blood-500 text-sm font-medium` styling
- Indicator positioned prominently on card (top-right or inline after workout name)
- Clicking card with active workout navigates to `/workout/{dayNumber}` (same as non-active)
- No special click behavior—detection is visual only
- Active workout state reads from `workoutStateManager.hasActiveWorkout()`

**Visual Treatment**:
- Show small blood-500 dot or "Resume" text label
- Optional: subtle blood-500/10 background tint on card
- Must be obvious but not alarming

---

#### Story 1.4: Deload Suggestion Display

**As a user, I want to be quietly informed when a deload is recommended, so that I can plan recovery without feeling pressured.**

**Acceptance Criteria**:
- Deload suggestion appears only when `shouldSuggestDeload()` returns true
- Displays in header area, below cycle indicator
- Text: "Consider a deload. The body rebuilds in rest."
- Styling: `text-sanctum-400 italic text-sm`
- NO alert boxes, NO warnings, NO icons
- Suggestion remains visible until user calls `recordDeload()`
- Deload logic: checks weeks since last deload vs deloadIntervalWeeks (default 5)

**Positioning**:
- Between cycle indicator and workout cards
- Subtle line, easy to miss if not looking
- Aligned left, single line

---

#### Story 1.5: Stats Strip

**As a user, I want to see aggregate session data at a glance, so that I understand my training volume without opening History.**

**Acceptance Criteria**:
- Stats strip displays below all 6 workout cards
- Shows three metrics:
  1. **Total sessions completed** (all time): counts all `workoutLogs` where `completed: true`
  2. **Current cycle progress**: "X of 6 sessions" (counts completed workouts with current cycle number)
  3. **Last workout date**: Date of most recent completed workout (format: "Feb 6")
- Styling: `text-sanctum-500 text-xs` for labels, `text-sanctum-300 text-sm font-medium` for values
- Layout: horizontal on mobile (wrap if needed), vertical labels with inline values
- Spacing: `mt-6 pt-6 border-t border-sanctum-700` to separate from cards

**Data Sources**:
- Total sessions: `progress.workoutLogs.filter(log => log.completed).length`
- Cycle progress: `progress.workoutLogs.filter(log => log.cycle === progress.currentCycle && log.completed).length`
- Last workout: `progress.workoutLogs.filter(log => log.completed).sort(by date desc)[0].date`

---

#### Story 1.6: Dashboard Header

**As a user, I want to see the app name and context at the top, so that I know I'm in the right place.**

**Acceptance Criteria**:
- App name "Sanctum" displays in display font (`font-display`)
- Styling: `text-2xl font-bold text-sanctum-50 tracking-tight`
- NOT huge, NOT centered—subtle, left-aligned
- Cycle indicator positioned below or inline after app name
- No greeting text, no emoji, no user name
- Deload suggestion (if applicable) displays below cycle

**Layout**:
```
Sanctum              Cycle 3
Consider a deload. The body rebuilds in rest.
```

Or:
```
Sanctum
Cycle 3
```

---

### Epic 2: Navigation System

#### Story 2.1: Bottom Navigation Bar

**As a user, I want a persistent bottom navigation, so that I can quickly move between major app sections.**

**Acceptance Criteria**:
- Bottom nav displays on Dashboard, History, and Settings pages
- Three icons only (no labels):
  1. **Home** (Dashboard): `Home` icon from Lucide
  2. **History**: `BarChart3` or `Clock` icon from Lucide
  3. **Settings**: `Settings` icon from Lucide (placeholder for future)
- Icons use thin stroke weight (`stroke-width: 1.5`)
- Active route icon: `text-blood-500`
- Inactive route icons: `text-sanctum-500`
- Hover: `text-sanctum-300`
- Icon size: `size-6` (24px)
- Navigation fixed to bottom: `fixed bottom-0 left-0 right-0`
- Background: `bg-sanctum-900 border-t border-sanctum-700`
- Padding: `py-3 px-4`
- Safe area insets: `pb-[env(safe-area-inset-bottom)]`

**Navigation Behavior**:
- Clicking Home navigates to `/`
- Clicking History navigates to `/history`
- Clicking Settings navigates to `/settings` (placeholder, no page yet)
- Navigation persists across all pages except `/workout/{dayNumber}` (active workout view)

**Layout**:
- Icons evenly distributed: `flex justify-around items-center`
- Each icon: clickable area 44x44px minimum
- Z-index: `z-50` to stay above page content

---

#### Story 2.2: Active Route Indication

**As a user, I want to see which page I'm currently on, so that I don't lose context while navigating.**

**Acceptance Criteria**:
- Current route icon highlighted in `text-blood-500`
- All other icons in `text-sanctum-500`
- Route detection uses `useLocation()` hook from react-router-dom
- Transition: `transition-colors duration-200 ease-out`
- No underlines, no labels, no badges

---

### Epic 3: Routing & Navigation Flow

#### Story 3.1: Dashboard as Default Route

**As a user, I want the dashboard to load when I open the app, so that I see my workout overview immediately.**

**Acceptance Criteria**:
- Route `/` renders Dashboard component
- Dashboard loads within 500ms on mobile
- Lazy loading already implemented (App.tsx)
- Suspense fallback shows loading spinner
- No redirects, no splash screens

---

#### Story 3.2: Workout Navigation

**As a user, I want to start a workout by tapping a day card, so that I can begin training immediately.**

**Acceptance Criteria**:
- Clicking any day card navigates to `/workout/{dayNumber}`
- Day number passed as URL param (1-6)
- If active workout exists, loads existing state
- If no active workout, initializes new workout
- Navigation happens instantly (no confirmation modals)
- Back button from workout returns to dashboard

**URL Structure**:
- Day 1: `/workout/1`
- Day 2: `/workout/2`
- ...
- Day 6: `/workout/6`

---

#### Story 3.3: History Navigation

**As a user, I want to view past workouts, so that I can track progress over time.**

**Acceptance Criteria**:
- Clicking History icon navigates to `/history`
- Route renders History component (placeholder for Phase 4)
- Navigation smooth, no flash of unstyled content
- Bottom nav persists on History page

---

### Epic 4: Mobile Optimization

#### Story 4.1: Responsive Layout

**As a user on mobile, I want the dashboard to fit my screen perfectly, so that I don't need to zoom or scroll horizontally.**

**Acceptance Criteria**:
- Container: `max-w-lg mx-auto px-4`
- All cards full width on mobile (below 640px)
- Bottom nav full width on all screen sizes
- Safe area insets respected on iOS (notch, home indicator)
- No horizontal scroll at any screen width
- Touch targets: minimum 44x44px for all interactive elements

**Breakpoint Behavior**:
- `< 640px`: Single column, full width
- `>= 640px`: Centered column, max 32rem width
- `>= 1024px`: Same as 640px (no desktop-specific layout)

---

#### Story 4.2: Touch Interactions

**As a user on mobile, I want smooth touch feedback, so that the app feels responsive.**

**Acceptance Criteria**:
- All cards use `card-hover` with `transition-colors duration-200 ease-out`
- Active press state: `active:scale-[0.97]` on cards
- No double-tap zoom on buttons/cards
- Tap highlight color: `transparent` (already in global CSS)
- Smooth scroll behavior enabled

---

---

## Functional Requirements

### FR-1: Dashboard Data Layer

**Priority**: P0 (Critical)

**Description**: Dashboard must aggregate and display data from ProgressContext and workoutStateManager.

**Implementation Requirements**:
- Read `progress.currentCycle` for cycle display
- Read `progress.workoutLogs` for stats calculations
- Call `getLastWorkoutForDay(dayNumber)` for each day card
- Call `shouldSuggestDeload()` for deload suggestion
- Call `hasActiveWorkout(dayNumber)` for each day card
- All data reads must be real-time (no stale cache)

**Data Flow**:
```
ProgressContext → Dashboard Component → Day Cards
                ↘ Stats Strip
                ↘ Deload Suggestion

workoutStateManager → Dashboard → Day Cards (Resume indicator)
```

---

### FR-2: Workout Day Card Rendering

**Priority**: P0 (Critical)

**Description**: Each workout day card must display accurate, up-to-date information.

**Card Data Structure**:
```typescript
interface DayCardData {
  dayNumber: number;          // 1-6
  dayName: string;            // "Chest/Back"
  exerciseCount: number;      // 8
  lastWorkoutDate: string | null;  // "2026-02-06" or null
  hasActiveWorkout: boolean;  // true/false
}
```

**Rendering Logic**:
```typescript
const workoutDays = sanctumProgram.workoutDays; // All 6 days
for each day:
  - Get day.dayNumber, day.name, day.exercises.length
  - lastWorkout = getLastWorkoutForDay(day.dayNumber)
  - lastWorkoutDate = lastWorkout?.date ?? null
  - hasActiveWorkout = hasActiveWorkout(day.dayNumber)
  - Render card with above data
```

---

### FR-3: Cycle Progress Calculation

**Priority**: P1 (High)

**Description**: Dashboard must accurately calculate and display cycle progress.

**Calculation Logic**:
```typescript
const currentCycle = progress.currentCycle;
const completedInCycle = progress.workoutLogs.filter(
  log => log.cycle === currentCycle && log.completed
).length;
const cycleProgress = `${completedInCycle} of 6 sessions`;
```

**Edge Cases**:
- If user completes all 6 sessions in a cycle, cycle number auto-increments (handled by ProgressContext)
- If user completes Day 3 twice in same cycle, both count toward progress (allowed behavior)
- Progress resets when `currentCycle` increments

---

### FR-4: Deload Suggestion Logic

**Priority**: P1 (High)

**Description**: Deload suggestion must appear at the correct time based on user's training history.

**Logic**:
```typescript
const shouldShow = shouldSuggestDeload(); // from ProgressContext

// Internal logic (already implemented in ProgressContext):
const referenceDate = lastDeloadDate || cycleStartDate;
const weeksSince = (now - referenceDate) / (7 days);
return weeksSince >= deloadIntervalWeeks; // default 5
```

**Display Rules**:
- Show suggestion if `shouldSuggestDeload()` returns true
- Hide suggestion if false
- Suggestion persists until user manually records deload (not implemented in Phase 3)
- No auto-dismiss

---

### FR-5: Navigation Routing

**Priority**: P0 (Critical)

**Description**: Navigation must work seamlessly across all implemented routes.

**Route Definitions**:
| Route | Component | Access | Bottom Nav |
|-------|-----------|--------|------------|
| `/` | Dashboard | Public | Yes |
| `/workout/:dayNumber` | Workout | Public | No |
| `/history` | History | Public | Yes |
| `/settings` | (Placeholder) | Public | Yes |
| `/design` | DesignSystem | Dev only | No |

**Navigation Implementation**:
- Use `react-router-dom` (already installed)
- Bottom nav uses `<Link>` components for client-side routing
- Active route detection via `useLocation()`
- Day cards use `<Link to={`/workout/${dayNumber}`}>`

---

### FR-6: Bottom Navigation Visibility

**Priority**: P1 (High)

**Description**: Bottom nav must show/hide appropriately based on current route.

**Visibility Rules**:
- **Show** on: `/`, `/history`, `/settings`
- **Hide** on: `/workout/:dayNumber`, `/design`
- Implementation: Conditional rendering based on `useLocation().pathname`

**Code Pattern**:
```typescript
const location = useLocation();
const showBottomNav = ['/', '/history', '/settings'].includes(location.pathname);
```

---

### FR-7: Stats Aggregation

**Priority**: P1 (High)

**Description**: Stats strip must display accurate all-time and cycle-specific metrics.

**Metrics**:

1. **Total Sessions Completed**:
   ```typescript
   const totalSessions = progress.workoutLogs.filter(log => log.completed).length;
   ```

2. **Cycle Progress**:
   ```typescript
   const cycleProgress = progress.workoutLogs.filter(
     log => log.cycle === progress.currentCycle && log.completed
   ).length;
   ```

3. **Last Workout Date**:
   ```typescript
   const sortedLogs = progress.workoutLogs
     .filter(log => log.completed)
     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
   const lastDate = sortedLogs[0]?.date ?? null;
   ```

**Display Format**:
- Total: "42 total sessions"
- Cycle: "4 of 6 sessions"
- Last: "Last trained: Feb 6"

---

---

## Non-Functional Requirements

### NFR-1: Performance

**Requirement**: Dashboard must load and render within 500ms on mobile devices (4G connection, mid-range phone).

**Measurements**:
- Time to Interactive (TTI): <500ms
- Largest Contentful Paint (LCP): <400ms
- First Input Delay (FID): <100ms

**Optimization Strategies**:
- Lazy load components (already implemented)
- Minimize re-renders with React.memo where appropriate
- Use efficient array operations (no nested loops)
- Avoid unnecessary state updates

---

### NFR-2: Accessibility

**Requirement**: Dashboard must be usable with screen readers and keyboard navigation.

**WCAG 2.1 AA Compliance**:
- All interactive elements have focus states
- Color contrast ratios: minimum 4.5:1 for text
- Touch targets: minimum 44x44px
- Semantic HTML: use `<nav>`, `<main>`, `<section>`
- ARIA labels where necessary

**Keyboard Navigation**:
- Tab order: Header → Day Cards (1-6) → Stats → Bottom Nav
- Enter/Space activates cards and nav links
- Focus visible: `ring-2 ring-blood-500/30`

**Screen Reader Support**:
- App name announced as heading level 1
- Day cards announced with day number and name
- Active workout status announced ("Resume available")
- Deload suggestion announced as informational message

---

### NFR-3: Mobile Responsiveness

**Requirement**: Dashboard must be fully functional on devices from 320px to 1920px width.

**Breakpoint Testing**:
- 320px: iPhone SE (smallest modern phone)
- 375px: iPhone 12/13/14 Mini
- 390px: iPhone 12/13/14 Pro
- 430px: iPhone 12/13/14 Pro Max
- 768px: iPad portrait
- 1024px: iPad landscape, small laptops

**Visual Regression Tests**:
- All cards visible without horizontal scroll
- Bottom nav icons evenly distributed
- Text truncation where necessary
- No overlapping elements

---

### NFR-4: Browser Compatibility

**Requirement**: Dashboard must work on modern mobile browsers.

**Supported Browsers**:
- iOS Safari: 15+
- Chrome Mobile: 90+
- Firefox Mobile: 90+
- Samsung Internet: 14+

**Polyfills Required**:
- None (modern browsers only)

**Testing**:
- Test on real devices (iOS and Android)
- Use BrowserStack or similar for cross-browser testing

---

### NFR-5: PWA Compatibility

**Requirement**: Dashboard must work correctly when installed as PWA (standalone mode).

**Standalone Mode Requirements**:
- Safe area insets respected (notch, home indicator)
- No browser chrome visible
- Bottom nav fixed to device bottom
- Tap targets accessible in standalone

**Testing**:
- Install PWA on iOS and Android
- Verify bottom nav positioning
- Test touch targets near screen edges

---

### NFR-6: Data Privacy

**Requirement**: All data must remain local; no external API calls.

**Privacy Guarantees**:
- All workout data stored in localStorage only
- No analytics, no tracking, no telemetry
- No external fonts loaded (use system fonts as fallback)
- No CDN dependencies for critical resources

---

---

## UI/UX Specifications

### Layout Structure

```
┌─────────────────────────────────────┐
│ Sanctum               Cycle 3       │ ← Header
│ Consider a deload. The body...      │ ← Deload (conditional)
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐    │
│ │ Day 1 • Chest/Back [Resume] │    │ ← Day Card 1
│ │ 8 exercises                 │    │
│ │ Last trained: Feb 6         │    │
│ └─────────────────────────────┘    │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ Day 2 • Shoulders/Arms      │    │ ← Day Card 2
│ │ 9 exercises                 │    │
│ └─────────────────────────────┘    │
│                                     │
│ ... (Days 3-6)                      │
│                                     │
├─────────────────────────────────────┤
│ 42 total sessions                   │ ← Stats Strip
│ 4 of 6 sessions                     │
│ Last trained: Feb 6                 │
├─────────────────────────────────────┤
│  🏠        📊        ⚙️             │ ← Bottom Nav
└─────────────────────────────────────┘
```

---

### Design Token Usage

#### Colors

**Background**:
- Page: `bg-sanctum-950`
- Cards: `bg-sanctum-900`
- Bottom Nav: `bg-sanctum-900`

**Borders**:
- Default: `border-sanctum-700`
- Hover: `border-sanctum-600`
- Bottom Nav Top: `border-sanctum-700`

**Text**:
- App name: `text-sanctum-50`
- Cycle indicator: `text-metal-silver`
- Deload suggestion: `text-sanctum-400 italic`
- Day number: `text-sanctum-200`
- Workout name: `text-sanctum-100`
- Exercise count: `text-sanctum-400`
- Last workout date: `text-sanctum-500`
- Stats labels: `text-sanctum-500`
- Stats values: `text-sanctum-300`

**Accents**:
- Resume indicator: `text-blood-500`
- Active nav icon: `text-blood-500`
- Inactive nav icon: `text-sanctum-500`
- Hover nav icon: `text-sanctum-300`

---

#### Typography

**Font Families**:
- App name: `font-display` (Inter)
- All other text: `font-sans` (Inter)
- Numbers (optional): `font-mono` (JetBrains Mono)

**Font Sizes**:
- App name: `text-2xl` (24px)
- Workout name: `text-lg` (18px)
- Day number: `text-sm` (14px)
- Exercise count: `text-sm` (14px)
- Last workout date: `text-xs` (12px)
- Cycle indicator: `text-sm` (14px)
- Deload suggestion: `text-sm` (14px)
- Stats: `text-xs` (12px) labels, `text-sm` (14px) values

**Font Weights**:
- App name: `font-bold` (700)
- Workout name: `font-semibold` (600)
- Day number: `font-medium` (500)
- Resume indicator: `font-medium` (500)
- All other text: `font-normal` (400)

---

#### Spacing

**Container**:
- Horizontal padding: `px-4` (16px)
- Vertical padding: `py-6` (24px)
- Max width: `max-w-lg` (32rem / 512px)
- Margin: `mx-auto` (centered)

**Cards**:
- Gap between cards: `space-y-3` (12px)
- Card padding: `p-4` (16px)
- Border radius: `rounded-lg` (8px)

**Header**:
- Margin bottom: `mb-6` (24px)

**Stats Strip**:
- Margin top: `mt-6` (24px)
- Padding top: `pt-6` (24px)
- Border top: `border-t border-sanctum-700`

**Bottom Nav**:
- Padding vertical: `py-3` (12px)
- Padding horizontal: `px-4` (16px)
- Safe area bottom: `pb-[env(safe-area-inset-bottom)]`

---

#### Animations

**Transitions**:
- All hover states: `transition-colors duration-200 ease-out`
- Card press: `active:scale-[0.97]`
- Nav icon color: `transition-colors duration-200 ease-out`

**Page Load**:
- Fade in cards: `animate-fade-in` (optional)
- Slide up cards: `animate-slide-up` (optional, if desired)

---

### Component Hierarchy

```
Dashboard (Page Component)
├── Header
│   ├── App Name
│   ├── Cycle Indicator
│   └── Deload Suggestion (conditional)
├── Day Cards List
│   ├── DayCard (Day 1)
│   ├── DayCard (Day 2)
│   ├── DayCard (Day 3)
│   ├── DayCard (Day 4)
│   ├── DayCard (Day 5)
│   └── DayCard (Day 6)
├── Stats Strip
│   ├── Total Sessions
│   ├── Cycle Progress
│   └── Last Workout Date
└── Bottom Navigation (separate component)
    ├── Home Icon
    ├── History Icon
    └── Settings Icon
```

**Reusable Components**:
- `DayCard`: Accepts `dayNumber`, renders all day-specific data
- `BottomNav`: Standalone component, used across multiple pages
- `StatsStrip`: Displays aggregated stats (optional separate component)

---

### Interaction States

#### Day Card States

**Default (No Interaction)**:
- Border: `border-sanctum-700`
- Background: `bg-sanctum-900`

**Hover**:
- Border: `border-sanctum-600`
- Cursor: `cursor-pointer`
- Transition: `200ms ease-out`

**Active (Pressed)**:
- Scale: `active:scale-[0.97]`
- Border: `border-sanctum-600`

**With Resume Indicator**:
- Resume text: `text-blood-500`
- Optional: subtle `bg-blood-500/5` tint on card

**Focus (Keyboard)**:
- Ring: `ring-2 ring-blood-500/30 ring-offset-2 ring-offset-sanctum-950`

---

#### Bottom Nav Icon States

**Inactive (Default)**:
- Color: `text-sanctum-500`

**Hover**:
- Color: `text-sanctum-300`

**Active (Current Route)**:
- Color: `text-blood-500`

**Focus (Keyboard)**:
- Ring: `ring-2 ring-blood-500/30`

---

---

## Edge Cases & Error Scenarios

### EC-1: No Workout History

**Scenario**: User has never completed a workout.

**Expected Behavior**:
- All day cards show no "Last trained" date
- Stats strip shows:
  - "0 total sessions"
  - "0 of 6 sessions"
  - "Never trained" or "No workouts yet"
- No deload suggestion (since no training history)

**UI Treatment**:
- Use `text-sanctum-500` for "No workouts yet" messaging
- Keep layout consistent (no empty states with illustrations)

---

### EC-2: All 6 Days Have Active Workouts

**Scenario**: User started all 6 workouts but didn't finish any.

**Expected Behavior**:
- All 6 day cards show "Resume" indicator
- Clicking any card loads that specific active workout
- No warnings about multiple active workouts
- Stats strip shows stats from completed workouts only (active workouts don't count)

**UI Treatment**:
- All cards have blood-500 accent
- No visual clutter (keep "Resume" text small and right-aligned)

---

### EC-3: Deload Overdue (8+ Weeks)

**Scenario**: User hasn't deloaded in 8 weeks (3 weeks past interval).

**Expected Behavior**:
- Same deload suggestion text (no escalation)
- No color change, no urgency
- User can ignore indefinitely

**Reasoning**: Sanctum is non-judgmental. User knows their body best.

---

### EC-4: User Completes Multiple Days in Same Cycle

**Scenario**: User completes Day 1, Day 2, Day 3, then Day 1 again (still in Cycle 3).

**Expected Behavior**:
- Cycle progress shows 4 of 6 (counts all 4 completed workouts)
- Day 1 "Last trained" shows most recent completion date
- Cycle doesn't auto-increment until 6 unique days completed (NOT implemented yet—Phase 3 just displays data)

**Note**: Cycle increment logic is **out of scope** for Phase 3. Dashboard only displays current cycle from ProgressContext.

---

### EC-5: LocalStorage Quota Exceeded

**Scenario**: User has 100+ workouts, localStorage approaching 5MB limit.

**Expected Behavior**:
- Dashboard still loads (reads existing data)
- New workouts may fail to save (handled by workoutStateManager)
- No error messages on Dashboard (errors logged to console)

**Mitigation** (Future Phase):
- Implement data export/import
- Prune old workouts

---

### EC-6: Invalid Day Number in URL

**Scenario**: User navigates to `/workout/0` or `/workout/7` or `/workout/abc`.

**Expected Behavior**:
- Workout page handles validation (not Dashboard)
- Dashboard always links to valid day numbers (1-6)
- No edge case handling needed in Dashboard

---

### EC-7: Cycle Number is 0 or Negative

**Scenario**: ProgressContext data corrupted, `currentCycle: 0` or `-1`.

**Expected Behavior**:
- Dashboard displays "Cycle 0" or "Cycle -1" (no error)
- System continues functioning
- User can reset progress from Settings (future phase)

**Reasoning**: Display what's there. Don't assume data integrity.

---

### EC-8: Long Workout Names

**Scenario**: User modifies program data, workout name is 50+ characters.

**Expected Behavior**:
- Text truncates with ellipsis: `truncate` or `line-clamp-1`
- Card height adjusts if needed (no fixed heights)
- No horizontal scroll

**CSS**:
```css
.workout-name {
  @apply truncate max-w-full;
}
```

---

### EC-9: Offline Use (PWA Installed)

**Scenario**: User opens app with no internet connection.

**Expected Behavior**:
- Dashboard loads instantly (all data local)
- All features work (no API dependencies)
- No error messages

**Requirement**: Already met (no external dependencies).

---

### EC-10: Date Formatting Across Timezones

**Scenario**: User travels across timezones, date calculations may shift.

**Expected Behavior**:
- All dates use ISO 8601 format (`YYYY-MM-DD`)
- Dates stored in local timezone
- Display format: "Feb 6" (short month + day, no year)
- No timezone conversions needed (local-only app)

**Implementation**:
```typescript
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
```

---

---

## Scope Boundaries

### In Scope (Phase 3)

✅ Dashboard home screen with all 6 workout day cards
✅ Current cycle number display
✅ Deload suggestion display (reading from ProgressContext)
✅ Active workout resume detection (visual indicator only)
✅ Last workout date display for each day
✅ Stats strip with total sessions, cycle progress, last workout date
✅ Bottom navigation with 3 icons (Home, History, Settings)
✅ Active route indication in bottom nav
✅ Navigation to `/workout/:dayNumber` when day card clicked
✅ Mobile-optimized layout with safe area insets
✅ All dark theme styling applied
✅ Smooth transitions and hover states
✅ Keyboard navigation and accessibility

---

### Out of Scope (Future Phases)

❌ **Deload Recording**: Ability to mark deload as completed (Phase 5: Settings)
❌ **Cycle Auto-Increment**: Logic to advance cycle after 6 unique days (Phase 4: Workout Completion)
❌ **History Page Implementation**: Full workout history view (Phase 4)
❌ **Settings Page Implementation**: User preferences, data export (Phase 5)
❌ **Workout Editing from Dashboard**: Preview exercises, edit program (Never planned)
❌ **Progress Charts/Graphs**: Visual analytics (Phase 6: Analytics)
❌ **Workout Reminders/Notifications**: Push notifications (Phase 7: PWA Enhancements)
❌ **User Accounts/Sync**: Cloud backup, multi-device sync (Not planned)
❌ **Social Features**: Sharing workouts, leaderboards (Never planned)
❌ **Exercise Videos/Tutorials**: In-app exercise guides (Not planned)
❌ **Workout Templates**: Multiple programs, custom cycles (Future consideration)
❌ **Calendar View**: Monthly workout calendar (Future consideration)
❌ **Search/Filter**: Search workouts, filter by date/cycle (Phase 4)

---

### Explicitly NOT Included

🚫 Week selector (Sanctum uses cycles, not weeks)
🚫 Intensity guides (Sanctum is simple: 6-12 reps, 2 sets)
🚫 Block information (Sanctum has no blocks)
🚫 Emoji in UI (unless explicitly requested)
🚫 Greeting messages ("Hey, [Name]!")
🚫 Encouragement messages ("Great job!")
🚫 Exercise previews on day cards (click to see exercises)
🚫 Volume charts on Dashboard (History page will have charts)
🚫 Streak tracking ("5 days in a row!")
🚫 Goal setting (Sanctum is process-focused, not outcome-focused)

---

---

## Technical Implementation Notes

### File Structure

```
src/
├── pages/
│   ├── Dashboard.tsx          ← Main implementation
│   ├── History.tsx             (Existing placeholder)
│   └── Workout.tsx             (Existing placeholder)
├── components/
│   ├── DayCard.tsx             ← New: Reusable day card component
│   ├── BottomNav.tsx           ← New: Bottom navigation
│   └── StatsStrip.tsx          ← New (optional): Stats display
├── contexts/
│   └── ProgressContext.tsx     (Existing, no changes needed)
├── services/
│   └── workoutStateManager.ts  (Existing, no changes needed)
├── data/
│   └── program.ts              (Existing, no changes needed)
└── utils/
    └── dateFormatter.ts        ← New: Date formatting utility
```

---

### Component Interfaces

#### DayCard Component

```typescript
interface DayCardProps {
  dayNumber: number;
  dayName: string;
  exerciseCount: number;
  lastWorkoutDate: string | null;
  hasActiveWorkout: boolean;
}

export function DayCard(props: DayCardProps) {
  // Render card with Link to /workout/{dayNumber}
}
```

---

#### BottomNav Component

```typescript
interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string; // For accessibility (aria-label)
}

export function BottomNav() {
  const location = useLocation();
  const navItems: NavItem[] = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/history', icon: BarChart3, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Render nav with active state detection
}
```

---

#### StatsStrip Component (Optional)

```typescript
interface StatsStripProps {
  totalSessions: number;
  cycleProgress: number; // 0-6
  lastWorkoutDate: string | null;
}

export function StatsStrip(props: StatsStripProps) {
  // Render 3 stats in horizontal layout
}
```

---

### Data Hooks

#### useDashboardData Hook

```typescript
interface DashboardData {
  currentCycle: number;
  shouldDeload: boolean;
  dayCards: DayCardData[];
  stats: {
    totalSessions: number;
    cycleProgress: number;
    lastWorkoutDate: string | null;
  };
}

export function useDashboardData(): DashboardData {
  const { progress, getLastWorkoutForDay, shouldSuggestDeload } = useProgress();

  // Aggregate all data needed for Dashboard
  // Return structured object
}
```

**Benefits**:
- Separates data logic from presentation
- Easier to test
- Easier to optimize (memoization)

---

### Date Formatting Utility

```typescript
// src/utils/dateFormatter.ts

export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatShortDate(isoDate);
}
```

---

### Accessibility Implementation

#### Semantic HTML

```tsx
<main className="min-h-screen bg-sanctum-950">
  <header className="px-4 py-6">
    <h1 className="text-2xl font-display font-bold text-sanctum-50">
      Sanctum
    </h1>
    {/* Cycle, deload */}
  </header>

  <section aria-label="Workout days" className="px-4">
    {dayCards.map(day => (
      <DayCard key={day.dayNumber} {...day} />
    ))}
  </section>

  <section aria-label="Workout statistics" className="px-4 mt-6">
    <StatsStrip {...stats} />
  </section>
</main>

<nav aria-label="Main navigation" className="fixed bottom-0">
  <BottomNav />
</nav>
```

---

#### ARIA Labels

```tsx
// DayCard
<Link
  to={`/workout/${dayNumber}`}
  aria-label={`Start ${dayName} workout, ${exerciseCount} exercises`}
  className="card-hover block"
>
  {/* Card content */}
</Link>

// BottomNav
<Link
  to={item.path}
  aria-label={item.label}
  aria-current={isActive ? 'page' : undefined}
>
  <item.icon size={24} />
</Link>
```

---

### Performance Optimization

#### Memoization

```typescript
// Dashboard.tsx
const dayCards = useMemo(() => {
  return sanctumProgram.workoutDays.map(day => ({
    dayNumber: day.dayNumber,
    dayName: day.name,
    exerciseCount: day.exercises.length,
    lastWorkoutDate: getLastWorkoutForDay(day.dayNumber)?.date ?? null,
    hasActiveWorkout: hasActiveWorkout(day.dayNumber),
  }));
}, [progress.workoutLogs]); // Only recalculate when workoutLogs change
```

#### React.memo for Components

```typescript
export const DayCard = React.memo(function DayCard(props: DayCardProps) {
  // Component implementation
});
```

---

### Testing Strategy

#### Unit Tests

```typescript
// Dashboard.test.tsx
describe('Dashboard', () => {
  it('displays correct cycle number', () => {});
  it('shows deload suggestion when overdue', () => {});
  it('renders all 6 day cards', () => {});
  it('displays resume indicator for active workouts', () => {});
  it('calculates stats correctly', () => {});
  it('handles no workout history gracefully', () => {});
});

// BottomNav.test.tsx
describe('BottomNav', () => {
  it('highlights active route', () => {});
  it('navigates to correct routes', () => {});
  it('is hidden on workout page', () => {});
});

// DayCard.test.tsx
describe('DayCard', () => {
  it('displays all day information', () => {});
  it('links to correct workout route', () => {});
  it('shows resume indicator when active', () => {});
  it('formats last workout date correctly', () => {});
});
```

#### Integration Tests

```typescript
describe('Dashboard Integration', () => {
  it('loads data from ProgressContext', () => {});
  it('navigates to workout when card clicked', () => {});
  it('updates stats when workout completed', () => {});
});
```

---

---

## Dependencies & Risks

### Technical Dependencies

| Dependency | Status | Risk | Mitigation |
|------------|--------|------|------------|
| ProgressContext | ✅ Complete | Low | Already tested, stable |
| workoutStateManager | ✅ Complete | Low | Already tested, stable |
| program.ts data | ✅ Complete | Low | Static data, no changes needed |
| React Router DOM | ✅ Installed | Low | Standard library, well-documented |
| Lucide React | ✅ Installed | Low | Lightweight, no breaking changes expected |

---

### Architectural Risks

#### Risk 1: Performance with Many Workouts

**Description**: Dashboard recalculates stats on every render if user has 100+ workouts.

**Impact**: Medium
**Likelihood**: Low (early users won't have 100+ workouts)

**Mitigation**:
- Use `useMemo` for all calculations
- Test with mock data (200+ workouts)
- Monitor performance in dev tools

---

#### Risk 2: localStorage Quota

**Description**: User data exceeds 5MB localStorage limit.

**Impact**: High (data loss)
**Likelihood**: Low (requires ~500 workouts)

**Mitigation**:
- Out of scope for Phase 3
- Future phase: data export, cloud backup
- Alert user when approaching limit (Phase 5)

---

#### Risk 3: Date Timezone Issues

**Description**: Date calculations inconsistent across timezones.

**Impact**: Low (UI dates only, no critical logic)
**Likelihood**: Medium (if user travels)

**Mitigation**:
- Always use ISO 8601 strings
- Always parse dates with `new Date(isoString)`
- Test with different timezone settings

---

#### Risk 4: Cycle Auto-Increment Not Implemented

**Description**: User completes all 6 days, expects cycle to increment, but it doesn't.

**Impact**: Medium (confusion)
**Likelihood**: High (core workflow)

**Mitigation**:
- Clearly out of scope for Phase 3
- Phase 4 will implement cycle increment on workout completion
- User can manually increment cycle from Settings (Phase 5)

---

### Design Risks

#### Risk 1: Bottom Nav Overlaps Content

**Description**: Bottom nav covers last workout card on short screens.

**Impact**: High (usability issue)
**Likelihood**: Medium (small phones)

**Mitigation**:
- Add bottom padding to page content: `pb-24` (96px)
- Test on iPhone SE (375x667px)
- Use safe area insets: `pb-[calc(6rem+env(safe-area-inset-bottom))]`

---

#### Risk 2: Deload Suggestion Too Subtle

**Description**: Users don't notice deload suggestion, overtrain.

**Impact**: Medium (health concern)
**Likelihood**: Medium (by design it's subtle)

**Mitigation**:
- User testing: observe if users notice suggestion
- If needed: increase contrast to `text-sanctum-300`
- Do NOT make it alarming (against design philosophy)

---

#### Risk 3: No Visual Hierarchy for Active Workouts

**Description**: User has 3 active workouts, hard to tell which to resume.

**Impact**: Low (user can resume any)
**Likelihood**: Medium (common workflow)

**Mitigation**:
- Keep "Resume" indicator consistent across all cards
- No prioritization needed (user decides)
- Future: sort cards by last modified (out of scope)

---

### User Experience Risks

#### Risk 1: Unclear Cycle Concept

**Description**: Users don't understand what "Cycle 3" means.

**Impact**: Medium (confusion)
**Likelihood**: Medium (new users)

**Mitigation**:
- Add tooltip or info icon (future phase)
- Settings page explains cycle system (Phase 5)
- Onboarding flow (Phase 6)

---

#### Risk 2: Stats Too Dry

**Description**: "0 total sessions" feels discouraging for new users.

**Impact**: Low (doesn't block usage)
**Likelihood**: High (all new users)

**Mitigation**:
- Acceptable per design philosophy (factual, not motivational)
- No changes needed

---

---

## Appendix

### A. Color Contrast Ratios

All text/background combinations meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).

| Text | Background | Ratio | Pass |
|------|------------|-------|------|
| sanctum-50 | sanctum-950 | 18.2:1 | ✅ AAA |
| sanctum-100 | sanctum-950 | 15.8:1 | ✅ AAA |
| sanctum-200 | sanctum-950 | 12.1:1 | ✅ AAA |
| sanctum-300 | sanctum-950 | 8.7:1 | ✅ AAA |
| sanctum-400 | sanctum-950 | 5.2:1 | ✅ AA |
| sanctum-500 | sanctum-950 | 3.8:1 | ⚠️ Large text only |
| blood-500 | sanctum-950 | 4.9:1 | ✅ AA |
| metal-silver | sanctum-950 | 6.1:1 | ✅ AAA |

**Note**: sanctum-500 should only be used for large text (18px+) or non-critical labels.

---

### B. Sample Data Structures

#### Sample Progress Data

```typescript
const sampleProgress: UserProgress = {
  currentCycle: 3,
  cycleStartDate: '2026-01-15',
  deloadIntervalWeeks: 5,
  lastDeloadDate: '2025-12-20',
  workoutLogs: [
    {
      id: 'wl-001',
      date: '2026-02-06',
      cycle: 3,
      dayNumber: 1,
      dayName: 'Chest/Back',
      exercises: [...],
      completed: true,
      totalVolume: 12400,
      duration: 3600,
    },
    // ... more logs
  ],
};
```

---

### C. Navigation Flow Diagram

```
App Open
   ↓
Dashboard (/)
   ├─→ Click Day 1 Card → /workout/1 → Active Workout Page
   ├─→ Click Day 2 Card → /workout/2 → Active Workout Page
   ├─→ ... (Days 3-6)
   ├─→ Click History Icon → /history → History Page
   └─→ Click Settings Icon → /settings → Settings Page (placeholder)

From any page:
   └─→ Click Home Icon → / → Dashboard
```

---

### D. Mobile Screenshots (Wireframes)

```
┌─────────────────────┐
│ Sanctum    Cycle 3  │
│ Consider a deload...│
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ Day 1 • Chest...│ │
│ │ 8 exercises     │ │
│ │ Last: Feb 6     │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Day 2 • Should..│ │
│ │ 9 exercises     │ │
│ │ Resume ⚫       │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Day 3 • Legs(A) │ │
│ │ 10 exercises    │ │
│ └─────────────────┘ │
│ ...                 │
├─────────────────────┤
│ 42 total sessions   │
│ 4 of 6 sessions     │
│ Last: Feb 6         │
├─────────────────────┤
│   🏠    📊    ⚙️   │
└─────────────────────┘
```

---

### E. Glossary

- **Cycle**: A complete 6-session training period. After completing 6 workouts, the cycle increments.
- **Day**: One of 6 predefined workout templates (e.g., "Day 1: Chest/Back").
- **Session**: A completed workout (one day's exercises finished).
- **Deload**: A planned reduction in training volume/intensity for recovery (every 4-6 weeks recommended).
- **Active Workout**: An in-progress workout saved to localStorage but not marked complete.
- **Resume**: Continuing an active workout from where the user left off.
- **Stats Strip**: The summary section showing total sessions, cycle progress, and last workout date.
- **Bottom Nav**: The fixed navigation bar at the bottom of the screen.
- **Command Center**: Design philosophy—dashboard as a utilitarian control panel, not a motivational dashboard.

---

---

## Document Metadata

**Created By**: Product Specification Generator
**Last Updated**: 2026-02-08
**Version**: 1.0
**Review Status**: Ready for Implementation
**Stakeholders**: Solo developer (Gabriela)
**Related Documents**:
- `.claude-plans/phase-1-spec.md` (if exists)
- `.claude-plans/phase-2-spec.md` (if exists)

---

## Sign-Off

This specification is ready for implementation. Development can begin immediately on:

1. Dashboard page component
2. DayCard reusable component
3. BottomNav component
4. Date formatting utilities
5. useDashboardData hook (optional)
6. Unit and integration tests

**Next Steps**:
1. Review and approve this specification
2. Create GitHub issue for Phase 3 implementation
3. Break down into subtasks (if desired)
4. Begin implementation (estimate: 4-6 hours)

---

**End of Specification**
