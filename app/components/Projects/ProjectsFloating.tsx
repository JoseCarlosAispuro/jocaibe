'use client'

import { useRef, useState, useMemo } from 'react'
import { useFloatingCards, type FloatItemConfig } from '@/app/hooks/useFloatingCards'
import type { Project } from '@/app/types/project'

const FLOAT_STYLES = [
  { w: 'min(800px, 70%)', ratio: '16 / 9',  depth: 0.85, rot: -1.5, speed: 0.45, phase: 0.0 },
  { w: 'min(640px, 56%)', ratio: '16 / 10', depth: 1.70, rot: 1.8,  speed: 0.66, phase: 1.3 },
  { w: 'min(580px, 52%)', ratio: '4 / 3',   depth: 1.45, rot: -1.1, speed: 0.60, phase: 2.5 },
  { w: 'min(760px, 66%)', ratio: '16 / 9',  depth: 0.95, rot: 1.2,  speed: 0.42, phase: 0.7 },
  { w: 'min(620px, 54%)', ratio: '4 / 3',   depth: 1.55, rot: -1.7, speed: 0.70, phase: 3.0 },
  { w: 'min(700px, 60%)', ratio: '16 / 10', depth: 1.30, rot: 1.4,  speed: 0.55, phase: 1.8 },
  { w: 'min(820px, 72%)', ratio: '16 / 9',  depth: 0.90, rot: -0.9, speed: 0.48, phase: 3.8 },
] as const

interface FloatingCardProps {
  project: Project
  w: string
  ratio: string
  lane: 'start' | 'end'
  onOpen: (p: Project) => void
  register: (el: HTMLElement | null) => void
}

const FloatingCard = ({ project, w, ratio, lane, onOpen, register }: FloatingCardProps) => {
  const [hover, setHover] = useState(false)
  const isDark = project.dark

  return (
    <div className={`flex ${lane === 'start' ? 'justify-start' : 'justify-end'} max-md:justify-center`}>
      <article
        data-cursor="View"
        className="floating-card max-md:!w-full cursor-pointer"
        ref={register}
        onClick={() => onOpen(project)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ width: w }}
      >
        <div
          className={`relative overflow-hidden rounded-lg ${isDark ? 'border border-(--border-strong)' : 'border border-(--border)'} transition-shadow duration-[360ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]`}
          style={{
            aspectRatio: ratio,
            background: project.bg,
            boxShadow: hover
              ? '0 60px 110px -34px rgba(0,0,0,0.78)'
              : '0 34px 70px -38px rgba(0,0,0,0.62)',
          }}
        >
          {/* Background media */}
          {project.video ? (
            <video
              autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src={project.video}
            />
          ) : project.cover ? (
            <img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              style={{ transform: hover ? 'scale(1.04)' : 'scale(1)' }}
            />
          ) : (
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
                  ▤ {project.title}
                </span>
              </div>
            </>
          )}

          {/* Permanent bottom gradient — depth + base readability */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_30%,rgba(0,0,0,0.72)_100%)]" />

          {/* Hover overlay — additional darkening for text contrast */}
          <div
            className="absolute inset-0 pointer-events-none bg-black/35 transition-opacity duration-[300ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ opacity: hover ? 1 : 0 }}
          />

          {/* Award badge — always visible */}
          {project.award && (
            <div className="absolute top-5 left-5 z-[3] flex items-center gap-2 px-[10px] py-[6px] rounded-[2px] backdrop-blur-[8px] bg-(--accent)/90">
              <span className="mono text-(--bg-0) text-[10px]">{project.award.label}</span>
            </div>
          )}

          {/* Stack chips — hover only */}
          <div
            className="absolute top-5 right-5 z-[3] flex flex-col gap-[6px] items-end transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(-6px)',
            }}
          >
            {project.stack.slice(0, 3).map((s) => (
              <span key={s} className="mono py-1 px-[10px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) text-[10px] text-(--fg-0) bg-(--bg-1)/85">{s}</span>
            ))}
          </div>

          {/* Title + meta block — hidden initially, revealed on hover */}
          <div
            className="absolute left-7 right-7 bottom-[26px] z-[3] flex items-end justify-between gap-5 transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(14px)',
            }}
          >
            <div>
              <div className="mono mb-[10px] text-(--accent) text-[11px]">{project.year} · {project.role}</div>
              <h3
                className="font-(--font-display) text-[clamp(28px,3.4vw,56px)] font-medium tracking-[-0.03em] leading-[0.96] text-white"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
              >
                {project.title}
              </h3>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 size-11 rounded-full flex items-center justify-center border border-white/40 bg-black/30 text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* Meta line below tile — always visible */}
        <div className="mt-[14px] flex items-baseline justify-between gap-4">
          <span className="text-(--fg-1) text-[14px] min-w-0">{project.subtitle}</span>
          <span
            className="mono whitespace-nowrap shrink-0 transition-colors duration-[220ms]"
            style={{ color: hover ? 'var(--accent)' : 'var(--fg-3)' }}
          >
            {project.url}
          </span>
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
  const containerRef = useRef<HTMLDivElement>(null)

  const configs = useMemo<FloatItemConfig[]>(
    () => projects.map((_, i) => ({
      ...FLOAT_STYLES[i % FLOAT_STYLES.length],
      lane: (i % 2 === 0 ? 'start' : 'end') as 'start' | 'end',
    })),
    [projects.length], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const { register } = useFloatingCards(containerRef, configs)

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-6 mb-2 flex-wrap">
        <span className="mono">Scroll — the work drifts past. Click any card to open it.</span>
        <span className="mono text-(--fg-3)">{String(projects.length).padStart(2, '0')} projects</span>
      </div>

      <div
        ref={containerRef}
        className="floating-stage relative flex flex-col gap-[clamp(28px,7vw,104px)] pt-14 pb-6"
      >
        {projects.map((p, i) => {
          const style = FLOAT_STYLES[i % FLOAT_STYLES.length]
          const lane  = i % 2 === 0 ? 'start' : 'end' as 'start' | 'end'
          return (
            <FloatingCard
              key={p.id}
              project={p}
              w={style.w}
              ratio={style.ratio}
              lane={lane}
              onOpen={onOpen}
              register={register(i)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProjectsFloating
