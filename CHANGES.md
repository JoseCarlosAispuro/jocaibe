# jocaibe — Change Log & Standards Reference

This document tracks every significant change made to the project. Its purpose is to serve as the source of truth for generating a reusable skill that scaffolds or updates portfolio projects following these standards.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`, no config file) |
| Animation | Motion v12 (`motion/react`) |
| Smooth scroll | Lenis v1.3.23 (`lenis/react`) |
| Language | TypeScript (strict) |

---

## Design Token System

All tokens live in `app/globals.css` as CSS custom properties. Never hardcode color values — always reference tokens.

### Color tokens

```css
--bg-0          /* page background (darkest) */
--bg-1          /* card / section background */
--bg-2          /* input / subtle fill */
--bg-3          /* hover fill */
--fg-0          /* primary text */
--fg-1          /* secondary text */
--fg-2          /* muted text */
--fg-3          /* very muted / placeholder */
--fg-4          /* barely visible */
--accent        /* #d9f04a — yellow-green */
--accent-soft   /* lighter accent for gradients */
--highlight     /* award highlight color */
--success       /* green availability dot */
--border        /* default border */
--border-strong /* prominent border */
```

### Spacing tokens

```css
--s-section     /* section vertical padding (used in py-(--s-section)) */
--s-7           /* extra bottom padding for last section */
--gutter        /* horizontal container padding */
```

### Typography tokens

```css
--font-display  /* display typeface (large headings) */
--font-body     /* body typeface */
--font-mono     /* monospace (labels, tags, metadata) */
--fs-h1         /* heading font size */
```

---

## Tailwind v4 Conventions

### CSS-var syntax (required in v4)

```tsx
// Colors
className="bg-(--bg-1) text-(--fg-0) border-(--border)"

// Arbitrary values
className="text-[14px] tracking-[-0.03em] leading-none"

// Font family
className="[font-family:var(--font-display)]"

// Font size from token
className="[font-size:var(--fs-h1)]"
```

### Rule: inline style vs Tailwind class

| Use Tailwind | Keep inline |
|---|---|
| Static layout (`position`, `display`, `flex`, `grid`) | CSS functions (`clamp()`, `color-mix()`, `calc()`) |
| Static spacing (`margin`, `padding`, `gap`) | Gradients (`linear-gradient`, `radial-gradient`, `repeating-linear-gradient`) |
| Static colors via CSS vars | Complex `boxShadow` with CSS vars |
| `border`, `rounded`, `overflow` | Dynamic JS-computed values |
| `will-change`, `pointer-events`, `z-index` | Motion `initial`/`animate`/`whileHover` values |
| `whitespace-nowrap`, `object-cover`, `block` | Conditional inline (e.g. `background: project.bg`) |

---

## Component Architecture

### `'use client'` directive

Required on every component that uses hooks, event handlers, or Motion animations. Server components live only in `app/page.tsx` (data fetching) and layout files.

### Data flow

Data is loaded from JSON files in `app/data/` and passed top-down as props. No client-side data fetching.

```
app/page.tsx (Server)
  └── loads JSON → passes as props to
      └── Hero, Timeline, Skills, Projects, Contact (Client)
```

---

## Changes Made

### 1. SectionHeading — removed eyebrow, added line-by-line reveal

**File:** `app/partials/SectionHeading.tsx`

- Removed `eyebrow`, `titleMain`, `titleMuted` props
- New API: `lines: { text: string; muted?: boolean }[]`
- Each line reveals with a wipe-up animation using `overflow: hidden` mask
- **Bug fixed:** `whileInView` inside `overflow: hidden` breaks IntersectionObserver when the inner element starts translated outside the clip boundary. Solution: attach `useInView` to the outer (clip) span, drive the inner `motion.span` via `animate={inView ? ... : ...}` instead of `whileInView`.

```tsx
<span ref={outerRef} className="block overflow-hidden pb-[0.08em]">
  <motion.span
    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 92 }}
    className="block"
    style={{ color: muted ? 'var(--fg-2)' : undefined }}
  >
```

Callers updated: `Timeline`, `Skills`, `Projects`.

### 2. useReveal — simplified hook

**File:** `app/hooks/useReveal.ts`

Kept only `reveal(delay?: number)` — returns Motion props to spread onto `motion.*` elements. `delay` is in milliseconds.

```ts
export function reveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.56, ease: [0.2, 0.7, 0.2, 1], delay: delay / 1000 },
  }
}
```

### 3. ProjectsFloating — floating parallax card layout

**File:** `app/components/Projects/ProjectsFloating.tsx` (new)

Replaced a horizontal showcase scroller with a vertically-staggered floating layout.

Key decisions:
- **Lane vs visual style are decoupled:** lane (`start`/`end`) is derived from `i % 2` for guaranteed left-right alternation. Visual properties (size, ratio, bob speed) cycle through a separate `FLOAT_STYLES` array independently.
- **rAF loop** runs per-frame for parallax + bob + entrance + mouse drift — applied directly to DOM via `el.style.transform` for performance (no re-renders).
- **Lenis compatibility:** Lenis drives native scroll in v1.x, so `getBoundingClientRect()` is always accurate inside the rAF loop.
- All card ratios are landscape (`16/9`, `16/10`, `4/3`) to maintain the Z-pattern readability on wide screens.

```css
/* globals.css additions */
.floating-row { display: flex; }
.floating-row.lane-start  { justify-content: flex-start; }
.floating-row.lane-end    { justify-content: flex-end; }
.floating-card { opacity: 0; will-change: transform, opacity; }

