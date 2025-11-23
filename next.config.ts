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
  // Configure Turbopack - note: Turbopack has limited configuration options
  // The resolveAlias might not work for full paths in node_modules
  // If this doesn't work, we may need to use webpack for production builds
  turbopack: {
    resolveAlias: {
      // Try to redirect problematic modules
      "why-is-node-running": path.resolve(__dirname, "lib", "empty-module.js"),
    },
    // Try to exclude test directories (if supported)
    resolveExtensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".mjs"],
  },
  // Also configure webpack as fallback (for --webpack flag or if Turbopack is disabled)
  webpack: (config, { webpack: wp }) => {
    // Ignore the problematic dev dependency that's only used in test files
    config.plugins = config.plugins || [];

    config.plugins.push(
      new wp.IgnorePlugin({
        resourceRegExp: /^why-is-node-running$/,
      })
    );

    // Replace specific problematic test files from thread-stream with empty module
    // This prevents parsing errors from intentional syntax errors in test files
    const emptyModulePath = path.resolve(__dirname, "lib", "empty-module.js");

    // Replace the helper.js file - only match files in node_modules/thread-stream/test/
    config.plugins.push(
      new wp.NormalModuleReplacementPlugin(
        /^.*[\\/]node_modules[\\/]thread-stream[\\/]test[\\/]helper\.js$/,
        emptyModulePath
      )
    );

    // Replace the syntax-error.mjs file - only match files in node_modules/thread-stream/test/
    config.plugins.push(
      new wp.NormalModuleReplacementPlugin(
        /^.*[\\/]node_modules[\\/]thread-stream[\\/]test[\\/]syntax-error\.mjs$/,
        emptyModulePath
      )
    );

    return config;
  },
};

export default nextConfig;
