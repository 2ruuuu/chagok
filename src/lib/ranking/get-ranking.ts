import type { SupabaseClient } from "@supabase/supabase-js";
import { getAvatarUrl } from "@/lib/avatar";
import { showtimeParts } from "@/lib/ticket/display";

/**
 * 랭킹 화면 데이터 (rankings · ranking_runs, 매일 00:00 KST 집계).
 * 서버 클라이언트로 부름 (로그인한 사람만 조회 가능). 조회 실패하면 빈 값 + 로그
 */

/** 화면에 보여줄 순위 (1~3위 시상대 + 그 아래 목록) */
export const RANKING_LIMIT = 100;

/**
 * 지난 집계보다 순위 변화. up · down은 오른 · 내린 칸 수, new는 지난 집계에 없던 사람.
 * 첫 집계라 비교할 게 없으면 null (아무것도 안 보여줌)
 */
export type RankChange =
  | { type: "up" | "down"; value: number }
  | { type: "same" }
  | { type: "new" };

export type RankingEntry = {
  userId: string;
  rank: number;
  cardCount: number;
  nickname: string;
  /** 공개 URL, 없으면 null (기본 이미지) */
  avatarUrl: string | null;
  change: RankChange | null;
};

export type MyRank = {
  rank: number;
  cardCount: number;
  /** 상위 N% (1~100) */
  topPercent: number;
  /** 바로 위 순위까지 남은 장수 (1위면 null) */
  nextRank: { rank: number; remaining: number } | null;
  change: RankChange | null;
  /** 목록(4~100위)에 내 줄이 있는지 ([내 순위로 이동] 버튼) */
  inList: boolean;
};

export type Ranking = {
  /** "2026.11.23 00:00", 아직 집계 전이면 null */
  countedUntil: string | null;
  /** 같은 순위 안에서는 먼저 도달한 사람이 위 */
  entries: RankingEntry[];
  /** 내 줄 강조용, 비로그인이면 null */
  myUserId: string | null;
  /** 내가 집계에 없으면 null (카드 0장이거나 오늘 처음 받음) */
  me: MyRank | null;
};

type RankingRow = {
  user_id: string;
  rank: number;
  card_count: number;
  nickname: string;
  avatar_path: string | null;
  prev_rank: number | null;
};

/** 시상대 아래 목록이 시작하는 위치 (앞 3명은 시상대) */
export const PODIUM_SIZE = 3;

const EMPTY: Ranking = {
  countedUntil: null,
  entries: [],
  myUserId: null,
  me: null,
};

export const toRankChange = (
  rank: number,
  prevRank: number | null,
  hasPrevious: boolean,
): RankChange | null => {
  if (!hasPrevious) return null;
  if (prevRank === null) return { type: "new" };
  if (prevRank === rank) return { type: "same" };
  return prevRank > rank
    ? { type: "up", value: prevRank - rank }
    : { type: "down", value: rank - prevRank };
};

export const getRanking = async (
  supabase: SupabaseClient,
  userId: string | undefined,
): Promise<Ranking> => {
  const [run, list, mine] = await Promise.all([
    supabase
      .from("ranking_runs")
      .select("counted_until, ranked_count, prev_counted_until")
      .maybeSingle(),
    supabase
      .from("rankings")
      .select("user_id, rank, card_count, nickname, avatar_path, prev_rank")
      .order("rank")
      .order("reached_at")
      .limit(RANKING_LIMIT)
      .overrideTypes<RankingRow[], { merge: false }>(),
    userId
      ? supabase
          .from("rankings")
          .select("rank, card_count, prev_rank")
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const error = run.error ?? list.error ?? mine.error;
  if (error) {
    console.error("[ranking] 조회 실패", error);
    return EMPTY;
  }
  if (!run.data) return EMPTY;

  const { watchedAt, showtime } = showtimeParts(
    new Date(run.data.counted_until),
  );
  const hasPrevious = run.data.prev_counted_until !== null;
  const rows = list.data ?? [];
  const inList = rows.slice(PODIUM_SIZE).some((row) => row.user_id === userId);

  return {
    countedUntil: `${watchedAt} ${showtime}`,
    entries: rows.map((row) => ({
      userId: row.user_id,
      rank: row.rank,
      cardCount: row.card_count,
      nickname: row.nickname,
      avatarUrl: getAvatarUrl(row.avatar_path),
      change: toRankChange(row.rank, row.prev_rank, hasPrevious),
    })),
    myUserId: userId ?? null,
    me: mine.data
      ? {
          ...(await getMyRank(supabase, mine.data, run.data.ranked_count)),
          change: toRankChange(
            mine.data.rank,
            mine.data.prev_rank,
            hasPrevious,
          ),
          inList,
        }
      : null,
  };
};

const getMyRank = async (
  supabase: SupabaseClient,
  mine: { rank: number; card_count: number },
  rankedCount: number,
): Promise<Omit<MyRank, "change" | "inList">> => {
  // 바로 위 순위 = 나보다 많은 장수 중 가장 적은 장수 (그 장수가 되면 같은 순위)
  const { data, error } = await supabase
    .from("rankings")
    .select("rank, card_count")
    .gt("card_count", mine.card_count)
    .order("card_count")
    .limit(1)
    .maybeSingle();
  if (error) console.error("[ranking] 위 순위 조회 실패", error);

  return {
    rank: mine.rank,
    cardCount: mine.card_count,
    topPercent: Math.max(1, Math.ceil((mine.rank / rankedCount) * 100)),
    nextRank: data
      ? { rank: data.rank, remaining: data.card_count - mine.card_count }
      : null,
  };
};
