import { z } from "zod";

/**
 * 인증 폼 스키마. 클라이언트(react-hook-form의 zodResolver)와
 * 서버(actions.ts)가 같은 스키마로 검증함.
 */

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NICKNAME_LENGTH = 20;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "올바른 이메일 형식이 아니에요." }));

/** /signup 1단계 — 인증번호 전송 */
export const sendSignupCodeSchema = z.object({ email });

/** /signup 2단계 — 인증번호 확인 */
export const verifySignupCodeSchema = z.object({
  email,
  code: z
    .string()
    .trim()
    .regex(/^\d{6,10}$/, { error: "인증번호를 확인해 주세요." }),
});

/** /signup/password */
export const setPasswordSchema = z
  .object({
    password: z.string().min(MIN_PASSWORD_LENGTH, {
      error: `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`,
    }),
    passwordCheck: z.string(),
  })
  .refine((values) => values.password === values.passwordCheck, {
    error: "비밀번호가 일치하지 않아요.",
    path: ["passwordCheck"],
  });

/** /signup/nickname */
export const updateNicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, { error: "닉네임을 입력해 주세요." })
    .max(MAX_NICKNAME_LENGTH, {
      error: `닉네임은 ${MAX_NICKNAME_LENGTH}자 이하로 입력해 주세요.`,
    }),
});

/** /login/email */
export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "비밀번호를 입력해 주세요." }),
});

// useForm<...Input>에 넣는 타입 (trim 등 변환 전 값)
export type SendSignupCodeInput = z.input<typeof sendSignupCodeSchema>;
export type VerifySignupCodeInput = z.input<typeof verifySignupCodeSchema>;
export type SetPasswordInput = z.input<typeof setPasswordSchema>;
export type UpdateNicknameInput = z.input<typeof updateNicknameSchema>;
export type SignInInput = z.input<typeof signInSchema>;
