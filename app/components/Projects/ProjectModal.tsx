'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { Project } from '@/app/types/project'

const Meta = ({ label, value, link }: { label: string; value: string; link?: boolean }) => {
  return (
    <div>
      <div className="mono mb-1">{label}</div>
      <div className="text-[16px] text-(--fg-0)">
        {link ? (
          <a href="#" className="border-b border-(--fg-3)">
            {value} ↗
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  )
}

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

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'linear' }}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto backdrop-blur-[16px] py-[clamp(24px,6vh,64px)] px-[clamp(16px,4vw,48px)] bg-[color-mix(in_oklab,var(--bg-0)_80%,transparent)]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100vh' }}
        animate={{ y: 0 }}
        exit={{ y: '100vh' }}
        transition={{ duration: 0.46, ease: [0.2, 0.7, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1100px] bg-(--bg-1) border border-(--border) rounded-lg overflow-hidden will-change-transform"
      >
        {/* Hero image */}
        <div
          className="relative aspect-[21/9]"
          style={{ background: project.bg }}
        >
          {project.cover ? (
            <>
              <img
                src={project.cover}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_24px)]" />
          )}

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 size-10 rounded-full border border-(--border-strong) text-(--fg-0) flex items-center justify-center backdrop-blur-[8px] bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          <div className="absolute left-10 bottom-10 right-10">
            {project.award && (
              <div className="inline-flex items-center gap-2 px-[10px] py-[6px] border border-(--border-strong) rounded-[2px] mb-5 bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)]">
                <span
                  className="size-2 rounded-full"
                  style={{
                    background:
                      project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)',
                  }}
                />
                <span className="mono text-(--fg-0) text-[10px]">
                  {project.award.label}
                </span>
              </div>
            )}
            <h2 className="[font-family:var(--font-display)] text-[clamp(40px,6vw,72px)] font-medium tracking-[-0.03em] leading-[0.95] text-(--fg-0)">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-[clamp(32px,4vw,56px)]">
          <div className="grid grid-cols-12 gap-8">
            {/* Left */}
            <div className="col-span-7">
              <p className="text-[20px] leading-[1.45] text-(--fg-0)">
                {project.summary}
              </p>

              {project.shots && project.shots.length > 0 ? (
                <div className="mt-10 flex flex-col gap-4">
                  {project.shots.map((src, i) => (
                    <div
                      key={i}
                      className="aspect-[16/9] rounded border border-(--border) bg-(--bg-2) overflow-hidden"
                    >
                      <img
                        src={src}
                        alt={`${project.title} screenshot ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 aspect-[16/9] bg-(--bg-2) border border-(--border) rounded flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_18px)]" />
                  <span className="mono">▤ in-context screenshot</span>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="col-span-5">
              <div className="flex flex-col gap-8">
                <Meta label="Role" value={project.role} />
                <Meta label="Year" value={project.year} />
                <Meta label="URL" value={project.url} link />

                <div>
                  <span className="mono">Impact</span>
                  <div className="mt-[14px] grid grid-cols-3 gap-px bg-(--border) border border-(--border)">
                    {project.impact.map(([num, label]) => (
                      <div key={label} className="bg-(--bg-1) px-3 py-4">
                        <div className="[font-family:var(--font-display)] text-[28px] font-medium text-(--fg-0) tracking-[-0.02em] leading-none">
                          {num}
                        </div>
                        <div className="mono mt-2 text-[10px]">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mono">Stack</span>
                  <div className="mt-[14px] flex flex-wrap gap-[6px]">
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
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProjectModal
