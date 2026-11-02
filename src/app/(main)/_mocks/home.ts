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
  /** 최근 6개월 월별 카드 수, 오래된 달부터 (마지막이 이번 달). 데스크톱 수집 현황 막대 */
  monthlyCounts: { month: number; count: number }[];
  /** 올해 많이 본 포맷, 많은 순 (상위 3개). 데스크톱 수집 현황 */
  topFormats: { format: string; count: number }[];
};

export type RecentReview = {
  id: string;
  title: string;
  poster: StaticImageData | string;
  /** 0.0 ~ 5.0 */
  rating: number;
  content: string;
};

/**
 * 이번 달 카드 13장 포스터 (TMDB poster_path, 홈 "요즘 인기 있는" 영화에서 가져옴).
 * 앞 6장은 홈 캐러셀(card-demo) 카드와 같은 영화 · 같은 순서
 */
const STACK_POSTER_PATHS = [
  "/8ze9OcVuFiy94s6FFPvsn4oC2e1.jpg", // 오디세이
  "/ueigb5zra1tj6FTK9yhh2P33P9B.jpg", // 타짜: 벨제붑의 노래
  "/ehl2Du38qbg9M2cqfoVPUKgVDTy.jpg", // 룩백
  "/c55ijsOdntj6P25vDwHLdgsBpmV.jpg", // 암살자(들)
  "/LSGpoSAlitss0KOvVakkeUToZo.jpg", // 클레이페이스
  "/5TMyytCI5Pfc9c1eNsljiCdiB05.jpg", // 극장판 치이카와
  "/zC4E522V1n3H4SGdYOaiqhF5DnS.jpg", // 하트 오브 비스트
  "/ohrJjtvKciICoeH80z973JnBoHo.jpg", // 수능, 출제의 비밀
  "/wkm9BQLok7U2KihcCspCa663Qse.jpg", // 실낙원
  "/8ze9OcVuFiy94s6FFPvsn4oC2e1.jpg", // 오디세이 (한 번 더 봄)
  "/zC4E522V1n3H4SGdYOaiqhF5DnS.jpg", // 하트 오브 비스트 (한 번 더 봄)
  "/ehl2Du38qbg9M2cqfoVPUKgVDTy.jpg", // 룩백 (한 번 더 봄)
  "/ueigb5zra1tj6FTK9yhh2P33P9B.jpg", // 타짜 (한 번 더 봄)
];

/** 지금까지 모은 카드 수 (홈 인사 문구). 아래 올해 누적(52)에 작년 기록을 더한 값 */
export const totalCardCount = 61;

// 숫자끼리 맞춰둠: 이번 달 13 · 지난 달 12 = 막대 마지막 두 칸, 올해 누적 52 = 1~4월 9 + 막대 합 43
export const monthlyCollection: MonthlyCollection = {
  month: 10,
  monthCount: 13,
  yearCount: 52,
  lastMonthCount: 12,
  monthlyCounts: [
    { month: 5, count: 3 },
    { month: 6, count: 5 },
    { month: 7, count: 4 },
    { month: 8, count: 6 },
    { month: 9, count: 12 },
    { month: 10, count: 13 },
  ],
  topFormats: [
    { format: "IMAX", count: 18 },
    { format: "DOLBY", count: 11 },
    { format: "4DX", count: 7 },
  ],
  // 13장이어도 카드 묶음에는 최신 5장만 보임 (최신순, 홈 캐러셀 최근 카드와 같은 영화부터)
  cards: STACK_POSTER_PATHS.map((path, i) => ({
    id: `card-${13 - i}`,
    poster: `https://image.tmdb.org/t/p/w342${path}`,
  })),
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
