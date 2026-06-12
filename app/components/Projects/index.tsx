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

const Projects = ({ data }: { data: ProjectsData }) => {
  const { projects } = data
  const [modal, setModal] = useState<Project | null>(null)

  return (
    <section id="projects" className="py-(--s-section) relative">
      <div className="container mx-auto px-(--gutter)">
        <SectionHeading
          lines={[
            { text: 'Seven projects,' },
            { text: 'One award.', muted: true },
          ]}
        />

        <ProjectsFloating projects={projects} onOpen={setModal} />

        <div className="mt-16 pt-8 border-t border-(--border) flex justify-between items-center flex-wrap gap-4">
          <span className="mono">More on request — case studies, deeper dives, full client list</span>
          <a
            href="#contact"
            className="text-(--accent) font-(--font-mono) text-[12px] tracking-[0.08em] uppercase border-b border-(--accent) pb-[2px]"
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

export default Projects
