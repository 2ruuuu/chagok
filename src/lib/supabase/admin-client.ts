import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * ⚠️ 관리자 전용 클라이언트.
 * SUPABASE_SECRET_KEY(구 service_role key)를 사용하므로 RLS(Row Level Security)를
 * 전부 우회합니다. 일반적인 데이터 조회/작성에는 절대 쓰지 말고,
 * 관리자 권한이 필요한 기능(회원 강제 삭제, 전체 데이터 접근 등)에서만
 * 서버 사이드(Server Component/Route Handler)에서 사용하세요.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component에서 호출된 경우 무시.
            // 미들웨어에서 세션을 갱신하고 있다면 문제 없음.
          }
        },
      },
    },
  );
}
