import CertificationIcon from "@/assets/icons/certification.svg";
import CollectionGrayIcon from "@/assets/icons/collection-gray.svg";
import CollectionWhiteIcon from "@/assets/icons/collection-white.svg";
import HomeGrayIcon from "@/assets/icons/home-gray.svg";
import HomeWhiteIcon from "@/assets/icons/home-white.svg";
import MyGrayIcon from "@/assets/icons/my-gray.svg";
import MyWhiteIcon from "@/assets/icons/my-white.svg";
import RankingGrayIcon from "@/assets/icons/ranking-gray.svg";
import RankingWhiteIcon from "@/assets/icons/ranking-white.svg";

/** 티켓 인증 화면 (TODO: 아직 페이지 없음, 생기면 경로 확인) */
export const VERIFY_HREF = "/verify";

/**
 * 주요 메뉴 (모바일 · 태블릿 하단 바 BottomNav, 데스크톱 상단 헤더 TopNav 같이 씀).
 * TODO: 인증 · 랭킹 페이지는 아직 없음 (누르면 404). 페이지가 생기면 경로 확인.
 * icon: 비활성(회색), activeIcon: 현재 탭(흰색). 인증은 빨간 원 안의 흰 아이콘 하나뿐
 */
export const NAV_ITEMS = [
  { href: "/", label: "홈", icon: HomeGrayIcon, activeIcon: HomeWhiteIcon },
  {
    href: "/collection",
    label: "컬렉션",
    icon: CollectionGrayIcon,
    activeIcon: CollectionWhiteIcon,
  },
  {
    href: VERIFY_HREF,
    label: "인증",
    icon: CertificationIcon,
    activeIcon: CertificationIcon,
    primary: true,
  },
  {
    href: "/ranking",
    label: "랭킹",
    icon: RankingGrayIcon,
    activeIcon: RankingWhiteIcon,
  },
  {
    href: "/my",
    label: "마이",
    icon: MyGrayIcon,
    activeIcon: MyWhiteIcon,
  },
] as const;

/** 지금 경로가 이 메뉴 아래인지 (홈은 정확히 / 일 때만) */
export const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
