---
name: nextjs-scaffold
description: Scaffold a new Next.js portfolio/marketing project following jocaibe standards — folder structure, Tailwind v4 CSS architecture, Lenis smooth scroll, component conventions, data pattern, hooks, and partials.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Next.js Scaffold — jocaibe Standards

When invoked, scaffold a new Next.js App Router project (or bring an existing one up to standard) following the conventions below. Ask the user for the project name and any design tokens before starting if not provided.

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (latest) — App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 — no config file, CSS-first via `@import "tailwindcss"` |
| Smooth scroll | Lenis (`lenis` + `lenis/react`) |
| Animation | `motion/react` (Framer Motion) — for all JS-driven animations |
| Fonts | `next/font/google` — expose as CSS variables |
| Package manager | pnpm |

---

## 2. Folder Structure

```
app/
├── components/          # Page sections — one folder per component
│   └── Hero/
│       ├── index.tsx    # Main export
│       └── [SubPart].tsx
├── data/                # One JSON file per section + page.json for global config
│   ├── page.json
│   ├── nav.json
│   └── hero.json
├── helpers/             # Pure utilities and non-hook logic (shaders, formatters, event buses)
│   ├── constants.ts     # Shared animation constants (EASE, HEARTBEAT_*)
│   ├── assets.ts        # Asset URL helpers
│   └── contactModal.ts  # Cross-component event bus helpers
├── hooks/               # Custom React hooks
├── icons/               # SVG icon components — one file per icon, PascalCase
│   ├── Close.tsx        # Accept optional `size` prop
│   ├── ChevronLeft.tsx
│   ├── ChevronRight.tsx
│   └── RightArrow.tsx
├── partials/            # Global reusable UI: Navigation, SectionHeading, LenisProvider
├── types/               # Shared TypeScript interfaces/types
├── styles/
│   └── globals.css
├── layout.tsx
└── page.tsx
```

### Rules
- **`components/`** — page-level sections only. Each section is a folder (`Hero/`, `Timeline/`). Sub-components tightly coupled to a section live in the same folder.
- **`partials/`** — cross-section UI (Navigation, SectionHeading, LenisProvider, Button, CursorFX). Not page-specific.
- **`helpers/`** — pure functions and non-hook logic. Canvas shaders, animation utilities, formatters, cross-component event buses. No React hooks.
- **`hooks/`** — custom hooks only (`useReveal`, `useViewport`, `useMagnetic`, `useParallax`, etc.).
- **`icons/`** — one file per icon, named in PascalCase. Icons accept a `size` prop and always set `aria-hidden="true"`.
- **`helpers/constants.ts`** — shared animation constants. Never redefine `EASE`, `HEARTBEAT_SCALE`, or `HEARTBEAT_TIMES` inline in components.
- **`data/`** — all copy/content as JSON. Components never fetch their own data.
- **`types/`** — shared interfaces exported and imported across components.

---

## 3. CSS Architecture (`styles/globals.css`)

