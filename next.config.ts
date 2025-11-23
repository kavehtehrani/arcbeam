import type { NextConfig } from "next";
import path from "path";
import webpack from "webpack";

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
  webpack: (config) => {
    // Ignore the problematic dev dependency that's only used in test files
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^why-is-node-running$/,
      })
    );

    // Replace the test helper file with an empty module to prevent it from being processed
    // This handles both forward and backward slashes in paths
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /thread-stream[\\/]test[\\/]helper\.js$/,
        path.resolve(__dirname, 'lib', 'empty-module.js')
      )
    );

    return config;
  },
};

export default nextConfig;
