import type { ReactNode } from "react";

interface NarrowColumnProps {
  children: ReactNode;
}

/**
 * 아직 반응형으로 손보지 않은 화면을 태블릿 · 데스크톱에서도 모바일 폭(430)으로 가운데에 둠.
 * (main) 레이아웃은 md부터 넓어지고 좌우 여백이 바뀌므로, 여기서 430 칸 + 좌우 여백 20을 다시 잡음.
 * 화면을 반응형으로 바꾸면 그 화면의 layout에서 이것만 빼면 됨
 */
const NarrowColumn = ({ children }: NarrowColumnProps) => {
  return (
    <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col md:px-5">
      {children}
    </div>
  );
};

export default NarrowColumn;
