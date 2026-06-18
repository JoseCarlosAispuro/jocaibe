'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { useViewport } from '@/app/hooks/useViewport'
import { openContactModal } from '@/app/helpers/contactModal'
import { EASE } from '@/app/helpers/constants'

const RIPPLES = [
  { delay: 0,   repeatDelay: 0.8 },
  { delay: 1.2, repeatDelay: 0.8 },
]

const FloatingAvailability = () => {
  const squareRef = useRef<HTMLSpanElement>(null)
  const velRef    = useRef(0)
  const angleRef  = useRef(0)
  const { reduce } = useViewport()

  // Feed Lenis scroll velocity into the square rotation
  useLenis(({ velocity }) => {
    velRef.current += velocity * 0.06
    velRef.current = Math.max(-28, Math.min(28, velRef.current))
  })

  useEffect(() => {
    if (reduce) return
    let raf = 0
    const loop = () => {
      angleRef.current += 0.22 + velRef.current
      velRef.current   *= 0.91
      if (squareRef.current) {
        squareRef.current.style.transform = `rotate(${angleRef.current}deg)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduce])

  return (
    <div className="fixed z-[60] pointer-events-none right-[clamp(18px,3.5vw,40px)] bottom-[clamp(18px,3.5vw,40px)]">

      {/* Square orb */}
      <motion.button
        onClick={openContactModal}
        aria-label="Available to start — get in touch"
        data-cursor="LET'S TALK"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.36, ease: EASE }}
        className="relative pointer-events-auto size-11 md:size-14 grid place-items-center"
      >
        {/* Rotating group — square + ripples all spin together */}
        <span
          ref={squareRef}
          className="absolute inset-0 will-change-transform"
        >
          {/* Ripple rings */}
          {RIPPLES.map(({ delay, repeatDelay }, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-[6px] bg-(--accent)"
              animate={{ scale: [1, 1.75], opacity: [0.2, 0] }}
              transition={{
                duration: 2.2,
                delay,
                repeat: Infinity,
                repeatDelay,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Core square */}
          <span className="absolute inset-0 rounded-[6px] bg-(--accent) shadow-[0_0_22px_6px_color-mix(in_oklab,var(--accent)_28%,transparent)]" />
        </span>

        {/* Inner dot — stays centered, outside rotating group */}
        <span className="relative size-[6px] rounded-[2px] bg-[color-mix(in_oklab,var(--bg-0)_55%,transparent)]" />
      </motion.button>
    </div>
  )
}

export default FloatingAvailability
