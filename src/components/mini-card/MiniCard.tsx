import Image, { type StaticImageData } from "next/image";
import BadgeCheck from "@/assets/icons/badge-check.svg";
import { cn } from "@/lib/cn";

interface MiniCardProps {
  /** import한 이미지 또는 이미지 URL */
  poster: StaticImageData | string;
  /** 포스터 설명. 옆에 제목이 있으면 비워 둠 → 꾸밈 이미지로 처리 */
  alt?: string;
  /** VERIFIED 배지 표시 (카드 묶음에서는 맨 위 카드만) */
  showBadge?: boolean;
  /** next/image sizes. 80px보다 크게 쓰면 실제 크기에 맞게 넘김 */
  sizes?: string;
  className?: string;
}

/**
 * 80×112 작은 관람 인증 카드 (포스터 + 고정 홀로그램 + VERIFIED 배지).
 * 카드 묶음(CardStack), 최근 남긴 관람평에서 같이 씀
 */
const MiniCard = ({
  poster,
  alt = "",
  showBadge = true,
  sizes = "80px",
  className,
}: MiniCardProps) => {
  return (
    <div
      className={cn(
        // 카드 비율이 5:7이라 모서리를 가로 6% / 세로 4.29%로 줘야 둥근 모서리가 찌그러지지 않음
        // @container: 배지 크기를 카드 너비(cqw) 기준으로 맞춤 → 카드 크기가 바뀌어도 비율 유지
        "@container relative h-28 w-20 shrink-0 overflow-hidden rounded-[6%/4.29%]",
        className,
      )}
    >
      <Image
        src={poster}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        fill
        // 흐린 미리보기는 import한 이미지에서만 자동 생성됨
        placeholder={typeof poster === "string" ? "empty" : "blur"}
        sizes={sizes}
        className="object-cover"
      />
      <span
        aria-hidden
        className="card-holo-static pointer-events-none absolute inset-0"
      />
      {showBadge && (
        <span className="holo-border absolute top-[4cqw] right-[4cqw] flex items-center gap-[1.5cqw] rounded-full bg-material-dimmer py-[1.8cqw] pr-[3.6cqw] pl-[2.4cqw] text-[length:3.6cqw] leading-none font-semibold tracking-[0.04em] text-static-white backdrop-blur-[8px]">
          <Image src={BadgeCheck} alt="" aria-hidden className="size-[1.3em]" />
          VERIFIED
        </span>
      )}
    </div>
  );
};

export default MiniCard;
