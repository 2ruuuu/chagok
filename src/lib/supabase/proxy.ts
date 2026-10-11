import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/** 로그인 없이 접근 가능한 경로 (접두어 일치) */
const PUBLIC_PATHS = [
  "/login",
  "/find-id",
  "/find-password",
  "/auth",
  "/api/cron",
  "/card-demo",
];

/** 회원가입 중 세션이 생기기 전 단계 (정확히 일치) */
const PUBLIC_EXACT_PATHS = ["/signup"];

/**
 * 가입 단계. 가입 미완료(닉네임 없음) 사용자는 여기에만 머물 수 있고,
 * 가입 완료 사용자는 들어올 수 없음. (/signup/complete는 완료 후 화면이라 제외)
 */
const SIGNUP_STEP_PATHS = ["/signup", "/signup/password", "/signup/nickname"];

const matchesPrefix = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

const isPublicPath = (pathname: string) =>
  PUBLIC_EXACT_PATHS.includes(pathname) ||
  PUBLIC_PATHS.some((path) => matchesPrefix(pathname, path));

/**
 * proxy.ts에서 매 요청마다 호출.
 * 1. Supabase 세션 쿠키 갱신
 * 2. 비로그인 사용자 → /login
 * 3. 로그인했지만 닉네임이 없는(가입 미완료) 사용자 → 남은 가입 단계로
 * 4. 가입 완료 사용자가 /login, /signup 단계에 오면 → /
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // createServerClient와 getClaims() 사이에 다른 코드를 넣지 말 것 (세션 갱신이 꼬임)
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    // 갱신된 세션 쿠키를 리다이렉트 응답에도 실어 보냄
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  };

  if (!claims) {
    return isPublicPath(pathname) ? response : redirectTo("/login");
  }

  // OAuth 콜백·API는 가입 단계 검사 대상이 아님
  if (matchesPrefix(pathname, "/auth") || matchesPrefix(pathname, "/api")) {
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", claims.sub)
    .maybeSingle();
  // 조회 실패(일시적 오류)로 가입 완료 사용자를 가입 단계로 보내지 않도록 통과시킴
  if (profileError) {
    return response;
  }
  const isSignupComplete = Boolean(profile?.nickname);

  if (!isSignupComplete) {
    if (SIGNUP_STEP_PATHS.includes(pathname)) {
      return response;
    }
    // 이메일 가입자는 비밀번호부터, OAuth 가입자는 비밀번호가 필요 없으므로 닉네임부터
    const provider = claims.app_metadata?.provider;
    return redirectTo(
      provider === "email" ? "/signup/password" : "/signup/nickname",
    );
  }

  if (
    matchesPrefix(pathname, "/login") ||
    SIGNUP_STEP_PATHS.includes(pathname)
  ) {
    return redirectTo("/");
  }

  return response;
}
