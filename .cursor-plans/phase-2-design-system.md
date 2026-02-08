# Phase 2: Sanctum Design System

## Overview
Establish Sanctum's visual identity — dark, elegant, minimal. The visual opposite of gabi-workouts.

**Branch:** `phase-2-design-system`

---

## Design Philosophy
- Dark, elegant, minimal — luxury, control, seriousness
- Black, charcoal, deep reds, metallic accents
- No neon, no emojis, no cartoon icons
- Precise borders (no shadows), smooth 200ms transitions
- Aesthetic references: nightclub lighting, Roman statue, cyber-monk, high-end watch

---

## Task Breakdown

### Task 1: Tailwind Configuration
**File:** `tailwind.config.js`

Replace the witchy lavender palette entirely with:
- `sanctum` scale (950–50): deep blacks through near-white
- `blood` scale (900–300): dark-to-bright reds
- `metal` object: gold, silver, bronze, steel

Replace fonts:
- `sans` → `['Inter', 'system-ui', 'sans-serif']`
- `display` → `['Inter', 'system-ui', 'sans-serif']` (Inter for both — clean, sharp, premium)
- `mono` → `['JetBrains Mono', 'monospace']` (keep from gabi-workouts)

Replace animations:
- Remove sparkle, float (too playful)
- Keep slide-up, fade-in (functional)
- Add subtle-pulse (slower, more restrained)

### Task 2: Google Fonts in index.html
**File:** `index.html`

- Replace Fraunces + Space Grotesk with **Inter** (400, 500, 600, 700)
- Keep JetBrains Mono (400, 500, 600)
- Update meta theme-color to `#0a0a0b`
- Update apple-mobile-web-app-status-bar-style to `black`
- Update description to "Sanctum — Personal Training Log"
- Add `<meta name="color-scheme" content="dark" />` for native dark mode hints
- Title already "Sanctum" — keep

### Task 3: Global CSS Overhaul
**File:** `src/index.css`

Rewrite from scratch with Sanctum identity:
- Body: bg sanctum-950, text sanctum-300, Inter font
- Scrollbar: dark track (sanctum-900), dark thumb (sanctum-700)
- Remove all witchy classes: glass-card, gradients, pattern-dots, shimmer, sparkle, category colors, day gradients
- Add Sanctum component tokens as CSS utility classes:
  - `.card` — bg-sanctum-900, border sanctum-700, rounded-lg
  - `.btn` — base transitions, rounded-lg
  - `.btn-primary` — bg-blood-500, hover blood-400, text sanctum-50
  - `.btn-secondary` — transparent, border sanctum-600, text sanctum-300
  - `.btn-ghost` — transparent, text sanctum-400, hover text sanctum-200
  - `.input` — bg-sanctum-800, border sanctum-700, focus border-blood-500
- Keep PWA safe-area styles
- Keep number input spin button removal
- Add focus-visible ring style (blood-500/30)

### Task 4: PWA Manifest Update
**File:** `vite.config.ts`

Update the VitePWA manifest:
- `theme_color` → `#0a0a0b`
- `background_color` → `#0a0a0b`
- Name/short_name already "Sanctum"

### Task 5: App.tsx PageLoader Update
**File:** `src/App.tsx`

Update the loading spinner to use Sanctum colors:
- Background: min-h-screen bg-sanctum-950
- Spinner: border-blood-500
- Text: text-sanctum-400

### Task 6: Design Preview Page
**New file:** `src/pages/DesignSystem.tsx`

A temporary route at `/design` that renders:
1. **Color Swatches** — all sanctum, blood, and metal colors as labeled rectangles
2. **Typography Scale** — h1–h6 + body + mono samples with font-name labels
3. **Button Variants** — primary, secondary, ghost (normal + hover instruction)
4. **Card Component** — example card with title, body text, and border
5. **Input States** — default, focused, with placeholder
6. **Set State Previews** — incomplete, in-progress, completed, PR states

Add lazy route in App.tsx: `<Route path="/design" element={<DesignSystem />} />`

### Task 7: Build Verification
- Run `tsc` — no TypeScript errors
- Run `vite build` — clean build
- Run `vitest` — all existing 66 tests pass (no regressions)

### Task 8: Git Commit
- Stage all changed files
- Commit with descriptive message

---

## Files Modified
1. `tailwind.config.js` — full palette + font replacement
2. `index.html` — fonts, meta tags, dark theme
3. `src/index.css` — complete rewrite for dark design system
4. `vite.config.ts` — PWA manifest colors
5. `src/App.tsx` — loader colors + design route

## Files Created
1. `src/pages/DesignSystem.tsx` — design system preview page

## Files NOT Touched
- All Phase 1 logic files (types, data, contexts, services, utils, tests)
- postcss.config.js (no changes needed)
- vitest.config.ts (no changes needed)
- package.json (Inter is loaded via Google Fonts CDN, no new npm deps)

---

## Acceptance Criteria
- [ ] Tailwind config has sanctum/blood/metal palettes, Inter + JetBrains Mono fonts
- [ ] index.html loads Inter + JetBrains Mono, dark meta tags, title "Sanctum"
- [ ] Global CSS establishes dark base with component token classes
- [ ] PWA manifest uses #0a0a0b theme/background
- [ ] /design route renders all design system elements visually
- [ ] `tsc && vite build` passes clean
- [ ] All 66 existing tests still pass
- [ ] Single commit on phase-2-design-system branch
