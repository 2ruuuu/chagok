"use client";

import Button from "@/components/button/Button";
import Dialog from "@/components/dialog/Dialog";

const TITLE_ID = "verify-resume-title";
const DESC_ID = "verify-resume-desc";

interface ResumeDialogProps {
  open: boolean;
  /** 작성 중이던 티켓의 영화 제목 */
  title: string;
  /** 새로 하기: 작성 중이던 인증을 버림 */
  onRestart: () => void;
  /** 이어서 하기: 마지막 단계로 */
  onResume: () => void;
}

/** 작성 중인 인증이 남아 있을 때 /verify에 다시 들어오면 묻는 창 (ticket-verify.md "중간에 나갔을 때") */
const ResumeDialog = ({
  open,
  title,
  onRestart,
  onResume,
}: ResumeDialogProps) => {
  return (
    // ESC로 닫으면 새로 하지도 이어 하지도 않은 상태가 되므로 이어서 하기로 처리
    <Dialog
      open={open}
      onClose={onResume}
      labelledBy={TITLE_ID}
      describedBy={DESC_ID}
    >
      <div className="pt-3 text-center text-body1 font-medium">
        <h2 id={TITLE_ID}>작성 중인 인증이 있어요</h2>
        <p id={DESC_ID}>‘{title}’ 티켓 인증을 이어서 할까요?</p>
      </div>
      <div className="mt-6 flex gap-2.5">
        <Button
          type="button"
          variant="neutral"
          className="flex-1"
          onClick={onRestart}
        >
          새로 하기
        </Button>
        <Button type="button" className="flex-1" onClick={onResume}>
          이어서 하기
        </Button>
      </div>
    </Dialog>
  );
};

export default ResumeDialog;
