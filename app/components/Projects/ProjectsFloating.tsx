'use client'

import { useRef, useEffect, useState } from 'react'
import type { Project } from '@/app/types/project'

// Lane is derived strictly from index: even → left, odd → right.
// Visual properties (size, ratio, animation) cycle independently.
const FLOAT_STYLES = [
  { w: 'min(800px, 70%)', ratio: '16 / 9',  depth: 0.85, rot: -1.5, speed: 0.45, phase: 0.0 },
  { w: 'min(640px, 56%)', ratio: '16 / 10', depth: 1.70, rot: 1.8,  speed: 0.66, phase: 1.3 },
  { w: 'min(580px, 52%)', ratio: '4 / 3',   depth: 1.45, rot: -1.1, speed: 0.60, phase: 2.5 },
  { w: 'min(760px, 66%)', ratio: '16 / 9',  depth: 0.95, rot: 1.2,  speed: 0.42, phase: 0.7 },
  { w: 'min(620px, 54%)', ratio: '4 / 3',   depth: 1.55, rot: -1.7, speed: 0.70, phase: 3.0 },
  { w: 'min(700px, 60%)', ratio: '16 / 10', depth: 1.30, rot: 1.4,  speed: 0.55, phase: 1.8 },
  { w: 'min(820px, 72%)', ratio: '16 / 9',  depth: 0.90, rot: -0.9, speed: 0.48, phase: 3.8 },
] as const

type FloatStyle = (typeof FLOAT_STYLES)[number]
type FloatConfig = FloatStyle & { lane: 'start' | 'end' }

interface FloatingCardProps {
  project: Project
  cfg: FloatConfig
  onOpen: (p: Project) => void
  register: (el: HTMLElement | null) => void
}

