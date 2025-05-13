import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://tauri.localhost',
    'tauri://localhost',
  ],
  crossOrigin: 'anonymous',
  // async headers() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       headers: [
  //         { key: 'Access-Control-Allow-Credentials', value: 'true' },
  //         { key: 'Access-Control-Allow-Origin', value: '*' },
  //         {
  //           key: 'Access-Control-Allow-Methods',
  //           value: 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
  //         },
  //         {
  //           key: 'Access-Control-Allow-Headers',
  //           value: 'Content-Type,Authorization,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date'
  //         },
  //         { key: 'Cache-Control', value: 'no-cache' },
  //         { key: 'Connection', value: 'keep-alive' }
  //       ]
  //     }
  //   ];
  // },
};

export default nextConfig;
