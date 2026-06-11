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

function FloatingCard({ project, cfg, onOpen, register }: FloatingCardProps) {
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
    <div className={`floating-row lane-${cfg.lane}`}>
      <article
        data-cursor="View"
        className="floating-card"
        ref={register}
        onClick={() => onOpen(project)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ width: cfg.w, cursor: 'pointer' }}
      >
        <div
          ref={innerRef}
          onMouseMove={onMouseMove}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 8,
            aspectRatio: cfg.ratio,
            background: project.bg,
            border: `1px solid ${isDark ? 'var(--border-strong)' : 'var(--border)'}`,
            boxShadow: hover
              ? '0 60px 110px -34px rgba(0,0,0,0.78), 0 0 0 1px color-mix(in oklab, var(--accent) 28%, transparent)'
              : '0 34px 70px -38px rgba(0,0,0,0.62)',
            transition: 'box-shadow 360ms cubic-bezier(0.2,0.7,0.2,1)',
          }}
        >
          {/* pointer spotlight */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
            background: 'radial-gradient(360px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%)',
            opacity: hover ? 1 : 0, transition: 'opacity 260ms',
          }} />

          {project.cover && (
            <img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                transform: hover ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 700ms cubic-bezier(0.2,0.7,0.2,1)',
              }}
            />
          )}
          {!project.cover && (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: isDark
                  ? 'repeating-linear-gradient(0deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px)'
                  : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 26px)',
              }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="mono" style={{ color: 'rgba(255,255,255,0.32)', border: '1px dashed rgba(255,255,255,0.18)', padding: '8px 14px', borderRadius: 2 }}>
                  ▤ project shot — {project.title}
                </span>
              </div>
            </>
          )}

          {/* legibility scrim */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.16) 0%, transparent 30%, transparent 48%, rgba(0,0,0,0.62) 100%)',
          }} />

          {project.award && (
            <div style={{
              position: 'absolute', top: 20, left: 20, zIndex: 3,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 2,
              background: 'color-mix(in oklab, var(--bg-0) 70%, transparent)',
              backdropFilter: 'blur(8px)', border: '1px solid var(--border-strong)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)' }} />
              <span className="mono" style={{ color: 'var(--fg-0)', fontSize: 10 }}>{project.award.label}</span>
            </div>
          )}

          {/* hover stack chips */}
          <div style={{
            position: 'absolute', top: 20, right: 20, zIndex: 3,
            display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
            opacity: hover ? 1 : 0,
            transform: hover ? 'translateY(0)' : 'translateY(-6px)',
            transition: 'all 280ms cubic-bezier(0.2,0.7,0.2,1)',
          }}>
            {project.stack.slice(0, 3).map((s) => (
              <span key={s} className="mono" style={{
                padding: '4px 10px', borderRadius: 2,
                background: 'color-mix(in oklab, var(--bg-0) 65%, transparent)',
                backdropFilter: 'blur(8px)', border: '1px solid var(--border-strong)',
                fontSize: 10, color: 'var(--fg-0)',
              }}>{s}</span>
            ))}
          </div>

          {/* title block */}
          <div style={{
            position: 'absolute', left: 28, right: 28, bottom: 26, zIndex: 3,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20,
          }}>
            <div>
              <div className="mono" style={{ marginBottom: 10, color: '#fff', opacity: 0.72 }}>{project.year} · {project.role}</div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.4vw, 56px)',
                fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.96, color: '#fff',
              }}>{project.title}</h3>
            </div>
            <span aria-hidden="true" style={{
              flexShrink: 0, width: 44, height: 44, borderRadius: '50%',
              border: `1px solid ${hover ? 'var(--accent)' : 'rgba(255,255,255,0.5)'}`,
              background: hover ? 'var(--accent)' : 'rgba(0,0,0,0.25)',
              color: hover ? 'var(--bg-0)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 240ms cubic-bezier(0.2,0.7,0.2,1)',
              transform: hover ? 'rotate(0deg) scale(1.06)' : 'rotate(-12deg) scale(1)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* meta line below the tile */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: 'var(--fg-1)', fontSize: 14, minWidth: 0 }}>{project.subtitle}</span>
          <span className="mono" style={{ color: hover ? 'var(--accent)' : 'var(--fg-3)', transition: 'color 220ms', whiteSpace: 'nowrap', flexShrink: 0 }}>{project.url} ↗</span>
        </div>
      </article>
    </div>
  )
}

interface ProjectsFloatingProps {
  projects: Project[]
  onOpen: (p: Project) => void
}

export default function ProjectsFloating({ projects, onOpen }: ProjectsFloatingProps) {
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
    <div style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 8, flexWrap: 'wrap' }}>
        <span className="mono">Scroll — the work drifts past. Click any card to open it.</span>
        <span className="mono" style={{ color: 'var(--fg-3)' }}>{String(projects.length).padStart(2, '0')} projects</span>
      </div>

      <div className="floating-stage" style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(44px, 7vw, 104px)',
        paddingTop: 56,
        paddingBottom: 24,
      }}>
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
