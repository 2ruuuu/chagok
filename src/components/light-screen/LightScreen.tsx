import type { ReactNode } from "react";

interface LightScreenProps {
  children: ReactNode;
}

/**
 * 밝은 배경 화면 (마이 · 프로필 편집 · 알림 · 설정). 기본 글자색도 어둡게.
 * 배경은 globals.css의 body:has([data-light-screen])가 body 자체를 밝게 바꿈
 * → iPhone Safari 아래 툴바 · 당겨서 늘어나는 영역도 body 색을 따라가서 같이 밝아짐
 */
const LightScreen = ({ children }: LightScreenProps) => {
  return (
    <div data-light-screen className="flex flex-1 flex-col text-label-normal">
      {children}
    </div>
  );
};

export default LightScreen;
