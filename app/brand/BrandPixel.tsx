interface BrandPixelProps {
  size?: number
  glow?: boolean
  color?: string
  style?: React.CSSProperties
}

const BrandPixel = ({
  size = 12,
  glow = true,
  color = 'var(--accent)',
  style,
}: BrandPixelProps) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        background: color,
        borderRadius: 2,
        boxShadow: glow ? `0 0 ${size}px 1px ${color}` : 'none',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

export default BrandPixel
