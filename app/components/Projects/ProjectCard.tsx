'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { reveal } from '@/app/hooks/useReveal'
import { useTilt } from '@/app/hooks/useTilt'
import type { Project } from '@/app/types/project'

type Variant = 'hero' | 'wide' | 'tall' | 'square' | 'wide-full'

interface ProjectCardProps {
  project: Project
  variant: Variant
  onOpen: (p: Project) => void
}

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number]

const ProjectCard = ({ project, variant, onOpen }: ProjectCardProps) => {
  const [hover, setHover] = useState(false)
  const tilt = useTilt(6)
  const isHero = variant === 'hero'
  const isTall = variant === 'tall'
  const isSquare = variant === 'square'
  const ratio = isHero ? '21 / 10' : isTall ? '4 / 5' : isSquare ? '4 / 3' : '16 / 9'
  const isDark = project.dark

  return (
    <motion.article
      {...reveal(0)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.32, ease: EASE }}
      data-cursor="View"
      className="relative cursor-pointer"
      onClick={() => onOpen(project)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Tilt wrapper — useTilt owns transform; CSS transition eases it */}
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={`relative overflow-hidden rounded-[4px] aspect-[${ratio.replace(/ \/ /g, '/')}] ${isDark ? 'border border-(--border-strong)' : 'border border-(--border)'} transition-transform duration-[240ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] will-change-transform`}
        style={{ background: project.bg }}
      >
        {/* Spotlight */}
        <motion.div
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.26 }}
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--accent)_22%,transparent),transparent_62%)]"
        />

        {/* Cover image */}
        {project.cover && (
          <motion.img
            src={project.cover}
            alt={project.title}
            loading="lazy"
            animate={{ scale: hover ? 1.04 : 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Fallback pattern */}
        {!project.cover && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: isDark
                  ? 'repeating-linear-gradient(0deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px)'
                  : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 24px)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="[font-family:var(--font-mono)] text-[11px] tracking-[0.1em] uppercase px-[14px] py-2 rounded-[2px]"
                style={{
                  color: isDark ? 'rgba(94,234,212,0.45)' : 'rgba(255,255,255,0.4)',
                  border: `1px dashed ${isDark ? 'rgba(94,234,212,0.25)' : 'rgba(255,255,255,0.2)'}`,
                }}
              >
                ▤ project shot — {project.title}
              </div>
            </div>
          </>
        )}

        {/* Scrim over real image */}
        {project.cover && (
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,transparent_32%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
        )}

        {/* Award badge */}
        {project.award && (
          <div className="absolute top-6 left-6 flex items-center gap-2 px-[10px] py-[6px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)]">
            <span
              className="size-2 rounded-full"
              style={{ background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)' }}
            />
            <span className="mono text-(--fg-0) text-[10px]">
              {project.award.label}
            </span>
          </div>
        )}

        {/* Hover stack chips */}
        <motion.div
          animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : -6 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="absolute top-6 right-6 flex flex-col gap-[6px] items-end"
        >
          {project.stack.map((s) => (
            <span
              key={s}
              className="py-1 px-[10px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) [font-family:var(--font-mono)] text-[10px] tracking-[0.06em] text-(--fg-0) bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)]"
            >
              {s}
            </span>
          ))}
        </motion.div>

        {/* Title overlay */}
        <div className="absolute left-8 bottom-8 right-8">
          <h3
            className={`[font-family:var(--font-display)] ${isHero ? 'text-[clamp(48px,7vw,96px)]' : 'text-[clamp(32px,4vw,56px)]'} font-medium tracking-[-0.03em] leading-[0.95] ${project.cover ? 'text-white' : 'text-(--fg-0)'}`}
            style={{ textShadow: project.cover ? '0 2px 24px rgba(0,0,0,0.4)' : 'none' }}
          >
            {project.title}
          </h3>
        </div>
      </div>

      {/* Meta below card */}
      <div className="mt-4 flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="mono">{project.year}</span>
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="mono py-[3px] px-2 border border-(--border) rounded-full text-[10px] text-(--fg-2)"
            >
              {tag}
            </span>
          ))}
          <span className="text-(--fg-1) text-[15px]">{project.subtitle}</span>
        </div>
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

export default ProjectCard
