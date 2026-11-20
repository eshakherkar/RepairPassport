import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The round "N" badge shown only during `npm run dev`. Bottom-right keeps
  // it from covering the sidebar's "Back to website" link.
  devIndicators: { position: "bottom-right" },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
