import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Splash from "@/components/splash/Splash";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 브라우저 주소창 · 상태 바 색 (스플래시와 같은 검정)
  themeColor: "#000000",
  // iOS는 16px 미만 input에 포커스하면 자동 확대함 → 막음 (iOS는 핀치 줌은 계속 허용)
  maximumScale: 1,
};

/**
 * iOS 홈 화면 앱을 열 때 웹 화면이 뜨기 전에 보이는 시작 이미지 (없으면 흰 화면).
 * 기기 화면 크기마다 정확히 맞는 이미지가 있어야 해서 아이폰 크기별로 만들어 둠 (public/splash/)
 * [CSS 폭, CSS 높이, 픽셀 배율, 파일 크기]. 검은색만 (로고를 넣으면 웹 스플래시 로고와 겹쳐 두 번 뜨는 것처럼 보여서 뺌)
 * TODO: 새 아이폰 크기가 나오면 추가. 아이패드는 아직 없음
 */
const IOS_STARTUP_IMAGES = [
  [375, 667, 2, "750x1334"],
  [414, 736, 3, "1242x2208"],
  [375, 812, 3, "1125x2436"],
  [414, 896, 2, "828x1792"],
  [414, 896, 3, "1242x2688"],
  [390, 844, 3, "1170x2532"],
  [428, 926, 3, "1284x2778"],
  [393, 852, 3, "1179x2556"],
  [430, 932, 3, "1290x2796"],
  [402, 874, 3, "1206x2622"],
  [440, 956, 3, "1320x2868"],
  [420, 912, 3, "1260x2736"],
] as const;

/**
 * iOS 홈 화면 앱 태그 · 아이콘 · OG 태그는 metadata 대신 아래 <head>에 직접 씀.
 * Next 16은 동적 페이지의 metadata를 나중에 body로 흘려보낼 수 있는데(streaming metadata),
 * iOS(홈 화면 추가)와 카카오톡 같은 링크 미리보기는 첫 HTML의 head만 읽기 때문
 */
export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

/** 링크 공유 이미지 (public/og.jpg, 1200×630). 로고로 만든 임시 이미지, 시안이 오면 같은 이름으로 교체 */
const OG_IMAGE = { url: `${SITE_URL}/og.jpg`, width: 1200, height: 630 };

/**
 * 새로고침이면 스플래시를 그리기 전에 숨김 (components/splash/Splash.tsx).
 * React가 뜨기 전에 실행돼야 해서 head의 인라인 스크립트로 둠
 */
const SKIP_SPLASH_ON_RELOAD = `try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload")document.documentElement.dataset.splash="off"}catch(e){}`;

/**
 * 홈 화면 앱으로 열 때 CSS 파일이 오기 전 첫 그림이 흰색이 되지 않도록 html을 먼저 검게 칠함.
 * 스플래시가 끝나면(html[data-splash-done]) 원래 배경(globals.css의 body)으로 돌아감
 */
const STANDALONE_LAUNCH_STYLE =
  "@media (display-mode: standalone){html:not([data-splash-done]){background:#000}}";

const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    // suppressHydrationWarning: head 스크립트가 React보다 먼저 html에 data-splash를 달 수 있어서
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 고정 문자열 스크립트 (사용자 입력 없음) */}
        <script dangerouslySetInnerHTML={{ __html: SKIP_SPLASH_ON_RELOAD }} />
        <style>{STANDALONE_LAUNCH_STYLE}</style>
        {/* 아이콘 (public/icons, 원본 chagok-app-logo.png). 탭 아이콘(32)만 마크가 보이게 가운데를 잘라 크게 씀 */}
        <link rel="icon" href="/icons/icon-32.png" sizes="32x32" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
        {/* 링크 미리보기 (카카오톡 · 페이스북 · 슬랙 등은 og, X는 twitter) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_NAME} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE.url} />
        <meta property="og:image:width" content={String(OG_IMAGE.width)} />
        <meta property="og:image:height" content={String(OG_IMAGE.height)} />
        <meta property="og:image:alt" content={`${SITE_NAME} 로고`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_NAME} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE.url} />
        {/* iOS 홈 화면 앱 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        {/* 상태 바 검정, 웹 화면은 상태 바 아래부터 (translucent로 바꾸면 화면 위쪽 safe area 처리 필요) */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        {IOS_STARTUP_IMAGES.map(([width, height, ratio, size]) => (
          <link
            key={size}
            rel="apple-touch-startup-image"
            href={`/splash/splash-${size}.png`}
            media={`(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`}
          />
        ))}
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Splash />
      </body>
    </html>
  );
};

export default RootLayout;
