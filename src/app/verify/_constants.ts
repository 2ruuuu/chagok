/** VerifyLayout의 하단 여백(pb 2.75rem = 44px). BottomCta가 키보드 위로 올라갈 때 씀 */
export const VERIFY_BOTTOM_SPACE = 44;

/** 인식한 티켓을 붙잡아 두는 시간. 지나면 처음부터 다시 */
export const DRAFT_LIFETIME_MS = 30 * 60 * 1000;

/** 관람 리뷰 · 카드 메모 최대 글자 수 */
export const TEXT_MAX_LENGTH = 500;

export const MAX_RATING = 5;

/**
 * 사진 짧은 변이 이보다 작으면 인식 요청 없이 "사진이 너무 작아요" (px). 사람이 봐도 글자를 읽기 어려운 바닥선만
 * 1000 -> 700 -> 400 (2026-11-22): 메신저로 받은 · 잘라낸 사진처럼 읽히는 진짜 티켓이 막혀서.
 * 작은 사진의 오독은 지점 · 영화 대조와 확신도에서 걸려 검수로 감 (ticket-verify.md "업로드")
 */
export const MIN_IMAGE_SHORT_SIDE = 400;
