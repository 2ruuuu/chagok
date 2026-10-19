"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { sendSignupCode, verifySignupCode } from "@/app/(auth)/actions";
import {
  SIGNUP_CODE_EXPIRES_IN,
  SIGNUP_CODE_LENGTH,
} from "@/app/(auth)/schemas";
import BottomCta from "@/components/bottom-cta/BottomCta";
import { Button } from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";
import Toast from "@/components/toast/Toast";
import { formatMinutesSeconds, useCountdown } from "@/hooks/useCountdown";
import AuthSuccess from "../../../_components/AuthSuccess";
import CodeHelpSheet from "./CodeHelpSheet";

const CODE_INPUT_ID = "code";

/** 재전송 최소 간격(초). Supabase 이메일 발송 최소 간격(기본 60초)에 맞춤 */
const RESEND_COOLDOWN = 60;
/** 인증 성공 애니메이션을 보여준 뒤 비밀번호 화면으로 넘어가기까지 기다리는 시간 */
const SUCCESS_DELAY_MS = 1500;
const TOAST_DURATION_MS = 2000;

const EXPIRED_MESSAGE = "인증번호가 만료됐어요. [재전송]을 눌러 주세요.";

type VerifyFormProps = {
  /** 인증번호를 보낸 이메일 */
  email: string;
  /** 약관 시트에서 받은 마케팅 수신 동의 */
  marketing: boolean;
};

const VerifyForm = ({ email, marketing }: VerifyFormProps) => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 화면에 들어온 순간(= 직전에 발송됨)부터 유효시간·재전송 대기시간을 셈
  const expiry = useCountdown(SIGNUP_CODE_EXPIRES_IN);
  const cooldown = useCountdown(RESEND_COOLDOWN);

  const isComplete = code.length === SIGNUP_CODE_LENGTH;
  const canSubmit = isComplete && !expiry.isExpired && !verifying && !verified;
  const canResend = cooldown.isExpired && !resending && !verifying && !verified;

  const showToast = (message: string) => {
    // 이전 토스트의 타이머가 새 메시지를 일찍 지우지 않도록 정리
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.replace(/\D/g, "").slice(0, SIGNUP_CODE_LENGTH));
    setError(null);
  };

  // [다음]: 인증번호 확인 → 성공 표시 → /signup/password
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setVerifying(true);
    const result = await verifySignupCode({ email, code, marketing });
    if (result.error) {
      setError(result.error);
      setVerifying(false);
      return;
    }

    setVerified(true);
    // replace: 이미 사용한 인증번호 화면으로 뒤로가기 하지 않게 함
    setTimeout(() => router.replace("/signup/password"), SUCCESS_DELAY_MS);
  };

  // [재전송]: 같은 이메일로 다시 발송 → 타이머·입력 초기화
  const handleResend = async () => {
    if (!canResend) {
      return;
    }

    setResending(true);
    // 이 화면은 약관 시트에서 필수 약관에 동의해야 들어올 수 있으므로 true로 보냄
    const result = await sendSignupCode({
      email,
      agreements: { terms: true, privacy: true, marketing },
    });
    setResending(false);

    if (result.error) {
      showToast(result.error);
      return;
    }

    expiry.restart();
    cooldown.restart();
    setCode("");
    setError(null);
    showToast("인증 번호를 다시 보냈어요.");
  };

  const inputError = error ?? (expiry.isExpired ? EXPIRED_MESSAGE : undefined);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-1 flex-col justify-between pt-10"
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-heading1">
            이메일로 받은
            <br />
            인증번호 {SIGNUP_CODE_LENGTH}자리를 입력해주세요.
          </h1>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={CODE_INPUT_ID}
                className="text-body3 text-neutral-5"
              >
                인증번호
              </label>
              <div className="flex items-start gap-2.5">
                <div className="flex-1">
                  <TextInput
                    id={CODE_INPUT_ID}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d*"
                    maxLength={SIGNUP_CODE_LENGTH}
                    placeholder={`${SIGNUP_CODE_LENGTH}자리 입력`}
                    value={code}
                    onChange={handleChange}
                    disabled={verified}
                    error={inputError}
                    autoFocus
                    suffix={
                      <span className="text-label2 tabular-nums text-common-0">
                        {formatMinutesSeconds(expiry.remaining)}
                      </span>
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant={canResend ? "primary" : "disable"}
                  disabled={!canResend}
                  onClick={handleResend}
                  aria-label={
                    cooldown.isExpired
                      ? "인증번호 재전송"
                      : `인증번호 재전송, ${cooldown.remaining}초 후 가능`
                  }
                  className="w-auto px-4 text-label2 font-semibold tabular-nums"
                >
                  {cooldown.isExpired ? "재전송" : `${cooldown.remaining}초`}
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="cursor-pointer self-start px-1 text-caption1 font-medium text-common-0 underline underline-offset-2"
            >
              인증번호가 오지 않나요?
            </button>
          </div>
        </div>
        <BottomCta>
          <div className="relative">
            <Toast
              message={toastMessage}
              className="pointer-events-none absolute inset-x-0 bottom-full mb-3 flex justify-center"
            />
            <Button
              type="submit"
              variant={canSubmit ? "primary" : "disable"}
              disabled={!canSubmit}
            >
              다음
            </Button>
          </div>
        </BottomCta>
      </form>

      <CodeHelpSheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        email={email}
      />

      {verified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-100">
          <AuthSuccess />
        </div>
      )}
    </>
  );
};

export default VerifyForm;
