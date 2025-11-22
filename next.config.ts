import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Suppress hydration warnings from third-party libraries (like Privy)
  reactStrictMode: true,
  // This helps with hydration mismatches from external libraries
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Explicitly set the root directory to prevent Next.js from detecting lockfiles in parent directories
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
