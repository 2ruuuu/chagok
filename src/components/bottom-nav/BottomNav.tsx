"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CertificationIcon from "@/assets/icons/certification.svg";
import CollectionGrayIcon from "@/assets/icons/collection-gray.svg";
import CollectionWhiteIcon from "@/assets/icons/collection-white.svg";
import HomeGrayIcon from "@/assets/icons/home-gray.svg";
import HomeWhiteIcon from "@/assets/icons/home-white.svg";
import MyGrayIcon from "@/assets/icons/my-gray.svg";
import MyWhiteIcon from "@/assets/icons/my-white.svg";
import RankingGrayIcon from "@/assets/icons/ranking-gray.svg";
import RankingWhiteIcon from "@/assets/icons/ranking-white.svg";
import { cn } from "@/lib/cn";

/**
 * TODO: 인증 · 랭킹 페이지는 아직 없음 (누르면 404). 페이지가 생기면 경로 확인.
 * icon: 비활성(회색), activeIcon: 현재 탭(흰색). 인증은 빨간 원 안의 흰 아이콘 하나뿐
 * label은 화면에 안 보이고 스크린 리더로만 읽힘
 */
const NAV_ITEMS = [
  { href: "/", label: "홈", icon: HomeGrayIcon, activeIcon: HomeWhiteIcon },
  {
    href: "/collection",
    label: "컬렉션",
    icon: CollectionGrayIcon,
    activeIcon: CollectionWhiteIcon,
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

const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

/** 이만큼(px) 이상 움직였을 때만 숨기기 · 보이기 판단 (손가락 떨림 무시) */
const SCROLL_THRESHOLD = 8;
/** 맨 위 근처에서는 항상 보임 */
const ALWAYS_VISIBLE_TOP = 40;

/**
 * 아래로 스크롤하면 숨기고 위로 스크롤하면 다시 보이게.
 * 페이지가 바뀌면 다시 보임
 */
const useHideOnScrollDown = (resetKey: string) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      // iOS가 끝에서 튕길 때(음수 · 최대값 초과)는 무시
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(maxY, 0));
      const delta = y - lastY;
      if (y < ALWAYS_VISIBLE_TOP) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(delta) >= SCROLL_THRESHOLD) {
        setHidden(delta > 0);
        lastY = y;
      }
    };

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [resetKey]);

  return hidden;
};

/** 움직이는 알약 위치 (바 안에서 왼쪽 px, 폭 px) */
type IndicatorRect = { left: number; width: number };

/**
 * 로그인 이후 화면 공통 하단 바 (시안 Tab Bar / Liquid Glass).
 * 343×64 어두운 유리(glass-bar) 알약, 화면 아래에서 34px 띄움(시안 홈 바 영역, 안전 영역이 더 크면 그만큼), 아이콘만 (글자 없음).
 * 5칸을 똑같이 나눔 → 현재 탭 뒤의 밝은 알약(glass-pressed)은 칸 폭 × 52, 탭이 바뀌면 미끄러져 이동.
 * 가운데 [인증]은 바 안의 48 빨간 원 + 빨간 빛 (인증은 하단 바 없는 화면으로 가니까 알약이 가지 않음)
 */
const BottomNav = () => {
  const pathname = usePathname();
  const hidden = useHideOnScrollDown(pathname);
  // 누른 순간 바로 움직이도록 이동 전에 미리 정해둠 (페이지가 바뀌면 실제 경로 기준으로 돌아감)
  const [pending, setPending] = useState<{ href: string; from: string } | null>(
    null,
  );
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  // 처음 위치 잡을 땐 미끄러지지 않고 바로 그 자리에
  const [animate, setAnimate] = useState(false);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const currentHref =
    NAV_ITEMS.find(
      (item) => !("primary" in item) && isActivePath(pathname, item.href),
    )?.href ?? null;
  const indicatorHref =
    pending && pending.from === pathname ? pending.href : currentHref;

  useLayoutEffect(() => {
    const measure = () => {
      const element = indicatorHref
        ? itemRefs.current.get(indicatorHref)
        : null;
      setIndicator(
        element
          ? { left: element.offsetLeft, width: element.offsetWidth }
          : null,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [indicatorHref]);

  useLayoutEffect(() => {
    if (!indicator || animate) return;
    // 첫 위치가 그려진 다음 프레임부터 transition 켬
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [indicator, animate]);

  return (
    <nav
      aria-label="주요 메뉴"
      // 바 바깥 여백은 아래 콘텐츠를 누를 수 있게 통과 (pointer-events-none), 바만 클릭됨
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-107.5 px-4 pb-[max(2.125rem,env(safe-area-inset-bottom))]",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        // 숨길 땐 인증 버튼 빨간 빛까지 화면 밖으로, 키보드로 포커스가 오면 다시 보임
        hidden && "translate-y-[calc(100%+1rem)] focus-within:translate-y-0",
      )}
    >
      {/* glass-bar가 position: relative → 알약 위치(offsetLeft)의 기준. 안쪽 여백 6 (64 - 알약 52) / 2 */}
      <div className="glass-bar pointer-events-auto h-16 rounded-full p-1.5">
        <span
          aria-hidden
          className={cn(
            "glass-pressed pointer-events-none absolute top-1.5 left-0 h-13 rounded-full",
            animate &&
              "transition-[transform,width,opacity] duration-500 ease-spring motion-reduce:transition-none",
            indicator ? "opacity-100" : "opacity-0",
          )}
          // 탭 위치는 화면 폭에 따라 달라서 JS로 잰 값 (인라인 style 예외)
          style={
            indicator
              ? {
                  width: indicator.width,
                  transform: `translateX(${indicator.left}px)`,
                }
              : undefined
          }
        />
        <ul className="grid h-full grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            const isPrimary = "primary" in item && item.primary;
            // 아이콘 강조는 알약이 향하는 탭 기준 (누르자마자 같이 바뀜)
            const isHighlighted = isPrimary
              ? isActive
              : indicatorHref === item.href;

            return (
              <li
                key={item.href}
                ref={(element) => {
                  if (element) itemRefs.current.set(item.href, element);
                  else itemRefs.current.delete(item.href);
                }}
              >
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    if (!isPrimary) {
                      setPending({ href: item.href, from: pathname });
                    }
                  }}
                  className="relative flex size-full items-center justify-center rounded-full outline-none transition-transform focus-visible:outline-2 focus-visible:outline-primary-40 active:scale-95"
                >
                  {isPrimary ? (
                    <span className="tab-primary flex size-12 items-center justify-center rounded-full bg-primary-40">
                      <Image
                        src={item.icon}
                        alt=""
                        aria-hidden
                        className="size-6"
                      />
                    </span>
                  ) : (
                    <Image
                      src={isHighlighted ? item.activeIcon : item.icon}
                      alt=""
                      aria-hidden
                      className="size-6"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default BottomNav;
