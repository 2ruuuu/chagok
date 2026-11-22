import type { StaticImageData } from "next/image";
import MiniCard from "@/components/mini-card/MiniCard";
import { cn } from "@/lib/cn";

/**
 * 세 자리. place: 처음 자리 (동작 줄이기면 여기 멈춤)
 * delay: 애니메이션을 미리 진행시켜 둔 시간. 9초 한 바퀴 중 3초 = 왼쪽 뒤, 6초 = 오른쪽 뒤에서 시작
 *   (card-effects.css coverflow-spin 주석 참고)
 */
const PLACES = [
  { place: "coverflow-front", delay: "" },
  { place: "coverflow-right", delay: "[--coverflow-delay:-6s]" },
  { place: "coverflow-left", delay: "[--coverflow-delay:-3s]" },
];

interface SampleCardCarouselProps {
  /** 포스터 3장 */
  posters: (StaticImageData | string)[];
}

/**
 * 티켓 인증 시작 화면의 예시 카드. 세 장이 다 보이고, 가운데 카드가 맨 앞,
 * 나머지는 왼쪽 · 오른쪽 뒤에 작게 기울어져 있다가 한 칸씩 돌아감 (누를 수 없음).
 * JS 없이 CSS 애니메이션만 씀 (coverflow-spin, card-effects.css). 동작 줄이기 설정이면 처음 자리에 멈춤.
 */
const SampleCardCarousel = ({ posters }: SampleCardCarouselProps) => {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative h-56 w-40 perspective-[800px]"
    >
      {PLACES.map(({ place, delay }, index) => {
        const poster = posters[index];
        if (!poster) return null;
        return (
          <div
            key={place}
            className={cn(
              "absolute inset-0 motion-safe:coverflow-spin",
              place,
              delay,
            )}
          >
            <MiniCard
              poster={poster}
              sizes="160px"
              className="h-56 w-40 shadow-lg"
            />
          </div>
        );
      })}
    </div>
  );
};

export default SampleCardCarousel;
