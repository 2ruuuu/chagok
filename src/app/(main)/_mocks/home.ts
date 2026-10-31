import type { StaticImageData } from "next/image";
import odysseyPoster from "@/assets/imgs/giant-poster.webp";
import hopePoster from "@/assets/imgs/hope-poster.png";
import type { StackCard } from "@/components/card-stack/CardStack";

/**
 * 홈 화면 목데이터. 티켓 인증 · 영화 데이터가 정해지면 서버에서 받아오는 값으로 바꿈.
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

export type PopularMovie = {
  id: string;
  rank: number;
  title: string;
  poster: StaticImageData | string;
  year: number;
  genre: string;
  /** 분 */
  runtime: number;
};

export type EndingSoonMovie = {
  id: string;
  title: string;
  poster: StaticImageData | string;
  /** 상영 종료까지 남은 날 (D-N) */
  daysLeft: number;
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
    content: "오디세이, 오디세이, 오디세이",
  }),
);

export const popularMovies: PopularMovie[] = [
  {
    id: "hope",
    rank: 1,
    title: "Hope",
    poster: hopePoster,
    year: 2026,
    genre: "스릴러",
    runtime: 170,
  },
  {
    id: "odyssey",
    rank: 2,
    title: "오디세이",
    poster: odysseyPoster,
    year: 2026,
    genre: "액션",
    runtime: 172,
  },
  {
    id: "hope-3",
    rank: 3,
    title: "Hope",
    poster: hopePoster,
    year: 2026,
    genre: "스릴러",
    runtime: 170,
  },
  {
    id: "hope-4",
    rank: 4,
    title: "Hope",
    poster: hopePoster,
    year: 2026,
    genre: "스릴러",
    runtime: 170,
  },
  {
    id: "odyssey-5",
    rank: 5,
    title: "오디세이",
    poster: odysseyPoster,
    year: 2026,
    genre: "액션",
    runtime: 172,
  },
  {
    id: "hope-6",
    rank: 6,
    title: "Hope",
    poster: hopePoster,
    year: 2026,
    genre: "스릴러",
    runtime: 170,
  },
];

export const endingSoonMovies: EndingSoonMovie[] = [
  { id: "ending-1", title: "Hope", poster: hopePoster, daysLeft: 2 },
  { id: "ending-2", title: "Hope", poster: hopePoster, daysLeft: 2 },
  { id: "ending-3", title: "Hope", poster: hopePoster, daysLeft: 8 },
  { id: "ending-4", title: "Hope", poster: hopePoster, daysLeft: 10 },
  { id: "ending-5", title: "Hope", poster: hopePoster, daysLeft: 14 },
];
