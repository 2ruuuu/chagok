import Image from "next/image";
import Link from "next/link";
import mockLogo from "@/assets/imgs/mock-logo.png";
import { buttonVariants } from "@/components/button/Button";

const CompletePage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <Image
          src={mockLogo}
          alt="차곡의 로고 이미지 입니다."
          loading="eager"
          className="size-25"
        />
        <div className="flex flex-col gap-2.5">
          <h1 className="text-heading1">차곡에 오신 걸 환영해요.</h1>
        </div>
      </div>
      <Link href="/" replace className={buttonVariants()}>
        시작하기
      </Link>
    </div>
  );
};

export default CompletePage;
