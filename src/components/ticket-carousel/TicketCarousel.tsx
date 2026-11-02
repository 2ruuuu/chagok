"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import TicketCard, { type Ticket } from "@/components/ticket-card/TicketCard";
import TicketInfo from "@/components/ticket-info/TicketInfo";
import { cn } from "@/lib/cn";

/** 양옆 카드가 가장 멀어졌을 때의 크기 · 어둡기 · 아래 글자 투명도 */
const SIDE_SCALE = 0.88;
/** 카드 위 검은 막의 최대 불투명도 (0.4 = 밝기 60%) */
const SIDE_DIM = 0.4;
const SIDE_INFO_OPACITY = 0.5;

/** 스크롤해도 바뀌지 않는 카드 위치 · 크기. 마운트할 때와 크기가 바뀔 때만 잰다 */
type ItemLayout = {
  item: HTMLElement;
  /** 카드 위 검은 막 */
  dim: HTMLElement | null;
  /** 카드 아래 제목 · 정보 */
  info: HTMLElement | null;
  /** 스크롤 영역 안에서 카드 가운데 x (offsetLeft는 scale에 영향 안 받음) */
  center: number;
  width: number;
  /** 줄어드는 기준 세로 위치 = 아래 글자를 뺀 카드의 가운데 */
  originY: number;
};

/** 데스크톱 좌우 화살표 공통 (어두운 유리 원, 끝 카드면 흐리게 + 못 누름) */
const ARROW_CLASS =
  "absolute top-70.5 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line-normal bg-neutral-99/72 backdrop-blur-chrome transition-[background-color,opacity] outline-none hover:bg-neutral-80 focus-visible:outline-2 focus-visible:outline-primary-40 disabled:cursor-default disabled:opacity-0 xl:flex";

interface TicketCarouselProps {
  tickets: Ticket[];
}

/**
 * 가운데에 가장 가까운 카드에 포커스, 멀어질수록 작고 어둡게.
 * 스크롤은 브라우저 기본(scroll-snap)에 맡기고, 스크롤 위치에 따라
 * 각 카드의 크기 · 어둡기를 손가락을 따라 실시간으로 바꾼다 (리렌더 없이 style 직접 변경).
 * 성능: 어둡게는 brightness 대신 검은 막의 opacity만 스크롤 따라 바꿈 (매 프레임 다시 그리지 않음).
 * 흐림은 스크롤 따라 바꾸지 않고, 가운데가 아닌 카드에 고정 blur를 걸어 가운데가 바뀔 때만 전환.
 * 카드 위치 · 크기는 미리 재두고, 스크롤 중에는 스크롤 위치만 읽은 뒤 스타일을 한꺼번에 씀 (강제 레이아웃 계산 방지)
 */
