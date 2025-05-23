/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove swcMinify - it's enabled by default in Next.js 13+
  experimental: {
    // Add any experimental features you need here
  },
}

export default nextConfig