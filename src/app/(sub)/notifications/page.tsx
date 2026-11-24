import BellRedIcon from "@/assets/icons/bell-red.svg";
import MegaphoneIcon from "@/assets/icons/megaphone.svg";
import EmptyState from "@/components/empty-state/EmptyState";
import PageHeader from "@/components/page-header/PageHeader";
import {
  type AppNotification,
  getVisibleNotices,
  type Notice,
} from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";
import { mockProfile } from "@/mocks/profile";
import NotificationItem from "./_components/NotificationItem";
import NotificationTabs, {
  type NotificationTab,
} from "./_components/NotificationTabs";

const NotificationsPage = async ({
  searchParams,
}: PageProps<"/notifications">) => {
  const { tab: tabParam } = await searchParams;
  const tab: NotificationTab = tabParam === "notice" ? "notice" : "alert";

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  // 광고성 공지는 마케팅 수신 동의한 사람만
  // 비로그인(임시 공개 중)이면 목데이터 프로필
  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("marketing_agreed")
        .eq("id", userId)
        .maybeSingle()
    : { data: mockProfile };

  // TODO: 알림 · 공지 테이블이 생기면 불러오기 (+ 열면 읽음 처리, 누르면 이동). 지금은 항상 빈 화면
  const notifications: AppNotification[] = [];
  const notices = getVisibleNotices(
    [] as Notice[],
    profile?.marketing_agreed ?? false,
  );

  // 알림 · 공지 둘 다 없으면 탭 없이 빈 화면 (시안)
  if (notifications.length === 0 && notices.length === 0) {
    return (
      <>
        <PageHeader title="알림" back={{ fallback: "/" }} />
        <EmptyState message="도착한 알림이 없어요" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="알림" back={{ fallback: "/" }} />
      <NotificationTabs current={tab} />

      <div
        role="tabpanel"
        id={`notifications-panel-${tab}`}
        aria-labelledby={`notifications-tab-${tab}`}
        className="flex flex-1 flex-col"
      >
        {tab === "alert" ? (
          notifications.length > 0 ? (
            <ul className="-mx-5 flex flex-col">
              {notifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  icon={BellRedIcon}
                  label="알림"
                  text={item.message}
                  createdAt={item.createdAt}
                />
              ))}
            </ul>
          ) : (
            <EmptyState message="도착한 알림이 없어요" />
          )
        ) : notices.length > 0 ? (
          <ul className="-mx-5 flex flex-col">
            {notices.map((item) => (
              <NotificationItem
                key={item.id}
                icon={MegaphoneIcon}
                label="공지사항"
                text={item.title}
                createdAt={item.createdAt}
              />
            ))}
          </ul>
        ) : (
          <EmptyState message="등록된 공지사항이 없어요" />
        )}
      </div>
    </>
  );
};

export default NotificationsPage;
