import HorizontalScroll from "@/components/horizontal-scroll/HorizontalScroll";
import MiniCard from "@/components/mini-card/MiniCard";
import type { RecentReview } from "../_mocks/home";
import SectionHeader from "./SectionHeader";

const TITLE_ID = "recent-reviews-title";

interface RecentReviewsProps {
  reviews: RecentReview[];
}

/** 홈 세 번째 섹션: 최근 남긴 관람평 (가로 캐러셀) */
const RecentReviews = ({ reviews }: RecentReviewsProps) => {
  return (
    <section aria-labelledby={TITLE_ID} className="mt-15 flex flex-col gap-5">
      <SectionHeader id={TITLE_ID} title="최근 남긴 관람평" />
      <HorizontalScroll aria-label="최근 남긴 관람평" className="gap-3.5">
        {reviews.map((review) => (
          // 카드가 상자 위로 24px 튀어나오므로 그만큼 위 여백
          <li key={review.id} className="shrink-0 snap-start pt-6">
            <article className="relative h-27 w-46 rounded-lg border border-line-normal bg-common-0/4 pt-5 pr-4 pl-30">
              {/* 제목이 옆에 있으므로 포스터는 꾸밈용 */}
              <MiniCard
                poster={review.poster}
                className="card-mini-shadow absolute -top-6 left-5"
              />
              <h3 className="truncate text-caption1 text-static-white">
                {review.title}
              </h3>
              <p className="mt-2.5 flex items-center gap-0.5 text-label3 text-static-white">
                {/* TODO: 별 아이콘 (Figma에서 받으면 넣기) */}
                <span aria-hidden className="size-4 shrink-0" />
                <span className="sr-only">별점</span>
                {review.rating.toFixed(1)}
              </p>
              <p className="mt-2.5 truncate text-caption2 text-neutral-30">
                “ {review.content}
              </p>
            </article>
          </li>
        ))}
      </HorizontalScroll>
    </section>
  );
};

export default RecentReviews;
