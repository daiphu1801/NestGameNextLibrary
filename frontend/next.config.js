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
      {
        // Wikipedia & Wikimedia images (from Auto-Fix)
        protocol: 'https',
        hostname: '**.wikipedia.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        // Google image results (from Auto-Fix)
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        // downloadroms.io images
        protocol: 'https',
        hostname: 'cache.downloadroms.io',
      },
      {
        // General wildcard for other image sources found by Auto-Fix
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

