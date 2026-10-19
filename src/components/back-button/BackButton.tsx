"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import BackIcon from "@/assets/icons/back.svg";
import { cn } from "@/lib/cn";

type BackButtonProps = Omit<ComponentProps<"button">, "children">;

/** 뒤로가기 버튼. onClick을 넘기지 않으면 브라우저 뒤로가기(router.back) */
const BackButton = ({ className, onClick, ...props }: BackButtonProps) => {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center text-label-normal outline-none focus-visible:outline-2 focus-visible:outline-primary-40 cursor-pointer",
        className,
      )}
      onClick={onClick ?? (() => router.back())}
      {...props}
    >
      <Image src={BackIcon} alt="뒤로가기" />
    </button>
  );
};

export default BackButton;
