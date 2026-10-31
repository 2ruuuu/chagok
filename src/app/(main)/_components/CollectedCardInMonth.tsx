import Button from "@/components/button/Button";
import CardStack from "@/components/card-stack/CardStack";
import type { MonthlyCollection } from "../_mocks/home";

interface CollectedCardInMonthProps {
  collection: MonthlyCollection;
}

/** 지난 달과 차이: 늘면 +N, 같으면 0, 줄면 -N */
const formatDiff = (diff: number) => (diff > 0 ? `+${diff}` : `${diff}`);

/** 홈 두 번째 섹션: 이번 달에 모은 카드 (최신 5장 묶음 + 누적 · 지난 달 비교) */
const CollectedCardInMonth = ({ collection }: CollectedCardInMonthProps) => {
  const { month, monthCount, yearCount, lastMonthCount, cards } = collection;

  return (
    <section
      aria-labelledby="collected-card-in-month-title"
      className="flex flex-col gap-4 rounded-lg bg-common-0/4 p-5"
    >
      <h2
        id="collected-card-in-month-title"
        className="text-body2 text-static-white"
      >
        {month}월에 모은 카드 {monthCount}장
      </h2>
      <CardStack cards={cards} />
      <p className="flex items-center gap-0.5 text-caption1 text-neutral-30">
        <span>올 해 누적 {yearCount}장</span>
        <span aria-hidden>·</span>
        <span>지난 달보다 {formatDiff(monthCount - lastMonthCount)}</span>
      </p>
      <Button type="button" variant="outline">
        다른 티켓 인증하기
      </Button>
    </section>
  );
};

export default CollectedCardInMonth;
