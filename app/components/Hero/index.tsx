'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { initHeroShader } from '@/app/helpers/heroShader'
import { useMagnetic } from '@/app/hooks/useMagnetic'
import useParallax from '@/app/hooks/useParallax'
import Reveal from '@/app/partials/Reveal'
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
    const { ref: magnetRef, style: magnetStyle } = useMagnetic(0.4)
    const { sectionRef, contentRef } = useParallax()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        return initHeroShader(canvas)
    }, [])

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="relative min-h-screen overflow-hidden flex flex-col justify-end pb-[clamp(64px,10vh,120px)]"
        >
            {/* Canvas background */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Main content */}
            <div
                ref={contentRef}
                className="container mx-auto px-(--gutter) relative z-[2] will-change-transform hero-float"
            >
                {/* Meta line */}
                <Reveal delay={100} className="flex justify-between gap-6 mb-8 flex-wrap">
                    <span className="mono">{meta}</span>
                </Reveal>

                {/* Kinetic headline — deeper parallax layer */}
                <Reveal delay={200}>
                    <div data-parallax-head className="will-change-transform hero-float-head">
                        <KineticHeadline
                            line1={headline.line1}
                            line2Muted={headline.line2_muted}
                            line2Accent={headline.line2_accent}
                        />
                    </div>
                </Reveal>

                {/* Sub copy + CTA */}
                <Reveal delay={380} className="flex items-end justify-between gap-12 mt-12 flex-wrap">
                    <p className="text-[clamp(18px,1.6vw,22px)] leading-[1.5] max-w-[520px] text-(--fg-1) [text-wrap:pretty]">
                        {` ${copy.before}`}
                        <em className="text-(--accent) not-italic">
                            {copy.highlight}
                        </em>{` ${copy.after}`}
                    </p>

                    <motion.div ref={magnetRef as React.RefObject<HTMLDivElement>} style={magnetStyle} className="shrink-0">
                        <Button href={cta.href} label={cta.label} cursor="Go" />
                    </motion.div>
                </Reveal>

                {/* Scroll indicator */}
                <Reveal delay={560} className="mt-24 flex items-center gap-3">
                    <div className="w-8 h-px bg-(--fg-3)" />
                    <span className="mono">{scrollLabel}</span>
                </Reveal>
            </div>
        </section>
    )
}

export default Hero
