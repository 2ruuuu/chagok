"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 제목 요소의 id (스크린 리더가 창 이름으로 읽음) */
  labelledBy?: string;
  /** 설명 요소의 id */
  describedBy?: string;
  className?: string;
}

/**
 * 화면 가운데 확인 창 (삭제 확인 등).
 * 네이티브 <dialog>의 showModal 사용 → 포커스 가두기 · 뒤 화면 막기 · ESC 닫기를 브라우저가 해줌
 */
const Dialog = ({
  open,
  onClose,
  children,
  labelledBy,
  describedBy,
  className,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      // ESC: 브라우저가 바로 닫지 않게 막고 open 상태를 부모가 바꾸게 함
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2.5rem)] max-w-83.75 rounded-2xl bg-neutral-80 p-5 text-static-white backdrop:bg-material-dimmer",
        className,
      )}
    >
      {children}
    </dialog>
  );
};

export default Dialog;
