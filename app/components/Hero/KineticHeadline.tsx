interface KineticHeadlineProps {
  line1: string
  line2Muted: string
  line2Accent: string
}

// Staggered per-letter entrance + hover lift.
// `n` is shared across the render so each letter gets a unique
// increasing delay starting from the first character.
const KineticHeadline = ({ line1, line2Muted, line2Accent }: KineticHeadlineProps)  => {
  let n = 0

  const Letter = ({ ch, accent, italic }: { ch: string; accent?: boolean; italic?: boolean }) => {
    const delay = (n++) * 24

    return (
      <span
        suppressHydrationWarning
        className={[
          'inline-block whitespace-pre cursor-default',
          '[will-change:transform]',
          '[text-shadow:0_0_0px_transparent]',
          'transition-[translate,color,text-shadow] duration-[240ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]',
          'hover:-translate-y-[14px] hover:text-(--accent)',
          'hover:[text-shadow:0_0_26px_color-mix(in_oklab,var(--accent)_65%,transparent)]',
          accent ? 'text-(--accent)' : '',
          italic ? 'italic font-normal' : 'font-medium',
        ].filter(Boolean).join(' ')}
        style={{ animation: `klRise 660ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms backwards` }}
      >
        {ch}
      </span>
    )
  }

  const word = (text: string, opts: { accent?: boolean; italic?: boolean } = {}) =>
    [...text].map((ch, i) => <Letter key={text + i} ch={ch} {...opts} />)

  return (
    <>
      <h1 className="[font-family:var(--font-display)] [font-size:var(--fs-display)] font-medium tracking-[-0.04em] leading-[0.92] text-(--fg-0)">
        {word(line1)}
        <br />
        <span className="text-(--fg-2)">{word(line2Muted)}</span>
        {word(line2Accent, { accent: true, italic: true })}
      </h1>
      <style>{`
        @keyframes klRise {
          from { opacity: 0; transform: translateY(0.9em) rotate(5deg); }
          to   { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </>
  )
}

export default KineticHeadline
