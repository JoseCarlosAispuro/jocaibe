'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

interface SectionHeadingProps {
  lines: { text: string; muted?: boolean }[]
  right?: React.ReactNode
}

// The overflow:hidden clip parent interferes with whileInView's IntersectionObserver
// when the inner element starts translated 92px outside the clip boundary.
// Fix: observe the OUTER (clip) span with useInView, drive inner animation via animate.
const HeadingLine = ({ text, muted, delay }: { text: string; muted?: boolean; delay: number }) => {
  const outerRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(outerRef, { once: true, margin: '0px 0px -5% 0px' })

  return (
    <span ref={outerRef} className="block overflow-hidden pb-[0.08em]">
      <motion.span
        initial={{ opacity: 0, y: 92 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 92 }}
        transition={{
          duration: 0.72,
          ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number],
          delay: delay / 1000,
        }}
        className={`block${muted ? ' text-(--fg-2)' : ''}`}
      >
        {text}
      </motion.span>
    </span>
  )
}

const SectionHeading = ({ lines, right }: SectionHeadingProps) => {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-8 items-baseline">
      <h2 className="col-span-10 font-(--font-display) [font-size:var(--fs-h1)] font-medium tracking-[-0.03em] leading-none text-(--fg-0)">
        {lines.map((ln, i) => (
          <HeadingLine key={i} text={ln.text} muted={ln.muted} delay={i * 130} />
        ))}
      </h2>
      {right && (
        <div className="col-span-2 text-right">{right}</div>
      )}
    </div>
  )
}

export default SectionHeading
