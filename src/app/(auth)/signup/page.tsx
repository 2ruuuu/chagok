import Link from "next/link";
import { Button } from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";

const SignUpPage = () => {
  return (
    <div>
      <div className="py-10 flex flex-col gap-20">
        <div className="flex flex-col gap-6">
          <h1 className="text-heading1">
            안녕하세요!
            <br />
            이메일로 가입해주세요.
          </h1>
          <TextInput
            type="email"
            id="email"
            placeholder="abc@email.com"
            labelText="이메일(아이디)"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-center gap-3">
            <span className="text-label2 text-neutral-70">
              이미 계정이 있으신가요?
            </span>
            <Link href="/login" className="text-label3 text-common-0">
              로그인
            </Link>
          </div>
          <Button variant="disable">인증 번호 전송</Button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
