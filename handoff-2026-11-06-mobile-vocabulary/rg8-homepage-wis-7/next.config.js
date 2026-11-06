/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wcfresource.a1edu.com",
      },
      {
        protocol: "http",
        hostname: "wcfresource.a1edu.com",
      },
    ],
  },
  // Keep study storage, cookies, API and result routes on the homepage origin.
  // Only the local development server forwards the EB/PB study UI to Vite.
  async rewrites() {
    return {
      beforeFiles: process.env.NODE_ENV === 'development'
        ? [{
            source: '/study/BookReading/:path*',
            destination: 'http://127.0.0.1:3030/study/BookReading/:path*',
          }]
        : [],
    }
  },
  async redirects() {
    return [
      {
        source: '/Library/DodoABCWorkSheetMP3',
        has: [
          {
            type: 'query',
            key:'CoursesName'
          }
        ],
        destination: 'https://util.readinggate.com/Library/DodoABCWorkSheetMP3',
        permanent: false
      },
      {
        source: '/Library/DodoABCWorkSheetQR',
        has: [
          {
            type: 'query',
            key:'LevelName'
          }
        ],
        destination: 'https://util.readinggate.com/Library/DodoABCWorkSheetQR',
        permanent: false
      },
      {
        source: '/Main/Index',
        destination: '/',
        permanent: false
      }
    ]
  }
};

module.exports = nextConfig;
