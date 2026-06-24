/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Allows the frontend to run as a standalone on Railway if needed
  // Remove if deploying only on Vercel
  // output: 'standalone',
}

export default nextConfig
