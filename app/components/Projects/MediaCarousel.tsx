'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number]

const isVideo = (src: string) => /\.(mp4|webm|ogg)$/i.test(src)

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

interface MediaCarouselProps {
  items: string[]
  title: string
}

const MediaCarousel = ({ items, title }: MediaCarouselProps) => {
  const [[page, dir], setPage] = useState([0, 0])
  const count = items.length

  const paginate = (newDir: number) =>
    setPage(([curr]) => [(curr + newDir + count) % count, newDir])

  // Arrow-key navigation — scoped to carousel (Escape is owned by modal)
  useEffect(() => {
    if (count <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  paginate(-1)
      if (e.key === 'ArrowRight') paginate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-3">
      {/* Slide viewport */}
      <div className="relative aspect-[16/9] rounded border border-(--border) bg-(--bg-2) overflow-hidden">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-0"
          >
            {isVideo(items[page]) ? (
              <video
                src={items[page]}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover block"
              />
            ) : (
              <img
                src={items[page]}
                alt={`${title} — ${page + 1} of ${count}`}
                loading="lazy"
                className="w-full h-full object-cover block"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        {count > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full flex items-center justify-center bg-black/60 border border-white/20 text-white/80 hover:bg-black/80 hover:text-white transition-colors duration-[160ms]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full flex items-center justify-center bg-black/60 border border-white/20 text-white/80 hover:bg-black/80 hover:text-white transition-colors duration-[160ms]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots + counter */}
      {count > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-[6px] items-center">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > page ? 1 : -1])}
                aria-label={`Slide ${i + 1}`}
                className={`h-[3px] rounded-full transition-all duration-[240ms] ${
                  i === page
                    ? 'w-5 bg-(--accent)'
                    : 'w-[10px] bg-(--fg-4) hover:bg-(--fg-3)'
                }`}
              />
            ))}
          </div>
          <span className="mono text-[10px]">
            {String(page + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  )
}

export default MediaCarousel
