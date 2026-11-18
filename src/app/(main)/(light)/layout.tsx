import LightScreen from "@/components/light-screen/LightScreen";
import NarrowColumn from "@/components/narrow-column/NarrowColumn";

/**
 * 하단 바 있는 밝은 화면 (마이 · 프로필 편집 · 알림).
 * 아직 반응형 전이라 태블릿 · 데스크톱에서도 모바일 폭으로 (NarrowColumn)
 */
const MainLightLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <LightScreen>
      <NarrowColumn>{children}</NarrowColumn>
    </LightScreen>
  );
};

export default MainLightLayout;
