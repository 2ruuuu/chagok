import Image from "next/image";
import GoogleIcon from "@/assets/icons/google.svg";
import KakaoIcon from "@/assets/icons/kakao.svg";
import { cn } from "@/lib/cn";

const providers = {
  google: {
    icon: GoogleIcon,
    label: "구글 계정으로 로그인",
    className: "border-line-normal bg-common-0",
  },
  kakao: {
    icon: KakaoIcon,
    label: "카카오 계정으로 로그인",
    className: "bg-kakao",
  },
};

interface CircleButtonProps {
  provider: keyof typeof providers;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const CircleButton = ({
  provider,
  onClick,
  disabled,
  className,
}: CircleButtonProps) => {
  const { icon, label, className: providerClassName } = providers[provider];

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-11.5 cursor-pointer items-center justify-center rounded-full border border-transparent disabled:cursor-default disabled:opacity-60",
        providerClassName,
        className,
      )}
    >
      <Image src={icon} alt="" aria-hidden className="size-6" />
    </button>
  );
};

export default CircleButton;
