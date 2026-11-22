"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";
import TicketCard from "@/components/ticket-card/TicketCard";
import VerifyStepGuard from "../../_components/VerifyStepGuard";
import { useVerifyStore } from "../../_stores/useVerifyStore";

/**
 * 카드 발급 완료: 카드가 한 바퀴 기울며 홀로그램이 반짝이는 연출을 한 번 보여줌 (product.md).
 * 카드는 눌러도 뒤집히지 않고, 뒤로가기 버튼이 없음.
 */
const CompleteView = () => {
  const router = useRouter();
  const review = useVerifyStore((state) => state.review);
  const memo = useVerifyStore((state) => state.memo);

  // TODO: 공유하기 (바텀시트 -> OS 공유 창) · 이미지로 저장 (ticket-verify.md "발급 완료")
  const handleShare = () => {};
  const handleSaveImage = () => {};

  return (
    <VerifyStepGuard require="issued">
      {(ticket) => (
        <>
          {/* 배경: 포스터를 흐리게 */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <Image
              src={ticket.poster}
              alt=""
              fill
              sizes="100vw"
              className="scale-125 object-cover opacity-40 blur-[40px]"
            />
            <div className="absolute inset-0 bg-secondary-100/60" />
          </div>

          <main className="flex flex-1 flex-col items-center pt-17">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-2.5">
                <span className="holo-border relative rounded-full px-2 py-1 text-caption1 font-semibold text-static-white">
                  New
                </span>
                <h1 className="text-heading2 font-semibold text-static-white">
                  카드가 발급되었어요.
                </h1>
              </div>
              <p className="text-body2 text-neutral-10">
                발급된 카드는 컬렉션에서 확인하실 수 있어요.
              </p>
            </div>
            <div className="mt-5">
              <TicketCard
                ticket={{ ...ticket, review, comment: memo || undefined }}
                flippable={false}
                intro
              />
            </div>
          </main>

          <div className="mt-5 flex flex-col">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-12 cursor-pointer items-center justify-center text-label3 font-semibold text-static-white underline outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
            >
              공유하기
            </button>
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleSaveImage}
              >
                이미지로 저장
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => router.replace("/collection")}
              >
                확인
              </Button>
            </div>
          </div>
        </>
      )}
    </VerifyStepGuard>
  );
};

export default CompleteView;
