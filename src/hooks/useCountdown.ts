"use client";

import { useEffect, useState } from "react";

/**
 * 마운트 시점부터 `seconds`초 카운트다운. 남은 초를 돌려줌.
 * 1초씩 빼지 않고 종료 시각과의 차이로 계산하므로, 탭이 백그라운드에 있어
 * interval이 늦게 돌아도 시간이 어긋나지 않음.
 * `restart()`로 처음부터 다시 셈 (인증번호 재전송 등).
 */
export const useCountdown = (seconds: number) => {
  const [endAt, setEndAt] = useState(() => Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        clearInterval(timer);
      }
    };
    const timer = setInterval(tick, 250);
    tick();
    return () => clearInterval(timer);
  }, [endAt]);

  const restart = () => {
    setRemaining(seconds);
    setEndAt(Date.now() + seconds * 1000);
  };

  return { remaining, isExpired: remaining === 0, restart };
};

/** 초 → "04:59" */
export const formatMinutesSeconds = (totalSeconds: number) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
};
