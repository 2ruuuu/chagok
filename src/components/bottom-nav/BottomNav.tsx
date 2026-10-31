"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CertificationIcon from "@/assets/icons/certification.svg";
import CollectionIcon from "@/assets/icons/collection.svg";
import CollectionFilledIcon from "@/assets/icons/collection-filled.svg";
import HomeIcon from "@/assets/icons/home.svg";
import HomeFilledIcon from "@/assets/icons/home-filled.svg";
import MypageIcon from "@/assets/icons/mypage.svg";
import MypageFilledIcon from "@/assets/icons/mypage-filled.svg";
import RankingIcon from "@/assets/icons/ranking.svg";
import RankingFilledIcon from "@/assets/icons/ranking-filled.svg";
import { cn } from "@/lib/cn";

/**
 * TODO: 인증 · 랭킹 페이지는 아직 없음 (누르면 404). 페이지가 생기면 경로 확인.
 * icon: 비활성, activeIcon: 현재 페이지일 때 (인증은 원 안의 흰 아이콘 하나뿐)
 */
const NAV_ITEMS = [
  { href: "/", label: "홈", icon: HomeIcon, activeIcon: HomeFilledIcon },
  {
    href: "/collection",
    label: "컬렉션",
    icon: CollectionIcon,
    activeIcon: CollectionFilledIcon,
  },
  {
    href: "/verify",
    label: "인증",
    icon: CertificationIcon,
    activeIcon: CertificationIcon,
    primary: true,
  },
  {
    href: "/ranking",
    label: "랭킹",
    icon: RankingIcon,
    activeIcon: RankingFilledIcon,
  },
  {
    href: "/my",
    label: "마이",
    icon: MypageIcon,
    activeIcon: MypageFilledIcon,
  },
] as const;

const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

/**
 * 로그인 이후 화면 공통 하단 바. 화면 아래에 고정, 가운데 [인증]은 위로 튀어나온 원형 버튼.
 * 시안: 높이 60 + 아래 안전 영역, 항목 50×40 (아이콘 24 + 글자 14)
 */
const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-107.5 bg-common-0 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-15 items-center justify-between px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const isPrimary = "primary" in item && item.primary;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex w-12.5 flex-col items-center gap-0.5 text-caption2",
                  isActive
                    ? "font-semibold text-label-normal"
                    : "text-neutral-40",
                  // 가운데 버튼은 아이콘이 원 안에 있어서 글자만 다른 항목과 같은 높이에 맞춤
                  isPrimary && "pt-6.5",
                )}
              >
                {isPrimary ? (
                  <span className="absolute -top-7.5 left-1/2 flex size-13.5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-common-0 bg-primary-40">
                    <Image
                      src={item.icon}
                      alt=""
                      aria-hidden
                      className="size-6"
                    />
                  </span>
                ) : (
                  <Image
                    src={isActive ? item.activeIcon : item.icon}
                    alt=""
                    aria-hidden
                    className="size-6"
                  />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
