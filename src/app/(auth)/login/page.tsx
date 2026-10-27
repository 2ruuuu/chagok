import Bottom from "./_components/Bottom";
import Header from "./_components/Header";
import OauthLogin from "./_components/OauthLogin";

const LoginPage = async ({ searchParams }: PageProps<"/login">) => {
  // /auth/callback에서 세션 교환에 실패하거나, 구글/카카오 화면에서 취소하면 ?error=auth
  const { error } = await searchParams;

  return (
    <>
      <Header />
      <div className="flex w-full flex-col">
        {error === "auth" && (
          <p
            role="alert"
            className="mb-4 text-center text-body3 text-status-danger"
          >
            소셜 로그인을 완료하지 못했어요. 다시 시도해 주세요.
          </p>
        )}
        <OauthLogin />
        <Bottom />
      </div>
    </>
  );
};

export default LoginPage;
