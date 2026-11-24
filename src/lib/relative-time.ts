const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * 지난 시각을 "방금 전 · N분 전 · N시간 전 · N일 전"으로.
 * 30일이 넘으면 날짜(2026.11.23)로
 */
export const formatRelativeTime = (iso: string, now = Date.now()) => {
  const diff = Math.max(0, now - new Date(iso).getTime());

  if (diff < MINUTE_MS) return "방금 전";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}분 전`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}시간 전`;
  if (diff < 30 * DAY_MS) return `${Math.floor(diff / DAY_MS)}일 전`;

  const date = new Date(iso);
  // 서버(UTC)에서 그려도 한국 날짜로
  const [year, month, day] = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => part.value);
  return `${year}.${month}.${day}`;
};
