"use client";

import Image from "next/image";
import { type ComponentProps, useState } from "react";
import EyeIcon from "@/assets/icons/eye.svg";
import EyeOffIcon from "@/assets/icons/eye-off.svg";
import TextInput from "@/components/text-input/TextInput";

interface PasswordInputProps
  extends Omit<ComponentProps<typeof TextInput>, "type" | "suffix"> {}

/**
 * 보기/숨기기 버튼이 붙은 비밀번호 입력창 (회원가입 비밀번호 설정, 이메일 로그인).
 * 나머지 props는 TextInput으로 그대로 넘어감 → {...register("password")} 바로 사용 가능
 */
const PasswordInput = ({ id, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...props}
      id={id}
      type={visible ? "text" : "password"}
      suffix={
        <button
          type="button" // form 안이라 type 없으면 submit 됨
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={visible}
          aria-controls={id}
          // TextInput의 suffix 영역이 pointer-events-none이라 버튼만 클릭 가능하게
          className="pointer-events-auto flex size-6 cursor-pointer items-center justify-center rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
        >
          {/* 버튼의 aria-label이 이름 역할을 하므로 이미지는 꾸밈 */}
          <Image src={visible ? EyeOffIcon : EyeIcon} alt="" aria-hidden />
        </button>
      }
    />
  );
};

export default PasswordInput;
