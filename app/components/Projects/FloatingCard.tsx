'use client'

import { assetUrl } from '@/app/helpers/assets'
import VideoEl from './VideoEl'
import type { Project } from '@/app/types/project'
import RightArrow from '@/app/icons/RightArrow'

interface FloatingCardProps {
  project: Project
  w: string
  ratio: string
  lane: 'start' | 'end'
  onOpen: (p: Project) => void
  register: (el: HTMLElement | null) => void
}

// No useState — all hover effects are driven by CSS group-hover: so React
// never re-renders this component during animation, eliminating the main
// source of forced reflows that were stalling the RAF loop.
const FloatingCard = ({ project, w, ratio, lane, onOpen, register }: FloatingCardProps) => {
  const isDark    = project.dark
  const hasMedia  = !!(project.cover || project.video)

  return (
    <div className={`flex ${lane === 'start' ? 'justify-start' : 'justify-end'} max-md:justify-center`}>
      <article
        data-cursor="View"
        role="button"
        tabIndex={0}
        aria-label={`View ${project.title} project`}
        className="group floating-card max-md:!w-full cursor-pointer"
        ref={register}
        onClick={() => onOpen(project)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project) } }}
        style={{ width: w }}
      >
        <div
          className={`relative overflow-hidden rounded-lg ${isDark ? 'border border-(--border-strong)' : 'border border-(--border)'} transition-shadow duration-[360ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] shadow-[0_34px_70px_-38px_rgba(0,0,0,0.62)] group-hover:shadow-[0_60px_110px_-34px_rgba(0,0,0,0.78)]`}
          style={{ aspectRatio: ratio, background: project.bg }}
        >
          {/* Background media */}
          {project.video ? (
            <VideoEl
              src={project.video}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : project.cover ? (
            <img
              src={assetUrl(project.cover)}
              alt={project.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
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

          {/* Legibility scrim — media only, hover only (always on mobile) */}
          {hasMedia && (
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity duration-[360ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 10%, transparent 60%, rgba(0,0,0,1) 100%)' }}
            />
          )}

          {/* Award badge — hover only, always on mobile */}
          {project.award && (
            <div className="frosted-glass absolute top-5 left-5 z-[3] flex items-center gap-2 px-[10px] py-[6px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) opacity-0 -translate-y-[6px] group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0 transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight, var(--accent))' }}
              />
              <span className="mono text-(--fg-0) text-[10px]">{project.award.label}</span>
            </div>
          )}

          {/* Stack chips — hover only on desktop, hidden on mobile for clarity */}
          <div className="absolute top-5 right-5 z-[3] flex-col gap-[6px] items-end hidden md:flex opacity-0 -translate-y-[6px] group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]">
            {project.stack.slice(0, 3).map((s) => (
              <span
                key={s}
                className="frosted-glass mono py-1 px-[10px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) text-[10px] text-(--fg-0)"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Title + meta block — hover on desktop, always on mobile */}
          <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-[26px] z-[3] flex items-end justify-between gap-5 opacity-0 translate-y-[14px] group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0 transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]">
            <div>
              <div className="mono mb-[10px] text-(--accent) text-[11px]">{project.year} · {project.role}</div>
              <h3
                className="font-(--font-display) text-[clamp(22px,3.4vw,56px)] font-medium tracking-[-0.03em] leading-[0.96]"
                style={{
                  color: hasMedia ? '#fff' : 'var(--fg-0)',
                  mixBlendMode: hasMedia ? 'normal' : 'difference',
                  textShadow: hasMedia ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                {project.title}
              </h3>
            </div>
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center justify-center size-9 rounded-full border border-white/40 bg-black/30 text-white md:size-11"
            >
              <RightArrow size={14} />
            </span>
          </div>
        </div>

        {/* Meta line below tile — hover on desktop, always on mobile */}
        <div className="mt-[10px] md:mt-[14px] flex items-baseline justify-between gap-4 opacity-0 -translate-y-[6px] group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0 transition-[opacity,transform] duration-[300ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]">
          <span className="text-(--fg-1) text-[13px] md:text-[14px] min-w-0">{project.subtitle}</span>
          <span className="mono whitespace-nowrap shrink-0 text-(--fg-3) group-hover:text-(--accent) transition-colors duration-[220ms]">
            {project.url}
          </span>
        </div>
      </article>
    </div>
  )
}

export default FloatingCard
