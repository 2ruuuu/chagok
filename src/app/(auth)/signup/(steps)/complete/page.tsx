import Image from "next/image";
import Link from "next/link";
import chagokLogo from "@/assets/imgs/chagok-logo.png";
import { buttonVariants } from "@/components/button/Button";

const CompletePage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <Image
          src={chagokLogo}
          alt="차곡"
          loading="eager"
          // 스플래시 로고와 같은 폭 (172)
          className="h-auto w-43"
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
