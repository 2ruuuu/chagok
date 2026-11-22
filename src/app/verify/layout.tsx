/** 티켓 인증 화면 (하단 바 없음). 하단 여백 44는 VERIFY_BOTTOM_SPACE와 맞춤 */
const VerifyLayout = ({ children }: LayoutProps<"/verify">) => {
  return (
    <div className="mx-auto flex w-full max-w-107.5 flex-1 flex-col px-5 pb-[max(2.75rem,env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
};

export default VerifyLayout;
