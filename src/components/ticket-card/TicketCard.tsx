"use client";

import Image, { type StaticImageData } from "next/image";
import { type PointerEvent, useRef, useState } from "react";
import BadgeCheck from "@/assets/icons/badge-check.svg";
import BadgeCheckGreen from "@/assets/icons/badge-check-green.svg";
import { cn } from "@/lib/cn";

export type Ticket = {
  title: string;
  originalTitle: string;
  poster: StaticImageData;
  format: string;
  theater: string;
  screen: string;
  watchedAt: string;
  showtime: string;
  seat: string;
  review: string;
  /** 절취선 아래 밑줄 칸에 들어가는 감상평 (티켓 인증 때 작성). 없으면 빈 줄만 보임 */
  comment?: string;
  releasedAt: string;
  country: string;
  genres: string[];
  certificateId: string;
};

const MAX_TILT_X = 10;
const MAX_TILT_Y = 14;

// 카드 한 면 공통. 효과 클래스(card-*)는 src/app/card-effects.css
// 모션 줄이기 설정이면 뒤집기는 회전 대신 페이드
const FACE_CLASS =
  "card-face absolute inset-0 block overflow-hidden rounded-[20px] ring-1 ring-common-0/10 backface-hidden motion-reduce:transition-opacity motion-reduce:duration-200";

// 효과 레이어 공통 (카드 위를 덮고 클릭은 통과)
const LAYER_CLASS = "pointer-events-none absolute inset-0";

// 감상평 칸 밑줄 개수
const RULED_LINES = [1, 2, 3];

interface TicketCardProps {
  ticket: Ticket;
  /** 넘기면 바깥에서 앞/뒷면을 제어 (캐러셀 등). 안 넘기면 카드가 스스로 관리 */
  flipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
}

const TicketCard = ({
  ticket,
  flipped: flippedProp,
  onFlippedChange,
}: TicketCardProps) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [innerFlipped, setInnerFlipped] = useState(false);
  const isControlled = flippedProp !== undefined;
  const flipped = isControlled ? flippedProp : innerFlipped;

  const toggleFlipped = () => {
    const next = !flipped;
    if (!isControlled) setInnerFlipped(next);
    onFlippedChange?.(next);
  };

  const setVars = (px: number, py: number) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const dx = px - 0.5;
    const dy = py - 0.5;
    const hyp = Math.min(Math.hypot(dx, dy) / 0.5, 1);

    scene.style.setProperty("--px", px.toFixed(3));
    scene.style.setProperty("--py", py.toFixed(3));
    scene.style.setProperty("--rx", `${(-dy * 2 * MAX_TILT_X).toFixed(2)}deg`);
    scene.style.setProperty("--ry", `${(dx * 2 * MAX_TILT_Y).toFixed(2)}deg`);
    scene.style.setProperty("--hyp", hyp.toFixed(3));
  };

  // 회전하는 카드가 아니라 고정된 scene 기준으로 좌표를 잡아야 떨림이 없음
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const rect = scene.getBoundingClientRect();
    const px = Math.min(
      Math.max((event.clientX - rect.left) / rect.width, 0),
      1,
    );
    const py = Math.min(
      Math.max((event.clientY - rect.top) / rect.height, 0),
      1,
    );

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => setVars(px, py));
  };

  const handlePointerEnter = () => {
    sceneRef.current?.setAttribute("data-active", "");
  };

  const handlePointerLeave = () => {
    cancelAnimationFrame(frameRef.current);
    sceneRef.current?.removeAttribute("data-active");
    setVars(0.5, 0.5);
    sceneRef.current?.style.setProperty("--hyp", "0");
  };

  return (
    <div
      ref={sceneRef}
      className="card-scene relative aspect-[5/7] w-75 touch-pan-x touch-pan-y perspective-[1000px] md:w-90"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div className="size-full transform-3d animate-card-wobble motion-reduce:animate-none">
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={`${ticket.title} 관람 인증 카드, ${flipped ? "앞면" : "뒷면"} 보기`}
          onClick={toggleFlipped}
          className="card-tilt block size-full cursor-pointer rounded-[20px] text-left outline-none transform-3d"
        >
          <span
            className={cn(
              "relative block size-full transform-3d transition-transform duration-800 ease-spring",
              flipped && "motion-safe:rotate-y-180",
            )}
          >
            <CardFront ticket={ticket} flipped={flipped} />
            <CardBack ticket={ticket} flipped={flipped} />
          </span>
        </button>
      </div>
    </div>
  );
};

