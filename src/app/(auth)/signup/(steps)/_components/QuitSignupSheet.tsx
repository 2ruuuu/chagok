"use client";

import { useState } from "react";
import { signOut } from "@/app/(auth)/actions";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import Button from "@/components/button/Button";

interface QuitSignupSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 가입 중단 확인 시트. 계정이 생긴 뒤의 첫 단계에서 뒤로가기를 누르면 띄움.
 * [그만두기] → 로그아웃 → /login (닉네임이 없는 계정은 다음에 같은 이메일로 다시 가입 가능)
 */
const QuitSignupSheet = ({ open, onClose }: QuitSignupSheetProps) => {
  const [quitting, setQuitting] = useState(false);

  const handleQuit = async () => {
    setQuitting(true);
    // 성공하면 액션이 /login 으로 redirect
    await signOut();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      labelledBy="quit-signup-sheet-title"
      dismissible={!quitting}
      className="px-5"
    >
      <h2
        id="quit-signup-sheet-title"
        className="px-2 pt-8 pb-2 text-heading2 font-semibold"
      >
        회원가입을 그만두시겠어요?
      </h2>
      <p className="px-2 text-body2 text-label-neutral">
        지금 그만두면 다음에 처음부터 다시 가입해야 해요.
      </p>

      <div className="mt-8 flex flex-col gap-2">
        <Button type="button" onClick={onClose} disabled={quitting}>
          계속 가입하기
        </Button>
        <button
          type="button"
          onClick={handleQuit}
          disabled={quitting}
          className="h-12 cursor-pointer rounded-lg text-body1 font-medium text-label-alternative outline-none focus-visible:outline-2 focus-visible:outline-primary-40 disabled:cursor-default"
        >
          그만두기
        </button>
      </div>
    </BottomSheet>
  );
};

export default QuitSignupSheet;
