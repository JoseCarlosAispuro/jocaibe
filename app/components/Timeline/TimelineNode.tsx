'use client'

import { motion } from 'motion/react'
import Reveal from '@/app/partials/Reveal'
import { openContactModal } from '@/app/helpers/contactModal'
import ArrowRight from '@/app/icons/ArrowRight'
import { Role } from './index'

const TimelineNode = ({
  role,
  idx,
  lit,
  isLast,
  registerDot,
}: {
  role: Role
  idx: number
  lit: boolean
  isLast?: boolean
  registerDot: (el: HTMLSpanElement | null) => void
}) => {
  return (
    <Reveal
      delay={idx * 120}
      className="grid gap-[clamp(24px,4vw,64px)] pt-12 pb-12 border-b border-(--border) relative [grid-template-columns:clamp(40px,8vw,72px)_1fr]"
    >
      {/* Node dot */}
      <div className="relative pt-2">
        <motion.span
          ref={registerDot}
          className="absolute top-[14px] left-[calc(clamp(20px,4vw,36px)-7px)] w-[14px] h-[14px] rounded-full border-2 border-(--accent)"
          animate={{
            background: lit ? 'var(--accent)' : 'var(--bg-0)',
            boxShadow: lit
              ? '0 0 0 6px var(--bg-0), 0 0 16px var(--accent)'
              : '0 0 0 6px var(--bg-0), 0 0 0px rgba(217,240,74,0)',
          }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] }}
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left col — meta */}
        <div className="col-span-4">
          <div className="mono text-(--accent) mb-2">{role.period}</div>
          <h3 className="font-(--font-display) [font-size:var(--fs-h3)] font-semibold tracking-[-0.02em] leading-[1.15] text-(--fg-0)">
            {role.company}
          </h3>
          <div className="text-[14px] text-(--fg-2) mt-1">{role.role}</div>
          <div className="mono mt-3 text-(--fg-3)">{role.location}</div>

          {isLast && (
            <button
              onClick={openContactModal}
              aria-label="Open contact form"
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-(--accent) text-(--bg-0) font-(--font-mono) text-[13px] tracking-[0.08em] uppercase font-medium px-6 py-3"
            >
              Get in touch
              <ArrowRight />
            </button>
          )}
        </div>

        {/* Middle col — bullets */}
        <div className="col-span-6">
          <ul className="flex flex-col gap-3">
            {role.bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3 text-[15px] text-(--fg-1) leading-[1.55]">
                <span className="w-[14px] h-px mt-3 bg-(--fg-3) shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right col — stack tags */}
        <div className="col-span-2 flex flex-wrap gap-1.5 content-start">
          {role.stack.map((tag) => (
            <span
              key={tag}
              className="mono text-[10px] text-(--fg-2) px-2 py-1 border border-(--border) rounded-[4px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export default TimelineNode
