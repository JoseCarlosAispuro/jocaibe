import { useRef } from 'react'
import { useViewport } from './useViewport'

export const useTilt = (max = 7) => {
  const ref = useRef<HTMLDivElement>(null)
  const { fine, hover, reduce } = useViewport()

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el || !fine || !hover || reduce) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(1000px) rotateY(${(px - 0.5) * max}deg) rotateX(${-(py - 0.5) * max}deg)`
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }

  const onMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'
  }

  return { ref, onMouseMove, onMouseLeave }
}
