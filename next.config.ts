import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-718976c9b47c471181dcff4a36a71e96.r2.dev',
      },
    ],
  },
}

export default nextConfig
