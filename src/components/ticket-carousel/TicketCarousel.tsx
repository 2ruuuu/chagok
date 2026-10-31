"use client";

import { useEffect, useRef, useState } from "react";
import TicketCard, { type Ticket } from "@/components/ticket-card/TicketCard";
import TicketInfo from "@/components/ticket-info/TicketInfo";
import { cn } from "@/lib/cn";

/** 양옆 카드가 가장 멀어졌을 때의 크기·흐림·밝기 */
const SIDE_SCALE = 0.88;
const SIDE_BLUR_PX = 3;
const SIDE_BRIGHTNESS = 0.6;

interface TicketCarouselProps {
  tickets: Ticket[];
}

/**
 * 가운데에 가장 가까운 카드에 포커스, 멀어질수록 작고 흐리게.
 * 스크롤은 브라우저 기본(scroll-snap)에 맡기고, 스크롤 위치에 따라
 * 각 카드의 크기·흐림을 손가락을 따라 실시간으로 바꾼다 (리렌더 없이 style 직접 변경).
 */
const TicketCarousel = ({ tickets }: TicketCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  // 뒤집혀 있는 카드 (한 번에 하나만)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const updateFocus = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const [index, child] of Array.from(scroller.children).entries()) {
      const item = child as HTMLElement;
      const distance = Math.abs(
        item.offsetLeft + item.offsetWidth / 2 - center,
      );

      // 0 = 정가운데, 1 = 카드 한 장 이상 떨어짐
      const d = Math.min(distance / item.offsetWidth, 1);
      item.style.scale = String(1 - d * (1 - SIDE_SCALE));

      // 작아질 때 가운데 카드 쪽 모서리를 기준으로 줄어들게 → 보이는 간격이 gap 그대로 유지
      // (세로 기준은 아래 텍스트를 뺀 카드의 가운데)
      const isLeftSide = item.offsetLeft + item.offsetWidth / 2 < center;
      const card = item.firstElementChild as HTMLElement | null;
      const originY = card ? `${card.offsetHeight / 2}px` : "center";
      item.style.transformOrigin = `${isLeftSide ? "right" : "left"} ${originY}`;
      // 가운데 카드에는 filter를 아예 두지 않음 (3D 뒤집기가 평면으로 눌리는 것 방지)
      item.style.filter =
        d < 0.01
          ? ""
          : `blur(${d * SIDE_BLUR_PX}px) brightness(${1 - d * (1 - SIDE_BRIGHTNESS)})`;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
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

  // 처음 그릴 때도 양옆 카드를 작고 흐리게
  // biome-ignore lint/correctness/useExhaustiveDependencies: 마운트 시 1회만 실행
  useEffect(() => {
    updateFocus();
  }, []);

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    const item = scroller?.children[index] as HTMLElement | undefined;
    if (!scroller || !item) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    scroller.scrollTo({
      left: item.offsetLeft + item.offsetWidth / 2 - scroller.clientWidth / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      className={cn(
        "relative flex snap-x snap-mandatory gap-4 overflow-x-auto py-7.5",
        // 첫·마지막 카드도 가운데에 올 수 있도록 좌우 여백 = (화면 - 카드 너비) / 2
        "px-[calc(50%-9.375rem)] md:px-[calc(50%-11.25rem)]",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {tickets.map((ticket, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={ticket.certificateId}
            aria-current={isActive || undefined}
            className="relative flex shrink-0 snap-center flex-col items-center gap-5 will-change-[scale,filter]"
          >
            <TicketCard
              ticket={ticket}
              flipped={flippedIndex === index}
              onFlippedChange={(next) => setFlippedIndex(next ? index : null)}
            />

            <TicketInfo ticket={ticket} />

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
  );
};

export default TicketCarousel;
