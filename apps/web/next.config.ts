import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Load monorepo root .env so JWT_SECRET and API_URL are available to middleware
loadEnvConfig(path.join(__dirname, "../.."));

const apiUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/v1\/?$/, "") ||
  "http://localhost:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@rideroom/ui", "@rideroom/types"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
