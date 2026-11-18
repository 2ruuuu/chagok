import odysseyPoster from "@/assets/imgs/giant-poster.webp";
import hopePoster from "@/assets/imgs/hope-poster.png";
import type { Ticket } from "@/components/ticket-card/TicketCard";

// TODO: 티켓 인증 → 카드 테이블이 생기면 DB 조회로 교체 (컬렉션 · 카드 상세에서 같이 씀)

export type CollectionCard = Ticket & {
  id: string;
  /** 관람평 별점 (0.5 단위, 5점 만점) */
  rating: number;
};

const movies = {
  hope: {
    title: "호프",
    originalTitle: "HOPE",
    poster: hopePoster,
    releasedAt: "2026.07.15.",
    country: "한국",
    genres: ["SF", "스릴러"],
  },
  odyssey: {
    title: "오디세이",
    originalTitle: "THE ODYSSEY",
    poster: odysseyPoster,
    releasedAt: "2026.08.05.",
    country: "미국",
    genres: ["액션", "드라마", "모험"],
  },
};

// [영화, 관람일, 시간, 별점, 포맷, 극장, 상영관, 좌석, 관람평]
// 연도 탭 확인용으로 2025 관람 기록도 넣음 (포스터는 있는 것 재사용)
// biome-ignore format: 한 줄에 카드 하나씩 표처럼 보기 위함
const records = [
  ["odyssey", "2026.10.24", "20:10", 4.5, "IMAX", "CGV 용산아이파크몰", "IMAX관", "J열 12번", "압도적이에요"],
  ["odyssey", "2026.10.11", "13:40", 4, "DOLBY", "메가박스 코엑스", "돌비시네마", "F열 9번", "두 번 봐도 좋아요"],
  ["hope", "2026.09.27", "19:30", 3.5, "4DX", "CGV 왕십리", "4DX관", "E열 7번", "후반부가 아쉬워요"],
  ["odyssey", "2026.09.02", "21:00", 5, "SCREENX", "CGV 여의도", "SCREENX관", "H열 14번", "올해 최고"],
  ["hope", "2026.08.20", "18:50", 2.5, "2D", "롯데시네마 월드타워", "5관", "G열 3번", "호프 노잼"],
  ["odyssey", "2026.08.08", "10:20", 4, "IMAX", "CGV 용산아이파크몰", "IMAX관", "K열 20번", "조조로 봐도 꽉 차요"],
  ["hope", "2026.07.30", "22:10", 3, "2D", "메가박스 성수", "3관", "D열 11번", "무난해요"],
  ["hope", "2026.07.15", "19:30", 1, "IMAX", "CGV 용산아이파크몰", "IMAX관", "H열 14번", "호프 노잼"],
  ["odyssey", "2025.12.24", "17:00", 4.5, "DOLBY", "메가박스 코엑스", "돌비시네마", "E열 8번", "크리스마스에 봤어요"],
  ["hope", "2025.11.15", "14:30", 3.5, "2D", "CGV 강남", "2관", "F열 5번", "배우들 연기가 좋아요"],
  ["odyssey", "2025.10.03", "19:00", 5, "IMAX", "CGV 용산아이파크몰", "IMAX관", "M열 18번", "인생 영화"],
  ["hope", "2025.08.09", "11:10", 2, "4DX", "CGV 왕십리", "4DX관", "C열 9번", "멀미 나요"],
  ["odyssey", "2025.06.21", "20:40", 4, "SCREENX", "CGV 여의도", "SCREENX관", "G열 12번", "화면이 넓어서 좋아요"],
  ["hope", "2025.03.01", "16:20", 3, "2D", "롯데시네마 건대입구", "7관", "E열 6번", "그럭저럭"],
] as const;

// 카드 뒷면 감상평 (comment)이 있는 카드: 카드 순서(index) → 감상평. 마이 "나의 감상" 개수 확인용
const comments: Record<number, string> = {
  0: "아이맥스로 다시 봐도 소름 돋았어요. 마지막 바다 장면은 꼭 큰 화면으로.",
  3: "올해 본 영화 중 최고. 끝나고 한참 자리에서 못 일어났어요.",
  7: "기대보다 아쉬웠지만 같이 본 사람 덕분에 즐거웠던 날.",
};

export const collectionCards: CollectionCard[] = records.map(
  (
    [movie, watchedAt, showtime, rating, format, theater, screen, seat, review],
    index,
  ) => {
    const no = String(index + 1).padStart(4, "0");
    return {
      ...movies[movie],
      genres: [...movies[movie].genres],
      id: `card-${no}`,
      watchedAt,
      showtime,
      rating,
      format,
      theater,
      screen,
      seat,
      review,
      comment: comments[index],
      certificateId: `CHG-${watchedAt.slice(2).replaceAll(".", "")}-${no}`,
    };
  },
);

export const findCollectionCard = (id: string) =>
  collectionCards.find((card) => card.id === id);
