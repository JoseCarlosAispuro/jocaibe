'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import SectionHeading from '@/app/partials/SectionHeading'
import SkillsCloud from './SkillsCloud'

interface SkillGroup {
  cat: string
  items: string[]
}

const CalloutTag = ({ label }: { label: string }) => {
  return (
    <motion.span
      className="mono px-[10px] py-[6px] rounded text-[11px] cursor-default border"
      initial={{ color: 'var(--fg-1)', borderColor: 'var(--border-strong)', backgroundColor: 'rgba(217,240,74,0)' }}
      whileHover={{ color: 'var(--accent)', borderColor: 'var(--accent)', backgroundColor: 'rgba(217,240,74,0.12)' }}
      transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] }}
    >
      {label}
    </motion.span>
  )
}

const SkillsCallout = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false })

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    })
  }
  const onLeave = () => setSpot((s) => ({ ...s, on: false }))

  return (
    <div className="mt-24">
      <motion.div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ borderColor: spot.on ? 'rgba(217,240,74,0.4)' : 'rgba(255,255,255,0.08)' }}
        transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] }}
        className="relative overflow-hidden rounded-lg border bg-(--bg-1) p-[clamp(32px,4vw,56px)]"
      >
        <motion.div
          animate={{ opacity: spot.on ? 1 : 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 60%)`,
          }}
        />

        <div className="relative z-[1] grid grid-cols-12 gap-8 items-center">
          <div className="col-span-1">
            {/* Accent glow pulsing icon */}
            <motion.span
              animate={{
                boxShadow: [
                  '0 0 18px 0px rgba(217,240,74,0.55)',
                  '0 0 34px 5px rgba(217,240,74,0.9)',
                  '0 0 18px 0px rgba(217,240,74,0.55)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center size-11 rounded-[10px] bg-(--accent)"
            >
              <span className="size-[14px] rounded-[3px] border-2 border-(--bg-0)" />
            </motion.span>
          </div>
          <div className="col-span-8">
            <div className="mono mb-2 text-(--accent)">
              Currently learning in production
            </div>
            <h3 className="font-(--font-display) text-[clamp(24px,3vw,36px)] font-medium tracking-[-0.02em] leading-[1.15] text-(--fg-0)">
              AI-augmented frontend.
              <br />
              <span className="text-(--fg-2)">
                Claude Code &amp; Opencode in the daily workflow.
              </span>
            </h3>
          </div>
          <div className="col-span-3 flex flex-wrap gap-[6px] justify-end">
            {['Claude Code', 'Opencode', 'MCP', 'Agent eval'].map((t) => (
              <CalloutTag key={t} label={t} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const Skills = ({ data }: { data: SkillGroup[] }) => {
  return (
    <section
      id="skills"
      className="py-(--s-section) relative border-t border-(--border)"
    >
      <div className="container mx-auto px-(--gutter)">
        <SectionHeading
          lines={[
            { text: "What I'm sharp on," },
            { text: 'top to bottom.', muted: true },
          ]}
        />
        <SkillsCloud groups={data} />
        <SkillsCallout />
      </div>
    </section>
  )
}

export default Skills
