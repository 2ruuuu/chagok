/**
 * 필수 환경 변수 확인. 값이 없으면 바로 에러를 던져서
 * 원인 모를 Supabase 에러 대신 어떤 변수가 빠졌는지 알려줌.
 *
 * NEXT_PUBLIC_ 값은 빌드할 때 `process.env.NEXT_PUBLIC_XXX` 글자 그대로 있어야 번들에 박힘.
 * process.env[name]처럼 동적으로 꺼내면 브라우저에서 undefined가 되므로 값을 직접 넘김.
 */
export const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(
      `환경 변수 ${name}이(가) 설정되지 않았어요. .env.local을 확인해 주세요.`,
    );
  }
  return value;
};

/** Supabase 공개 설정 (브라우저 · 서버 · proxy 공통) */
export const getSupabaseEnv = () => ({
  url: requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  ),
  publishableKey: requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ),
});
