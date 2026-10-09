const AuthLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <div className="flex flex-1 flex-col px-5 pb-14 m-auto">{children}</div>
  );
};

export default AuthLayout;
