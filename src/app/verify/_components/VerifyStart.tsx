"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import CameraIcon from "@/assets/icons/camera.svg";
import ImageIcon from "@/assets/icons/image.svg";
import ScanIcon from "@/assets/icons/scan.svg";
import TicketCheckIcon from "@/assets/icons/ticket-check.svg";
import WifiOffIcon from "@/assets/icons/wifi-off.svg";
import ticketReading from "@/assets/imgs/ticket-reading.png";
import Button from "@/components/button/Button";
import Toast from "@/components/toast/Toast";
import { MIN_IMAGE_SHORT_SIDE } from "../_constants";
import {
  getMockRecognizeResult,
  MOCK_RECOGNIZE_MS,
  MOCK_TICKET_ID,
} from "../_mocks/recognized";
import {
  type RecognizeResult,
  useVerifyStore,
} from "../_stores/useVerifyStore";
import { compressTicketImage } from "../_utils/compress-ticket-image";
import { releaseTicket, requestTicketReview } from "../actions";
import ResumeDialog from "./ResumeDialog";
import SampleCardCarousel from "./SampleCardCarousel";
import VerifyHeader from "./VerifyHeader";
import VerifyNotice from "./VerifyNotice";

const TOAST_DURATION_MS = 2000;

// 어두운 화면의 보조 버튼 (앨범에서 업로드 · 취소하기)
const SUB_BUTTON_CLASS =
  "border-line-normal bg-common-0/10 text-body1 font-semibold text-static-white";

const UNREADABLE_TIPS = [
  "티켓 전체가 화면 안에 들어오게",
  "빛 반사 없이 밝은 곳에서",
  "영화 제목 · 일시 · 좌석이 보이게",
  "티켓은 한 장만",
];

type Source = "camera" | "album";
type FailStatus = Exclude<RecognizeResult["status"], "recognized">;
type View = "start" | "reading" | FailStatus;

/** 사진의 짧은 변 길이(px). 브라우저가 못 여는 형식이면 null (검사를 건너뜀) */
const getShortSide = async (file: File) => {
  try {
    const bitmap = await createImageBitmap(file);
    const shortSide = Math.min(bitmap.width, bitmap.height);
    bitmap.close();
    return shortSide;
  } catch {
    return null;
  }
};

/** 작성 중이던 인증을 이어 갈 단계 */
const getResumePath = (rating: number, review: string) => {
  if (rating === 0) return "/verify/confirm";
  if (review.trim() === "") return "/verify/review";
  return "/verify/memo";
};

/**
 * 티켓 인증 시작 화면 + 티켓 읽는 중 + 인식 실패 화면들.
 * 사진은 OS 기본 카메라 · 사진 선택 창으로 받음 (커스텀 카메라 없음).
 * 인식: 사진을 줄여 /api/verify/recognize로 보냄. 개발 모드에서 ?mock=값 이 있으면 목 결과 (ticket-verify.md 구현 상태)
 */
interface VerifyStartProps {
  /** 시작 화면 예시 카드 포스터 3장 (page.tsx에서 박스오피스 포스터, 없으면 가상 포스터) */
  samplePosters: (StaticImageData | string)[];
}

