import LightScreen from "@/components/light-screen/LightScreen";

/** 하단 바 없는 밝은 화면 (설정) */
const DetailLightLayout = ({ children }: LayoutProps<"/">) => {
  return <LightScreen>{children}</LightScreen>;
};

export default DetailLightLayout;
