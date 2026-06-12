'use client'

import { useRef, useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { useViewport } from '@/app/hooks/useViewport'

const ScrollProgress = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { vh } = useViewport()

  // Lenis provides accurate progress on every smoothed scroll tick
  useLenis(({ progress }) => {
    if (ref.current) {
      ref.current.style.transform = `scaleX(${progress})`
    }
  })

  // Re-sync when viewport height changes (resize may shift scrollHeight)
  useEffect(() => {
    const h = document.documentElement.scrollHeight - vh
    const p = h > 0 ? window.scrollY / h : 0
    if (ref.current) ref.current.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`
  }, [vh])

  return (
    <div className="fixed inset-x-0 top-0 h-0.5 z-[60] pointer-events-none">
      <div
        ref={ref}
        className="h-full w-full origin-[0_50%] bg-[linear-gradient(90deg,var(--accent),var(--accent-soft))] shadow-[0_0_10px_var(--accent)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}

export default ScrollProgress