const TicketCarousel = ({ tickets }: TicketCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  // 뒤집혀 있는 카드 (한 번에 하나만)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const layoutsRef = useRef<ItemLayout[]>([]);

  /** 카드 위치 · 크기 재기 (읽기만) */
  const measure = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    layoutsRef.current = Array.from(scroller.children, (child) => {
      const item = child as HTMLElement;
      const card = item.firstElementChild as HTMLElement | null;
      return {
        item,
        dim: item.querySelector<HTMLElement>("[data-carousel-dim]"),
        info: item.querySelector<HTMLElement>("[data-carousel-info]"),
        center: item.offsetLeft + item.offsetWidth / 2,
        width: item.offsetWidth,
        originY: (card ?? item).offsetHeight / 2,
      };
    });
  };

  const updateFocus = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const layouts = layoutsRef.current;

    // 1) 읽기: 스크롤 위치만
    const center = scroller.scrollLeft + scroller.clientWidth / 2;

    // 2) 계산: 가운데에서 얼마나 떨어졌는지 (0 = 정가운데, 1 = 카드 한 장 이상)
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    const distances = layouts.map((layout, index) => {
      const distance = Math.abs(layout.center - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
      return Math.min(distance / layout.width, 1);
    });

    // 3) 쓰기: 한꺼번에 (사이에 레이아웃 값을 읽지 않음)
    for (const [index, layout] of layouts.entries()) {
      const d = distances[index];
      layout.item.style.scale = String(1 - d * (1 - SIDE_SCALE));
      // 작아질 때 가운데 카드 쪽 모서리를 기준으로 줄어들게 → 보이는 간격이 gap 그대로 유지
      const originX = layout.center < center ? "right" : "left";
      layout.item.style.transformOrigin = `${originX} ${layout.originY}px`;
      if (layout.dim) layout.dim.style.opacity = String(d * SIDE_DIM);
      if (layout.info) {
        layout.info.style.opacity = String(1 - d * (1 - SIDE_INFO_OPACITY));
      }
    }

    // 가운데 카드가 바뀌면 뒤집혀 있던 카드는 앞면으로
    if (nearestIndex !== activeIndexRef.current) {
      activeIndexRef.current = nearestIndex;
      setActiveIndex(nearestIndex);
      setFlippedIndex(null);
    }
  };

  const handleScroll = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(updateFocus);
  };

  // 처음 그릴 때 재고 양옆 카드를 작고 어둡게. 화면 · 카드 크기가 바뀌면(회전, 폰트 로딩 등) 다시 잼
  // biome-ignore lint/correctness/useExhaustiveDependencies: 마운트 시 1회만 등록
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const remeasure = () => {
      measure();
      updateFocus();
    };
    remeasure();

    const observer = new ResizeObserver(remeasure);
    observer.observe(scroller);
    for (const child of Array.from(scroller.children)) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    const layout = layoutsRef.current[index];
    if (!scroller || !layout) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    scroller.scrollTo({
      left: layout.center - scroller.clientWidth / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === tickets.length - 1;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className={cn(
          "relative flex snap-x snap-mandatory gap-4 overflow-x-auto py-7.5",
          // 첫·마지막 카드도 가운데에 올 수 있도록 좌우 여백 = (화면 - 카드 너비) / 2
          "px-[calc(50%-9.375rem)] md:px-[calc(50%-11.25rem)]",
          "scrollbar-none [&::-webkit-scrollbar]:hidden",
          // 데스크톱(xl): 양 끝을 흐리게 (상자 끝에서 카드가 툭 잘려 보이지 않게).
          // 스크롤 영역에만 걸어서 양 끝 화살표는 흐려지지 않음
          "xl:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        )}
      >
        {tickets.map((ticket, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={ticket.certificateId}
              aria-current={isActive || undefined}
              className={cn(
                "relative flex shrink-0 snap-center flex-col items-center gap-5 will-change-[scale]",
                // 옆 카드 흐림: 가운데에는 filter를 아예 두지 않음 (3D 뒤집기가 평면으로 눌리는 것 방지)
                "transition-[filter] duration-300 ease-out motion-reduce:transition-none",
                !isActive && "blur-[3px]",
              )}
            >
              <div className="relative">
                <TicketCard
                  ticket={ticket}
                  flipped={flippedIndex === index}
                  active={isActive}
                  onFlippedChange={(next) =>
                    setFlippedIndex(next ? index : null)
                  }
                />
                {/* 양옆 카드 어둡게 (opacity는 스크롤 위치에 따라 JS로) */}
                <span
                  data-carousel-dim
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[20px] bg-common-100 opacity-0"
                />
              </div>

              <div data-carousel-info>
                <TicketInfo ticket={ticket} />
              </div>

              {/* 옆 카드는 뒤집히지 않고, 누르면 가운데로 이동 */}
              {!isActive && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`${ticket.title} 카드로 이동`}
                  onClick={() => scrollToIndex(index)}
                  className="absolute inset-0 cursor-pointer"
                />
              )}
            </div>
          );
        })}
      </div>
      {/*
        데스크톱(xl)만: 마우스로는 가로 스크롤이 어려워서 좌우 화살표 (시안 없이 만든 것).
        캐러셀 영역 양 끝에서 16 안쪽, 세로는 카드 가운데(위 여백 30 + 252)
      */}
      <button
        type="button"
        aria-label="이전 카드"
        disabled={isFirst}
        onClick={() => scrollToIndex(activeIndex - 1)}
        className={cn(ARROW_CLASS, "left-4")}
      >
        <Image
          src={ChevronRightIcon}
          alt=""
          aria-hidden
          className="size-5 rotate-180"
        />
      </button>
      <button
        type="button"
        aria-label="다음 카드"
        disabled={isLast}
        onClick={() => scrollToIndex(activeIndex + 1)}
        className={cn(ARROW_CLASS, "right-4")}
      >
        <Image src={ChevronRightIcon} alt="" aria-hidden className="size-5" />
      </button>
    </div>
  );
};

export default TicketCarousel;
