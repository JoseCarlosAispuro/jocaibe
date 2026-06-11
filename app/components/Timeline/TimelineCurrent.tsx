'use client'

import { motion } from 'motion/react'
import { reveal } from '@/app/hooks/useReveal'

const HEARTBEAT_SCALE = [1, 1.45, 1, 1.28, 1, 1]
const HEARTBEAT_TIMES = [0, 0.11, 0.22, 0.33, 0.45, 1]

const TimelineCurrent = ({
  period,
  label,
  lit,
  registerDot,
}: {
  period: string
  label: string
  lit: boolean
  registerDot: (el: HTMLSpanElement | null) => void
}) => {
  return (
    <motion.div
      {...reveal(200)}
      className="grid pt-12 relative"
      style={{ gridTemplateColumns: 'clamp(40px,8vw,72px) 1fr', gap: 'clamp(24px,4vw,64px)' }}
    >
      <div className="relative">
        <motion.span
          ref={registerDot}
          suppressHydrationWarning
          animate={
            lit
              ? { scale: HEARTBEAT_SCALE, opacity: 1 }
              : { scale: 1, opacity: 0.4 }
          }
          transition={
            lit
              ? {
                  scale: {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: HEARTBEAT_TIMES,
                  },
                  opacity: { duration: 0.32 },
                }
              : { duration: 0.32 }
          }
          className="absolute top-2 w-4 h-4 rounded-full bg-(--accent) outline-[6px] outline-solid outline-(--bg-0)"
          style={{
            left: 'calc(clamp(20px, 4vw, 36px) - 8px)',
            boxShadow: lit ? '0 0 12px 3px var(--accent)' : 'none',
          }}
        />
      </div>
      <div>
        <div className="mono text-(--accent)">{period}</div>
        <div className="text-[20px] [font-family:var(--font-display)] text-(--fg-0) mt-1">{label}</div>
      </div>
    </motion.div>
  )
}

export default TimelineCurrent
