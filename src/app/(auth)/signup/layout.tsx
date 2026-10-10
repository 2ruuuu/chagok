import BackButton from "@/components/back-button/BackButton";

const SignupLayout = ({ children }: LayoutProps<"/signup">) => {
  return (
    <>
      <div className="flex w-full justify-start py-2">
        <BackButton />
      </div>
      {children}
    </>
  );
};

export default SignupLayout;
