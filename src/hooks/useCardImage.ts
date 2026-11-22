"use client";

import { useEffect, useRef, useState } from "react";
import {
  canShareImageFiles,
  downloadFile,
  fetchCardImage,
} from "@/lib/card-image/client";

const TOAST_DURATION_MS = 2000;
const IMAGE_ERROR = "이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.";

/**
 * 카드 이미지로 저장 · 공유하기 (발급 완료 · 카드 상세 공통).
 * 이미지는 한 번만 받아 두고 저장 · 공유에 같이 씀.
 * 공유: 시트를 먼저 열고 미리보기를 받아 둠 -> 시트의 [공유하기] 탭으로 OS 공유 창 (탭 직후에만 열 수 있어서)
 * cardId가 null(목 발급)이면 토스트만
 */
export const useCardImage = (cardId: string | null, certificateId: string) => {
  const [canShare, setCanShare] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 공유 가능 여부는 브라우저에서만 알 수 있음 (서버 렌더와 맞추려고 처음엔 숨김)
  useEffect(() => {
    setCanShare(canShareImageFiles());
  }, []);

  // 미리보기 blob URL은 바뀌거나 화면을 떠날 때 해제
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
  };

  const loadImage = async () => {
    if (imageFile) return imageFile;
    if (!cardId) {
      showToast("카드 정보를 찾을 수 없어요.");
      return null;
    }
    try {
      const file = await fetchCardImage(cardId, certificateId);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      return file;
    } catch (error) {
      console.error(error);
      showToast(IMAGE_ERROR);
      return null;
    }
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    const file = await loadImage();
    setBusy(false);
    if (file) downloadFile(file);
  };

  const openShare = async () => {
    setSheetOpen(true);
    const file = await loadImage();
    if (!file) setSheetOpen(false);
  };

  const share = async () => {
    if (!imageFile || busy) return;
    setBusy(true);
    try {
      await navigator.share({ files: [imageFile] });
      setSheetOpen(false);
    } catch (error) {
      // 사용자가 공유 창을 닫은 건 실패가 아님
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error(error);
        showToast("공유하지 못했어요. 이미지로 저장해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  };

  return {
    /** 이미지 공유가 되는 브라우저인지 (아니면 공유하기 숨김) */
    canShare,
    busy,
    toastMessage,
    save,
    openShare,
    /** ShareCardSheet에 그대로 넘김 */
    sheet: {
      open: sheetOpen,
      onClose: () => setSheetOpen(false),
      previewUrl,
      sharing: busy,
      onShare: share,
    },
  };
};