```css
@import "tailwindcss";

/* ── Design tokens ── */
:root {
  /* Backgrounds */
  --bg-0: #0e0f10;
  --bg-1: #16171a;
  --bg-2: #1d1e22;
  --bg-3: #25262b;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Foreground */
  --fg-0: #f4f4f5;
  --fg-1: #d4d4d8;
  --fg-2: #a1a1aa;
  --fg-3: #71717a;
  --fg-4: #52525b;

  /* Accents */
  --accent: #d9f04a;
  --accent-soft: #c5dc3a;
  --success: #5eead4;
  --danger: #f87171;
  --highlight: #fbbf24;

  /* Type */
  --font-body: var(--font-space-grotesk), system-ui, sans-serif;
  --font-display: var(--font-space-grotesk), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

  /* Type scale */
  --fs-display: clamp(56px, 10vw, 144px);
  --fs-h1: clamp(40px, 6vw, 80px);
  --fs-h2: clamp(28px, 4vw, 48px);
  --fs-h3: clamp(20px, 2vw, 26px);
  --fs-body: 16px;
  --fs-mono-ui: 12px;

  /* Spacing */
  --s-section: clamp(96px, 14vw, 192px);
  --max: 1440px;
  --gutter: clamp(20px, 4vw, 48px);

  /* Motion */
  --d-fast: 180ms;
  --d-med: 320ms;
  --d-slow: 560ms;
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
}

@layer base {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; background: var(--bg-0); color: var(--fg-0); overflow-x: clip; }
  body { font-family: var(--font-body); font-size: var(--fs-body); line-height: 1.55; min-height: 100vh; overflow-x: clip; }
  a { color: inherit; text-decoration: none; }
  button { border: none; background: none; color: inherit; cursor: pointer; font-family: inherit; }
  img, svg, canvas { display: block; max-width: 100%; }
}

.container { margin-inline: auto; max-width: var(--max); padding-inline: var(--gutter); }

.mono {
  font-family: var(--font-mono);
  font-size: var(--fs-mono-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* All shared @keyframes live here — never in component inline styles */
@keyframes revealIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Critical CSS rules
- Use `overflow-x: clip` (not `hidden`) on `html` and `body` — `clip` doesn't create a scroll container so `position: sticky` still works.
- `@layer base` for the reset so margin/padding utilities override it.
- `.container` and `.mono` are unlayered so they beat Tailwind's `@layer utilities`.
- All shared `@keyframes` live in `globals.css` — never in inline `<style>` tags or component files.
- Token reference in Tailwind: `text-(--accent)`, `bg-(--bg-0)`, `border-(--border)`.

### Tailwind v4 gotchas
| Pattern | Wrong | Right |
|---|---|---|
| Font size via token | `text-[var(--fs-display)]` | `[font-size:var(--fs-display)]` |
| Color via token | `text-[var(--accent)]` | `text-(--accent)` |
| Translate transition | `transition-[transform]` | `transition-[translate]` — v4 uses the CSS `translate` property |
| Overflow for sticky | `overflow-x: hidden` on `html` | `overflow-x: clip` |

---

## 4. `layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import '@/app/styles/globals.css'
import 'lenis/dist/lenis.css'
import LenisProvider from '@/app/partials/LenisProvider'

const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk', subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'] })

export const metadata: Metadata = { title: 'Project', description: '...' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
```

---

## 5. Lenis Setup

```tsx
// app/partials/LenisProvider.tsx
'use client'
import { ReactLenis } from 'lenis/react'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
```

---

## 6. Shared Animation Constants (`app/helpers/constants.ts`)

```ts
export const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number]
export const HEARTBEAT_SCALE = [1, 1.45, 1, 1.28, 1, 1]
export const HEARTBEAT_TIMES = [0, 0.11, 0.22, 0.33, 0.45, 1]
```

**Always import from here.** Never redefine these inline in components.

---

## 7. Lenis Scroll Patterns

### In components/hooks — use `useLenis`
```ts
import { useLenis } from 'lenis/react'

useLenis(({ scroll, velocity }) => {
  // fires on every smoothed scroll tick — Lenis already smooths the scroll,
  // so set DOM state directly here. Do NOT run a secondary RAF loop on top.
})
```

### Scroll-driven animation pattern
```ts
const update = useCallback(() => {
  const el = ref.current
  if (!el) return
  const rect = el.getBoundingClientRect()
  // compute and apply directly — no secondary interpolation needed
}, [])

useLenis(update)
useEffect(() => {
  update()
  window.addEventListener('resize', update, { passive: true })
  return () => window.removeEventListener('resize', update)
}, [update])
```

### Reading scroll position in a RAF loop (no native `window.scrollY`)
When a RAF loop or `measure()` function needs the current scroll position, source it from a Lenis ref — never from `window.scrollY`:

```ts
// At hook/component level
const scrollYRef = useRef(0)
useLenis(({ scroll }) => { scrollYRef.current = scroll })

// Inside useEffect RAF loop or measure()
const scrollY = scrollYRef.current  // ✓ — never window.scrollY
```

### Re-measuring positions on scroll (via a stable ref)
When an effect-scoped `measure()` function needs to run on every Lenis tick, expose it through a stable ref:

```ts
// At component level (outside useEffect)
const measureRef = useRef<() => void>(() => {})
useLenis(() => { measureRef.current() })

