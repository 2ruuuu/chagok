import EmptyState from "@/components/empty-state/EmptyState";
import PageHeader from "@/components/page-header/PageHeader";

// TODO: 시안 받으면 채우기
const TrashPage = () => {
  return (
    <>
      <PageHeader title="휴지통" back={{ fallback: "/settings" }} />
      <EmptyState message="준비 중이에요" />
    </>
  );
};

export default TrashPage;
