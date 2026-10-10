import { Button } from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";

const PasswordPage = () => {
  return (
    <div className="py-10 flex flex-col gap-20">
      <div className="flex flex-col gap-6">
        <h1 className="text-heading1">
          로그인에 사용할
          <br />
          비밀번호를 입력해 주세요.
        </h1>
        <TextInput
          type="password"
          id="password"
          placeholder="8자 이상의 비밀번호"
          labelText="비밀번호"
        />
        <TextInput
          type="password"
          id="passwordCheck"
          placeholder="8자 이상의 비밀번호"
          labelText="비밀번호 확인"
        />
      </div>
      <Button variant="disable">회원가입 완료</Button>
    </div>
  );
};

export default PasswordPage;
