"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type OauthProvider = "google" | "kakao";

/**
 * 소셜 로그인 시작. /login, /login/email 의 버튼이 같이 씀.
 * 흐름: 구글/카카오 → Supabase → /auth/callback(세션 교환) → /
 * 신규 가입자는 proxy가 /signup/nickname(약관 동의 → 닉네임)으로 보냄.
 */
export const useOauthLogin = () => {
  const router = useRouter();
  /** 이동 중인 provider. 있으면 버튼을 잠가 두 번 누르지 못하게 함 */
  const [pendingProvider, setPendingProvider] = useState<OauthProvider | null>(
    null,
  );

  // 구글/카카오 화면에서 뒤로가기로 돌아오면 페이지가 bfcache에서 그대로 복원돼
  // 버튼이 잠긴 채 남으므로 풀어줌
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setPendingProvider(null);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const signInWithOauth = async (provider: OauthProvider) => {
    if (pendingProvider) {
      return;
    }
    setPendingProvider(provider);

    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // 성공하면 브라우저가 구글/카카오로 이동하므로 잠금 유지
    if (error) {
      console.error("[signInWithOauth] 소셜 로그인 시작 실패:", error);
      setPendingProvider(null);
      router.replace("/login?error=auth");
    }
  };

  return { signInWithOauth, pendingProvider };
};
