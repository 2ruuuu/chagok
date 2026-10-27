import type { Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // iOS는 16px 미만 input에 포커스하면 자동 확대함 → 막음 (iOS는 핀치 줌은 계속 허용)
  maximumScale: 1,
};

const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="flex min-h-dvh min-w-93.75 flex-col">{children}</body>
    </html>
  );
};

export default RootLayout;
