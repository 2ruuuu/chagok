/** 긴 변 최대 길이 (px). 번호 오독이 없던 해상도 + Vercel 요청 본문 4.5MB 제한 안쪽 */
const MAX_LONG_SIDE = 1600;
const JPEG_QUALITY = 0.85;

/**
 * 인식 요청 전에 사진을 긴 변 1600px jpeg로 줄임 (ticket-verify.md "업로드")
 * 폰 원본(수 MB, HEIC 등)을 그대로 보내지 않게. 이미지로 읽을 수 없는 파일이면 null
 */
export const compressTicketImage = async (file: File): Promise<File | null> => {
  let bitmap: ImageBitmap;
  try {
    // imageOrientation: 사진 회전 정보(EXIF)대로 바로 세움
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }

  const scale = Math.min(
    1,
    MAX_LONG_SIDE / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return null;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) return null;
  return new File([blob], "ticket.jpg", { type: "image/jpeg" });
};
