import SignupForm from "../_components/SignupForm";

const SignUpPage = async ({ searchParams }: PageProps<"/signup">) => {
  // 인증 화면의 [이메일 다시 입력하기]에서 돌아오면 입력했던 이메일을 채워 둠
  const { email } = await searchParams;
  return <SignupForm defaultEmail={typeof email === "string" ? email : ""} />;
};

export default SignUpPage;
