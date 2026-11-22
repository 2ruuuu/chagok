import type { StaticImageData } from "next/image";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DRAFT_LIFETIME_MS } from "../_constants";

/** 서버가 티켓에서 읽어 온 값 + 대조한 영화 정보. 사용자는 고칠 수 없음 */
export type RecognizedTicket = {
  /** tickets 테이블 id (좌석 선택 · 확인 요청 · 카드 발급 때 보냄) */
  ticketId: string;
  title: string;
  originalTitle: string;
  poster: StaticImageData | string;
  /** 제작연도 (KOBIS prdtYear) */
  productionYear: string;
  /** 러닝타임(분) */
  runtime: number;
  director: string;
  cast: string[];
  grade: string;
  releasedAt: string;
  country: string;
  genres: string[];
  format: string;
  theater: string;
  screen: string;
  /** 관람일 YYYY.MM.DD */
  watchedAt: string;
  /** 요일 한 글자 */
  weekday: string;
  showtime: string;
  /** 티켓에 찍힌 좌석 전부 (같이 예매하면 여러 개) */
  seats: string[];
  /** 내 좌석. 좌석이 여러 개면 확인 화면에서 고르기 전까지 빈 문자열 */
  seat: string;
  /** 검수 대상 (3사 외 극장 · 애매한 티켓): 바로 발급하지 않고 확인을 요청함 */
  needsReview: boolean;
  certificateId: string;
};

/**
 * 티켓 인식 요청 결과.
 * recognized: 관람 정보 확인 화면으로
 * unreadable: 티켓을 알아보지 못함 (티켓이 아님 · 여러 장 · 흐림 · 결제 내역 화면)
 * duplicate: 이미 인증된 티켓
 * unsupported: 거의 못 읽어서 사진만 접수할 수 있음 (자동 인증이 어려운 티켓)
 * network: 연결 실패
 */
export type RecognizeResult =
  | { status: "recognized"; ticket: RecognizedTicket }
  /** 사진은 이미 접수돼 있음. [확인 요청하기]에서 이 id로 검수 요청 */
  | { status: "unsupported"; ticketId: string }
  | { status: "unreadable" | "duplicate" | "network" };

type VerifyState = {
  ticket: RecognizedTicket | null;
  /** 이 시각이 지나면 인식한 티켓을 버림 (ms) */
  expiresAt: number | null;
  rating: number;
  review: string;
  memo: string;
  /** 카드 발급까지 끝났는지 (발급 완료 화면에서만 true) */
  issued: boolean;
  /**
   * 티켓 인식 성공: 이전 입력을 지우고 새로 시작.
   * expires: false면 30분 제한 없음 (검수 승인된 티켓, 서버에서도 시간 제한 없음)
   */
  start: (ticket: RecognizedTicket, options?: { expires?: boolean }) => void;
  /** 좌석이 여러 개일 때 내 좌석 고르기 */
  setSeat: (seat: string) => void;
  setRating: (rating: number) => void;
  setReview: (review: string) => void;
  setMemo: (memo: string) => void;
  /** 발급 끝: 서버가 정한 인증번호를 넣고 발급 완료 상태로 */
  issue: (certificateId: string) => void;
  reset: () => void;
};

const EMPTY = {
  ticket: null,
  expiresAt: null,
  rating: 0,
  review: "",
  memo: "",
  issued: false,
};

/**
 * 티켓 인증 진행 상태. 단계가 라우트로 나뉘어 있어서 화면 사이에 값을 들고 다님.
 * sessionStorage에 저장 -> 같은 탭에서 새로고침 · 중간 이탈 후 복귀해도 입력이 남음 (다른 탭 · 창은 안 됨).
 */
export const useVerifyStore = create<VerifyState>()(
  persist(
    (set) => ({
      ...EMPTY,
      start: (ticket, options) =>
        set({
          ...EMPTY,
          ticket,
          expiresAt:
            options?.expires === false ? null : Date.now() + DRAFT_LIFETIME_MS,
        }),
      setSeat: (seat) =>
        set((state) =>
          state.ticket ? { ticket: { ...state.ticket, seat } } : state,
        ),
      setRating: (rating) => set({ rating }),
      setReview: (review) => set({ review }),
      setMemo: (memo) => set({ memo }),
      issue: (certificateId) =>
        set((state) => ({
          issued: true,
          ticket: state.ticket ? { ...state.ticket, certificateId } : null,
        })),
      reset: () => set(EMPTY),
    }),
    {
      name: "chagok-verify",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
