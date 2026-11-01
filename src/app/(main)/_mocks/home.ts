import type { StaticImageData } from "next/image";
import odysseyPoster from "@/assets/imgs/giant-poster.webp";
import type { StackCard } from "@/components/card-stack/CardStack";

/**
 * 홈 화면 목데이터 (내 카드 · 관람평). 티켓 인증 · 카드 테이블이 생기면 서버에서 받아오는 값으로 바꿈.
 * 인기 영화 · 곧 개봉은 실제 데이터 (src/lib/movies)
 * 컴포넌트는 아래 타입만 받으므로 여기만 갈아끼우면 됨
 */

export type MonthlyCollection = {
  month: number;
  /** 이번 달에 모은 카드 수 */
  monthCount: number;
  /** 올해 누적 카드 수 */
  yearCount: number;
  /** 지난 달에 모은 카드 수 (지난 달보다 +N 계산용) */
  lastMonthCount: number;
  /** 이번 달 카드, 최신순 */
  cards: StackCard[];
};

export type RecentReview = {
  id: string;
  title: string;
  poster: StaticImageData | string;
  /** 0.0 ~ 5.0 */
  rating: number;
  content: string;
};

export const monthlyCollection: MonthlyCollection = {
  month: 10,
  monthCount: 13,
  yearCount: 13,
  lastMonthCount: 12,
  // 13장이어도 카드 묶음에는 최신 5장만 보임
  cards: Array.from({ length: 13 }, (_, i) => ({
    id: `card-${13 - i}`,
    poster: odysseyPoster,
  })),
};

export const recentReviews: RecentReview[] = Array.from(
  { length: 4 },
  (_, i) => ({
    id: `review-${i + 1}`,
    title: "오디세이",
    poster: odysseyPoster,
    rating: 1,
    content: "오디세이, 오디세이, 오디세이오디세이오디세이 두 줄이 넘으면 말줄임표로 잘려요",
  }),
);
