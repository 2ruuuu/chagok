import Image, { type StaticImageData } from "next/image";
import { formatRelativeTime } from "@/lib/relative-time";

interface NotificationItemProps {
  icon: StaticImageData;
  /** 종류 표시 (알림 · 공지사항) */
  label: string;
  text: string;
  createdAt: string;
}

/** 알림 · 공지 목록 한 줄 */
const NotificationItem = ({
  icon,
  label,
  text,
  createdAt,
}: NotificationItemProps) => {
  return (
    // 호버하면 배경을 살짝 밝게 (터치 기기는 Tailwind hover가 안 걸림)
    <li className="flex gap-2 px-5 py-4 transition-colors hover:bg-fill-normal">
      <Image src={icon} alt="" aria-hidden className="mt-px size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-caption1 text-label-alternative">{label}</p>
        <p className="text-body1 break-words text-label-normal">{text}</p>
        <time
          dateTime={createdAt}
          className="text-caption1 font-semibold text-label-neutral"
        >
          {formatRelativeTime(createdAt)}
        </time>
      </div>
    </li>
  );
};

export default NotificationItem;
