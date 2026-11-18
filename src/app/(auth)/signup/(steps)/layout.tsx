import SignupHeader from "./_components/SignupHeader";

const SignupLayout = ({ children }: LayoutProps<"/signup">) => {
  return (
    <>
      <SignupHeader />
      {children}
    </>
  );
};

export default SignupLayout;
