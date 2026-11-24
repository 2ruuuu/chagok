import Image from "next/image";
import Link from "next/link";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import PencilFilledIcon from "@/assets/icons/pencil-filled.svg";
import SettingIcon from "@/assets/icons/setting-white.svg";
import Avatar from "@/components/avatar/Avatar";
import NotificationBell from "@/components/notification-bell/NotificationBell";
import PageHeader from "@/components/page-header/PageHeader";
import { APP_VERSION } from "@/constants/app";
import { getAvatarUrl } from "@/lib/avatar";
import { getMyCardCounts } from "@/lib/cards/my-cards";
import { cn } from "@/lib/cn";
import { getHasUnreadNotifications } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";
import { mockProfile } from "@/mocks/profile";

const ICON_LINK_CLASS =
  "flex size-6 items-center justify-center rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-40";

const MENU_ITEMS = [
  {
    href: "/my/comments",
    label: "나의 감상",
    description: "카드 뒷면에 간직한 감상",
  },
  {
    href: "/my/reviews",
    label: "관람 리뷰",
    description: "다른 관객들과 나눈 영화 감상",
  },
];

const MyPage = async () => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  // /my는 proxy가 로그인한 사람만 들여보냄 (비로그인이면 여기까지 안 옴)
  // 비로그인(임시 공개 중)이면 목데이터 프로필
  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("nickname, avatar_path")
        .eq("id", userId)
        .maybeSingle()
    : { data: mockProfile };

  const { cardCount, memoCount: commentCount } = userId
    ? await getMyCardCounts(supabase, userId)
    : { cardCount: 0, memoCount: 0 };

  const hasUnreadNotifications = await getHasUnreadNotifications();

  const stats = [
    { label: "보유 카드", value: cardCount },
    { label: "나의 감상", value: commentCount },
  ];

  return (
    <>
      <PageHeader
        title="마이"
        back={{ href: "/" }}
        hideBackOnDesktop
        right={
          <>
            {/* 데스크톱은 상단 헤더(TopNav)에 종이 있어서 숨김 */}
            <NotificationBell
              hasUnread={hasUnreadNotifications}
              className={cn(ICON_LINK_CLASS, "xl:hidden")}
            />
            <Link
              href="/settings"
              aria-label="설정"
              className={ICON_LINK_CLASS}
            >
              <Image src={SettingIcon} alt="" aria-hidden />
            </Link>
          </>
        }
      />

      <section
        aria-label="프로필"
        className="mt-7 flex items-center gap-6 xl:mt-8"
      >
        <Avatar
          src={getAvatarUrl(profile?.avatar_path)}
          size={88}
          className="size-18 md:size-22"
        />
        <p className="min-w-0 flex-1 truncate text-heading3 font-semibold md:text-heading2">
          {profile?.nickname}
        </p>
        <Link
          href="/my/edit"
          aria-label="프로필 편집"
          className={ICON_LINK_CLASS}
        >
          <Image src={PencilFilledIcon} alt="" aria-hidden className="size-4" />
        </Link>
      </section>

      <dl className="mt-7 flex rounded-xl border border-line-alternative bg-background-elevated-normal py-4 md:py-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={
              index > 0
                ? "flex flex-1 flex-col-reverse items-center gap-1 border-l border-line-alternative"
                : "flex flex-1 flex-col-reverse items-center gap-1"
            }
          >
            <dt className="text-body2 text-label-normal md:text-body1">
              {stat.label}
            </dt>
            <dd className="text-body1 font-semibold text-label-normal md:text-heading2">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <nav aria-label="내 기록" className="mt-6">
        <ul className="divide-y divide-line-alternative overflow-hidden rounded-xl border border-line-alternative bg-background-elevated-normal">
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-14 items-center gap-2 px-4 outline-none transition-colors hover:bg-fill-alternative focus-visible:outline-2 focus-visible:outline-primary-40 md:h-16 md:px-5"
              >
                <span className="flex-1 text-body2 font-medium text-label-normal md:text-body1">
                  {item.label}
                </span>
                <span className="text-caption1 text-label-alternative md:text-body2">
                  {item.description}
                </span>
                <Image
                  src={ChevronRightIcon}
                  alt=""
                  aria-hidden
                  className="size-4"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-6 text-center text-caption1 text-label-alternative md:mt-8">
        차곡 v{APP_VERSION}.
      </p>
    </>
  );
};

export default MyPage;
