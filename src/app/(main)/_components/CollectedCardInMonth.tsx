import Button from "@/components/button/Button";
import CardStack from "@/components/card-stack/CardStack";
import { cn } from "@/lib/cn";
import type { MonthlyCollection } from "../_mocks/home";
import MonthlyCountChart from "./MonthlyCountChart";
import TopFormats from "./TopFormats";

interface CollectedCardInMonthProps {
  collection: MonthlyCollection;
}

/** 지난 달과 차이: 늘면 +N, 같으면 0, 줄면 -N */
const formatDiff = (diff: number) => (diff > 0 ? `+${diff}` : `${diff}`);

/**
 * 홈 두 번째 섹션: 이번 달에 모은 카드 (최신 5장 묶음 + 누적 · 지난 달 비교)
 * - 모바일: 제목 → 카드 묶음 → 누적 → 버튼 세로
 * - 태블릿(md): 왼쪽 제목 · 누적 · 버튼, 오른쪽 카드 묶음(296, 시안 기준 폭)
 * - 데스크톱(xl): 홈 왼쪽 칸(360)의 "내 수집 현황" 패널. 다시 세로, 스크롤해도 헤더 아래에 붙어 있음.
 *   누적 · 지난 달 비교를 큰 숫자로, 월별 막대 · 많이 본 포맷 추가 (시안 없이 만든 것).
 *   sticky라 패널 높이가 화면(900 - 헤더)보다 커지지 않게 유지
 */
const CollectedCardInMonth = ({ collection }: CollectedCardInMonthProps) => {
  const {
    month,
    monthCount,
    yearCount,
    lastMonthCount,
    cards,
    monthlyCounts,
    topFormats,
  } = collection;
  const diff = formatDiff(monthCount - lastMonthCount);

  return (
    <section
      aria-labelledby="collected-card-in-month-title"
      // 위 섹션(캐러셀)과 간격 40 = 캐러셀 아래 여백 30(카드 기울기 · 그림자 공간) + 10
      className={cn(
        "mt-2.5 flex flex-col gap-4 rounded-lg bg-common-0/4 p-5",
        "md:grid md:grid-cols-[minmax(0,1fr)_18.5rem] md:grid-rows-[auto_1fr_auto] md:gap-x-10 md:gap-y-2 md:p-6 md:[grid-template-areas:'title_stack'_'meta_stack'_'button_stack']",
        // 헤더 72 + 32 아래에 붙음. 패널(약 730)이 화면에 다 들어갈 때만 (낮은 노트북 화면에서 아래가 잘리지 않게)
        "xl:mt-0 xl:flex xl:gap-5 xl:p-6 xl:[@media(min-height:53rem)]:sticky xl:[@media(min-height:53rem)]:top-26",
      )}
    >
      <div className="flex flex-col gap-1 md:[grid-area:title]">
        <p className="hidden text-caption1 font-semibold text-primary-30 xl:block">
          내 수집 현황
        </p>
        <h2
          id="collected-card-in-month-title"
          className="text-body2 text-static-white xl:text-heading3 xl:font-semibold"
        >
          {month}월에 모은 카드 {monthCount}장
        </h2>
      </div>
      <CardStack
        cards={cards}
        className="md:self-center md:[grid-area:stack]"
      />
      {/* 모바일 · 태블릿: 한 줄 요약 / 데스크톱: 아래 큰 숫자 2칸 */}
      <p className="flex items-center gap-0.5 self-start text-caption1 text-neutral-15 md:[grid-area:meta] xl:hidden">
        <span>올해 누적 {yearCount}장</span>
        <span aria-hidden>·</span>
        <span>지난 달보다 {diff}</span>
      </p>
      <dl className="hidden grid-cols-2 border-line-normal border-t pt-5 xl:grid">
        <div className="flex flex-col gap-1">
          <dt className="text-label2 text-neutral-30">올해 누적</dt>
          <dd className="text-heading1 font-bold text-static-white">
            {yearCount}장
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-label2 text-neutral-30">지난 달보다</dt>
          <dd className="text-heading1 font-bold text-static-white">
            {diff}
          </dd>
        </div>
      </dl>
      <div className="hidden border-line-normal border-t pt-5 xl:block">
        <MonthlyCountChart counts={monthlyCounts} />
      </div>
      <div className="hidden border-line-normal border-t pt-5 xl:block">
        <TopFormats formats={topFormats} />
      </div>
      <Button
        type="button"
        variant="outline"
        className="md:[grid-area:button]"
      >
        다른 티켓 인증하기
      </Button>
    </section>
  );
};

export default CollectedCardInMonth;
