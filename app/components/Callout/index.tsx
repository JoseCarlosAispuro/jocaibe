'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { EASE } from '@/app/helpers/constants'

export interface CalloutData {
  label: string
  heading: string
  subheading: string
  tags: string[]
}

const CalloutTag = ({ label }: { label: string }) => (
  <motion.span
    className="mono px-[10px] py-[6px] rounded text-[11px] cursor-default border"
    initial={{ color: 'var(--fg-1)', borderColor: 'var(--border-strong)', backgroundColor: 'rgba(217,240,74,0)' }}
    whileHover={{ color: 'var(--accent)', borderColor: 'var(--accent)', backgroundColor: 'rgba(217,240,74,0.12)' }}
    transition={{ duration: 0.2, ease: EASE }}
  >
    {label}
  </motion.span>
)

const Callout = ({ data }: { data: CalloutData }) => {
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
    <section
      id="callout"
      className="py-(--s-section) relative"
    >
      <div className="container mx-auto px-(--gutter)">
        <motion.div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          animate={{ borderColor: spot.on ? 'rgba(217,240,74,0.4)' : 'rgba(255,255,255,0.08)' }}
          transition={{ duration: 0.32, ease: EASE }}
          className="relative overflow-hidden rounded-lg border bg-(--bg-1) p-[clamp(32px,4vw,56px)]"
        >
          <motion.div
            animate={{ opacity: spot.on ? 1 : 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 60%)`,
            }}
          />

          <div className="relative z-[1] grid grid-cols-[auto_1fr] md:grid-cols-12 gap-6 md:gap-8 items-center">
            <div className="md:col-span-1">
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

            <div className="col-span-full md:col-span-8">
              <div className="mono mb-2 text-(--accent)">{data.label}</div>
              <h3 className="font-(--font-display) text-[clamp(20px,3vw,36px)] font-medium tracking-[-0.02em] leading-[1.15] text-(--fg-0)">
                {data.heading}
                <br />
                <span className="text-(--fg-2)">{data.subheading}</span>
              </h3>
            </div>

            <div className="col-span-full md:col-span-3 flex flex-wrap gap-[6px] md:justify-end">
              {data.tags.map((t) => (
                <CalloutTag key={t} label={t} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Callout
