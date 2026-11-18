"use server";

import { RedirectType, redirect } from "next/navigation";
import {
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
} from "@/lib/avatar";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_ACTIONS, type AvatarAction, profileSchema } from "./schemas";

const isAvatarAction = (value: unknown): value is AvatarAction =>
  AVATAR_ACTIONS.includes(value as AvatarAction);

/**
 * 프로필 저장 → /my (replace: 뒤로가기로 편집 화면에 다시 오지 않게)
 * FormData: nickname, avatarAction(keep | upload | remove), avatar(upload일 때 jpeg 파일)
 */
export async function updateProfile(
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = profileSchema.safeParse({
    nickname: formData.get("nickname"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    };
  }
  const { nickname } = parsed.data;

  const avatarAction = formData.get("avatarAction");
  if (!isAvatarAction(avatarAction)) {
    return { error: "입력값을 확인해 주세요." };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) {
    // TODO: 임시. /my가 로그인 없이 열려 있는 동안은 저장하지 않고 마이로만 이동
    // (proxy.ts 임시 공개 정리할 때 redirect("/login")으로 되돌리기)
    redirect("/my", RedirectType.replace);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) {
    console.error("[updateProfile] profiles 행 없음:", userId);
    return { error: "프로필을 저장하지 못했어요." };
  }

  // 1. 새 사진이면 먼저 올림 (경로에 시각을 넣어 이전 사진 캐시가 보이지 않게)
  let uploadedPath: string | null = null;
  if (avatarAction === "upload") {
    const file = formData.get("avatar");
    if (
      !(file instanceof File) ||
      !AVATAR_MIME_TYPES.includes(file.type) ||
      file.size > AVATAR_MAX_BYTES
    ) {
      return { error: "사진을 올리지 못했어요. 다른 사진을 골라 주세요." };
    }
    uploadedPath = `${userId}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(uploadedPath, file, { contentType: file.type });
    if (uploadError) {
      console.error("[updateProfile] 사진 업로드 실패:", uploadError);
      return { error: "사진을 올리지 못했어요." };
    }
  }

  const nextAvatarPath =
    avatarAction === "upload"
      ? uploadedPath
      : avatarAction === "remove"
        ? null
        : profile.avatar_path;

  // 2. 닉네임 · 사진 경로를 한 번에 저장
  const { error } = await supabase
    .from("profiles")
    .update({ nickname, avatar_path: nextAvatarPath })
    .eq("id", userId);
  if (error) {
    // 저장이 안 됐으면 방금 올린 사진은 쓸 곳이 없으니 지움
    if (uploadedPath) {
      await supabase.storage.from(AVATAR_BUCKET).remove([uploadedPath]);
    }
    // unique_violation (profiles_nickname_unique_idx)
    if (error.code === "23505") {
      return { error: "이미 사용 중인 닉네임이에요." };
    }
    console.error("[updateProfile] 프로필 저장 실패:", error.code, error);
    return { error: "프로필을 저장하지 못했어요." };
  }

  // 3. 바뀐 사진이면 이전 사진 파일 정리 (실패해도 프로필은 저장됐으니 로그만)
  if (profile.avatar_path && profile.avatar_path !== nextAvatarPath) {
    const { error: removeError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([profile.avatar_path]);
    if (removeError) {
      console.error("[updateProfile] 이전 사진 삭제 실패:", removeError);
    }
  }

  redirect("/my", RedirectType.replace);
}
