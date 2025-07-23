/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removing this line to enable API Routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
