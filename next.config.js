/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '/proxy/3000',
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