const FloatingCard = ({ project, cfg, onOpen, register }: FloatingCardProps) => {
  const [hover, setHover] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)
  const isDark = project.dark

  const onMouseMove = (e: React.MouseEvent) => {
    const el = innerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div className={`flex ${cfg.lane === 'start' ? 'justify-start' : 'justify-end'} max-md:justify-center`}>
      <article
        data-cursor="View"
        className="floating-card max-md:!w-full cursor-pointer"
        ref={register}
        onClick={() => onOpen(project)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ width: cfg.w }}
      >
        <div
          ref={innerRef}
          onMouseMove={onMouseMove}
          className={`relative overflow-hidden rounded-lg aspect-[${cfg.ratio.replace(/ \/ /g, '/')}] ${isDark ? 'border border-(--border-strong)' : 'border border-(--border)'} transition-shadow duration-[360ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]`}
          style={{
            background: project.bg,
            boxShadow: hover
              ? '0 60px 110px -34px rgba(0,0,0,0.78), 0 0 0 1px color-mix(in oklab, var(--accent) 28%, transparent)'
              : '0 34px 70px -38px rgba(0,0,0,0.62)',
          }}
        >
          {/* pointer spotlight */}
          <div
            className={`absolute inset-0 pointer-events-none z-[2] transition-opacity duration-[260ms] bg-[radial-gradient(360px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%)] ${hover ? 'opacity-100' : 'opacity-0'}`}
          />

          {project.cover && (
            <img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              style={{ transform: hover ? 'scale(1.05)' : 'scale(1)' }}
            />
          )}
          {!project.cover && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: isDark
                    ? 'repeating-linear-gradient(0deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px)'
                    : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 26px)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="mono px-[14px] py-2 rounded-[2px] text-[rgba(255,255,255,0.32)] border border-dashed border-[rgba(255,255,255,0.18)]">
                  ▤ project shot — {project.title}
                </span>
              </div>
            </>
          )}

          {/* legibility scrim */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,transparent_30%,transparent_48%,rgba(0,0,0,0.62)_100%)]" />

          {project.award && (
            <div className="absolute top-5 left-5 z-[3] flex items-center gap-2 px-[10px] py-[6px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)]">
              <span
                className="size-2 rounded-full"
                style={{ background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)' }}
              />
              <span className="mono text-(--fg-0) text-[10px]">{project.award.label}</span>
            </div>
          )}

          {/* hover stack chips */}
          <div
            className={`absolute top-5 right-5 z-[3] flex flex-col gap-[6px] items-end transition-all duration-[280ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${hover ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-[6px]'}`}
          >
            {project.stack.slice(0, 3).map((s) => (
              <span key={s} className="mono py-1 px-[10px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) text-[10px] text-(--fg-0) bg-[color-mix(in_oklab,var(--bg-0)_65%,transparent)]">{s}</span>
            ))}
          </div>

          {/* title block */}
          <div className="absolute left-7 right-7 bottom-[26px] z-[3] flex items-end justify-between gap-5">
            <div>
              <div className="mono mb-[10px] text-white opacity-[0.72]">{project.year} · {project.role}</div>
              <h3 className="[font-family:var(--font-display)] text-[clamp(28px,3.4vw,56px)] font-medium tracking-[-0.03em] leading-[0.96] text-white">{project.title}</h3>
            </div>
            <span
              aria-hidden="true"
              className={`shrink-0 size-11 rounded-full flex items-center justify-center transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]`}
              style={{
                border: `1px solid ${hover ? 'var(--accent)' : 'rgba(255,255,255,0.5)'}`,
                background: hover ? 'var(--accent)' : 'rgba(0,0,0,0.25)',
                color: hover ? 'var(--bg-0)' : '#fff',
                transform: hover ? 'rotate(0deg) scale(1.06)' : 'rotate(-12deg) scale(1)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* meta line below the tile */}
        <div className="mt-[14px] flex items-baseline justify-between gap-4">
          <span className="text-(--fg-1) text-[14px] min-w-0">{project.subtitle}</span>
          <span className={`mono whitespace-nowrap shrink-0 transition-colors duration-[220ms] ${hover ? 'text-(--accent)' : 'text-(--fg-3)'}`}>{project.url} ↗</span>
        </div>
      </article>
    </div>
  )
}

interface ProjectsFloatingProps {
  projects: Project[]
  onOpen: (p: Project) => void
}

const ProjectsFloating = ({ projects, onOpen }: ProjectsFloatingProps) => {
  const cardsRef = useRef<(HTMLElement | null)[]>([])
  const stateRef = useRef<{ appear: number }[]>([])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    let raf = 0
    let running = true
    let mx = 0, my = 0, cmx = 0, cmy = 0

    stateRef.current = projects.map(() => ({ appear: 0 }))

    const onMove = (e: MouseEvent) => {
      mx = e.clientX / (window.innerWidth || 1) - 0.5
      my = e.clientY / (window.innerHeight || 1) - 0.5
    }
    if (fine && !reduce) window.addEventListener('mousemove', onMove, { passive: true })

    const loop = (now: number) => {
      if (!running) return
      const vh = window.innerHeight || document.documentElement.clientHeight
      const t = (now || 0) * 0.001
      cmx += (mx - cmx) * 0.06
      cmy += (my - cmy) * 0.06

      const cards = cardsRef.current
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        if (!el) continue
        const style = FLOAT_STYLES[i % FLOAT_STYLES.length]
        const cfg = { ...style, lane: i % 2 === 0 ? 'start' : 'end' } as FloatConfig
        const r = el.getBoundingClientRect()
        if (r.height === 0) continue

        const center = r.top + r.height / 2
        const rel = (center - vh / 2) / vh
        const st = stateRef.current[i] || (stateRef.current[i] = { appear: 0 })
        const target = r.top < vh * 0.86 ? 1 : 0
        st.appear += (target - st.appear) * (reduce ? 1 : 0.08)
        const enter = Math.max(0, Math.min(1, st.appear))

        let tx = 0, ty: number, rot: number, scale: number
        if (reduce) {
          ty = (1 - enter) * 18; rot = 0; scale = 1
        } else {
          const parallax = rel * cfg.depth * 46
          const bob = Math.sin(t * cfg.speed + cfg.phase) * 7
          ty = parallax + bob + (1 - enter) * 48
          tx = cmx * cfg.depth * 16 + (1 - enter) * (cfg.lane === 'end' ? 26 : -26)
          rot = cfg.rot + rel * 1.4 + cmx * cfg.depth * 0.7
          scale = 0.93 + 0.07 * enter
        }

        el.style.opacity = String(enter)
        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [projects])

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-6 mb-2 flex-wrap">
        <span className="mono">Scroll — the work drifts past. Click any card to open it.</span>
        <span className="mono text-(--fg-3)">{String(projects.length).padStart(2, '0')} projects</span>
      </div>

      <div className="floating-stage relative flex flex-col gap-[clamp(28px,7vw,104px)] pt-14 pb-6">
        {projects.map((p, i) => (
          <FloatingCard
            key={p.id}
            project={p}
            cfg={{ ...FLOAT_STYLES[i % FLOAT_STYLES.length], lane: i % 2 === 0 ? 'start' : 'end' }}
            onOpen={onOpen}
            register={(el) => { cardsRef.current[i] = el }}
          />
        ))}
      </div>
    </div>
  )
}

export default ProjectsFloating
