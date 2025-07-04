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
};

export default nextConfig;