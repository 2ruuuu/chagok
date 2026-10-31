"use client";

import Image from "next/image";
import { type ComponentProps, type ReactNode, useState } from "react";
import ClearIcon from "@/assets/icons/clear.svg";
import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-12 w-full",
};

interface TextInputProps extends Omit<ComponentProps<"input">, "size"> {
  id: string;
  size?: keyof typeof sizes;
  labelText?: string;
  /** 에러 메시지. 값이 있으면 테두리가 빨간색으로 바뀌고 입력창 아래에 메시지를 표시 */
  error?: string;
  /** 입력창 안쪽 오른쪽에 표시할 내용 (타이머 등) */
  suffix?: ReactNode;
  /** 입력창 아래 안내 문구 (입력 규칙 등). 에러가 있으면 에러 메시지로 대체됨 */
  helperText?: string;
  /**
   * 넘기면 포커스가 없을 때 × 지우기 버튼을 보여줌 (입력 중에는 숨김).
   * 값이 있을 때만 넘길 것 → 빈 칸에는 버튼이 안 보임
   */
  onClear?: () => void;
}

/**
 * 나머지 input 속성(type, placeholder, value, onChange, name, onBlur, ref 등)은
 * 그대로 <input>에 전달됨 → react-hook-form의 {...register("password")}도 바로 사용 가능
 */
const TextInput = ({
  id,
  size = "sm",
  labelText,
  error,
  helperText,
  suffix,
  onClear,
  className,
  onFocus,
  onBlur,
  ...props
}: TextInputProps) => {
  const [focused, setFocused] = useState(false);
  const showClear = Boolean(onClear) && !focused;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className="flex flex-col gap-1">
      {labelText && (
        <label htmlFor={id} className="text-body3 text-neutral-5">
          {labelText}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            // react-hook-form의 onBlur(검사 시점)도 그대로 호출
            onBlur?.(event);
          }}
          className={cn(
            "overflow-hidden rounded-lg border bg-[#ffffff]/10 px-4 py-1 text-common-0 text-label2 outline-none placeholder:text-neutral-50",
            sizes[size],
            (suffix || onClear) && "pr-16",
            error
              ? "border-status-danger"
              : "border-line-alternative focus:border-neutral-5",
            className,
          )}
        />
        {(suffix || showClear) && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-2">
            {showClear && (
              <button
                type="button" // form 안이라 type 없으면 submit 됨
                onClick={onClear}
                aria-label="입력 지우기"
                // suffix 영역이 pointer-events-none이라 버튼만 클릭 가능하게
                className="pointer-events-auto flex size-6 cursor-pointer items-center justify-center rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
              >
                <Image src={ClearIcon} alt="" aria-hidden className="size-4" />
              </button>
            )}
            {suffix}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <div className="py-1">
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="px-1 text-label3 text-status-danger"
            >
              {error}
            </p>
          ) : (
            <p id={helperId} className="px-1 text-label3 text-neutral-40">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextInput;
