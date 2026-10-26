import mockImg from "@/assets/imgs/giant-poster.webp";
import { Button } from "@/components/button/Button";
import { CardStack } from "@/components/card-stack/CardStack";

const mockData = {
  month: 10,
  cardCount: 13,
  lastMonthCardCount: 10,
};

const moreThen = mockData.cardCount - mockData.lastMonthCardCount;

const plusOrMinus = () => {
  if (moreThen >= 0) {
    return "+";
  }
};

const mockCards = [
  { id: "1", poster: mockImg },
  { id: "2", poster: mockImg },
  { id: "3", poster: mockImg },
  { id: "4", poster: mockImg },
  { id: "5", poster: mockImg },
];

const CollectedCardInMonth = () => {
  return (
    <section className="p-5 bg-common-0/4 rounded-lg ">
      <div>
        <h2 className="text-body2 text-static-white">
          {mockData.month}월에 모은 카드 {mockData.cardCount}장
        </h2>
        <CardStack cards={mockCards} />
        <p>
          올 해 누적 {mockData.cardCount}장 · 지난 달보다 {plusOrMinus()}
          {moreThen}
        </p>
        <Button variant="outline">다른 티켓 인증하기</Button>{" "}
      </div>
    </section>
  );
};

export default CollectedCardInMonth;
