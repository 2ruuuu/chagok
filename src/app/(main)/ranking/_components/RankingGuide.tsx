import { cn } from "@/lib/cn";

interface RankingGuideProps {
  className?: string;
}

/**
 * 랭킹 기준 안내 (시안 없이 만든 것). "왜 오늘 받은 카드가 안 들어갔지?"에 미리 답함.
 * 모바일 · 태블릿은 목록 아래, 데스크톱(xl)은 왼쪽 내 순위 패널 아래
 */
const RankingGuide = ({ className }: RankingGuideProps) => {
  return (
    <section aria-labelledby="ranking-guide-title" className={className}>
      <h2
        id="ranking-guide-title"
        className="text-label2 font-semibold text-neutral-30"
      >
        랭킹 기준
      </h2>
      <ul
        className={cn(
          "mt-2 flex flex-col gap-1 text-caption1 text-neutral-50",
          "[&>li]:flex [&>li]:gap-1.5 [&>li]:before:content-['·']",
        )}
      >
        <li>지금까지 받은 카드 수로 순위를 매겨요</li>
        <li>매일 00:00에 전날까지 받은 카드로 집계해요</li>
        <li>같은 장수면 공동 순위, 먼저 모은 사람이 위에 나와요</li>
        <li>순위 옆 숫자는 지난 집계보다 오르고 내린 칸 수예요</li>
      </ul>
    </section>
  );
};

export default RankingGuide;
