import hopePoster from "@/assets/imgs/hope-poster.png";
import type { Ticket } from "@/components/ticket-card/TicketCard";
import { TicketCarousel } from "@/components/ticket-carousel/TicketCarousel";

// 예시 데이터 (포스터는 같은 이미지를 돌려 씀)
const baseTicket: Ticket = {
  title: "호프",
  originalTitle: "HOPE",
  poster: hopePoster,
  format: "IMAX",
  theater: "CGV 용산아이파크몰",
  screen: "IMAX관",
  watchedAt: "2026.07.15",
  showtime: "19:30",
  seat: "H열 14번",
  review: "호프 노잼",
  releasedAt: "2026.07.15.",
  country: "한국",
  genres: ["SF", "스릴러"],
  certificateId: "CHG-260715-0001",
};

const tickets: Ticket[] = [
  baseTicket,
  {
    ...baseTicket,
    format: "DOLBY",
    theater: "메가박스 코엑스",
    screen: "돌비시네마",
    watchedAt: "2026.07.20",
    seat: "F열 9번",
    certificateId: "CHG-260720-0002",
  },
  {
    ...baseTicket,
    format: "4DX",
    theater: "CGV 왕십리",
    screen: "4DX관",
    watchedAt: "2026.08.02",
    seat: "E열 7번",
    certificateId: "CHG-260802-0003",
  },
  {
    ...baseTicket,
    format: "SCREENX",
    theater: "CGV 여의도",
    screen: "SCREENX관",
    watchedAt: "2026.08.10",
    seat: "J열 12번",
    certificateId: "CHG-260810-0004",
  },
];

export default function CardDemoPage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 overflow-hidden">
      <TicketCarousel tickets={tickets} />
    </main>
  );
}
