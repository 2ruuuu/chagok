import type { RecognizedTicket } from "@/app/verify/_stores/useVerifyStore";
import { type AutoChain, type Chain, isAutoChain } from "./normalize";

/**
 * 티켓 · 영화 값을 인증 화면(RecognizedTicket) 모양으로 바꿈.
 * 인식 직후(/api/verify/recognize)와 검수 승인 뒤 홈 "확인 중인 티켓"에서 같이 씀
 */

const CHAIN_LABELS: Record<AutoChain, string> = {
  cgv: "CGV",
  lotte: "롯데시네마",
  megabox: "메가박스",
};

// 상영관 이름에서 상영 포맷 (없으면 2D)
const FORMAT_PATTERN = /IMAX|4DX|SCREENX|DOLBY|MX4D|SUPER\s*4D/i;

const KST_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export type TicketMovie = {
  title: string;
  originalTitle: string;
  poster: string;
  productionYear: string;
  runtime: number | null;
  director: string;
  cast: string[];
  grade: string;
  /** 최초 개봉일 YYYY-MM-DD */
  releasedAt: string;
  country: string;
  genres: string[];
};

/** 화면에 보이는 극장 이름: 3사는 "CGV 광주터미널", 그 외는 티켓에 적힌 그대로 */
export const theaterLabel = (
  chain: Chain | null,
  theater: string | null,
  rawTheater: string | null,
) =>
  isAutoChain(chain)
    ? `${CHAIN_LABELS[chain]} ${theater ?? ""}`.trim()
    : (rawTheater ?? theater ?? "");

/** 상영 시작 -> 관람일 YYYY.MM.DD · 요일 · HH:mm (KST) */
export const showtimeParts = (screenedAt: Date) => {
  const parts = Object.fromEntries(
    KST_PARTS.formatToParts(screenedAt).map((part) => [part.type, part.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return {
    watchedAt: date.replaceAll("-", "."),
    weekday: WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()],
    showtime: `${parts.hour}:${parts.minute}`,
  };
};

/** 상영관 이름에서 상영 포맷 (IMAX · 4DX · SCREENX · DOLBY 등, 없으면 2D) */
export const formatFromScreen = (screen: string | null) =>
  screen?.match(FORMAT_PATTERN)?.[0].toUpperCase() ?? "2D";

export const buildRecognizedTicket = (input: {
  ticketId: string;
  movie: TicketMovie;
  chain: Chain | null;
  theater: string | null;
  rawTheater: string | null;
  screen: string | null;
  screenedAt: Date;
  seats: string[];
  seat: string | null;
  needsReview: boolean;
}): RecognizedTicket => ({
  ticketId: input.ticketId,
  title: input.movie.title,
  originalTitle: input.movie.originalTitle,
  poster: input.movie.poster,
  productionYear: input.movie.productionYear,
  runtime: input.movie.runtime ?? 0,
  director: input.movie.director,
  cast: input.movie.cast,
  grade: input.movie.grade,
  releasedAt: `${input.movie.releasedAt.replaceAll("-", ".")}.`,
  country: input.movie.country,
  genres: input.movie.genres,
  format: formatFromScreen(input.screen),
  theater: theaterLabel(input.chain, input.theater, input.rawTheater),
  screen: input.screen ?? "",
  ...showtimeParts(input.screenedAt),
  seats: input.seats,
  seat: input.seat ?? "",
  needsReview: input.needsReview,
  // 카드 발급 때 정함
  certificateId: "",
});
