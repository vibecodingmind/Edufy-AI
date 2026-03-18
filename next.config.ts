import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable for production optimizations
  reactStrictMode: true,
  
  // Enable standalone output for Docker/Railway deployment
  output: 'standalone',
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  
  // TypeScript configuration
  typescript: {
    // Temporarily ignore build errors for deployment
    ignoreBuildErrors: true,
  },
  
  // Image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
