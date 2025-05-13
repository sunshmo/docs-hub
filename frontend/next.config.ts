import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

const nextConfig: NextConfig = {
  // 确保 Next.js 使用 SSG 而不是 SSR
  // https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
  output: 'export',
  // 注意：在 SSG 模式下使用 Next.js 的 Image 组件需要此功能。
  // 请参阅 https://nextjs.org/docs/messages/export-image-api 了解不同的解决方法。
  images: {
    unoptimized: true,
  },
  // 配置 assetPrefix，否则服务器无法正确解析您的资产。
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
  // ssg 模式下打包后不生效
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*', // Ensure source starts with `/api/`
  //       destination: 'http://localhost:3456/api/:path*' // Need to add `/api/` here
  //     },
  //   ];
  // },
  trailingSlash: isProd, // true：让所有 URL 变成 index.html 格式。即，`chat.html` --> `/chat/index.html`。作用：防止刷新后出现404错误
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // 允许所有来源，生产环境请修改为特定域名
          },
          // {
          //   key: "Access-Control-Allow-Methods",
          //   value: "GET, OPTIONS",
          // },
        ],
      },
    ];
  },
  allowedDevOrigins: [
    'tauri.localhost',
    'http://tauri.localhost',
    'tauri://localhost',
  ],
  crossOrigin: 'anonymous',
};

export default nextConfig;
