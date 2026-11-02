import HorizontalScroll from "@/components/horizontal-scroll/HorizontalScroll";
import { cn } from "@/lib/cn";
import type { UpcomingMovie } from "@/lib/movies/types";
import MoviePosterImage from "./MoviePosterImage";
import SectionHeader from "./SectionHeader";

const TITLE_ID = "upcoming-movies-title";

/** 남은 날이 이보다 적으면 급한 뱃지(primary-40), 이상이면 기본 뱃지(neutral-70) */
const URGENT_DAYS = 10;

interface UpcomingMoviesProps {
  movies: UpcomingMovie[];
}

/**
 * 홈 다섯 번째 섹션: 곧 개봉하는 영화 (TMDB, 가로 캐러셀, D-N 뱃지)
 * 데스크톱(xl)은 가로 스크롤 대신 5열 그리드, 포스터가 칸 폭에 맞춰 커짐 (비율 100:143 유지)
 */
const UpcomingMovies = ({ movies }: UpcomingMoviesProps) => {
  return (
    <section aria-labelledby={TITLE_ID} className="mt-15 flex flex-col gap-5">
      <SectionHeader id={TITLE_ID} title="곧 개봉해요 🎬" />
      {movies.length > 0 ? (
        <HorizontalScroll
          aria-label="곧 개봉해요"
          className="gap-4 xl:grid xl:grid-cols-5 xl:gap-y-6 xl:overflow-visible"
        >
          {movies.map((movie) => (
            <li
              key={movie.id}
              className="relative h-35.75 w-25 shrink-0 snap-start overflow-hidden rounded-lg xl:aspect-100/143 xl:h-auto xl:w-auto"
            >
              {/* 제목 글자가 없으므로 포스터 자체가 영화 이름을 알려줌 */}
              <MoviePosterImage
                poster={movie.poster}
                alt={movie.title}
                sizes="(min-width: 1440px) 150px, 100px"
                className="size-full"
              />
              <span
                className={cn(
                  "absolute top-1 left-1 rounded-xs px-1 py-0.5 text-caption2 font-semibold text-static-white xl:top-2 xl:left-2 xl:px-1.5 xl:text-caption1",
                  movie.daysLeft < URGENT_DAYS
                    ? "bg-primary-40"
                    : "bg-neutral-70",
                )}
              >
                <span className="sr-only">개봉까지 </span>
                {movie.daysLeft === 0 ? "D-Day" : `D-${movie.daysLeft}`}
              </span>
            </li>
          ))}
        </HorizontalScroll>
      ) : (
        <p className="text-body2 text-neutral-30">
          30일 안에 개봉하는 영화 정보가 없어요.
        </p>
      )}
    </section>
  );
};

export default UpcomingMovies;
