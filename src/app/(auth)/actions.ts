"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
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
 * 액션 결과. 성공 시 대부분 redirect 되므로 화면에 돌아오는 건 실패한 경우의 에러 메시지뿐.
 * (react-hook-form의 handleSubmit 안에서 await 해서 사용)
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

/** 회원가입 1단계: 이메일로 인증번호 전송. 성공 시 { error: null } → 인증번호 입력칸 표시 */
export async function sendSignupCode(
  input: SendSignupCodeInput,
): Promise<AuthActionResult> {
  const { data, error: parseError } = parse(sendSignupCodeSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();

  const { data: registered, error: checkError } = await supabase.rpc(
    "is_email_registered",
    { p_email: data.email },
  );
  if (checkError) {
    return { error: "잠시 후 다시 시도해 주세요." };
  }
  if (registered) {
    return { error: "이미 가입된 이메일이에요." };
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

/** 회원가입 2단계: 인증번호 확인 → 로그인 → /signup/password */
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

  redirect("/signup/password");
}

/** 회원가입 3단계: 비밀번호 설정 → /signup/nickname */
export async function setPassword(
  input: SetPasswordInput,
): Promise<AuthActionResult> {
  const { data, error: parseError } = parse(setPasswordSchema, input);
  if (!data) {
    return { error: parseError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });
  if (error) {
    if (error.code === "weak_password") {
      return { error: "더 안전한 비밀번호를 사용해 주세요." };
    }
    return { error: "비밀번호를 저장하지 못했어요." };
  }

  redirect("/signup/nickname");
}

/** 회원가입 4단계(또는 닉네임 변경): 닉네임 저장 → /signup/complete */
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

  const { error } = await supabase
    .from("profiles")
    .update({ nickname: data.nickname })
    .eq("id", userId);
  if (error) {
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
