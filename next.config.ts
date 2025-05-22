/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 👇 This line tells Next.js to IGNORE ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
