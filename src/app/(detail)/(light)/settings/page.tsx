import Image from "next/image";
import Link from "next/link";
import ChevronLeftBlackIcon from "@/assets/icons/chevron-left-black.svg";
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

      <p className="mt-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-caption1 text-label-alternative">
        차곡 v{APP_VERSION}.
      </p>
    </>
  );
};

export default SettingsPage;
