"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/button/Button";
import ShareCardSheet from "@/components/share-card-sheet/ShareCardSheet";
import TicketCard from "@/components/ticket-card/TicketCard";
import Toast from "@/components/toast/Toast";
import { useCardImage } from "@/hooks/useCardImage";
import VerifyStepGuard from "../../_components/VerifyStepGuard";
import { useVerifyStore } from "../../_stores/useVerifyStore";

/**
 * 카드 발급 완료: 카드가 한 바퀴 기울며 홀로그램이 반짝이는 연출을 한 번 보여줌 (product.md).
 * 카드를 탭하면 뒷면(극장 · 일시 · 좌석 · 메모 · 인증번호)을 볼 수 있음 (카드 상세와 같음). 뒤로가기 버튼이 없음.
 * 이미지로 저장 · 공유하기: useCardImage (카드 상세와 같음). 이미지 공유가 안 되는 브라우저(데스크톱 등)는 공유하기를 숨기고 저장만
 */
const CompleteView = () => {
  const router = useRouter();
  const review = useVerifyStore((state) => state.review);
  const memo = useVerifyStore((state) => state.memo);
  const cardId = useVerifyStore((state) => state.cardId);
  const [flipped, setFlipped] = useState(false);
  const certificateId = useVerifyStore(
    (state) => state.ticket?.certificateId ?? "",
  );
  const cardImage = useCardImage(cardId, certificateId);

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
                <h1 className="text-heading2 font-semibold text-static-white md:text-heading1">
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
                flipped={flipped}
                onFlippedChange={setFlipped}
                intro
              />
            </div>
            {/* 카드 상세와 같은 안내 */}
            <p aria-hidden className="mt-4 text-label3 text-neutral-60">
              {flipped ? "다시 탭하면 앞면으로" : "탭하면 뒷면으로"}
            </p>
          </main>

          <div className="mt-5 flex flex-col">
            {cardImage.canShare ? (
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={cardImage.sheet.open}
                onClick={cardImage.openShare}
                className="flex h-12 cursor-pointer items-center justify-center text-label3 font-semibold text-static-white underline outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
              >
                공유하기
              </button>
            ) : (
              // 공유하기가 없어도 버튼 위치가 같게
              <div className="h-12" />
            )}
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant={cardImage.busy ? "disable" : "secondary"}
                disabled={cardImage.busy}
                className="flex-1"
                onClick={cardImage.save}
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

          <ShareCardSheet {...cardImage.sheet} />
          <Toast
            message={cardImage.toastMessage}
            className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-5"
          />
        </>
      )}
    </VerifyStepGuard>
  );
};

export default CompleteView;
