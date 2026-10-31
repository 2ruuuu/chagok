"use client";

import BottomSheet from "@/components/bottom-sheet/BottomSheet";

const TITLE_ID = "avatar-sheet-title";

interface AvatarSheetProps {
  open: boolean;
  onClose: () => void;
  onPickAlbum: () => void;
  /** 넘기면 [기본 이미지로 변경] 표시 (지금 기본 이미지면 안 넘김) */
  onResetDefault?: () => void;
}

const ITEM_CLASS =
  "flex h-12 w-full cursor-pointer items-center rounded-lg px-2 text-left text-body1 text-label-normal outline-none focus-visible:outline-2 focus-visible:outline-primary-40";

/** 프로필 사진 연필 배지를 누르면 뜨는 시트 */
const AvatarSheet = ({
  open,
  onClose,
  onPickAlbum,
  onResetDefault,
}: AvatarSheetProps) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      labelledBy={TITLE_ID}
      className="px-5"
    >
      <h2 id={TITLE_ID} className="mt-4 px-2 text-heading3 font-semibold">
        프로필 사진
      </h2>
      <ul className="mt-3 flex flex-col">
        <li>
          <button type="button" onClick={onPickAlbum} className={ITEM_CLASS}>
            앨범에서 선택
          </button>
        </li>
        {onResetDefault && (
          <li>
            <button
              type="button"
              onClick={onResetDefault}
              className={ITEM_CLASS}
            >
              기본 이미지로 변경
            </button>
          </li>
        )}
      </ul>
    </BottomSheet>
  );
};

export default AvatarSheet;
