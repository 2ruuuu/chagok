import EmptyState from "@/components/empty-state/EmptyState";
import PageHeader from "@/components/page-header/PageHeader";

// TODO: 시안 · 데이터 생기면 채우기
const MyCommentsPage = () => {
  return (
    <>
      <PageHeader title="나의 감상" back={{ fallback: "/my" }} />
      <EmptyState message="준비 중이에요" />
    </>
  );
};

export default MyCommentsPage;
