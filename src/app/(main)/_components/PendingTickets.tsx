"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useVerifyStore } from "@/app/verify/_stores/useVerifyStore";
import MiniCard from "@/components/mini-card/MiniCard";
import Toast from "@/components/toast/Toast";
import { cn } from "@/lib/cn";
import type { PendingTicket } from "../_data/pending-tickets";

const TITLE_ID = "pending-tickets-title";
const TOAST_MS = 2500;
/** 한 번에 보여주는 개수. TODO: 넘치면 더보기 (전체 목록 화면이 생기면) */
const MAX_ITEMS = 3;

const STATUS_ORDER: PendingTicket["status"][] = [
  "approved",
  "pending",
  "rejected",
];

const STATUS_LABEL: Record<PendingTicket["status"], string> = {
  approved: "확인 완료",
  pending: "확인 중",
  rejected: "확인 실패",
};

interface PendingTicketsProps {
  tickets: PendingTicket[];
}

/**
 * 홈 "확인 중인 티켓": 직접 확인이 필요한 티켓(검수 대상)의 진행 상태.
 * 확인 완료를 누르면 별점부터 이어 쓰고, 확인 실패를 누르면 다시 인증함. 없으면 섹션을 숨김.
 * TODO: 태블릿 · 데스크톱 배치는 반응형 작업 때 (지금은 모바일 시안 그대로)
 */
const PendingTickets = ({ tickets }: PendingTicketsProps) => {
  const router = useRouter();
  const start = useVerifyStore((state) => state.start);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (tickets.length === 0) return null;

  const items = STATUS_ORDER.flatMap((status) =>
    tickets.filter((ticket) => ticket.status === status),
  ).slice(0, MAX_ITEMS);

  const handleClick = (ticket: PendingTicket) => {
    if (ticket.status === "pending") {
      setToast("직접 확인 중이에요. 24시간 안에 알려 드릴게요.");
      return;
    }
    if (ticket.status === "rejected") {
      router.push("/verify");
      return;
    }
    if (!ticket.ticket) return;
    // 승인된 티켓은 시간 제한 없이 이어 씀 (관람 정보 확인은 건너뛰고 별점부터)
    start(ticket.ticket, { expires: false });
    router.push("/verify/rating");
  };

  const getDescription = (ticket: PendingTicket) => {
    if (ticket.status === "approved") {
      return "별점과 리뷰를 남기고 카드를 받아보세요";
    }
    if (ticket.status === "rejected") {
      return ticket.reason ?? "티켓을 확인하지 못했어요";
    }
    return `${ticket.watchedAt} · ${ticket.theater}`;
  };

  return (
    <section aria-labelledby={TITLE_ID} className="mt-10 flex flex-col gap-4">
      <h2 id={TITLE_ID} className="px-1 text-label1 text-static-white">
        확인 중인 티켓
      </h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((ticket) => (
          <li key={ticket.id}>
            <button
              type="button"
              onClick={() => handleClick(ticket)}
              className="flex w-full cursor-pointer items-center gap-4 rounded-lg border border-line-normal bg-common-0/4 p-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
            >
              <MiniCard
                poster={ticket.poster}
                showBadge={false}
                sizes="60px"
                className="h-21 w-15"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span
                  className={cn(
                    "self-start rounded-sm px-1.5 py-0.5 text-caption2 font-semibold text-static-white",
                    ticket.status === "approved"
                      ? "bg-primary-40"
                      : "bg-neutral-70",
                  )}
                >
                  {STATUS_LABEL[ticket.status]}
                </span>
                <span className="truncate text-label1 text-static-white">
                  {ticket.title}
                </span>
                <span className="truncate text-caption1 text-neutral-20">
                  {getDescription(ticket)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Toast
        message={toast}
        className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center"
      />
    </section>
  );
};

export default PendingTickets;
