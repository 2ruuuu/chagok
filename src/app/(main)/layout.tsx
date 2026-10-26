// src/app/(main)/layout.tsx
const MainLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5">
      {children}
    </div>
  );
};

export default MainLayout;
