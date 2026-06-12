'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  delay?: number
  className?: string
  children: ReactNode
}

const Reveal = ({ delay = 0, className, children }: RevealProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
      duration: 0.56,
      ease: [0.2, 0.7, 0.2, 1],
      delay: delay / 1000,
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export default Reveal
