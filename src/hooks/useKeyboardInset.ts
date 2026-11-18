"use client";

import { useEffect, useState } from "react";

// 주소창이 접히고 펴질 때의 높이 변화는 키보드로 보지 않음
const KEYBOARD_THRESHOLD = 100;

/**
 * 모바일 가상 키보드가 가리는 높이(px). 키보드가 없으면 0.
 * iOS는 키보드가 올라와도 layout viewport가 줄지 않아 CSS(dvh)로는 알 수 없으므로
 * visualViewport와 layout viewport의 차이로 계산함.
 */
export const useKeyboardInset = () => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const hidden = window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(hidden > KEYBOARD_THRESHOLD ? hidden : 0);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
};
