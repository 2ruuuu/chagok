"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";
import {
  type RecognizedTicket,
  useVerifyStore,
} from "../_stores/useVerifyStore";

const subscribeNothing = () => () => {};

interface VerifyStepGuardProps {
  /**
   * draft: 인식한 티켓이 있고 아직 발급 전이어야 함 (확인 · 별점 · 리뷰 · 메모)
   * issued: 발급이 끝난 상태여야 함 (발급 완료)
   */
  require: "draft" | "issued";
  children: (ticket: RecognizedTicket) => ReactNode;
}

/**
 * 인증 단계 화면 진입 조건 확인.
 * 진행 중인 인증이 없거나(중간 단계 URL로 바로 들어옴) 30분이 지났으면 시작 화면으로 보냄.
 * 진행 상태는 sessionStorage에 있어서 서버 렌더에는 없음 -> 브라우저에서 준비된 뒤에만 그림.
 */
const VerifyStepGuard = ({ require, children }: VerifyStepGuardProps) => {
  const router = useRouter();
  const ticket = useVerifyStore((state) => state.ticket);
  const expiresAt = useVerifyStore((state) => state.expiresAt);
  const issued = useVerifyStore((state) => state.issued);
  const reset = useVerifyStore((state) => state.reset);

  // 서버 렌더 · 첫 렌더에서는 false, 브라우저에 붙은 뒤 true
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const allowed = ticket !== null && (require === "issued" ? issued : !issued);

  useEffect(() => {
    if (!mounted) return;
    const expired =
      require === "draft" && expiresAt !== null && expiresAt < Date.now();
    if (expired) reset();
    if (allowed && !expired) return;
    // 발급을 마친 뒤 이전 단계로 돌아오면 발급 완료 화면으로, 그 외에는 시작 화면으로
    const done = require === "draft" && ticket !== null && issued;
    router.replace(done && !expired ? "/verify/complete" : "/verify");
  }, [mounted, allowed, expiresAt, issued, require, reset, router, ticket]);

  if (!mounted || !allowed) return null;

  return children(ticket);
};

export default VerifyStepGuard;