const VerifyStart = ({ samplePosters }: VerifyStartProps) => {
  const router = useRouter();
  const start = useVerifyStore((state) => state.start);
  const reset = useVerifyStore((state) => state.reset);
  const [view, setView] = useState<View>("start");
  const [source, setSource] = useState<Source>("camera");
  // 작성 중이던 인증의 영화 제목. 있으면 "이어서 할까요?"를 물어봄
  const [resumeTitle, setResumeTitle] = useState<string | null>(null);
  // 자동 인증이 어려운 티켓: 인식 때 사진과 함께 잡아 둔 티켓 (확인 요청에 씀)
  const [unsupportedTicketId, setUnsupportedTicketId] = useState<string | null>(
    null,
  );
  const [requesting, startRequest] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 진행 중인 인식 요청. 취소 · 화면 이탈 때 끊음
  const abortRef = useRef<AbortController | null>(null);
  // 연결 오류 때 다시 시도할 사진 (이 화면에 있는 동안만 남음)
  const fileRef = useRef<File | null>(null);
  // 인식 요청 번호. 취소한 뒤 늦게 끝난 요청이 화면을 바꾸지 못하게 함
  const runRef = useRef(0);

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
  };

  // 사진만 접수: 성공하면 액션이 요청 완료 화면으로 보냄
  const requestUnsupportedReview = () => {
    if (!unsupportedTicketId) return;
    if (unsupportedTicketId === MOCK_TICKET_ID) {
      router.replace("/verify/requested");
      return;
    }
    startRequest(async () => {
      const result = await requestTicketReview({
        ticketId: unsupportedTicketId,
        seat: null,
        reported: false,
      });
      if (result?.error) showToast(result.error);
    });
  };

  const stopReading = () => {
    runRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
  };

  // 화면을 떠나면 진행 중인 인식을 멈춤
  useEffect(
    () => () => {
      runRef.current += 1;
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  // 들어왔을 때 작성 중인 인증이 남아 있는지 확인 (sessionStorage라 브라우저에서만 알 수 있음)
  useEffect(() => {
    const state = useVerifyStore.getState();
    if (!state.ticket) return;
    const expired = state.expiresAt !== null && state.expiresAt < Date.now();
    if (state.issued || expired) {
      state.reset();
      return;
    }
    setResumeTitle(state.ticket.title);
  }, []);

  const recognize = async (file: File) => {
    stopReading();
    const run = runRef.current;
    fileRef.current = file;
    setView("reading");

    // 해상도가 낮으면 인식 요청 전에 다시 찍으라고 안내 (비용 안 듦)
    const shortSide = await getShortSide(file);
    if (run !== runRef.current) return;
    if (shortSide !== null && shortSide < MIN_IMAGE_SHORT_SIDE) {
      setView("unreadable");
      return;
    }

    const handleResult = (result: RecognizeResult) => {
      if (result.status === "recognized") {
        start(result.ticket);
        router.push("/verify/confirm");
        return;
      }
      setUnsupportedTicketId(
        result.status === "unsupported" ? result.ticketId : null,
      );
      setView(result.status);
    };

    const scenario =
      process.env.NODE_ENV === "development"
        ? new URLSearchParams(window.location.search).get("mock")
        : null;
    if (scenario !== null) {
      timerRef.current = setTimeout(
        () => handleResult(getMockRecognizeResult(scenario)),
        MOCK_RECOGNIZE_MS,
      );
      return;
    }

    const image = await compressTicketImage(file);
    if (run !== runRef.current) return;
    if (!image) {
      setView("unreadable");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const body = new FormData();
    body.append("image", image);
    try {
      const response = await fetch("/api/verify/recognize", {
        method: "POST",
        body,
        signal: controller.signal,
      });
      if (run !== runRef.current) return;
      if (!response.ok) {
        setView("network");
        return;
      }
      const result: RecognizeResult = await response.json();
      if (run !== runRef.current) return;
      handleResult(result);
    } catch {
      // 취소하기 · 화면 이탈로 끊은 요청은 무시
      if (run !== runRef.current) return;
      setView("network");
    }
  };

  const handleFileChange =
    (from: Source) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // 같은 사진을 다시 골라도 change가 나도록 비움
      event.target.value = "";
      if (!file) return;
      setSource(from);
      recognize(file);
    };

  const openPicker = (from: Source) => {
    (from === "camera" ? cameraInputRef : albumInputRef).current?.click();
  };

  const backToStart = () => {
    stopReading();
    fileRef.current = null;
    setView("start");
  };

  // 새로 하기: 작성 중이던 티켓의 임시 상태도 바로 풀어 줌
  const handleRestart = () => {
    const ticketId = useVerifyStore.getState().ticket?.ticketId;
    if (ticketId && ticketId !== MOCK_TICKET_ID) void releaseTicket(ticketId);
    reset();
    setResumeTitle(null);
  };

  const handleResume = () => {
    const { rating, review } = useVerifyStore.getState();
    router.push(getResumePath(rating, review));
  };

  // capture가 있으면 OS 기본 카메라가 바로 열림, 없으면 사진 선택 창
  const inputs = (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        tabIndex={-1}
        aria-hidden
        onChange={handleFileChange("camera")}
      />
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-hidden
        onChange={handleFileChange("album")}
      />
    </>
  );

  if (view === "reading") {
    return (
      <>
        <VerifyHeader onBack={backToStart} />
        <main className="flex flex-1 flex-col items-center">
          {/* <output>은 role="status"(live region)를 기본으로 가짐 */}
          <output className="mt-29.5 flex flex-col items-center gap-1 text-center">
            <h1 className="text-heading2 font-semibold text-static-white">
              티켓을 읽고 있어요.
            </h1>
            <p className="text-body2 text-neutral-10">
              영화 정보를 읽고 있어요.
            </p>
          </output>
          {/* 티켓 일러스트 위로 빨간 선이 오르내림 */}
          <div
            aria-hidden
            className="relative mt-6 h-56 w-40 overflow-hidden rounded-lg bg-neutral-99"
          >
            <Image
              src={ticketReading}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
            <span className="absolute inset-x-0 top-0 h-14 animate-scan-line bg-linear-to-b from-primary-50/0 via-primary-50/28 via-85% to-primary-50 motion-reduce:animate-none" />
          </div>
        </main>
        <Button
          type="button"
          variant="outline"
          className={SUB_BUTTON_CLASS}
          onClick={backToStart}
        >
          취소하기
        </Button>
      </>
    );
  }

  if (view === "unreadable") {
    return (
      <>
        <VerifyNotice
          icon={ScanIcon}
          title="티켓을 알아보지 못했어요"
          description={
            <>
              사진이 흐리거나 티켓 일부가 잘렸을 수 있어요.
              <br />
              아래를 확인하고 다시 찍어주세요.
            </>
          }
          tips={UNREADABLE_TIPS}
          onBack={backToStart}
          actions={
            <>
              <Button type="button" onClick={() => openPicker(source)}>
                <Image
                  src={source === "camera" ? CameraIcon : ImageIcon}
                  alt=""
                  aria-hidden
                  className="size-6"
                />
                {source === "camera" ? "다시 찍기" : "다시 선택하기"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={SUB_BUTTON_CLASS}
                onClick={backToStart}
              >
                취소하기
              </Button>
            </>
          }
        />
        {inputs}
      </>
    );
  }

  if (view === "duplicate") {
    return (
      <VerifyNotice
        icon={TicketCheckIcon}
        title="이미 인증된 티켓이에요"
        description={
          <>
            같은 티켓으로는 카드를 한 번만 발급받을 수 있어요.
            <br />
            직접 인증한 적이 없다면 문의해 주세요.
          </>
        }
        onBack={backToStart}
        actions={
          // TODO: 문의에 티켓 이미지 자동 첨부 (인증 API · 문의 화면이 생기면)
          <Button
            type="button"
            onClick={() => router.push("/settings/contact")}
          >
            문의하기
          </Button>
        }
      />
    );
  }

  if (view === "unsupported") {
    return (
      <VerifyNotice
        icon={TicketCheckIcon}
        title="자동 인증이 어려운 티켓이에요"
        description={
          <>
            지금은 CGV · 롯데시네마 · 메가박스 티켓만 바로 인증돼요.
            <br />
            찍은 사진과 함께 접수하면 확인 후 카드를 발급해 드려요.
          </>
        }
        onBack={backToStart}
        actions={
          <>
            <Button
              type="button"
              variant={requesting ? "disable" : "primary"}
              disabled={requesting}
              onClick={requestUnsupportedReview}
            >
              확인 요청하기
            </Button>
            <Toast
              message={toastMessage}
              className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-5"
            />
          </>
        }
      />
    );
  }

  if (view === "network") {
    return (
      <VerifyNotice
        icon={WifiOffIcon}
        title="연결이 불안정해요"
        description="인터넷 연결을 확인한 뒤 다시 시도해 주세요."
        onBack={backToStart}
        actions={
          <>
            <Button
              type="button"
              onClick={() => {
                if (fileRef.current) recognize(fileRef.current);
                else backToStart();
              }}
            >
              다시 시도
            </Button>
            <Button
              type="button"
              variant="outline"
              className={SUB_BUTTON_CLASS}
              onClick={() => router.replace("/")}
            >
              나중에 하기
            </Button>
          </>
        }
      />
    );
  }

  return (
    <>
      <VerifyHeader />
      <main className="flex flex-1 flex-col items-center">
        <div className="mt-5 flex flex-col items-center gap-1 text-center">
          <h1 className="text-heading2 font-semibold text-static-white">
            티켓을 카드로 간직하세요
          </h1>
          <p className="text-body2 text-neutral-10">
            관람한 영화의 티켓을 인증하면
            <br />
            나만의 카드로 발급 받을 수 있어요.
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center py-6">
          {/* isolate: 빛(-z-10)이 카드 뒤에 오되 body 배경 뒤로 숨지 않게 */}
          <div className="relative isolate">
            {/* 카드 뒤 빛: 카드 중앙에 맞춤. 375 미만 화면에서 가로 스크롤이 생기지 않게 화면 폭까지만 */}
            <SampleCardCarousel posters={samplePosters} />
          </div>
        </div>
        {/* TODO: 촬영 가이드 시안이 나오면 맞추기 (지금은 문구만) */}
        <p className="text-center text-body2 text-neutral-20">
          티켓 전체가 나오게, 한 장씩 찍어 주세요.
          <br />
          모바일 티켓과 종이 티켓을 모두 인증할 수 있어요.
        </p>
      </main>

      <div className="mt-5 flex flex-col gap-2.5">
        {/* 데스크톱은 카메라가 없어 업로드만 */}
        <Button
          type="button"
          className="xl:hidden"
          onClick={() => openPicker("camera")}
        >
          <Image src={CameraIcon} alt="" aria-hidden className="size-6" />
          사진 찍기
        </Button>
        <Button
          type="button"
          variant="outline"
          className={SUB_BUTTON_CLASS}
          onClick={() => openPicker("album")}
        >
          <Image src={ImageIcon} alt="" aria-hidden className="size-6" />
          앨범에서 업로드
        </Button>
      </div>

      {inputs}

      <ResumeDialog
        open={resumeTitle !== null}
        title={resumeTitle ?? ""}
        onRestart={handleRestart}
        onResume={handleResume}
      />
    </>
  );
};

export default VerifyStart;
