import ThemedScreen from "@/components/themed-screen/ThemedScreen";

/**
 * 하단 바 있는 테마 화면 (마이)
 * 가운데 한 열: 모바일 최대 430 / 태블릿(md) 560 / 데스크톱(xl) 640
 * 좌우 여백은 (main) layout이 줌 (모바일 20 · 태블릿 32 · 데스크톱 0)
 */
const MainThemedLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <ThemedScreen>
      <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col md:max-w-140 xl:max-w-160">
        {children}
      </div>
    </ThemedScreen>
  );
};

export default MainThemedLayout;
