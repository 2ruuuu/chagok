"use client";

import Image from "next/image";
import ChevronIcon from "@/assets/icons/chevron-left-black.svg";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import Button from "@/components/button/Button";

const TITLE_ID = "info-mismatch-title";

const ROW_CLASS =
  "flex w-full cursor-pointer items-center gap-3 py-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-primary-40";

interface InfoMismatchSheetProps {
  open: boolean;
  onClose: () => void;
  /** 다시 찍기 -> 시작 화면 */
  onRetake: () => void;
  /** 그래도 다르면 -> 확인 요청 (검수) */
  onRequestReview: () => void;
}

/** 관람 정보 확인 화면의 "정보가 다른가요?" 시트. 정보는 직접 고칠 수 없고 다시 찍거나 확인을 요청함 */
const InfoMismatchSheet = ({
  open,
  onClose,
  onRetake,
  onRequestReview,
}: InfoMismatchSheetProps) => {
  return (
    <BottomSheet open={open} onClose={onClose} labelledBy={TITLE_ID}>
      <div className="px-5">
        <h2 id={TITLE_ID} className="mt-6 text-heading2 font-semibold">
          관람 정보가 다른가요?
        </h2>
        <ul className="mt-3">
          <li>
            <button type="button" className={ROW_CLASS} onClick={onRetake}>
              <span className="flex-1">
                <span className="block text-body2 font-medium">
                  📷 티켓을 다시 찍어보세요
                </span>
                <span className="mt-1 block text-caption1 text-label-alternative">
                  티켓 전체가 보이게, 빛 반사 없이 찍으면 대부분 정확하게
                  읽혀요.
                </span>
              </span>
              <Image
                src={ChevronIcon}
                alt=""
                aria-hidden
                className="size-5 rotate-180"
              />
            </button>
          </li>
          <li>
            <button
              type="button"
              className={ROW_CLASS}
              onClick={onRequestReview}
            >
              <span className="flex-1">
                <span className="block text-body2 font-medium">
                  💬 그래도 다르다면 알려주세요
                </span>
                <span className="mt-1 block text-caption1 text-label-alternative">
                  찍은 사진과 함께 접수하면 확인 후 카드를 발급해 드려요.
                </span>
              </span>
              <Image
                src={ChevronIcon}
                alt=""
                aria-hidden
                className="size-5 rotate-180"
              />
            </button>
          </li>
        </ul>
        <Button type="button" className="mt-4" onClick={onClose}>
          닫기
        </Button>
      </div>
    </BottomSheet>
  );
};

export default InfoMismatchSheet;
