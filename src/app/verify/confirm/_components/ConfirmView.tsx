"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import CircleCheckIcon from "@/assets/icons/circle-check-green.svg";
import Button from "@/components/button/Button";
import MiniCard from "@/components/mini-card/MiniCard";
import Toast from "@/components/toast/Toast";
import { cn } from "@/lib/cn";
import InfoMismatchSheet from "../../_components/InfoMismatchSheet";
import { MovieMeta } from "../../_components/MovieSummary";
import VerifyHeader from "../../_components/VerifyHeader";
import VerifyStepGuard from "../../_components/VerifyStepGuard";
import { MOCK_TICKET_ID } from "../../_mocks/recognized";
import {
  type RecognizedTicket,
  useVerifyStore,
} from "../../_stores/useVerifyStore";
import { releaseTicket, requestTicketReview } from "../../actions";

const TOAST_DURATION_MS = 2000;

/**
 * 관람 정보 확인: 서버가 읽은 값을 보여주기만 함 (직접 수정 없음, ticket-verify.md).
 * 다르면 "정보가 다른가요?" 시트에서 다시 찍거나 확인을 요청.
 * 좌석이 여러 개면 내 좌석을 고르고, 검수 대상이면 발급 대신 확인을 요청함.
 */
const ConfirmView = () => {
  const router = useRouter();
  const reset = useVerifyStore((state) => state.reset);
  const setSeat = useVerifyStore((state) => state.setSeat);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [requesting, startRequest] = useTransition();
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

  // 뒤로가기 · 다시 찍기: 인식 결과를 버리고 시작 화면으로
  // 임시 상태도 바로 풀어 줌 (기다리지 않음, 실패해도 30분 뒤 풀림)
  const backToStart = () => {
    const ticketId = useVerifyStore.getState().ticket?.ticketId;
    if (ticketId && ticketId !== MOCK_TICKET_ID) void releaseTicket(ticketId);
    reset();
    router.replace("/verify");
  };

  // 확인 요청(검수): 별점 · 리뷰 · 메모는 승인된 뒤에 씀. 성공하면 액션이 요청 완료 화면으로 보냄
  // reported: 자동 인증 티켓인데 "정보가 다른가요?"에서 요청함. 진행 상태는 요청 완료 화면에서 비움
  const requestReview = (ticket: RecognizedTicket, reported: boolean) => {
    setSheetOpen(false);
    if (ticket.ticketId === MOCK_TICKET_ID) {
      router.replace("/verify/requested");
      return;
    }
    startRequest(async () => {
      const result = await requestTicketReview({
        ticketId: ticket.ticketId,
        seat: ticket.seat || null,
        reported,
      });
      if (result?.error) showToast(result.error);
    });
  };

  return (
    <VerifyStepGuard require="draft">
      {(ticket) => {
        const info = [
          [
            "관람 일시",
            `${ticket.watchedAt} (${ticket.weekday}) ${ticket.showtime}`,
          ],
          ["극장 · 상영관", `${ticket.theater} · ${ticket.screen}`],
        ];
        const hasSeatChoice = ticket.seats.length > 1;
        const seatChosen = ticket.seat !== "";
        const credits = [
          ["감독", ticket.director],
          ["출연", ticket.cast.join(", ")],
          ["등급", ticket.grade],
        ];

        return (
          <>
            <VerifyHeader onBack={backToStart} />
            <main className="flex flex-1 flex-col">
              <div className="mt-5 flex flex-col items-center gap-1 text-center">
                <h1 className="text-heading2 font-semibold text-static-white">
                  관람 정보를 확인해 주세요.
                </h1>
                <p className="text-body2 text-neutral-10">
                  {ticket.needsReview
                    ? "아래 정보로 확인을 요청할까요?"
                    : "아래 정보로 카드를 발급할까요?"}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-5">
                <section className="flex gap-5 rounded-lg border border-line-normal bg-common-0/10 p-5">
                  {/* 발급 전이라 VERIFIED 배지 없음 */}
                  <MiniCard
                    poster={ticket.poster}
                    showBadge={false}
                    sizes="100px"
                    className="h-35 w-25"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-label1 text-static-white">
                        {ticket.title}
                      </h2>
                      <MovieMeta ticket={ticket} />
                    </div>
                    <dl className="flex flex-col gap-1 text-caption1">
                      {credits.map(([label, value]) => (
                        <div key={label} className="flex gap-2">
                          <dt className="shrink-0 text-neutral-15">{label}</dt>
                          <dd className="text-common-0">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </section>

                <dl className="divide-y divide-line-normal rounded-lg border border-line-normal bg-common-0/10 p-5 text-caption1">
                  {info.map(([label, value]) => (
                    <div key={label} className="flex gap-10 py-2 first:pt-0">
                      <dt className="w-16 shrink-0 text-neutral-20">{label}</dt>
                      <dd className="text-neutral-5">{value}</dd>
                    </div>
                  ))}
                  <div className="flex gap-10 pt-2">
                    <dt className="w-16 shrink-0 text-neutral-20">
                      {hasSeatChoice ? "내 좌석" : "좌석"}
                    </dt>
                    <dd className="text-neutral-5">
                      {hasSeatChoice ? (
                        // TODO: 좌석 선택 시안 없음 (지금은 칩)
                        <div
                          role="radiogroup"
                          aria-label="내 좌석"
                          className="flex flex-wrap gap-2"
                        >
                          {ticket.seats.map((seat) => (
                            // biome-ignore lint/a11y/useSemanticElements: 칩 모양 라디오라 button으로 만듦
                            <button
                              key={seat}
                              type="button"
                              role="radio"
                              aria-checked={ticket.seat === seat}
                              onClick={() => setSeat(seat)}
                              className={cn(
                                "cursor-pointer rounded-full border px-3 py-1 font-semibold outline-none focus-visible:outline-2 focus-visible:outline-primary-40",
                                ticket.seat === seat
                                  ? "border-primary-40 bg-primary-40 text-static-white"
                                  : "border-line-normal text-neutral-10",
                              )}
                            >
                              {seat}
                            </button>
                          ))}
                        </div>
                      ) : (
                        ticket.seat
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {ticket.needsReview ? (
                <p className="mt-6 text-center text-body2 text-neutral-10">
                  직접 확인 후 24시간 안에 카드를 발급해 드려요.
                </p>
              ) : (
                <p className="mt-6 flex items-center justify-center gap-1.5 text-body2 text-status-positive">
                  <Image src={CircleCheckIcon} alt="" aria-hidden />
                  티켓 정보를 인식했어요.
                </p>
              )}
              {hasSeatChoice && !seatChosen && (
                <p className="mt-1 text-center text-caption1 text-neutral-20">
                  내 좌석을 골라 주세요.
                </p>
              )}
            </main>

            <div className="mt-5 flex flex-col">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                onClick={() => setSheetOpen(true)}
                className="flex h-12 cursor-pointer items-center justify-center text-label3 font-semibold text-neutral-30 underline outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
              >
                정보가 다른가요?
              </button>
              <Button
                type="button"
                variant={seatChosen && !requesting ? "primary" : "disable"}
                disabled={!seatChosen || requesting}
                onClick={
                  ticket.needsReview
                    ? () => requestReview(ticket, false)
                    : () => router.push("/verify/rating")
                }
              >
                {ticket.needsReview ? "확인 요청하기" : "다음"}
              </Button>
            </div>

            <InfoMismatchSheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              onRetake={backToStart}
              onRequestReview={() => requestReview(ticket, !ticket.needsReview)}
            />

            <Toast
              message={toastMessage}
              className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-5"
            />
          </>
        );
      }}
    </VerifyStepGuard>
  );
};

export default ConfirmView;
