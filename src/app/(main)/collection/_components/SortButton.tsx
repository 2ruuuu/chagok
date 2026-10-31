"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChevronBottom from "@/assets/icons/chevron-bottom.svg";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import {
  collectionHref,
  SORT_OPTIONS,
  type SortValue,
} from "@/constants/collection";
import { cn } from "@/lib/cn";

const TITLE_ID = "collection-sort-sheet-title";

interface SortButtonProps {
  /** 지금 고른 연도 탭 (정렬을 바꿔도 유지) */
  year: string | null;
  sort: SortValue;
}

/** 컬렉션 정렬 버튼. 누르면 정렬 바텀시트가 올라옴 */
const SortButton = ({ year, sort }: SortButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const currentLabel = SORT_OPTIONS.find(
    (option) => option.value === sort,
  )?.label;

  const handleSelect = (value: SortValue) => {
    setOpen(false);
    if (value !== sort) {
      router.replace(collectionHref(year, value), { scroll: false });
    }
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-1 text-label1 font-semibold text-static-white outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
      >
        <span className="sr-only">정렬: </span>
        {currentLabel}
        <Image src={ChevronBottom} alt="" aria-hidden className="size-4" />
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={TITLE_ID}
        className="bg-neutral-80 px-5 text-static-white"
      >
        <h2 id={TITLE_ID} className="sr-only">
          정렬
        </h2>
        <ul className="mt-4 flex flex-col gap-1">
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === sort;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-current={isSelected || undefined}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex h-14 w-full cursor-pointer items-center rounded-lg px-4 text-left text-body1 text-neutral-15 outline-none focus-visible:outline-2 focus-visible:outline-primary-40",
                    isSelected && "bg-neutral-75",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
};

export default SortButton;
