import Image from "next/image";
import Link from "next/link";
import GoogleIcon from "@/assets/icons/google.svg";
import KakaoIcon from "@/assets/icons/kakao.svg";
import mockLogo from "@/assets/imgs/mock-logo.png";
import { Button } from "@/components/button/Button";

const LoginPage = () => {
  return (
    <div className="flex flex-1 flex-col px-5 pb-14">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <Image
          src={mockLogo}
          alt="차곡의 로고 이미지 입니다."
          loading="eager"
          className="size-25"
        />
        <div className="flex flex-col gap-2.5">
          <h1 className="text-heading1">차곡에 오신 것을 환영해요</h1>
          <p className="text-body2">나만의 영화 컬렉션을 시작해 보세요!</p>
        </div>
      </div>
      <div className="mx-auto flex w-83.75 flex-col">
        <div className="flex flex-col gap-3">
          <Button variant="google" size="xl">
            <Image src={GoogleIcon} alt="" className="size-6 " />
            Google 계정으로 로그인
          </Button>
          <Button variant="kakao" size="xl">
            <Image src={KakaoIcon} alt="" className="size-6" />
            Kakao 계정으로 로그인
          </Button>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-80" />
          <span className="text-label2 font-semibold text-neutral-70">
            또는
          </span>
          <div className="h-px flex-1 bg-neutral-80" />
        </div>
        <div className="mt-6 flex items-center justify-center gap-3 text-label2 font-medium text-neutral-70">
          <Link href="/login/email">이메일 로그인</Link>
          <div className="h-3 w-px bg-neutral-75" />
          <Link href="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
