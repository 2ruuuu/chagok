"use server";

import { RedirectType, redirect } from "next/navigation";
import { z } from "zod";
import { notifyPendingTicket } from "@/lib/discord";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { MAX_RATING, TEXT_MAX_LENGTH } from "./_constants";

const requestSchema = z.object({
  ticketId: z.uuid(),
  /** 좌석이 여러 개일 때 고른 좌석. 고르지 않고 요청하면 null (검수에서 정함) */
  seat: z.string().nullable(),
  /** 자동 인증 티켓인데 "정보가 다른가요?"에서 요청함 */
  reported: z.boolean(),
});

const EXPIRED_ERROR = "인증 시간이 지났어요. 티켓을 다시 찍어 주세요.";

// 디스코드 알림용 (검수할 때 바로 읽히게)
const CHAIN_LABELS: Record<string, string> = {
  cgv: "CGV",
  lotte: "롯데시네마",
  megabox: "메가박스",
  etc: "기타 극장",
};

const REASON_LABELS: Record<string, string> = {
  chain_unknown: "체인 못 읽음",
  other_chain: "3사 외 극장",
  theater_not_found: "지점 목록에 없음",
  showtime_missing: "상영일시 못 읽음",
  showtime_mismatch: "연도 · 요일 안 맞음",
  year_guessed: "연도 추정",
  year_ambiguous: "연도 애매 (개봉 1년 넘게 지남 · 재개봉?)",
  movie_not_found: "영화 못 찾음",
  seat_missing: "좌석 없음",
  seat_unparsed: "좌석 표기 못 읽음",
  low_confidence: "확신도 낮음",
  user_reported: "사용자가 정보 다름 신고",
};

const SHOWTIME_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** 2024. 09. 21. (토) 13:30 (KST) */
const formatShowtime = (value: string | null) =>
  value ? SHOWTIME_FORMAT.format(new Date(value)) : "일시 모름";

/**
 * 확인 요청 (검수 대상 티켓 · 정보가 다를 때 · 자동 인증이 어려운 티켓).
 * 인식 때 잡아 둔 holding을 pending으로 바꾸고 디스코드로 알림 -> /verify/requested (replace)
 * 별점 · 리뷰 · 메모는 승인된 뒤에 받음 (ticket-verify.md "검수 대상")
 */
export async function requestTicketReview(input: {
  ticketId: string;
  seat: string | null;
  reported: boolean;
}): Promise<{ error: string }> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { error: "잘못된 요청이에요." };
  const { ticketId, seat, reported } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login", RedirectType.replace);

  const admin = createAdminClient();
  // 본인 것 · 아직 임시 상태 · 30분 안인 것만
  const { data: ticket, error: selectError } = await admin
    .from("tickets")
    .select(
      "id, seats, review_reason, chain, theater, screened_at, movie_title, extracted",
    )
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .eq("status", "holding")
    .gt("hold_expires_at", new Date().toISOString())
    .maybeSingle();
  if (selectError) {
    console.error("[requestTicketReview] 조회 실패", selectError);
    return { error: "잠시 후 다시 시도해 주세요." };
  }
  if (!ticket) return { error: EXPIRED_ERROR };

  const seats: string[] = ticket.seats ?? [];
  if (seat !== null && !seats.includes(seat)) {
    return { error: "잘못된 요청이에요." };
  }

  const reasons = [
    ...(ticket.review_reason ? ticket.review_reason.split(",") : []),
    ...(reported ? ["user_reported"] : []),
  ];

  const { data: updated, error: updateError } = await admin
    .from("tickets")
    .update({
      status: "pending",
      requested_at: new Date().toISOString(),
      hold_expires_at: null,
      review_reason: [...new Set(reasons)].join(",") || null,
      ...(seat !== null && { seat }),
    })
    .eq("id", ticketId)
    .eq("status", "holding")
    .select("id")
    .maybeSingle();
  if (updateError) {
    // 고른 좌석을 다른 사람이 이미 인증 · 인증 중
    if (updateError.code === "23505") {
      return { error: "이미 인증된 좌석이에요." };
    }
    console.error("[requestTicketReview] 상태 변경 실패", updateError);
    return { error: "잠시 후 다시 시도해 주세요." };
  }
  // 조회와 변경 사이에 만료 · 해제됨
  if (!updated) return { error: EXPIRED_ERROR };

  const chain = ticket.chain
    ? (CHAIN_LABELS[ticket.chain] ?? ticket.chain)
    : "체인 모름";
  const theater = ticket.theater ?? ticket.extracted?.theater ?? "극장 모름";
  const reasonText =
    reasons.map((reason) => REASON_LABELS[reason] ?? reason).join(", ") ||
    "없음";
  await notifyPendingTicket(
    [
      "🎫 새 확인 요청",
      `영화: ${ticket.movie_title ?? "제목 모름"}`,
      `극장: ${chain} ${theater}`,
      `상영: ${formatShowtime(ticket.screened_at)}`,
      `좌석: ${seat ?? (seats.join(", ") || "없음")}`,
      `사유: ${reasonText}`,
      `id: ${ticket.id}`,
    ].join("\n"),
  );

  redirect("/verify/requested", RedirectType.replace);
}

