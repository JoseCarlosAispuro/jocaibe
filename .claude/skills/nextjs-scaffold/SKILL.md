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
| Fonts | `next/font/google` — expose as CSS variables |
| Package manager | pnpm |

---

## 2. Folder Structure

```
app/
├── components/          # Page sections — one folder per component
│   └── Hero/
│       ├── index.tsx    # Main export
│       └── [SubPart].tsx # Sub-components (e.g. KineticHeadline)
├── data/                # One JSON file per section + page.json for global config
│   ├── page.json
│   ├── nav.json
│   └── hero.json
├── helpers/             # Pure utilities and non-hook logic (shaders, formatters)
├── hooks/               # Custom React hooks (useReveal, etc.)
├── icons/               # SVG icon components (RightArrow.tsx, etc.)
├── partials/            # Global reusable UI: Navigation, SectionHeading, LenisProvider
├── types/               # Shared TypeScript interfaces/types
├── globals.css
├── layout.tsx
└── page.tsx
```

### Rules
- **`components/`** — page-level sections only. Each section is a folder (`Hero/`, `Timeline/`). The folder's `index.tsx` is the default export. Sub-components that are tightly coupled live in the same folder.
- **`partials/`** — cross-section UI (Navigation, SectionHeading, LenisProvider). Not page-specific.
- **`helpers/`** — pure functions, no hooks. Canvas shaders, animation utilities, formatters.
- **`hooks/`** — custom hooks only (`useReveal`, `useLenis` wrappers, etc.).
- **`icons/`** — one file per icon, named in PascalCase (`RightArrow.tsx`).
- **`data/`** — all copy/content as JSON. Components import their own JSON file. `page.json` holds global config (available status, labels).
- **`types/`** — shared interfaces exported and imported across components.

---

## 3. CSS Architecture (`globals.css`)

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

/* ── Base reset — inside @layer base so Tailwind utilities override it ── */
@layer base {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; background: var(--bg-0); color: var(--fg-0); }
  body { font-family: var(--font-body); font-size: var(--fs-body); line-height: 1.55; min-height: 100vh; overflow-x: hidden; }
  a { color: inherit; text-decoration: none; }
  button { border: none; background: none; color: inherit; cursor: pointer; font-family: inherit; }
  img, svg, canvas { display: block; max-width: 100%; }
}

/* ── Unlayered utilities — intentionally beat Tailwind's @layer utilities ── */
.container {
  margin-inline: auto;
  max-width: var(--max);
  padding-inline: var(--gutter);
}

.mono {
  font-family: var(--font-mono);
  font-size: var(--fs-mono-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
}

/* ── Global keyframes ── */
@keyframes revealIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal-from { opacity: 0; transform: translateY(24px); }
.reveal-on   { animation: revealIn 560ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }

@media (prefers-reduced-motion: reduce) {
  .reveal-on { animation: revealIn 1ms linear both; }
}

@keyframes heartbeat {
  0%   { transform: scale(1);    box-shadow: 0 0 6px 0 var(--beat-glow, var(--accent)); }
  11%  { transform: scale(1.45); box-shadow: 0 0 18px 5px var(--beat-glow, var(--accent)); }
  22%  { transform: scale(1);    box-shadow: 0 0 6px 0 var(--beat-glow, var(--accent)); }
  33%  { transform: scale(1.28); box-shadow: 0 0 14px 3px var(--beat-glow, var(--accent)); }
  45%  { transform: scale(1);    box-shadow: 0 0 6px 0 var(--beat-glow, var(--accent)); }
  100% { transform: scale(1);    box-shadow: 0 0 5px 0 var(--beat-glow, var(--accent)); }
}
```

### Critical CSS rules
- **`@layer base`** for the reset so `mt-12`, `mb-8`, and all margin/padding utilities override it.
- **`.container` and `.mono` are unlayered** so they beat Tailwind's generated `@layer utilities` container.
- All shared `@keyframes` live in `globals.css` — never in inline `<style>` tags inside components.
- Token reference in Tailwind: `text-(--accent)` for color, `[font-size:var(--fs-display)]` for size, `bg-(--bg-0)` for background.

### Tailwind v4 gotchas
| Pattern | Wrong | Right |
|---|---|---|
| Font size via token | `text-[var(--fs-display)]` → resolves as color | `[font-size:var(--fs-display)]` |
| Color via token | `text-[var(--accent)]` | `text-(--accent)` |
| Translate transition | `transition-[transform,...]` | `transition-[translate,...]` — v4 uses CSS `translate` property |
| Margin utilities | Only work if reset is in `@layer base` | See CSS architecture above |

---

## 4. `layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import 'lenis/dist/lenis.css'
import LenisProvider from '@/app/partials/LenisProvider'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Project Title',
  description: 'Description.',
}

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

## 5. Lenis Setup (`app/partials/LenisProvider.tsx`)

```tsx
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

## 6. `useReveal` Hook (`app/hooks/useReveal.ts`)

Scroll-triggered entrance reveal. Uses Lenis for scroll tracking and CSS classes for animation.

```ts
import { useRef, useEffect, useLayoutEffect } from 'react'
import { useLenis } from 'lenis/react'

interface RevealOpts { threshold?: number }

