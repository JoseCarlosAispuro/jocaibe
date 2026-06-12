import { useRef, useEffect } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import { useViewport } from './useViewport'

export const useMagnetic = (strength = 0.35) => {
  const ref = useRef<HTMLElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.8 })
  const y = useSpring(my, { stiffness: 120, damping: 18, mass: 0.8 })
  const { fine, hover, reduce } = useViewport()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || !hover || reduce) return

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      mx.set((e.clientX - (r.left + r.width / 2)) * strength)
      my.set((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const onLeave = () => {
      mx.set(0)
      my.set(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength, mx, my, fine, hover, reduce])

  return { ref, style: { x, y } }
}
