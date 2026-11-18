import EmptyState from "@/components/empty-state/EmptyState";
import PageHeader from "@/components/page-header/PageHeader";

// TODO: 시안 · 데이터 생기면 채우기
const MyReviewsPage = () => {
  return (
    <>
      <PageHeader title="관람 리뷰" back={{ fallback: "/my" }} />
      <EmptyState message="준비 중이에요" />
    </>
  );
};

export default MyReviewsPage;
