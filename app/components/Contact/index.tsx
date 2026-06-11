'use client'

import {motion} from 'motion/react'
import {reveal} from '@/app/hooks/useReveal'
import {useMagnetic} from '@/app/hooks/useMagnetic'
import BrandTile from '@/app/brand/BrandTile'
import BrandSignoff from '@/app/brand/BrandSignoff'

interface ContactLink {
    label: string
    value: string
    href: string | null
    cta?: boolean
}

interface ContactData {
    eyebrow: string
    headline: string
    headlineAccent: string
    headlineEnd: string
    email: string
    emailNote: string
    links: ContactLink[]
    footer: string
    footerStack: string
}

function ContactRow({label, value, cta, href}: ContactLink) {
    return (
        <motion.a
            href={href || '#'}
            initial="rest"
            whileHover="hover"
            style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 24,
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid var(--border)',
            }}
        >
            <span className="mono">{label}</span>
            <motion.span
                variants={{
                    rest: {color: 'var(--fg-0)'},
                    hover: {color: 'var(--accent)'},
                }}
                transition={{duration: 0.22}}
                style={{
                    fontSize: 17,
                    fontFamily: cta ? 'var(--font-mono)' : 'var(--font-body)',
                }}
            >
                {value} {cta ? '↓' : '↗'}
            </motion.span>
        </motion.a>
    )
}

export default function Contact({data}: { data: ContactData }) {
    const {ref: emailRef, style: emailStyle} = useMagnetic(0.3)

    return (
        <section
            id="contact"
            style={{
                position: 'relative',
                padding: 'var(--s-section) 0 var(--s-7) 0',
                background: 'var(--bg-1)',
                borderTop: '1px solid var(--border)',
                overflow: 'hidden',
            }}
        >
            <div className="container rekatuce z-[2]">
                <motion.h2
                    {...reveal(100)}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(56px, 9vw, 144px)',
                        fontWeight: 500,
                        letterSpacing: '-0.04em',
                        lineHeight: 0.9,
                        color: 'var(--fg-0)',
                    }}
                >
                    {data.headline}
                    <span
                        style={{
                            background: 'linear-gradient(180deg, var(--accent), var(--accent-soft))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            paddingRight: 10
                        }}
                    >
            {data.headlineAccent}
          </span>{' '}
                    {data.headlineEnd}
                </motion.h2>

                <motion.div
                    {...reveal(300)}
                    style={{
                        marginTop: 96,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        gap: 32,
                    }}
                >
                    <div style={{gridColumn: 'span 6'}}>
                        <motion.a
                            ref={emailRef as React.RefObject<HTMLAnchorElement>}
                            style={{
                                display: 'inline-block',
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(28px, 3.5vw, 44px)',
                                fontWeight: 500,
                                letterSpacing: '-0.02em',
                                paddingBottom: 6,
                                borderBottomWidth: 1,
                                borderBottomStyle: 'solid',
                                ...emailStyle,
                            }}
                            initial={{color: 'var(--fg-0)', borderBottomColor: 'var(--border-strong)'}}
                            whileHover={{color: 'var(--accent)', borderBottomColor: 'var(--accent)'}}
                            transition={{duration: 0.22, ease: 'linear'}}
                            data-cursor="Email"
                            href={`mailto:${data.email}`}
                        >
                            {data.email} ↗
                        </motion.a>
                        <div
                            style={{
                                marginTop: 16,
                                color: 'var(--fg-2)',
                                fontSize: 15,
                                maxWidth: 480,
                            }}
                        >
                            {data.emailNote}
                        </div>
                    </div>

                    <div
                        style={{
                            gridColumn: 'span 6',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 32,
                        }}
                    >
                        {data.links.map((link) => (
                            <ContactRow key={link.label} {...link} />
                        ))}
                    </div>
                </motion.div>
                <footer
                    style={{
                        marginTop: 64,
                        paddingTop: 32,
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                        alignItems: 'center',
                    }}
                >
                  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12}}>
                    <span className="mono">{data.footer}</span>
                  </div>
                    <span className="mono">{data.footerStack}</span>
                </footer>
            </div>
        </section>
    )
}
