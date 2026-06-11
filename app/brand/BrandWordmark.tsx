interface BrandWordmarkProps {
  fontSize?: number
  color?: string
  glow?: boolean
  weight?: number
}

export default function BrandWordmark({
  fontSize = 32,
  color = 'var(--fg-0)',
  glow = true,
  weight = 500,
}: BrandWordmarkProps) {
  const px = Math.max(3, Math.round(fontSize * 0.15))
  const stemW = Math.max(2, Math.round(fontSize * 0.082))
  const stemH = fontSize * 0.52
  const side = fontSize * 0.024

  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize,
        fontWeight: weight,
        color,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      <span>joca</span>
      <span
        style={{
          display: 'inline-block',
          position: 'relative',
          verticalAlign: 'baseline',
          width: stemW,
          height: stemH,
          marginLeft: side,
          marginRight: side,
        }}
      >
        {/* Stem */}
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: stemW,
            height: stemH,
            background: color,
            borderRadius: stemW / 2,
          }}
        />
        {/* Tittle pixel */}
        <span
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: stemH + fontSize * 0.1,
            width: px,
            height: px,
            background: 'var(--accent)',
            borderRadius: 2,
            boxShadow: glow ? `0 0 ${px}px 1px var(--accent)` : 'none',
          }}
        />
      </span>
      <span>be</span>
    </span>
  )
}
