const AuthLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <div className="flex flex-1 flex-col mx-auto w-full max-w-93.75 px-5 pb-14">
      {children}
    </div>
  );
};

export default AuthLayout;
