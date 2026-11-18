/** 한국 시간 기준 날짜 계산 (서버가 UTC여도 박스오피스 · 개봉일은 한국 날짜로) */

const KST_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DAY_MS = 24 * 60 * 60 * 1000;

/** 오늘에서 offset일 더한 한국 날짜 YYYY-MM-DD (어제 = -1) */
export const kstDate = (offset = 0) =>
  KST_FORMAT.format(new Date(Date.now() + offset * DAY_MS));

/** YYYY-MM-DD 두 날짜 사이 일수 (to - from) */
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);
