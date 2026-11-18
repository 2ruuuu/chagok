interface EmptyStateProps {
  message: string;
}

/** 헤더 아래 남은 공간 가운데에 안내 문구 (알림 없음 · 준비 중) */
const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-body2 text-label-alternative">{message}</p>
    </div>
  );
};

export default EmptyState;