// Inside useEffect
const measure = () => { /* read DOM positions */ }
measureRef.current = measure  // keep ref current

return () => { measureRef.current = () => {} }  // clean up on unmount
```

### Restarting a RAF loop from Lenis scroll (instead of a native listener)
```ts
// At hook level (outside useEffect)
const startLoopRef = useRef<() => void>(() => {})
useLenis(() => { startLoopRef.current() })

// Inside useEffect
const startLoop = () => { if (raf === 0 && visible) raf = requestAnimationFrame(loop) }
startLoopRef.current = startLoop   // keep ref current

return () => { startLoopRef.current = () => {} }
```

### Scrolling to a section
```ts
const lenis = useLenis()
lenis?.scrollTo(element)   // NOT window.lenis — that doesn't exist
```

### Vanilla JS functions (non-React — e.g. canvas shaders)
Plain functions can't call `useLenis`. Use `getBoundingClientRect()` in event handlers (mousemove, resize) instead of caching offsets that need scroll-sync:

```ts
// ✓ — correct: read position on each pointer event (not in RAF)
const setPointer = (cx: number, cy: number) => {
  const rect = canvas.getBoundingClientRect()
  tx = cx - rect.left
  ty = cy - rect.top
}

// ✗ — wrong: caching canvas offset + a native scroll listener to re-sync it
let canvasLeft = 0
window.addEventListener('scroll', () => {
  canvasLeft = canvas.getBoundingClientRect().left
})
```

### Rules
- **Never** use `window.addEventListener('scroll', ...)` — use `useLenis` in React, or `getBoundingClientRect()` in event handlers in vanilla JS.
- **Never** read `window.scrollY` in a RAF loop or `measure()` — source from `scrollYRef` kept current by `useLenis`.
- **Never** read `window.scrollY` for initial state seed — use `lenis?.scroll ?? 0`.
- **Never** run a secondary RAF loop to smooth scroll values — Lenis already does it.

---

## 8. Motion / Framer Motion Patterns

All JS-driven animations use `motion/react`. CSS transitions are acceptable for simple hover/focus state changes that don't need JS control (e.g. `transition-colors`, `transition-opacity`). Use motion when:
- Animation is triggered by scroll, JS state, or gesture
- Animation needs spring physics or stagger
- Element needs `AnimatePresence` enter/exit

```tsx
import { motion, AnimatePresence } from 'motion/react'
import { EASE } from '@/app/helpers/constants'

// Enter/exit
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.32, ease: EASE }}
    />
  )}
</AnimatePresence>

// Spring
transition={{ type: 'spring', stiffness: 380, damping: 40, mass: 0.9 }}

// Hover (no React state needed)
<motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} />
```

### Rules
- Use `whileHover` / `whileTap` instead of `animate={{ scale: hover ? ... }}` + React state.
- Add `will-change-transform` on elements that animate `transform` in a RAF loop.
- Add `aria-hidden="true"` on decorative SVGs and spinner icons inside buttons.

---

## 9. Performance Rules

### RAF loops
- **Never** call `getBoundingClientRect()` inside a RAF loop. Cache positions in a `measure()` function called on mount, resize, and scroll (via ResizeObserver or Lenis).
- Use `IntersectionObserver` to pause RAF loops when the element is off-screen.
- Add `will-change-transform` on elements animated via JS `style.transform`.
- Add `{ passive: true }` to all scroll, wheel, and touchstart event listeners.

```ts
// Correct pattern — measure outside loop
const centres = useRef<{cx: number; cy: number}[]>([])

const measure = () => {
  elements.forEach((el, i) => {
    const r = el.getBoundingClientRect()
    centres.current[i] = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
  })
}

