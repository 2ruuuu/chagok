import Image from "next/image";
import Link from "next/link";
import BellIcon from "@/assets/icons/bell.svg";
import BellRingIcon from "@/assets/icons/bell-ring-white.svg";

interface NotificationBellProps {
  /** 안 읽은 알림 · 공지가 있으면 빨간 점 있는 종 (getHasUnreadNotifications) */
  hasUnread: boolean;
  className?: string;
}

/** 알림 화면으로 가는 종 아이콘 (홈 · 마이 · 데스크톱 상단 헤더 공통) */
const NotificationBell = ({ hasUnread, className }: NotificationBellProps) => {
  return (
    <Link
      href="/notifications"
      aria-label={hasUnread ? "알림, 새 알림 있음" : "알림"}
      className={className}
    >
      <Image src={hasUnread ? BellRingIcon : BellIcon} alt="" aria-hidden />
    </Link>
  );
};

export default NotificationBell;
