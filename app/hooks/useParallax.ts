'use client'

import { useEffect, useRef } from 'react'
import { useViewport } from './useViewport'

/**
 * Mouse-parallax for the hero section.
 *
 * The organic idle float is handled entirely by CSS animation (`hero-float` /
 * `hero-float-head` classes on the DOM nodes), so zero main-thread cost there.
 *
 * This hook only runs a RAF loop while the lerp is actively converging after a
 * mouse move — the loop stops itself once the displacement drops below the
 * threshold, and restarts on the next mousemove / mouseleave.
 *
 * The CSS `translate` property is used instead of `transform` so it stacks
 * on top of the CSS animation without conflicting with it.
 *
 * Returns:
 *   - `sectionRef`  — attach to the root <section> (receives mouse events)
 *   - `contentRef`  — attach to the content div (also needs `.hero-float` class)
 *   The element with `data-parallax-head` inside contentRef gets a shallower
 *   parallax offset (needs `.hero-float-head` class on that element).
 */
const useParallax = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { reduce } = useViewport()

  useEffect(() => {
    const sec = sectionRef.current
    const content = contentRef.current
    if (!sec || !content || reduce) return

    const head = content.querySelector<HTMLElement>('[data-parallax-head]')
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0

    const tick = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07

      // CSS `translate` stacks on top of the CSS float animation on `transform`
      content.style.setProperty('translate', `${cx.toFixed(2)}px ${cy.toFixed(2)}px`)
      if (head) {
        head.style.setProperty('translate', `${(cx * 0.5).toFixed(2)}px ${(cy * 0.5).toFixed(2)}px`)
      }

      // Stop as soon as the lerp has converged — no idle 60fps burn
      if (Math.abs(cx - tx) < 0.15 && Math.abs(cy - ty) < 0.15) {
        raf = 0
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    const startTick = () => {
      if (raf === 0) raf = requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      tx = -(e.clientX / window.innerWidth  - 0.5) * 36
      ty = -(e.clientY / window.innerHeight - 0.5) * 24
      startTick()
    }

    // On leave, lerp back to centre
    const onLeave = () => { tx = 0; ty = 0; startTick() }

    sec.addEventListener('mousemove', onMove)
    sec.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      sec.removeEventListener('mousemove', onMove)
      sec.removeEventListener('mouseleave', onLeave)
      content.style.removeProperty('translate')
      if (head) head.style.removeProperty('translate')
    }
  }, [reduce])

  return { sectionRef, contentRef }
}

export default useParallax
