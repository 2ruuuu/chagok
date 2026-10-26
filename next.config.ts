import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.*.*", "172.30.*.*", "10.64.120.123"],
};

export default nextConfig;
