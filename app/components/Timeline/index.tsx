'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import { motion, AnimatePresence } from 'motion/react'
import { useViewport } from '@/app/hooks/useViewport'
import SectionHeading from '@/app/partials/SectionHeading'
import { openContactModal } from '@/app/helpers/contactModal'
import { EASE } from '@/app/helpers/constants'
import TimelineCurrent from './TimelineCurrent'
import TimelineNode from './TimelineNode'
import ArrowRight from '@/app/icons/ArrowRight'

export interface Role {
  company: string
  role: string
  period: string
  location: string
  bullets: string[]
  stack: string[]
}

export interface TimelineData {
  eyebrow: string
  titleMain: string
  titleMuted: string
  roles: Role[]
  current: {
    period: string
    label: string
  }
}

// Stagger variants for mobile content entrance
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemVariants = {
  hidden:   { opacity: 0, y: 16 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.36, ease: EASE } },
}

const Timeline = ({ data }: { data: TimelineData }) => {
  const { eyebrow, titleMain, titleMuted, roles, current } = { ...data }
  const { vh } = useViewport()
  const total = roles.length + 1 // roles + current

  // ── Desktop refs ─────────────────────────────────────────
  const wrapRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLSpanElement>(null)
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [lit, setLit] = useState<boolean[]>([])

  const desktopUpdate = useCallback(() => {
    const el = wrapRef.current
    if (!el || !fillRef.current) return
    const rect  = el.getBoundingClientRect()
    const vh    = window.innerHeight
    const start = vh * 0.78
    const span  = rect.height + start - vh * 0.4
    const fill  = Math.max(0, Math.min(1, (start - rect.top) / span)) * rect.height

    fillRef.current.style.height = Math.max(0, fill - 8) + 'px'
    if (headRef.current) headRef.current.style.opacity = fill > 10 ? '1' : '0'

    const next = dotRefs.current.map((d) => {
      if (!d) return false
      const dr = d.getBoundingClientRect()
      return (dr.top + dr.height / 2 - rect.top) <= fill + 2
    })
    setLit((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
    )
  }, [])

  // ── Mobile refs ──────────────────────────────────────────
  const mobileSectionRef = useRef<HTMLDivElement>(null)
  const mobileFillRef    = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Scroll progress through the mobile section → active index.
  // Dots sit at positions i/(total-1) of the track width, so rawStep uses
  // (total-1) as the multiplier — integer values land exactly on dot positions.
  // Math.round() picks whichever dot the fill head is nearest to, giving
  // precise, symmetric switching with no direction-dependent drift.
  const mobileUpdate = useCallback(() => {
    const section = mobileSectionRef.current
    if (!section) return
    const rect      = section.getBoundingClientRect()
    const scrolled  = Math.max(0, -rect.top)
    const totalRoom = Math.max(1, rect.height - window.innerHeight)
    const progress  = Math.min(1, scrolled / totalRoom)

    const next = Math.min(total - 1, Math.max(0, Math.round(progress * (total - 1))))
    setActiveIdx(next)

    if (mobileFillRef.current) {
      mobileFillRef.current.style.width = `${progress * 100}%`
    }
  }, [total])

  useLenis(() => { desktopUpdate(); mobileUpdate() })
  useEffect(() => { desktopUpdate(); mobileUpdate() }, [desktopUpdate, mobileUpdate])
  useEffect(() => { desktopUpdate(); mobileUpdate() }, [vh, desktopUpdate, mobileUpdate])

  return (
    <section id="timeline" className="relative">

      {/* ══════════════════════════════════════════
          MOBILE layout
          — tall section for scroll binding
          — heading + navigator + content all sticky
         ══════════════════════════════════════════ */}
      <div
        ref={mobileSectionRef}
        className="md:hidden"
        style={{ minHeight: `calc(180px + ${total * 80}vh)` }}
      >
        {/* Sticky block — heading, navigator and content all stick together */}
        <div className="sticky top-14 bg-(--bg-0) px-(--gutter) pt-8 pb-20">

          {/* Section heading */}
          <div className="mb-8">
            <SectionHeading
              lines={[
                { text: titleMain },
                ...(titleMuted ? [{ text: titleMuted, muted: true }] : []),
              ]}
            />
          </div>

          {/* Horizontal navigator — dots only, no labels */}
          <div className="relative mb-10">
            {/* Track */}
            <div className="absolute left-0 right-0 top-[6px] h-px bg-(--border-strong)" />
            {/* Fill */}
            <div
              ref={mobileFillRef}
              className="absolute left-0 top-[6px] h-px w-0 bg-[linear-gradient(90deg,var(--accent),var(--accent-soft))] shadow-[0_0_8px_var(--accent)]"
            />
            {/* Dots */}
            <div className="relative flex justify-between">
              {Array.from({ length: total }).map((_, i) => {
                const isActive  = i === activeIdx
                const isPast    = i < activeIdx
                const isCurrent = i === total - 1

                return (
                  <div key={i} className="flex items-center justify-center">
                    {isCurrent ? (
                      <motion.span
                        animate={{ scale: 1, opacity: isActive || isPast ? 1 : 0.35 }}
                        transition={{ duration: 0.32 }}
                        className="w-3 h-3 rounded-full bg-(--accent)"
                        style={{ boxShadow: isActive ? '0 0 10px 3px var(--accent)' : 'none' }}
                      />
                    ) : (
                      <motion.span
                        animate={{
                          background: isActive || isPast ? 'var(--accent)' : 'var(--bg-0)',
                          boxShadow: isActive
                            ? '0 0 0 4px var(--bg-0), 0 0 12px var(--accent)'
                            : '0 0 0 4px var(--bg-0)',
                        }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="w-3 h-3 rounded-full border-2 border-(--accent)"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active content — children animate in sequence on entry */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } }}
            >
              {activeIdx < roles.length ? (
                (() => {
                  const role = roles[activeIdx]
                  return (
                    <div className="text-center">
                      <motion.div variants={itemVariants} className="mono text-(--accent) text-[11px] mb-3">
                        {role.period}
                      </motion.div>
                      <motion.h3 variants={itemVariants} className="font-(--font-display) text-[clamp(36px,9vw,52px)] font-semibold tracking-[-0.03em] leading-[1.05] text-(--fg-0)">
                        {role.company}
                      </motion.h3>
                      <motion.div variants={itemVariants} className="text-[14px] text-(--fg-2) mt-2">
                        {role.role}
                      </motion.div>
                      <motion.div variants={itemVariants} className="mono text-(--fg-3) mt-1 text-[11px]">
                        {role.location}
                      </motion.div>

                      <motion.ul variants={itemVariants} className="flex flex-col gap-3 mt-7 text-left">
                        {role.bullets.map((bullet, j) => (
                          <li key={j} className="flex gap-3 text-[15px] text-(--fg-1) leading-[1.55]">
                            <span className="w-[14px] h-px mt-3 bg-(--fg-3) shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </motion.ul>

                      <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5 mt-6 justify-center">
                        {role.stack.map((tag) => (
                          <span
                            key={tag}
                            className="mono text-[10px] text-(--fg-2) px-2 py-1 border border-(--border) rounded-[4px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </motion.div>
                    </div>
                  )
                })()
              ) : (
                <div className="text-center">
                  <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-3">
                    <span className="w-3 h-3 rounded-full bg-(--accent) shrink-0" />
                    <div className="mono text-(--accent) text-[11px]">{current.period}</div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="font-(--font-display) text-[clamp(28px,7vw,40px)] text-(--fg-0) leading-[1.15]">
                    {current.label}
                  </motion.div>
                  <motion.div variants={itemVariants} className="mt-10">
                    <motion.button
                      onClick={openContactModal}
                      aria-label="Open contact form"
                      whileTap={{ scale: 0.96 }}
                      transition={{ scale: { duration: 0.18 } }}
                      className="inline-flex items-center gap-3 rounded-full bg-(--accent) text-(--bg-0) font-(--font-mono) text-[13px] tracking-[0.08em] uppercase font-medium px-7 py-5"
                    >
                      Get in touch
                      <ArrowRight />
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP layout — unchanged vertical timeline
         ══════════════════════════════════════════ */}
      <div className="hidden md:block py-(--s-section)">
        <div className="container mx-auto px-(--gutter)">
          <SectionHeading
            lines={[
              { text: titleMain },
              ...(titleMuted ? [{ text: titleMuted, muted: true }] : []),
            ]}
          />

          <div ref={wrapRef} className="relative mt-24">
            <div className="absolute top-2 bottom-2 w-px bg-(--border-strong) left-[clamp(20px,4vw,36px)]" />
            <div
              ref={fillRef}
              className="absolute top-2 w-0.5 -ml-px left-[clamp(20px,4vw,36px)] h-0 bg-[linear-gradient(180deg,var(--accent),var(--accent-soft))] shadow-[0_0_12px_var(--accent)] transition-[height] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            >
              <span
                ref={headRef}
                className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[7px] h-[7px] rounded-full bg-(--accent) opacity-0 transition-opacity duration-200 shadow-[0_0_12px_3px_var(--accent)]"
              />
            </div>

            {roles.map((role, i) => (
              <TimelineNode
                key={role.company}
                role={role}
                idx={i}
                lit={!!lit[i]}
                registerDot={(el) => { dotRefs.current[i] = el }}
              />
            ))}

            <TimelineCurrent
              period={current.period}
              label={current.label}
              lit={!!lit[roles.length]}
              registerDot={(el) => { dotRefs.current[roles.length] = el }}
            />
          </div>
        </div>
      </div>

    </section>
  )
}

export default Timeline
