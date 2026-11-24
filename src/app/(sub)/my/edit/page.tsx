import { getAvatarUrl } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/server";
import { mockProfile } from "@/mocks/profile";
import ProfileEditForm from "./_components/ProfileEditForm";

const ProfileEditPage = async () => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  // /my/edit는 proxy가 로그인한 사람만 들여보냄
  // 비로그인(임시 공개 중)이면 목데이터 프로필
  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("nickname, avatar_path")
        .eq("id", userId)
        .maybeSingle()
    : { data: mockProfile };

  return (
    <ProfileEditForm
      nickname={profile?.nickname ?? ""}
      avatarUrl={getAvatarUrl(profile?.avatar_path)}
    />
  );
};

export default ProfileEditPage;
