import Image from "next/image";
import { cn } from "@/lib/cn";
import type { MoviePoster } from "@/lib/movies/types";

interface MoviePosterImageProps {
  poster: MoviePoster;
  /** 포스터가 영화 이름을 대신할 때만 (옆에 제목 글자가 없을 때) */
  alt?: string;
  /** next/image sizes (fill이라 화면에 보이는 폭) */
  sizes: string;
  className?: string;
}

/** 홈 영화 포스터. 크기는 감싸는 className으로, 포스터를 못 찾았으면 빈 회색 칸 */
const MoviePosterImage = ({
  poster,
  alt = "",
  sizes,
  className,
}: MoviePosterImageProps) => {
  return (
    <span
      className={cn("relative block overflow-hidden bg-neutral-80", className)}
      aria-hidden={alt ? undefined : true}
    >
      {poster ? (
        <Image
          src={poster}
          alt={alt}
          fill
          sizes={sizes}
          placeholder={typeof poster === "string" ? "empty" : "blur"}
          className="object-cover"
        />
      ) : (
        // 포스터를 못 찾았을 때도 영화 이름은 읽히게
        alt && <span className="sr-only">{alt}</span>
      )}
    </span>
  );
};

export default MoviePosterImage;
