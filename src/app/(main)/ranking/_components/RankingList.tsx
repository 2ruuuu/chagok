import Avatar from "@/components/avatar/Avatar";
import { cn } from "@/lib/cn";
import type { RankingEntry } from "@/lib/ranking/get-ranking";
import RankChangeBadge from "./RankChangeBadge";

interface RankingListProps {
  /** 시상대 아래 (4번째부터 100번째까지) */
  entries: RankingEntry[];
  /** 내 줄 강조 + [내 순위로 이동]의 도착점 (#my-rank) */
  myUserId: string | null;
}

/**
 * 랭킹 4위 아래 목록. 공동 순위면 같은 숫자가 이어짐 (4 · 4 · 4 · 7)
 * 순위 아래 지난 집계보다 변화, 내 줄은 밝은 배경 + "나" 표시 (시안 없이 만든 것)
 * 데스크톱(xl)은 사진 · 글자 한 단계 크게
 */
const RankingList = ({ entries, myUserId }: RankingListProps) => {
  return (
    <ol
      aria-label="4위 아래 순위"
      className="mt-10 divide-y divide-line-alternative overflow-hidden rounded-lg bg-common-0/4"
    >
      {entries.map((entry) => {
        const isMe = entry.userId === myUserId;
        return (
          <li
            key={entry.userId}
            id={isMe ? "my-rank" : undefined}
            className={cn(
              // 이동했을 때 위에 붙는 헤더(xl 72)에 가리지 않게
              "flex h-18 scroll-mt-4 items-center gap-4 px-5 xl:h-20 xl:scroll-mt-28 xl:px-6",
              isMe && "bg-common-0/8",
            )}
          >
            <span className="flex w-8 shrink-0 flex-col items-center xl:w-9">
              <span className="text-body2 font-medium text-static-white xl:text-body1">
                {entry.rank}
                <span className="sr-only">위</span>
              </span>
              <RankChangeBadge
                change={entry.change}
                className="text-caption2 xl:text-caption1"
              />
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-2.5 xl:gap-3">
              <Avatar
                src={entry.avatarUrl}
                size={48}
                className="size-10 xl:size-12"
              />
              <span className="truncate text-label1 font-semibold text-static-white xl:text-body1">
                {entry.nickname}
              </span>
              {isMe && (
                <span className="shrink-0 rounded-xs bg-primary-40 px-1.5 py-0.5 text-caption2 font-semibold text-static-white">
                  나
                </span>
              )}
            </div>
            <span className="shrink-0 text-caption1 text-neutral-30 xl:text-label2">
              {entry.cardCount}장
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default RankingList;
