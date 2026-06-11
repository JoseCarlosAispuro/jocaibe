'use client'

import { useRef, useEffect } from 'react'

interface SkillGroup {
  cat: string
  items: string[]
}

interface SpringEl extends HTMLElement {
  __spring?: { x: number; y: number; g: number }
}

const SkillsCloud = ({ groups }: { groups: SkillGroup[] }) => {
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (reduced || !fine) return

    let mx = -9999, my = -9999, raf = 0
    const radius = 175

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }

    const loop = () => {
      const list = chipRefs.current
      for (let i = 0; i < list.length; i++) {
        const el = list[i] as SpringEl | null
        if (!el) continue
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2
        const dx = cx - mx,
          dy = cy - my
        const dist = Math.hypot(dx, dy)
        let tx = 0,
          ty = 0,
          gl = 0
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
        el.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`
        if (s.g > 0.03) {
          el.style.borderColor = `color-mix(in oklab, var(--accent) ${Math.round(s.g * 95)}%, var(--border))`
          el.style.color = s.g > 0.4 ? 'var(--accent)' : 'var(--fg-0)'
          el.style.boxShadow = `0 0 ${(s.g * 24).toFixed(1)}px color-mix(in oklab, var(--accent) ${Math.round(s.g * 55)}%, transparent)`
        } else {
          el.style.borderColor = ''
          el.style.color = ''
          el.style.boxShadow = ''
        }
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const offsets: number[] = []
  let acc = 0
  groups.forEach((g) => {
    offsets.push(acc)
    acc += g.items.length
  })

  return (
    <div className="mt-20">
      <div className="mono mb-11 text-(--fg-3)">
        Move through the stack — it moves with you ↘
      </div>
      <div className="flex flex-col gap-11">
        {groups.map((g, gi) => (
          <div
            key={g.cat}
            className="grid pt-6 border-t border-(--border-strong) items-start [grid-template-columns:clamp(140px,18vw,240px)_1fr] gap-[clamp(20px,4vw,56px)]"
          >
            <div className="mono text-(--accent) pt-2">
              {g.cat}
            </div>
            <div className="flex flex-wrap gap-3">
              {g.items.map((it, i) => (
                <span
                  key={it}
                  ref={(el) => {
                    chipRefs.current[offsets[gi] + i] = el
                  }}
                  className="rounded-full border border-(--border) bg-(--bg-1) text-(--fg-1) [font-family:var(--font-display)] font-normal tracking-[-0.01em] will-change-transform whitespace-nowrap px-[18px] py-3 text-[clamp(14px,1.2vw,17px)]"
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
