/** 하단 바 없이 화면 전체를 쓰는 페이지 (카드 상세) */
const DetailLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5">
      {children}
    </div>
  );
};

export default DetailLayout;
