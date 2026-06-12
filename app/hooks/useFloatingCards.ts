'use client'

import { useRef, useEffect, useCallback } from 'react'
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
 *  - IntersectionObserver pauses the RAF loop when the container leaves
 *    the viewport — zero main-thread cost when off-screen.
 *  - All getBoundingClientRect() calls are batched into a single read
 *    pass before any style writes, avoiding interleaved forced reflows.
 *  - In reduced-motion mode the loop self-terminates once all cards
 *    have settled; a scroll listener restarts it if new cards enter view.
 *  - In normal mode the bob sine keeps the loop running while visible,
 *    and pauses automatically when the section leaves the viewport.
 */
export const useFloatingCards = (
  containerRef: React.RefObject<HTMLElement | null>,
  configs: FloatItemConfig[],
) => {
  const cardsRef  = useRef<(HTMLElement | null)[]>([])
  const appearRef = useRef<number[]>([])
  // Keep configs accessible inside the RAF loop without adding them to
  // the effect's dependency array (the array identity changes every render).
  const configsRef = useRef(configs)
  configsRef.current = configs

  const { reduce, fine } = useViewport()

  // Reset appear state when the number of cards changes.
  useEffect(() => {
    appearRef.current = configs.map(() => 0)
  }, [configs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let raf  = 0
    let visible = false
    let mx = 0, my = 0, cmx = 0, cmy = 0

    const startLoop = () => {
      if (raf === 0 && visible) raf = requestAnimationFrame(loop)
    }

    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth  - 0.5
      my = e.clientY / window.innerHeight - 0.5
      startLoop() // no-op if already running
    }

    const onScroll = () => startLoop()

    if (fine && !reduce) window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    const loop = (now: number) => {
      const vh      = window.innerHeight
      const t       = now * 0.001
      const cards   = cardsRef.current
      const appears = appearRef.current
      const cfgs    = configsRef.current

      cmx += (mx - cmx) * 0.06
      cmy += (my - cmy) * 0.06

      // ── Pass 1: batch all layout reads ──────────────────────────────
      // Reading every rect before any write prevents interleaved
      // forced reflows (one per card → N reflows/frame without batching).
      const tops:    number[] = new Array(cards.length)
      const heights: number[] = new Array(cards.length)
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        if (el) {
          const r  = el.getBoundingClientRect()
          tops[i]    = r.top
          heights[i] = r.height
        } else {
          tops[i] = heights[i] = 0
        }
      }

      // ── Pass 2: compute + write ─────────────────────────────────────
      // canSettle is only true in reduced-motion mode — the bob sine
      // in normal mode means the loop never fully settles.
      let canSettle = reduce
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        if (!el || heights[i] === 0) continue
        const cfg = cfgs[i]
        if (!cfg) continue

        const top    = tops[i]
        const height = heights[i]
        const center = top + height / 2
        const rel    = (center - vh / 2) / vh
        const target = top < vh * 0.86 ? 1 : 0

        appears[i] = (appears[i] ?? 0) + (target - (appears[i] ?? 0)) * (reduce ? 1 : 0.08)
        const enter = Math.max(0, Math.min(1, appears[i]))

        let tx: number, ty: number, rot: number, scale: number
        if (reduce) {
          tx = 0; ty = (1 - enter) * 18; rot = 0; scale = 1
        } else {
          const parallax = rel * cfg.depth * 46
          const bob      = Math.sin(t * cfg.speed + cfg.phase) * 7
          ty    = parallax + bob + (1 - enter) * 48
          tx    = cmx * cfg.depth * 16 + (1 - enter) * (cfg.lane === 'end' ? 26 : -26)
          rot   = cfg.rot + rel * 1.4 + cmx * cfg.depth * 0.7
          scale = 0.93 + 0.07 * enter
        }

        el.style.opacity   = enter.toFixed(3)
        el.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`

        if (canSettle && Math.abs(enter - target) > 0.005) canSettle = false
      }

      raf = visible && !canSettle ? requestAnimationFrame(loop) : 0
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) startLoop()
      else { cancelAnimationFrame(raf); raf = 0 }
    }, { threshold: 0 })

    io.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
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
