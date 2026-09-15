import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@relyo/kernel", "@relyo/discovery", "@relyo/contracts"],
};

export default nextConfig;
