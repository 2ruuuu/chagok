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

const isPublicPath = (pathname: string) =>
  PUBLIC_EXACT_PATHS.includes(pathname) ||
  PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

/**
 * proxy.ts에서 매 요청마다 호출.
 * Supabase 세션 쿠키를 갱신하고, 비로그인 사용자를 /login으로 보냄.
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
  const isLoggedIn = Boolean(data?.claims);
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

  if (!isLoggedIn && !isPublicPath(pathname)) {
    return redirectTo("/login");
  }

  if (isLoggedIn && (pathname === "/login" || pathname.startsWith("/login/"))) {
    return redirectTo("/");
  }

  return response;
}
