/**
 * LLM이 읽은 값을 지문용 표준 모양으로 바꿈 (ticket-verify.md "지문")
 * 모델 · 실행마다 표기가 달라서 LLM에 맡기지 않고 여기서 정규화함
 */

export type Chain = "cgv" | "lotte" | "megabox" | "etc";

/** 자동 인증 대상 (3사) */
export type AutoChain = Exclude<Chain, "etc">;

export const AUTO_VERIFY_CHAINS: Chain[] = ["cgv", "lotte", "megabox"];

export const isAutoChain = (chain: Chain | null): chain is AutoChain =>
  chain !== null && AUTO_VERIFY_CHAINS.includes(chain);

const CHAIN_ALIASES: Record<string, Chain> = {
  CGV: "cgv",
  LOTTE: "lotte",
  롯데시네마: "lotte",
  MEGABOX: "megabox",
  메가박스: "megabox",
  OTHER: "etc",
};

/** 체인. 못 읽었으면 null */
export const normalizeChain = (raw: string | null): Chain | null => {
  if (!raw) return null;
  return CHAIN_ALIASES[raw.replace(/\s/g, "").toUpperCase()] ?? "etc";
};

// 극장 이름 앞뒤에 붙는 체인 이름 ("메가박스 코엑스", "CGV용산아이파크몰", "롯데시네마 월드타워")
const CHAIN_NAME_PATTERN =
  /CGV|LOTTE\s*CINEMA|롯데\s*시네마|MEGABOX|메가박스/gi;

/** 극장: 체인 이름 떼고 지점명만, 공백 제거 ("메가박스 코엑스" -> "코엑스") */
export const normalizeTheater = (raw: string | null) => {
  if (!raw) return null;
  const name = raw.replace(CHAIN_NAME_PATTERN, "").replace(/\s/g, "");
  return name || null;
};

/** 좌석: "E열 10" · "I-12" · "B - 4" · "D열 9번" · "B열1번" -> "E10" · "I12" · "B4" · "D9" · "B1". 모양이 다르면 null */
export const normalizeSeat = (raw: string) => {
  const match = raw
    .trim()
    .toUpperCase()
    .match(/^([A-Z]{1,2})\s*열?\s*-?\s*(\d{1,3})\s*번?$/);
  if (!match) return null;
  return `${match[1]}${Number(match[2])}`;
};

// 연속 좌석 한 줄 표기: "F열9-10번" · "F9-10" · "F9~F10" · "F9-F10" (같은 열, 앞 번호 < 뒤 번호)
const SEAT_RANGE_PATTERN =
  /^([A-Z]{1,2})\s*열?\s*(\d{1,3})\s*번?\s*[-~]\s*([A-Z]{1,2})?\s*열?\s*(\d{1,3})\s*번?$/;
// 같이 예매한 좌석이 이보다 많이 이어질 일은 거의 없음 (오독으로 F1-100 같은 값이 오면 못 읽은 것으로)
const MAX_SEAT_RANGE = 10;

/**
 * 좌석 한 칸을 좌석 목록으로. 보통은 하나, 연속 좌석 표기면 펼침 ("F열9-10번" -> F9, F10). 모양이 다르면 null
 * "I-12" · "B - 4"는 열 문자 바로 뒤 하이픈이라 한 자리 좌석 (normalizeSeat)
 */
export const expandSeat = (raw: string): string[] | null => {
  const single = normalizeSeat(raw);
  if (single) return [single];

  const match = raw.trim().toUpperCase().match(SEAT_RANGE_PATTERN);
  if (!match) return null;
  const [, row, fromText, toRow, toText] = match;
  if (toRow && toRow !== row) return null;
  const from = Number(fromText);
  const to = Number(toText);
  if (from >= to || to - from >= MAX_SEAT_RANGE) return null;
  return Array.from({ length: to - from + 1 }, (_, i) => `${row}${from + i}`);
};

