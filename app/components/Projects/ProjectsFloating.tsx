'use client'

import { useRef, useMemo } from 'react'
import { useFloatingCards, type FloatItemConfig } from '@/app/hooks/useFloatingCards'
import FloatingCard from './FloatingCard'
import type { Project } from '@/app/types/project'

const FLOAT_STYLES = [
  { w: 'min(800px, 70%)', ratio: '16 / 9',  depth: 0.85, rot: -1.5, speed: 0.45, phase: 0.0 },
  { w: 'min(640px, 56%)', ratio: '16 / 10', depth: 1.70, rot: 1.8,  speed: 0.66, phase: 1.3 },
  { w: 'min(580px, 52%)', ratio: '4 / 3',   depth: 1.45, rot: -1.1, speed: 0.60, phase: 2.5 },
  { w: 'min(760px, 66%)', ratio: '16 / 9',  depth: 0.95, rot: 1.2,  speed: 0.42, phase: 0.7 },
  { w: 'min(620px, 54%)', ratio: '4 / 3',   depth: 1.55, rot: -1.7, speed: 0.70, phase: 3.0 },
  { w: 'min(700px, 60%)', ratio: '16 / 10', depth: 1.30, rot: 1.4,  speed: 0.55, phase: 1.8 },
  { w: 'min(820px, 72%)', ratio: '16 / 9',  depth: 0.90, rot: -0.9, speed: 0.48, phase: 3.8 },
] as const

interface ProjectsFloatingProps {
  projects: Project[]
  onOpen: (p: Project) => void
}

const ProjectsFloating = ({ projects, onOpen }: ProjectsFloatingProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const configs = useMemo<FloatItemConfig[]>(
    () => projects.map((_, i) => ({
      ...FLOAT_STYLES[i % FLOAT_STYLES.length],
      lane: (i % 2 === 0 ? 'start' : 'end') as 'start' | 'end',
    })),
    [projects.length], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const { register } = useFloatingCards(containerRef, configs)

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-6 mb-2 flex-wrap">
        <span className="mono hidden md:inline">Scroll — the work drifts past. Click any card to open it.</span>
        <span className="mono md:hidden">Tap any card to open it.</span>
        <span className="mono text-(--fg-3)">{String(projects.length).padStart(2, '0')} projects</span>
      </div>

      <div
        ref={containerRef}
        className="floating-stage relative flex flex-col gap-[clamp(48px,7vw,104px)] max-md:gap-10 pt-14 pb-6"
      >
        {projects.map((p, i) => {
          const style = FLOAT_STYLES[i % FLOAT_STYLES.length]
          const lane  = i % 2 === 0 ? 'start' : 'end' as 'start' | 'end'
          return (
            <FloatingCard
              key={p.id}
              project={p}
              w={style.w}
              ratio={style.ratio}
              lane={lane}
              onOpen={onOpen}
              register={register(i)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProjectsFloating
