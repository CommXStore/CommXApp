import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.com',
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  turbopack: {
    debugIds: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig
