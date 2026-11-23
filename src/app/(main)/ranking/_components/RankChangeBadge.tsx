import { cn } from "@/lib/cn";
import type { RankChange } from "@/lib/ranking/get-ranking";

interface RankChangeBadgeProps {
  change: RankChange | null;
  className?: string;
}

/**
 * 지난 집계보다 순위 변화: ▲3(빨강) · ▼1(파랑) · -(변동 없음) · NEW(금색).
 * 첫 집계라 비교할 게 없으면 안 그림. 글자 크기는 쓰는 쪽에서 (시안 없이 만든 것)
 */
const RankChangeBadge = ({ change, className }: RankChangeBadgeProps) => {
  if (!change) return null;

  if (change.type === "new") {
    return (
      <span className={cn("font-semibold text-medal-gold", className)}>
        NEW<span className="sr-only">, 새로 들어왔어요</span>
      </span>
    );
  }
  if (change.type === "same") {
    return (
      <span className={cn("text-neutral-50", className)}>
        <span aria-hidden>-</span>
        <span className="sr-only">, 순위 그대로예요</span>
      </span>
    );
  }
  const isUp = change.type === "up";
  return (
    <span
      className={cn(
        "font-semibold",
        isUp ? "text-red-40" : "text-blue-40",
        className,
      )}
    >
      <span aria-hidden>
        {isUp ? "▲" : "▼"}
        {change.value}
      </span>
      <span className="sr-only">
        , {change.value}계단 {isUp ? "올랐어요" : "내려갔어요"}
      </span>
    </span>
  );
};

export default RankChangeBadge;
