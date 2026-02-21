/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
