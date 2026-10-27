import { createClient } from "@/lib/supabase/server";
import NicknameForm from "./_components/NicknameForm";

const NicknamePage = async () => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  // 약관 동의 기록이 없으면(소셜 가입자 등) 닉네임보다 약관을 먼저 받음
  let needsAgreement = true;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("terms_agreed_at")
      .eq("id", userId)
      .maybeSingle();
    needsAgreement = !profile?.terms_agreed_at;
  }

  return <NicknameForm needsAgreement={needsAgreement} />;
};

export default NicknamePage;
