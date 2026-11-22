"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import StarGrayIcon from "@/assets/icons/star-gray.svg";
import StarRedIcon from "@/assets/icons/star-red.svg";
import Button from "@/components/button/Button";
import MovieSummary from "../../_components/MovieSummary";
import VerifyHeader from "../../_components/VerifyHeader";
import VerifyStepGuard from "../../_components/VerifyStepGuard";
import { MAX_RATING } from "../../_constants";
import { useVerifyStore } from "../../_stores/useVerifyStore";

const STARS = Array.from({ length: MAX_RATING }, (_, index) => index + 1);

/** 별점: 1~5 정수. 고르기 전에는 [다음]이 꺼져 있음 */
const RatingView = () => {
  const router = useRouter();
  const rating = useVerifyStore((state) => state.rating);
  const setRating = useVerifyStore((state) => state.setRating);

  return (
    <VerifyStepGuard require="draft">
      {(ticket) => (
        <>
          <VerifyHeader />
          <main className="flex flex-1 flex-col">
            <MovieSummary ticket={ticket} />
            <div className="mt-10 flex flex-col items-center gap-1 text-center">
              <h1 className="text-heading2 font-semibold text-static-white">
                이 영화는 어땠나요?
              </h1>
              <p id="rating-hint" className="text-body2 text-neutral-10">
                평점을 선택해 주세요.
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="별점"
              aria-describedby="rating-hint"
              className="mt-5 flex justify-center gap-1"
            >
              {STARS.map((star) => {
                const filled = star <= rating;
                return (
                  // biome-ignore lint/a11y/useSemanticElements: 별 모양 버튼이라 input radio 대신 role로 표현
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={star === rating}
                    aria-label={`${star}점`}
                    onClick={() => setRating(star)}
                    className="flex size-10 cursor-pointer items-center justify-center outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
                  >
                    <Image
                      src={filled ? StarRedIcon : StarGrayIcon}
                      alt=""
                      aria-hidden
                      className="size-10"
                    />
                  </button>
                );
              })}
            </div>
          </main>

          <Button
            type="button"
            variant={rating > 0 ? "primary" : "disable"}
            disabled={rating === 0}
            className="mt-5"
            onClick={() => router.push("/verify/review")}
          >
            다음
          </Button>
        </>
      )}
    </VerifyStepGuard>
  );
};

export default RatingView;
