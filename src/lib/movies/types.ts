import type { StaticImageData } from "next/image";

/** 영화 포스터: TMDB 이미지 URL 또는 import한 이미지. 못 찾으면 null (빈 칸으로 그림) */
export type MoviePoster = StaticImageData | string | null;

/** 홈 "요즘 인기 있는 🔥" (KOBIS 일별 박스오피스) */
export type PopularMovie = {
  /** KOBIS 영화코드 */
  id: string;
  rank: number;
  title: string;
  poster: MoviePoster;
  /** 개봉 연도 (개봉일이 없으면 제작 연도) */
  year: number | null;
  genre: string | null;
  /** 분 */
  runtime: number | null;
  /** 누적 관객 수 (KOBIS audiAcc) */
  audienceTotal: number | null;
};

/** 홈 "곧 개봉해요 🎬" (TMDB 한국 개봉 예정작) */
export type UpcomingMovie = {
  /** TMDB 영화 id */
  id: string;
  title: string;
  poster: MoviePoster;
  /** 한국 개봉일 YYYY-MM-DD */
  releaseDate: string;
  /** 개봉까지 남은 날 (0이면 오늘 개봉 = D-Day) */
  daysLeft: number;
};
