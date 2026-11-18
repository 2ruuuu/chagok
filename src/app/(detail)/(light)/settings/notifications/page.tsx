import EmptyState from "@/components/empty-state/EmptyState";
import PageHeader from "@/components/page-header/PageHeader";

// TODO: 시안 받으면 채우기
const ServiceNotificationsPage = () => {
  return (
    <>
      <PageHeader title="서비스 알림" back={{ fallback: "/settings" }} />
      <EmptyState message="준비 중이에요" />
    </>
  );
};

export default ServiceNotificationsPage;
