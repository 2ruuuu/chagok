import Link from "next/link";
import { cn } from "@/lib/cn";

export type NotificationTab = "alert" | "notice";

const TABS: { id: NotificationTab; label: string; href: string }[] = [
  { id: "alert", label: "알림", href: "/notifications" },
  { id: "notice", label: "공지사항", href: "/notifications?tab=notice" },
];

interface NotificationTabsProps {
  current: NotificationTab;
}

/**
 * 알림 · 공지사항 탭. 탭은 ?tab=notice 주소로 (새로고침 · 공유해도 같은 탭)
 * 탭 사이 이동은 기록에 안 쌓이게 replace → 뒤로가기는 알림 화면 이전으로
 */
const NotificationTabs = ({ current }: NotificationTabsProps) => {
  return (
    // 헤더(h-14) 바로 아래에 붙어서 같이 고정 (데스크톱은 상단 헤더 TopNav h-18 아래), 레이아웃 px-5를 상쇄해서 밑줄이 끝까지
    <div
      role="tablist"
      aria-label="알림 종류"
      className="sticky top-14 z-20 xl:top-18 -mx-5 flex border-b border-line-normal bg-background-alternative"
    >
      {TABS.map((tab) => {
        const selected = tab.id === current;
        return (
          <Link
            key={tab.id}
            id={`notifications-tab-${tab.id}`}
            href={tab.href}
            replace
            scroll={false}
            role="tab"
            aria-selected={selected}
            aria-controls={`notifications-panel-${tab.id}`}
            className={cn(
              "relative flex h-12 flex-1 md:h-14 items-center justify-center text-body1 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-40",
              selected
                ? "font-semibold text-label-normal after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-label-normal"
                : "font-medium text-label-assistive",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default NotificationTabs;