@media (max-width: 760px) {
  .floating-stage { gap: 28px !important; }
  .floating-row   { justify-content: center !important; }
  .floating-card  { width: 100% !important; }
}
```

### 4. ProjectModal — bottom-sheet animation

**File:** `app/components/Projects/ProjectModal.tsx`

Changed from scale/opacity to a bottom-sheet slide:

```tsx
// Overlay fades
initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
transition={{ duration: 0.22, ease: 'linear' }}

// Panel slides up from below viewport
initial={{ y: '100vh' }} animate={{ y: 0 }} exit={{ y: '100vh' }}
transition={{ duration: 0.46, ease: [0.2, 0.7, 0.2, 1] }}
```

`data-lenis-prevent` on the overlay prevents Lenis from interfering with modal scroll.

### 5. Navigation — fixed Motion deprecation

**File:** `app/partials/Navigation.tsx`

```ts
// Before (deprecated)
const MotionLink = motion(Link)
// After
const MotionLink = motion.create(Link)
```

`motion()` is removed in Motion v12. Always use `motion.create()` for wrapping third-party components.

### 6. Tailwind audit — inline style cleanup

Applied across all components. Key conversions:

| Pattern | Before | After |
|---|---|---|
| Static layout | `style={{ display: 'flex', alignItems: 'center' }}` | `className="flex items-center"` |
| Static spacing | `style={{ marginTop: 64, paddingTop: 32 }}` | `className="mt-16 pt-8"` |
| Static color via var | `style={{ color: 'var(--fg-2)' }}` | `className="text-(--fg-2)"` |
| Static border | `style={{ border: '1px solid var(--border)' }}` | `className="border border-(--border)"` |
| Border radius | `style={{ borderRadius: 8 }}` | `className="rounded-lg"` |
| Overflow | `style={{ overflow: 'hidden' }}` | `className="overflow-hidden"` |
| will-change | `style={{ willChange: 'transform' }}` | `className="will-change-transform"` |
| whitespace | `style={{ whiteSpace: 'nowrap' }}` | `className="whitespace-nowrap"` |
| Absolute center | `top: '50%', left: '50%', marginTop: -8, marginLeft: -8` | `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` |

Files cleaned: `SectionHeading`, `Button`, `ScrollProgress`, `BrandSignoff`, `Projects/index`, `Skills/index`, `SkillsCloud`, `Contact/index`, `ProjectModal`, `FloatingAvailability`.

---

## Patterns to Reuse

### Motion animation easing

Always use `[0.2, 0.7, 0.2, 1]` as the easing curve. This is the project's signature ease.

```ts
transition={{ duration: 0.56, ease: [0.2, 0.7, 0.2, 1] }}
```

### Reveal pattern (simple)

```tsx
import { reveal } from '@/app/hooks/useReveal'
<motion.div {...reveal(200)}>…</motion.div>
```

### Reveal pattern (line wipe)

Use `HeadingLine` from `SectionHeading` as the reference. `useInView` on outer clip span → drives inner `motion.span` via `animate`.

### rAF animation loop

For parallax, bob, mouse-tracking — use a `useEffect` + `requestAnimationFrame` loop that writes directly to `el.style.transform`. Do not use state for per-frame values.

### Pointer spotlight

Used in `FloatingCard` and `SkillsCallout`. Track mouse position via `onMouseMove`, set CSS vars `--mx`/`--my`, then use `radial-gradient(... at var(--mx) var(--my) ...)` in background.

### Magnetic hover

See `app/hooks/useMagnetic.ts` — returns `{ ref, style }` to spread onto an element. Adds subtle pull-toward-cursor effect.

### Lenis integration

- Wrap app in `<ReactLenis root>` in `app/layout.tsx`
- Use `useLenis(callback)` for scroll-driven effects
- Add `data-lenis-prevent` to modal overlays to prevent scroll interference

### AnimatePresence for modals

```tsx
import { AnimatePresence } from 'motion/react'
<AnimatePresence>
  {modal && <ProjectModal project={modal} onClose={() => setModal(null)} />}
</AnimatePresence>
```

---

## File Map

```
app/
├── brand/
│   ├── BrandWordmark.tsx   — responsive wordmark
│   └── BrandSignoff.tsx    — full-width brand footer
├── components/
│   ├── Hero/
│   │   ├── index.tsx
│   │   └── KineticHeadline.tsx
│   ├── Timeline/
│   │   ├── index.tsx
│   │   ├── TimelineNode.tsx
│   │   └── TimelineCurrent.tsx
│   ├── Skills/
│   │   ├── index.tsx
│   │   └── SkillsCloud.tsx
│   ├── Projects/
│   │   ├── index.tsx
│   │   ├── ProjectsFloating.tsx
│   │   └── ProjectModal.tsx
│   └── Contact/
│       └── index.tsx
├── data/
│   ├── page.json
│   ├── projects.json
│   ├── skills.json
│   └── contact.json
├── hooks/
│   ├── useReveal.ts
│   ├── useMagnetic.ts
│   └── useTilt.ts
├── icons/
│   ├── Hamburger.tsx
│   ├── Close.tsx
│   └── RightArrow.tsx
├── partials/
│   ├── Button.tsx
│   ├── CursorFX.tsx
│   ├── FloatingAvailability.tsx
│   ├── Navigation.tsx
│   ├── ScrollProgress.tsx
│   └── SectionHeading.tsx
├── types/
│   └── project.ts
├── globals.css
├── layout.tsx
└── page.tsx
```
