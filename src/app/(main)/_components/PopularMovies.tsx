import Button from "@/components/button/Button";
import HorizontalScroll from "@/components/horizontal-scroll/HorizontalScroll";
import type { PopularMovie } from "@/lib/movies/types";
import MoviePosterImage from "./MoviePosterImage";
import SectionHeader from "./SectionHeader";

const TITLE_ID = "popular-movies-title";

/** 누적 관객 수: 1만 명 이상은 만 단위(200만 명), 그 아래는 그대로(9,876명) */
const formatAudience = (count: number) =>
  count >= 10_000
    ? `${Math.floor(count / 10_000).toLocaleString("ko-KR")}만 명`
    : `${count.toLocaleString("ko-KR")}명`;

interface PopularMoviesProps {
  movies: PopularMovie[];
}

/**
 * 홈 네 번째 섹션: 요즘 인기 있는 영화 (KOBIS 일별 박스오피스, 2줄 가로 캐러셀).
 * 순위는 세로로 먼저 채움 → 1·2가 첫 줄, 3·4가 다음 줄 (grid-flow-col)
 */
const PopularMovies = ({ movies }: PopularMoviesProps) => {
  return (
    <section aria-labelledby={TITLE_ID} className="mt-15 flex flex-col gap-5">
      <SectionHeader id={TITLE_ID} title="요즘 인기 있는 🔥" />
      {movies.length > 0 ? (
        <HorizontalScroll
          aria-label="요즘 인기 있는 영화"
          // 시안: 항목 247×126, 열 간격 32, 줄 간격 32
          className="grid auto-cols-61.75 grid-flow-col grid-rows-2 gap-x-8 gap-y-8"
        >
          {movies.map((movie) => (
            <li key={movie.id} className="flex snap-start items-center gap-4">
              <span className="w-5 shrink-0 text-center text-heading2 text-static-white">
                <span className="sr-only">순위 </span>
                {movie.rank}
              </span>
              {/* 제목이 옆에 있으므로 포스터는 꾸밈용 */}
              <MoviePosterImage
                poster={movie.poster}
                sizes="84px"
                className="h-31.5 w-21 shrink-0 rounded-lg"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="truncate text-label1 text-static-white">
                  {movie.title}
                </h3>
                <p className="truncate text-caption1 text-neutral-15">
                  {[
                    movie.year,
                    movie.genre,
                    movie.runtime && `${movie.runtime}분`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {movie.audienceTotal !== null && (
                  // 폭이 좁아도 두 줄로 꺾이지 않게 (넘치면 끝을 … 처리)
                  <p className="flex gap-2 whitespace-nowrap text-caption1 text-neutral-15">
                    <span className="shrink-0">누적 관객수</span>
                    <span className="truncate">
                      {formatAudience(movie.audienceTotal)}
                    </span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </HorizontalScroll>
      ) : (
        <p className="text-body2 text-neutral-30">
          박스오피스 정보를 불러오지 못했어요.
        </p>
      )}
      {/* TODO: 랭킹 페이지가 생기면 <Link className={buttonVariants({ variant: "outline" })}>로 */}
      <Button type="button" variant="outline">
        랭킹 더보기
      </Button>
    </section>
  );
};

export default PopularMovies;
