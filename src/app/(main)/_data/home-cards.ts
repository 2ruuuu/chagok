import type { StackCard } from "@/components/card-stack/CardStack";
import type { CollectionCard } from "@/lib/cards/my-cards";

/**
 * 홈 "내 카드" 캐러셀 · 이번 달 수집 현황 (cards 실데이터, getMyCards 결과로 계산).
 * 수집 현황은 카드 받은 날 기준 ("모은" 기록이라서): 작년 티켓을 이번 달에 인증하면 이번 달에 들어감.
 * 캐러셀 순서만 관람일 기준 (최근 관람순)
 */

export type MonthlyCollection = {
  month: number;
  /** 이번 달에 받은 카드 수 */
  monthCount: number;
  /** 올해 누적 카드 수 */
  yearCount: number;
  /** 지난 달에 받은 카드 수 (지난 달보다 +N 계산용) */
  lastMonthCount: number;
  /** 이번 달에 받은 카드, 최근 받은순 */
  cards: StackCard[];
  /** 최근 6개월 월별로 받은 카드 수, 오래된 달부터 (마지막이 이번 달). 데스크톱 수집 현황 막대 */
  monthlyCounts: { month: number; count: number }[];
  /** 올해 받은 카드의 포맷, 많은 순 (상위 3개). 데스크톱 수집 현황 */
  topFormats: { format: string; count: number }[];
};

/** 홈 캐러셀에 보여줄 카드 수 (전체는 컬렉션에서) */
const CAROUSEL_LIMIT = 10;
const CHART_MONTHS = 6;
const TOP_FORMAT_LIMIT = 3;

/** 오늘 한국 날짜의 연 · 월 (서버는 UTC라 KST로 맞춤) */
const KST_YEAR_MONTH = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
});

const todayYearMonth = (now: Date) => {
  const parts = Object.fromEntries(
    KST_YEAR_MONTH.formatToParts(now).map((part) => [part.type, part.value]),
  );
  return { year: Number(parts.year), month: Number(parts.month) };
};

/** n달 전 연 · 월 (해 넘김 처리) */
const shiftMonth = (year: number, month: number, diff: number) => {
  const index = year * 12 + (month - 1) - diff;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
};

/** "2026.10" (watchedAt "2026.10.29"의 앞부분과 비교) */
const monthKey = (year: number, month: number) =>
  `${year}.${String(month).padStart(2, "0")}`;

/** 관람일 + 시간 ("2026.07.15 19:30"은 문자열 비교로 순서가 맞음) */
const watchedKey = (card: CollectionCard) =>
  `${card.watchedAt} ${card.showtime}`;

export const buildHomeCards = (cards: CollectionCard[], now = new Date()) => {
  const recentCards = cards.toSorted((a, b) =>
    watchedKey(b).localeCompare(watchedKey(a)),
  );

  const { year, month } = todayYearMonth(now);
  // cards는 getMyCards가 받은 최신순으로 줌
  const collectedIn = (y: number, m: number) =>
    cards.filter((card) => card.collectedAt.startsWith(monthKey(y, m)));

  const thisMonthCards = collectedIn(year, month);
  const lastMonth = shiftMonth(year, month, 1);
  const yearCards = cards.filter((card) =>
    card.collectedAt.startsWith(`${year}.`),
  );

  const monthlyCounts = Array.from({ length: CHART_MONTHS }, (_, i) => {
    const target = shiftMonth(year, month, CHART_MONTHS - 1 - i);
    return {
      month: target.month,
      count: collectedIn(target.year, target.month).length,
    };
  });

  const formatCounts = new Map<string, number>();
  for (const card of yearCards) {
    formatCounts.set(card.format, (formatCounts.get(card.format) ?? 0) + 1);
  }
  // 같은 수면 이름순 (새로고침마다 순서가 바뀌지 않게)
  const topFormats = [...formatCounts]
    .map(([format, count]) => ({ format, count }))
    .sort((a, b) => b.count - a.count || a.format.localeCompare(b.format))
    .slice(0, TOP_FORMAT_LIMIT);

  const monthlyCollection: MonthlyCollection = {
    month,
    monthCount: thisMonthCards.length,
    yearCount: yearCards.length,
    lastMonthCount: collectedIn(lastMonth.year, lastMonth.month).length,
    cards: thisMonthCards.map((card) => ({ id: card.id, poster: card.poster })),
    monthlyCounts,
    topFormats,
  };

  return {
    totalCount: cards.length,
    carouselCards: recentCards.slice(0, CAROUSEL_LIMIT),
    monthlyCollection,
  };
};
