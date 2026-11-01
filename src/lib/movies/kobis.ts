import { z } from "zod";
import { requireEnv } from "@/lib/env";

/**
 * 영화진흥위원회 영화관입장권통합전산망 오픈API (서버에서만 호출, 키 노출 금지)
 * https://www.kobis.or.kr/kobisopenapi/homepg/main/main.do
 * 값이 전부 문자열로 옴 → 쓰는 쪽에서 숫자로 바꿈
 */

const BASE_URL = "https://www.kobis.or.kr/kobisopenapi/webservice/rest";

const DAY = 60 * 60 * 24;

const dailyBoxOfficeSchema = z.object({
  boxOfficeResult: z.object({
    dailyBoxOfficeList: z.array(
      z.object({
        rank: z.string(),
        movieCd: z.string(),
        movieNm: z.string(),
        /** YYYY-MM-DD, 없으면 빈 문자열 */
        openDt: z.string(),
        /** 누적 관객 수 */
        audiAcc: z.string(),
      }),
    ),
  }),
});

const movieInfoSchema = z.object({
  movieInfoResult: z.object({
    movieInfo: z.object({
      movieCd: z.string(),
      movieNm: z.string(),
      movieNmEn: z.string(),
      /** 상영시간(분), 없으면 빈 문자열 */
      showTm: z.string(),
      prdtYear: z.string(),
      openDt: z.string(),
      genres: z.array(z.object({ genreNm: z.string() })),
    }),
  }),
});

export type KobisBoxOfficeItem = z.infer<
  typeof dailyBoxOfficeSchema
>["boxOfficeResult"]["dailyBoxOfficeList"][number];
export type KobisMovieInfo = z.infer<
  typeof movieInfoSchema
>["movieInfoResult"]["movieInfo"];

const kobisFetch = async <T extends z.ZodType>(
  path: string,
  params: Record<string, string>,
  schema: T,
  revalidate: number,
): Promise<z.output<T> | null> => {
  try {
    // 키가 없어도 홈 전체가 깨지지 않게 try 안에서 (섹션만 비고 로그 남김)
    const key = requireEnv(process.env.KOBIS_API_KEY, "KOBIS_API_KEY");
    const query = new URLSearchParams({ key, ...params });
    const res = await fetch(`${BASE_URL}${path}?${query}`, {
      next: { revalidate },
    });
    if (!res.ok) {
      console.error("[kobis] 응답 실패:", path, res.status);
      return null;
    }
    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      // 키 오류 등은 { faultInfo: { message } }로 옴
      console.error(
        "[kobis] 응답 형식이 다름:",
        path,
        JSON.stringify(json).slice(0, 300),
      );
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error("[kobis] 요청 실패:", path, error);
    return null;
  }
};

/** 일별 박스오피스 1~10위. targetDt는 YYYYMMDD (오늘은 안 됨, 어제까지) */
export const getDailyBoxOffice = async (targetDt: string) => {
  const data = await kobisFetch(
    "/boxoffice/searchDailyBoxOfficeList.json",
    { targetDt },
    dailyBoxOfficeSchema,
    // URL에 날짜가 들어가서 날마다 새로 받음. 같은 날 안에서는 1시간 캐시
    60 * 60,
  );
  return data?.boxOfficeResult.dailyBoxOfficeList ?? [];
};

/** 영화 상세 (장르 · 상영시간 등). 잘 안 바뀌어서 7일 캐시 */
export const getMovieInfo = async (movieCd: string) => {
  const data = await kobisFetch(
    "/movie/searchMovieInfo.json",
    { movieCd },
    movieInfoSchema,
    7 * DAY,
  );
  return data?.movieInfoResult.movieInfo ?? null;
};
