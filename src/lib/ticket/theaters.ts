import {
  CLOSED_THEATERS,
  THEATER_ALIASES,
  THEATERS,
} from "@/constants/theaters";
import type { AutoChain } from "./normalize";

/**
 * 3사 극장 지점 목록 대조 (ticket-verify.md "단계" MVP)
 * 티켓에 찍힌 지점명을 목록에서 찾아 표준 이름(constants/theaters.ts)을 돌려줌. 못 찾으면 null -> 검수
 * 비슷한 이름으로는 맞추지 않음 ("역곡"을 확신도 high로 "혁곡"이라 읽은 사례, 오독을 다른 지점에 붙이면 안 됨)
 *
 * 비교 키: 체인 이름 · 공백 · 기호 빼고, 끝의 "점" 빼고, 소문자
 * "CGV 용산아이파크몰점" · "용산아이파크몰 CGV" · "cgv용산아이파크몰" -> "용산아이파크몰"
 * 괄호가 있는 지점은 괄호 앞 이름으로도 찾음 ("신대방(구로디지털역)" -> "신대방")
 */

const CHAIN_NAME_PATTERN =
  /CGV|LOTTE\s*CINEMA|롯데\s*시네마|MEGABOX|메가박스/gi;

const toKey = (name: string) =>
  name
    .replace(CHAIN_NAME_PATTERN, "")
    .replace(/[\s\p{P}\p{S}]/gu, "")
    .replace(/(.{2,})점$/u, "$1")
    .toLowerCase();

// "신대방(구로디지털역)" -> "신대방"
const withoutParentheses = (name: string) => name.replace(/\(.*\)/, "");

/**
 * 체인별 키 -> 표준 이름. 키 하나에 지점이 둘 이상 걸리면 어느 쪽인지 모르니 그 키는 뺌 (검수로)
 */
const buildIndex = (chain: AutoChain) => {
  const index = new Map<string, string | null>();
  const add = (key: string, name: string) => {
    if (!key) return;
    const existing = index.get(key);
    index.set(key, existing === undefined || existing === name ? name : null);
  };

  for (const name of [...THEATERS[chain], ...CLOSED_THEATERS[chain]]) {
    add(toKey(name), name);
    add(toKey(withoutParentheses(name)), name);
  }
  // 별칭은 직접 정한 것이라 자동으로 만든 키보다 우선
  for (const [alias, name] of Object.entries(THEATER_ALIASES[chain])) {
    index.set(toKey(alias), name);
  }
  return index;
};

const INDEX: Record<AutoChain, Map<string, string | null>> = {
  cgv: buildIndex("cgv"),
  lotte: buildIndex("lotte"),
  megabox: buildIndex("megabox"),
};

export const findTheater = (chain: AutoChain, name: string): string | null =>
  INDEX[chain].get(toKey(name)) ?? null;
