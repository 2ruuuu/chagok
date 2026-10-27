import Image, { type StaticImageData } from "next/image";
import BadgeCheck from "@/assets/icons/badge-check.svg";
import { cn } from "@/lib/cn";

const MAX_CARDS = 5;

export type StackCard = {
  /** key용. 같은 영화를 여러 번 보면 포스터가 겹치므로 포스터 대신 id로 구분 */
  id: string;
  /** import한 이미지 또는 이미지 URL */
  poster: StaticImageData | string;
};

interface CardStackProps {
  /** 최신순. 앞에서 5장만 쓰고, 가장 최신 카드가 오른쪽 맨 위에 온다 */
  cards: StackCard[];
  className?: string;
}

/**
 * 모은 카드의 앞면을 옆으로 겹쳐 보여주는 묶음 (클릭 없음, 보기 전용).
 * 시안: 카드 80×112, 간격 -26px → 5장이면 80 × 5 - 26 × 4 = 296px
 */
const CardStack = ({ cards, className }: CardStackProps) => {
  const visibleCards = cards.slice(0, MAX_CARDS).reverse();

  return (
    <ul className={cn("flex", className)}>
      {visibleCards.map((card, index) => {
        const isTop = index === visibleCards.length - 1;

        return (
          <li
            key={card.id}
            className={cn(
              // 카드 비율이 5:7이라 모서리를 가로 6% / 세로 4.29%로 줘야 둥근 모서리가 찌그러지지 않음
              // @container: 배지 크기를 카드 너비(cqw) 기준으로 맞춤 → 묶음 크기가 바뀌어도 비율 유지
              "card-stack-item @container relative h-28 w-20 shrink-0 overflow-hidden rounded-[6%/4.29%]",
              index > 0 && "-ml-6.5",
            )}
          >
            {/* 위의 제목("N월에 모은 카드")이 내용을 설명하므로 포스터는 꾸밈용 */}
            <Image
              src={card.poster}
              alt=""
              fill
              // 흐린 미리보기는 import한 이미지에서만 자동 생성됨
              placeholder={typeof card.poster === "string" ? "empty" : "blur"}
              sizes="80px"
              className="object-cover"
            />
            <span
              aria-hidden
              className="card-holo-static pointer-events-none absolute inset-0"
            />

            {/* 아래 카드의 배지는 어차피 가려지므로 맨 위 카드에만 */}
            {isTop && (
              <span className="holo-border absolute top-[4cqw] right-[4cqw] flex items-center gap-[1.5cqw] rounded-full bg-material-dimmer py-[1.8cqw] pr-[3.6cqw] pl-[2.4cqw] text-[length:3.6cqw] leading-none font-semibold tracking-[0.04em] text-static-white backdrop-blur-[8px]">
                <Image
                  src={BadgeCheck}
                  alt=""
                  aria-hidden
                  className="size-[1.3em]"
                />
                VERIFIED
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default CardStack;
