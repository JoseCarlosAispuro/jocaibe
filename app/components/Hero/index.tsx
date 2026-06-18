'use client'

import { useEffect, useRef } from 'react'
import { initHeroShader } from '@/app/helpers/heroShader'
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
    const { headline, meta, copy, cta } = data
    const canvasRef = useRef<HTMLCanvasElement>(null)
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
            className="relative min-h-screen overflow-hidden flex flex-col justify-center pt-[clamp(64px,10vh,120px)] pb-[clamp(64px,10vh,120px)]"
        >
            {/* Canvas background */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Main content */}
            <div
                ref={contentRef}
                className="container mx-auto px-(--gutter) relative z-[2] will-change-transform hero-float"
            >
                {/* Meta line */}
                <Reveal delay={300} className="flex justify-between gap-6 mb-8 flex-wrap">
                    <span className="mono">{meta}</span>
                </Reveal>

                {/* Kinetic headline — deeper parallax layer */}
                <Reveal delay={500}>
                    <div data-parallax-head className="will-change-transform hero-float-head">
                        <KineticHeadline
                            line1={headline.line1}
                            line2Muted={headline.line2_muted}
                            line2Accent={headline.line2_accent}
                        />
                    </div>
                </Reveal>

                {/* Sub copy + CTA */}
                <Reveal delay={800} className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-12 mt-10 md:mt-12">
                    <p className="text-[clamp(17px,1.6vw,22px)] leading-[1.55] max-w-[520px] text-(--fg-1) [text-wrap:pretty]">
                        {` ${copy.before}`}
                        <em className="text-(--accent) not-italic">
                            {` ${copy.highlight}`}
                        </em>{` ${copy.after}`}
                    </p>
                    <Reveal delay={1000}>
                        <Button variant="scroll" target={cta.href} label={cta.label} cursor="Go" />
                    </Reveal>
                </Reveal>

            </div>

            {/* Scroll cue — mouse on desktop, swipe on touch */}
            <div
                aria-hidden="true"
                className="scroll-cue absolute left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-[14px]"
                style={{ bottom: 'clamp(26px, 4vh, 44px)' }}
            >
                <div className="cue-mouse flex flex-col items-center gap-[14px]">
                    <div className="cue-mouse-body">
                        <div className="cue-wheel" />
                    </div>
                    <span className="mono cue-label">SCROLL</span>
                </div>
                <div className="cue-swipe hidden flex-col items-center gap-[14px]">
                    <div className="cue-swipe-track">
                        <div className="cue-finger" />
                        <div className="cue-chev" />
                    </div>
                    <span className="mono cue-label">SWIPE</span>
                </div>
            </div>
        </section>
    )
}

export default Hero
