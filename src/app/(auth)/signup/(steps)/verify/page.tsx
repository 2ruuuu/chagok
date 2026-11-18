import { redirect } from "next/navigation";
import VerifyForm from "./_components/VerifyForm";

const Verify = async ({ searchParams }: PageProps<"/signup/verify">) => {
  const { email, marketing } = await searchParams;

  // 인증번호를 보낸 이메일을 모르면 확인할 수 없으므로 이메일 입력부터 다시
  if (typeof email !== "string" || !email) {
    redirect("/signup");
  }

  return <VerifyForm email={email} marketing={marketing === "1"} />;
};

export default Verify;
