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

const ContactRow = ({label, value, cta, href}: ContactLink) => {
    return (
        <motion.a
            href={href || '#'}
            initial="rest"
            whileHover="hover"
            className="flex items-baseline gap-6 justify-between pb-4 border-b border-(--border)"
        >
            <span className="mono">{label}</span>
            <motion.span
                variants={{
                    rest: {color: 'var(--fg-0)'},
                    hover: {color: 'var(--accent)'},
                }}
                transition={{duration: 0.22}}
                className={`text-[17px] ${cta ? '[font-family:var(--font-mono)]' : '[font-family:var(--font-body)]'}`}
            >
                {value} {cta ? '↓' : '↗'}
            </motion.span>
        </motion.a>
    )
}

const Contact = ({data}: { data: ContactData }) => {
    const {ref: emailRef, style: emailStyle} = useMagnetic(0.3)

    return (
        <section
            id="contact"
            className="relative overflow-hidden bg-(--bg-1) border-t border-(--border) pt-(--s-section) pb-(--s-7)"
        >
            <div className="container mx-auto px-(--gutter) relative z-[2]">
                <motion.h2
                    {...reveal(100)}
                    className="[font-family:var(--font-display)] text-[clamp(56px,9vw,144px)] font-medium tracking-[-0.04em] leading-[0.9] text-(--fg-0)"
                >
                    {data.headline}
                    <span className="bg-[linear-gradient(180deg,var(--accent),var(--accent-soft))] bg-clip-text text-transparent italic font-normal pr-[10px]">
            {data.headlineAccent}
          </span>{' '}
                    {data.headlineEnd}
                </motion.h2>

                <motion.div
                    {...reveal(300)}
                    className="mt-24 grid grid-cols-12 gap-8"
                >
                    <div className="col-span-6">
                        <motion.a
                            ref={emailRef as React.RefObject<HTMLAnchorElement>}
                            className="inline-block [font-family:var(--font-display)] text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] pb-[6px] border-b border-solid"
                            style={emailStyle}
                            initial={{color: 'var(--fg-0)', borderBottomColor: 'var(--border-strong)'}}
                            whileHover={{color: 'var(--accent)', borderBottomColor: 'var(--accent)'}}
                            transition={{duration: 0.22, ease: 'linear'}}
                            data-cursor="Email"
                            href={`mailto:${data.email}`}
                        >
                            {data.email} ↗
                        </motion.a>
                        <div className="mt-4 text-(--fg-2) text-[15px] max-w-[480px]">
                            {data.emailNote}
                        </div>
                    </div>

                    <div className="col-span-6 flex flex-col gap-8">
                        {data.links.map((link) => (
                            <ContactRow key={link.label} {...link} />
                        ))}
                    </div>
                </motion.div>
                <footer className="mt-16 pt-8 border-t border-(--border) flex justify-between flex-wrap gap-4 items-center">
                  <div className="inline-flex items-center gap-3">
                    <span className="mono">{data.footer}</span>
                  </div>
                    <span className="mono">{data.footerStack}</span>
                </footer>
            </div>
        </section>
    )
}

export default Contact
