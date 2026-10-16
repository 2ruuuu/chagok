import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-12 w-full",
};

type TextInputProps = Omit<ComponentProps<"input">, "size"> & {
  id: string;
  size?: keyof typeof sizes;
  labelText?: string;
  /** 에러 메시지. 값이 있으면 테두리가 빨간색으로 바뀌고 입력창 아래에 메시지를 표시 */
  error?: string;
  /** 입력창 안쪽 오른쪽에 표시할 내용 (타이머 등) */
  suffix?: ReactNode;
};

/**
 * 나머지 input 속성(type, placeholder, value, onChange, name, onBlur, ref 등)은
 * 그대로 <input>에 전달됨 → react-hook-form의 {...register("password")}도 바로 사용 가능
 */
const TextInput = ({
  id,
  size = "sm",
  labelText,
  error,
  suffix,
  className,
  ...props
}: TextInputProps) => {
  const errorId = `${id}-error`;

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
          aria-describedby={error ? errorId : undefined}
          {...props}
          className={cn(
            "overflow-hidden rounded-lg border bg-[#ffffff]/10 px-4 py-1 text-common-0 text-label2 outline-none placeholder:text-neutral-50",
            sizes[size],
            suffix && "pr-16",
            error
              ? "border-status-danger"
              : "border-line-alternative focus:border-neutral-5",
            className,
          )}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="px-1 text-body3 text-status-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;
