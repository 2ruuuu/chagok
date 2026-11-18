"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { checkSignupEmail, sendSignupCode } from "@/app/(auth)/actions";
import {
  type CheckSignupEmailInput,
  checkSignupEmailSchema,
} from "@/app/(auth)/schemas";
import BottomCta from "@/components/bottom-cta/BottomCta";
import Button from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";
import AgreementSheet, { type Agreements } from "./AgreementSheet";

type CheckSignupEmailOutput = z.output<typeof checkSignupEmailSchema>;

/** 토스트를 보여준 뒤 인증 화면으로 넘어가기까지 기다리는 시간 */
const TOAST_DELAY_MS = 1000;

interface SignupFormProps {
  /** 처음에 채워 둘 이메일 (인증 화면에서 [이메일 다시 입력하기]로 돌아온 경우) */
  defaultEmail?: string;
}

const SignupForm = ({ defaultEmail = "" }: SignupFormProps) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    setFocus,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CheckSignupEmailInput, unknown, CheckSignupEmailOutput>({
    resolver: zodResolver(checkSignupEmailSchema), // 서버와 같은 스키마로 검증
    mode: "onTouched", // 포커스가 빠질 때 처음 검사, 이후엔 입력할 때마다 재검사
    defaultValues: { email: defaultEmail },
  });

  // watch() 대신 useWatch: React Compiler와 함께 써도 값 변경이 반영됨
  const email = useWatch({ control, name: "email" });

  // × 지우기: 값·에러를 비우고 다시 입력할 수 있게 포커스
  const clearEmail = () => {
    setValue("email", "");
    clearErrors("email");
    setFocus("email");
  };

  /** 중복 확인을 통과한 이메일 (trim·소문자 변환된 값). 있으면 약관 시트를 염 */
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // [다음]: 형식·중복 확인 → 통과하면 약관 시트
  const onSubmit = async ({ email }: CheckSignupEmailOutput) => {
    const result = await checkSignupEmail({ email });
    if (result.error) {
      setError("email", { message: result.error });
      return;
    }
    setCheckedEmail(email);
  };

  // 약관 시트 [동의하고 인증 번호 받기]: 인증번호 발송 → 토스트 → /signup/verify
  const handleAgree = async (agreements: Agreements) => {
    // 시트가 필수 항목이 모두 체크됐을 때만 호출하지만, 타입을 true로 좁히기 위해 한 번 더 확인
    if (!checkedEmail || !agreements.terms || !agreements.privacy) {
      return;
    }

    setSending(true);
    const result = await sendSignupCode({
      email: checkedEmail,
      agreements: {
        terms: agreements.terms,
        privacy: agreements.privacy,
        marketing: agreements.marketing,
      },
    });

    if (result.error) {
      setSending(false);
      setToastMessage(result.error);
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    setToastMessage("인증 번호를 보냈어요.");
    const params = new URLSearchParams({ email: checkedEmail });
    if (agreements.marketing) {
      params.set("marketing", "1");
    }
    setTimeout(() => {
      router.push(`/signup/verify?${params.toString()}`);
    }, TOAST_DELAY_MS);
    // 이동할 때까지 sending을 유지해 시트를 닫거나 다시 누르지 못하게 함
  };

  // 지운 직후에는 isValid가 갱신되기 전일 수 있어서 빈 값도 직접 막음
  const canSubmit = isValid && email.trim().length > 0 && !isSubmitting;

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-1 flex-col justify-between pt-10"
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-heading1">
            안녕하세요!
            <br />
            이메일로 가입해주세요.
          </h1>
          <TextInput
            type="email"
            id="email"
            inputMode="email"
            autoComplete="email"
            placeholder="abc@email.com"
            labelText="이메일(아이디)"
            {...register("email")}
            error={errors.email?.message}
            onClear={email ? clearEmail : undefined}
          />
        </div>
        <BottomCta>
          <div className="flex items-center justify-center gap-3">
            <span className="text-label2 text-neutral-70">
              이미 계정이 있으신가요?
            </span>
            <Link href="/login" className="text-label3 text-common-0">
              로그인
            </Link>
          </div>
          <Button
            type="submit"
            variant={canSubmit ? "primary" : "disable"}
            disabled={!canSubmit}
          >
            다음
          </Button>
        </BottomCta>
      </form>

      {/* 시트 안의 버튼이 위 form을 제출하지 않도록 form 밖에 둠 */}
      <AgreementSheet
        open={checkedEmail !== null}
        onClose={() => setCheckedEmail(null)}
        onSubmit={handleAgree}
        disabled={sending}
        toastMessage={toastMessage}
      />
    </>
  );
};

export default SignupForm;
