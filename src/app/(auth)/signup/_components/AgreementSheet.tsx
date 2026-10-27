"use client";

import Image from "next/image";
import { useState } from "react";
import Check from "@/assets/icons/check.svg";
import CheckActive from "@/assets/icons/check-active.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import { Button } from "@/components/button/Button";
import Toast from "@/components/toast/Toast";
import { TERMS, type TermsSlug } from "@/constants/terms";
import { cn } from "@/lib/cn";
import TermsDetail from "./TermsDetail";

export type AgreementKey = "age" | "terms" | "privacy" | "marketing";
export type Agreements = Record<AgreementKey, boolean>;

const ITEMS: {
  key: AgreementKey;
  label: string;
  required: boolean;
  /** 상세 보기할 약관. 없으면 '>' 없음 */
  doc: TermsSlug | null;
}[] = [
  { key: "age", label: "만 14세 이상입니다", required: true, doc: null },
  { key: "terms", label: "서비스 이용약관", required: true, doc: "service" },
  {
    key: "privacy",
    label: "개인정보 수집·이용 동의",
    required: true,
    doc: "privacy",
  },
  {
    key: "marketing",
    label: "마케팅 정보 수신 동의",
    required: false,
    doc: "marketing",
  },
];

const REQUIRED_KEYS = ITEMS.filter((item) => item.required).map(
  (item) => item.key,
);

const INITIAL_AGREEMENTS: Agreements = {
  age: false,
  terms: false,
  privacy: false,
  // 선택 항목은 기본값 체크 해제 (미리 체크해 두면 안 됨)
  marketing: false,
};

type CheckRowProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size: "lg" | "sm";
  disabled?: boolean;
};

/** 체크 아이콘 + 라벨. 실제 체크박스는 시각적으로 숨기고 라벨 전체를 누를 수 있게 함 */
const CheckRow = ({
  id,
  checked,
  onChange,
  label,
  size,
  disabled,
}: CheckRowProps) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex flex-1 cursor-pointer items-center gap-3",
        disabled && "cursor-default",
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="flex size-6 shrink-0 items-center justify-center rounded-xs peer-focus-visible:outline-2 peer-focus-visible:outline-primary-40">
        {/* svg는 색이 파일에 고정돼 있어서 체크 여부에 따라 파일을 바꿔 씀 */}
        <Image
          src={checked ? CheckActive : Check}
          alt=""
          aria-hidden
          className={size === "lg" ? "size-6" : "size-4"}
        />
      </span>
      <span
        className={cn(
          size === "lg"
            ? "text-label1 text-label-normal"
            : "text-body2 font-medium text-label-neutral",
        )}
      >
        {label}
      </span>
    </label>
  );
};

type AgreementSheetProps = {
  open: boolean;
  onClose: () => void;
  /** [동의하고 인증 번호 받기]. 필수 항목이 모두 체크됐을 때만 호출됨 */
  onSubmit: (agreements: Agreements) => void;
  /** true면 버튼·체크박스 비활성 + 배경 탭/ESC로 닫히지 않음 (요청 중, 발송 완료 후 등) */
  disabled?: boolean;
  /** 시트 위에 띄울 토스트 메시지 (예: "인증 번호를 보냈어요."). null이면 숨김 */
  toastMessage?: string | null;
};

/** 약관 동의 바텀시트. 동의 상태만 관리하고, 제출 후 처리는 쓰는 쪽에서 함 */
const AgreementSheet = ({
  open,
  onClose,
  onSubmit,
  disabled = false,
  toastMessage = null,
}: AgreementSheetProps) => {
  const [agreements, setAgreements] = useState(INITIAL_AGREEMENTS);
  const [detail, setDetail] = useState<TermsSlug | null>(null);

  const allRequired = REQUIRED_KEYS.every((key) => agreements[key]);

  const setAgreement = (key: AgreementKey, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }));
  };

  // '필수 약관 전체 동의'는 필수 항목만 바꿈 (선택 항목은 따로 동의받아야 함)
  const setAllRequired = (checked: boolean) => {
    setAgreements((prev) => ({
      ...prev,
      ...Object.fromEntries(REQUIRED_KEYS.map((key) => [key, checked])),
    }));
  };

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        labelledBy="agreement-sheet-title"
        dismissible={!detail && !disabled}
        above={<Toast message={toastMessage} />}
        className="px-5"
      >
        <h2
          id="agreement-sheet-title"
          className="px-2 pt-8 pb-5 text-heading2 font-semibold"
        >
          서비스 이용에
          <br />꼭 필요한 동의만 추렸어요
        </h2>

        <div className="border-b border-line-alternative px-2 py-3">
          <CheckRow
            id="agree-all-required"
            size="lg"
            label="필수 약관 전체 동의"
            checked={allRequired}
            onChange={setAllRequired}
            disabled={disabled}
          />
        </div>

        <ul className="flex flex-col py-1">
          {ITEMS.map((item) => (
            <li key={item.key} className="flex h-9 items-center px-2">
              <CheckRow
                id={`agree-${item.key}`}
                size="sm"
                label={`${item.label} (${item.required ? "필수" : "선택"})`}
                checked={agreements[item.key]}
                onChange={(checked) => setAgreement(item.key, checked)}
                disabled={disabled}
              />
              {item.doc && (
                <button
                  type="button"
                  aria-label={`${TERMS[item.doc].title} 보기`}
                  className="-mr-1 flex size-8 cursor-pointer items-center justify-center rounded-xs text-label-alternative outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
                  onClick={() => setDetail(item.doc)}
                >
                  <Image
                    src={ChevronRight}
                    alt=""
                    aria-hidden
                    className="size-5"
                  />
                </button>
              )}
            </li>
          ))}
        </ul>

        <Button
          className="mt-5 disabled:bg-primary-30"
          disabled={!allRequired || disabled}
          onClick={() => onSubmit(agreements)}
        >
          동의하고 인증 번호 받기
        </Button>
      </BottomSheet>

      {detail && (
        <TermsDetail doc={TERMS[detail]} onClose={() => setDetail(null)} />
      )}
    </>
  );
};

export default AgreementSheet;
