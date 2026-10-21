import type { Metadata } from 'next'

const TITLE       = 'José Aispuro — Senior Frontend Engineer · Interactive & Motion'
const TITLE_OG    = 'José Aispuro — Senior Frontend Engineer'
const DESCRIPTION = 'Senior Frontend Engineer specialising in React, Next.js, and motion-driven web experiences. Award-winning work for Alphabet and global agencies. Open to remote roles.'
const DESCRIPTION_OG = 'Eight years building award-winning web experiences for Alphabet, agencies, and headless commerce. Awwwards SOTD 2024.'
const SITE_URL    = 'https://jocaibe.com'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),

  authors: [{ name: 'José Carlos Aispuro Beltrán', url: SITE_URL }],

  keywords: [
    'Senior Frontend Engineer',
    'React',
    'Next.js',
    'TypeScript',
    'Motion',
    'WebGL',
    'Three.js',
    'Framer Motion',
    'GSAP',
    'Remote',
  ],

  robots: { index: true, follow: true },

  openGraph: {
    type:        'website',
    url:         SITE_URL,
    title:       TITLE_OG,
    description: DESCRIPTION_OG,
    siteName:    'jocaibe',
    locale:      'en_US',
    images: [
      { url: '/og.png',        width: 1200, height: 630,  alt: TITLE_OG },
      { url: '/og-square.png', width: 1200, height: 1200, alt: TITLE_OG },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       TITLE_OG,
    description: DESCRIPTION_OG,
    images:      ['/og.png'],
  },

  icons: {
    icon:  [{ url: '/favicon.ico', sizes: '32x32' }, { url: '/icon.png', sizes: '512x512' }],
    apple: '/apple-icon.png',
  },

  alternates: {
    canonical: SITE_URL,
  },
}
