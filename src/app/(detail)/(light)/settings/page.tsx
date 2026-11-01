import Image from "next/image";
import Link from "next/link";
import ChevronLeftBlackIcon from "@/assets/icons/chevron-left-black.svg";
import TmdbLogo from "@/assets/icons/tmdb.svg";
import PageHeader from "@/components/page-header/PageHeader";
import { APP_VERSION } from "@/constants/app";
import { SETTINGS_SECTIONS } from "./_constants";

const SettingsPage = () => {
  return (
    <>
      <PageHeader title="설정" back={{ fallback: "/my" }} />

      <div className="flex flex-col gap-6 pt-6">
        {SETTINGS_SECTIONS.map((section) => {
          const titleId = `settings-${section.title}`;
          return (
            <section key={section.title} aria-labelledby={titleId}>
              <h2 id={titleId} className="text-body1 font-semibold">
                {section.title}
              </h2>
              <ul className="mt-3 divide-y divide-line-alternative rounded-xl bg-common-0 shadow-drop-100">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex h-14 items-center justify-between px-4 text-body2 font-medium outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
                    >
                      {item.label}
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
            </section>
          );
        })}
      </div>

      <footer className="mt-6 flex flex-col items-center gap-4 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-caption1 text-label-alternative">
        <p>차곡 v{APP_VERSION}.</p>

        {/* 영화 데이터 출처 (TMDB 비상업 이용 조건: 공식 로고 그대로 + 문구, 차곡보다 눈에 덜 띄게) */}
        <div className="flex flex-col items-center gap-2">
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TMDB 사이트 열기"
            className="rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-40"
          >
            <Image src={TmdbLogo} alt="" aria-hidden className="h-6 w-auto" />
          </a>
          <p>
            This website uses TMDB and the TMDB APIs but is not endorsed,
            certified, or otherwise approved by TMDB.
          </p>
          <p>박스오피스 정보: 영화진흥위원회 영화관입장권통합전산망</p>
        </div>
      </footer>
    </>
  );
};

export default SettingsPage;
