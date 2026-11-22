import MiniCard from "@/components/mini-card/MiniCard";
import type { RecognizedTicket } from "../_stores/useVerifyStore";

interface MovieSummaryProps {
  ticket: Pick<
    RecognizedTicket,
    "title" | "poster" | "productionYear" | "genres" | "runtime"
  >;
}

/** 별점 화면 위쪽의 영화 요약 띠 (작은 포스터 + 제목 + 제작연도 · 장르 · 러닝타임) */
const MovieSummary = ({ ticket }: MovieSummaryProps) => {
  return (
    <section className="-mx-5 flex gap-5 bg-common-0/4 p-5">
      {/* 발급 전이라 VERIFIED 배지 없음 */}
      <MiniCard
        poster={ticket.poster}
        showBadge={false}
        sizes="60px"
        className="h-21 w-15"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-label1 text-static-white">{ticket.title}</h2>
        <MovieMeta ticket={ticket} />
      </div>
    </section>
  );
};

interface MovieMetaProps {
  ticket: Pick<RecognizedTicket, "productionYear" | "genres" | "runtime">;
}

/** 제작연도 · 장르(여러 개면 전부) · 러닝타임. 넘치면 줄바꿈 */
export const MovieMeta = ({ ticket }: MovieMetaProps) => {
  const items = [
    ticket.productionYear,
    ticket.genres.join(", "),
    `${ticket.runtime}분`,
  ];

  return <p className="text-caption1 text-neutral-5">{items.join(" · ")}</p>;
};

export default MovieSummary;
