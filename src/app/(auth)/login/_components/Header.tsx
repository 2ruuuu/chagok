import Image from "next/image";
import mockLogo from "@/assets/imgs/mock-logo.png";

const Header = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <Image
        src={mockLogo}
        alt="차곡의 로고 이미지 입니다."
        loading="eager"
        className="size-25"
      />
      <div className="flex flex-col gap-2.5">
        <h1 className="text-heading1">차곡에 오신 것을 환영해요</h1>
        <p className="text-body2">나만의 영화 컬렉션을 시작해 보세요!</p>
      </div>
    </div>
  );
};

export default Header;
