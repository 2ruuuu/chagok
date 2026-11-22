"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { SPLASH_LOGO_DATA_URL } from "./logoDataUrl";

/** 로고 연출을 시작한 뒤 사라지기 시작할 때까지 (ms). 연출(약 0.9초)이 끝나고 잠깐 머무름 */
const PLAY_MS = 1800;
/** 사라지는 시간 (className의 duration-400과 맞춤) */
const FADE_MS = 400;

/** 홈 화면 앱(PWA)으로 열었는지. iOS 예전 버전은 navigator.standalone만 있음 */
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && navigator.standalone === true);

/**
 * 스플래시 화면 (검은 배경 + 가운데 로고). 홈 화면 앱(PWA)으로 열 때만 나옴.
 * - 웹사이트(브라우저)로 열면 CSS로 처음부터 숨김 ([@media(display-mode:standalone)]:flex)
 * - 서버 HTML에 처음부터 들어 있어서 JS가 뜨기 전에도 보임 -> 검은 iOS 시작 이미지(public/splash)에서 바로 이어짐
 * - 로고 연출: chagok 로고가 살짝 아래에서 커지며 떠오름 (card-effects.css splash-logo-in)
 * - 연출은 화면이 붙은 뒤(data-playing)에 시작: CSS만으로 바로 돌리면 iOS가 앱 화면을 보여주기 전에
 *   (개발 서버 로딩 등) 이미 끝나 버려서 완성된 로고만 보였음
 * - 동작 줄이기 설정이면 완성된 로고만 보임
 * - 새로고침이면 layout.tsx의 head 스크립트가 그리기 전에 html[data-splash=off]를 달아 숨김
 * - 앱 안에서 화면을 옮길 때는 루트 레이아웃이 다시 안 그려지므로 안 나옴
 * - 끝나면 html[data-splash-done]을 달아 head의 임시 검은 배경을 걷음
 */
const Splash = () => {
  const [phase, setPhase] = useState<"shown" | "leaving" | "done">("shown");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const finish = () => {
      root.dataset.splashDone = "";
      setPhase("done");
    };

    if (root.dataset.splash === "off" || !isStandalone()) {
      finish();
      return;
    }
    // 화면이 실제로 그려진 다음 프레임에 연출 시작 (rAF 두 번)
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        setPlaying(true);
        leaveTimer = setTimeout(() => {
          setPhase("leaving");
          doneTimer = setTimeout(finish, FADE_MS);
        }, PLAY_MS);
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-100 hidden items-center justify-center bg-static-black transition-opacity duration-400 motion-reduce:transition-none [@media(display-mode:standalone)]:flex [html[data-splash=off]_&]:hidden",
        phase === "leaving" && "pointer-events-none opacity-0",
      )}
    >
      {/* data URL이라 next/image 대신 img */}
      {/* biome-ignore lint/performance/noImgElement: HTML에 바로 들어간 data URL이라 next/image로 받을 필요 없음 (깜빡임 방지) */}
      <img
        data-playing={playing ? "" : undefined}
        src={SPLASH_LOGO_DATA_URL}
        alt=""
        width={172}
        height={65}
        className="w-43 motion-safe:opacity-0 motion-safe:data-[playing]:animate-splash-logo-in"
      />
    </div>
  );
};

export default Splash;
