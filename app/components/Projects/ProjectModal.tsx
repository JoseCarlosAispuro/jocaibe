'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import MediaCarousel from './MediaCarousel'
import VideoEl from './VideoEl'
import Close from '@/app/icons/Close'
import ExternalLink from '@/app/icons/ExternalLink'
import ChevronLeft from '@/app/icons/ChevronLeft'
import ChevronRight from '@/app/icons/ChevronRight'
import { assetUrl } from '@/app/helpers/assets'
import { EASE } from '@/app/helpers/constants'
import type { Project } from '@/app/types/project'

const isVideo = (src: string) => /\.(mp4|webm|ogg)$/i.test(src)

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

// ── Mobile-only hero slider ─────────────────────────────────────────────────
interface MobileHeroSliderProps {
  items: string[]
  bg: string
  page: number
  dir: number
  onPaginate: (dir: number) => void
}

const MobileHeroSlider = ({ items, bg, page, dir, onPaginate }: MobileHeroSliderProps) => {
  if (items.length === 0) {
    return <div className="absolute inset-0" style={{ background: bg }} />
  }

  return (
    <div className="absolute inset-0" style={{ background: bg }}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={page}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.36, ease: EASE }}
          className="absolute inset-0"
        >
          {isVideo(items[page]) ? (
            <VideoEl src={items[page]} className="w-full h-full object-cover" />
          ) : (
            <img
              src={assetUrl(items[page])}
              alt={`Slide ${page + 1} of ${items.length}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <>
          <button
            onClick={() => onPaginate(-1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80"
          >
            <ChevronLeft size={11} />
          </button>
          <button
            onClick={() => onPaginate(1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80"
          >
            <ChevronRight size={11} />
          </button>
        </>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────

const MetaRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div>
    <div className="mono mb-[6px]">{label}</div>
    {href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-(--border) text-[16px] text-(--fg-0) transition-colors duration-[180ms] hover:border-(--accent) hover:text-(--accent)"
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
  const [expanded, setExpanded] = useState(false)

  const heroMedia = [
    ...(project.video ? [project.video] : project.cover ? [project.cover] : []),
    ...(project.shots ?? []),
  ]
  const heroCount = heroMedia.length
  const [[heroPage, heroDir], setHeroPage] = useState([0, 0])
  const paginateHero = (newDir: number) =>
    setHeroPage(([curr]) => [(curr + newDir + heroCount) % heroCount, newDir])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
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
      aria-label={`${project.title} project details`}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'linear' }}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-0 py-0 backdrop-blur-[16px] bg-[color-mix(in_oklab,var(--bg-0)_82%,transparent)] md:px-[clamp(16px,4vw,48px)] md:py-[clamp(24px,6vh,64px)]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100vh' }}
        animate={{ y: 0 }}
        exit={{ y: '100vh' }}
        transition={{ duration: 0.46, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1100px] min-h-screen overflow-hidden bg-(--bg-1) will-change-transform md:min-h-0 md:rounded-lg md:border md:border-(--border)"
      >

        {/* ── Mobile hero slider ──────────────────────────────────────── */}
        <div className="relative aspect-[4/3] md:hidden" style={{ background: project.bg }}>
          <MobileHeroSlider
            items={heroMedia}
            bg={project.bg}
            page={heroPage}
            dir={heroDir}
            onPaginate={paginateHero}
          />
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(170deg,rgba(0,0,0,0.0)_0%,transparent_40%,rgba(0,0,0,0.80)_100%)]" />
          <button
            onClick={onClose}
            aria-label="Close project"
            className="absolute right-4 top-4 z-30 flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white/80 backdrop-blur-[8px]"
          >
            <Close size={12} />
          </button>
          <div className="absolute bottom-5 left-5 right-5 z-20">
            {project.award && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-[2px] border border-white/20 bg-black/50 px-[10px] py-[5px] backdrop-blur-[6px]">
                <span
                  className="size-[6px] rounded-full"
                  style={{ background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)' }}
                />
                <span className="mono text-[10px] text-white/90">{project.award.label}</span>
              </div>
            )}
            <h2
              className="font-(--font-display) text-[clamp(28px,8vw,48px)] font-medium tracking-[-0.03em] leading-[0.95] text-white"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.8)' }}
            >
              {project.title}
            </h2>
          </div>
        </div>

        {/* ── Desktop hero static ─────────────────────────────────────── */}
        <div className="relative hidden aspect-[21/9] md:block" style={{ background: project.bg }}>
          {project.video ? (
            <VideoEl src={project.video} className="absolute inset-0 w-full h-full object-cover" />
          ) : project.cover ? (
            <img
              src={assetUrl(project.cover)}
              alt={project.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_24px)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(170deg,rgba(0,0,0,0.18)_0%,transparent_38%,rgba(0,0,0,0.72)_100%)]" />
          <button
            onClick={onClose}
            aria-label="Close project"
            className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white/80 backdrop-blur-[8px] transition-colors duration-[160ms] hover:bg-black/70 hover:text-white"
          >
            <Close size={13} />
          </button>
          <div className="absolute bottom-10 left-10 right-16">
            {project.award && (
              <div className="mb-5 inline-flex items-center gap-2 rounded-[2px] border border-white/20 bg-black/50 px-[10px] py-[6px] backdrop-blur-[6px]">
                <span
                  className="size-2 rounded-full"
                  style={{ background: project.award.tier === 'SOTD' ? 'var(--accent)' : 'var(--highlight)' }}
                />
                <span className="mono text-[10px] text-white/90">{project.award.label}</span>
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

        {/* ── Mobile slider dots ──────────────────────────────────────── */}
        {heroCount > 1 && (
          <div className="flex items-center justify-between gap-4 border-b border-(--border) px-5 py-4 md:hidden">
            <div className="flex items-center gap-[6px]" role="group" aria-label="Slide navigation">
              {heroMedia.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroPage([i, i > heroPage ? 1 : -1])}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === heroPage ? 'true' : undefined}
                  className={`rounded-full transition-all duration-[240ms] ${
                    i === heroPage
                      ? 'w-5 h-[3px] bg-(--accent)'
                      : 'w-[8px] h-[8px] bg-(--fg-4)'
                  }`}
                />
              ))}
            </div>
            <span className="mono text-[10px] text-(--fg-3)">
              {String(heroPage + 1).padStart(2, '0')} / {String(heroCount).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="p-[clamp(20px,4vw,56px)]">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">

            {/* Left col */}
            <div className="md:col-span-7">
              <div>
                <p className={`text-[17px] leading-[1.55] text-(--fg-0) transition-none md:text-[19px] ${expanded ? '' : 'max-md:line-clamp-4'}`}>
                  {project.summary}
                </p>
                {!expanded && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="mt-2 mono text-[11px] tracking-[0.08em] text-(--accent) md:hidden"
                  >
                    READ MORE ↓
                  </button>
                )}
              </div>
              <div className="mt-10 hidden md:block">
                {media.length > 0 ? (
                  <MediaCarousel items={media} title={project.title} />
                ) : (
                  <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded border border-(--border) bg-(--bg-2)">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_18px)]" />
                    <span className="mono text-(--fg-3)">▤ in-context screenshot</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right col — meta */}
            <div className="md:col-span-5">
              <div className="flex flex-col gap-8">
                <MetaRow label="Role" value={project.role} />
                <MetaRow label="Year" value={project.year} />
                <MetaRow label="URL" value={project.url} href={`https://${project.url}`} />

                <div>
                  <div className="mono mb-[14px]">Impact</div>
                  <div className="grid grid-cols-3 gap-px overflow-hidden rounded border border-(--border) bg-(--border)">
                    {project.impact.map(([num, label]) => (
                      <div key={label} className="bg-(--bg-1) px-3 py-4">
                        <div className="font-(--font-display) text-[22px] font-medium tracking-[-0.02em] leading-none text-(--fg-0) md:text-[26px]">
                          {num}
                        </div>
                        <div className="mono mt-[6px] text-[10px] text-(--fg-2)">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mono mb-[14px]">Stack</div>
                  <div className="flex flex-wrap gap-[6px]">
                    {project.stack.map((s) => (
                      <span
                        key={s}
                        className="mono rounded border border-(--border) px-[10px] py-[6px] text-[11px] text-(--fg-1)"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

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
                          className="group flex items-center justify-between gap-4 border-b border-(--border) py-[10px] text-[14px] text-(--fg-0) transition-colors duration-[180ms] hover:text-(--accent)"
                        >
                          <span>{label}</span>
                          <span className="shrink-0 text-(--fg-3) transition-colors duration-[180ms] group-hover:text-(--accent) inline-flex">
                            <ExternalLink />
                          </span>
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
