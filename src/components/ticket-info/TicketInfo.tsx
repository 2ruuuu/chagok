import { Fragment } from "react";
import type { Ticket } from "@/components/ticket-card/TicketCard";

interface TicketInfoProps {
  ticket: Pick<Ticket, "title" | "releasedAt" | "country" | "genres">;
}

/** 티켓 카드 아래 제목 + 개봉일 | 국가 | 장르 (홈 캐러셀, 카드 상세) */
const TicketInfo = ({ ticket }: TicketInfoProps) => {
  const meta = [ticket.releasedAt, ticket.country, ticket.genres.join(", ")];

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-heading2 font-bold text-static-white">
        {ticket.title}
      </p>
      <p className="flex items-center gap-2 text-label2 text-neutral-30">
        {meta.map((text, i) => (
          <Fragment key={text}>
            {i > 0 && <span aria-hidden className="h-3 w-px bg-neutral-60" />}
            <span>{text}</span>
          </Fragment>
        ))}
      </p>
    </div>
  );
};

export default TicketInfo;
