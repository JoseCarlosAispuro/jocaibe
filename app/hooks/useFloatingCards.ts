'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useLenis } from 'lenis/react'
import { useViewport } from './useViewport'

export interface FloatItemConfig {
  depth: number
  rot: number
  speed: number
  phase: number
  lane: 'start' | 'end'
}

/**
 * Drives scroll-parallax + mouse-tilt + entrance animation for a list
 * of card elements.
 *
 * Performance guarantees:
 *  - Zero getBoundingClientRect() calls inside the RAF loop.
 *    Positions are cached on mount and refreshed by ResizeObserver
 *    (layout change) and IntersectionObserver (container enters viewport).
 *  - IntersectionObserver pauses the RAF loop when the container leaves
 *    the viewport — zero main-thread cost when off-screen.
 *  - All hover effects are CSS-only (group-hover:) — no React re-renders
 *    from pointer events during animation.
 *  - In reduced-motion mode the loop self-terminates once all cards
 *    have settled; scroll/mouse events restart it if needed.
 */
export const useFloatingCards = (
  containerRef: React.RefObject<HTMLElement | null>,
  configs: FloatItemConfig[],
) => {
  const cardsRef   = useRef<(HTMLElement | null)[]>([])
  const appearRef  = useRef<number[]>([])
  // Cached absolute (document-relative) positions — updated by measure(),
  // never inside the RAF loop.
  const absTopRef  = useRef<number[]>([])
  const heightRef  = useRef<number[]>([])
  // Stable ref so the loop always sees current configs without being
  // recreated on every render.
  const configsRef = useRef(configs)
  configsRef.current = configs
  // Lenis scroll value — kept current by useLenis callback, read inside
  // measure() and the RAF loop without touching window.scrollY.
  const scrollYRef    = useRef(0)
  // Stable pointer to startLoop — updated after each useEffect so the
  // Lenis callback (defined at hook level) can trigger restarts.
  const startLoopRef  = useRef<() => void>(() => {})

  const { reduce, fine } = useViewport()

  // Drive scroll-dependent updates through Lenis (replaces native listener)
  useLenis(({ scroll }) => {
    scrollYRef.current = scroll
    startLoopRef.current()
  })

  useEffect(() => {
    appearRef.current = configs.map(() => 0)
  }, [configs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── measure ─────────────────────────────────────────────────────────
    // Batch-reads all card positions from the DOM. Called once on mount,
    // once when the container enters the viewport (handles lazy images /
    // font-swap shifts), and once per ResizeObserver callback.
    // NEVER called inside the RAF loop.
    const measure = () => {
      const scrollY = scrollYRef.current
      const cards   = cardsRef.current
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        if (!el) continue
        const r = el.getBoundingClientRect()
        absTopRef.current[i] = r.top + scrollY
        heightRef.current[i] = r.height
      }
    }

    let raf     = 0
    let visible = false
    let mx = 0, my = 0, cmx = 0, cmy = 0

    const startLoop = () => {
      if (raf === 0 && visible) raf = requestAnimationFrame(loop)
    }
    startLoopRef.current = startLoop

    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth  - 0.5
      my = e.clientY / window.innerHeight - 0.5
      startLoop()
    }

    if (fine && !reduce) window.addEventListener('mousemove', onMove, { passive: true })

    // ── RAF loop ─────────────────────────────────────────────────────────
    // All position data comes from cached refs — no layout reads here.
    const loop = (now: number) => {
      const scrollY = scrollYRef.current
      const vh      = window.innerHeight
      const t       = now * 0.001
      const cards   = cardsRef.current
      const appears = appearRef.current
      const cfgs    = configsRef.current
      const absTops = absTopRef.current
      const heights = heightRef.current

      cmx += (mx - cmx) * 0.06
      cmy += (my - cmy) * 0.06

      let canSettle = reduce
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        if (!el) continue
        const height = heights[i] ?? 0
        if (!height) continue
        const cfg = cfgs[i]
        if (!cfg) continue

        // Viewport-relative top — pure arithmetic, zero DOM reads
        const top    = (absTops[i] ?? 0) - scrollY
        const center = top + height / 2
        const rel    = (center - vh / 2) / vh
        const target = top < vh * 0.86 ? 1 : 0

        // Entrance lerp is always animated (unless reduce). The `!fine` branch
        // only skips the desktop bob/tilt — not the reveal itself.
        appears[i] = (appears[i] ?? 0) + (target - (appears[i] ?? 0)) * (reduce ? 1 : 0.08)
        const enter = Math.max(0, Math.min(1, appears[i]))

        let tx: number, ty: number, rot: number, scale: number
        if (reduce || !fine) {
          tx = 0; ty = (1 - enter) * 18; rot = 0; scale = 1
        } else {
          const parallax = rel * cfg.depth * 64
          const bob      = Math.sin(t * cfg.speed + cfg.phase) * 22
          ty    = parallax + bob + cmy * cfg.depth * 18 + (1 - enter) * 48
          tx    = cmx * cfg.depth * 26 + (1 - enter) * (cfg.lane === 'end' ? 26 : -26)
          rot   = cfg.rot + rel * 2.4 + cmx * cfg.depth * 1.4
          scale = 0.93 + 0.07 * enter
        }

        el.style.opacity   = enter.toFixed(3)
        el.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`

        if (canSettle && Math.abs(enter - target) > 0.005) canSettle = false
      }

      raf = visible && !canSettle ? requestAnimationFrame(loop) : 0
    }

    // ResizeObserver re-measures on any layout shift (window resize,
    // font swap, image load, etc.) without polling.
    const ro = new ResizeObserver(measure)
    ro.observe(container)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        measure()    // Re-measure on entry (lazy images may have loaded)
        startLoop()
      } else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }, { threshold: 0 })

    io.observe(container)
    measure() // Initial measurement (refs populated before useEffect runs)

    return () => {
      startLoopRef.current = () => {}
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      ro.disconnect()
      io.disconnect()
      cardsRef.current.forEach(el => {
        if (!el) return
        el.style.opacity   = ''
        el.style.transform = ''
      })
    }
  }, [reduce, fine, containerRef])

  const register = useCallback(
    (i: number) => (el: HTMLElement | null) => { cardsRef.current[i] = el },
    [],
  )

  return { register }
}
