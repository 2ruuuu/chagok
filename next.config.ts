import type { NextConfig } from "next";
import { getSupabaseEnv } from "./src/lib/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.*.*", "172.30.*.*", "10.64.120.123"],
  images: {
    remotePatterns: [
      // 프로필 사진 (Supabase Storage avatars 공개 버킷)
      new URL(`${getSupabaseEnv().url}/storage/v1/object/public/avatars/**`),
      // 영화 포스터 (TMDB)
      new URL("https://image.tmdb.org/t/p/**"),
    ],
  },
};

export default nextConfig;
