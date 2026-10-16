import { z } from "zod";

/**
 * 인증 폼 스키마. 클라이언트(react-hook-form의 zodResolver)와
 * 서버(actions.ts)가 같은 스키마로 검증함.
 */

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 20;
export const MAX_NICKNAME_LENGTH = 20;
export const SIGNUP_CODE_LENGTH = 6;
/** 인증번호 유효시간(초). Supabase 대시보드의 Email OTP Expiration과 같아야 함 */
export const SIGNUP_CODE_EXPIRES_IN = 300;

/**
 * 비밀번호 규칙. 화면의 ✓ 표시(8-20자 이내 / 숫자,특수문자 포함)에서도
 * 같은 함수를 써서 스키마와 표시가 어긋나지 않게 함.
 */
export const passwordRules = {
  length: (value: string) =>
    value.length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH,
  numberAndSpecial: (value: string) =>
    /\d/.test(value) && /[!-/:-@[-`{-~]/.test(value),
};

/** 닉네임 규칙: 한글(완성형), 영문, 숫자만. DB 제약(profiles_nickname_format)과 동일 */
export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]+$/;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "올바른 이메일 형식이 아니에요." }));

/** /signup [다음] — 형식·중복만 확인 (메일 발송 X) */
export const checkSignupEmailSchema = z.object({ email });

/** /signup 약관 시트 [동의하고 인증 번호 받기], /signup/verify 재전송 */
export const sendSignupCodeSchema = z.object({
  email,
  agreements: z.object({
    terms: z.literal(true, { error: "필수 약관에 동의해 주세요." }),
    privacy: z.literal(true, { error: "필수 약관에 동의해 주세요." }),
    marketing: z.boolean(),
  }),
});

/** /signup/verify — 인증번호 확인 */
export const verifySignupCodeSchema = z.object({
  email,
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${SIGNUP_CODE_LENGTH}}$`), {
      error: `인증번호 ${SIGNUP_CODE_LENGTH}자리를 입력해 주세요.`,
    }),
  /** 약관 시트에서 받은 마케팅 수신 동의 (인증 성공 시 profiles에 저장) */
  marketing: z.boolean(),
});

/** /signup/password */
export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .refine(passwordRules.length, {
        error: `비밀번호는 ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH}자로 입력해 주세요.`,
      })
      .refine(passwordRules.numberAndSpecial, {
        error: "숫자와 특수문자를 포함해 주세요.",
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
    })
    .regex(NICKNAME_PATTERN, {
      error: "한글, 영문, 숫자만 사용할 수 있어요.",
    }),
});

/** /login/email */
export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "비밀번호를 입력해 주세요." }),
});

// useForm<...Input>에 넣는 타입 (trim 등 변환 전 값)
export type CheckSignupEmailInput = z.input<typeof checkSignupEmailSchema>;
export type SendSignupCodeInput = z.input<typeof sendSignupCodeSchema>;
export type VerifySignupCodeInput = z.input<typeof verifySignupCodeSchema>;
export type SetPasswordInput = z.input<typeof setPasswordSchema>;
export type UpdateNicknameInput = z.input<typeof updateNicknameSchema>;
export type SignInInput = z.input<typeof signInSchema>;
