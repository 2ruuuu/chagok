"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import BackButton from "@/components/back-button/BackButton";
import TermsContent from "@/components/terms-content/TermsContent";
import type { TermsDoc } from "@/constants/terms";

type TermsDetailProps = {
  doc: TermsDoc;
  onClose: () => void;
};

/**
 * 약관 시트에서 '>'를 누르면 시트 위에 전체 화면으로 열리는 약관 본문.
 * 페이지 이동이 아니라 오버레이라서 닫아도 시트의 체크 상태가 유지됨.
 */
const TermsDetail = ({ doc, onClose }: TermsDetailProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null;
    headingRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      returnFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-detail-title"
      className="fixed inset-0 z-60 overflow-y-auto bg-secondary-100"
    >
      <div className="mx-auto flex w-full max-w-107.5 flex-col px-5 pb-14">
        <div className="sticky top-0 flex w-full justify-start bg-secondary-100 py-2">
          <BackButton onClick={onClose} />
        </div>
        <h1
          ref={headingRef}
          id="terms-detail-title"
          tabIndex={-1}
          className="pt-4 pb-6 text-heading2 outline-none"
        >
          {doc.title}
        </h1>
        <TermsContent doc={doc} />
      </div>
    </div>,
    document.body,
  );
};

export default TermsDetail;
