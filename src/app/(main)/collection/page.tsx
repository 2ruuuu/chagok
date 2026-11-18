import Link from "next/link";
import BackButton from "@/components/back-button/BackButton";
import MiniCard from "@/components/mini-card/MiniCard";
import {
  collectionHref,
  DEFAULT_SORT,
  isSortValue,
  type SortValue,
} from "@/constants/collection";
import { cn } from "@/lib/cn";
import { type CollectionCard, collectionCards } from "@/mocks/cards";
import SortButton from "./_components/SortButton";

/** 관람일 + 시간으로 비교 ("2026.07.15 19:30"은 문자열 비교로 순서가 맞음) */
const watchedKey = (card: CollectionCard) =>
  `${card.watchedAt} ${card.showtime}`;

const sortCards = (cards: CollectionCard[], sort: SortValue) =>
  cards.toSorted((a, b) => {
    if (sort === "oldest") return watchedKey(a).localeCompare(watchedKey(b));
    // 별점이 같으면 최근 관람순
    if (sort === "rating" && a.rating !== b.rating) return b.rating - a.rating;
    return watchedKey(b).localeCompare(watchedKey(a));
  });

const CollectionPage = async ({ searchParams }: PageProps<"/collection">) => {
  const { year: yearParam, sort: sortParam } = await searchParams;

  const cards = collectionCards;
  // 카드가 있는 해만, 최신 해부터
  const years = [...new Set(cards.map((card) => card.watchedAt.slice(0, 4)))]
    .sort()
    .reverse();
  const year =
    typeof yearParam === "string" && years.includes(yearParam)
      ? yearParam
      : null;
  const sort = isSortValue(sortParam) ? sortParam : DEFAULT_SORT;

  const visibleCards = sortCards(
    year ? cards.filter((card) => card.watchedAt.startsWith(year)) : cards,
    sort,
  );

  const tabs = [
    { label: "전체", value: null },
    ...years.map((y) => ({ label: y, value: y })),
  ];

  return (
    <>
      <header className="relative flex h-14 items-center justify-center">
        <BackButton className="absolute left-0 size-6" />
        <h1 className="text-heading3 font-semibold text-static-white">
          컬렉션
        </h1>
      </header>

      <nav aria-label="관람 연도" className="mt-2">
        <ul className="flex gap-2">
          {tabs.map((tab) => {
            const isActive = tab.value === year;
            return (
              <li key={tab.label}>
                <Link
                  href={collectionHref(tab.value, sort)}
                  replace
                  scroll={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center rounded-full border px-4 text-label1 font-semibold",
                    isActive
                      ? "border-static-white bg-static-white text-static-black"
                      : "border-neutral-75 bg-neutral-80 text-neutral-30",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-labelledby="collection-list-title" className="mt-7">
        <div className="flex items-center justify-between">
          <h2
            id="collection-list-title"
            className="flex items-baseline gap-1.5 text-heading2 font-bold text-static-white"
          >
            {year ?? "전체"}
            <span className="text-label3 font-medium text-neutral-40">
              {visibleCards.length}장
            </span>
          </h2>
          <SortButton year={year} sort={sort} />
        </div>

        {visibleCards.length === 0 ? (
          <p className="mt-10 text-center text-body2 text-neutral-40">
            아직 모은 카드가 없어요
          </p>
        ) : (
          // 시안(375): 카드 약 160×224, 좌우 간격 15.5px · 상하 24px.
          // 간격 · 좌우 여백은 고정, 남는 폭은 카드 두 장이 나눠 가짐 (넓은 화면에선 카드가 커짐, 비율 5:7 유지)
          <ul className="mt-4 grid grid-cols-2 gap-x-[0.96875rem] gap-y-6">
            {visibleCards.map((card) => (
              <li key={card.id}>
                {/* 카드 + 아래 정보 전체가 링크. 포스터는 꾸밈용이고 아래 글자가 링크 이름이 됨 */}
                <Link
                  href={`/collection/${card.id}`}
                  className="block rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-40"
                >
                  <MiniCard
                    poster={card.poster}
                    // 화면 최대 430 → 카드 최대 약 188px
                    sizes="(min-width: 430px) 188px, 50vw"
                    className="card-mini-shadow aspect-5/7 h-auto w-full"
                  />
                  <div className="mt-2.5 flex flex-col gap-0.5 px-0.5">
                    <p className="flex items-center gap-1.5">
                      <span className="truncate text-label1 font-semibold text-static-white">
                        {card.title}
                      </span>
                      <span className="shrink-0 rounded-xs bg-neutral-75 px-1 py-0.5 text-caption2 font-semibold text-neutral-20">
                        {card.format}
                      </span>
                    </p>
                    <p className="flex items-center gap-1 text-caption1 text-neutral-40">
                      <span>{card.watchedAt}</span>
                      <span aria-hidden>·</span>
                      {/* TODO: 별 아이콘 (Figma에서 받으면 "별점" 글자 대신) */}
                      <span>별점 {card.rating.toFixed(1)}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
};

export default CollectionPage;
