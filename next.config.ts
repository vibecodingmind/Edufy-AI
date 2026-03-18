import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable for production optimizations
  reactStrictMode: true,
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  
  // TypeScript configuration
  typescript: {
    // Don't ignore build errors in production
    ignoreBuildErrors: false,
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
