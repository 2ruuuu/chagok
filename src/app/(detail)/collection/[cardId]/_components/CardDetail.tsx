"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThreeDotIcon from "@/assets/icons/three-dot.svg";
import CloseIcon from "@/assets/icons/X.svg";
import Button from "@/components/button/Button";
import TicketCard from "@/components/ticket-card/TicketCard";
import TicketInfo from "@/components/ticket-info/TicketInfo";
import type { CollectionCard } from "@/mocks/cards";
import CardMenuSheet from "./CardMenuSheet";
import DeleteCardDialog from "./DeleteCardDialog";

interface CardDetailProps {
  card: CollectionCard;
}

/** 카드 상세: 탭해서 앞/뒷면 뒤집기, ⋮ 메뉴, 컬렉션으로 돌아가기 */
const CardDetail = ({ card }: CardDetailProps) => {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 컬렉션에서 들어왔으면 뒤로가기(연도 탭 · 정렬 유지), 링크로 바로 들어왔으면 컬렉션으로
  const closeToCollection = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/collection");
    }
  };

  // TODO: 카드를 이미지로 저장
  const handleSaveImage = () => {};

  return (
    <>
      <header className="flex h-14 items-center justify-between">
        <button
          type="button"
          aria-label="닫기"
          onClick={closeToCollection}
          className="-ml-1 flex size-8 cursor-pointer items-center justify-center outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
        >
          <Image src={CloseIcon} alt="" aria-hidden className="size-6" />
        </button>
        <button
          type="button"
          aria-label="카드 메뉴"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="-mr-1 flex size-8 cursor-pointer items-center justify-center outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
        >
          <Image src={ThreeDotIcon} alt="" aria-hidden className="size-6" />
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <p aria-hidden className="mt-4 text-label3 text-neutral-60">
          {flipped ? "다시 탭하면 앞면으로" : "탭하면 뒷면으로"}
        </p>
        <div className="mt-7 flex flex-col items-center gap-5">
          <TicketCard
            ticket={card}
            flipped={flipped}
            onFlippedChange={setFlipped}
          />
          <TicketInfo ticket={card} />
        </div>
      </main>

      <div className="flex gap-2.5 pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={handleSaveImage}
        >
          이미지로 저장
        </Button>
        <Button type="button" className="flex-1" onClick={closeToCollection}>
          확인
        </Button>
      </div>

      <CardMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onDelete={() => {
          setMenuOpen(false);
          setDeleteOpen(true);
        }}
      />
      <DeleteCardDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
};

export default CardDetail;
