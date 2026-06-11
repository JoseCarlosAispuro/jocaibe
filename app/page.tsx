import navData from '@/app/data/nav.json'
import heroData from '@/app/data/hero.json'
import timelineData from '@/app/data/timeline.json'
import projectsData from '@/app/data/projects.json'
import skillsData from '@/app/data/skills.json'
import contactData from '@/app/data/contact.json'
import pageData from '@/app/data/page.json'

import Navigation from '@/app/partials/Navigation'
import CursorFX from '@/app/partials/CursorFX'
import FloatingAvailability from '@/app/partials/FloatingAvailability'
import Hero from '@/app/components/Hero'
import Timeline from '@/app/components/Timeline'
import Projects from '@/app/components/Projects'
import Skills from '@/app/components/Skills'
import Contact from '@/app/components/Contact'

const Home = () => {
  return (
    <>
      <CursorFX />
      <Navigation links={navData.links} email={pageData.email}/>
      <main>
        <Hero
          data={heroData}
          available={pageData.available}
          availableLabel={pageData.available_label}
        />
        <Timeline data={timelineData} />
        <Projects data={{ projects: projectsData as never }} />
        <Skills data={skillsData} />
        <Contact data={contactData} />
      </main>
      <FloatingAvailability />
    </>
  )
}

export default Home
