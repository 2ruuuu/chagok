"use client";

import Image from "next/image";
import GoogleIcon from "@/assets/icons/google.svg";
import KakaoIcon from "@/assets/icons/kakao.svg";
import Button from "@/components/button/Button";
import { useOauthLogin } from "@/hooks/useOauthLogin";

const OauthLogin = () => {
  const { signInWithOauth, pendingProvider } = useOauthLogin();
  const isPending = pendingProvider !== null;

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="google"
        size="xl"
        disabled={isPending}
        onClick={() => signInWithOauth("google")}
      >
        <Image src={GoogleIcon} alt="" aria-hidden className="size-6" />
        Google 계정으로 로그인
      </Button>
      <Button
        type="button"
        variant="kakao"
        size="xl"
        disabled={isPending}
        onClick={() => signInWithOauth("kakao")}
      >
        <Image src={KakaoIcon} alt="" aria-hidden className="size-6" />
        Kakao 계정으로 로그인
      </Button>
    </div>
  );
};

export default OauthLogin;
