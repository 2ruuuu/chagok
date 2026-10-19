"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  type CheckSignupEmailInput,
  checkSignupEmailSchema,
  type SendSignupCodeInput,
  type SetPasswordInput,
  type SignInInput,
  sendSignupCodeSchema,
  setPasswordSchema,
  signInSchema,
  type UpdateNicknameInput,
  updateNicknameSchema,
  type VerifySignupCodeInput,
  verifySignupCodeSchema,
} from "./schemas";

/**
 * 액션 결과. 실패하면 error에 화면에 보여줄 메시지, 성공하면 null.
 * redirect 하는 액션은 성공 시 값을 돌려받지 못할 수 있으므로
 * 화면에서는 `const result = await action(...); if (result?.error)` 처럼 사용.
 */
export type AuthActionResult = { error: string | null };

/** 클라이언트 검증을 거쳤더라도 서버에서 다시 검증 (요청은 조작될 수 있음) */
const parse = <T extends z.ZodType>(schema: T, input: unknown) => {
  const result = schema.safeParse(input);
  if (!result.success) {
    return {
      data: null,
      error: result.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    } as const;
  }
  return { data: result.data as z.output<T>, error: null } as const;
};

/** 가입 가능한 이메일인지 확인. 가능하면 null, 아니면 에러 메시지 */
const checkEmailAvailable = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
) => {
  const { data: registered, error } = await supabase.rpc(
    "is_email_registered",
    { p_email: email },
  );
  if (error) {
    return "잠시 후 다시 시도해 주세요.";
  }
  if (registered) {
    return "이미 가입된 이메일이에요.";
  }
  return null;
};

/**
 * 회원가입 1단계 /signup [다음]: 이메일 형식·중복만 확인 (메일은 보내지 않음).
 * 성공 시 { error: null } → 약관 동의 바텀시트 표시
 */
export async function checkSignupEmail(
  input: CheckSignupEmailInput,
): Promise<AuthActionResult> {
  const { data, error: parseError } = parse(checkSignupEmailSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();
  return { error: await checkEmailAvailable(supabase, data.email) };
}

/**
 * 회원가입 2단계 약관 시트 [동의하고 인증 번호 받기] / 인증 화면의 재전송:
 * 필수 약관 동의를 확인한 뒤 인증번호 메일 발송.
 * 성공 시 { error: null } → 토스트 + /signup/verify 로 이동
 */
export async function sendSignupCode(
  input: SendSignupCodeInput,
): Promise<AuthActionResult> {
  // 필수 약관이 true가 아니면 여기서 거부 → 동의 없이 메일이 나가지 않음
  const { data, error: parseError } = parse(sendSignupCodeSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();

  // [다음]과 발송 사이에 다른 곳에서 가입이 끝났을 수 있으므로 한 번 더 확인
  const unavailable = await checkEmailAvailable(supabase, data.email);
  if (unavailable) {
    return { error: unavailable };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: { shouldCreateUser: true },
  });
  if (error) {
    if (error.status === 429) {
      return { error: "잠시 후 다시 요청해 주세요." };
    }
    return { error: "인증번호를 보내지 못했어요." };
  }

  return { error: null };
}

/**
 * 회원가입 3단계 /signup/verify: 인증번호 확인 → 로그인 → 약관 동의 내역 저장.
 * redirect 하지 않고 { error: null }을 돌려줌 → 화면에서 인증 성공 표시 후
 * /signup/password 로 이동
 */
export async function verifySignupCode(
  input: VerifySignupCodeInput,
): Promise<AuthActionResult> {
  const { data, error: parseError } = parse(verifySignupCodeSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: data.email,
    token: data.code,
    type: "email",
  });
  if (error) {
    return { error: "인증번호가 올바르지 않거나 만료됐어요." };
  }

  // 로그인 세션이 생긴 지금 동의 내역 저장. 인증번호는 이미 사용됐으므로
  // 실패해도 가입 진행은 막지 않고 기록만 남김 (재시도하면 인증번호가 만료 상태)
  const { error: agreementError } = await supabase.rpc(
    "record_signup_agreements",
    { p_marketing: data.marketing },
  );
  if (agreementError) {
    console.error("[verifySignupCode] 약관 동의 저장 실패:", agreementError);
  }

  return { error: null };
}

/** 회원가입 4단계: 비밀번호 설정 → /signup/nickname */
export async function setPassword(
  input: SetPasswordInput,
): Promise<AuthActionResult> {
  const { data, error: parseError } = parse(setPasswordSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();

  // 서버 액션은 어느 경로에서든 호출할 수 있으므로 proxy와 별개로 직접 확인:
  // 가입을 마친 사용자가 현재 비밀번호 확인 없이 비밀번호를 바꾸는 것을 막음
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) {
    redirect("/login");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.nickname) {
    return { error: "이미 가입을 마친 계정이에요." };
  }

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });
  // same_password: 닉네임 화면에서 뒤로 와서 이미 저장한 비밀번호를 다시 입력한 경우.
  // 원하는 비밀번호가 이미 저장된 상태이므로 성공으로 보고 다음 단계로 진행
  if (error && error.code !== "same_password") {
    if (error.code === "weak_password") {
      return { error: "더 안전한 비밀번호를 사용해 주세요." };
    }
    console.error("[setPassword] 비밀번호 저장 실패:", error.code, error);
    return { error: "비밀번호를 저장하지 못했어요." };
  }

  redirect("/signup/nickname");
}

/** 회원가입 5단계(또는 닉네임 변경): 닉네임 저장 → /signup/complete */
export async function updateNickname(
  input: UpdateNicknameInput,
): Promise<AuthActionResult> {
  const { data, error: parseError } = parse(updateNicknameSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) {
    redirect("/login");
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ nickname: data.nickname })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
  if (error) {
    // unique_violation (profiles_nickname_unique_idx)
    if (error.code === "23505") {
      return { error: "이미 사용 중인 닉네임이에요." };
    }
    console.error("[updateNickname] 닉네임 저장 실패:", error.code, error);
    return { error: "닉네임을 저장하지 못했어요." };
  }
  // 수정된 행이 없으면 에러 없이 끝나므로 직접 확인 (profiles 행이 없는 경우 등)
  if (!updated) {
    console.error("[updateNickname] profiles 행 없음:", userId);
    return { error: "닉네임을 저장하지 못했어요." };
  }

  redirect("/signup/complete");
}

/** 이메일 로그인 → / */
export async function signIn(input: SignInInput): Promise<AuthActionResult> {
  const { data, error: parseError } = parse(signInSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않아요." };
  }

  redirect("/");
}

/** 로그아웃 → /login. <form action={signOut}> 또는 onClick에서 호출 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
