import { signOut } from "@/app/(auth)/actions";

export default function Home() {
  return (
    <div>
      <h1>홈페이지 입니다.</h1>
      {/* 임시: 로그인 테스트용 로그아웃 버튼 */}
      <form action={signOut}>
        <button type="submit" className="cursor-pointer underline">
          로그아웃
        </button>
      </form>
    </div>
  );
}
