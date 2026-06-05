'use client'

import { useState, useEffect } from 'react'

interface NavLink {
  label: string
  href: string
}

interface NavProps {
  logo: string
  links: NavLink[]
}

export default function Navigation({ logo, links }: NavProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: scrolled
          ? '1px solid var(--border)'
          : '1px solid transparent',
        background: scrolled
          ? 'color-mix(in oklab, var(--bg-0) 80%, transparent)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 320ms cubic-bezier(0.2,0.7,0.2,1)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: 'var(--accent)',
              boxShadow: '0 0 12px var(--accent)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              letterSpacing: '0.06em',
              color: 'var(--fg-0)',
            }}
          >
            {logo}
          </span>
        </a>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {links.map(({ label, href }) => (
            <NavLink key={label} label={label} href={href} />
          ))}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ label, href }: NavLink) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: hovered ? 'var(--accent)' : 'var(--fg-2)',
        transition: 'color 180ms',
      }}
    >
      {label}
    </a>
  )
}
