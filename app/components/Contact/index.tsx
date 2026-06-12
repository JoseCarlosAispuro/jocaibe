'use client'

import { motion } from 'motion/react'
import { useMagnetic } from '@/app/hooks/useMagnetic'
import Reveal from '@/app/partials/Reveal'
import ContactRow, {ContactLink} from "@/app/components/Contact/ContactRow";

interface ContactData {
    eyebrow: string
    headline: string
    headlineAccent: string
    headlineEnd: string
    email: string
    emailNote: string
    links: ContactLink[]
}

const Contact = ({data}: { data: ContactData }) => {
    const {ref: emailRef, style: emailStyle} = useMagnetic(0.1)

    return (
        <section
            id="contact"
            className="relative overflow-hidden bg-(--bg-1) border-t border-(--border) pt-(--s-section) pb-(--s-7)"
        >
            <div className="container mx-auto px-(--gutter) relative z-[2]">
                <Reveal delay={100}>
                    <h2 className="font-(--font-display) text-[clamp(56px,9vw,144px)] font-medium tracking-[-0.04em] leading-[0.9] text-(--fg-0)">
                        {data.headline}
                        <span className="bg-[linear-gradient(180deg,var(--accent),var(--accent-soft))] bg-clip-text text-transparent italic font-normal pr-[10px]">
                            {data.headlineAccent}
                        </span>{' '}
                        {data.headlineEnd}
                    </h2>
                </Reveal>

                <Reveal delay={300} className="mt-24 grid grid-cols-12 gap-8">
                    <div className="col-span-6">
                        <motion.a
                            ref={emailRef as React.RefObject<HTMLAnchorElement>}
                            className="inline-block font-(--font-display) text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] pb-[6px] border-b border-solid"
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
                </Reveal>
            </div>
        </section>
    )
}

export default Contact
