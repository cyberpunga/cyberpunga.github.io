import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // For GitHub Pages deployment
  output: "export",
  // Configure base path if deploying to a subfolder
  // basePath: '/your-repo-name',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
