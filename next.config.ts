import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.devtunnels.ms"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
      allowedOrigins: isDev ? ["localhost:3000", "*.devtunnels.ms"] : [],
    },
  },
};

export default nextConfig;
