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

type CircleButtonProps = {
  provider: keyof typeof providers;
  className?: string;
};

const CircleButton = ({ provider, className }: CircleButtonProps) => {
  const { icon, label, className: providerClassName } = providers[provider];

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex size-11.5 items-center justify-center rounded-full border border-transparent cursor-pointer",
        providerClassName,
        className,
      )}
    >
      <Image src={icon} alt="" className="size-6" />
    </button>
  );
};

export default CircleButton;