const issueSchema = z.object({
  ticketId: z.uuid(),
  /** 좌석이 여러 개일 때 고른 좌석 (하나면 인식 때 정해져 있어서 null이어도 됨) */
  seat: z.string().nullable(),
  rating: z.number().int().min(1).max(MAX_RATING),
  review: z.string().trim().min(1).max(TEXT_MAX_LENGTH),
  memo: z.string().trim().max(TEXT_MAX_LENGTH),
});

const ISSUE_ERRORS: Record<string, string> = {
  ticket_not_found: EXPIRED_ERROR,
  ticket_expired: EXPIRED_ERROR,
  needs_review: "직접 확인이 필요한 티켓이에요. 확인을 요청해 주세요.",
  invalid_seat: "내 좌석을 골라 주세요.",
  already_issued: "이미 카드를 받은 티켓이에요.",
};

/**
 * 카드 발급: 티켓 확정(verified) + 관람평(별점 · 리뷰) + 카드(메모 · 인증번호)를 issue_card 한 트랜잭션으로.
 * 다른 액션과 달리 redirect하지 않고 인증번호를 돌려줌 -> 화면이 진행 상태에 넣고 발급 완료로 이동
 */
export async function issueCard(input: {
  ticketId: string;
  seat: string | null;
  rating: number;
  review: string;
  memo: string;
}): Promise<
  { error: string } | { error: null; certificateId: string; cardId: string }
> {
  const parsed = issueSchema.safeParse(input);
  if (!parsed.success) return { error: "입력값을 확인해 주세요." };
  const { ticketId, seat, rating, review, memo } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login", RedirectType.replace);

  const { data, error } = await createAdminClient()
    .rpc("issue_card", {
      p_ticket_id: ticketId,
      p_user_id: user.id,
      p_seat: seat,
      p_rating: rating,
      p_review: review,
      p_memo: memo,
    })
    .single<{ card_id: string; certificate_id: string }>();

  if (error) {
    // 고른 좌석을 그사이 다른 사람이 인증함 (지문 unique)
    if (error.code === "23505") return { error: "이미 인증된 좌석이에요." };
    const message = ISSUE_ERRORS[error.message];
    if (message) return { error: message };
    console.error("[issueCard] 발급 실패", error);
    return { error: "잠시 후 다시 시도해 주세요." };
  }

  return {
    error: null,
    certificateId: data.certificate_id,
    cardId: data.card_id,
  };
}

/**
 * 임시 상태 바로 해제 (4번 화면 뒤로가기 · 다시 찍기, "이어서 할까요?"에서 새로 하기).
 * 실패해도 30분 뒤 · 다음 인식 때 풀리니 화면은 기다리지 않음
 */
export async function releaseTicket(ticketId: string): Promise<void> {
  if (!z.uuid().safeParse(ticketId).success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await createAdminClient()
    .from("tickets")
    .update({ status: "released" })
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .eq("status", "holding");
  if (error) console.error("[releaseTicket] 해제 실패", error);
}
