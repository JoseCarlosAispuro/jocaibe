'use client'

import { useRef, useEffect, useState } from 'react'
import { useLenis } from 'lenis/react'
import { motion, AnimatePresence } from 'motion/react'
import { useViewport } from '@/app/hooks/useViewport'
import { EASE } from '@/app/helpers/constants'

interface SkillGroup {
  cat: string
  items: string[]
}

interface SpringEl extends HTMLElement {
  __spring?: { x: number; y: number; g: number }
}

// Super-smooth enter curve: fast off the mark, long gentle ease to rest
const SMOOTH = [0.22, 1, 0.36, 1] as [number, number, number, number]
// Crisp exit: starts immediately, no lingering
const SMOOTH_OUT = [0.4, 0, 1, 1] as [number, number, number, number]

const chipClass =
  'rounded-full border border-(--border) bg-(--bg-1) px-[18px] py-3 text-[clamp(14px,1.2vw,17px)] font-(--font-display) font-normal tracking-[-0.01em] text-(--fg-1) whitespace-nowrap will-change-transform'

const SkillsCloud = ({ groups }: { groups: SkillGroup[] }) => {
  const [activeIdx, setActiveIdx] = useState(0)
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([])
  const { fine, hover, reduce, vw } = useViewport()
  const measureRef = useRef<() => void>(() => {})

  useLenis(() => { measureRef.current() })

  // Re-measure after tab switch — chips re-render at new positions
  useEffect(() => {
    const id = requestAnimationFrame(() => { measureRef.current() })
    return () => cancelAnimationFrame(id)
  }, [activeIdx])

  useEffect(() => {
    if (reduce || !fine || !hover) return

    let mx = -9999, my = -9999, raf = 0
    const radius = 175
    const centres: { cx: number; cy: number }[] = []

    const measure = () => {
      const list = chipRefs.current
      for (let i = 0; i < list.length; i++) {
        const el = list[i]
        if (!el) { centres[i] = { cx: -9999, cy: -9999 }; continue }
        const r = el.getBoundingClientRect()
        centres[i] = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
      }
    }

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }

    measureRef.current = measure

    const loop = () => {
      const list = chipRefs.current
      for (let i = 0; i < list.length; i++) {
        const el = list[i] as SpringEl | null
        if (!el) continue
        const { cx, cy } = centres[i] ?? { cx: -9999, cy: -9999 }
        const dx = cx - mx, dy = cy - my
        const dist = Math.hypot(dx, dy)
        let tx = 0, ty = 0, gl = 0
        if (dist < radius) {
          const f = 1 - dist / radius
          const push = f * 40
          tx = (dx / (dist || 1)) * push
          ty = (dy / (dist || 1)) * push
          gl = f
        }
        const s = el.__spring || (el.__spring = { x: 0, y: 0, g: 0 })
        s.x += (tx - s.x) * 0.14
        s.y += (ty - s.y) * 0.14
        s.g += (gl - s.g) * 0.14
        el.style.transform = `translate(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px)`
        if (s.g > 0.03) {
          el.style.borderColor = `color-mix(in oklab,var(--accent) ${Math.round(s.g * 95)}%,var(--border))`
          el.style.color = s.g > 0.4 ? 'var(--accent)' : 'var(--fg-0)'
          el.style.boxShadow = `0 0 ${(s.g * 24).toFixed(1)}px color-mix(in oklab,var(--accent) ${Math.round(s.g * 55)}%,transparent)`
        } else {
          el.style.borderColor = ''
          el.style.color = ''
          el.style.boxShadow = ''
        }
      }
      raf = requestAnimationFrame(loop)
    }

    measure()
    loop()
    window.addEventListener('mousemove', onMove)

    return () => {
      measureRef.current = () => {}
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [fine, hover, reduce])

  useEffect(() => { measureRef.current() }, [vw])

  const activeGroup = groups[activeIdx]

  return (
    <div className="mt-16">

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Skill categories"
        className="flex overflow-x-auto border-b border-(--border-strong) [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
      >
        {groups.map((g, i) => {
          const isActive = activeIdx === i
          return (
            <button
              key={g.cat}
              role="tab"
              aria-selected={isActive}
              aria-controls="skills-panel"
              onClick={() => setActiveIdx(i)}
              className="relative flex shrink-0 items-center px-6 py-4 outline-none"
            >
              <motion.span
                animate={{ color: isActive ? 'var(--fg-0)' : 'var(--fg-3)' }}
                transition={{ duration: 0.22, ease: EASE }}
                className="mono whitespace-nowrap"
              >
                {g.cat}
              </motion.span>

              {/* Sliding active underline */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-(--accent)"
                  transition={{ duration: 0.38, ease: SMOOTH }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab panel */}
      <div
        id="skills-panel"
        role="tabpanel"
        aria-label={activeGroup.cat}
        className="pt-10 min-h-[160px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.38,
              ease: SMOOTH,
              exit: { duration: 0.18, ease: SMOOTH_OUT },
            }}
          >
            <div
              className="flex flex-wrap gap-3"
              role="list"
              aria-label={`${activeGroup.cat} skills`}
            >
              {activeGroup.items.map((it, i) => (
                <motion.span
                  key={it}
                  role="listitem"
                  ref={(el) => { chipRefs.current[i] = el }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, delay: i * 0.055, ease: SMOOTH }}
                  className={chipClass}
                >
                  {it}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}

export default SkillsCloud
