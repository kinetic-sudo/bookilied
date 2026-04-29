import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN access to dev assets/HMR when opening the app via local IP.
  allowedDevOrigins: ["192.168.0.130"],
};

export default nextConfig;
