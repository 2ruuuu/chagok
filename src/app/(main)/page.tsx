import { signOut } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import CollectedCardInMonth from "./_components/CollectedCardInMonth";
import EndingSoonMovies from "./_components/EndingSoonMovies";
import MyCardList from "./_components/MyCardList";
import PopularMovies from "./_components/PopularMovies";
import RecentReviews from "./_components/RecentReviews";
import {
  endingSoonMovies,
  monthlyCollection,
  popularMovies,
  recentReviews,
} from "./_mocks/home";

const HomePage = async () => {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  // 지금은 /가 임시 공개라 비로그인 방문도 있을 수 있음 → 그땐 조회하지 않음
  let nickname: string | null = null;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", userId)
      .single();
    nickname = profile?.nickname ?? null;
  }

  return (
    <div>
      <MyCardList nickname={nickname} />
      <CollectedCardInMonth collection={monthlyCollection} />
      <RecentReviews reviews={recentReviews} />
      <PopularMovies movies={popularMovies} />
      <EndingSoonMovies movies={endingSoonMovies} />
      {/* 임시: 로그인 테스트용 로그아웃 버튼 */}
      <form action={signOut}>
        <button type="submit" className="cursor-pointer underline">
          로그아웃
        </button>
      </form>
    </div>
  );
};
export default HomePage;
