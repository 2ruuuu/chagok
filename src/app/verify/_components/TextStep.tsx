"use client";

import type { FormEvent } from "react";
import BottomCta from "@/components/bottom-cta/BottomCta";
import Button from "@/components/button/Button";
import { TEXT_MAX_LENGTH, VERIFY_BOTTOM_SPACE } from "../_constants";
import VerifyHeader from "./VerifyHeader";

interface TextStepProps {
  /** textarea id (label 연결) */
  id: string;
  title: string;
  label: string;
  /** label 옆 회색 글자: (필수) · (선택) */
  note: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  buttonLabel: string;
  /** false면 버튼이 꺼짐 */
  canSubmit: boolean;
  onSubmit: () => void;
}

/** 관람 리뷰 · 카드 메모 공통 입력 화면 (제목 + 글 상자 + 글자 수 + 하단 버튼) */
const TextStep = ({
  id,
  title,
  label,
  note,
  placeholder,
  value,
  onChange,
  buttonLabel,
  canSubmit,
  onSubmit,
}: TextStepProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <>
      <VerifyHeader />
      <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
        <h1 className="mt-5 text-center text-heading2 font-semibold text-static-white">
          {title}
        </h1>
        <label
          htmlFor={id}
          className="mt-5 text-center text-body3 text-static-white"
        >
          {label} <span className="text-neutral-30">{note}</span>
        </label>
        <div className="relative mt-1 h-50 rounded-lg border border-line-normal bg-common-0/10 focus-within:border-neutral-30">
          {/* maxLength: 최대 글자 수를 넘으면 입력이 막힘 */}
          <textarea
            id={id}
            value={value}
            maxLength={TEXT_MAX_LENGTH}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="size-full resize-none rounded-lg bg-transparent px-4 pt-4 pb-10 text-body2 text-static-white outline-none placeholder:text-neutral-50"
          />
          <p
            aria-hidden
            className="pointer-events-none absolute right-4 bottom-4 text-caption2 text-neutral-30"
          >
            {value.length}/{TEXT_MAX_LENGTH}
          </p>
        </div>

        <BottomCta bottomSpace={VERIFY_BOTTOM_SPACE} className="mt-auto pt-5">
          <Button
            variant={canSubmit ? "primary" : "disable"}
            disabled={!canSubmit}
          >
            {buttonLabel}
          </Button>
        </BottomCta>
      </form>
    </>
  );
};

export default TextStep;
