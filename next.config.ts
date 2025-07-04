import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy para evitar Mixed Content en producción
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://38.225.91.15:3000/api/:path*',
      },
      {
        source: '/health',
        destination: 'http://38.225.91.15:3000/',
      },
    ];
  },
};

export default nextConfig;