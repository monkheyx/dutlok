/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "render.worldofwarcraft.com",
      },
      {
        protocol: "https",
        hostname: "render-us.worldofwarcraft.com",
      },
      {
        protocol: "https",
        hostname: "render-eu.worldofwarcraft.com",
      },
    ],
  },
};

module.exports = nextConfig;
