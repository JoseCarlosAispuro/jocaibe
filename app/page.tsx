import navData from '@/app/data/nav.json'
import heroData from '@/app/data/hero.json'
import timelineData from '@/app/data/timeline.json'
import pageData from '@/app/data/page.json'

import Navigation from '@/app/partials/Navigation'
import Hero from '@/app/components/Hero'
import Timeline from '@/app/components/Timeline'

export default function Home() {
  return (
    <>
      <Navigation logo={navData.logo} links={navData.links} />
      <main style={{ background: 'var(--bg-0)' }}>
        <Hero
          data={heroData}
          available={pageData.available}
          availableLabel={pageData.available_label}
        />
        <Timeline data={timelineData} />
      </main>
    </>
  )
}
