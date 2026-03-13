import type { NextConfig } from "next";

// On Vercel, vercel.json routes handle /api/* → Python serverless.
// Locally, Next.js rewrites proxy /api/* → FastAPI dev server.
const isVercel = !!process.env.VERCEL;
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:8010";

const nextConfig: NextConfig = {
  ...(!isVercel && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: `${INTERNAL_API_URL}/api/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
