import Link from "next/link";
import { Button } from "@/components/button/Button";

const Bottom = () => {
  return (
    <div className="flex flex-col gap-2.5">
      <Button>로그인</Button>
      <div className="flex items-center justify-center gap-3 text-label2 font-medium text-neutral-70">
        <span className="w-20 text-right">
          <Link href="/find-id">아이디 찾기</Link>
        </span>
        <div className="h-3 w-px bg-neutral-75" />
        <span className="w-20 text-center">
          <Link href="/find-password">비밀번호 찾기</Link>
        </span>
        <div className="h-3 w-px bg-neutral-75" />
        <span className="w-20 text-left">
          <Link href="/signup">회원가입</Link>
        </span>
      </div>
    </div>
  );
};

export default Bottom;
