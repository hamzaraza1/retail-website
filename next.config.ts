import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Product saves carry up to 8 resized photos in demo mode (data URLs, ~150–400 KB each).
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
