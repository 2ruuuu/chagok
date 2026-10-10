import { Button } from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";

const NickNamePage = () => {
  return (
    <div className="py-10 flex flex-col gap-20">
      <div className="flex flex-col gap-6">
        <h1 className="text-heading1">
          어떻게 불러드릴까요?
          <br />
          나중에 언제든 바꿀 수 있어요.
        </h1>
        <TextInput
          type="text"
          id="nickname"
          placeholder="촉촉한 초코칩"
          labelText="닉네임 입력"
        />
      </div>
      <Button variant="disable">시작하기</Button>
    </div>
  );
};

export default NickNamePage;
