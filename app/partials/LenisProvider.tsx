'use client'

import { ReactLenis } from 'lenis/react'

const LenisProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}

export default LenisProvider