export function useReveal(delay = 0, opts: RevealOpts = {}) {
  const ref = useRef<HTMLElement>(null)
  const firedRef = useRef(false)
  const threshold = opts.threshold ?? 0.85

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('reveal-from')
  }, [])

  const trigger = () => {
    if (firedRef.current) return
    const el = ref.current
    if (!el) return
    const { top, height } = el.getBoundingClientRect()
    if (height === 0) return
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (top > vh * threshold) return
    firedRef.current = true
    el.classList.remove('reveal-from')
    if (delay) el.style.animationDelay = `${delay}ms`
    el.classList.add('reveal-on')
  }

  useLenis(trigger)

  useEffect(() => {
    trigger()
    window.addEventListener('resize', trigger, { passive: true })
    return () => window.removeEventListener('resize', trigger)
  }, [])

  return ref
}
```

---

## 7. Component Conventions

### Server vs Client
- Default to **Server Components** for anything that is static or data-fetching.
- Add `'use client'` only when the component needs hooks, event handlers, or browser APIs.
- Split: Server parent fetches/imports data → passes to Client child for interactivity.

### Component structure
```tsx
// app/components/MySection/index.tsx
'use client' // only if needed

import { useReveal } from '@/app/hooks/useReveal'
import SectionHeading from '@/app/partials/SectionHeading'
import type { MySectionData } from '@/app/types/my-section'

export default function MySection({ data }: { data: MySectionData }) {
  const ref = useReveal(0)
  return (
    <section id="my-section" className="py-(--s-section)">
      <div className="container">
        <SectionHeading eyebrow="Label" titleMain="Main title." titleMuted="Muted part." />
        <div ref={ref as React.RefObject<HTMLDivElement>}>
          {/* content */}
        </div>
      </div>
    </section>
  )
}
```

### Data pattern
- Every section has a JSON file in `app/data/[section].json`.
- The interface lives in `app/types/[section].ts` (or co-located in `index.tsx` and exported).
- `page.tsx` imports the JSON and passes it as props — components never fetch their own data.

```tsx
// app/page.tsx
import heroData from '@/app/data/hero.json'
import Hero from '@/app/components/Hero'
export default function Home() {
  return <main><Hero data={heroData} /></main>
}
```

### `SectionHeading` partial
```tsx
// app/partials/SectionHeading.tsx
'use client'
import { useReveal } from '@/app/hooks/useReveal'

interface SectionHeadingProps {
  eyebrow: string
  titleMain: string
  titleMuted?: string
  right?: React.ReactNode
}

export default function SectionHeading({ eyebrow, titleMain, titleMuted, right }: SectionHeadingProps) {
  const ref = useReveal(0)
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="grid grid-cols-12 gap-8 items-baseline">
      <div className="col-span-2 flex items-baseline gap-2">
        <span className="mono text-(--accent)">/</span>
        <span className="mono">{eyebrow}</span>
      </div>
      <h2 className="col-span-8 [font-family:var(--font-display)] [font-size:var(--fs-h1)] font-medium tracking-[-0.03em] leading-none text-(--fg-0)">
        {titleMain}
        {titleMuted && <><br /><span className="text-(--fg-2)">{titleMuted}</span></>}
      </h2>
      {right && <div className="col-span-2 text-right">{right}</div>}
    </div>
  )
}
```

---

## 8. Lenis Scroll Patterns

### In hooks — use `useLenis`
```ts
import { useLenis } from 'lenis/react'
useLenis(() => {
  // fires on every smoothed scroll tick
})
```

### Cleanup pattern for scroll-driven animations
```ts
const update = useCallback(() => {
  const el = ref.current
  if (!el) return
  const rect = el.getBoundingClientRect()
  // compute and apply directly — no secondary interpolation loop needed
  // Lenis already smooths the scroll
}, [])

useLenis(update)

useEffect(() => {
  update() // seed initial state
  window.addEventListener('resize', update, { passive: true })
  return () => window.removeEventListener('resize', update)
}, [update])
```

**Do not** run a secondary RAF interpolation loop on top of Lenis — it already smooths scroll. Set DOM state directly in the Lenis callback.

---

## 9. Inline Style Rules

Use inline `style` prop (not Tailwind arbitrary values) when:
- Values contain `color-mix()`, `calc()` with custom properties, or `clamp()` with multiple tokens
- Padding/size values that have been proven to generate wrong output from Tailwind arbitrary syntax
- CSS custom properties set dynamically (e.g. `--beat-glow`)

```tsx
// Prefer inline style for complex values
style={{ padding: '18px 28px' }}
style={{ background: 'color-mix(in oklab, var(--bg-1) 60%, transparent)' }}

// Prefer Tailwind for everything else
className="mt-12 text-(--accent) border border-(--border) rounded-full"
```

---

## 10. Scaffold Checklist

When creating a new project, complete these steps in order:

- [ ] `pnpm create next-app` with TypeScript, App Router, no src/, no default Tailwind config
- [ ] Install: `pnpm add lenis` and `pnpm add -D @tailwindcss/postcss tailwindcss`
- [ ] Remove `tailwind.config.*` — Tailwind v4 is CSS-first
- [ ] Set up `postcss.config.mjs` with `@tailwindcss/postcss`
- [ ] Write `globals.css` with tokens, `@layer base` reset, `.container`, `.mono`, keyframes
- [ ] Write `layout.tsx` with fonts, `lenis/dist/lenis.css` import, `LenisProvider`
- [ ] Create `app/partials/LenisProvider.tsx`
- [ ] Create `app/hooks/useReveal.ts`
- [ ] Create `app/partials/SectionHeading.tsx`
- [ ] Create `app/partials/Navigation.tsx`
- [ ] Create `app/data/page.json` and `app/data/nav.json`
- [ ] Build sections one at a time — data JSON → type → component
