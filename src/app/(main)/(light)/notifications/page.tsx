import EmptyState from "@/components/empty-state/EmptyState";
import PageHeader from "@/components/page-header/PageHeader";

// TODO: 알림 시안 준비되면 목록 (보낼 알림: 카드 발급, 공지 · 업데이트 — product.md)
const NotificationsPage = () => {
  return (
    <>
      <PageHeader title="알림" back={{ fallback: "/" }} />
      <EmptyState message="알림이 없어요" />
    </>
  );
};

export default NotificationsPage;
