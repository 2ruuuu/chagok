/** VerifyLayout의 하단 여백(pb 2.75rem = 44px). BottomCta가 키보드 위로 올라갈 때 씀 */
export const VERIFY_BOTTOM_SPACE = 44;

/** 인식한 티켓을 붙잡아 두는 시간. 지나면 처음부터 다시 */
export const DRAFT_LIFETIME_MS = 30 * 60 * 1000;

/** 관람 리뷰 · 카드 메모 최대 글자 수 */
export const TEXT_MAX_LENGTH = 500;

export const MAX_RATING = 5;

/**
 * 사진 짧은 변이 이보다 작으면 인식 요청 전에 다시 찍으라고 안내 (px).
 * TODO: 기준값은 샘플을 더 돌려 보고 확정 (ticket-verify.md "업로드")
 */
export const MIN_IMAGE_SHORT_SIDE = 1000;
