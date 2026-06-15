'use client'

import { useState } from 'react'
import type { Project } from '@/app/types/project'

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

          {/* Legibility scrim — only on real media */}
          {(project.cover || project.video) && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 32%, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
            />
          )}

          {/* Award badge — hover only, frosted glass */}
          {project.award && (
            <div
              className="absolute top-5 left-5 z-[3] flex items-center gap-2 px-[10px] py-[6px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              style={{
                background: 'color-mix(in oklab, var(--bg-0) 70%, transparent)',
                opacity: hover ? 1 : 0,
                transform: hover ? 'translateY(0)' : 'translateY(-6px)',
              }}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight, var(--accent))' }}
              />
              <span className="mono text-(--fg-0) text-[10px]">{project.award.label}</span>
            </div>
          )}

          {/* Stack chips — hover only, frosted glass */}
          <div
            className="absolute top-5 right-5 z-[3] flex flex-col gap-[6px] items-end transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(-6px)',
            }}
          >
            {project.stack.slice(0, 3).map((s) => (
              <span
                key={s}
                className="mono py-1 px-[10px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) text-[10px] text-(--fg-0)"
                style={{ background: 'color-mix(in oklab, var(--bg-0) 70%, transparent)' }}
              >
                {s}
              </span>
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
                className="font-(--font-display) text-[clamp(28px,3.4vw,56px)] font-medium tracking-[-0.03em] leading-[0.96]"
                style={{
                  color: (project.cover || project.video) ? '#fff' : 'var(--fg-0)',
                  mixBlendMode: (project.cover || project.video) ? 'normal' : 'difference',
                  textShadow: (project.cover || project.video) ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
                }}
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

        {/* Meta line below tile — hidden at rest, revealed on hover */}
        <div
          className="mt-[14px] flex items-baseline justify-between gap-4 transition-[opacity,transform] duration-[300ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
          style={{
            opacity: hover ? 1 : 0,
            transform: hover ? 'translateY(0)' : 'translateY(-6px)',
          }}
        >
          <span className="text-(--fg-1) text-[14px] min-w-0">{project.subtitle}</span>
          <span className="mono whitespace-nowrap shrink-0" style={{ color: hover ? 'var(--accent)' : 'var(--fg-3)' }}>
            {project.url}
          </span>
        </div>
      </article>
    </div>
  )
}

export default FloatingCard
