import BottomNav from "@/components/bottom-nav/BottomNav";
import TopNav from "@/components/top-nav/TopNav";

/**
 * 콘텐츠 폭 · 좌우 여백
 * - 모바일(~767): 최대 430, 좌우 20
 * - 태블릿(md 768~): 화면 폭 그대로, 좌우 32
 * - 데스크톱(xl 1440~): 최대 1200 가운데, 좌우 여백 없음 (화면 양옆이 남음)
 * 화면 끝까지 닿게 하는 요소(-mx-*)는 이 여백에 맞춰 같이 바꿔야 함 (HorizontalScroll, 홈 MyCardList)
 * 반응형 전 화면은 NarrowColumn으로 430 유지 (컬렉션 · 밝은 화면)
 */
const MainLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <>
      <TopNav />
      {/*
        아래 여백 40 (+ 안전 영역): 하단 바는 아래로 스크롤하면 숨으니까 바 높이만큼 비워두지 않음.
        맨 아래에서 위로 살짝 올려 바가 다시 나오면 마지막 내용 일부를 덮을 수 있음.
        데스크톱은 하단 바가 없어서 아래 여백만 80
      */}
      <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:max-w-none md:px-8 xl:max-w-300 xl:px-0 xl:pb-20">
        {children}
      </div>
      <BottomNav />
    </>
  );
};

export default MainLayout;
