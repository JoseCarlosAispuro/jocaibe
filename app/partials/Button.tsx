'use client'

import { forwardRef } from 'react'
import RightArrow from '@/app/icons/RightArrow'

interface ButtonProps {
  href: string
  label: string
  cursor?: string
}

const Button = forwardRef<HTMLAnchorElement, ButtonProps>(
  ({ href, label, cursor }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        data-cursor={cursor}
        className="inline-flex items-center gap-4 border border-(--fg-0) bg-(--fg-0) text-(--bg-0) rounded-full [font-family:var(--font-mono)] text-[13px] tracking-[0.06em] uppercase font-medium transition-[background,border-color] duration-[220ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:bg-(--accent) hover:border-(--accent) shrink-0"
        style={{ padding: '18px 28px' }}
      >
        {label}
        <RightArrow />
      </a>
    )
  }
)

Button.displayName = 'Button'

export default Button
