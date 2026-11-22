import hopePoster from "@/assets/imgs/hope-poster.png";
import type {
  RecognizedTicket,
  RecognizeResult,
} from "../_stores/useVerifyStore";

/**
 * 티켓 인식 결과 목데이터 (개발 모드에서 ?mock=값 일 때만 씀, 실제 인식은 /api/verify/recognize)
 */
/** 목 인식 결과의 티켓 id. 확인 요청 등 서버 호출 없이 화면만 넘김 */
export const MOCK_TICKET_ID = "mock";

export const mockRecognizedTicket: RecognizedTicket = {
  ticketId: MOCK_TICKET_ID,
  title: "호프",
  originalTitle: "HOPE",
  poster: hopePoster,
  productionYear: "2026",
  runtime: 170,
  director: "나홍진",
  cast: ["황정민", "조인성", "정호연"],
  grade: "15세 관람가",
  releasedAt: "2026.07.15.",
  country: "한국",
  genres: ["스릴러"],
  format: "2D",
  theater: "CGV 홍대",
  screen: "7관",
  watchedAt: "2026.09.25",
  weekday: "금",
  showtime: "19:30",
  seats: ["F12"],
  seat: "F12",
  needsReview: false,
  certificateId: "CHG-260925-0001",
};

/**
 * 목 인식 결과 고르기 (개발용). 주소에 ?mock=값 을 붙여서 각 화면을 확인함.
 * seats: 좌석 여러 개 / review: 검수 대상 / unreadable · duplicate · unsupported · network: 실패 화면
 * 예: /verify?mock=review
 */
export const getMockRecognizeResult = (
  scenario: string | null,
): RecognizeResult => {
  switch (scenario) {
    case "seats":
      return {
        status: "recognized",
        ticket: { ...mockRecognizedTicket, seats: ["F12", "F13"], seat: "" },
      };
    case "review":
      return {
        status: "recognized",
        ticket: {
          ...mockRecognizedTicket,
          theater: "씨네큐브 광화문",
          screen: "1관",
          needsReview: true,
        },
      };
    case "unsupported":
      return { status: "unsupported", ticketId: MOCK_TICKET_ID };
    case "unreadable":
    case "duplicate":
    case "network":
      return { status: scenario };
    default:
      return { status: "recognized", ticket: mockRecognizedTicket };
  }
};

/** 목 인식에 걸리는 시간 (실제 LLM 호출은 4초 안팎) */
export const MOCK_RECOGNIZE_MS = 2500;
