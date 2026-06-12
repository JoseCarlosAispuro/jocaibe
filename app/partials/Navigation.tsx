'use client'

import {useState, useEffect} from 'react'
import {useLenis} from 'lenis/react'
import clsx from 'clsx'
import { motion } from 'motion/react'
import BrandWordmark from '@/app/brand/BrandWordmark'
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

const NavLink = ({label, href}: NavLinkItem) => {
    return (
        <MotionLink
            href={href}
            className="font-(--font-mono) text-[12px] tracking-[0.08em] uppercase"
            initial={{ color: 'var(--fg-2)' }}
            whileHover={{ color: 'var(--accent)' }}
            transition={{ duration: 0.18 }}
        >
            {label}
        </MotionLink>
    )
}

const Navigation = ({links, email}: NavProps) => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    // Lenis fires on every smoothed scroll tick
    useLenis(({scroll}) => setScrolled(scroll > 24))

    // Seed initial state (Lenis hasn't fired yet on mount)
    useEffect(() => {
        setScrolled(window.scrollY > 24)
    }, [])

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
                    'fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-all duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]',
                    {'nav-scrolled': scrolled},
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
                                <NavLink key={label} label={label} href={href}/>
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
                                onClick={() => setMenuOpen(false)}
                                className="flex items-baseline gap-4 font-(--font-display) text-[clamp(40px,13vw,64px)] font-medium tracking-[-0.03em] text-(--fg-0) py-[10px] border-b border-(--border)"
                            >
                                <span className="mono text-(--accent) text-[12px]">0{i + 1}</span>
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Link
                            href={`mailto:${email}`}
                            onClick={() => setMenuOpen(false)}
                            className="font-(--font-mono) text-[13px] text-(--fg-1) tracking-[0.04em]"
                        >
                            {email} ↗
                        </Link>
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
