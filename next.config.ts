import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-expect-error - new config option not yet in type definition
  allowedDevOrigins: ['192.168.1.9'],
};

export default nextConfig;
