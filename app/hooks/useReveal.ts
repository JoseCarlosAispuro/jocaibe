import { useRef, useEffect, useLayoutEffect } from 'react'
import { useLenis } from 'lenis/react'

interface RevealOpts {
  threshold?: number
}

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

  // Lenis fires on every smoothed scroll tick
  useLenis(trigger)

  useEffect(() => {
    // Seed initial check and handle resize
    trigger()
    window.addEventListener('resize', trigger, { passive: true })
    return () => window.removeEventListener('resize', trigger)
  }, [])

  return ref
}
