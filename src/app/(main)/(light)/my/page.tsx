import Image from "next/image";
import Link from "next/link";
import BellDarkIcon from "@/assets/icons/bell-dark.svg";
import ChevronLeftBlackIcon from "@/assets/icons/chevron-left-black.svg";
import PencilFilledIcon from "@/assets/icons/pencil-filled.svg";
import SettingIcon from "@/assets/icons/setting.svg";
import Avatar from "@/components/avatar/Avatar";
import PageHeader from "@/components/page-header/PageHeader";
import { APP_VERSION } from "@/constants/app";
import { getAvatarUrl } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/server";
import { collectionCards } from "@/mocks/cards";
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

  // TODO: 카드 테이블이 생기면 DB 개수로 교체
  const cardCount = collectionCards.length;
  const commentCount = collectionCards.filter((card) => card.comment).length;

  const stats = [
    { label: "보유 카드", value: cardCount },
    { label: "나의 감상", value: commentCount },
  ];

  return (
    <>
      <PageHeader
        title="마이"
        back={{ href: "/" }}
        right={
          <>
            {/* TODO: 알림 데이터가 생기면 안 읽은 알림이 있을 때 bell-ring(빨간 점)으로 */}
            <Link
              href="/notifications"
              aria-label="알림"
              className={ICON_LINK_CLASS}
            >
              <Image src={BellDarkIcon} alt="" aria-hidden />
            </Link>
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

      <section aria-label="프로필" className="mt-7 flex items-center gap-6">
        <Avatar
          src={getAvatarUrl(profile?.avatar_path)}
          size={72}
          className="size-18"
        />
        <p className="min-w-0 flex-1 truncate text-heading3 font-semibold">
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

      <dl className="mt-7 flex rounded-xl bg-common-0 py-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={
              index > 0
                ? "flex flex-1 flex-col-reverse items-center gap-1 border-l border-line-alternative"
                : "flex flex-1 flex-col-reverse items-center gap-1"
            }
          >
            <dt className="text-body2 text-label-normal">{stat.label}</dt>
            <dd className="text-body1 font-semibold text-label-normal">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <nav aria-label="내 기록" className="mt-6">
        <ul className="divide-y divide-line-alternative rounded-xl bg-common-0">
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-14 items-center gap-2 px-4 outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
              >
                <span className="flex-1 text-body2 font-medium text-label-normal">
                  {item.label}
                </span>
                <span className="text-caption1 text-label-alternative">
                  {item.description}
                </span>
                {/* 왼쪽 화살표를 뒤집어서 > 로 씀 */}
                <Image
                  src={ChevronLeftBlackIcon}
                  alt=""
                  aria-hidden
                  className="size-4 rotate-180"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-6 text-center text-caption1 text-label-alternative">
        차곡 v{APP_VERSION}.
      </p>
    </>
  );
};

export default MyPage;
