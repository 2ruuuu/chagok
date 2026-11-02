import type { MonthlyCollection } from "../_mocks/home";

interface TopFormatsProps {
  formats: MonthlyCollection["topFormats"];
}

/** 홈 수집 현황(데스크톱): 올해 많이 본 포맷 상위 3개 (시안 없이 만든 것, 뱃지는 컬렉션 포맷 뱃지와 같은 모양) */
const TopFormats = ({ formats }: TopFormatsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-label2 text-neutral-15">올해 많이 본 포맷</h3>
      {formats.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {formats.map(({ format, count }, index) => (
            <li key={format} className="flex items-center gap-3">
              <span className="w-3 text-label2 font-semibold text-neutral-40">
                {index + 1}
              </span>
              <span className="rounded-xs bg-neutral-75 px-1.5 py-0.5 text-caption1 font-semibold text-neutral-20">
                {format}
              </span>
              <span className="ml-auto text-label2 text-static-white">
                {count}장
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-label2 text-neutral-30">아직 기록이 없어요.</p>
      )}
    </div>
  );
};

export default TopFormats;
