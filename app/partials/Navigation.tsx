'use client'

import {useState, useEffect, useRef} from 'react'
import { openContactModal } from '@/app/helpers/contactModal'
import {useLenis} from 'lenis/react'
import clsx from 'clsx'
import { motion } from 'motion/react'
import BrandWordmark from '@/app/partials/BrandWordmark'
import Hamburger from "@/app/icons/Hamburger";
import Close from "@/app/icons/Close";
import Link from "next/link";

const MotionLink = motion.create(Link)

interface NavLinkItem {
    label: string
    href: string
}

interface NavProps {
    links: NavLinkItem[]
    email: string
}

const Navigation = ({links, email}: NavProps) => {
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const prevScrollRef = useRef(0)
    const hiddenRef = useRef(false)

    const lenis = useLenis(({scroll}) => {
        const prev = prevScrollRef.current
        const delta = scroll - prev

        setScrolled(scroll > 24)

        if (scroll <= window.innerHeight) {
            // Inside the hero — always visible
            if (hiddenRef.current) { hiddenRef.current = false; setHidden(false) }
        } else if (delta > 8 && !hiddenRef.current) {
            // Scrolled down more than 8px past the hero — hide
            hiddenRef.current = true
            setHidden(true)
        } else if (delta < -8 && hiddenRef.current) {
            // Scrolled up more than 8px — show
            hiddenRef.current = false
            setHidden(false)
        }

        prevScrollRef.current = scroll
    })

    const scrollToHash = (href: string) => {
        if (!href.startsWith('#')) return
        const el = document.querySelector(href)
        if (!el) return
        lenis ? lenis.scrollTo(el as HTMLElement) : el.scrollIntoView({ behavior: 'smooth' })
    }

    // Seed initial state from Lenis instance (falls back to 0 before first tick)
    useEffect(() => {
        const scroll = lenis?.scroll ?? 0
        prevScrollRef.current = scroll
        setScrolled(scroll > 24)
    }, [lenis])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [menuOpen])

    return (
        <>
            <nav
                className={clsx(
                    'fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-all duration-[520ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]',
                    {'nav-scrolled': scrolled},
                    {'-translate-y-full': hidden && !menuOpen},
                )}
            >
                <div className="container mx-auto px-(--gutter) flex items-center justify-between h-[72px]">
                    <Link href="/" className="inline-flex items-center">
                        <BrandWordmark />
                    </Link>

                    <div className="flex items-center gap-8">
                        {/* Desktop links */}
                        <div className="hidden sm:flex gap-7">
                            {links.map(({label, href}) => (
                                <MotionLink
                                    key={label}
                                    href={href}
                                    onClick={(e) => {
                                        if (href.startsWith('#')) {
                                            e.preventDefault()
                                            scrollToHash(href)
                                        }
                                    }}
                                    className="font-(--font-mono) text-[12px] tracking-[0.08em] uppercase"
                                    initial={{ color: 'var(--fg-2)' }}
                                    whileHover={{ color: 'var(--accent)' }}
                                    transition={{ duration: 0.18 }}
                                >
                                    {label}
                                </MotionLink>
                            ))}
                        </div>

                        {/* Hamburger — mobile */}
                        <button
                            className="sm:hidden w-11 h-11 rounded-full border border-(--border-strong) flex items-center justify-center text-(--fg-0)"
                            aria-label="Open menu"
                            onClick={() => setMenuOpen(true)}>
                            <Hamburger/>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-[70] flex flex-col backdrop-blur-[10px] pt-5 px-(--gutter) pb-10 bg-[color-mix(in_oklab,var(--bg-0)_98%,transparent)]"
                >
                    <div className="flex items-center justify-between h-[52px]">
                        <BrandWordmark />
                        <button
                            className="w-11 h-11 rounded-full border border-(--border-strong) flex items-center justify-center text-(--fg-0)"
                            aria-label="Close menu"
                            onClick={() => setMenuOpen(false)}>
                            <Close/>
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-1">
                        {links.map(({label, href}, i) => (
                            <Link
                                key={label}
                                href={href}
                                onClick={(e) => {
                                    if (href.startsWith('#')) {
                                        e.preventDefault()
                                        scrollToHash(href)
                                    }
                                    setMenuOpen(false)
                                }}
                                className="flex items-baseline gap-4 font-(--font-display) text-[clamp(40px,13vw,64px)] font-medium tracking-[-0.03em] text-(--fg-0) py-[10px] border-b border-(--border)"
                            >
                                <span className="mono text-(--accent) text-[12px]">0{i + 1}</span>
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => { setMenuOpen(false); openContactModal() }}
                            className="font-(--font-mono) text-[13px] text-(--fg-1) tracking-[0.04em] text-left"
                        >
                            {email} ↗
                        </button>
                        <span className="mono inline-flex items-center gap-2">
              <span className="size-[7px] rounded-full bg-(--success)"/>
              Available for Q3 2026
            </span>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navigation
