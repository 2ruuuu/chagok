import CircleButton from "@/components/circle-button/CircleButton";

const OauthLogin = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-80" />
        <span className="text-label2 font-semibold text-neutral-70">
          SNS 계정으로 로그인
        </span>
        <div className="h-px flex-1 bg-neutral-80" />
      </div>
      <div className="flex gap-4 justify-center">
        <CircleButton provider="google" />
        <CircleButton provider="kakao" />
      </div>
    </div>
  );
};

export default OauthLogin;
