'use client'

import { motion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

const MenuToggle = ({ open }: { open: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    overflow="visible"
  >
    {/* Top line → rotates to \ diagonal */}
    <motion.line
      x1="2" y1="5" x2="18" y2="5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      animate={open
        ? { x1: 3, y1: 3, x2: 17, y2: 17 }
        : { x1: 2, y1: 5,  x2: 18, y2: 5  }
      }
      transition={{ duration: 0.38, ease: EASE }}
    />

    {/* Middle line → shrinks and fades out */}
    <motion.line
      x1="2" y1="10" x2="18" y2="10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      animate={open
        ? { opacity: 0, x1: 10, x2: 10 }
        : { opacity: 1, x1: 2,  x2: 18  }
      }
      transition={{ duration: 0.22, ease: EASE }}
    />

    {/* Bottom line → rotates to / diagonal */}
    <motion.line
      x1="2" y1="15" x2="18" y2="15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      animate={open
        ? { x1: 3, y1: 17, x2: 17, y2: 3 }
        : { x1: 2, y1: 15, x2: 18, y2: 15 }
      }
      transition={{ duration: 0.38, ease: EASE }}
    />
  </svg>
)

export default MenuToggle
