'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import MediaCarousel from './MediaCarousel'
import type { Project } from '@/app/types/project'

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number]

const MetaRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div>
    <div className="mono mb-[6px]">{label}</div>
    {href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[16px] text-(--fg-0) border-b border-(--border) hover:border-(--accent) hover:text-(--accent) transition-colors duration-[180ms]"
      >
        {value} ↗
      </a>
    ) : (
      <div className="text-[16px] text-(--fg-0)">{value}</div>
    )}
  </div>
)

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const media = project.shots ?? []

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'linear' }}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto backdrop-blur-[16px] py-[clamp(24px,6vh,64px)] px-[clamp(16px,4vw,48px)] bg-[color-mix(in_oklab,var(--bg-0)_82%,transparent)]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100vh' }}
        animate={{ y: 0 }}
        exit={{ y: '100vh' }}
        transition={{ duration: 0.46, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1100px] bg-(--bg-1) border border-(--border) rounded-lg overflow-hidden will-change-transform"
      >
        {/* Hero */}
        <div className="relative aspect-[21/9]" style={{ background: project.bg }}>
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
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_24px)]" />
          )}

          {/* Strong gradient overlay — ensures title readability over any image */}
          <div className="absolute inset-0 bg-[linear-gradient(170deg,rgba(0,0,0,0.18)_0%,transparent_38%,rgba(0,0,0,0.72)_100%)]" />

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 z-10 size-10 rounded-full border border-white/25 text-white/80 flex items-center justify-center backdrop-blur-[8px] bg-black/50 hover:bg-black/70 hover:text-white transition-colors duration-[160ms]"
          >
            <svg width="13" height="13" viewBox="0 0 14 14">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Title area */}
          <div className="absolute left-10 bottom-10 right-16">
            {project.award && (
              <div className="inline-flex items-center gap-2 px-[10px] py-[6px] border border-white/20 rounded-[2px] mb-5 bg-black/50 backdrop-blur-[6px]">
                <span
                  className="size-2 rounded-full"
                  style={{ background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)' }}
                />
                <span className="mono text-white/90 text-[10px]">{project.award.label}</span>
              </div>
            )}
            <h2
              className="font-(--font-display) text-[clamp(40px,6vw,72px)] font-medium tracking-[-0.03em] leading-[0.95] text-white"
              style={{ textShadow: '0 2px 32px rgba(0,0,0,0.7)' }}
            >
              {project.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-[clamp(32px,4vw,56px)]">
          <div className="grid grid-cols-12 gap-8">

            {/* Left col — summary + media */}
            <div className="col-span-7">
              <p className="text-[19px] leading-[1.55] text-(--fg-0)">
                {project.summary}
              </p>

              <div className="mt-10">
                {media.length > 0 ? (
                  <MediaCarousel items={media} title={project.title} />
                ) : (
                  <div className="aspect-[16/9] bg-(--bg-2) border border-(--border) rounded flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_18px)]" />
                    <span className="mono text-(--fg-3)">▤ in-context screenshot</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right col — meta */}
            <div className="col-span-5">
              <div className="flex flex-col gap-8">
                <MetaRow label="Role" value={project.role} />
                <MetaRow label="Year" value={project.year} />
                <MetaRow label="URL" value={project.url} href={`https://${project.url}`} />

                {/* Impact stats */}
                <div>
                  <div className="mono mb-[14px]">Impact</div>
                  <div className="grid grid-cols-3 gap-px bg-(--border) border border-(--border) rounded overflow-hidden">
                    {project.impact.map(([num, label]) => (
                      <div key={label} className="bg-(--bg-1) px-3 py-4">
                        <div className="font-(--font-display) text-[26px] font-medium text-(--fg-0) tracking-[-0.02em] leading-none">
                          {num}
                        </div>
                        <div className="mono mt-[6px] text-[10px] text-(--fg-2)">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stack */}
                <div>
                  <div className="mono mb-[14px]">Stack</div>
                  <div className="flex flex-wrap gap-[6px]">
                    {project.stack.map((s) => (
                      <span
                        key={s}
                        className="mono px-[10px] py-[6px] border border-(--border) rounded text-[11px] text-(--fg-1)"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links / resources — shown only when present */}
                {project.links && project.links.length > 0 && (
                  <div>
                    <div className="mono mb-[14px]">Resources</div>
                    <div className="flex flex-col gap-[10px]">
                      {project.links.map(({ label, url }) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-4 py-[10px] border-b border-(--border) text-[14px] text-(--fg-0) hover:text-(--accent) group transition-colors duration-[180ms]"
                        >
                          <span>{label}</span>
                          <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                            className="text-(--fg-3) group-hover:text-(--accent) transition-colors duration-[180ms] shrink-0"
                          >
                            <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProjectModal
