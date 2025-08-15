import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: false, // Disable Turbopack for build
  },
  /* config options here */
};

export default nextConfig;
