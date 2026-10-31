import BottomNav from "@/components/bottom-nav/BottomNav";

const MainLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <>
      {/* 아래 여백: 하단 바(60) + 안전 영역 + 시안의 마지막 섹션과 바 사이 30 */}
      <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5 pb-[calc(5.625rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <BottomNav />
    </>
  );
};

export default MainLayout;
