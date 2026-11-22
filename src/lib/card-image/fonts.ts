/**
 * 공유 이미지(next/og)용 한글 폰트.
 * next/og는 woff2를 못 읽어서 src/assets/fonts의 PretendardVariable.woff2를 못 씀 -> CDN의 Pretendard otf를 받아 씀
 * 서버 인스턴스마다 처음 한 번만 받고(fetch 캐시 + 모듈 변수), 실패하면 다음 요청에서 다시 시도
 */

// gh 경로는 저장소가 50MB를 넘어 막힘 -> npm 패키지 경로 (파일당 약 1.5MB, Next fetch 캐시 2MB 제한 안쪽)
const FONT_BASE_URL =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static";

const WEIGHTS = [
  { weight: 400, file: "Pretendard-Regular.otf" },
  { weight: 600, file: "Pretendard-SemiBold.otf" },
] as const;

export type CardImageFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: "normal";
};

let fontsPromise: Promise<CardImageFont[]> | null = null;

const fetchFont = async (file: string) => {
  const response = await fetch(`${FONT_BASE_URL}/${file}`, {
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new Error(`폰트를 받지 못했어요: ${file} (${response.status})`);
  }
  return response.arrayBuffer();
};

export const loadCardImageFonts = () => {
  fontsPromise ??= Promise.all(
    WEIGHTS.map(async ({ weight, file }) => ({
      name: "Pretendard",
      data: await fetchFont(file),
      weight,
      style: "normal" as const,
    })),
  ).catch((error) => {
    fontsPromise = null;
    throw error;
  });
  return fontsPromise;
};
