'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import SectionHeading from '@/app/partials/SectionHeading'
import SkillsCloud from './SkillsCloud'

interface SkillGroup {
  cat: string
  items: string[]
}

function CalloutTag({ label }: { label: string }) {
  return (
    <motion.span
      className="mono"
      style={{
        padding: '6px 10px',
        borderRadius: 4,
        fontSize: 11,
        cursor: 'default',
        borderWidth: 1,
        borderStyle: 'solid',
      }}
      initial={{ color: 'var(--fg-1)', borderColor: 'var(--border-strong)', backgroundColor: 'rgba(217,240,74,0)' }}
      whileHover={{ color: 'var(--accent)', borderColor: 'var(--accent)', backgroundColor: 'rgba(217,240,74,0.12)' }}
      transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] }}
    >
      {label}
    </motion.span>
  )
}

function SkillsCallout() {
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
    <div style={{ marginTop: 96 }}>
      <motion.div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ borderColor: spot.on ? 'rgba(217,240,74,0.4)' : 'rgba(255,255,255,0.08)' }}
        transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(32px, 4vw, 56px)',
          background: 'var(--bg-1)',
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: 'solid',
        }}
      >
        <motion.div
          animate={{ opacity: spot.on ? 1 : 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 60%)`,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div style={{ gridColumn: 'span 1' }}>
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--accent)',
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: '2px solid var(--bg-0)',
                }}
              />
            </motion.span>
          </div>
          <div style={{ gridColumn: 'span 8' }}>
            <div className="mono" style={{ marginBottom: 8, color: 'var(--accent)' }}>
              Currently learning in production
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                color: 'var(--fg-0)',
              }}
            >
              AI-augmented frontend.
              <br />
              <span style={{ color: 'var(--fg-2)' }}>
                Claude Code &amp; Opencode in the daily workflow.
              </span>
            </h3>
          </div>
          <div
            style={{
              gridColumn: 'span 3',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'flex-end',
            }}
          >
            {['Claude Code', 'Opencode', 'MCP', 'Agent eval'].map((t) => (
              <CalloutTag key={t} label={t} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Skills({ data }: { data: SkillGroup[] }) {
  return (
    <section
      id="skills"
      className="py-(--s-section)"
      style={{ position: 'relative', borderTop: '1px solid var(--border)' }}
    >
      <div className="container">
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
