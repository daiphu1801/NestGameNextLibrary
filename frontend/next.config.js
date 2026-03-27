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
        // RAWG API images
        protocol: 'https',
        hostname: 'media.rawg.io',
      },
      {
        // IGDB images (used in leaderboard)
        protocol: 'https',
        hostname: 'images.igdb.com',
      },
      {
        // IGN images (often found in search results)
        protocol: 'https',
        hostname: 'assets-prd.ignimgs.com',
      },
      {
        // General wildcard for other image sources found by Auto-Fix
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply COEP to all pages EXCEPT j2me-emulator proxy and ROM API
        source: '/((?!j2me-emulator|api/roms).*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        // Explicitly allow CORS on the API proxy route
        source: '/api/roms/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/j2me-emulator/:path*',
        destination: 'https://pub-87204256ff0f4764bde4d1dd64f4c380.r2.dev/j2me-emulator/:path*'
      }
    ];
  }
};

module.exports = nextConfig;

