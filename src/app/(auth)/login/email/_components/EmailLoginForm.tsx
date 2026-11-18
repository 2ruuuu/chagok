"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { signIn } from "@/app/(auth)/actions";
import { type SignInInput, signInSchema } from "@/app/(auth)/schemas";
import Button from "@/components/button/Button";
import PasswordInput from "@/components/password-input/PasswordInput";
import TextInput from "@/components/text-input/TextInput";
import Bottom from "./Bottom";
import OauthLogin from "./OauthLogin";

type SignInOutput = z.output<typeof signInSchema>;

/**
 * 이메일 로그인 폼. 입력칸과 로그인 버튼 사이에 SNS 로그인 영역이 있어서
 * 화면 본문 전체를 하나의 <form>으로 감쌈 (SNS 버튼은 type="button"이라 제출되지 않음)
 */
const EmailLoginForm = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setFocus,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput, unknown, SignInOutput>({
    resolver: zodResolver(signInSchema), // 서버와 같은 스키마로 검증
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });

  // watch() 대신 useWatch: React Compiler와 함께 써도 값 변경이 반영됨
  const [email, password] = useWatch({ control, name: ["email", "password"] });
  const [serverError, setServerError] = useState<string | null>(null);

  // × 지우기: 값·에러를 비우고 다시 입력할 수 있게 포커스
  const clearEmail = () => {
    setValue("email", "");
    clearErrors("email");
    setServerError(null);
    setFocus("email");
  };

  // 성공하면 액션이 / 로 redirect → 돌아오는 값이 없을 수 있음
  const onSubmit = async (values: SignInOutput) => {
    setServerError(null);
    const result = await signIn(values);
    if (result?.error) {
      setServerError(result.error);
    }
  };

  // 둘 다 입력했을 때만 활성화. 이메일 형식은 제출할 때 검사
  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-10 py-10">
        <div className="flex flex-col gap-6">
          <h1 className="text-heading1">
            이메일로
            <br />
            로그인 하기
          </h1>
          <div className="flex flex-col gap-4">
            <TextInput
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="abc@email.com"
              labelText="이메일(아이디)"
              {...register("email", {
                onChange: () => setServerError(null),
              })}
              error={errors.email?.message}
              onClear={email ? clearEmail : undefined}
            />
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="8자 이상의 비밀번호"
              labelText="비밀번호"
              {...register("password", {
                onChange: () => setServerError(null),
              })}
              // 서버 에러(이메일·비밀번호 불일치)는 어느 칸이 틀렸는지 알려주지 않도록 비밀번호 아래에 표시
              error={errors.password?.message ?? serverError ?? undefined}
            />
          </div>
        </div>
        <OauthLogin />
      </div>
      <div className="flex flex-col gap-2.5">
        <Button
          type="submit"
          variant={canSubmit ? "primary" : "disable"}
          disabled={!canSubmit}
        >
          로그인
        </Button>
        <Bottom />
      </div>
    </form>
  );
};

export default EmailLoginForm;
