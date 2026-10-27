import { signOut } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import CollectedCardInMonth from "./_components/CollectedCardInMonth";
import MyCardList from "./_components/MyCardList";

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
      <CollectedCardInMonth />
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
