'use client'

import { useEffect, useRef } from 'react'
import { initHeroShader } from '@/app/helpers/heroShader'
import { useReveal } from '@/app/hooks/useReveal'
import KineticHeadline from './KineticHeadline'
import RightArrow from "@/app/icons/RightArrow";

export interface HeroData {
  headline: {
    line1: string
    line2_muted: string
    line2_accent: string
  }
  meta: string
  copy: {
    before: string;
    highlight: string;
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

const Hero = ({ data, available, availableLabel }: HeroProps) => {
  const {headline, meta, copy, cta, scrollLabel} = {...data}
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const pillRef   = useReveal(200)
  const metaRef   = useReveal(100)
  const h1Ref     = useReveal(200)
  const subRef    = useReveal(380)
  const scrollRef = useReveal(560)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return initHeroShader(canvas, { mode: 'constellation' })
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden flex flex-col justify-center"
    >
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Status pill — top left */}
      {available && (
        <div className="container absolute top-24 inset-x-0 z-[2]">
          <div
            ref={pillRef as React.RefObject<HTMLDivElement>}
            className="inline-flex items-center gap-2.5 border border-(--border) rounded-full backdrop-blur-[8px]"
            style={{
              padding: '8px 14px',
              background: 'color-mix(in oklab, var(--bg-1) 60%, transparent)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: 'var(--success)',
                ['--beat-glow' as string]: 'var(--success)',
                animation: 'heartbeat 1.8s ease-in-out infinite',
              }}
            />
            <span className="mono" style={{ color: 'var(--fg-1)' }}>
              {availableLabel}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container relative z-[2]">

        {/* Meta line */}
        <div
          ref={metaRef as React.RefObject<HTMLDivElement>}
          className="flex justify-between gap-6 mb-8 flex-wrap"
        >
          <span className="mono">{meta}</span>
        </div>

        {/* Kinetic headline */}
        <div ref={h1Ref as React.RefObject<HTMLDivElement>}>
          <KineticHeadline
            line1={headline.line1}
            line2Muted={headline.line2_muted}
            line2Accent={headline.line2_accent}
          />
        </div>

        {/* Sub copy + CTA */}
        <div
          ref={subRef as React.RefObject<HTMLDivElement>}
          className="flex items-end justify-between gap-12 mt-12 flex-wrap"
        >
          <p className="text-[clamp(18px,1.6vw,22px)] leading-[1.5] max-w-[520px] text-(--fg-1) [text-wrap:pretty]">
            {copy.before}{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{copy.highlight}</em>{' '}
            {copy.after}
          </p>

          <a
            href={cta.href}
            className="inline-flex items-center gap-4 border border-(--fg-0) bg-(--fg-0) text-(--bg-0) rounded-full [font-family:var(--font-mono)] text-[13px] tracking-[0.06em] uppercase font-medium transition-[background,border-color] duration-[220ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:bg-(--accent) hover:border-(--accent) shrink-0"
            style={{ padding: '18px 28px' }}
          >
            {cta.label}
            <RightArrow/>
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollRef as React.RefObject<HTMLDivElement>}
          className="mt-24 flex items-center gap-3"
        >
          <div className="w-8 h-px bg-(--fg-3)" />
          <span className="mono">{scrollLabel}</span>
        </div>
      </div>

    </section>
  )
}

export default Hero;
