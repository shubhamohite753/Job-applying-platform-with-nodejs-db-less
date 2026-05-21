import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: frontendRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/files/**",
      },
    ],
  },
};

export default nextConfig;