// RAF loop reads from cache only
const loop = () => {
  elements.forEach((el, i) => {
    const { cx, cy } = centres.current[i]  // no getBoundingClientRect here
    // ...compute and apply
  })
  raf = requestAnimationFrame(loop)
}
```

### Images
- Always add `loading="lazy"` to images that are not above the fold.
- Add `alt` text to all `<img>` elements. Decorative images use `alt=""`.

### Resize handling — always route through `useViewport`

**Never** add `window.addEventListener('resize', ...)` in components, hooks, or helpers. `useViewport` is the one singleton resize listener — route through it:

```tsx
// React component / hook — use vw/vh as useEffect deps
const { vw, vh } = useViewport()
useEffect(() => { measure() }, [vw, vh])

// Vanilla JS helper — expose handleResize, let the host component call it
// initMyHelper(el) → { cleanup: () => void, handleResize: () => void }
// Host:
const helperRef = useRef<ReturnType<typeof initMyHelper> | null>(null)
useEffect(() => {
  helperRef.current = initMyHelper(el)
  return () => helperRef.current?.cleanup()
}, [])
useEffect(() => { helperRef.current?.handleResize() }, [vw, vh])
```

**`ResizeObserver` is the exception** — use it when you need to watch a specific element's own dimensions (not the viewport). It fires on element layout changes that `window.resize` misses (font swaps, image loads, etc.).

```ts
const ro = new ResizeObserver(measure)
ro.observe(containerRef.current)
// cleanup: ro.disconnect()
```

### Event listener cleanup
- Always return cleanup functions from `useEffect` that remove event listeners and cancel RAF.

---

## 10. Semantic HTML

- Sections use `<section id="...">`, not `<div>`.
- Navigation uses `<nav>` with `aria-label`.
- Page footer uses `<footer>`.
- Lists use `<ul>` / `<ol>` + `<li>`, not divs.
- Heading hierarchy: one `<h1>` per page (hero), sections use `<h2>`, sub-items use `<h3>`.
- Clickable non-button, non-link elements: add `role="button"`, `tabIndex={0}`, and `onKeyDown` handler for Enter/Space.
- Carousels: wrap in `<section aria-label="...">` or `role="region" aria-label="..."`.

---

## 11. Color Contrast — WCAG 2.1 AA

Run `pnpm check-contrast` to audit all design-token color pairs. The checker (`scripts/check-contrast.mjs`) auto-runs on pre-commit when `globals.css` is staged.

### Requirements by text type

| Text type | Min ratio (AA) | Min ratio (AAA) |
|---|---|---|
| Normal text (<18px regular, <14px bold) | **4.5:1** | 7:1 |
| Large text (≥18px regular or ≥14px bold) | **3:1** | 4.5:1 |
| UI components (icons, borders, focus rings) | **3:1** | — |
| Decorative / disabled / placeholder | none | — |

### Token rules
- **Always** use `--bg-0` (dark) as text color on `--accent` or `--danger` backgrounds. Never `--fg-0` (light text on yellow/red fails).
- `--fg-0`, `--fg-1`, `--fg-2` pass AA/AAA on all background tokens — safe for body text everywhere.
- `--fg-3` passes the UI component 3:1 rule on `--bg-0`/`--bg-1` — safe for placeholders, labels, muted icons.
- `--fg-4` is decorative only (2.48:1) — never use for readable text.
- Background-on-background pairs (`--bg-1` on `--bg-0` etc.) do not meet the UI 3:1 rule — layer differentiation must rely on borders or shadows, not fill color alone.

### Adding new tokens
After editing `:root` in `globals.css`, run `pnpm check-contrast` and fix any required failures before committing.

---

## 12. ADA / Accessibility

### Every component must have:
- `aria-label` on all icon-only buttons (close, nav hamburger, carousel prev/next).
- `aria-hidden="true"` on all decorative SVGs and spinner icons.
- `aria-modal="true"` + `aria-label` on dialog overlays.
- `aria-current="true"` on active carousel/pagination dots.
- `aria-required="true"` + `aria-invalid={!!error}` on required form inputs.
- `role="alert"` on error messages that appear dynamically.
- `noValidate` on `<form>` elements when using custom validation (prevents browser tooltip).
- `htmlFor` on `<label>` matching the input `id`.

### Modals
```tsx
// Focus the first interactive element when modal opens
const firstInputRef = useRef<HTMLInputElement>(null)
useEffect(() => {
  const frame = requestAnimationFrame(() => firstInputRef.current?.focus())
  return () => cancelAnimationFrame(frame)
}, [])

