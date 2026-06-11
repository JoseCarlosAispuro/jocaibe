'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { Project } from '@/app/types/project'

function Meta({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <div className="mono" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, color: 'var(--fg-0)' }}>
        {link ? (
          <a href="#" style={{ borderBottom: '1px solid var(--fg-3)' }}>
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

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'color-mix(in oklab, var(--bg-0) 80%, transparent)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(24px, 6vh, 64px) clamp(16px, 4vw, 48px)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100vh' }}
        animate={{ y: 0 }}
        exit={{ y: '100vh' }}
        transition={{ duration: 0.46, ease: [0.2, 0.7, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 1100,
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          willChange: 'transform',
        }}
      >
        {/* Hero image */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '21 / 9',
            background: project.bg,
          }}
        >
          {project.cover ? (
            <>
              <img
                src={project.cover}
                alt={project.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)',
                }}
              />
            </>
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 24px)',
              }}
            />
          )}

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid var(--border-strong)',
              background: 'color-mix(in oklab, var(--bg-0) 70%, transparent)',
              backdropFilter: 'blur(8px)',
              color: 'var(--fg-0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          <div style={{ position: 'absolute', left: 40, bottom: 40, right: 40 }}>
            {project.award && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 2,
                  marginBottom: 20,
                  background: 'color-mix(in oklab, var(--bg-0) 70%, transparent)',
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
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: 'var(--fg-0)',
              }}
            >
              {project.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(32px, 4vw, 56px)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 32,
            }}
          >
            {/* Left */}
            <div style={{ gridColumn: 'span 7' }}>
              <p
                style={{
                  fontSize: 20,
                  lineHeight: 1.45,
                  color: 'var(--fg-0)',
                }}
              >
                {project.summary}
              </p>

              {project.shots && project.shots.length > 0 ? (
                <div
                  style={{
                    marginTop: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  {project.shots.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: '16/9',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-2)',
                      }}
                    >
                      <img
                        src={src}
                        alt={`${project.title} screenshot ${i + 1}`}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 40,
                    aspectRatio: '16/9',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 18px)',
                    }}
                  />
                  <span className="mono">▤ in-context screenshot</span>
                </div>
              )}
            </div>

            {/* Right */}
            <div style={{ gridColumn: 'span 5' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <Meta label="Role" value={project.role} />
                <Meta label="Year" value={project.year} />
                <Meta label="URL" value={project.url} link />

                <div>
                  <span className="mono">Impact</span>
                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 1,
                      background: 'var(--border)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {project.impact.map(([num, label]) => (
                      <div
                        key={label}
                        style={{
                          background: 'var(--bg-1)',
                          padding: '16px 12px',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 28,
                            fontWeight: 500,
                            color: 'var(--fg-0)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                          }}
                        >
                          {num}
                        </div>
                        <div className="mono" style={{ marginTop: 8, fontSize: 10 }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mono">Stack</span>
                  <div
                    style={{
                      marginTop: 14,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {project.stack.map((s) => (
                      <span
                        key={s}
                        className="mono"
                        style={{
                          padding: '6px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          color: 'var(--fg-1)',
                          fontSize: 11,
                        }}
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
