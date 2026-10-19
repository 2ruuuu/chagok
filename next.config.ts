import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.*.*", "172.30.*.*"],
};

export default nextConfig;
