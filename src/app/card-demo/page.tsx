import hopePoster from "@/assets/imgs/hope-poster.png";
import { type Ticket, TicketCard } from "@/components/ticket-card/TicketCard";

const ticket: Ticket = {
  title: "호프",
  originalTitle: "HOPE",
  poster: hopePoster,
  format: "IMAX",
  theater: "CGV 용산아이파크몰",
  screen: "IMAX관",
  watchedAt: "2026.07.15",
  showtime: "19:30",
  seat: "H열 14번",
  certificateId: "CHG-260715-0001",
};

export default function CardDemoPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden px-5 py-16">
      <TicketCard ticket={ticket} />
      <p className="text-caption1 text-neutral-40">
        카드를 움직여보고, 눌러서 뒤집어보세요
      </p>
    </main>
  );
}
