import Image from "next/image";
import DefaultProfile from "@/assets/imgs/profile.png";
import { cn } from "@/lib/cn";

interface AvatarProps {
  /** 사진 URL (Storage 공개 URL 또는 고른 사진 미리보기 blob:). 없으면 기본 이미지 */
  src: string | null;
  /** 화면에 보이는 지름(px). next/image가 알맞은 크기로 받도록 sizes에 씀 */
  size: number;
  className?: string;
}

/** 동그란 프로필 사진. 꾸밈 이미지라 이름은 옆 글자로 읽힘 */
const Avatar = ({ src, size, className }: AvatarProps) => {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full bg-neutral-10",
        className,
      )}
    >
      <Image
        src={src ?? DefaultProfile}
        alt=""
        aria-hidden
        fill
        sizes={`${size}px`}
        // 고른 사진 미리보기(blob:)는 이미지 최적화 서버가 못 읽음
        unoptimized={src?.startsWith("blob:")}
        className="object-cover"
      />
    </span>
  );
};

export default Avatar;
