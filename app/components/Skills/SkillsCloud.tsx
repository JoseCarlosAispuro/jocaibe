'use client'

import { useRef, useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { useViewport } from '@/app/hooks/useViewport'

interface SkillGroup {
  cat: string
  items: string[]
}

interface SpringEl extends HTMLElement {
  __spring?: { x: number; y: number; g: number }
}

const SkillsCloud = ({ groups }: { groups: SkillGroup[] }) => {
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([])
  const { fine, hover, reduce, vw } = useViewport()
  // Stable ref to the measure fn — updated inside the effect so the Lenis
  // callback (defined at component level) can re-measure on scroll.
  const measureRef = useRef<() => void>(() => {})

  useLenis(() => { measureRef.current() })

  useEffect(() => {
    if (reduce || !fine || !hover) return

    let mx = -9999, my = -9999, raf = 0
    const radius = 175

    // Cached chip centre positions — never read in RAF loop
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

  // Re-measure chip positions when viewport width changes (replaces native resize listener)
  useEffect(() => { measureRef.current() }, [vw])

  const offsets: number[] = []
  let acc = 0
  groups.forEach((g) => { offsets.push(acc); acc += g.items.length })

  return (
    <div className="mt-20">
      <p className="mono mb-11 text-(--fg-3)">
        Move through the stack — it moves with you ↘
      </p>
      <div className="flex flex-col gap-11">
        {groups.map((g, gi) => (
          <div
            key={g.cat}
            className="flex flex-col gap-3 pt-6 border-t border-(--border-strong) md:grid md:items-start md:[grid-template-columns:clamp(140px,18vw,240px)_1fr] md:gap-[clamp(20px,4vw,56px)]"
          >
            <div className="mono pt-2 text-(--accent)">{g.cat}</div>
            <div className="flex flex-wrap gap-3" role="list" aria-label={`${g.cat} skills`}>
              {g.items.map((it, i) => (
                <span
                  key={it}
                  role="listitem"
                  ref={(el) => { chipRefs.current[offsets[gi] + i] = el }}
                  className="rounded-full border border-(--border) bg-(--bg-1) px-[18px] py-3 text-[clamp(14px,1.2vw,17px)] font-(--font-display) font-normal tracking-[-0.01em] text-(--fg-1) whitespace-nowrap will-change-transform"
                >
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkillsCloud
