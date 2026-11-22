import {
  getMovieInfo,
  type KobisMovieListItem,
  searchMovieList,
} from "@/lib/movies/kobis";
import { getMovieCredits, posterUrl, searchMovie } from "@/lib/movies/tmdb";

/**
 * 티켓에 적힌 제목 + 관람일로 영화를 찾음 (4번 화면 영화 정보 + 대조)
 * 제목은 공백 · 기호를 빼고 정확히 같아야 함 (오독한 제목을 비슷한 영화로 잘못 붙이지 않게, 못 찾으면 검수)
 * 제작연도 · 등급 · 장르 · 국가 · 러닝타임은 KOBIS, 포스터 · 감독 · 출연은 TMDB (ticket-verify.md 4번 화면)
 */

// 개봉 전 시사회 · 유료 시사로 볼 수 있는 기간
const PREVIEW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const CAST_COUNT = 3;

const normalizeTitle = (title: string) =>
  title.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");

/** YYYYMMDD -> YYYY-MM-DD */
const toIsoDate = (value: string) =>
  /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : null;

export type MatchedMovie = {
  kobisCode: string;
  tmdbId: number | null;
  title: string;
  originalTitle: string;
  poster: string | null;
  productionYear: string;
  runtime: number | null;
  director: string;
  cast: string[];
  grade: string;
  /** 최초 개봉일 YYYY-MM-DD */
  releasedAt: string;
  country: string;
  genres: string[];
};

/** 관람일(YYYY-MM-DD)에 볼 수 있었던 영화 중 개봉일이 가장 가까운 것 */
const pickCandidate = (
  list: KobisMovieListItem[],
  title: string,
  date: string,
) => {
  const target = normalizeTitle(title);
  const watched = Date.parse(date);
  return list
    .filter(
      (movie) =>
        normalizeTitle(movie.movieNm) === target ||
        normalizeTitle(movie.movieNmEn) === target,
    )
    .map((movie) => ({ movie, openDate: toIsoDate(movie.openDt) }))
    .filter(
      (item): item is { movie: KobisMovieListItem; openDate: string } =>
        item.openDate !== null &&
        Date.parse(item.openDate) - PREVIEW_DAYS * DAY_MS <= watched,
    )
    .sort((a, b) => b.openDate.localeCompare(a.openDate))[0];
};

/** 못 찾으면 null -> 검수 */
export const findMovie = async (
  title: string,
  watchedDate: string,
): Promise<MatchedMovie | null> => {
  const candidate = pickCandidate(
    await searchMovieList(title),
    title,
    watchedDate,
  );
  if (!candidate) return null;

  const info = await getMovieInfo(candidate.movie.movieCd);
  if (!info) return null;

  const year = candidate.openDate.slice(0, 4);
  const tmdb =
    (await searchMovie(info.movieNm, year)) ??
    (info.movieNmEn ? await searchMovie(info.movieNmEn, year) : null);
  const credits = tmdb ? await getMovieCredits(tmdb.id) : null;

  const runtime = Number(info.showTm);

  return {
    kobisCode: info.movieCd,
    tmdbId: tmdb?.id ?? null,
    title: info.movieNm,
    originalTitle: info.movieNmEn || tmdb?.original_title || info.movieNm,
    poster: posterUrl(tmdb?.poster_path ?? null),
    productionYear: info.prdtYear,
    runtime: Number.isFinite(runtime) && runtime > 0 ? runtime : null,
    director: credits?.directors[0] ?? info.directors[0]?.peopleNm ?? "",
    cast: (credits?.cast.length
      ? credits.cast
      : info.actors.map((actor) => actor.peopleNm)
    ).slice(0, CAST_COUNT),
    grade: info.audits.at(-1)?.watchGradeNm ?? "",
    releasedAt: candidate.openDate,
    country: info.nations[0]?.nationNm ?? "",
    genres: info.genres.map((genre) => genre.genreNm),
  };
};