// Restore focus on close — store trigger ref before opening
// Close on Escape
useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [onClose])
```

### Keyboard navigation
- All clickable `<article>`, `<div>` etc. with `onClick` must also have `tabIndex={0}` and `onKeyDown` for Enter/Space.
- Carousel dot buttons must have descriptive `aria-label` (e.g. `"Go to slide 3"`).

---

## 12. Icon Components

All icons live in `app/icons/` and follow this pattern:

```tsx
// app/icons/Close.tsx
const Close = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)
export default Close
```

Rules:
- Always `aria-hidden="true"` — the parent button carries the accessible label.
- Accept a `size` prop with a sensible default.
- Use `currentColor` for strokes/fills so the parent controls color via Tailwind.
- Never inline the same SVG in two places — extract to `app/icons/` and import.

---

## 13. Component Conventions

### Server vs Client
- Default to **Server Components**. Add `'use client'` only when using hooks, event handlers, or browser APIs.

### Component structure
```tsx
// app/components/MySection/index.tsx
'use client'

import { useCallback } from 'react'
import { useLenis } from 'lenis/react'
import { motion } from 'motion/react'
import SectionHeading from '@/app/partials/SectionHeading'
import { EASE } from '@/app/helpers/constants'
import type { MySectionData } from '@/app/types/my-section'

export default function MySection({ data }: { data: MySectionData }) {
  return (
    <section id="my-section" className="py-(--s-section)">
      <div className="container mx-auto px-(--gutter)">
        <SectionHeading lines={[{ text: data.title }]} />
      </div>
    </section>
  )
}
```

### Data pattern
- Every section has `app/data/[section].json`.
- `page.tsx` imports JSON and passes as props. Components never fetch their own data.
- Interfaces live in `app/types/[section].ts`.

### Tailwind class ordering
Order classes from shortest to longest within logical groups: layout → sizing → spacing → borders → colors → typography → effects → responsive/state modifiers.

```tsx
// Good
className="flex items-center gap-3 px-4 py-2 rounded-full border border-(--border) bg-(--bg-1) text-[14px] text-(--fg-0) transition-colors duration-[180ms] hover:border-(--accent)"

// Bad — random order
className="text-(--fg-0) hover:border-(--accent) border-(--border) flex rounded-full gap-3 bg-(--bg-1) items-center transition-colors border px-4 py-2 text-[14px] duration-[180ms]"
```

---

## 14. Scaffold Checklist

- [ ] `pnpm create next-app` with TypeScript, App Router, no src/, no default Tailwind config
- [ ] Install: `pnpm add lenis motion` and `pnpm add -D tailwindcss`
- [ ] Remove `tailwind.config.*` — Tailwind v4 is CSS-first
- [ ] Write `styles/globals.css` with tokens, `@layer base` reset, `.container`, `.mono`, keyframes
- [ ] Write `layout.tsx` with fonts, `lenis/dist/lenis.css`, `LenisProvider`
- [ ] Create `app/partials/LenisProvider.tsx`
- [ ] Create `app/helpers/constants.ts` with `EASE`, `HEARTBEAT_SCALE`, `HEARTBEAT_TIMES`
- [ ] Create `app/hooks/useViewport.ts` (reduce motion, pointer fine, hover, vh)
- [ ] Create `app/partials/SectionHeading.tsx`
- [ ] Create `app/partials/Navigation.tsx`
- [ ] Create `app/partials/CursorFX.tsx` (desktop custom cursor, reads `data-cursor` attribute)
- [ ] Create `app/partials/Button.tsx` (link / scroll / modal variants with magnetic effect)
- [ ] Create icon components in `app/icons/` (Close, ChevronLeft, ChevronRight, RightArrow)
- [ ] Create `app/data/page.json` and `app/data/nav.json`
- [ ] Build sections one at a time — data JSON → type → component
- [ ] Audit each section: semantic HTML, aria labels, keyboard navigation, RAF performance
