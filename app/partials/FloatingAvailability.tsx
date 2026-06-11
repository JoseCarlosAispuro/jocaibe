'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'

const HEARTBEAT_SCALE = [1, 1.45, 1, 1.28, 1, 1]
const HEARTBEAT_TIMES = [0, 0.11, 0.22, 0.33, 0.45, 1]

export default function FloatingAvailability() {
  const rotaterRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const hovRef = useRef(false)
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const size = 96

  useEffect(() => {
    let angle = 0, vel = 0, lastY = window.scrollY, raf = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onScroll = () => {
      const y = window.scrollY
      vel += (y - lastY) * 0.05
      lastY = y
      vel = Math.max(-24, Math.min(24, vel))
    }
    const loop = () => {
      const idle = hovRef.current ? 0.95 : 0.22
      angle += idle + vel
      vel *= 0.93
      if (rotaterRef.current) {
        rotaterRef.current.style.transform = `rotate(${angle}deg)`
      }
      raf = requestAnimationFrame(loop)
    }
    if (!reduce) {
      window.addEventListener('scroll', onScroll, { passive: true })
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

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
      style={{
        position: 'fixed',
        right: 'clamp(18px, 3.5vw, 40px)',
        bottom: 'clamp(18px, 3.5vw, 40px)',
        zIndex: 60,
        pointerEvents: 'none',
      }}
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
        style={{
          position: 'absolute',
          right: 0,
          bottom: 'calc(100% + 14px)',
          width: 296,
          transformOrigin: 'bottom right',
        }}
      >
        <a
          href="#contact"
          style={{
            display: 'block',
            position: 'relative',
            overflow: 'hidden',
            background: 'color-mix(in oklab, var(--bg-1) 88%, transparent)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-strong)',
            borderRadius: 16,
            padding: '20px 20px 18px',
            boxShadow: '0 26px 64px -22px rgba(0,0,0,0.75)',
          }}
        >
          {/* Sheen line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, overflow: 'hidden' }}>
            <motion.div
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            {/* Heartbeat dot */}
            <motion.span
              animate={{ scale: HEARTBEAT_SCALE }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                times: HEARTBEAT_TIMES,
              }}
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--success)',
              }}
            />
            <span className="mono" style={{ color: 'var(--success)', whiteSpace: 'nowrap' }}>
              Available now
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 21,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.22,
              color: 'var(--fg-0)',
            }}
          >
            Ready to start your next build — let&rsquo;s make something worth
            shipping.
          </div>
          <span
            className="mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
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
        style={{
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          width: size,
          height: size,
          pointerEvents: 'auto',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'color-mix(in oklab, var(--bg-1) 64%, transparent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
          }}
        />
        <div
          ref={rotaterRef}
          style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
        >
          <svg
            viewBox="0 0 100 100"
            width={size}
            height={size}
            style={{ display: 'block' }}
          >
            <defs>
              <path
                id="jcAvailRing"
                d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
              />
            </defs>
            <motion.text
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '0.12em',
              }}
              animate={{ fill: hover ? 'var(--accent)' : 'var(--fg-2)' }}
              transition={{ duration: 0.3 }}
            >
              <textPath href="#jcAvailRing" startOffset="0">
                {ring}
              </textPath>
            </motion.text>
          </svg>
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 16,
              height: 16,
              marginTop: -8,
              marginLeft: -8,
              background: 'var(--accent)',
              borderRadius: 3,
              boxShadow: '0 0 18px 2px var(--accent)',
            }}
          />
        </div>
      </motion.a>
    </div>
  )
}
