'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import Reveal from '@/app/partials/Reveal'
import Button from '@/app/partials/Button'
import ContactRow, { ContactLink } from '@/app/components/Contact/ContactRow'
import ContactModal from './ContactModal'
import { CONTACT_MODAL_EVENT } from '@/app/helpers/contactModal'

interface ContactData {
    eyebrow: string
    headline: string
    headlineAccent: string
    headlineEnd: string
    email: string
    emailNote: string
    links: ContactLink[]
}

const Contact = ({ data }: { data: ContactData }) => {
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        const handler = () => setModalOpen(true)
        window.addEventListener(CONTACT_MODAL_EVENT, handler)
        return () => window.removeEventListener(CONTACT_MODAL_EVENT, handler)
    }, [])

    return (
        <>
            <section
                id="contact"
                className="relative overflow-hidden bg-(--bg-1) pt-(--s-section) pb-(--s-7)"
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

                    <Reveal delay={300} className="mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
                        <div className="md:col-span-6">
                            <Button
                                variant="modal"
                                label="Send a message"
                                cursor="Let's Talk"
                                onClick={() => setModalOpen(true)}
                            />
                            <div className="mt-5 text-(--fg-2) text-[15px] max-w-[480px]">
                                {data.emailNote}
                            </div>
                        </div>

                        <div className="md:col-span-6 flex flex-col gap-8">
                            {data.links.map((link) => (
                                <ContactRow key={link.label} {...link} />
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            <AnimatePresence>
                {modalOpen && <ContactModal onClose={() => setModalOpen(false)} />}
            </AnimatePresence>
        </>
    )
}

export default Contact
