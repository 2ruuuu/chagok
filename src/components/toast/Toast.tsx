type ToastProps = {
  /** 보여줄 메시지. null이면 숨김 */
  message: string | null;
  className?: string;
};

/**
 * 짧은 안내 메시지. 위치와 표시 시간은 쓰는 쪽에서 정함.
 * 스크린 리더가 읽도록 live region은 메시지가 없어도 항상 렌더링해 둠.
 */
const Toast = ({ message, className }: ToastProps) => {
  return (
    <div role="status" aria-live="polite" className={className}>
      {message && (
        <div className="rounded-md bg-cool-neutral-85 px-4 py-2 text-body2 font-medium text-common-0 shadow-md">
          {message}
        </div>
      )}
    </div>
  );
};

export default Toast;
