/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that should not be bundled by webpack in server components
  serverExternalPackages: ['@react-pdf/renderer'],

  experimental: {
    // Enable App Router features
  },

  // Enable streaming for flight search and travel data
  async rewrites() {
    return [
      {
        source: '/api/flights/stream',
        destination: '/api/flights/search?stream=true',
      },
      {
        source: '/api/hotels/stream',
        destination: '/api/hotels/search?stream=true',
      },
      {
        source: '/api/activities/stream',
        destination: '/api/activities/search?stream=true',
      },
    ];
  },

  // Environment variables for phase-based development
  env: {
    USE_MOCK_APIS: process.env.USE_MOCK_APIS || 'true',
    DEVELOPMENT_PHASE: process.env.DEVELOPMENT_PHASE || '1',
  },

  // Optimize for travel images and assets
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      // Add travel service image domains
      'cf.bstatic.com', // Booking.com
      'media.viator.com', // Viator
      'cache.graphicslib.viator.com', // Viator graphics
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for streaming and CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cache-Control',
          },
        ],
      },
      {
        source: '/api/:path*/stream',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
          {
            key: 'Content-Type',
            value: 'text/event-stream',
          },
        ],
      },
    ];
  },

  // Performance optimizations for travel booking flow
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer for optimizing package size
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
};

export default nextConfig;
