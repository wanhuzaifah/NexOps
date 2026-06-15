import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // pdf-lib and docxtemplater run client-side, but docxtemplater/pizzip need
  // to be excluded from server bundling if used in API routes
  serverExternalPackages: ['docxtemplater', 'pizzip'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
