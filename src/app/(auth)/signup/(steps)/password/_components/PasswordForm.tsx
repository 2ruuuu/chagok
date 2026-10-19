"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { setPassword } from "@/app/(auth)/actions";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  passwordRules,
  type SetPasswordInput,
  setPasswordSchema,
} from "@/app/(auth)/schemas";
import BottomCta from "@/components/bottom-cta/BottomCta";
import { Button } from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";
import { cn } from "@/lib/cn";

type SetPasswordOutput = z.output<typeof setPasswordSchema>;

/** 입력하는 동안 보여줄 규칙. 스키마와 같은 passwordRules 함수로 판단 */
const RULES = [
  {
    key: "length",
    label: `${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH}자 이내`,
    test: passwordRules.length,
  },
  {
    key: "numberAndSpecial",
    label: "숫자, 특수문자 포함",
    test: passwordRules.numberAndSpecial,
  },
];

/** 규칙 충족 여부 한 줄 (체크 아이콘 + 문구) */
const RuleItem = ({ passed, label }: { passed: boolean; label: string }) => (
  <li
    className={cn(
      "flex items-center gap-1 text-label3 transition-colors",
      passed ? "text-blue-50" : "text-neutral-40",
    )}
  >
    <Check aria-hidden="true" strokeWidth={2.5} className="size-4" />
    {label}
    <span className="sr-only">{passed ? "충족" : "미충족"}</span>
  </li>
);

/** 비밀번호 보기/숨기기 버튼 (TextInput의 suffix로 사용) */
const VisibilityToggle = ({
  visible,
  onToggle,
  controls,
}: {
  visible: boolean;
  onToggle: () => void;
  controls: string;
}) => (
  <button
    type="button" // form 안이라 type 없으면 submit 됨
    onClick={onToggle}
    aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
    aria-pressed={visible}
    aria-controls={controls}
    // TextInput의 suffix 영역이 pointer-events-none이라 버튼만 클릭 가능하게
    className="pointer-events-auto flex size-6 cursor-pointer items-center justify-center text-neutral-50 outline-none focus-visible:text-common-0"
  >
    {visible ? (
      <EyeOff aria-hidden="true" className="size-5" />
    ) : (
      <Eye aria-hidden="true" className="size-5" />
    )}
  </button>
);

const PasswordForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
  } = useForm<SetPasswordInput, unknown, SetPasswordOutput>({
    resolver: zodResolver(setPasswordSchema), // 서버와 같은 스키마로 검증
    mode: "onTouched",
    defaultValues: { password: "", passwordCheck: "" },
  });

  // watch() 대신 useWatch: React Compiler와 함께 써도 값 변경이 반영됨
  const [password, passwordCheck] = useWatch({
    control,
    name: ["password", "passwordCheck"],
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);

  // 확인 칸에 입력이 있고 비밀번호와 같을 때만 일치
  const isMatched = passwordCheck.length > 0 && password === passwordCheck;

  // 성공하면 액션이 /signup/nickname 으로 redirect → 돌아오는 값이 없을 수 있음
  const onSubmit = async (values: SetPasswordOutput) => {
    setServerError(null);
    const result = await setPassword(values);
    if (result?.error) {
      setServerError(result.error);
    }
  };

  const canSubmit = isValid && !isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-1 flex-col justify-between pt-10"
    >
      <div className="flex flex-col gap-6">
        <h1 className="text-heading1">
          로그인에 사용할
          <br />
          비밀번호를 입력해 주세요.
        </h1>
        <div className="flex flex-col gap-2">
          <TextInput
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            maxLength={MAX_PASSWORD_LENGTH}
            placeholder="8자 이상의 비밀번호"
            labelText="비밀번호"
            suffix={
              <VisibilityToggle
                visible={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
                controls="password"
              />
            }
            {...register("password", {
              // 비밀번호를 고치면 확인 칸의 일치 여부도 다시 검사
              deps: "passwordCheck",
            })}
          />
          <ul className="flex gap-3 px-1">
            {RULES.map((rule) => (
              <RuleItem
                key={rule.key}
                passed={rule.test(password)}
                label={rule.label}
              />
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <TextInput
            type={showPasswordCheck ? "text" : "password"}
            id="passwordCheck"
            autoComplete="new-password"
            maxLength={MAX_PASSWORD_LENGTH}
            placeholder="8자 이상의 비밀번호"
            labelText="비밀번호 확인"
            suffix={
              <VisibilityToggle
                visible={showPasswordCheck}
                onToggle={() => setShowPasswordCheck((prev) => !prev)}
                controls="passwordCheck"
              />
            }
            {...register("passwordCheck")}
          />
          <ul className="flex px-1">
            <RuleItem passed={isMatched} label="비밀번호 일치" />
          </ul>
        </div>
      </div>
      <BottomCta>
        {serverError && (
          <p role="alert" className="text-center text-body3 text-status-danger">
            {serverError}
          </p>
        )}
        <Button
          type="submit"
          variant={canSubmit ? "primary" : "disable"}
          disabled={!canSubmit}
        >
          회원가입 완료
        </Button>
      </BottomCta>
    </form>
  );
};

export default PasswordForm;
