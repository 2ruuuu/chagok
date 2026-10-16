"use client";

import { type ChangeEvent, useState } from "react";
import {
  SIGNUP_CODE_EXPIRES_IN,
  SIGNUP_CODE_LENGTH,
} from "@/app/(auth)/schemas";
import BottomCta from "@/components/bottom-cta/BottomCta";
import { Button } from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";
import { formatMinutesSeconds, useCountdown } from "@/hooks/useCountdown";
import CodeHelpSheet from "./CodeHelpSheet";

const CODE_INPUT_ID = "code";

type VerifyFormProps = {
  email: string | null;
};

const VerifyForm = ({ email }: VerifyFormProps) => {
  const [code, setCode] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  // 화면에 들어온 순간부터 인증번호 유효시간 카운트다운
  const { remaining } = useCountdown(SIGNUP_CODE_EXPIRES_IN);

  const isComplete = code.length === SIGNUP_CODE_LENGTH;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.replace(/\D/g, "").slice(0, SIGNUP_CODE_LENGTH));
  };

  return (
    <>
      <div className="flex flex-1 flex-col justify-between pt-10">
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
              <div className="flex gap-2.5">
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
                    // biome-ignore lint/a11y/noAutofocus: 인증 화면에 들어오면 바로 입력하는 흐름
                    autoFocus
                    suffix={
                      <span className="text-label2 tabular-nums text-common-0">
                        {formatMinutesSeconds(remaining)}
                      </span>
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="disable"
                  className="w-auto px-4 text-label2 font-semibold"
                >
                  재전송
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
          <Button
            variant={isComplete ? "primary" : "disable"}
            disabled={!isComplete}
          >
            다음
          </Button>
        </BottomCta>
      </div>

      <CodeHelpSheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        email={email}
      />
    </>
  );
};

export default VerifyForm;
