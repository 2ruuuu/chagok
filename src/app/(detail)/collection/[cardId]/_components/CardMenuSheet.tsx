"use client";

import Image, { type StaticImageData } from "next/image";
import ImageSaveIcon from "@/assets/icons/image-save.svg";
import PencilIcon from "@/assets/icons/pencil.svg";
import ShareIcon from "@/assets/icons/share.svg";
import TrashIcon from "@/assets/icons/trash-red.svg";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import { cn } from "@/lib/cn";

const TITLE_ID = "card-menu-sheet-title";

interface CardMenuSheetProps {
  open: boolean;
  onClose: () => void;
  /** 카드 삭제를 누르면 (시트를 닫고 확인 창 띄우기) */
  onDelete: () => void;
}

interface MenuItemProps {
  icon: StaticImageData;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const MenuItem = ({ icon, label, onClick, danger }: MenuItemProps) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left text-body1 outline-none focus-visible:outline-2 focus-visible:outline-primary-40",
        danger ? "text-status-danger" : "text-neutral-15",
      )}
    >
      <Image src={icon} alt="" aria-hidden className="size-4" />
      {label}
    </button>
  </li>
);

/** 카드 상세의 ⋮ 메뉴 */
const CardMenuSheet = ({ open, onClose, onDelete }: CardMenuSheetProps) => {
  // TODO: 관람평 수정 · 이미지로 저장 · 공유하기 동작 (지금은 시트만 닫힘)
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      labelledBy={TITLE_ID}
      className="bg-neutral-80 px-5 text-static-white"
    >
      <h2 id={TITLE_ID} className="sr-only">
        카드 메뉴
      </h2>
      <ul className="mt-4 flex flex-col">
        <MenuItem icon={PencilIcon} label="관람평 수정" onClick={onClose} />
        <MenuItem
          icon={ImageSaveIcon}
          label="이미지로 저장"
          onClick={onClose}
        />
        <MenuItem icon={ShareIcon} label="공유하기" onClick={onClose} />
      </ul>
      <ul className="mt-3">
        <MenuItem
          icon={TrashIcon}
          label="카드 삭제"
          onClick={onDelete}
          danger
        />
      </ul>
    </BottomSheet>
  );
};

export default CardMenuSheet;
