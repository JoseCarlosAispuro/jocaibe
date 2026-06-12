'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useTilt } from '@/app/hooks/useTilt'
import Reveal from '@/app/partials/Reveal'
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
    <Reveal>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.32, ease: EASE }}
        data-cursor="View"
        className="relative cursor-pointer"
        onClick={() => onOpen(project)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Tilt wrapper */}
        <div
          ref={tilt.ref}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          className={`relative overflow-hidden rounded-[4px] ${isDark ? 'border border-(--border-strong)' : 'border border-(--border)'} transition-transform duration-[240ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] will-change-transform`}
          style={{ aspectRatio: ratio, background: project.bg }}
        >
          {/* Background media */}
          {project.video ? (
            <video
              autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src={project.video}
            />
          ) : project.cover ? (
            <motion.img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              animate={{ scale: hover ? 1.04 : 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: isDark
                  ? 'repeating-linear-gradient(0deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px)'
                  : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 24px)',
              }}
            />
          )}

          {/* Permanent gradient scrim — depth at bottom */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.65)_100%)]" />

          {/* Hover overlay — darkens card for text readability */}
          <div
            className="absolute inset-0 pointer-events-none bg-black/40 transition-opacity duration-[300ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ opacity: hover ? 1 : 0 }}
          />

          {/* Award badge — always visible */}
          {project.award && (
            <div className="absolute top-6 left-6 z-[2] flex items-center gap-2 px-[10px] py-[6px] rounded-[2px] backdrop-blur-[8px] bg-(--accent)/90">
              <span className="mono text-(--bg-0) text-[10px]">{project.award.label}</span>
            </div>
          )}

          {/* Stack chips — hover only */}
          <motion.div
            animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : -6 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="absolute top-6 right-6 z-[2] flex flex-col gap-[6px] items-end"
          >
            {project.stack.slice(0, 3).map((s) => (
              <span
                key={s}
                className="py-1 px-[10px] rounded-[2px] backdrop-blur-[8px] border border-(--border-strong) font-(--font-mono) text-[10px] tracking-[0.06em] text-(--fg-0) bg-(--bg-1)/85"
              >
                {s}
              </span>
            ))}
          </motion.div>

          {/* Title overlay — hidden initially, revealed on hover */}
          <div
            className="absolute left-8 bottom-8 right-8 z-[2] transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <h3
              className={`font-(--font-display) ${isHero ? 'text-[clamp(48px,7vw,96px)]' : 'text-[clamp(32px,4vw,56px)]'} font-medium tracking-[-0.03em] leading-[0.95] text-white`}
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
            >
              {project.title}
            </h3>
          </div>
        </div>

        {/* Meta below card — always visible */}
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
            {project.url}
          </motion.span>
        </div>
      </motion.article>
    </Reveal>
  )
}

export default ProjectCard
