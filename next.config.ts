import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrites deshabilitados - usando CORS directo del backend QA
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://38.225.91.15:3000/api/:path*',
  //     },
  //     {
  //       source: '/health',
  //       destination: 'http://38.225.91.15:3000/',
  //     },
  //   ];
  // },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "connect-src 'self' http://38.225.91.15:3000 https://38.225.91.15:3000 data: blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;