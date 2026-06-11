'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { reveal } from '@/app/hooks/useReveal'
import BrandWordmark from './BrandWordmark'

export default function BrandSignoff() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [fs, setFs] = useState(120)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      // "jocaibe" ≈ fontSize * 3.95 wide at -0.04em
      setFs(Math.max(54, Math.min(184, w / 3.95)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      ref={wrapRef}
      {...reveal(0)}
      style={{ marginTop: 'clamp(96px, 14vw, 180px)' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <BrandWordmark fontSize={fs} weight={500} />
        <span
          className="mono"
          style={{
            whiteSpace: 'nowrap',
            paddingBottom: Math.max(6, fs * 0.06),
          }}
        >
          jocaibe.com ↗
        </span>
      </div>
    </motion.div>
  )
}
