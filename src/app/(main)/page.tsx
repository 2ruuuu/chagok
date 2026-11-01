import { getPopularMovies, getUpcomingMovies } from "@/lib/movies/home";
import { createClient } from "@/lib/supabase/server";
import CollectedCardInMonth from "./_components/CollectedCardInMonth";
import MyCardList from "./_components/MyCardList";
import PopularMovies from "./_components/PopularMovies";
import UpcomingMovies from "./_components/UpcomingMovies";
import { monthlyCollection } from "./_mocks/home";

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

  // 영화 데이터는 외부 API를 캐시해서 씀 (src/lib/movies, 방문자 수와 상관없이 호출 수 고정)
  const [popularMovies, upcomingMovies] = await Promise.all([
    getPopularMovies(),
    getUpcomingMovies(),
  ]);

  return (
    <div>
      <MyCardList nickname={nickname} />
      <CollectedCardInMonth collection={monthlyCollection} />
      <PopularMovies movies={popularMovies} />
      <UpcomingMovies movies={upcomingMovies} />
    </div>
  );
};

export default HomePage;
