import Image from "next/image";
import Link from "next/link";
import TrophyImage from "@/assets/imgs/trophy.png";
import TrophyGlowImage from "@/assets/imgs/trophy-glow.png";
import { buttonVariants } from "@/components/button/Button";
import { cn } from "@/lib/cn";
import type { MyRank } from "@/lib/ranking/get-ranking";
import RankChangeBadge from "./RankChangeBadge";

interface MyRankBoxProps {
  nickname: string | null;
  me: MyRank | null;
  /** 카드가 한 장이라도 있는지 (집계에 없을 때 "집계 전"인지 "카드 없음"인지 구분) */
  hasCards: boolean;
}

/**
 * 랭킹 맨 위 내 순위
 * - 모바일 · 태블릿: 화면 끝까지 닿는 띠, 왼쪽에 흐린 트로피 (시안: 160 · 투명도 20%, 띠 아래로 잘림) + 뒤 빛은 그대로
 * - 데스크톱(xl): 왼쪽 360 패널(둥근 상자), 트로피를 위에 선명하게 + 글자 한 단계 크게 + [내 순위로 이동] 버튼
 *   (모바일 · 태블릿 이동 링크는 page.tsx 기준 시각 줄 오른쪽)
 * 1위 · 집계 전 · 카드 없음 문구와 반응형은 시안 없이 만든 것 -> 시안 나오면 맞추기
 */
const MyRankBox = ({ nickname, me, hasCards }: MyRankBoxProps) => {
  return (
    <section
      aria-labelledby="my-rank-title"
      className={cn(
        "relative isolate -mx-5 flex h-30 flex-col items-center justify-center gap-1 overflow-hidden bg-common-0/8 px-5 text-center",
        "md:-mx-8 md:px-8",
        // 위 트로피 32 + 128 + 아래 16만큼 띄움 (따라 내려오는 건 page.tsx 왼쪽 칸)
        "xl:mx-0 xl:h-auto xl:gap-2 xl:rounded-lg xl:px-6 xl:pt-44 xl:pb-8",
      )}
    >
      <div
        aria-hidden
        className="absolute -top-4 left-0 -z-10 size-40 md:left-3 xl:top-8 xl:left-1/2 xl:size-32 xl:-translate-x-1/2"
      >
        <Image
          src={TrophyGlowImage}
          alt=""
          className="absolute top-1/2 left-1/2 size-50 max-w-none -translate-x-1/2 -translate-y-1/2"
        />
        <Image
          src={TrophyImage}
          alt=""
          sizes="160px"
          // 트로피만 흐리게 (빛까지 같이 흐리면 원래 옅은 빛이 안 보임)
          className="relative size-full opacity-20 xl:opacity-100"
        />
      </div>

      <h2
        id="my-rank-title"
        className="text-label2 text-neutral-15 xl:text-body1"
      >
        {nickname ? `${nickname} 님 현재 랭킹` : "내 현재 랭킹"}
      </h2>
      {me ? (
        <>
          <p className="flex items-center gap-1.5">
            <span className="text-heading2 font-bold text-static-white xl:text-display2">
              {me.rank}위
            </span>
            <RankChangeBadge
              change={me.change}
              className="text-label2 xl:text-body1"
            />
          </p>
          {/* 1위는 상위 %를 빼고 (혼자면 "상위 100%"가 돼서) 축하 문구만 */}
          <p className="text-caption1 text-neutral-30 xl:text-label2">
            {me.nextRank ? (
              <>
                상위 {me.topPercent}% ·{" "}
                <strong className="font-semibold text-medal-gold">
                  {me.nextRank.rank}위까지 {me.nextRank.remaining}장
                </strong>{" "}
                남았어요
              </>
            ) : (
              <strong className="font-semibold text-medal-gold">
                지금 1위예요!
              </strong>
            )}
          </p>
        </>
      ) : hasCards ? (
        <>
          <p className="text-heading2 font-bold text-static-white xl:text-display2">
            집계 전
          </p>
          <p className="text-caption1 text-neutral-30 xl:text-label2">
            매일 00:00 집계에 들어가요
          </p>
        </>
      ) : (
        <>
          <p className="text-heading2 font-bold text-static-white xl:text-display2">
            순위 없음
          </p>
          <Link
            href="/verify"
            className="text-caption1 font-semibold text-medal-gold underline underline-offset-2 xl:text-label2"
          >
            티켓을 인증하면 랭킹에 올라가요
          </Link>
        </>
      )}
      {me?.inList && (
        <a
          href="#my-rank"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-4 hidden h-11 xl:inline-flex",
          )}
        >
          내 순위로 이동
        </a>
      )}
    </section>
  );
};

export default MyRankBox;
