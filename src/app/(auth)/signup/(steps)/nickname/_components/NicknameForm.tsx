"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { agreeToTerms, updateNickname } from "@/app/(auth)/actions";
import {
  MAX_NICKNAME_LENGTH,
  MIN_NICKNAME_LENGTH,
  type UpdateNicknameInput,
  updateNicknameSchema,
} from "@/app/(auth)/schemas";
import BottomCta from "@/components/bottom-cta/BottomCta";
import Button from "@/components/button/Button";
import TextInput from "@/components/text-input/TextInput";
import AgreementSheet, {
  type Agreements,
} from "../../../_components/AgreementSheet";

type UpdateNicknameOutput = z.output<typeof updateNicknameSchema>;

const TOAST_DURATION_MS = 2000;

interface NicknameFormProps {
  /** 약관 동의 기록이 없는 계정(소셜 가입자 등). true면 들어오자마자 약관 시트를 띄움 */
  needsAgreement: boolean;
}

const NicknameForm = ({ needsAgreement }: NicknameFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UpdateNicknameInput, unknown, UpdateNicknameOutput>({
    resolver: zodResolver(updateNicknameSchema), // 서버와 같은 스키마로 검증
    // 한글은 조합 중에 자음·모음(ㅊ, ㅗ)이 잠깐 들어와 규칙(완성형 한글)에 걸리므로
    // 입력 중이 아니라 포커스가 빠질 때 에러를 보여줌 (입력하면 에러는 지움).
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { nickname: "" },
  });

  // watch() 대신 useWatch: React Compiler와 함께 써도 값 변경이 반영됨
  const nickname = useWatch({ control, name: "nickname" });

  const [agreed, setAgreed] = useState(!needsAgreement);
  const [sheetOpen, setSheetOpen] = useState(needsAgreement);
  const [agreeing, setAgreeing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
  };

  // 약관 시트 [동의하고 계속하기]: 동의 내역 저장 → 시트 닫고 닉네임 입력
  const handleAgree = async (agreements: Agreements) => {
    // 시트가 필수 항목이 모두 체크됐을 때만 호출하지만, 타입을 true로 좁히기 위해 한 번 더 확인
    if (!agreements.terms || !agreements.privacy) {
      return;
    }

    setAgreeing(true);
    const result = await agreeToTerms({
      agreements: {
        terms: agreements.terms,
        privacy: agreements.privacy,
        marketing: agreements.marketing,
      },
    });
    setAgreeing(false);

    if (result.error) {
      showToast(result.error);
      return;
    }
    setAgreed(true);
    setSheetOpen(false);
  };

  // 성공하면 액션이 /signup/complete 로 redirect → 돌아오는 값이 없을 수 있음
  const onSubmit = async (values: UpdateNicknameOutput) => {
    // 시트를 닫고 약관 없이 [시작하기]를 누르면 시트를 다시 띄움
    if (!agreed) {
      setSheetOpen(true);
      return;
    }
    const result = await updateNickname(values);
    if (result?.error) {
      // 중복 닉네임 등 서버 에러도 입력창 아래에 표시
      setError("nickname", { type: "server", message: result.error });
    }
  };

  // 2글자 이상이면 바로 버튼 활성화. 형식(한글·영문·숫자)은 제출할 때 다시 검사.
  // isValid는 onBlur 모드에서 포커스가 빠질 때만 갱신되므로 쓰지 않음
  const canSubmit =
    nickname.trim().length >= MIN_NICKNAME_LENGTH && !isSubmitting;

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-1 flex-col justify-between pt-10"
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-heading1">
            어떻게 불러드릴까요?
            <br />
            나중에 언제든 바꿀 수 있어요.
          </h1>
          <TextInput
            type="text"
            id="nickname"
            autoComplete="nickname"
            maxLength={MAX_NICKNAME_LENGTH}
            placeholder="촉촉한 초코칩"
            labelText="닉네임 입력"
            suffix={
              <span className="text-label2 tabular-nums text-neutral-50">
                {nickname.length}/{MAX_NICKNAME_LENGTH}
              </span>
            }
            {...register("nickname", {
              onChange: () => clearErrors("nickname"),
            })}
            error={errors.nickname?.message}
            helperText="한글, 영문, 숫자만 사용할 수 있어요."
          />
        </div>
        <BottomCta>
          <Button
            type="submit"
            variant={canSubmit ? "primary" : "disable"}
            disabled={!canSubmit}
          >
            시작하기
          </Button>
        </BottomCta>
      </form>

      {/* 시트 안의 버튼이 위 form을 제출하지 않도록 form 밖에 둠 */}
      <AgreementSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleAgree}
        submitLabel="동의하고 계속하기"
        disabled={agreeing}
        toastMessage={toastMessage}
      />
    </>
  );
};

export default NicknameForm;
