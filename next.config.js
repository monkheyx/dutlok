/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ["better-sqlite3", "node-cron"],
  },
  output: "standalone",
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
      {
        protocol: "https",
        hostname: "wow.zamimg.com",
      },
    ],
  },
};

module.exports = nextConfig;
