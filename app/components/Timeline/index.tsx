'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import SectionHeading from '@/app/partials/SectionHeading'
import TimelineCurrent from './TimelineCurrent';
import TimelineNode from "./TimelineNode";

export interface Role {
  company: string
  role: string
  period: string
  location: string
  bullets: string[]
  stack: string[]
}

export interface TimelineData {
  eyebrow: string
  titleMain: string
  titleMuted: string
  roles: Role[]
  current: {
    period: string;
    label: string
  }
}

// ── Index ─────────────────────────────────────────────────
const Timeline = ({ data }: { data: TimelineData }) => {
  const {eyebrow, titleMain, titleMuted, roles, current, } = {...data}

  const wrapRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLSpanElement>(null)
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [lit, setLit] = useState<boolean[]>([])

  const update = useCallback(() => {
    const el = wrapRef.current
    if (!el || !fillRef.current) return

    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    const start = vh * 0.78
    const span = rect.height + start - vh * 0.4
    const fill = Math.max(0, Math.min(1, (start - rect.top) / span)) * rect.height

    fillRef.current.style.height = Math.max(0, fill - 8) + 'px'

    if (headRef.current) {
      headRef.current.style.opacity = fill > 10 ? '1' : '0'
    }

    const next = dotRefs.current.map((d) => {
      if (!d) return false
      const dr = d.getBoundingClientRect()
      return (dr.top + dr.height / 2 - rect.top) <= fill + 2
    })
    setLit((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next
    )
  }, [])

  useLenis(update)

  useEffect(() => {
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [update])

  return (
    <section id="timeline" className="py-(--s-section) relative">
      <div className="container mx-auto px-(--gutter)">
        <SectionHeading
          lines={[
            { text: titleMain },
            ...(titleMuted ? [{ text: titleMuted, muted: true }] : []),
          ]}
        />

        <div ref={wrapRef} className="relative mt-24">
          {/* Track — dim background line */}
          <div
            className="absolute top-2 bottom-2 w-px bg-(--border-strong) left-[clamp(20px,4vw,36px)]"
          />

          {/* Fill — accent line that draws on scroll */}
          <div
            ref={fillRef}
            className="absolute top-2 w-0.5 -ml-px left-[clamp(20px,4vw,36px)] h-0 bg-[linear-gradient(180deg,var(--accent),var(--accent-soft))] shadow-[0_0_12px_var(--accent)] transition-[height] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
          >
            {/* Glowing head */}
            <span
              ref={headRef}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[7px] h-[7px] rounded-full bg-(--accent) opacity-0 transition-opacity duration-200 shadow-[0_0_12px_3px_var(--accent)]"
            />
          </div>

          {roles.map((role, i) => (
            <TimelineNode
              key={role.company}
              role={role}
              idx={i}
              lit={!!lit[i]}
              registerDot={(el) => { dotRefs.current[i] = el }}
            />
          ))}

          <TimelineCurrent
            period={current.period}
            label={current.label}
            lit={!!lit[roles.length]}
            registerDot={(el) => { dotRefs.current[roles.length] = el }}
          />
        </div>
      </div>

    </section>
  )
}

export default Timeline
