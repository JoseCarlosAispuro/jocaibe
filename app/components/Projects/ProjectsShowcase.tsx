'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useTilt } from '@/app/hooks/useTilt'
import type { Project } from '@/app/types/project'

interface ProjectsShowcaseProps {
  projects: Project[]
  onOpen: (p: Project) => void
}

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number]

function ShowcaseArrow({ dir, onClick }: { dir: number; onClick: () => void }) {
  return (
    <motion.button
      data-cursor={dir < 0 ? 'Prev' : 'Next'}
      onClick={onClick}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        borderWidth: 1,
        borderStyle: 'solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      initial={{ borderColor: 'var(--border-strong)', background: 'rgba(217,240,74,0)', color: 'var(--fg-1)' }}
      whileHover={{ borderColor: 'var(--accent)', background: 'var(--accent)', color: 'var(--bg-0)' }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: dir < 0 ? 'scaleX(-1)' : 'none' }}
      >
        <path
          d="M5 12h14M13 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </motion.button>
  )
}

function ShowcasePanel({
  project,
  index,
  onOpen,
  getScroller,
}: {
  project: Project
  index: number
  onOpen: (p: Project) => void
  getScroller: () => HTMLDivElement | null
}) {
  const tilt = useTilt(5)
  const [hover, setHover] = useState(false)
  const isDark = project.dark

  const click = () => {
    const sc = getScroller()
    if (sc && (sc as HTMLDivElement & { dataset: DOMStringMap }).dataset.dragged === '1') return
    onOpen(project)
  }

  return (
    <motion.article
      data-panel
      data-cursor="View"
      onClick={click}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.54, ease: [0.2, 0.7, 0.2, 1], delay: index * 0.07 }}
      style={{
        flex: '0 0 min(82vw, 920px)',
        scrollSnapAlign: 'start',
        cursor: 'pointer',
      }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 6,
          height: 'min(62vh, 540px)',
          background: project.bg,
          border: `1px solid ${isDark ? 'var(--border-strong)' : 'var(--border)'}`,
          transition: 'transform 240ms cubic-bezier(0.2,0.7,0.2,1)',
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.26 }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(380px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%)',
          }}
        />
        {project.cover && (
          <motion.img
            src={project.cover}
            alt={project.title}
            loading="lazy"
            animate={{ scale: hover ? 1.04 : 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {!project.cover && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: isDark
                  ? 'repeating-linear-gradient(0deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px)'
                  : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 26px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="mono"
                style={{
                  color: 'rgba(255,255,255,0.32)',
                  border: '1px dashed rgba(255,255,255,0.18)',
                  padding: '8px 14px',
                  borderRadius: 2,
                }}
              >
                ▤ project shot — {project.title}
              </span>
            </div>
          </>
        )}
        {project.cover && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.6) 100%)',
            }}
          />
        )}

        {project.award && (
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 2,
              background: 'color-mix(in oklab, var(--bg-0) 70%, transparent)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)',
              }}
            />
            <span className="mono" style={{ color: 'var(--fg-0)', fontSize: 10 }}>
              {project.award.label}
            </span>
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            left: 32,
            right: 32,
            bottom: 32,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div>
            <div
              className="mono"
              style={{ marginBottom: 12, color: '#fff', opacity: 0.7 }}
            >
              {project.year} · {project.role}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4.6vw, 68px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: '#fff',
              }}
            >
              {project.title}
            </h3>
          </div>
          <motion.div
            animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 8 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-end',
            }}
          >
            {project.stack.slice(0, 4).map((s) => (
              <span
                key={s}
                className="mono"
                style={{
                  padding: '4px 10px',
                  borderRadius: 2,
                  background: 'color-mix(in oklab, var(--bg-0) 65%, transparent)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-strong)',
                  fontSize: 10,
                  color: 'var(--fg-0)',
                }}
              >
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <span style={{ color: 'var(--fg-1)', fontSize: 15 }}>{project.subtitle}</span>
        <motion.span
          className="mono"
          animate={{ color: hover ? 'var(--accent)' : 'var(--fg-3)' }}
          transition={{ duration: 0.22 }}
        >
          {project.url} ↗
        </motion.span>
      </div>
    </motion.article>
  )
}

export default function ProjectsShowcase({ projects, onOpen }: ProjectsShowcaseProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const [idx, setIdx] = useState(0)

  const R = 17
  const CIRC = 2 * Math.PI * R

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = el.scrollWidth - el.clientWidth
      const p = max > 0 ? Math.max(0, Math.min(1, el.scrollLeft / max)) : 0
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(CIRC * (1 - p))
      }
      const panel = el.querySelector('[data-panel]')
      const step = panel ? panel.getBoundingClientRect().width + 28 : el.clientWidth
      setIdx(
        Math.min(projects.length - 1, Math.max(0, Math.round(el.scrollLeft / step)))
      )
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [projects, CIRC])

  // Drag with inertia
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let down = false,
      startX = 0,
      startLeft = 0,
      moved = false
    let lastX = 0,
      lastT = 0,
      vel = 0,
      glideRaf = 0

    const glide = () => {
      el.scrollLeft -= vel * 16
      vel *= 0.93
      const max = el.scrollWidth - el.clientWidth
      if (el.scrollLeft <= 0 || el.scrollLeft >= max) vel = 0
      if (Math.abs(vel) > 0.015) glideRaf = requestAnimationFrame(glide)
    }
    const onDown = (e: PointerEvent) => {
      down = true
      moved = false
      startX = e.clientX
      startLeft = el.scrollLeft
      lastX = e.clientX
      lastT = performance.now()
      vel = 0
      cancelAnimationFrame(glideRaf)
      el.classList.add('dragging')
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 4) moved = true
      el.scrollLeft = startLeft - dx
      const now = performance.now()
      const dt = now - lastT
      if (dt > 0) vel = (e.clientX - lastX) / dt
      lastX = e.clientX
      lastT = now
    }
    const onUp = () => {
      if (!down) return
      down = false
      el.classList.remove('dragging')
      el.dataset.dragged = moved ? '1' : '0'
      if (moved && Math.abs(vel) > 0.04) {
        cancelAnimationFrame(glideRaf)
        glideRaf = requestAnimationFrame(glide)
      }
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(glideRaf)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [projects])

  const nudge = (dir: number) => {
    const el = scrollerRef.current
    if (!el) return
    const panel = el.querySelector('[data-panel]')
    const step = panel ? panel.getBoundingClientRect().width + 28 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div style={{ marginTop: 48 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <span className="mono">
          Drag or use the arrows — {String(idx + 1).padStart(2, '0')} /{' '}
          {String(projects.length).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}
            aria-hidden="true"
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="22"
                cy="22"
                r={R}
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth="2"
              />
              <circle
                ref={ringRef}
                cx="22"
                cy="22"
                r={R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC}
                style={{
                  transition: 'stroke-dashoffset 120ms linear',
                  filter: 'drop-shadow(0 0 4px var(--accent))',
                }}
              />
            </svg>
          </div>
          <ShowcaseArrow dir={-1} onClick={() => nudge(-1)} />
          <ShowcaseArrow dir={1} onClick={() => nudge(1)} />
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="showcase-scroller"
        style={{
          display: 'flex',
          gap: 28,
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: 4,
          scrollSnapType: 'x mandatory',
          marginRight: 'calc(var(--gutter) * -1)',
        }}
      >
        {projects.map((p, i) => (
          <ShowcasePanel
            key={p.id}
            project={p}
            index={i}
            onOpen={onOpen}
            getScroller={() => scrollerRef.current}
          />
        ))}
        <div style={{ flex: '0 0 var(--gutter)' }} />
      </div>
    </div>
  )
}
