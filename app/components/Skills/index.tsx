'use client'

import SectionHeading from '@/app/partials/SectionHeading'
import SkillsCloud from './SkillsCloud'

interface SkillGroup {
  cat: string
  items: string[]
}

const Skills = ({ data }: { data: SkillGroup[] }) => {
  return (
    <section
      id="skills"
      className="py-(--s-section) relative"
    >
      <div className="container mx-auto px-(--gutter)">
        <SectionHeading
          lines={[
            { text: "What I'm sharp on," },
            { text: 'top to bottom.', muted: true },
          ]}
        />
        <SkillsCloud groups={data} />
      </div>
    </section>
  )
}

export default Skills
