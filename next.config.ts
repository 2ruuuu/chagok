import type { NextConfig } from "next";
import { getSupabaseEnv } from "./src/lib/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.*.*", "172.30.*.*", "10.64.120.123"],
  images: {
    // 프로필 사진 (Supabase Storage avatars 공개 버킷)
    remotePatterns: [
      new URL(`${getSupabaseEnv().url}/storage/v1/object/public/avatars/**`),
    ],
  },
};

export default nextConfig;
