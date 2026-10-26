import { signOut } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import CollectedCardInMonth from "./_components/CollectedCardInMonth";
import MyCardList from "./_components/MyCardList";

const HomePage = async () => {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId!)
    .single();

  return (
    <div>
      <MyCardList nickname={profile?.nickname} />
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
