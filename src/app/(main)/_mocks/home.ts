import type { StaticImageData } from "next/image";
import odysseyPoster from "@/assets/imgs/giant-poster.webp";

/**
 * 홈 "요즘 내가 본"(RecentReviews) 목데이터. 홈에서 뺀 섹션이라 지금은 안 씀.
 * 내 카드 · 수집 현황은 cards 실데이터 (_data/home-cards.ts)
 */

export type RecentReview = {
  id: string;
  title: string;
  poster: StaticImageData | string;
  /** 0.0 ~ 5.0 */
  rating: number;
  content: string;
};

export const recentReviews: RecentReview[] = Array.from(
  { length: 4 },
  (_, i) => ({
    id: `review-${i + 1}`,
    title: "오디세이",
    poster: odysseyPoster,
    rating: 1,
    content:
      "오디세이, 오디세이, 오디세이오디세이오디세이 두 줄이 넘으면 말줄임표로 잘려요",
  }),
);
