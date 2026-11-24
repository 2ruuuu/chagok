import type { ReactNode } from "react";

/** 화면 테마. 지금은 dark만 씀 (화이트 · 나이트 모드는 나중에) */
export type ScreenTheme = "dark" | "light";

interface ThemedScreenProps {
  children: ReactNode;
  theme?: ScreenTheme;
}

/**
 * 시맨틱 색 토큰(label-* · background-* · line-* · fill-* · interaction-*)을 테마 값으로 바꿔 쓰는 화면
 * (마이 · 프로필 편집 · 알림 · 나의 감상 · 관람 리뷰 · 설정).
 * - globals.css의 [data-theme="dark"]가 이 안의 시맨틱 토큰을 어두운 값으로 덮어씀
 *   -> 페이지는 시맨틱 토큰만 쓰면 되고, 모드 전환은 theme만 바꾸면 됨
 * - body:has([data-theme])가 body 배경도 같이 바꿈 (iPhone Safari 툴바 · 당겨서 늘어나는 영역이 body 색을 따라감)
 * - 바텀시트 · 다이얼로그는 body에 포털로 붙어서 이 밖 → 앱 공통 시트 색(흰 시트) 그대로
 */
const ThemedScreen = ({ children, theme = "dark" }: ThemedScreenProps) => {
  return (
    <div data-theme={theme} className="flex flex-1 flex-col text-label-normal">
      {children}
    </div>
  );
};

export default ThemedScreen;
