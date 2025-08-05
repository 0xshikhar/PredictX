/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
    const frameAncestors = `frame-ancestors 'self' http://localhost:3000 https://auth.privy.io ${vercelUrl}`.trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: frameAncestors
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
