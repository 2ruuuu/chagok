"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Toast from "@/components/toast/Toast";
import TextStep from "../../_components/TextStep";
import VerifyStepGuard from "../../_components/VerifyStepGuard";
import { MOCK_TICKET_ID } from "../../_mocks/recognized";
import {
  type RecognizedTicket,
  useVerifyStore,
} from "../../_stores/useVerifyStore";
import { issueCard } from "../../actions";

const TOAST_DURATION_MS = 2000;

/**
 * 카드 메모: 나만 보는 메모, 선택 (비어 있어도 넘어감). 마지막 단계라 여기서 카드를 발급함.
 * 별점 · 리뷰 · 메모 · 고른 좌석을 issueCard로 보내고, 받은 인증번호로 발급 완료 화면을 그림
 */
const MemoView = () => {
  const router = useRouter();
  const memo = useVerifyStore((state) => state.memo);
  const setMemo = useVerifyStore((state) => state.setMemo);
  const issue = useVerifyStore((state) => state.issue);
  const [issuing, startIssue] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
  };

  // 발급 뒤 뒤로가기로 작성 화면에 돌아오지 않게 replace
  const handleSubmit = (ticket: RecognizedTicket) => {
    if (ticket.ticketId === MOCK_TICKET_ID) {
      issue(ticket.certificateId, null);
      router.replace("/verify/complete");
      return;
    }
    startIssue(async () => {
      const { rating, review } = useVerifyStore.getState();
      const result = await issueCard({
        ticketId: ticket.ticketId,
        seat: ticket.seat || null,
        rating,
        review,
        memo,
      });
      if (result.error !== null) {
        showToast(result.error);
        return;
      }
      issue(result.certificateId, result.cardId);
      router.replace("/verify/complete");
    });
  };

  return (
    <VerifyStepGuard require="draft">
      {(ticket) => (
        <>
          <TextStep
            id="verify-memo"
            title="카드 뒷면에 간직할 내용을 남겨보세요."
            label="카드 메모"
            note="(선택)"
            placeholder="나만 볼 수 있어요."
            value={memo}
            onChange={setMemo}
            buttonLabel="카드 발급하기"
            canSubmit={!issuing}
            onSubmit={() => handleSubmit(ticket)}
          />
          <Toast
            message={toastMessage}
            className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-5"
          />
        </>
      )}
    </VerifyStepGuard>
  );
};

export default MemoView;