interface CardFaceProps {
  ticket: Ticket;
  flipped: boolean;
}

const CardFront = ({ ticket, flipped }: CardFaceProps) => {
  return (
    <span
      className={cn(
        FACE_CLASS,
        "bg-neutral-99",
        flipped && "motion-reduce:opacity-0",
      )}
    >
      <Image
        src={ticket.poster}
        alt={`${ticket.title} 포스터`}
        placeholder="blur"
        preload
        sizes="(min-width: 768px) 360px, 300px"
        className="card-parallax size-full object-cover"
      />

      {/* 앞면은 포스터 위로 빛줄기가 가만히 있어도 보이도록 더 진하게 */}
      <span
        className={cn(
          LAYER_CLASS,
          "card-holo [--holo-base:0.4] [--holo-gain:0.45]",
        )}
      />
      <span className={cn(LAYER_CLASS, "card-glare")} />
      <span
        className={cn(
          LAYER_CLASS,
          "card-sheen animate-card-sheen motion-reduce:animate-none",
        )}
      />

      <span
        className={cn(
          "holo-ring absolute top-3 right-3 flex items-center gap-1 rounded-full py-1 pr-2.5 pl-1.5",
          "bg-material-dimmer backdrop-blur-md",
        )}
      >
        <Image src={BadgeCheck} alt="" aria-hidden className="size-4" />
        <span className="text-caption2 font-semibold tracking-wider text-static-white">
          VERIFIED
        </span>
      </span>
    </span>
  );
};

const CardBack = ({ ticket, flipped }: CardFaceProps) => {
  const rows = [
    ["관람평", ticket.review],
    ["극장", ticket.theater],
    ["상영관", ticket.screen],
    ["일시", `${ticket.watchedAt} ${ticket.showtime}`],
    ["좌석", ticket.seat],
  ];

  return (
    <span
      className={cn(
        FACE_CLASS,
        "card-notched [--notch-y:66%] motion-safe:rotate-y-180",
        !flipped && "motion-reduce:opacity-0",
      )}
    >
      <span className={cn(LAYER_CLASS, "card-back-bg")} />
      <span className={cn(LAYER_CLASS, "card-guilloche")} />
      <span className={cn(LAYER_CLASS, "card-holo")} />
      <span className={cn(LAYER_CLASS, "card-glare-back")} />

      <span className="relative flex h-full flex-col px-5 pt-6 pb-5">
        <span className="flex items-center justify-between">
          <span className="foil-text text-label3 font-semibold tracking-widest">
            CHAGOK TICKET
          </span>
          <span className="holo-text text-label3 font-extrabold tracking-widest">
            {ticket.format}
          </span>
        </span>

        <span className="mt-4 flex items-baseline gap-2">
          <span className="foil-text text-display2">{ticket.title}</span>
          <span className="text-label2 font-medium tracking-widest text-neutral-20">
            {ticket.originalTitle}
          </span>
        </span>

        <span className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5">
          {rows.map(([label, value]) => (
            <span key={label} className="contents">
              <span className="text-caption1 text-neutral-30">{label}</span>
              <span className="text-label2 font-medium text-static-white">
                {value}
              </span>
            </span>
          ))}
        </span>

        {/* 절취선: 양쪽 노치 높이(--notch-y)에 맞춘 점선 */}
        <span className="absolute inset-x-0 top-[var(--notch-y)] block before:absolute before:inset-x-4.5 before:top-0 before:border-t-[1.5px] before:border-dashed before:border-common-0/25" />

        <span className="mt-auto flex flex-col gap-2">
          {/* 감상평 밑줄 3칸: 밑줄은 항상 3줄, 글자는 그 위에 겹쳐서 줄마다 앉음 (줄 높이 h-7 = leading-7) */}
          <span className="relative block">
            {RULED_LINES.map((line) => (
              <span
                key={line}
                className="block h-7 border-b border-common-0/25"
                aria-hidden
              />
            ))}
            <span className="absolute inset-0 line-clamp-3 text-label2 leading-7 font-medium break-words break-keep text-static-white">
              {ticket.comment}
            </span>
          </span>
          <span className="flex items-center justify-between">
            <span className="text-caption2 tracking-wider text-neutral-20">
              {ticket.certificateId}
            </span>
            <span className="flex items-center gap-1 text-caption2 font-semibold text-status-positive">
              <Image
                src={BadgeCheckGreen}
                alt=""
                aria-hidden
                className="size-3.5"
              />
              관람 인증
            </span>
          </span>
        </span>
      </span>
    </span>
  );
};

export default TicketCard;
