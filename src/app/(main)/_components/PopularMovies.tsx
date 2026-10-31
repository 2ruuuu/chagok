import Image from "next/image";
import Button from "@/components/button/Button";
import HorizontalScroll from "@/components/horizontal-scroll/HorizontalScroll";
import type { PopularMovie } from "../_mocks/home";
import SectionHeader from "./SectionHeader";

const TITLE_ID = "popular-movies-title";

interface PopularMoviesProps {
  movies: PopularMovie[];
}

/**
 * 홈 네 번째 섹션: 요즘 인기 있는 영화 (2줄 가로 캐러셀).
 * 순위는 세로로 먼저 채움 → 1·2가 첫 줄, 3·4가 다음 줄 (grid-flow-col)
 */
const PopularMovies = ({ movies }: PopularMoviesProps) => {
  return (
    <section aria-labelledby={TITLE_ID} className="mt-15 flex flex-col gap-5">
      <SectionHeader id={TITLE_ID} title="요즘 인기 있는 🔥" />
      <HorizontalScroll
        aria-label="요즘 인기 있는 영화"
        // 시안: 항목 247×126, 열 간격 32, 줄 간격 16
        className="grid auto-cols-[15.4375rem] grid-flow-col grid-rows-2 gap-x-8 gap-y-4"
      >
        {movies.map((movie) => (
          <li key={movie.id} className="flex snap-start items-center gap-4">
            <span className="w-5 shrink-0 text-center text-heading2 text-static-white">
              <span className="sr-only">순위 </span>
              {movie.rank}
            </span>
            {/* 제목이 옆에 있으므로 포스터는 꾸밈용 */}
            <Image
              src={movie.poster}
              alt=""
              aria-hidden
              width={84}
              height={126}
              placeholder={typeof movie.poster === "string" ? "empty" : "blur"}
              className="h-31.5 w-21 shrink-0 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="truncate text-heading3 text-static-white">
                {movie.title}
              </h3>
              <p className="truncate text-body2 text-neutral-30">
                {movie.year} · {movie.genre} · {movie.runtime}분
              </p>
            </div>
          </li>
        ))}
      </HorizontalScroll>
      {/* TODO: 랭킹 페이지가 생기면 <Link className={buttonVariants({ variant: "outline" })}>로 */}
      <Button type="button" variant="outline">
        랭킹 더보기
      </Button>
    </section>
  );
};

export default PopularMovies;
