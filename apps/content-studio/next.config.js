/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: process.env.VERCEL === "1",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/constantina/Constantina_Light_v2.html',
        },
      ],
      afterFiles: [
        {
          source: '/studio',
          destination: '/',
        },
      ],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
