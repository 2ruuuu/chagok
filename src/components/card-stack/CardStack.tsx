import type { StaticImageData } from "next/image";
import MiniCard from "@/components/mini-card/MiniCard";
import { cn } from "@/lib/cn";

const MAX_CARDS = 5;

export type StackCard = {
  /** key용. 같은 영화를 여러 번 보면 포스터가 겹치므로 포스터 대신 id로 구분 */
  id: string;
  /** import한 이미지 또는 이미지 URL */
  poster: StaticImageData | string;
};

interface CardStackProps {
  /** 최신순. 몇 장이 와도 앞에서 5장만 쓰고, 가장 최신 카드가 오른쪽 맨 위에 온다 */
  cards: StackCard[];
  className?: string;
}

/**
 * 모은 카드의 앞면을 옆으로 겹쳐 보여주는 묶음 (클릭 없음, 보기 전용).
 * 시안(375): 카드 80×112, 간격 -26px(한 장씩 54px 오른쪽) → 5장이면 80 × 5 - 26 × 4 = 296px.
 * 묶음 상자를 폭 100% · 비율 296:112로 고정하고, 카드를 그 안에 %로 배치 → 상자 좌우 폭에 꽉 참.
 * (flex 안에서 %로 카드 크기를 주면 iOS Safari가 기준 폭을 못 잡아 카드가 사라져서 이 방식을 씀)
 */
const CardStack = ({ cards, className }: CardStackProps) => {
  const visibleCards = cards.slice(0, MAX_CARDS).reverse();

  return (
    <ul className={cn("relative aspect-296/112 w-full", className)}>
      {visibleCards.map((card, index) => (
        <li
          key={card.id}
          className="absolute inset-y-0 w-[calc(100%*80/296)]"
          // 몇 번째 카드인지에 따라 달라지는 값이라 style로 계산
          style={{ left: `${((index * 54) / 296) * 100}%` }}
        >
          {/* 위의 제목("N월에 모은 카드")이 내용을 설명하므로 포스터는 꾸밈용.
              아래 카드의 배지는 어차피 가려지므로 맨 위 카드에만 */}
          <MiniCard
            poster={card.poster}
            showBadge={index === visibleCards.length - 1}
            className="card-stack-item h-full w-full"
          />
        </li>
      ))}
    </ul>
  );
};

export default CardStack;
