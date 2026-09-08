import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 일반적인 서버 사이드 클라이언트.
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 사용해 로그인한 사용자의 권한(RLS)을
 * 그대로 따르므로, Server Component/Route Handler에서의 일반적인 데이터
 * 조회/작성에는 이 클라이언트를 사용하세요.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
