---
name: check-standards
description: Audit one or more files (or all recently changed files) against the jocaibe codebase standards defined in the nextjs-scaffold skill. Reports errors and warnings per rule, then runs the shell script for a final pass.
allowed-tools: Read, Glob, Grep, Bash
---

# Standards Audit — jocaibe

When invoked, audit the specified files (or all staged/recently changed files if none given) against the standards defined in `.claude/skills/nextjs-scaffold/SKILL.md`.

## Step 1 — Resolve files to audit

If the user provided file paths as arguments, use those.
Otherwise run:
```bash
git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx?|css|scss|sass)$'
```
If nothing is staged, fall back to:
```bash
git diff --name-only HEAD | grep -E '\.(tsx?|css|scss|sass)$'
```

## Step 2 — Read each file and check every rule below

For each file, report **ERROR** (blocks commit) or **WARN** (should fix) against these rules:

### TypeScript / TSX rules

| # | Rule | Severity |
|---|---|---|
| T1 | `EASE`, `HEARTBEAT_SCALE`, `HEARTBEAT_TIMES` must be imported from `@/app/helpers/constants` — never redefined inline | ERROR |
| T2 | No `window.addEventListener('scroll', ...)` in React components/hooks — use `useLenis()`. For vanilla JS (non-React) functions, use `getBoundingClientRect()` in event handlers instead of a scroll-synced cache | ERROR |
| T3 | No `window.lenis` — use `const lenis = useLenis()` | ERROR |
| T4 | No `window.scrollY` in RAF loops or `measure()` fns — source from a `scrollYRef` kept current by `useLenis`. For initial mount seed, use `lenis?.scroll ?? 0` | WARN |
| T5 | `getBoundingClientRect()` must not be called inside a `requestAnimationFrame` loop — cache positions in a `measure()` fn called on mount/resize (and via `measureRef` + `useLenis` for scroll) | WARN |
| T6 | Any inline `<svg>` in a component or hook file — extract to `app/icons/` as a named component. Pattern: `const Icon = ({ size = N }: { size?: number }) => (<svg ...aria-hidden="true">...</svg>)`. Hardcoded colors in `stroke`/`fill` must become `currentColor`; callers set color via `text-(--token)` on a wrapper. Use a `<span className="animate-spin inline-flex">` wrapper for spinning icons rather than passing `className` into the icon. | ERROR |
| T7 | `overflow-x-hidden` Tailwind class — use `overflow-x-clip` | ERROR |
| T8 | Clickable `<div>`, `<article>`, `<span>` with `onClick` must also have `role="button"`, `tabIndex={0}`, and `onKeyDown` for Enter/Space | WARN |
| T9 | `role="dialog"` without `aria-label` | ERROR |
| T10 | Icon-only buttons (button containing `<svg>` with no visible text) must have `aria-label` | ERROR |
| T11 | All `<img>` must have `alt` attribute | ERROR |
| T12 | All `app/icons/` components must have `aria-hidden="true"` on the `<svg>` element — this is handled inside the icon component, not at the call site | WARN |
| T13 | `noValidate` required on `<form>` elements that use custom validation | WARN |
| T14 | `htmlFor` on `<label>` must match the `id` of its input | ERROR |
| T15 | Modals must call `firstInputRef.current?.focus()` inside a `requestAnimationFrame` on open | WARN |
| T16 | All scroll/touch/wheel event listeners must use `{ passive: true }` | WARN |
| T17 | `will-change-transform` required on elements animated via `style.transform` in a RAF loop | WARN |
| T18 | Animated elements using `AnimatePresence` must import `EASE` from constants, not hardcode the array | ERROR |
| T19 | Custom hooks or components that re-measure positions on scroll must use the `measureRef` + `useLenis` pattern — not `window.addEventListener('scroll', measure)` | ERROR |
| T20 | Custom hooks that drive a RAF loop from scroll must use the `startLoopRef` + `useLenis` pattern — not `window.addEventListener('scroll', startLoop)` | ERROR |
| T21 | No `window.addEventListener('resize', ...)` in components, hooks, or vanilla helpers — use `useViewport` (`vw`/`vh` deps in `useEffect`) for viewport-driven remeasure. Vanilla JS helpers must expose a `handleResize()` method and let the host component call it via `useViewport`. Exception: `ResizeObserver` is allowed for element-specific size tracking (independent of viewport size). | ERROR |

### CSS / SCSS / SASS rules

| # | Rule | Severity |
|---|---|---|
| C1 | `overflow-x: hidden` — use `overflow-x: clip` | ERROR |
| C2 | `@keyframes` outside `styles/globals.css` — move there | WARN |
| C3 | Hardcoded hex colors outside `globals.css` — use design tokens (`var(--accent)`, etc.) | WARN |
| C4 | `scroll-behavior: smooth` in CSS — Lenis handles this, remove to avoid conflict | WARN |
| C5 | CSS custom properties for spacing/color must match tokens defined in `:root` in `globals.css` | WARN |

## Step 3 — Run the shell script for confirmation

After your manual audit, run the shell checker for a machine-readable pass/fail:

```bash
bash .claude/scripts/check-standards.sh [files...]
```

## Step 4 — Report results

Output a summary table:

```
FILE                                   ERRORS  WARNINGS  STATUS
app/components/Hero/index.tsx          0       1         ⚠ WARN
app/styles/globals.css                 0       0         ✔ PASS
app/components/Skills/SkillsCloud.tsx  1       0         ✗ FAIL
```

Then list each violation with file, rule number, line reference, and the fix.

If all files pass: confirm and stop.
If any errors: list fixes and ask the user if they want them applied now.
