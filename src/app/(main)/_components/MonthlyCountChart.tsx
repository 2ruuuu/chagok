import { cn } from "@/lib/cn";
import type { MonthlyCollection } from "../_mocks/home";

interface MonthlyCountChartProps {
  counts: MonthlyCollection["monthlyCounts"];
}

/**
 * 홈 수집 현황(데스크톱): 최근 6개월 월별 카드 수 막대 (시안 없이 만든 것).
 * 가장 많은 달을 막대 최대 높이로, 이번 달(마지막)만 빨간색
 */
const MonthlyCountChart = ({ counts }: MonthlyCountChartProps) => {
  const max = Math.max(...counts.map(({ count }) => count), 1);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-label2 text-neutral-15">월별 기록</h3>
      <ol className="flex h-28 items-end gap-2">
        {counts.map(({ month, count }, index) => {
          const isCurrent = index === counts.length - 1;
          return (
            <li
              key={month}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="sr-only">
                {month}월 {count}장
              </span>
              <span
                aria-hidden
                className={cn(
                  "text-caption2 font-semibold",
                  isCurrent ? "text-static-white" : "text-neutral-40",
                )}
              >
                {count}
              </span>
              <span
                aria-hidden
                className={cn(
                  "w-full rounded-xs",
                  isCurrent ? "bg-primary-40" : "bg-neutral-70",
                )}
                // 개수에 따라 달라지는 높이라 style로 계산 (막대 영역 최대 3.5rem, 0장도 얇게 보이게)
                style={{ height: `max(0.25rem, ${(count / max) * 3.5}rem)` }}
              />
              <span
                aria-hidden
                className={cn(
                  "text-caption1",
                  isCurrent ? "text-static-white" : "text-neutral-40",
                )}
              >
                {month}월
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default MonthlyCountChart;
