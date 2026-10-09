import Image from "next/image";
import GoogleIcon from "@/assets/icons/google.svg";
import KakaoIcon from "@/assets/icons/kakao.svg";
import { Button } from "@/components/button/Button";

const OauthLogin = () => {
  return (
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
  );
};

export default OauthLogin;
