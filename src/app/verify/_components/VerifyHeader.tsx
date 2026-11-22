import BackButton from "@/components/back-button/BackButton";

interface VerifyHeaderProps {
  /** 안 넘기면 브라우저 뒤로가기 (이전 단계) */
  onBack?: () => void;
}

/** 티켓 인증 단계 상단 뒤로가기 */
const VerifyHeader = ({ onBack }: VerifyHeaderProps) => {
  return (
    <header className="flex h-12 items-center">
      <BackButton className="-ml-1" onClick={onBack} />
    </header>
  );
};

export default VerifyHeader;
