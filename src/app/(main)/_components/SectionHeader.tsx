import Image from "next/image";
import Link from "next/link";
import ChevronRight from "@/assets/icons/chevron-right.svg";

interface SectionHeaderProps {
  /** <section aria-labelledby>에 연결할 제목 id */
  id: string;
  title: string;
  /** 전체 보기 페이지. 없으면 화살표만 표시 (페이지가 생기면 연결) */
  href?: string;
}

/** 홈 섹션 제목 + 오른쪽 화살표 (최근 남긴 관람평, 요즘 인기 있는, 곧 상영 종료되는 영화) */
const SectionHeader = ({ id, title, href }: SectionHeaderProps) => {
  const chevron = (
    <Image src={ChevronRight} alt="" aria-hidden className="size-4" />
  );

  return (
    <div className="flex items-center justify-between px-1">
      <h2 id={id} className="text-label1 text-static-white">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          aria-label={`${title} 전체 보기`}
          className="-m-1 flex size-6 items-center justify-center"
        >
          {chevron}
        </Link>
      ) : (
        chevron
      )}
    </div>
  );
};

export default SectionHeader;
