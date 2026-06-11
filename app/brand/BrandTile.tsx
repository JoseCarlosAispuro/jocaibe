import BrandPixel from './BrandPixel'

interface BrandTileProps {
  size?: number
  radius?: number
}

const BrandTile = ({ size = 32, radius }: BrandTileProps) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: size,
        height: size,
        borderRadius: radius != null ? radius : size * 0.26,
        background: 'linear-gradient(160deg, #232429 0%, #131417 100%)',
        border: '1px solid var(--border-strong)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          color: 'var(--fg-0)',
          fontSize: size * 0.46,
          letterSpacing: '-0.06em',
          lineHeight: 1,
        }}
      >
        jc
      </span>
      <BrandPixel
        size={size * 0.13}
        glow={false}
        style={{
          position: 'absolute',
          top: size * 0.17,
          right: size * 0.17,
        }}
      />
    </span>
  )
}

export default BrandTile
