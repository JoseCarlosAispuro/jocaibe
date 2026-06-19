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
  const { fine, reduce } = useViewport()

  // ── Pause CSS float animations when hero scrolls off-screen ──────────────
  // Applies to both desktop and mobile — compositor animations still cost GPU.
  useEffect(() => {
    const sec     = sectionRef.current
    const content = contentRef.current
    if (!sec || !content) return
    const head = content.querySelector<HTMLElement>('[data-parallax-head]')

    const io = new IntersectionObserver(([entry]) => {
      const state = entry.isIntersecting ? '' : 'paused'
      content.style.animationPlayState = state
      if (head) head.style.animationPlayState = state
    }, { threshold: 0 })

    io.observe(sec)
    return () => {
      io.disconnect()
      content.style.animationPlayState = ''
      if (head) head.style.animationPlayState = ''
    }
  }, [])

  // ── Desktop: mouse parallax ───────────────────────────────────────────────
  // Event-driven RAF — self-stopping once lerp converges, no off-screen waste.
  useEffect(() => {
    const sec = sectionRef.current
    const content = contentRef.current
    if (!sec || !content || reduce || !fine) return

    const head = content.querySelector<HTMLElement>('[data-parallax-head]')
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0

    const tick = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07

      content.style.setProperty('translate', `${cx.toFixed(2)}px ${cy.toFixed(2)}px`)
      if (head) {
        head.style.setProperty('translate', `${(cx * 0.5).toFixed(2)}px ${(cy * 0.5).toFixed(2)}px`)
      }

      if (Math.abs(cx - tx) < 0.15 && Math.abs(cy - ty) < 0.15) {
        raf = 0
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    const startTick = () => { if (raf === 0) raf = requestAnimationFrame(tick) }

    const onMove = (e: MouseEvent) => {
      tx = -(e.clientX / window.innerWidth  - 0.5) * 36
      ty = -(e.clientY / window.innerHeight - 0.5) * 24
      startTick()
    }

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
  }, [fine, reduce])

  // ── Mobile: auto-drift ───────────────────────────────────────────────────
  // Continuous RAF — paused via IntersectionObserver when hero is off-screen.
  useEffect(() => {
    const content = contentRef.current
    if (!content || reduce || fine) return

    const head = content.querySelector<HTMLElement>('[data-parallax-head]')
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0
    let visible = true

    const drift = (ts: number) => {
      if (!visible) { raf = 0; return }
      const t = ts / 1000
      tx = Math.sin(t * 0.32) * 10
      ty = Math.cos(t * 0.21) * 6
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      content.style.setProperty('translate', `${cx.toFixed(2)}px ${cy.toFixed(2)}px`)
      if (head) {
        head.style.setProperty('translate', `${(cx * 0.5).toFixed(2)}px ${(cy * 0.5).toFixed(2)}px`)
      }
      raf = requestAnimationFrame(drift)
    }

    const sec = sectionRef.current
    const io = sec ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && raf === 0) raf = requestAnimationFrame(drift)
    }, { threshold: 0 }) : null
    if (sec && io) io.observe(sec)

    raf = requestAnimationFrame(drift)

    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
      content.style.removeProperty('translate')
      if (head) head.style.removeProperty('translate')
    }
  }, [fine, reduce])

  return { sectionRef, contentRef }
}

export default useParallax
