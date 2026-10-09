import BackButton from "@/components/back-button/BackButton";
import Bottom from "./_components/Bottom";
import CheckBox from "./_components/CheckBox";
import OauthLogin from "./_components/OauthLogin";

const EmailLoginPage = () => {
  return (
    <div>
      <div className="w-full flex justify-start py-2">
        <BackButton />
      </div>
      <div className="py-10 flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <span className="text-heading1">
            이메일로
            <br />
            로그인 하기
          </span>
          <CheckBox />
        </div>
        <OauthLogin />
      </div>
      <Bottom />
    </div>
  );
};

export default EmailLoginPage;
