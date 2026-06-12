'use client'

import { useEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ViewportState {
  /** Current viewport width in px */
  vw: number
  /** Current viewport height in px */
  vh: number
  /** Device pixel ratio, capped at 2 */
  dpr: number
  /** true when `prefers-reduced-motion: reduce` */
  reduce: boolean
  /** true when the primary input is a mouse/trackpad (pointer: fine) */
  fine: boolean
  /** true when device supports hover */
  hover: boolean
  // Tailwind-aligned breakpoint flags (mobile-first)
  /** vw < 640  */
  isSm: boolean
  /** vw >= 640  */
  isSmUp: boolean
  /** vw >= 768  */
  isMdUp: boolean
  /** vw >= 1024 */
  isLgUp: boolean
  /** vw >= 1280 */
  isXlUp: boolean
  /** vw >= 1536 */
  is2XlUp: boolean
}

// ─── Singleton state ──────────────────────────────────────────────────────────

type Subscriber = (s: ViewportState) => void
const subscribers = new Set<Subscriber>()
let cached: ViewportState | null = null
let raf = 0

const snapshot = (): ViewportState => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return {
    vw,
    vh,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fine:   window.matchMedia('(pointer: fine)').matches,
    hover:  window.matchMedia('(hover: hover)').matches,
    isSm:    vw < 640,
    isSmUp:  vw >= 640,
    isMdUp:  vw >= 768,
    isLgUp:  vw >= 1024,
    isXlUp:  vw >= 1280,
    is2XlUp: vw >= 1536,
  }
}

const broadcast = () => {
  cached = snapshot()
  subscribers.forEach(fn => fn(cached!))
}

const onResize = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(broadcast)
}

// Set up module-level listeners once, lazily on first subscribe
let booted = false
const boot = () => {
  if (booted) return
  booted = true
  cached = snapshot()
  window.addEventListener('resize', onResize, { passive: true })
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', broadcast)
  window.matchMedia('(pointer: fine)').addEventListener('change', broadcast)
  window.matchMedia('(hover: hover)').addEventListener('change', broadcast)
}

// ─── SSR-safe initial state ───────────────────────────────────────────────────

const SSR_STATE: ViewportState = {
  vw: 0, vh: 0, dpr: 1,
  reduce: false, fine: true, hover: true,
  isSm: false, isSmUp: false,
  isMdUp: false, isLgUp: false, isXlUp: false, is2XlUp: false,
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useViewport = (): ViewportState => {
  const [state, setState] = useState<ViewportState>(() =>
    typeof window === 'undefined' ? SSR_STATE : snapshot()
  )

  useEffect(() => {
    boot()
    // Sync with any resize that happened between SSR render and hydration
    setState(cached ?? snapshot())
    subscribers.add(setState)
    return () => { subscribers.delete(setState) }
  }, [])

  return state
}
