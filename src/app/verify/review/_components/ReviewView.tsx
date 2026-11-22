"use client";

import { useRouter } from "next/navigation";
import TextStep from "../../_components/TextStep";
import VerifyStepGuard from "../../_components/VerifyStepGuard";
import { useVerifyStore } from "../../_stores/useVerifyStore";

/** 관람 리뷰: 사이트에 공개, 필수 (1자 이상이면 버튼이 켜짐) */
const ReviewView = () => {
  const router = useRouter();
  const review = useVerifyStore((state) => state.review);
  const setReview = useVerifyStore((state) => state.setReview);

  return (
    <VerifyStepGuard require="draft">
      {() => (
        <TextStep
          id="verify-review"
          title="관람한 감상을 다른 관객들과 나눠보세요."
          label="관람 리뷰"
          note="(필수)"
          placeholder="좋았던 점이나 아쉬웠던 점을 자유롭게 적어주세요."
          value={review}
          onChange={setReview}
          buttonLabel="다음"
          canSubmit={review.trim().length > 0}
          onSubmit={() => router.push("/verify/memo")}
        />
      )}
    </VerifyStepGuard>
  );
};

export default ReviewView;
