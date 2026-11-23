import Image, { type StaticImageData } from "next/image";
import CrownBronzeImage from "@/assets/imgs/crown-bronze.png";
import CrownGoldImage from "@/assets/imgs/crown-gold.png";
import CrownSilverImage from "@/assets/imgs/crown-silver.png";
import PodiumGlowImage from "@/assets/imgs/podium-glow.png";
import Avatar from "@/components/avatar/Avatar";
import { cn } from "@/lib/cn";
import type { RankingEntry } from "@/lib/ranking/get-ranking";
import RankChangeBadge from "./RankChangeBadge";

type Medal = {
  crown: StaticImageData;
  /** 위 칸(사진 · 이름): 색 16% -> 흰 4% + 테두리 45% */
  card: string;
  /** 아래 받침(순위 숫자): 1D1C1B 위에 색 34% -> 12% + 위 테두리 없음 */
  pedestal: string;
  /** 장수 · 순위 숫자 색 */
  accent: string;
};

/** 공동 순위면 같은 메달 (1 · 1 · 3위면 금 · 금 · 동) */
const MEDALS: Record<1 | 2 | 3, Medal> = {
  1: {
    crown: CrownGoldImage,
    card: "border-medal-gold/45 from-medal-gold/16",
    pedestal: "border-medal-gold/45 from-medal-gold/34 to-medal-gold/12",
    accent: "text-medal-gold",
  },
  2: {
    crown: CrownSilverImage,
    card: "border-medal-silver/45 from-medal-silver/16",
    pedestal: "border-medal-silver/45 from-medal-silver/34 to-medal-silver/12",
    accent: "text-static-white",
  },
  3: {
    crown: CrownBronzeImage,
    card: "border-medal-bronze/45 from-medal-bronze/16",
    pedestal: "border-medal-bronze/45 from-medal-bronze/34 to-medal-bronze/12",
    accent: "text-medal-bronze",
  },
};

/** 목록 순서(0 · 1 · 2) -> 칸 위치. 가운데가 첫 번째, 왼쪽 두 번째, 오른쪽 세 번째 */
const COLUMNS = ["col-start-2", "col-start-1", "col-start-3"];

interface PodiumProps {
  /** 목록 앞 3명 (같은 순위 안에서는 먼저 도달한 사람이 앞) */
  entries: RankingEntry[];
}

/**
 * 랭킹 1~3위 시상대: 2 · 1 · 3 순서로 놓고 가운데(첫 번째)만 20 위로 + 금색 그림자 · 뒤 빛.
 * 읽는 순서는 1 · 2 · 3 그대로 (DOM은 순위순, 칸 위치만 grid로 바꿈)
 * 태블릿은 가운데 480, 데스크톱(xl)은 오른쪽 칸 위쪽 가운데 560 + 사진 · 글자 한 단계 크게 (시안 없이 만든 것)
 */
const Podium = ({ entries }: PodiumProps) => {
  return (
    <section
      aria-label="1~3위"
      className="relative isolate mx-auto mt-17 w-full md:max-w-120 xl:mt-8 xl:max-w-140"
    >
      <Image
        src={PodiumGlowImage}
        alt=""
        aria-hidden
        sizes="(min-width: 1440px) 360px, 250px"
        className="pointer-events-none absolute -top-12 left-1/2 -z-10 w-62.5 max-w-none -translate-x-1/2 opacity-40 xl:w-90"
      />
      <ol className="grid grid-cols-3 items-end gap-4">
        {entries.slice(0, 3).map((entry, index) => {
          const medal = MEDALS[Math.min(entry.rank, 3) as 1 | 2 | 3];
          const isFirst = index === 0;
          return (
            <li
              key={entry.userId}
              className={cn(
                "relative row-start-1 flex min-w-0 flex-col rounded-lg",
                COLUMNS[index],
                isFirst && "mb-5 shadow-medal-gold",
              )}
            >
              <Image
                src={medal.crown}
                alt=""
                aria-hidden
                sizes="(min-width: 1440px) 64px, 56px"
                className="absolute -top-8 left-1/2 size-14 -translate-x-1/2 xl:-top-9 xl:size-16"
              />
              <div
                className={cn(
                  "flex flex-col items-center rounded-t-lg border bg-linear-to-b to-common-0/4 px-2 pt-6 pb-4 xl:pt-8 xl:pb-5",
                  medal.card,
                )}
              >
                <Avatar
                  src={entry.avatarUrl}
                  size={80}
                  className="size-15 xl:size-20"
                />
                <p className="mt-2 max-w-full truncate text-label1 font-semibold text-static-white xl:mt-3 xl:text-body1">
                  {entry.nickname}
                </p>
                <p className="flex items-center gap-1 text-caption1 xl:text-label2">
                  <span className={isFirst ? medal.accent : "text-neutral-30"}>
                    {entry.cardCount}장
                  </span>
                  <RankChangeBadge change={entry.change} />
                </p>
              </div>
              <p
                className={cn(
                  "flex h-11.5 items-center justify-center rounded-b-lg border border-t-0 bg-neutral-85 bg-linear-to-b text-body1 font-semibold xl:h-14 xl:text-heading3",
                  medal.pedestal,
                  medal.accent,
                )}
              >
                {entry.rank}
                <span className="sr-only">위</span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default Podium;
