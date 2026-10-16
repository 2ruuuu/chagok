import Bottom from "./_components/Bottom";
import Header from "./_components/Header";
import OauthLogin from "./_components/OauthLogin";

const LoginPage = () => {
  return (
    <>
      <Header />
      <div className="flex w-full flex-col">
        <OauthLogin />
        <Bottom />
      </div>
    </>
  );
};

export default LoginPage;
