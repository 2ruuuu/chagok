import Image from "next/image";
import type { ComponentProps } from "react";
import BackIcon from "@/assets/icons/back.svg";
import { cn } from "@/lib/cn";

type BackButtonProps = Omit<ComponentProps<"button">, "children">;

const BackButton = ({ className, onClick, ...props }: BackButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center text-label-normal outline-none focus-visible:outline-2 focus-visible:outline-primary-40 cursor-pointer",
        className,
      )}
      {...props}
    >
      <Image src={BackIcon} alt="뒤로가기" />
    </button>
  );
};

export default BackButton;
