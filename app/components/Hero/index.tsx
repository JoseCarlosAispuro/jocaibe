'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { initHeroShader } from '@/app/helpers/heroShader'
import { reveal } from '@/app/hooks/useReveal'
import { useMagnetic } from '@/app/hooks/useMagnetic'
import KineticHeadline from './KineticHeadline'
import Button from '@/app/partials/Button'

export interface HeroData {
  headline: {
    line1: string
    line2_muted: string
    line2_accent: string
  }
  meta: string
  copy: {
    before: string
    highlight: string
    after: string
  }
  cta: { label: string; href: string }
  scrollLabel: string
}

interface HeroProps {
  data: HeroData
  available: boolean
  availableLabel: string
}

const Hero = ({ data }: HeroProps) => {
  const { headline, meta, copy, cta, scrollLabel } = data
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { ref: magnetRef, style: magnetStyle } = useMagnetic(0.4)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return initHeroShader(canvas, { mode: 'constellation' })
  }, [])

  // Mouse parallax: content drifts AWAY from cursor + idle organic float
  useEffect(() => {
    const sec = sectionRef.current
    const content = contentRef.current
    if (!sec || !content) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const head = content.querySelector<HTMLElement>('[data-parallax-head]')
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0

    const onMove = (e: MouseEvent) => {
      const r = sec.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      tx = -nx * 36
      ty = -ny * 24
    }
    const onLeave = () => { tx = 0; ty = 0 }

    const loop = (now: number) => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      const t = now * 0.001
      const fx = Math.sin(t * 0.55) * 7 + Math.sin(t * 0.23) * 3
      const fy = Math.cos(t * 0.48) * 6 + Math.sin(t * 0.31) * 3
      content.style.transform = `translate3d(${(cx + fx).toFixed(2)}px, ${(cy + fy).toFixed(2)}px, 0)`
      if (head) {
        head.style.transform = `translate3d(${(cx * 0.5 + fx * 1.5).toFixed(2)}px, ${(cy * 0.5 + fy * 1.5).toFixed(2)}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    sec.addEventListener('mousemove', onMove)
    sec.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      sec.removeEventListener('mousemove', onMove)
      sec.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen overflow-hidden flex flex-col justify-end"
      style={{ paddingBottom: 'clamp(64px, 10vh, 120px)' }}
    >
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Main content */}
      <div
        ref={contentRef}
        className="container relative z-[2] will-change-transform"
      >
        {/* Meta line */}
        <motion.div
          {...reveal(100)}
          className="flex justify-between gap-6 mb-8 flex-wrap"
        >
          <span className="mono">{meta}</span>
        </motion.div>

        {/* Kinetic headline — deeper parallax layer */}
        <motion.div {...reveal(200)}>
          <div data-parallax-head style={{ willChange: 'transform' }}>
            <KineticHeadline
              line1={headline.line1}
              line2Muted={headline.line2_muted}
              line2Accent={headline.line2_accent}
            />
          </div>
        </motion.div>

        {/* Sub copy + CTA */}
        <motion.div
          {...reveal(380)}
          className="flex items-end justify-between gap-12 mt-12 flex-wrap"
        >
          <p className="text-[clamp(18px,1.6vw,22px)] leading-[1.5] max-w-[520px] text-(--fg-1) [text-wrap:pretty]">
            {copy.before}{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>
              {copy.highlight}
            </em>{' '}
            {copy.after}
          </p>

          <motion.div ref={magnetRef as React.RefObject<HTMLDivElement>} style={magnetStyle} className="shrink-0">
            <Button href={cta.href} label={cta.label} cursor="Go" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          {...reveal(560)}
          className="mt-24 flex items-center gap-3"
        >
          <div className="w-8 h-px bg-(--fg-3)" />
          <span className="mono">{scrollLabel}</span>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
