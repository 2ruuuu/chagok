"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TicketCheckIcon from "@/assets/icons/ticket-check.svg";
import Button from "@/components/button/Button";
import VerifyNotice from "../../_components/VerifyNotice";
import { useVerifyStore } from "../../_stores/useVerifyStore";

/**
 * 확인 요청 완료 (검수 대상 티켓). 별점 · 리뷰 · 메모는 승인된 뒤 홈 "확인 중인 티켓"에서 이어 씀.
 * 뒤로가기 버튼이 없고, 여기로 오는 이동은 router.replace.
 * TODO: 시안 없음 (문구 · 구성은 ticket-verify.md "확인 요청 완료")
 */
const RequestedView = () => {
  const router = useRouter();
  const reset = useVerifyStore((state) => state.reset);

  // 요청을 마쳤으니 작성 중이던 인증을 비움 (확인 화면에서 비우면 단계 가드가 시작 화면으로 보내 버림)
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <VerifyNotice
      icon={TicketCheckIcon}
      title="티켓 확인을 요청했어요"
      description={
        <>
          직접 확인 후 24시간 안에 알려 드릴게요.
          <br />
          확인이 끝나면 별점과 리뷰를 남기고 카드를 받을 수 있어요.
        </>
      }
      actions={
        <Button type="button" onClick={() => router.replace("/")}>
          확인
        </Button>
      }
    />
  );
};

export default RequestedView;
