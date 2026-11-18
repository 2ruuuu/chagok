import { getSupabaseEnv } from "@/lib/env";

/** 프로필 사진 버킷 (supabase/migrations/20261031090000_profile_avatar.sql) */
export const AVATAR_BUCKET = "avatars";

/** 앱에서 줄여 올리는 크기 · 형식 (버킷 제한 1MB, jpeg/png/webp) */
export const AVATAR_SIZE = 512;
export const AVATAR_MAX_BYTES = 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** profiles.avatar_path → 공개 URL. 없으면 null (기본 이미지) */
export const getAvatarUrl = (path: string | null | undefined) => {
  if (!path) return null;
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${AVATAR_BUCKET}/${path}`;
};
