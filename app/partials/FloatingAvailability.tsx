'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { useViewport } from '@/app/hooks/useViewport'

const HEARTBEAT_SCALE = [1, 1.45, 1, 1.28, 1, 1]
const HEARTBEAT_TIMES = [0, 0.11, 0.22, 0.33, 0.45, 1]

const FloatingAvailability = () => {
  const rotaterRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const hovRef = useRef(false)
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const velRef = useRef(0)
  const { reduce } = useViewport()

  // Feed Lenis velocity into the rotation badge — smoothed scroll, no jank
  useLenis(({ velocity }) => {
    velRef.current += velocity * 0.05
    velRef.current = Math.max(-24, Math.min(24, velRef.current))
  })

  useEffect(() => {
    let angle = 0, raf = 0

    const loop = () => {
      const idle = hovRef.current ? 0.95 : 0.22
      angle += idle + velRef.current
      velRef.current *= 0.93
      if (rotaterRef.current) {
        rotaterRef.current.style.transform = `rotate(${angle}deg)`
      }
      raf = requestAnimationFrame(loop)
    }
    if (!reduce) {
      raf = requestAnimationFrame(loop)
    }
    return () => cancelAnimationFrame(raf)
  }, [reduce])

  const open = () => {
    if (closeT.current) clearTimeout(closeT.current)
    hovRef.current = true
    setHover(true)
  }
  const close = () => {
    closeT.current = setTimeout(() => {
      hovRef.current = false
      setHover(false)
    }, 130)
  }

  const ring = 'AVAILABLE TO START   ·   OPEN FOR WORK   ·   '

  return (
    <div
      className="fixed z-[60] pointer-events-none right-[clamp(18px,3.5vw,40px)] bottom-[clamp(18px,3.5vw,40px)]"
    >
      {/* Card */}
      <motion.div
        onMouseEnter={open}
        onMouseLeave={close}
        animate={{
          opacity: hover ? 1 : 0,
          y: hover ? 0 : 12,
          scale: hover ? 1 : 0.95,
          pointerEvents: hover ? 'auto' : 'none',
        }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        className="absolute right-0 w-[296px] origin-bottom-right bottom-[calc(100%+14px)]"
      >
        <a
          href="#contact"
          className="block relative overflow-hidden border border-(--border-strong) rounded-2xl backdrop-blur-[16px] pt-5 px-5 pb-[18px] shadow-[0_26px_64px_-22px_rgba(0,0,0,0.75)] bg-[color-mix(in_oklab,var(--bg-1)_88%,transparent)]"
        >
          {/* Sheen line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
            <motion.div
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]"
            />
          </div>

          <div className="flex items-center gap-2 mb-[14px]">
            {/* Heartbeat dot */}
            <motion.span
              animate={{ scale: HEARTBEAT_SCALE }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                times: HEARTBEAT_TIMES,
              }}
              className="inline-block size-2 rounded-full bg-(--success)"
            />
            <span className="mono text-(--success) whitespace-nowrap">
              Available now
            </span>
          </div>
          <div className="font-(--font-display) text-[21px] font-medium tracking-[-0.02em] leading-[1.22] text-(--fg-0)">
            Ready to start your next build — let&rsquo;s make something worth
            shipping.
          </div>
          <span className="mono inline-flex items-center gap-2 mt-4 text-(--accent) whitespace-nowrap">
            Start a conversation
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
            </svg>
          </span>
        </a>
      </motion.div>

      {/* Rotating badge */}
      <motion.a
        href="#contact"
        aria-label="Available to start — get in touch"
        onMouseEnter={open}
        onMouseLeave={close}
        animate={{ scale: hover ? 1.06 : 1 }}
        transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative grid place-items-center pointer-events-auto w-24 h-24"
      >
        <span
          className="absolute inset-0 rounded-full border border-(--border) backdrop-blur-[8px] bg-[color-mix(in_oklab,var(--bg-1)_64%,transparent)]"
        />
        <div ref={rotaterRef} className="absolute inset-0 will-change-transform">
          <svg
            viewBox="0 0 100 100"
            width={96}
            height={96}
            className="block"
          >
            <defs>
              <path
                id="jcAvailRing"
                d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
              />
            </defs>
            <motion.text
              className="font-(--font-mono) text-[8px] tracking-[0.12em]"
              animate={{ fill: hover ? 'var(--accent)' : 'var(--fg-2)' }}
              transition={{ duration: 0.3 }}
            >
              <textPath href="#jcAvailRing" startOffset="0">
                {ring}
              </textPath>
            </motion.text>
          </svg>
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-[3px] bg-(--accent) shadow-[0_0_18px_2px_var(--accent)]"
          />
        </div>
      </motion.a>
    </div>
  )
}

export default FloatingAvailability
