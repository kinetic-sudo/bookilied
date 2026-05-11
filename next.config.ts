import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [
    {protocol: 'https', hostname: 'covers.openlibrary.org'},
    {protocol: 'https', hostname: 'cz6kjwqboylysxrv.public.blob.vercel-storage.com'}
  ]},
  // Allow LAN access to dev assets/HMR when opening the app via local IP.
  allowedDevOrigins: ["192.168.0.130"],
};

export default nextConfig;