/** 예매번호: 숫자 · 영문만 (하이픈 · 공백 제거) */
export const normalizeBookingNumber = (raw: string | null) => {
  const value = raw?.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  return value || null;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 연도가 없는 모바일 티켓에서 거슬러 올라가 볼 햇수 (관람일 제한은 없지만 요일이 맞는 해가 6~11년마다 돌아옴)
const YEAR_LOOKBACK = 10;

/** YYYY-MM-DD의 요일 한 글자. 없는 날짜면 null */
const weekdayOf = (date: string) => {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  // 2월 30일 같은 날짜는 Date가 3월로 넘겨버려서 되돌려 비교
  if (parsed.toISOString().slice(0, 10) !== date) return null;
  return WEEKDAYS[parsed.getUTCDay()];
};

const kstYear = (now: Date) =>
  Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
    }).format(now),
  );

export type Showtime = {
  /** 상영 시작 (DB screened_at) */
  screenedAt: Date;
  /** YYYY-MM-DD (KST) */
  date: string;
  /** HH:mm */
  time: string;
  weekday: string;
  /** 티켓에 연도가 없어 요일로 정함 */
  yearInferred: boolean;
  /** 연도도 요일도 없어 가장 가까운 지난 날짜로 정함 -> 검수 */
  yearGuessed: boolean;
};

export type ShowtimeResult =
  | { ok: true; showtime: Showtime }
  /** missing: 월일 · 시각을 못 읽음 / mismatch: 연도와 요일이 안 맞음 / future: 아직 상영 전 */
  | { ok: false; reason: "missing" | "mismatch" | "future" };

/**
 * 상영일시. 모바일 티켓엔 연도가 없음 -> 오늘 이전에서 월일 · 요일이 맞는 가장 가까운 해 (ticket-verify.md "LLM 추출")
 * 상영 시작 시각이 아직 안 지났으면 future
 */
export const resolveShowtime = (
  input: {
    year: number | null;
    monthDay: string | null;
    weekday: string | null;
    time: string | null;
  },
  now = new Date(),
): ShowtimeResult => {
  const monthDay = input.monthDay?.match(/^(\d{1,2})-(\d{1,2})$/);
  const time = input.time?.match(/^(\d{1,2}):(\d{2})$/);
  if (!monthDay || !time) return { ok: false, reason: "missing" };

  const md = `${monthDay[1].padStart(2, "0")}-${monthDay[2].padStart(2, "0")}`;
  const hm = `${time[1].padStart(2, "0")}:${time[2]}`;
  // 25:10처럼 자정 넘긴 표기는 지문이 흔들려서 검수로
  if (Number(time[1]) > 23 || Number(time[2]) > 59) {
    return { ok: false, reason: "missing" };
  }

  const build = (year: number, yearInferred: boolean, yearGuessed: boolean) => {
    const date = `${year}-${md}`;
    const weekday = weekdayOf(date);
    if (!weekday) return null;
    return {
      screenedAt: new Date(`${date}T${hm}:00+09:00`),
      date,
      time: hm,
      weekday,
      yearInferred,
      yearGuessed,
    };
  };

  if (input.year !== null) {
    const showtime = build(input.year, false, false);
    if (!showtime) return { ok: false, reason: "missing" };
    if (input.weekday && input.weekday !== showtime.weekday) {
      return { ok: false, reason: "mismatch" };
    }
    if (showtime.screenedAt > now) return { ok: false, reason: "future" };
    return { ok: true, showtime };
  }

  const thisYear = kstYear(now);
  for (let year = thisYear; year >= thisYear - YEAR_LOOKBACK; year -= 1) {
    const showtime = build(year, true, input.weekday === null);
    if (!showtime || showtime.screenedAt > now) continue;
    if (input.weekday && input.weekday !== showtime.weekday) continue;
    return { ok: true, showtime };
  }
  return { ok: false, reason: "mismatch" };
};
