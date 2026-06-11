// Not a hook — returns Motion props to spread onto motion.* elements
export const reveal = (delay = 0) => {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: {
      duration: 0.56,
      ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number],
      delay: delay / 1000,
    },
  }
}
