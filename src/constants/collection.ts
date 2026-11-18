/** 컬렉션 정렬. 첫 번째가 기본값 (URL에 sort가 없을 때) */
export const SORT_OPTIONS = [
  { value: "recent", label: "최근 관람순" },
  { value: "oldest", label: "오래된 관람순" },
  { value: "rating", label: "별점 높은순" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = SORT_OPTIONS[0].value;

export const isSortValue = (value: unknown): value is SortValue =>
  SORT_OPTIONS.some((option) => option.value === value);

/** 컬렉션 URL. 기본값(전체 · 최근 관람순)은 쿼리에서 뺌 */
export const collectionHref = (year: string | null, sort: SortValue) => {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  const query = params.toString();
  return query ? `/collection?${query}` : "/collection";
};
