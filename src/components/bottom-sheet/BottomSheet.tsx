"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

// transition 시간 (className의 duration-300과 맞춤)
const TRANSITION_MS = 300;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 시트 제목 요소의 id (스크린 리더가 시트 이름으로 읽음) */
  labelledBy?: string;
  /** false면 배경 탭·ESC로 닫히지 않음 (요청 처리 중 등) */
  dismissible?: boolean;
  /** 시트 바로 위에 붙는 영역 (토스트 등). 시트와 함께 움직임 */
  above?: ReactNode;
  className?: string;
};

/**
 * 화면 하단에서 올라오는 시트.
 * - body에 포털로 렌더링, 열려 있는 동안 뒤 페이지 스크롤 잠금
 * - 열리면 시트로 포커스 이동, Tab은 시트 안에서만 순환, 닫히면 원래 위치로 포커스 복귀
 * - 배경 탭 / ESC로 닫기 (dismissible)
 */
const BottomSheet = ({
  open,
  onClose,
  children,
  labelledBy,
  dismissible = true,
  above,
  className,
}: BottomSheetProps) => {
  // rendered: DOM에 있는지 / visible: 올라온 상태인지 (닫힐 때 애니메이션 후 제거)
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setRendered(true);
      // 아래에 있는 상태가 한 번 그려진 뒤 올려야 transition이 동작함
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setVisible(false);
    const timer = setTimeout(() => {
      setRendered(false);
      returnFocusRef.current?.focus();
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // 뒤 페이지 스크롤 잠금
  useEffect(() => {
    if (!rendered) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [rendered]);

  useEffect(() => {
    if (visible) {
      panelRef.current?.focus();
    }
  }, [visible]);

  useEffect(() => {
    if (!open || !dismissible) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, dismissible, onClose]);

  // Tab 포커스를 시트 안에 가둠
  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusables = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!rendered || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-material-dimmer transition-opacity duration-300 motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={dismissible ? onClose : undefined}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto w-full max-w-107.5 transition-transform duration-300 ease-out motion-reduce:transition-none",
          visible ? "translate-y-0" : "translate-y-full",
        )}
      >
        {above && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center pb-4">
            {above}
          </div>
        )}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
          className={cn(
            "rounded-t-3xl bg-background-elevated-normal pb-[max(2rem,env(safe-area-inset-bottom))] text-label-normal outline-none",
            className,
          )}
        >
          <div className="flex justify-center pt-3" aria-hidden="true">
            <span className="h-1 w-10 rounded-full bg-neutral-10" />
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default BottomSheet;
