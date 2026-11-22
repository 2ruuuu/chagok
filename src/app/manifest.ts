import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/constants/site";

/**
 * PWA 설정 (홈 화면에 추가했을 때).
 * background_color: 앱을 열 때 안드로이드가 그리는 시작 화면 배경 -> 스플래시와 같은 검정
 * 아이콘: public/icons (원본 src/assets/imgs/chagok-app-logo.png 4096px을 크기별로 줄인 것)
 * 시안은 마크가 34%라 작아서, 가운데를 잘라 마크가 50%가 되게 키움 (icon-32는 70%)
 * maskable: 안드로이드가 원 · 둥근 사각형으로 자르는 버전. 마크 50%여도 안전 영역(80%) 안이라 같은 그림 사용
 */
const manifest = (): MetadataRoute.Manifest => ({
  name: SITE_NAME,
  short_name: SITE_NAME,
  description: SITE_DESCRIPTION,
  start_url: "/",
  display: "standalone",
  background_color: "#000000",
  theme_color: "#000000",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    {
      src: "/icons/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
});

export default manifest;
