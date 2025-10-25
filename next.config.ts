import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.myntassets.com",
      },
      {
        protocol: "http",
        hostname: "assets.myntassets.com",
      },
    ],
  },
};

export default nextConfig;
