import { createClient } from "@supabase/supabase-js";

/**
 * ⚠️ 관리자 전용 클라이언트.
 * SUPABASE_SECRET_KEY(구 service_role key)를 사용하므로 RLS(Row Level Security)를
 * 전부 우회합니다. 일반적인 데이터 조회/작성에는 절대 쓰지 말고,
 * 관리자 권한이 필요한 기능(회원 강제 삭제, 전체 데이터 접근 등)에서만
 * 서버 사이드(Route Handler/Server Action)에서 사용하세요.
 *
 * 쿠키(사용자 세션)를 일부러 읽지 않음: @supabase/ssr에 쿠키를 넘기면
 * 로그인한 사용자의 JWT로 요청이 나가 RLS가 그대로 적용되어 버림.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY가 설정되지 않았습니다.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
