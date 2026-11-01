import { z } from "zod";
import { requireEnv } from "@/lib/env";

/**
 * TMDB API v3 (서버에서만 호출, 토큰 노출 금지)
 * 비상업 용도로 발급받은 키 → 설정 화면 하단에 로고 + 출처 문구 필수
 */

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const DAY = 60 * 60 * 24;

const movieListSchema = z.object({
  results: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      original_title: z.string(),
      poster_path: z.string().nullable(),
      /** YYYY-MM-DD 또는 빈 문자열 */
      release_date: z.string().optional().default(""),
    }),
  ),
});

const releaseDatesSchema = z.object({
  results: z.array(
    z.object({
      iso_3166_1: z.string(),
      release_dates: z.array(
        z.object({
          /** ISO 날짜시각 (2026-11-12T00:00:00.000Z) */
          release_date: z.string(),
          /** 1 프리미어, 2 제한 상영, 3 극장 개봉, 4 디지털, 5 실물, 6 TV */
          type: z.number(),
        }),
      ),
    }),
  ),
});

export type TmdbMovie = z.infer<typeof movieListSchema>["results"][number];

const tmdbFetch = async <T extends z.ZodType>(
  path: string,
  params: Record<string, string>,
  schema: T,
  revalidate: number,
): Promise<z.output<T> | null> => {
  try {
    // 토큰이 없어도 홈 전체가 깨지지 않게 try 안에서 (섹션만 비고 로그 남김)
    const token = requireEnv(
      process.env.TMDB_ACCESS_TOKEN,
      "TMDB_ACCESS_TOKEN",
    );
    const query = new URLSearchParams({ language: "ko-KR", ...params });
    const res = await fetch(`${BASE_URL}${path}?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
    });
    if (!res.ok) {
      console.error("[tmdb] 응답 실패:", path, res.status);
      return null;
    }
    const parsed = schema.safeParse(await res.json());
    if (!parsed.success) {
      console.error("[tmdb] 응답 형식이 다름:", path, parsed.error.issues[0]);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error("[tmdb] 요청 실패:", path, error);
    return null;
  }
};

/** 포스터 경로 → 이미지 URL (w342: 홈 포스터 84~100px의 3배 정도) */
export const posterUrl = (path: string | null) =>
  path ? `${IMAGE_BASE_URL}/w342${path}` : null;

/** 제목(+연도)으로 검색. 포스터 있는 첫 결과 */
export const searchMovie = async (title: string, year?: string) => {
  const data = await tmdbFetch(
    "/search/movie",
    { query: title, region: "KR", ...(year ? { year } : {}) },
    movieListSchema,
    DAY,
  );
  return data?.results.find((movie) => movie.poster_path) ?? null;
};

/** 한국 극장 개봉일이 from~to(YYYY-MM-DD) 사이인 영화, 인기순 20편 */
export const discoverKoreanReleases = async (from: string, to: string) => {
  const data = await tmdbFetch(
    "/discover/movie",
    {
      region: "KR",
      with_release_type: "2|3", // 제한 상영 · 극장 개봉
      "release_date.gte": from,
      "release_date.lte": to,
      sort_by: "popularity.desc",
      include_adult: "false",
    },
    movieListSchema,
    6 * 60 * 60,
  );
  return data?.results ?? [];
};

/** 한국 극장 개봉일 YYYY-MM-DD (극장 개봉 → 제한 상영 순으로 찾음). 없으면 null */
export const getKoreanReleaseDate = async (movieId: number) => {
  const data = await tmdbFetch(
    `/movie/${movieId}/release_dates`,
    {},
    releaseDatesSchema,
    DAY,
  );
  const korea = data?.results.find((item) => item.iso_3166_1 === "KR");
  if (!korea) return null;
  const pick = (type: number) =>
    korea.release_dates
      .filter((item) => item.type === type)
      .map((item) => item.release_date.slice(0, 10))
      .sort()[0];
  return pick(3) ?? pick(2) ?? null;
};
