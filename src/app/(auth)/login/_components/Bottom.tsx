import Link from "next/link";

const Bottom = () => {
  return (
    <>
      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-80" />
        <span className="text-label2 font-semibold text-neutral-70">또는</span>
        <div className="h-px flex-1 bg-neutral-80" />
      </div>
      <div className="mt-6 flex items-center justify-center gap-3 text-label2 font-medium text-neutral-70">
        <span className="w-25 text-right">
          <Link href="/login/email">이메일 로그인</Link>
        </span>
        <div className="h-3 w-px bg-neutral-75" />
        <span className="w-25">
          <Link href="/signup">회원가입</Link>
        </span>
      </div>
    </>
  );
};

export default Bottom;
