import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /**
   * Allow phone/LAN testing of local dev (HMR + /_next/*).
   * Without this, Next blocks cross-origin requests from e.g. 192.168.x.x.
   */
  allowedDevOrigins: [
    "192.168.0.3",
    "127.0.0.1",
    "localhost",
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;