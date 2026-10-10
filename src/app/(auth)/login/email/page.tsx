import Bottom from "./_components/Bottom";
import CheckBox from "./_components/CheckBox";
import OauthLogin from "./_components/OauthLogin";

const EmailLoginPage = () => {
  return (
    <div>
      <div className="py-10 flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <h1 className="text-heading1">
            이메일로
            <br />
            로그인 하기
          </h1>
          <CheckBox />
        </div>
        <OauthLogin />
      </div>
      <Bottom />
    </div>
  );
};

export default EmailLoginPage;
