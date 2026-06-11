'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import SectionHeading from '@/app/partials/SectionHeading'
import ProjectModal from './ProjectModal'
import ProjectsFloating from './ProjectsFloating'
import type { Project } from '@/app/types/project'

interface ProjectsData {
  projects: Project[]
}

export default function Projects({ data }: { data: ProjectsData }) {
  const { projects } = data
  const [modal, setModal] = useState<Project | null>(null)

  return (
    <section id="projects" className="py-(--s-section) relative">
      <div className="container">
        <SectionHeading
          lines={[
            { text: 'Seven projects,' },
            { text: 'One award.', muted: true },
          ]}
        />

        <ProjectsFloating projects={projects} onOpen={setModal} />

        <div
          style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span className="mono">More on request — case studies, deeper dives, full client list</span>
          <a
            href="#contact"
            style={{
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--accent)',
              paddingBottom: 2,
            }}
          >
            Reach out →
          </a>
        </div>
      </div>

      <AnimatePresence>
        {modal && <ProjectModal project={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </section>
  )
}
