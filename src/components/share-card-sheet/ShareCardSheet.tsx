"use client";

import Image from "next/image";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import Button from "@/components/button/Button";

const TITLE_ID = "share-card-title";

interface ShareCardSheetProps {
  open: boolean;
  onClose: () => void;
  /** 미리보기 (blob URL). 아직 받는 중이면 null */
  previewUrl: string | null;
  sharing: boolean;
  onShare: () => void;
}

/**
 * 카드 공유하기 바텀시트: 공유할 이미지를 미리 보여주고 [공유하기]로 OS 공유 창을 엶 (발급 완료 · 카드 상세, hooks/useCardImage).
 * 이미지를 미리 받아 두는 이유: 공유 창은 탭한 직후에만 열 수 있어서, 탭한 뒤에 이미지를 받으면 막힘
 * TODO: 시안 없음
 */
const ShareCardSheet = ({
  open,
  onClose,
  previewUrl,
  sharing,
  onShare,
}: ShareCardSheetProps) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      labelledBy={TITLE_ID}
      className="bg-neutral-80 px-5 text-static-white"
    >
      <h2 id={TITLE_ID} className="mt-6 text-heading2 font-semibold">
        카드 공유하기
      </h2>
      <div className="relative mx-auto mt-4 aspect-9/16 w-40 overflow-hidden rounded-lg bg-common-0/10">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="공유할 카드 이미지 미리보기"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-caption1 text-neutral-30">
            이미지를 만들고 있어요
          </p>
        )}
      </div>
      <div className="mt-5 flex gap-2.5">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          닫기
        </Button>
        <Button
          type="button"
          variant={previewUrl && !sharing ? "primary" : "disable"}
          disabled={!previewUrl || sharing}
          className="flex-1"
          onClick={onShare}
        >
          공유하기
        </Button>
      </div>
    </BottomSheet>
  );
};

export default ShareCardSheet;
