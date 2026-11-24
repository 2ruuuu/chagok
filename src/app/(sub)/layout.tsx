import ThemedScreen from "@/components/themed-screen/ThemedScreen";
import TopNav from "@/components/top-nav/TopNav";
import { getHasUnreadNotifications } from "@/lib/notifications";

/**
 * 하단 바 없는 테마 화면 (프로필 편집 · 알림 · 나의 감상 · 관람 리뷰 · 설정)
 * 가운데 한 열: 모바일 최대 430 / 태블릿(md) 560 / 데스크톱(xl) 640 (+ 좌우 여백 20)
 * 데스크톱은 하단 바가 없으니 다른 화면처럼 상단 헤더(TopNav)로 다른 탭 이동
 */
const SubLayout = async ({ children }: LayoutProps<"/">) => {
  const hasUnreadNotifications = await getHasUnreadNotifications();

  return (
    <>
      <TopNav hasUnreadNotifications={hasUnreadNotifications} />
      <ThemedScreen>
        <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5 pb-10 md:max-w-150 xl:max-w-170 xl:pb-20">
          {children}
        </div>
      </ThemedScreen>
    </>
  );
};

export default SubLayout;
