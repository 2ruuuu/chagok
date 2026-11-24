"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import BackIcon from "@/assets/icons/back.svg";
import { cn } from "@/lib/cn";

const BACK_CLASS =
  "absolute left-0 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-40 xl:static";

interface PageHeaderProps {
  title: string;
  /**
   * 뒤로가기 동작.
   * - href: 그 경로로 이동 (마이 → 홈처럼 탭 화면)
   * - fallback: 이전 화면으로, 링크로 바로 들어와 이전 화면이 없으면 이 경로로 replace
   */
  back: { href: string } | { fallback: string };
  /** 오른쪽 영역 (알림 · 설정 아이콘, 저장 버튼 등) */
  right?: ReactNode;
  /**
   * 데스크톱(xl)에서 뒤로가기 숨김. 탭 화면(마이)처럼 상단 헤더로 이동하는 화면에 씀
   * (랭킹 · 컬렉션과 같은 규칙, 하위 화면은 뒤로가기 유지)
   */
  hideBackOnDesktop?: boolean;
}

/**
 * 테마 화면(ThemedScreen) 공통 헤더: 페이지 배경색 sticky, 가운데 제목, 왼쪽 뒤로가기.
 * 아이콘은 지금 dark 테마용(흰색), 화이트 모드 넣을 때 테마별로 나눠야 함
 */
const PageHeader = ({
  title,
  back,
  right,
  hideBackOnDesktop = false,
}: PageHeaderProps) => {
  const router = useRouter();

  const goBack = (fallback: string) => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };

  const icon = <Image src={BackIcon} alt="" aria-hidden />;

  const backClass = cn(BACK_CLASS, hideBackOnDesktop && "xl:hidden");

  return (
    // 레이아웃 px-5를 상쇄해서 배경이 화면 끝까지 (스크롤할 때 아래 내용을 가림)
    // 데스크톱(xl)은 상단 헤더(TopNav)가 고정이라 이 헤더는 고정 안 함, 제목은 왼쪽 heading1 (랭킹 · 컬렉션과 같게)
    <header className="sticky top-0 z-30 -mx-5 flex h-14 items-center justify-center bg-background-alternative px-5 xl:static xl:h-auto xl:pt-10 xl:pb-2">
      <div className="relative flex w-full items-center justify-center xl:justify-start xl:gap-3">
        {"href" in back ? (
          <Link href={back.href} aria-label="뒤로가기" className={backClass}>
            {icon}
          </Link>
        ) : (
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => goBack(back.fallback)}
            className={backClass}
          >
            {icon}
          </button>
        )}
        <h1 className="text-heading3 font-semibold text-label-normal xl:text-heading1 xl:font-bold">
          {title}
        </h1>
        {right && (
          <div className="absolute right-0 flex items-center gap-3">
            {right}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
