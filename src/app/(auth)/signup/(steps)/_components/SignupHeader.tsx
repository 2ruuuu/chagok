"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import BackButton from "@/components/back-button/BackButton";
import { createClient } from "@/lib/supabase/client";
import QuitSignupSheet from "./QuitSignupSheet";

/**
 * 가입 단계 상단 뒤로가기.
 * 계정(세션)이 생긴 뒤의 첫 단계(이메일 가입: 비밀번호 / OAuth 가입: 닉네임)에서는
 * 이전 화면(이메일 입력·인증, 소셜 로그인)으로 돌아갈 수 없으므로 가입 중단 확인을 띄움.
 * 나머지 단계는 브라우저 뒤로가기.
 */
const SignupHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [quitOpen, setQuitOpen] = useState(false);

  const handleBack = async () => {
    if (pathname === "/signup/password") {
      setQuitOpen(true);
      return;
    }
    if (pathname === "/signup/nickname") {
      // 이메일 가입자는 비밀번호 화면으로 돌아가고, OAuth 가입자는 닉네임이 첫 단계
      const { data } = await createClient().auth.getSession();
      if (data.session?.user.app_metadata.provider !== "email") {
        setQuitOpen(true);
        return;
      }
    }
    router.back();
  };

  return (
    <>
      <div className="flex w-full justify-start py-2">
        <BackButton onClick={handleBack} />
      </div>
      <QuitSignupSheet open={quitOpen} onClose={() => setQuitOpen(false)} />
    </>
  );
};

export default SignupHeader;
