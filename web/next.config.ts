import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporary: remove when the Overview page exists at `/`.
  async redirects() {
    return [{ source: "/", destination: "/styleguide", permanent: false }]
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
