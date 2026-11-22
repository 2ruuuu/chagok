/**
 * 카드 공유 · 저장 이미지 (서버가 만든 PNG, /api/cards/[cardId]/image) 브라우저 쪽 유틸.
 * 화면에서는 hooks/useCardImage로 씀 (발급 완료 · 카드 상세)
 */

/** 받은 이미지를 파일로 (공유 창 · 저장에 그대로 씀). 실패하면 throw */
export const fetchCardImage = async (cardId: string, certificateId: string) => {
  const response = await fetch(`/api/cards/${cardId}/image`);
  if (!response.ok) throw new Error(`카드 이미지 실패: ${response.status}`);
  const blob = await response.blob();
  return new File([blob], `chagok-${certificateId || "card"}.png`, {
    type: "image/png",
  });
};

/** 파일로 내려받기 (iOS Safari는 "파일" 앱에 저장됨, 사진 앱에 넣으려면 공유 창의 "이미지 저장") */
export const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  // 클릭 직후 바로 해제하면 일부 브라우저에서 다운로드가 끊겨서 조금 뒤에
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** 이미지 파일을 OS 공유 창으로 보낼 수 있는 브라우저인지 (데스크톱 대부분은 안 됨 -> 저장만) */
export const canShareImageFiles = () => {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    return navigator.canShare({
      files: [new File([""], "card.png", { type: "image/png" })],
    });
  } catch {
    return false;
  }
};
