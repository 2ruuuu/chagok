import BackButton from "@/components/back-button/BackButton";
import {
  getRanking,
  PODIUM_SIZE,
  type Ranking,
} from "@/lib/ranking/get-ranking";
import { createClient } from "@/lib/supabase/server";
import MyRankBox from "./_components/MyRankBox";
import Podium from "./_components/Podium";
import RankingGuide from "./_components/RankingGuide";
import RankingList from "./_components/RankingList";

/**
 * 카드 랭킹: 받은 카드 전체 누적 장수, 매일 00:00(KST) 집계 (rankings, /api/cron/rankings).
 * 내 순위 -> 1~3위 시상대 -> 4~100위 목록. 사람을 눌러도 동작 없음
 * 반응형 (시안 없이 만든 것, 폭 · 좌우 여백은 (main)/layout.tsx)
 * - 태블릿(md): 한 줄 그대로, 내 순위 띠는 화면 끝까지 · 시상대는 가운데 480
 * - 데스크톱(xl): 제목 왼쪽, 아래 2단 = 왼쪽 360 내 순위 패널 · 오른쪽 시상대(가운데 560) + 목록
 */
const RankingPage = async () => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  // 지금은 /가 임시 공개라 비로그인 방문도 있음 -> 랭킹은 RLS로 빈 값, 내 정보는 조회 안 함
  const [ranking, profile, myCards] = await Promise.all([
    getRanking(supabase, userId),
    userId
      ? supabase.from("profiles").select("nickname").eq("id", userId).single()
      : null,
    userId
      ? supabase
          .from("cards")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      : null,
  ]);

  return (
    <RankingView
      ranking={ranking}
      nickname={profile?.data?.nickname ?? null}
      hasCards={(myCards?.count ?? 0) > 0}
    />
  );
};

interface RankingViewProps {
  ranking: Ranking;
  nickname: string | null;
  hasCards: boolean;
}

const RankingView = ({ ranking, nickname, hasCards }: RankingViewProps) => {
  const { countedUntil, entries, myUserId, me } = ranking;

  return (
    <>
      {/* 데스크톱은 상단 헤더(TopNav)가 있어서 뒤로가기를 숨기고 제목을 왼쪽에 크게 (컬렉션과 같음) */}
      <header className="relative flex h-14 items-center justify-center xl:h-auto xl:justify-start xl:pt-10">
        <BackButton className="absolute left-0 size-6 xl:hidden" />
        <h1 className="text-heading3 font-semibold text-static-white xl:text-heading1">
          랭킹
        </h1>
      </header>
      <div className="mt-3 flex items-center justify-between gap-3 xl:mt-2">
        {countedUntil && (
          <p className="text-caption1 text-neutral-50 xl:text-label2">
            {countedUntil} 기준
          </p>
        )}
        {/* 모바일 · 태블릿: 내 줄이 목록에 있으면 이동 링크 (데스크톱은 내 순위 패널 안 버튼) */}
        {me?.inList && (
          <a
            href="#my-rank"
            className="ml-auto text-caption1 font-semibold text-neutral-15 xl:hidden"
          >
            내 순위로 이동
          </a>
        )}
      </div>
      {/* 데스크톱(xl): 왼쪽 360 내 순위 패널(따라 내려옴) · 오른쪽 시상대 + 목록 (홈 아래 2단과 같은 비율) */}
      <div className="mt-9 flex flex-1 flex-col xl:mt-8 xl:grid xl:grid-cols-[22.5rem_minmax(0,1fr)] xl:items-start xl:gap-10">
        {/* 데스크톱: 헤더 72 + 32 아래에 붙어서 따라 내려옴 (홈 수집 현황과 같은 위치) */}
        <div className="flex flex-col xl:sticky xl:top-26 xl:gap-8">
          <MyRankBox nickname={nickname} me={me} hasCards={hasCards} />
          <RankingGuide className="hidden px-1 xl:block" />
        </div>
        <div className="flex flex-1 flex-col">
          {entries.length > 0 ? (
            <>
              <Podium entries={entries.slice(0, PODIUM_SIZE)} />
              {entries.length > PODIUM_SIZE && (
                <RankingList
                  entries={entries.slice(PODIUM_SIZE)}
                  myUserId={myUserId}
                />
              )}
            </>
          ) : (
            // 집계 전이거나 아직 아무도 카드가 없을 때 (시안 없이 만든 것)
            <p className="flex flex-1 items-center justify-center py-20 text-body2 text-neutral-40 xl:text-body1">
              아직 랭킹에 오른 사람이 없어요
            </p>
          )}
          <RankingGuide className="mt-8 xl:hidden" />
        </div>
      </div>
    </>
  );
};

export default RankingPage;
