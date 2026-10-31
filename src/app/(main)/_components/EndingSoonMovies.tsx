import Image from "next/image";
import HorizontalScroll from "@/components/horizontal-scroll/HorizontalScroll";
import { cn } from "@/lib/cn";
import type { EndingSoonMovie } from "../_mocks/home";
import SectionHeader from "./SectionHeader";

const TITLE_ID = "ending-soon-movies-title";

/** 남은 날이 이보다 적으면 급한 뱃지(primary-40), 이상이면 기본 뱃지(neutral-70) */
const URGENT_DAYS = 10;

interface EndingSoonMoviesProps {
  movies: EndingSoonMovie[];
}

/** 홈 다섯 번째 섹션: 곧 상영 종료되는 영화 (가로 캐러셀, D-N 뱃지) */
const EndingSoonMovies = ({ movies }: EndingSoonMoviesProps) => {
  return (
    <section aria-labelledby={TITLE_ID} className="mt-15 flex flex-col gap-5">
      <SectionHeader id={TITLE_ID} title="곧 상영 종료되는 영화" />
      <HorizontalScroll aria-label="곧 상영 종료되는 영화" className="gap-4">
        {movies.map((movie) => (
          <li
            key={movie.id}
            className="relative h-35.75 w-25 shrink-0 snap-start overflow-hidden rounded-lg"
          >
            {/* 제목 글자가 없으므로 포스터 자체가 영화 이름을 알려줌 */}
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              sizes="100px"
              placeholder={typeof movie.poster === "string" ? "empty" : "blur"}
              className="object-cover"
            />
            <span
              className={cn(
                "absolute top-1 left-1 rounded-xs px-1 py-0.5 text-caption2 font-semibold text-static-white",
                movie.daysLeft < URGENT_DAYS
                  ? "bg-primary-40"
                  : "bg-neutral-70",
              )}
            >
              <span className="sr-only">상영 종료 </span>D-{movie.daysLeft}
            </span>
          </li>
        ))}
      </HorizontalScroll>
    </section>
  );
};

export default EndingSoonMovies;
