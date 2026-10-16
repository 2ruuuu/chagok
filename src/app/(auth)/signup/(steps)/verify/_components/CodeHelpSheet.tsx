"use client";

import { useRouter } from "next/navigation";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import { Button } from "@/components/button/Button";

type CodeHelpSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 인증번호를 보낸 이메일. 없으면(주소로 직접 들어온 경우) 이메일 줄을 숨김 */
  email: string | null;
};

const TIPS = [
  "스팸함이나 프로모션함을 확인해 주세요.",
  "메일이 도착하기까지 몇 분 걸릴 수 있어요.",
  "그래도 오지 않으면 [재전송]을 눌러 다시 받아 주세요.",
];

/** [인증번호가 오지 않나요?] 안내 시트. 원인 확인 → 이메일 다시 입력으로 이어줌 */
const CodeHelpSheet = ({ open, onClose, email }: CodeHelpSheetProps) => {
  const router = useRouter();

  // 처음부터 다시 쓰지 않도록 입력했던 이메일을 채운 채로 이메일 입력 화면으로.
  // replace: 뒤로가기로 이 인증 화면에 다시 돌아오지 않게 함 (이미 발송된 번호는 새 이메일과 무관)
  const handleReenterEmail = () => {
    const params = email ? `?${new URLSearchParams({ email })}` : "";
    router.replace(`/signup${params}`);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      labelledBy="code-help-sheet-title"
      className="px-5"
    >
      <h2
        id="code-help-sheet-title"
        className="px-2 pt-8 pb-5 text-heading2 font-semibold"
      >
        인증번호가 오지 않나요?
      </h2>

      {email && (
        <div className="mx-2 mb-4 flex flex-col gap-1 rounded-lg bg-fill-normal px-4 py-3">
          <span className="text-caption1 text-label-alternative">
            인증번호를 보낸 이메일
          </span>
          <span className="break-all text-body2 font-medium text-label-normal">
            {email}
          </span>
        </div>
      )}

      <ul className="flex flex-col gap-2 px-2">
        {email && (
          <li className="flex gap-2 text-body2 text-label-neutral">
            <span aria-hidden="true">·</span>
            이메일 주소에 오타가 없는지 확인해 주세요.
          </li>
        )}
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2 text-body2 text-label-neutral">
            <span aria-hidden="true">·</span>
            {tip}
          </li>
        ))}
      </ul>

      <Button type="button" className="mt-8" onClick={handleReenterEmail}>
        이메일 다시 입력하기
      </Button>
    </BottomSheet>
  );
};

export default CodeHelpSheet;
