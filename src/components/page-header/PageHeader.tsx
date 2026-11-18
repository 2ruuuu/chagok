"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import ChevronLeftBlackIcon from "@/assets/icons/chevron-left-black.svg";

const BACK_CLASS =
  "absolute left-0 flex size-6 cursor-pointer items-center justify-center rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-40";

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
}

/** 밝은 화면 공통 헤더: 흰 바탕, 가운데 제목, 왼쪽 뒤로가기 */
const PageHeader = ({ title, back, right }: PageHeaderProps) => {
  const router = useRouter();

  const goBack = (fallback: string) => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };

  const icon = <Image src={ChevronLeftBlackIcon} alt="" aria-hidden />;

  return (
    // 레이아웃 px-5를 상쇄해서 흰 바탕이 화면 끝까지
    <header className="sticky top-0 z-30 -mx-5 flex h-14 items-center justify-center bg-common-0 px-5">
      <div className="relative flex w-full items-center justify-center">
        {"href" in back ? (
          <Link href={back.href} aria-label="뒤로가기" className={BACK_CLASS}>
            {icon}
          </Link>
        ) : (
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => goBack(back.fallback)}
            className={BACK_CLASS}
          >
            {icon}
          </button>
        )}
        <h1 className="text-heading3 font-semibold text-label-normal">
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
