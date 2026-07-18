import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  typescript: {
    ignoreBuildErrors: process.env.VERCEL === "1",
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
