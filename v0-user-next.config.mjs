/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // This is important for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/cyberpunga' : '',
};

export default nextConfig;

