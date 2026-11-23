import type { SupabaseClient } from "@supabase/supabase-js";
import type { Ticket } from "@/components/ticket-card/TicketCard";
import {
  formatFromScreen,
  showtimeParts,
  theaterLabel,
} from "@/lib/ticket/display";
import type { Chain } from "@/lib/ticket/normalize";

/**
 * 내 카드 조회 (cards + tickets + movies + reviews). 컬렉션 · 카드 상세 · 마이에서 씀
 * 서버 클라이언트(RLS: 본인 카드만)로 부름. 조회 실패하면 빈 값 + 로그
 */

export type CollectionCard = Ticket & {
  id: string;
  /** 관람평 별점 (1~5 정수) */
  rating: number;
  /** 카드 받은 날 YYYY.MM.DD (KST). 홈 월별 막대 */
  collectedAt: string;
};

type CardRow = {
  id: string;
  created_at: string;
  certificate_id: string;
  memo: string | null;
  movies: {
    title: string;
    original_title: string;
    poster_url: string | null;
    released_on: string | null;
    country: string;
    genres: string[];
  } | null;
  tickets: {
    chain: Chain | null;
    theater: string | null;
    screen: string | null;
    screened_at: string | null;
    seat: string | null;
    extracted: { theater?: string | null } | null;
    /** ticket_id unique라 객체로 오지만 혹시 배열이어도 처리 */
    reviews:
      | { rating: number; body: string }
      | { rating: number; body: string }[]
      | null;
  } | null;
};

const CARD_SELECT =
  "id, created_at, certificate_id, memo, movies(title, original_title, poster_url, released_on, country, genres), tickets(chain, theater, screen, screened_at, seat, extracted, reviews(rating, body))";

const toCollectionCard = (row: CardRow): CollectionCard | null => {
  const { movies: movie, tickets: ticket } = row;
  // 발급된 카드는 영화 · 상영일시가 항상 있음 (issue_card가 확인). 혹시 없으면 목록에서 뺌
  if (!movie || !ticket?.screened_at) return null;

  const review = Array.isArray(ticket.reviews)
    ? ticket.reviews[0]
    : ticket.reviews;
  const { watchedAt, showtime } = showtimeParts(new Date(ticket.screened_at));

  return {
    id: row.id,
    title: movie.title,
    originalTitle: movie.original_title,
    // TODO: 포스터 없는 영화는 아직 발급 단계에서 걸러짐 (인식 때 검수로). 빈 포스터 시안 나오면 처리
    poster: movie.poster_url ?? "",
    format: formatFromScreen(ticket.screen),
    theater: theaterLabel(
      ticket.chain,
      ticket.theater,
      ticket.extracted?.theater ?? null,
    ),
    screen: ticket.screen ?? "",
    watchedAt,
    showtime,
    seat: ticket.seat ?? "",
    review: review?.body ?? "",
    comment: row.memo ?? undefined,
    releasedAt: movie.released_on
      ? `${movie.released_on.replaceAll("-", ".")}.`
      : "",
    country: movie.country,
    genres: movie.genres,
    certificateId: row.certificate_id,
    rating: review?.rating ?? 0,
    collectedAt: showtimeParts(new Date(row.created_at)).watchedAt,
  };
};

/** 내 카드 전부 (발급 최신순, 화면에서 다시 정렬) */
export const getMyCards = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<CollectionCard[]> => {
  const { data, error } = await supabase
    .from("cards")
    .select(CARD_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .overrideTypes<CardRow[], { merge: false }>();

  if (error) {
    console.error("[cards] 목록 조회 실패", error);
    return [];
  }
  return data.flatMap((row) => toCollectionCard(row) ?? []);
};

/** 카드 한 장. 남의 카드 · 없는 카드면 null */
export const getMyCard = async (
  supabase: SupabaseClient,
  userId: string,
  cardId: string,
): Promise<CollectionCard | null> => {
  const { data, error } = await supabase
    .from("cards")
    .select(CARD_SELECT)
    .eq("id", cardId)
    .eq("user_id", userId)
    .maybeSingle()
    .overrideTypes<CardRow, { merge: false }>();

  if (error) {
    console.error("[cards] 카드 조회 실패", error);
    return null;
  }
  return data ? toCollectionCard(data) : null;
};

/** 마이 화면 숫자: 보유 카드 · 나의 감상(카드 메모가 있는 카드) */
export const getMyCardCounts = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const [all, withMemo] = await Promise.all([
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("memo", "is", null),
  ]);
  if (all.error || withMemo.error) {
    console.error("[cards] 개수 조회 실패", all.error ?? withMemo.error);
  }
  return { cardCount: all.count ?? 0, memoCount: withMemo.count ?? 0 };
};
