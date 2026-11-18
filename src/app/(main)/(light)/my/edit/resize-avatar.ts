import { AVATAR_SIZE } from "@/lib/avatar";

/**
 * 고른 사진을 가운데 정사각형으로 잘라 512px jpeg로 줄임.
 * 폰 사진(수 MB)을 그대로 올리지 않도록 + 화면에 보이는 모양(가운데 원)과 맞춤.
 * 이미지로 읽을 수 없는 파일이면 null
 */
export const resizeAvatar = async (file: File): Promise<File | null> => {
  let bitmap: ImageBitmap;
  try {
    // imageOrientation: 사진 회전 정보(EXIF)대로 바로 세움
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  const size = Math.min(AVATAR_SIZE, side);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return null;
  }
  context.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) return null;
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
};
