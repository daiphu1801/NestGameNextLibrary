/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow API routes to receive large ROM files (up to 30MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thumbnails.libretro.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.thegamesdb.net',
      },
      {
        protocol: 'https',
        hostname: 'www.screenscraper.fr',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        // Cloudinary images and raw files
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;

