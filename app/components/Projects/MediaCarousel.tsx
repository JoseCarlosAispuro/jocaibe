'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import ChevronLeft from '@/app/icons/ChevronLeft'
import ChevronRight from '@/app/icons/ChevronRight'
import VideoEl from './VideoEl'
import { assetUrl } from '@/app/helpers/assets'
import { EASE } from '@/app/helpers/constants'

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
    <section aria-label={`${title} media gallery`} className="flex flex-col gap-3">
      {/* Slide viewport */}
      <div className="relative aspect-[16/9] overflow-hidden rounded border border-(--border) bg-(--bg-2)">
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
              <VideoEl src={items[page]} className="block w-full h-full object-cover" />
            ) : (
              <img
                src={assetUrl(items[page])}
                alt={`${title} — ${page + 1} of ${count}`}
                loading="lazy"
                className="block w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous"
              className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition-colors duration-[160ms] hover:bg-black/80 hover:text-white"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next"
              className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition-colors duration-[160ms] hover:bg-black/80 hover:text-white"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Dots + counter */}
      {count > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-[6px]" role="group" aria-label="Slide navigation">
            {items.map((src, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > page ? 1 : -1])}
                aria-label={`Slide ${i + 1}${isVideo(src) ? ' (video)' : ''}`}
                aria-current={i === page ? 'true' : undefined}
                className={`rounded-full transition-all duration-[240ms] ${
                  i === page
                    ? 'w-5 h-[3px] bg-(--accent)'
                    : isVideo(src)
                      ? 'h-[10px] w-[10px] border border-(--fg-3) hover:border-(--fg-1)'
                      : 'h-[3px] w-[10px] bg-(--fg-4) hover:bg-(--fg-3)'
                }`}
              />
            ))}
          </div>
          <span className="mono text-[10px]">
            {String(page + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
        </div>
      )}
    </section>
  )
}

export default MediaCarousel
