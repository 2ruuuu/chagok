"use client";

import { BadgeCheck } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { type CSSProperties, type PointerEvent, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./TicketCard.module.css";

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
  certificateId: string;
};

const MAX_TILT_X = 10;
const MAX_TILT_Y = 14;

// 인증 번호로 고정된 바코드 패턴 생성 (렌더마다 바뀌지 않도록)
function barcodeBars(seed: string) {
  return Array.from({ length: 42 }, (_, i) => {
    const code = seed.charCodeAt(i % seed.length) + i * 7;
    return (code % 3) + 1;
  });
}

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [flipped, setFlipped] = useState(false);

  function setVars(px: number, py: number) {
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
  }

  // 회전하는 카드가 아니라 고정된 scene 기준으로 좌표를 잡아야 떨림이 없음
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
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
  }

  function handlePointerEnter() {
    sceneRef.current?.setAttribute("data-active", "");
  }

  function handlePointerLeave() {
    cancelAnimationFrame(frameRef.current);
    sceneRef.current?.removeAttribute("data-active");
    setVars(0.5, 0.5);
    sceneRef.current?.style.setProperty("--hyp", "0");
  }

  return (
    <div
      ref={sceneRef}
      className={cn(styles.scene, "relative aspect-[5/7] w-75 md:w-90")}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Image
        src={ticket.poster}
        alt=""
        aria-hidden
        sizes="360px"
        className={cn(styles.ambient, "size-[84%] object-cover")}
      />

      <div className={cn(styles.intro, "size-full")}>
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={`${ticket.title} 관람 인증 카드, ${flipped ? "앞면" : "뒷면"} 보기`}
          onClick={() => setFlipped((prev) => !prev)}
          className={cn(
            styles.tilt,
            "block size-full cursor-pointer rounded-[20px] text-left outline-none",
            "focus-visible:ring-2 focus-visible:ring-primary-40 focus-visible:ring-offset-4 focus-visible:ring-offset-secondary-100",
          )}
        >
          <span
            className={cn(styles.flipper, "relative block size-full")}
            data-flipped={flipped || undefined}
          >
            <CardFront ticket={ticket} />
            <CardBack ticket={ticket} />
          </span>
        </button>
      </div>
    </div>
  );
}

function CardFront({ ticket }: { ticket: Ticket }) {
  return (
    <span className={cn(styles.face, styles.front, "block bg-neutral-99")}>
      <Image
        src={ticket.poster}
        alt={`${ticket.title} 포스터`}
        placeholder="blur"
        preload
        sizes="(min-width: 768px) 360px, 300px"
        className={cn(styles.poster, "size-full object-cover")}
      />

      <span className={styles.holo} />
      <span className={styles.glare} />

      <span
        className={cn(
          styles.ring,
          "absolute top-3 right-3 flex items-center gap-1 rounded-full py-1 pr-2.5 pl-1.5",
          "bg-material-dimmer backdrop-blur-md",
        )}
      >
        <BadgeCheck className="size-4 text-static-white" strokeWidth={2.25} />
        <span className="text-caption2 font-semibold tracking-wider text-static-white">
          VERIFIED
        </span>
      </span>

      <span
        className={cn(styles.floating, "absolute inset-x-3 bottom-3 block")}
      >
        <span
          className={cn(
            styles.glass,
            "relative flex flex-col gap-3 rounded-2xl p-4",
            "border border-background-transparent-alternative bg-background-transparent-normal",
            "backdrop-blur-xl backdrop-saturate-150",
          )}
        >
          <span className="flex items-center justify-between">
            <span
              className={cn(
                styles.holoText,
                "text-label3 font-extrabold tracking-widest",
              )}
            >
              {ticket.format}
            </span>
            <span className="text-caption2 text-neutral-15">
              {ticket.watchedAt}
            </span>
          </span>

          <span className="flex items-baseline gap-2">
            <span className="text-heading2 text-static-white">
              {ticket.title}
            </span>
            <span className="text-label3 font-medium tracking-widest text-neutral-20">
              {ticket.originalTitle}
            </span>
          </span>

          <span className="flex items-center gap-1.5 text-caption1 text-neutral-10">
            <span className="truncate">{ticket.theater}</span>
            <span className="size-0.5 shrink-0 rounded-full bg-neutral-30" />
            <span className="shrink-0">{ticket.seat}</span>
          </span>
        </span>
      </span>
    </span>
  );
}

function CardBack({ ticket }: { ticket: Ticket }) {
  const rows = [
    ["극장", ticket.theater],
    ["상영관", ticket.screen],
    ["일시", `${ticket.watchedAt} ${ticket.showtime}`],
    ["좌석", ticket.seat],
  ];

  return (
    <span
      className={cn(styles.face, styles.back, styles.notched, "block")}
      style={{ "--notch-y": "66%" } as CSSProperties}
    >
      <Image
        src={ticket.poster}
        alt=""
        aria-hidden
        sizes="120px"
        className="absolute inset-0 size-full scale-125 object-cover blur-2xl saturate-150"
      />
      <span className="absolute inset-0 bg-material-dimmer" />
      <span className={styles.holo} />
      <span className={styles.glare} />

      <span className="relative flex h-full flex-col px-5 pt-6 pb-5">
        <span className="flex items-center justify-between">
          <span className="text-label3 tracking-widest text-neutral-15">
            CHAGOK TICKET
          </span>
          <span
            className={cn(
              styles.holoText,
              "text-label3 font-extrabold tracking-widest",
            )}
          >
            {ticket.format}
          </span>
        </span>

        <span className="mt-4 flex items-baseline gap-2">
          <span className="text-display2 text-static-white">
            {ticket.title}
          </span>
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

        <span className={cn(styles.perforation, "block")} />

        <span className="mt-auto flex flex-col gap-2">
          <span className="flex h-10 items-stretch gap-0.5" aria-hidden>
            {barcodeBars(ticket.certificateId).map((weight, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: 고정 길이 장식 패턴
                key={i}
                className="bg-static-white/85"
                style={{ flexGrow: weight }}
              />
            ))}
          </span>
          <span className="flex items-center justify-between">
            <span className="text-caption2 tracking-wider text-neutral-20">
              {ticket.certificateId}
            </span>
            <span className="flex items-center gap-1 text-caption2 font-semibold text-status-positive">
              <BadgeCheck className="size-3.5" strokeWidth={2.25} />
              관람 인증
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
