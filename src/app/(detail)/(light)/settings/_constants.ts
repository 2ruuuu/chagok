/** 설정 화면 메뉴. 프로필 편집 말고는 아직 "준비 중이에요" 빈 화면 */
export const SETTINGS_SECTIONS = [
  {
    title: "계정",
    items: [
      { label: "프로필 편집", href: "/my/edit" },
      { label: "연결된 계정", href: "/settings/connected-accounts" },
    ],
  },
  {
    title: "알림",
    items: [{ label: "서비스 알림", href: "/settings/notifications" }],
  },
  {
    title: "기록 관리",
    items: [
      { label: "휴지통", href: "/settings/trash" },
      { label: "카드 내보내기", href: "/settings/export" },
    ],
  },
  {
    title: "도움말",
    items: [
      { label: "문의하기", href: "/settings/contact" },
      { label: "개인정보 처리 방침", href: "/settings/privacy" },
    ],
  },
] as const;
