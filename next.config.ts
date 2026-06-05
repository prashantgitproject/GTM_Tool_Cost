import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "www.clarityhq.ai",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "www.clarityhq.ai",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
