import type { Metadata } from 'next'

const TITLE       = 'Jose Aispuro — Senior Frontend Engineer'
const DESCRIPTION = 'Senior Frontend Engineer specialising in interactive web experiences. Award-winning work across product, creative and agency. Available for Q3 2026.'
const SITE_URL    = 'https://jocaibe.com'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),

  openGraph: {
    type:        'website',
    url:         SITE_URL,
    title:       TITLE,
    description: DESCRIPTION,
    siteName:    'jocaibe',
    images: [
      { url: '/og.png',        width: 1200, height: 630,  alt: TITLE },
      { url: '/og-square.png', width: 1200, height: 1200, alt: TITLE },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       TITLE,
    description: DESCRIPTION,
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
