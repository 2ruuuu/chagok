"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CertificationIcon from "@/assets/icons/certification.svg";
import chagokLogo from "@/assets/imgs/chagok-logo.png";
import NotificationBell from "@/components/notification-bell/NotificationBell";
import { isActivePath, NAV_ITEMS, VERIFY_HREF } from "@/constants/nav";
import { cn } from "@/lib/cn";

const FOCUS_CLASS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-40";

/**
 * 데스크톱(xl 1440~) 상단 헤더. 모바일 · 태블릿은 하단 바(BottomNav)를 씀 (시안 없이 만든 것).
 * 왼쪽 로고 · 글자 메뉴(홈 · 컬렉션 · 랭킹 · 마이), 오른쪽 알림 · [티켓 인증]
 */
interface TopNavProps {
  /** 안 읽은 알림 · 공지가 있으면 종에 빨간 점 */
  hasUnreadNotifications: boolean;
}

const TopNav = ({ hasUnreadNotifications }: TopNavProps) => {
  const pathname = usePathname();

  return (
    // 유리 느낌: 흐림은 12px(backdrop-blur-md)까지만. 화면 폭 전체에 붙어 있어서 64px(chrome)는 스크롤마다 너무 비쌈
    <header className="sticky top-0 z-40 hidden border-line-normal border-b bg-neutral-99/72 backdrop-blur-md xl:block">
      <div className="mx-auto flex h-18 max-w-300 items-center gap-12">
        <Link
          href="/"
          aria-label="차곡 홈"
          className={cn("shrink-0 rounded-xs", FOCUS_CLASS)}
        >
          <Image
            src={chagokLogo}
            alt=""
            aria-hidden
            preload
            className="h-8 w-auto"
          />
        </Link>
        <nav aria-label="주요 메뉴" className="flex-1">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              // 인증은 오른쪽 빨간 버튼으로 따로
              if ("primary" in item) return null;
              const isActive = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-xs text-body1 font-semibold transition-colors",
                      FOCUS_CLASS,
                      isActive
                        ? "text-static-white"
                        : "text-neutral-40 hover:text-neutral-15",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-6">
          <NotificationBell
            hasUnread={hasUnreadNotifications}
            className={cn("rounded-xs", FOCUS_CLASS)}
          />
          <Link
            href={VERIFY_HREF}
            aria-current={
              isActivePath(pathname, VERIFY_HREF) ? "page" : undefined
            }
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-2xl bg-primary-40 pr-3 pl-3 text-label1 font-semibold text-static-white transition-colors hover:bg-primary-50 active:bg-primary-60",
              FOCUS_CLASS,
            )}
          >
            <Image
              src={CertificationIcon}
              alt=""
              aria-hidden
              className="size-5"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
