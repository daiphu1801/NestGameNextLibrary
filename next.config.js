/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

