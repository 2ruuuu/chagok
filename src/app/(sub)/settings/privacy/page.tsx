import EmptyState from "@/components/empty-state/EmptyState";
import PageHeader from "@/components/page-header/PageHeader";

// TODO: 시안 받으면 채우기
const PrivacyPolicyPage = () => {
  return (
    <>
      <PageHeader title="개인정보 처리 방침" back={{ fallback: "/settings" }} />
      <EmptyState message="준비 중이에요" />
    </>
  );
};

export default PrivacyPolicyPage;
