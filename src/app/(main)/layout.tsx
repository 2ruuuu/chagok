import BottomNav from "@/components/bottom-nav/BottomNav";

const MainLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <>
      {/*
        아래 여백 40 (+ 안전 영역): 하단 바는 아래로 스크롤하면 숨으니까 바 높이만큼 비워두지 않음.
        맨 아래에서 위로 살짝 올려 바가 다시 나오면 마지막 내용 일부를 덮을 수 있음
      */}
      <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <BottomNav />
    </>
  );
};

export default MainLayout;
