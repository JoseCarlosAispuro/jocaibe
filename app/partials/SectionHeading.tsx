'use client'

import { useReveal } from '@/app/hooks/useReveal'

interface SectionHeadingProps {
  eyebrow: string
  titleMain: string
  titleMuted?: string
  right?: React.ReactNode
}

export default function SectionHeading({ eyebrow, titleMain, titleMuted, right }: SectionHeadingProps) {
  const ref = useReveal(0)

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="grid grid-cols-12 gap-8 items-baseline"
    >
      <div className="col-span-2 flex items-baseline gap-2">
        <span className="mono text-(--accent)">/</span>
        <span className="mono">{eyebrow}</span>
      </div>

      <h2 className="col-span-8 [font-family:var(--font-display)] [font-size:var(--fs-h1)] font-medium tracking-[-0.03em] leading-none text-(--fg-0)">
        {titleMain}
        {titleMuted && (
          <>
            <br />
            <span className="text-(--fg-2)">{titleMuted}</span>
          </>
        )}
      </h2>

      {right && (
        <div className="col-span-2 text-right">{right}</div>
      )}
    </div>
  )
}
