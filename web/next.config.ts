import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.HR_BACKEND_URL || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "")
    return backend ? [{ source: "/api/hr/:path*", destination: `${backend}/:path*` }] : []
  },
  async redirects() {
    return [{ source: "/styleguide", destination: "/", permanent: true }]
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
