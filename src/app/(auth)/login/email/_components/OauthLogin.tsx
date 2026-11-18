"use client";

import CircleButton from "@/components/circle-button/CircleButton";
import { useOauthLogin } from "@/hooks/useOauthLogin";

const OauthLogin = () => {
  const { signInWithOauth, pendingProvider } = useOauthLogin();
  const isPending = pendingProvider !== null;

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-80" />
        <span className="text-label2 font-semibold text-neutral-70">
          SNS 계정으로 로그인
        </span>
        <div className="h-px flex-1 bg-neutral-80" />
      </div>
      <div className="flex justify-center gap-4">
        <CircleButton
          provider="google"
          disabled={isPending}
          onClick={() => signInWithOauth("google")}
        />
        <CircleButton
          provider="kakao"
          disabled={isPending}
          onClick={() => signInWithOauth("kakao")}
        />
      </div>
    </div>
  );
};

export default OauthLogin;
