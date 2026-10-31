import LightScreen from "@/components/light-screen/LightScreen";

/** 하단 바 있는 밝은 화면 (마이 · 프로필 편집 · 알림) */
const MainLightLayout = ({ children }: LayoutProps<"/">) => {
  return <LightScreen>{children}</LightScreen>;
};

export default MainLightLayout;
