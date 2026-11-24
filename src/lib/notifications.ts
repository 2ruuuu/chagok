// 알림 · 공지 타입과 규칙 (/notifications 목록, /my 종 빨간 점). 테이블이 생기면 행 타입에 맞춰 고치기

/**
 * 알림 탭: 검수 대상 티켓의 확인 결과만 (product.md 알림)
 * 카드 발급 알림은 안 보냄 (발급 화면을 바로 보니까)
 */
export type NotificationKind = "verify-approved" | "verify-rejected";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  message: string;
  createdAt: string;
  read: boolean;
};

/**
 * 공지 탭
 * - info: 점검 · 업데이트 · 장애 안내 (서비스 정보, 모두에게)
 * - promotion: 이벤트 · 프로모션 · 신규 카드 홍보 (광고성, 마케팅 수신 동의한 사람만)
 */
export type NoticeCategory = "info" | "promotion";

export type Notice = {
  id: string;
  category: NoticeCategory;
  title: string;
  createdAt: string;
  read: boolean;
};

/** 마케팅 수신 동의를 안 했으면 광고성(promotion) 공지는 빼고 보여줌 */
export const getVisibleNotices = (
  notices: Notice[],
  marketingAgreed: boolean,
) =>
  marketingAgreed
    ? notices
    : notices.filter((notice) => notice.category !== "promotion");

/** 안 읽은 알림 · 공지가 있는지 (종 빨간 점) */
export const hasUnread = (
  notifications: AppNotification[],
  notices: Notice[],
) => [...notifications, ...notices].some((item) => !item.read);

/**
 * 종 빨간 점: 안 읽은 알림 · 공지가 있는지 (홈 · 마이 · 데스크톱 상단 헤더)
 * TODO: 알림 · 공지 테이블이 생기면 불러와서 hasUnread로 (광고성 공지는 마케팅 동의한 사람만 셈).
 * 서버 전용 (테이블 연결하면 안에서 server client로 로그인 사용자 확인). 지금은 데이터가 없어서 항상 false
 * 레이아웃(TopNav)에서도 불러서, 레이아웃은 탭 이동 때 다시 안 그려짐 -> 읽음 처리 후에는 router.refresh() 필요
 */
export const getHasUnreadNotifications = async (): Promise<boolean> => false;
