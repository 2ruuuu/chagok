import Image from "next/image";
import Link from "next/link";
import BellIcon from "@/assets/icons/bell.svg";
import MainBg from "@/assets/imgs/main-bg.png";
import { buttonVariants } from "@/components/button/Button";
import { cn } from "@/lib/cn";
import CardDemoPage from "../../card-demo/page";

interface MyCardListProps {
  nickname: string | null;
  /** 지금까지 모은 카드 수 */
  cardCount: number;
}

/**
 * 홈 첫 섹션: 인사 + 내 카드 캐러셀
 * - 모바일 · 태블릿: 인사 위, 캐러셀 아래. 배경이 화면 끝까지
 * - 데스크톱(xl): 콘텐츠 폭(1200) 안의 둥근 상자, 왼쪽 360 인사 · 컬렉션 버튼 / 오른쪽 캐러셀
 */
const MyCardList = ({ nickname, cardCount }: MyCardListProps) => {
  return (
    <section className="relative isolate -mx-5 overflow-hidden px-5 md:-mx-8 md:px-8 xl:mx-0 xl:mt-8 xl:grid xl:grid-cols-[22.5rem_minmax(0,1fr)] xl:items-center xl:gap-10 xl:rounded-3xl xl:pl-14">
      <Image
        src={MainBg}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="(min-width: 1440px) 1200px, 100vw"
        className="-z-10 object-cover object-top"
      />
      <div className="mt-7.5 flex items-start justify-between xl:mt-0 xl:flex-col xl:gap-8">
        <div className="xl:flex xl:flex-col xl:gap-3">
          {/* 비로그인(지금은 /가 임시 공개)이면 이름 없이 */}
          <h1 className="text-heading2 xl:text-display1 xl:font-bold">
            {nickname ? `안녕하세요, ${nickname}님` : "안녕하세요!"}
          </h1>
          <p className="text-body2 text-neutral-20 xl:text-body1">
            지금까지 {cardCount}장의 카드를 모았어요!
          </p>
        </div>
        {/* 데스크톱은 상단 헤더에 알림이 있어서 숨김 */}
        <Link href="/notifications" aria-label="알림" className="xl:hidden">
          <Image src={BellIcon} alt="" aria-hidden />
        </Link>
        {/* 데스크톱만: 왼쪽 칸이 비지 않게 컬렉션으로 가는 버튼 */}
        <Link
          href="/collection"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "hidden w-auto px-6 xl:inline-flex",
          )}
        >
          내 컬렉션 보기
        </Link>
      </div>
      {/*
        모바일 · 태블릿: 섹션 좌우 여백을 상쇄해서 캐러셀이 화면 끝까지.
        데스크톱: 오른쪽 칸에서 상자 오른쪽 끝까지 (양 끝 흐림 · 화살표는 TicketCarousel)
      */}
      <div className="-mx-5 md:-mx-8 xl:mx-0">
        <CardDemoPage />
      </div>
    </section>
  );
};

export default MyCardList;
