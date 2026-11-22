import type { SupabaseClient } from "@supabase/supabase-js";
import type { StaticImageData } from "next/image";
import type { RecognizedTicket } from "@/app/verify/_stores/useVerifyStore";
import projectorImage from "@/assets/imgs/chagok-projector.png";
import {
  buildRecognizedTicket,
  showtimeParts,
  theaterLabel,
} from "@/lib/ticket/display";
import type { Chain } from "@/lib/ticket/normalize";

/**
 * 홈 "확인 중인 티켓" (검수 대상 티켓, ticket-verify.md).
 * approved: 확인 완료 -> 별점 · 리뷰 · 메모를 쓰면 카드 발급 (ticket에 이어 쓸 관람 정보)
 * pending: 확인 중
 * rejected: 확인 실패 -> 다시 인증
 */
export type PendingTicket = {
  id: string;
  status: "approved" | "pending" | "rejected";
  title: string;
  poster: StaticImageData | string;
  /** 관람일 YYYY.MM.DD (못 읽었으면 빈 문자열) */
  watchedAt: string;
  theater: string;
  /** 확인 실패 사유 (rejected일 때) */
  reason?: string;
  /** approved일 때 별점부터 이어 쓸 관람 정보 */
  ticket?: RecognizedTicket;
};

const REJECT_REASONS: Record<string, string> = {
  blurry: "사진이 흐려요",
  not_ticket: "티켓이 아니에요",
  duplicate: "이미 인증된 티켓이에요",
};

// 확인 실패는 7일 지나면 숨김
const REJECTED_VISIBLE_MS = 7 * 24 * 60 * 60 * 1000;
const LIMIT = 20;

type MovieRow = {
  title: string;
  original_title: string;
  poster_url: string | null;
  production_year: string | null;
  runtime: number | null;
  director: string;
  cast_members: string[];
  grade: string;
  released_on: string | null;
  country: string;
  genres: string[];
};

type TicketRow = {
  id: string;
  status: "pending" | "verified" | "rejected";
  chain: Chain | null;
  theater: string | null;
  screen: string | null;
  screened_at: string | null;
  seats: string[];
  seat: string | null;
  movie_title: string | null;
  reject_reason: string | null;
  reviewed_at: string | null;
  extracted: { theater?: string | null } | null;
  movies: MovieRow | null;
  /** 1:1이라 객체로 오지만 혹시 배열이어도 처리 */
  cards: { id: string } | { id: string }[] | null;
};

const hasCard = (cards: TicketRow["cards"]) =>
  Array.isArray(cards) ? cards.length > 0 : cards !== null;

/**
 * 확인을 요청한(requested_at 있는) 내 티켓 중 아직 할 일이 남은 것.
 * 승인됐어도 카드를 받았으면 빠짐. 조회 실패하면 빈 배열 (섹션만 숨김)
 */
export const getPendingTickets = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<PendingTicket[]> => {
  const { data, error } = await supabase
    .from("tickets")
    .select(
      "id, status, chain, theater, screen, screened_at, seats, seat, movie_title, reject_reason, reviewed_at, extracted, movies(title, original_title, poster_url, production_year, runtime, director, cast_members, grade, released_on, country, genres), cards(id)",
    )
    .eq("user_id", userId)
    .not("requested_at", "is", null)
    .in("status", ["pending", "verified", "rejected"])
    .order("requested_at", { ascending: false })
    .limit(LIMIT)
    .overrideTypes<TicketRow[], { merge: false }>();

  if (error) {
    console.error("[home] 확인 중인 티켓 조회 실패", error);
    return [];
  }

  const now = Date.now();
  return data.flatMap((row): PendingTicket[] => {
    if (row.status === "verified" && hasCard(row.cards)) return [];
    if (
      row.status === "rejected" &&
      row.reviewed_at &&
      now - Date.parse(row.reviewed_at) > REJECTED_VISIBLE_MS
    ) {
      return [];
    }

    const movie = row.movies;
    const screenedAt = row.screened_at ? new Date(row.screened_at) : null;
    const base = {
      id: row.id,
      title: movie?.title ?? row.movie_title ?? "영화 확인 중",
      // 영화를 못 찾은 티켓은 포스터 대신 차곡 이미지. TODO: 시안 나오면 맞추기
      poster: movie?.poster_url ?? projectorImage,
      watchedAt: screenedAt ? showtimeParts(screenedAt).watchedAt : "",
      theater: theaterLabel(
        row.chain,
        row.theater,
        row.extracted?.theater ?? null,
      ),
    };

    if (row.status === "pending") return [{ ...base, status: "pending" }];
    if (row.status === "rejected") {
      return [
        {
          ...base,
          status: "rejected",
          reason: REJECT_REASONS[row.reject_reason ?? ""],
        },
      ];
    }

    // 승인된 티켓은 영화 · 상영일시가 항상 있음 (approve_ticket이 확인)
    if (!movie || !screenedAt) return [];
    return [
      {
        ...base,
        status: "approved",
        ticket: buildRecognizedTicket({
          ticketId: row.id,
          movie: {
            title: movie.title,
            originalTitle: movie.original_title,
            poster: movie.poster_url ?? "",
            productionYear: movie.production_year ?? "",
            runtime: movie.runtime,
            director: movie.director,
            cast: movie.cast_members,
            grade: movie.grade,
            releasedAt: movie.released_on ?? "",
            country: movie.country,
            genres: movie.genres,
          },
          chain: row.chain,
          theater: row.theater,
          rawTheater: row.extracted?.theater ?? null,
          screen: row.screen,
          screenedAt,
          seats: row.seats,
          seat: row.seat,
          needsReview: false,
        }),
      },
    ];
  });
};
