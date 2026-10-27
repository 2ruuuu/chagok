import Image from "next/image";
import BellIcon from "@/assets/icons/bell.svg";
import MainBg from "@/assets/imgs/main-bg.png";
import CardDemoPage from "../../card-demo/page";

interface MyCardListProps {
  nickname: string | null;
}

const MyCardList = ({ nickname }: MyCardListProps) => {
  return (
    <section className="relative isolate overflow-hidden -mx-5 px-5">
      <Image
        src={MainBg}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="(min-width: 768px) 430px, 100vw"
        className="-z-10 object-cover object-top"
      />
      <div className="mt-7.5 flex justify-between items-start">
        <div>
          <h1 className=" text-heading2">안녕하세요, {nickname}님</h1>
          <h2 className="text-body2 text-neutral-20">
            지금까지 N장의 카드를 모았어요!
          </h2>
        </div>
        <button type="button" aria-label="알림">
          <Image src={BellIcon} alt="" />
        </button>
      </div>
      {/* 섹션의 좌우 여백을 상쇄해서 캐러셀이 화면 끝까지 닿게 */}
      <div className="-mx-5">
        <CardDemoPage />
      </div>
    </section>
  );
};

export default MyCardList;
