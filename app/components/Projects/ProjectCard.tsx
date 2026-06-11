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

export default function ProjectCard({ project, variant, onOpen }: ProjectCardProps) {
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
      style={{ position: 'relative', cursor: 'pointer' }}
      onClick={() => onOpen(project)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Tilt wrapper — useTilt owns transform; CSS transition eases it */}
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          aspectRatio: ratio,
          background: project.bg,
          border: `1px solid ${isDark ? 'var(--border-strong)' : 'var(--border)'}`,
          transition: 'transform 240ms cubic-bezier(0.2,0.7,0.2,1)',
          willChange: 'transform',
        }}
      >
        {/* Spotlight */}
        <motion.div
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.26 }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 62%)',
          }}
        />

        {/* Cover image */}
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

        {/* Fallback pattern */}
        {!project.cover && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: isDark
                  ? 'repeating-linear-gradient(0deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(94,234,212,0.06) 0 1px, transparent 1px 32px)'
                  : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 24px)',
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
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isDark ? 'rgba(94,234,212,0.45)' : 'rgba(255,255,255,0.4)',
                  padding: '8px 14px',
                  border: `1px dashed ${isDark ? 'rgba(94,234,212,0.25)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 2,
                }}
              >
                ▤ project shot — {project.title}
              </div>
            </div>
          </>
        )}

        {/* Scrim over real image */}
        {project.cover && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 32%, transparent 55%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        )}

        {/* Award badge */}
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

        {/* Hover stack chips */}
        <motion.div
          animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : -6 }}
          transition={{ duration: 0.28, ease: EASE }}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'flex-end',
          }}
        >
          {project.stack.map((s) => (
            <span
              key={s}
              style={{
                padding: '4px 10px',
                borderRadius: 2,
                background: 'color-mix(in oklab, var(--bg-0) 70%, transparent)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-strong)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.06em',
                color: 'var(--fg-0)',
              }}
            >
              {s}
            </span>
          ))}
        </motion.div>

        {/* Title overlay */}
        <div
          style={{
            position: 'absolute',
            left: 32,
            bottom: 32,
            right: 32,
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isHero
                ? 'clamp(48px, 7vw, 96px)'
                : 'clamp(32px, 4vw, 56px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              color: project.cover ? '#fff' : 'var(--fg-0)',
              textShadow: project.cover ? '0 2px 24px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            {project.title}
          </h3>
        </div>
      </div>

      {/* Meta below card */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span className="mono">{project.year}</span>
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="mono"
              style={{
                padding: '3px 8px',
                border: '1px solid var(--border)',
                borderRadius: 999,
                fontSize: 10,
                color: 'var(--fg-2)',
              }}
            >
              {tag}
            </span>
          ))}
          <span style={{ color: 'var(--fg-1)', fontSize: 15 }}>{project.subtitle}</span>
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
