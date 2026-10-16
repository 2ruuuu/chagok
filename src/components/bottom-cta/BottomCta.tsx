"use client";

import type { ReactNode } from "react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { cn } from "@/lib/cn";

// AuthLayout의 하단 여백(pb-14 = 56px)
const LAYOUT_BOTTOM_SPACE = 56;
// 키보드가 열렸을 때 버튼과 키보드 사이 간격
const KEYBOARD_GAP = 12;

type BottomCtaProps = {
  children: ReactNode;
  className?: string;
};

/**
 * 화면 하단 버튼 영역. 평소에는 부모 flex 레이아웃에서 하단에 놓이고,
 * 모바일 키보드가 올라오면 키보드 바로 위로 올라감.
 * 위치 방식(fixed 등)을 바꾸지 않고 transform만 움직여서 키보드와 함께 부드럽게 이동함.
 * 페이지가 화면 높이를 넘지 않는다는 전제 (스크롤되는 페이지에서는 위치가 어긋남).
 */
const BottomCta = ({ children, className }: BottomCtaProps) => {
  const keyboardInset = useKeyboardInset();
  const offset = Math.max(
    0,
    keyboardInset - LAYOUT_BOTTOM_SPACE + KEYBOARD_GAP,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 transition-transform duration-250 ease-out",
        className,
      )}
      style={{ transform: `translateY(-${offset}px)` }}
    >
      {children}
    </div>
  );
};

export default BottomCta;
