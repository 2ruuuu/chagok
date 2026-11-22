/**
 * 티켓 인증 화면 (하단 바 · 상단 헤더 없음). 하단 여백 44는 VERIFY_BOTTOM_SPACE와 맞춤
 * 반응형 (시안 없이 만든 것, 입력에 집중하는 흐름이라 가운데 한 열)
 * - 모바일(~767): 최대 430
 * - 태블릿(md): 최대 480, 높이는 화면 그대로 (화면 키보드 위로 버튼 올리는 계산이 화면 아래 기준이라)
 * - 데스크톱(xl): 높이 최대 768 상자를 화면 세로 가운데 (버튼이 화면 맨 아래로 멀어지지 않게)
 */
const VerifyLayout = ({ children }: LayoutProps<"/verify">) => {
  return (
    <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5 pb-[max(2.75rem,env(safe-area-inset-bottom))] md:max-w-120 xl:my-auto xl:min-h-[min(100dvh,48rem)] xl:flex-none">
      {children}
    </div>
  );
};

export default VerifyLayout;
