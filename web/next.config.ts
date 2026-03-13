import type { NextConfig } from "next";

// Internal (server-side) FastAPI URL used by the Next.js rewrite proxy.
// Set INTERNAL_API_URL in your env if the API runs somewhere else.
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:8010";

const nextConfig: NextConfig = {
  // Proxy /api/* through Next.js server so the browser never makes a
  // cross-origin request to the FastAPI backend (eliminates CORS failures).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${INTERNAL_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
