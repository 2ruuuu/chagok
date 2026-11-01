import Image from "next/image";
import StarRedIcon from "@/assets/icons/star-red.svg";
import HorizontalScroll from "@/components/horizontal-scroll/HorizontalScroll";
import MiniCard from "@/components/mini-card/MiniCard";
import type { RecentReview } from "../_mocks/home";
import SectionHeader from "./SectionHeader";

const TITLE_ID = "recent-reviews-title";

interface RecentReviewsProps {
  reviews: RecentReview[];
}

/**
 * 홈 세 번째 섹션: 요즘 내가 본 (가로 캐러셀, 누르는 동작 없음)
 * 제목 · 내가 준 별점 · 내가 쓴 공유 리뷰(인증 때 필수, 사이트에 공개)
 * 시안: 상자 276×132 · 안쪽 여백 16, 카드 100×140이 상자 위로 24 튀어나옴, 글자는 카드 오른쪽 24부터
 */
const RecentReviews = ({ reviews }: RecentReviewsProps) => {
  return (
    <section aria-labelledby={TITLE_ID} className="mt-15 flex flex-col gap-5">
      <SectionHeader id={TITLE_ID} title="요즘 내가 본 🎞️" />
      <HorizontalScroll aria-label="요즘 내가 본" className="gap-3.5">
        {reviews.map((review) => (
          // 카드가 상자 위로 24px 튀어나오므로 그만큼 위 여백
          <li key={review.id} className="shrink-0 snap-start pt-6">
            <article className="relative flex h-33 w-69 flex-col justify-center gap-3 rounded-lg border border-line-normal bg-common-0/4 py-4 pr-4 pl-35">
              {/* 제목이 옆에 있으므로 포스터는 꾸밈용 */}
              <MiniCard
                poster={review.poster}
                sizes="100px"
                className="card-mini-shadow absolute -top-6 left-4 h-35 w-25"
              />
              <h3 className="truncate text-label2 text-static-white">
                {review.title}
              </h3>
              <p className="flex items-center gap-1 text-label2 text-static-white">
                <Image
                  src={StarRedIcon}
                  alt=""
                  aria-hidden
                  className="size-4 shrink-0"
                />
                <span className="sr-only">별점</span>
                {review.rating.toFixed(1)}
              </p>
              <p className="line-clamp-2 text-body2 text-static-white">
                <span className="sr-only">리뷰 </span>“ {review.content}
              </p>
            </article>
          </li>
        ))}
      </HorizontalScroll>
    </section>
  );
};

export default RecentReviews;
