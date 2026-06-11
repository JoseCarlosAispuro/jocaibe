'use client'

import { useRef, useEffect } from 'react'
import { useLenis } from 'lenis/react'

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight
    const p = h > 0 ? window.scrollY / h : 0
    if (ref.current) {
      ref.current.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`
    }
  }

  useLenis(update)

  useEffect(() => {
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={ref}
        style={{
          height: '100%',
          width: '100%',
          transformOrigin: '0 50%',
          transform: 'scaleX(0)',
          background: 'linear-gradient(90deg, var(--accent), var(--accent-soft))',
          boxShadow: '0 0 10px var(--accent)',
        }}
      />
    </div>
  )
}
