import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface HorizontalScrollProps {
  /** <li> 목록. 각 <li>에 snap-start를 주면 카드 왼쪽에 맞춰 멈춤 */
  children: ReactNode;
  /** 스크린 리더가 목록 이름으로 읽음 (보통 섹션 제목) */
  "aria-label"?: string;
  /** 간격 · 레이아웃(grid 등) 덮어쓰기 */
  className?: string;
}

/**
 * 화면 오른쪽 끝까지 이어지는 가로 스크롤 목록 (홈의 관람평 · 인기 · 곧 종료 캐러셀).
 * 레이아웃의 px-5를 -mx-5로 상쇄하고 안쪽에서 px-5를 다시 줘서, 첫 카드는 여백에 맞고 끝은 화면에 닿음
 */
const HorizontalScroll = ({
  children,
  "aria-label": ariaLabel,
  className,
}: HorizontalScrollProps) => {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        // relative: 안의 absolute 요소(sr-only 등)가 이 목록을 기준으로 잡혀야 스크롤 영역 안에 갇힘.
        // 없으면 화면 밖 항목의 absolute 요소가 페이지 폭을 늘려 가로 스크롤이 생김
        "relative -mx-5 flex snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </ul>
  );
};

export default HorizontalScroll;
