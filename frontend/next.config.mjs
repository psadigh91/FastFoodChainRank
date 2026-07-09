/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'ChainRank',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },
}

export default nextConfig
