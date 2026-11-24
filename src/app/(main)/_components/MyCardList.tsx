import Image from "next/image";
import Link from "next/link";
import MainBg from "@/assets/imgs/main-bg.png";
import { buttonVariants } from "@/components/button/Button";
import NotificationBell from "@/components/notification-bell/NotificationBell";
import type { Ticket } from "@/components/ticket-card/TicketCard";
import TicketCarousel from "@/components/ticket-carousel/TicketCarousel";
import { cn } from "@/lib/cn";

interface MyCardListProps {
  nickname: string | null;
  /** 지금까지 모은 카드 수 */
  cardCount: number;
  /** 캐러셀 카드, 최근 관람순 최대 10장 */
  cards: Ticket[];
  /** 안 읽은 알림 · 공지가 있으면 종에 빨간 점 */
  hasUnreadNotifications: boolean;
}

/**
 * 카드가 0장일 때 캐러셀 자리 (시안 없이 만든 것 -> 시안 나오면 맞추기).
 * 캐러셀 가운데 카드와 같은 크기 · 위아래 여백이라 카드가 생겨도 화면 높이가 그대로
 */
const EmptyCardSlot = () => (
  <div className="flex justify-center py-7.5">
    <div className="flex aspect-5/7 w-75 flex-col items-center justify-center gap-6 rounded-[20px] border border-line-normal border-dashed bg-common-0/4 px-6 text-center md:w-90">
      <div className="flex flex-col gap-2">
        <p className="text-heading3 font-semibold text-static-white">
          아직 모은 카드가 없어요
        </p>
        <p className="text-body2 text-neutral-30">
          본 영화 티켓을 인증하면
          <br />
          여기에 카드가 쌓여요
        </p>
      </div>
      <Link
        href="/verify"
        className={cn(buttonVariants({ variant: "primary" }), "w-auto px-6")}
      >
        티켓 인증하기
      </Link>
    </div>
  </div>
);

/**
 * 홈 첫 섹션: 인사 + 내 카드 캐러셀
 * - 모바일 · 태블릿: 인사 위, 캐러셀 아래. 배경이 화면 끝까지
 * - 데스크톱(xl): 콘텐츠 폭(1200) 안의 둥근 상자, 왼쪽 360 인사 · 컬렉션 버튼 / 오른쪽 캐러셀
 */
const MyCardList = ({
  nickname,
  cardCount,
  cards,
  hasUnreadNotifications,
}: MyCardListProps) => {
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
        <NotificationBell
          hasUnread={hasUnreadNotifications}
          className="xl:hidden"
        />
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
        {cards.length > 0 ? (
          <TicketCarousel tickets={cards} />
        ) : (
          <EmptyCardSlot />
        )}
      </div>
    </section>
  );
};

export default MyCardList;
