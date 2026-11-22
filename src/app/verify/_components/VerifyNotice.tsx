import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import VerifyHeader from "./VerifyHeader";

interface VerifyNoticeProps {
  /** 원 안에 들어가는 아이콘 (svg) */
  icon: StaticImageData;
  title: string;
  description: ReactNode;
  /** 다시 찍을 때 확인할 것 (티켓을 알아보지 못했을 때) */
  tips?: string[];
  /** 하단 버튼들 */
  actions: ReactNode;
  onBack?: () => void;
}

/**
 * 티켓 인증 안내 화면 공통 틀 (인식 실패 · 이미 인증된 티켓 · 자동 인증이 어려운 티켓 · 연결 오류 · 확인 요청 완료).
 * 가운데 아이콘 + 제목 + 설명, 아래 버튼.
 */
const VerifyNotice = ({
  icon,
  title,
  description,
  tips,
  actions,
  onBack,
}: VerifyNoticeProps) => {
  return (
    <>
      {onBack ? <VerifyHeader onBack={onBack} /> : <div className="h-12" />}
      <main className="flex flex-1 flex-col items-center justify-center pb-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-common-0/10">
          <Image src={icon} alt="" aria-hidden />
        </span>
        <h1 className="mt-6 text-heading2 font-semibold text-static-white md:text-heading1">
          {title}
        </h1>
        <p className="mt-1 text-body2 text-neutral-10">{description}</p>
        {tips && (
          <ul className="mt-8 flex w-full list-disc flex-col gap-1 rounded-lg border border-line-normal bg-common-0/10 py-4 pr-5 pl-9 text-left text-caption1 text-neutral-10">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}
      </main>
      <div className="mt-5 flex flex-col gap-2.5">{actions}</div>
    </>
  );
};

export default VerifyNotice;
