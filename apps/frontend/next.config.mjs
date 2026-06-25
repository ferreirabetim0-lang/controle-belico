/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  webpack: (config) => {
    // pdfjs-dist tries to require 'canvas' in Node.js — stub it out for the browser build
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
