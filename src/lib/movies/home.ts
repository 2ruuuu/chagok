import { daysBetween, kstDate } from "./date";
import { getDailyBoxOffice, getMovieInfo } from "./kobis";
import {
  discoverKoreanReleases,
  getKoreanReleaseDate,
  posterUrl,
  searchMovie,
} from "./tmdb";
import type { PopularMovie, UpcomingMovie } from "./types";

/** 곧 개봉: 오늘부터 며칠 뒤까지 · 최대 몇 편 */
const UPCOMING_DAYS = 30;
const UPCOMING_LIMIT = 10;

const toYmd = (date: string) => date.replaceAll("-", "");

const toNumber = (value: string) => {
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? null : number;
};

/** KOBIS 영화 → TMDB 포스터. 한글 제목+연도 → 한글 제목 → 영문 제목 순으로 찾음 */
const findPoster = async (title: string, titleEn: string, year: string) => {
  const movie =
    (year ? await searchMovie(title, year) : null) ??
    (await searchMovie(title)) ??
    (titleEn ? await searchMovie(titleEn, year || undefined) : null);
  return posterUrl(movie?.poster_path ?? null);
};

/**
 * 홈 "요즘 인기 있는 🔥": 어제 일별 박스오피스 1~10위.
 * 새벽에는 어제 집계가 아직 없을 수 있어서 비어 있으면 그저께로.
 * 실패하면 빈 배열 (섹션에서 안내 문구)
 */
export const getPopularMovies = async (): Promise<PopularMovie[]> => {
  let list = await getDailyBoxOffice(toYmd(kstDate(-1)));
  if (list.length === 0) {
    list = await getDailyBoxOffice(toYmd(kstDate(-2)));
  }

  return Promise.all(
    list.map(async (item) => {
      const info = await getMovieInfo(item.movieCd);
      const openDt = info?.openDt || item.openDt.replaceAll("-", "");
      const year = openDt.slice(0, 4) || info?.prdtYear || "";
      const poster = await findPoster(
        item.movieNm,
        info?.movieNmEn ?? "",
        year,
      );

      return {
        id: item.movieCd,
        rank: Number(item.rank),
        title: item.movieNm,
        poster,
        year: toNumber(year),
        genre: info?.genres[0]?.genreNm ?? null,
        runtime: info ? toNumber(info.showTm) : null,
        audienceTotal: toNumber(item.audiAcc),
      };
    }),
  );
};

/**
 * 홈 "곧 개봉해요 🎬": 한국 개봉일이 오늘~30일 뒤인 영화, 개봉일 가까운 순 최대 10편.
 * discover는 인기순으로 받고, 정확한 한국 개봉일은 영화마다 다시 확인 (D-N 계산용)
 */
export const getUpcomingMovies = async (): Promise<UpcomingMovie[]> => {
  const today = kstDate();
  const candidates = (
    await discoverKoreanReleases(today, kstDate(UPCOMING_DAYS))
  ).filter((movie) => movie.poster_path);

  const movies = await Promise.all(
    candidates.map(async (movie) => {
      const releaseDate = await getKoreanReleaseDate(movie.id);
      if (!releaseDate) return null;
      const daysLeft = daysBetween(today, releaseDate);
      if (daysLeft < 0 || daysLeft > UPCOMING_DAYS) return null;
      return {
        id: String(movie.id),
        title: movie.title,
        poster: posterUrl(movie.poster_path),
        releaseDate,
        daysLeft,
      } satisfies UpcomingMovie;
    }),
  );

  return movies
    .filter((movie) => movie !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, UPCOMING_LIMIT);
};
